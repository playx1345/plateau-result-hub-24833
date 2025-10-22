-- Create carryovers table to track failed courses and retake attempts
-- This enhances the system's ability to manage and monitor student academic progress

CREATE TABLE IF NOT EXISTS public.carryovers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    original_session TEXT NOT NULL,
    original_semester public.semester NOT NULL,
    retake_session TEXT,
    retake_semester public.semester,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'cleared', 'failed')),
    attempts INTEGER NOT NULL DEFAULT 1 CHECK (attempts >= 1 AND attempts <= 3),
    original_result_id UUID REFERENCES public.results(id),
    retake_result_id UUID REFERENCES public.results(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(student_id, course_id, original_session, original_semester)
);

-- Enable Row Level Security
ALTER TABLE public.carryovers ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Students can view their own carryovers
CREATE POLICY "Students can view their own carryovers" 
ON public.carryovers
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.students 
        WHERE id = carryovers.student_id AND user_id = auth.uid()
    )
);

-- RLS Policy: Admins can manage all carryovers
CREATE POLICY "Admins can manage all carryovers" 
ON public.carryovers
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.admins WHERE user_id = auth.uid()
    )
);

-- Create trigger to update timestamps
CREATE TRIGGER update_carryovers_updated_at
    BEFORE UPDATE ON public.carryovers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically create carryover records for failed courses
CREATE OR REPLACE FUNCTION public.auto_create_carryover()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Only create carryover if grade is F (failed)
    IF NEW.grade = 'F' THEN
        -- Check if carryover record already exists
        IF NOT EXISTS (
            SELECT 1 FROM public.carryovers 
            WHERE student_id = NEW.student_id 
            AND course_id = NEW.course_id 
            AND original_session = NEW.session
        ) THEN
            -- Create carryover record
            INSERT INTO public.carryovers (
                student_id,
                course_id,
                original_session,
                original_semester,
                status,
                attempts,
                original_result_id
            )
            SELECT 
                NEW.student_id,
                NEW.course_id,
                NEW.session,
                c.semester,
                'pending',
                1,
                NEW.id
            FROM public.courses c
            WHERE c.id = NEW.course_id;
        END IF;
    -- If student passed a previously failed course, update carryover status
    ELSIF NEW.grade IN ('A', 'B', 'C', 'D') THEN
        UPDATE public.carryovers
        SET 
            status = 'cleared',
            retake_session = NEW.session,
            retake_result_id = NEW.id,
            updated_at = now()
        WHERE 
            student_id = NEW.student_id 
            AND course_id = NEW.course_id 
            AND status IN ('pending', 'in_progress');
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger to auto-create carryover records when results are inserted/updated
CREATE TRIGGER auto_create_carryover_trigger
    AFTER INSERT OR UPDATE ON public.results
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_create_carryover();

-- Create view for easy carryover statistics
CREATE OR REPLACE VIEW public.student_carryover_summary AS
SELECT 
    s.id as student_id,
    s.matric_number,
    s.first_name,
    s.last_name,
    s.level,
    COUNT(CASE WHEN c.status = 'pending' THEN 1 END) as pending_carryovers,
    COUNT(CASE WHEN c.status = 'in_progress' THEN 1 END) as in_progress_carryovers,
    COUNT(CASE WHEN c.status = 'cleared' THEN 1 END) as cleared_carryovers,
    COUNT(CASE WHEN c.status = 'failed' THEN 1 END) as failed_carryovers,
    COUNT(c.id) as total_carryovers
FROM public.students s
LEFT JOIN public.carryovers c ON s.id = c.student_id
GROUP BY s.id, s.matric_number, s.first_name, s.last_name, s.level;

-- Grant permissions on the view
ALTER VIEW public.student_carryover_summary OWNER TO postgres;

-- RLS for the view (students can see their own summary)
ALTER VIEW public.student_carryover_summary SET (security_barrier = true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_carryovers_student_id ON public.carryovers(student_id);
CREATE INDEX IF NOT EXISTS idx_carryovers_course_id ON public.carryovers(course_id);
CREATE INDEX IF NOT EXISTS idx_carryovers_status ON public.carryovers(status);
CREATE INDEX IF NOT EXISTS idx_carryovers_original_session ON public.carryovers(original_session);

-- Add helpful comments
COMMENT ON TABLE public.carryovers IS 'Tracks failed courses and retake attempts for students';
COMMENT ON COLUMN public.carryovers.status IS 'Status: pending (not yet retaken), in_progress (currently retaking), cleared (passed on retake), failed (failed on retake)';
COMMENT ON COLUMN public.carryovers.attempts IS 'Number of times student has attempted this course (max 3)';
COMMENT ON FUNCTION public.auto_create_carryover() IS 'Automatically creates carryover records when a student fails a course (grade F)';
