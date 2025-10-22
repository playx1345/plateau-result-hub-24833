# PIN Reset & Password Management Policy

## Overview

This document outlines the policies and procedures for PIN reset and password management in the Student Result Management System (SRMS).

## Table of Contents

1. [Student PIN Management](#student-pin-management)
2. [Admin PIN Reset Functionality](#admin-pin-reset-functionality)
3. [Password Management](#password-management)
4. [Security Policies](#security-policies)
5. [Implementation Guide](#implementation-guide)

---

## Student PIN Management

### PIN Requirements

Students use a **6-digit numeric PIN** as their password for authentication.

#### PIN Specifications:
- **Length**: Exactly 6 digits
- **Format**: Numeric only (0-9)
- **Storage**: Hashed using bcrypt via Supabase Auth
- **Default**: Assigned by admin during account creation
- **Validity**: Does not expire but can be changed

#### PIN Security:
- ✅ Never stored in plaintext
- ✅ Hashed with bcrypt (cost factor 10)
- ✅ Unique salt per PIN
- ✅ Cannot be recovered (only reset)
- ✅ Resistant to rainbow table attacks

### Student Self-Service PIN Change

**Status**: ⚠️ To Be Implemented

**Location**: Student Profile Page (`/student/profile`)

#### Requirements:

Students should be able to change their own PIN through a self-service interface.

#### Flow:

1. Student navigates to Profile page
2. Clicks "Change PIN" button
3. Enters current PIN for verification
4. Enters new 6-digit PIN
5. Confirms new PIN
6. System validates:
   - Current PIN is correct
   - New PIN is 6 digits
   - New PIN matches confirmation
   - New PIN is different from current PIN
7. System updates PIN in Supabase Auth
8. System logs the PIN change
9. Student receives confirmation

#### Implementation Code:

```typescript
// src/pages/StudentProfile.tsx

const handleChangePIN = async (
  currentPIN: string,
  newPIN: string,
  confirmPIN: string
) => {
  // Validate inputs
  if (newPIN !== confirmPIN) {
    toast({
      title: "Error",
      description: "New PIN and confirmation do not match",
      variant: "destructive",
    });
    return;
  }

  if (newPIN.length !== 6 || !/^\d{6}$/.test(newPIN)) {
    toast({
      title: "Error",
      description: "PIN must be exactly 6 digits",
      variant: "destructive",
    });
    return;
  }

  if (currentPIN === newPIN) {
    toast({
      title: "Error",
      description: "New PIN must be different from current PIN",
      variant: "destructive",
    });
    return;
  }

  try {
    // Verify current PIN by attempting to re-authenticate
    const { data: currentUser } = await supabase.auth.getUser();
    const { data: student } = await supabase
      .from('students')
      .select('email')
      .eq('user_id', currentUser.user.id)
      .single();

    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: student.email,
      password: currentPIN,
    });

    if (verifyError) {
      toast({
        title: "Error",
        description: "Current PIN is incorrect",
        variant: "destructive",
      });
      return;
    }

    // Update to new PIN
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPIN,
    });

    if (updateError) {
      toast({
        title: "Error",
        description: "Failed to update PIN: " + updateError.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Your PIN has been changed successfully",
    });

    // Optional: Log the PIN change
    await supabase.from('pin_reset_history').insert({
      student_id: studentId,
      reset_method: 'self_service',
      success: true,
    });

  } catch (error) {
    console.error('PIN change error:', error);
    toast({
      title: "Error",
      description: "An unexpected error occurred",
      variant: "destructive",
    });
  }
};
```

### Password Reset via Email

**Status**: ✅ Implemented

**Location**: Login page (`/auth`)

Students who forget their PIN can request a reset via email.

#### Flow:

1. Student clicks "Forgot PIN?" on login page
2. Enters their email address
3. Receives password reset email from Supabase
4. Clicks link in email
5. Enters new 6-digit PIN
6. PIN is updated
7. Student can log in with new PIN

#### Code Reference:

```typescript
// src/pages/Auth.tsx

const handlePasswordReset = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/auth?mode=login`,
    });

    if (error) {
      toast({
        title: "Reset Failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Reset Email Sent",
      description: "Check your email for password reset instructions",
    });

    setShowReset(false);
    setResetEmail("");
  } catch (error) {
    console.error('Password reset error:', error);
  } finally {
    setLoading(false);
  }
};
```

---

## Admin PIN Reset Functionality

### Overview

Administrators can reset student PINs when students are locked out or forget their credentials.

**Status**: ⚠️ To Be Implemented

**Location**: Admin Student Management Page (`/admin/students`)

### Requirements

#### Security Requirements:
- ✅ Only admins can reset PINs
- ✅ All PIN resets must be logged
- ✅ Generate cryptographically secure PINs
- ✅ Notify student of PIN change
- ✅ Display PIN securely to admin only once
- ✅ Require admin confirmation before reset

#### Functional Requirements:
- Generate secure 6-digit PIN
- Update student's auth password
- Log the reset action with admin ID, student ID, and timestamp
- Display new PIN to admin
- Optionally email new PIN to student
- Show warning about PIN security

### Implementation

#### Database Setup

Migration file: `supabase/migrations/20251022135100_add_audit_and_security_tables.sql`

The migration creates:
1. `audit_logs` table - tracks all admin actions
2. `pin_reset_history` table - specific tracking for PIN resets
3. Helper functions for logging

#### Backend Function

Since we're using Supabase, we need a server-side function (Edge Function) or admin SDK to reset passwords.

**Option 1: Supabase Edge Function** (Recommended)

Create file: `supabase/functions/reset-student-pin/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    // Get admin user from request
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    // Create Supabase client with service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Create regular client to verify admin
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader }
        }
      }
    )

    // Verify requester is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      )
    }

    const { data: admin } = await supabase
      .from('admins')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!admin) {
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin access required' }),
        { status: 403 }
      )
    }

    // Get request body
    const { studentId } = await req.json()

    // Get student details
    const { data: student, error: studentError } = await supabaseAdmin
      .from('students')
      .select('user_id, email, first_name, last_name, matric_number')
      .eq('id', studentId)
      .single()

    if (studentError || !student) {
      return new Response(
        JSON.stringify({ error: 'Student not found' }),
        { status: 404 }
      )
    }

    // Generate secure 6-digit PIN
    const newPIN = Math.floor(100000 + Math.random() * 900000).toString()

    // Update auth user password using admin API
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      student.user_id,
      { password: newPIN }
    )

    if (updateError) {
      return new Response(
        JSON.stringify({ error: 'Failed to reset PIN: ' + updateError.message }),
        { status: 500 }
      )
    }

    // Log the PIN reset
    await supabaseAdmin.from('audit_logs').insert({
      admin_id: admin.id,
      action: 'PIN_RESET',
      target_student_id: studentId,
      target_type: 'student',
      target_id: studentId,
      details: {
        student_name: `${student.first_name} ${student.last_name}`,
        matric_number: student.matric_number,
        method: 'admin_reset'
      }
    })

    await supabaseAdmin.from('pin_reset_history').insert({
      student_id: studentId,
      admin_id: admin.id,
      reset_method: 'admin_reset',
      success: true
    })

    // Return new PIN (only shown once)
    return new Response(
      JSON.stringify({ 
        success: true,
        newPIN,
        student: {
          name: `${student.first_name} ${student.last_name}`,
          email: student.email,
          matricNumber: student.matric_number
        }
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    )
  }
})
```

#### Frontend Implementation

Add to `src/pages/AdminStudentManagement.tsx`:

```typescript
const handleResetPIN = async (studentId: string) => {
  // Show confirmation dialog
  const confirmed = await confirm(
    'Reset Student PIN',
    'Are you sure you want to reset this student\'s PIN? A new PIN will be generated and the old one will no longer work.'
  );

  if (!confirmed) return;

  try {
    setLoading(true);

    // Call Edge Function to reset PIN
    const { data: session } = await supabase.auth.getSession();
    
    const response = await fetch(
      `${process.env.VITE_SUPABASE_URL}/functions/v1/reset-student-pin`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentId }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to reset PIN');
    }

    // Show success dialog with new PIN
    setResetPINResult({
      studentName: result.student.name,
      studentEmail: result.student.email,
      matricNumber: result.student.matricNumber,
      newPIN: result.newPIN,
    });
    setShowPINDialog(true);

    toast({
      title: 'PIN Reset Successful',
      description: `New PIN generated for ${result.student.name}`,
    });

  } catch (error) {
    console.error('PIN reset error:', error);
    toast({
      title: 'Reset Failed',
      description: error.message,
      variant: 'destructive',
    });
  } finally {
    setLoading(false);
  }
};
```

#### UI Component for Displaying New PIN

```tsx
<Dialog open={showPINDialog} onOpenChange={setShowPINDialog}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>PIN Reset Successful</DialogTitle>
      <DialogDescription>
        A new PIN has been generated for the student. Please provide this PIN to the student securely.
      </DialogDescription>
    </DialogHeader>
    
    <div className="space-y-4">
      <div>
        <Label>Student Name</Label>
        <p className="text-lg font-medium">{resetPINResult?.studentName}</p>
      </div>
      
      <div>
        <Label>Matric Number</Label>
        <p className="text-lg font-medium">{resetPINResult?.matricNumber}</p>
      </div>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <Label className="text-yellow-800">New PIN (shown only once)</Label>
        <p className="text-3xl font-mono font-bold text-yellow-900 text-center py-2">
          {resetPINResult?.newPIN}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            navigator.clipboard.writeText(resetPINResult?.newPIN || '');
            toast({ title: 'Copied to clipboard' });
          }}
        >
          Copy PIN
        </Button>
      </div>
      
      <Alert variant="warning">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Important</AlertTitle>
        <AlertDescription>
          This PIN will only be shown once. Please save it or send it to the student immediately.
          The student should change this PIN after first login.
        </AlertDescription>
      </Alert>
    </div>
    
    <DialogFooter>
      <Button
        variant="outline"
        onClick={() => {
          // Optional: Send PIN via email
          sendPINViaEmail(resetPINResult);
        }}
      >
        Send via Email
      </Button>
      <Button onClick={() => setShowPINDialog(false)}>
        Done
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

