-- Create audit_logs table for tracking administrative actions
-- This provides accountability and security monitoring

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID NOT NULL REFERENCES public.admins(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN (
        'PIN_RESET',
        'STUDENT_CREATED',
        'STUDENT_UPDATED',
        'STUDENT_DELETED',
        'RESULT_UPLOADED',
        'RESULT_UPDATED',
        'RESULT_DELETED',
        'ANNOUNCEMENT_POSTED',
        'ANNOUNCEMENT_UPDATED',
        'ANNOUNCEMENT_DELETED',
        'FEE_UPDATED',
        'ADMIN_LOGIN',
        'ADMIN_LOGOUT'
    )),
    target_student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
    target_type TEXT CHECK (target_type IN ('student', 'result', 'announcement', 'fee', 'course', 'admin')),
    target_id UUID,
    details JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" 
ON public.audit_logs
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.admins WHERE user_id = auth.uid()
    )
);

-- RLS Policy: Only admins can insert audit logs
CREATE POLICY "Admins can insert audit logs" 
ON public.audit_logs
FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.admins WHERE user_id = auth.uid() AND id = admin_id
    )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON public.audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target_student_id ON public.audit_logs(target_student_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Create a view for recent audit activities
CREATE OR REPLACE VIEW public.recent_admin_activities AS
SELECT 
    al.id,
    al.action,
    a.first_name || ' ' || a.last_name as admin_name,
    a.email as admin_email,
    CASE 
        WHEN al.target_student_id IS NOT NULL THEN s.first_name || ' ' || s.last_name
        ELSE NULL
    END as target_student_name,
    CASE 
        WHEN al.target_student_id IS NOT NULL THEN s.matric_number
        ELSE NULL
    END as target_matric_number,
    al.details,
    al.created_at
FROM public.audit_logs al
LEFT JOIN public.admins a ON al.admin_id = a.id
LEFT JOIN public.students s ON al.target_student_id = s.id
ORDER BY al.created_at DESC;

-- Grant permissions on the view
ALTER VIEW public.recent_admin_activities OWNER TO postgres;

-- Create function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
    p_admin_id UUID,
    p_action TEXT,
    p_target_student_id UUID DEFAULT NULL,
    p_target_type TEXT DEFAULT NULL,
    p_target_id UUID DEFAULT NULL,
    p_details JSONB DEFAULT NULL,
    p_ip_address TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO public.audit_logs (
        admin_id,
        action,
        target_student_id,
        target_type,
        target_id,
        details,
        ip_address,
        user_agent
    )
    VALUES (
        p_admin_id,
        p_action,
        p_target_student_id,
        p_target_type,
        p_target_id,
        p_details,
        p_ip_address,
        p_user_agent
    )
    RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$;

-- Create table for PIN reset history
CREATE TABLE IF NOT EXISTS public.pin_reset_history (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    admin_id UUID NOT NULL REFERENCES public.admins(id) ON DELETE CASCADE,
    reset_method TEXT NOT NULL CHECK (reset_method IN ('admin_reset', 'self_service', 'email_reset')),
    success BOOLEAN NOT NULL DEFAULT TRUE,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on PIN reset history
ALTER TABLE public.pin_reset_history ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only admins can view PIN reset history
CREATE POLICY "Admins can view PIN reset history" 
ON public.pin_reset_history
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.admins WHERE user_id = auth.uid()
    )
);

-- RLS Policy: Only admins can insert PIN reset records
CREATE POLICY "Admins can insert PIN reset records" 
ON public.pin_reset_history
FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.admins WHERE user_id = auth.uid()
    )
);

-- Create indexes for PIN reset history
CREATE INDEX IF NOT EXISTS idx_pin_reset_history_student_id ON public.pin_reset_history(student_id);
CREATE INDEX IF NOT EXISTS idx_pin_reset_history_admin_id ON public.pin_reset_history(admin_id);
CREATE INDEX IF NOT EXISTS idx_pin_reset_history_created_at ON public.pin_reset_history(created_at DESC);

-- Create table for login attempts tracking (for rate limiting)
CREATE TABLE IF NOT EXISTS public.login_attempts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    identifier TEXT, -- matric_number or email used for login
    success BOOLEAN NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    failure_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for login attempts
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON public.login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_created_at ON public.login_attempts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_attempts_success ON public.login_attempts(success);

-- Create function to check failed login attempts (for rate limiting)
CREATE OR REPLACE FUNCTION public.check_failed_login_attempts(
    p_email TEXT,
    p_time_window_minutes INTEGER DEFAULT 30,
    p_max_attempts INTEGER DEFAULT 5
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_failed_attempts INTEGER;
BEGIN
    -- Count failed attempts within the time window
    SELECT COUNT(*)
    INTO v_failed_attempts
    FROM public.login_attempts
    WHERE email = p_email
    AND success = FALSE
    AND created_at > (now() - (p_time_window_minutes || ' minutes')::INTERVAL);
    
    -- Return TRUE if account should be locked (too many failed attempts)
    RETURN v_failed_attempts >= p_max_attempts;
END;
$$;

-- Create function to log login attempt
CREATE OR REPLACE FUNCTION public.log_login_attempt(
    p_email TEXT,
    p_identifier TEXT,
    p_success BOOLEAN,
    p_ip_address TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_failure_reason TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    v_attempt_id UUID;
BEGIN
    INSERT INTO public.login_attempts (
        email,
        identifier,
        success,
        ip_address,
        user_agent,
        failure_reason
    )
    VALUES (
        p_email,
        p_identifier,
        p_success,
        p_ip_address,
        p_user_agent,
        p_failure_reason
    )
    RETURNING id INTO v_attempt_id;
    
    RETURN v_attempt_id;
END;
$$;

-- Create view for account lockout status
CREATE OR REPLACE VIEW public.account_lockout_status AS
SELECT 
    email,
    COUNT(*) as failed_attempts,
    MAX(created_at) as last_failed_attempt,
    CASE 
        WHEN COUNT(*) >= 5 THEN TRUE
        ELSE FALSE
    END as is_locked
FROM public.login_attempts
WHERE success = FALSE
AND created_at > (now() - INTERVAL '30 minutes')
GROUP BY email
HAVING COUNT(*) >= 5;

-- Grant permissions
ALTER VIEW public.account_lockout_status OWNER TO postgres;

-- Add helpful comments
COMMENT ON TABLE public.audit_logs IS 'Comprehensive audit log of all administrative actions for security and compliance';
COMMENT ON TABLE public.pin_reset_history IS 'History of all PIN reset operations for students';
COMMENT ON TABLE public.login_attempts IS 'Tracks all login attempts for rate limiting and security monitoring';
COMMENT ON FUNCTION public.log_admin_action IS 'Helper function to log administrative actions with all relevant details';
COMMENT ON FUNCTION public.check_failed_login_attempts IS 'Check if an account should be locked due to too many failed login attempts';
COMMENT ON FUNCTION public.log_login_attempt IS 'Log a login attempt (successful or failed) for security monitoring';

-- Create cleanup function to remove old login attempts (keeps last 90 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_login_attempts()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    DELETE FROM public.login_attempts
    WHERE created_at < (now() - INTERVAL '90 days');
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    RETURN v_deleted_count;
END;
$$;

COMMENT ON FUNCTION public.cleanup_old_login_attempts IS 'Removes login attempt records older than 90 days. Should be run periodically via cron job.';