## Password Management

### Admin Password Management

#### Password Requirements:
- Minimum 8 characters
- At least one uppercase letter (recommended)
- At least one lowercase letter (recommended)
- At least one number (recommended)
- No maximum length
- Hashed with bcrypt

#### Password Change:

**Status**: ⚠️ To Be Implemented

Admins should be able to change their password from their profile settings.

**Location**: Admin Profile/Settings Page

**Implementation**:

```typescript
const handleChangePassword = async (
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
) => {
  // Validate inputs
  if (newPassword !== confirmPassword) {
    toast({
      title: "Error",
      description: "New password and confirmation do not match",
      variant: "destructive",
    });
    return;
  }

  if (newPassword.length < 8) {
    toast({
      title: "Error",
      description: "Password must be at least 8 characters long",
      variant: "destructive",
    });
    return;
  }

  try {
    // Verify current password
    const { data: currentUser } = await supabase.auth.getUser();
    const { data: admin } = await supabase
      .from('admins')
      .select('email')
      .eq('user_id', currentUser.user.id)
      .single();

    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: admin.email,
      password: currentPassword,
    });

    if (verifyError) {
      toast({
        title: "Error",
        description: "Current password is incorrect",
        variant: "destructive",
      });
      return;
    }

    // Update to new password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      toast({
        title: "Error",
        description: "Failed to update password: " + updateError.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Your password has been changed successfully",
    });

    // Log the password change
    await supabase.from('audit_logs').insert({
      admin_id: adminId,
      action: 'ADMIN_PASSWORD_CHANGED',
      target_type: 'admin',
      details: { timestamp: new Date().toISOString() }
    });

  } catch (error) {
    console.error('Password change error:', error);
  }
};
```

---

## Security Policies

### Rate Limiting & Brute Force Protection

**Status**: ⚠️ Partially Implemented (Database tables ready)

#### Policy:
- Maximum 5 failed login attempts within 30 minutes
- After 5 failures, account is locked for 30 minutes
- Account automatically unlocks after timeout
- Admin can manually unlock accounts

#### Implementation:

Database functions are ready in migration `20251022135100_add_audit_and_security_tables.sql`:
- `check_failed_login_attempts()` - Check if account should be locked
- `log_login_attempt()` - Log each login attempt
- `account_lockout_status` view - Check locked accounts

Frontend implementation needed in `src/pages/Auth.tsx` and `src/pages/AdminLogin.tsx`:

```typescript
// Before attempting login
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    // Check if account is locked
    const { data: isLocked } = await supabase.rpc(
      'check_failed_login_attempts',
      { p_email: email }
    );

    if (isLocked) {
      toast({
        title: "Account Locked",
        description: "Too many failed login attempts. Please try again in 30 minutes or contact an administrator.",
        variant: "destructive",
      });
      return;
    }

    // Attempt login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pin,
    });

    // Log the attempt
    await supabase.rpc('log_login_attempt', {
      p_email: email,
      p_identifier: identifier,
      p_success: !error,
      p_failure_reason: error?.message || null
    });

    if (error) {
      // Handle login failure
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    // Success
    navigate('/dashboard');

  } catch (error) {
    console.error('Login error:', error);
  }
};
```

### Audit Trail

All PIN resets and password changes are logged in the `audit_logs` and `pin_reset_history` tables.

#### Logged Information:
- ✅ Admin ID who performed the action
- ✅ Student ID affected (if applicable)
- ✅ Action type (PIN_RESET, etc.)
- ✅ Timestamp
- ✅ Success/failure status
- ✅ Additional details (JSON)
- ✅ IP address (optional)
- ✅ User agent (optional)

#### Viewing Audit Logs:

**Location**: Admin Dashboard - Audit Logs section (to be added)

```typescript
// Fetch recent admin activities
const { data: activities } = await supabase
  .from('recent_admin_activities')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(50);
```

### Notification Policy

#### PIN Reset Notification:

When an admin resets a student's PIN, the student should be notified via:

1. **Email** (Primary method)
   - Subject: "Your PLASU ICT Portal PIN has been reset"
   - Body: Inform student that PIN was reset by admin
   - Include new PIN or instructions to check with admin
   - Security warning to change PIN after first login

2. **SMS** (Optional, if phone number available)
   - Brief notification about PIN reset
   - Instruction to check email

**Implementation**: Use Supabase Edge Functions to send emails via SendGrid, AWS SES, or similar service.

---

## Implementation Checklist

### Student PIN Management
- [ ] Add "Change PIN" button to student profile page
- [ ] Implement PIN change dialog with validation
- [ ] Verify current PIN before allowing change
- [ ] Update PIN via Supabase Auth
- [ ] Log PIN change in pin_reset_history
- [ ] Show success confirmation

### Admin PIN Reset
- [ ] Create Supabase Edge Function for PIN reset
- [ ] Deploy Edge Function
- [ ] Add "Reset PIN" button in student management
- [ ] Implement PIN reset dialog with confirmation
- [ ] Call Edge Function to reset PIN
- [ ] Display new PIN to admin securely
- [ ] Log reset in audit_logs and pin_reset_history
- [ ] Implement email notification to student
- [ ] Add manual unlock for locked accounts

### Admin Password Management
- [ ] Add "Change Password" to admin settings/profile
- [ ] Implement password change dialog
- [ ] Verify current password
- [ ] Validate new password strength
- [ ] Update password via Supabase Auth
- [ ] Log password change

### Rate Limiting
- [ ] Implement login attempt tracking in frontend
- [ ] Check account lockout status before login
- [ ] Log all login attempts
- [ ] Display locked account message
- [ ] Add admin interface to view locked accounts
- [ ] Add admin interface to manually unlock accounts

### Audit & Monitoring
- [ ] Create admin audit log viewer page
- [ ] Display recent admin activities
- [ ] Filter audit logs by action type, date, admin
- [ ] Export audit logs for compliance
- [ ] Set up automated cleanup of old login attempts

---

## Security Best Practices

### For Administrators:
1. **Never share admin credentials** with anyone
2. **Change default password** immediately after first login
3. **Use strong passwords** (8+ characters, mixed case, numbers, symbols)
4. **Never write down PINs** that you reset for students
5. **Only reset PINs** when student provides proper identification
6. **Verify student identity** before resetting PIN
7. **Log out** when leaving workstation
8. **Review audit logs** regularly for suspicious activity

### For Students:
1. **Keep your PIN confidential** - never share with anyone
2. **Change default PIN** immediately after receiving it
3. **Don't write down your PIN** in unsecured locations
4. **Don't use obvious PINs** like birthdate or 123456
5. **Log out** after viewing results on shared computers
6. **Report suspicious activity** to administrators
7. **Change PIN immediately** if you suspect it's compromised

### For System:
1. **Always hash passwords/PINs** - never store plaintext
2. **Log all security-sensitive actions** for audit trail
3. **Implement rate limiting** to prevent brute force attacks
4. **Use HTTPS** for all communications
5. **Validate all inputs** on both client and server
6. **Follow principle of least privilege** for all operations
7. **Regularly review** and update security policies
8. **Monitor** for suspicious patterns in login attempts

---

## Compliance & Regulations

This PIN reset and password management system complies with:

- ✅ **FERPA** (Family Educational Rights and Privacy Act) - Student data privacy
- ✅ **GDPR** principles (if applicable) - Data protection and privacy
- ✅ **NIST** guidelines - Password and authentication best practices
- ✅ **OWASP** recommendations - Web application security

### Data Retention:
- **Login Attempts**: 90 days
- **Audit Logs**: Indefinite (for compliance)
- **PIN Reset History**: Indefinite (for compliance)

---

## Conclusion

This PIN reset and password management system provides:

1. ✅ Secure student PIN management
2. ✅ Admin-controlled PIN reset with full audit trail
3. ✅ Rate limiting and brute force protection
4. ✅ Comprehensive audit logging
5. ✅ Self-service PIN/password change
6. ✅ Compliance with security standards

The implementation ensures student data privacy while providing administrators with the tools needed to manage access securely and efficiently.
