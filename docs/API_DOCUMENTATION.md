# API & Endpoint Documentation

## Overview

This document provides comprehensive documentation for all API endpoints and database queries in the Student Result Management System (SRMS). The system uses Supabase as the backend, which provides both REST API and JavaScript client access.

## Table of Contents

1. [Authentication Endpoints](#authentication-endpoints)
2. [Student Endpoints](#student-endpoints)
3. [Admin Endpoints](#admin-endpoints)
4. [Results Endpoints](#results-endpoints)
5. [Courses Endpoints](#courses-endpoints)
6. [Fee Payments Endpoints](#fee-payments-endpoints)
7. [Announcements Endpoints](#announcements-endpoints)
8. [Carryovers Endpoints](#carryovers-endpoints)
9. [Audit & Security Endpoints](#audit--security-endpoints)
10. [Database Functions](#database-functions)
11. [Error Handling](#error-handling)

---

## Authentication Endpoints

### Student Login

**Method**: Sign in with email and password

**Implementation**:
```typescript
POST /auth/v1/token?grant_type=password
```

**Client Code**:
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'student@example.com',
  password: '123456', // 6-digit PIN
});
```

**Request Body**:
```json
{
  "email": "student@plasu.edu.ng",
  "password": "123456"
}
```

**Success Response** (200 OK):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "expires_at": 1234567890,
  "refresh_token": "...",
  "user": {
    "id": "uuid",
    "email": "student@plasu.edu.ng",
    "created_at": "2024-01-01T00:00:00Z",
    ...
  }
}
```

**Error Response** (400 Bad Request):
```json
{
  "error": "Invalid login credentials",
  "error_description": "Invalid login credentials"
}
```

**Authorization**: None (public endpoint)

**Notes**:
- Student can use either email or matric number
- If matric number used, frontend looks up email first
- Password is the 6-digit PIN
- Session expires after 1 hour by default

---

### Admin Login

**Method**: Sign in with email and password

**Client Code**:
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'admin@plasu.edu.ng',
  password: 'AdminPassword123',
});

// Verify admin status
const { data: admin, error: adminError } = await supabase
  .from('admins')
  .select('*')
  .eq('email', 'admin@plasu.edu.ng')
  .single();

if (!admin) {
  // Not an admin - sign out
  await supabase.auth.signOut();
}
```

**Success Flow**:
1. Authenticate with Supabase Auth
2. Verify user exists in admins table
3. Store admin session
4. Grant access to admin dashboard

**Authorization**: None (public endpoint)

**Notes**:
- Requires longer, more complex password than students
- Must verify admin table membership after auth
- Non-admin users are signed out immediately

---

### Logout

**Method**: Sign out current session

**Client Code**:
```typescript
const { error } = await supabase.auth.signOut();
```

**Success Response** (200 OK):
```json
{}
```

**Authorization**: Requires valid session

**Notes**:
- Destroys current session
- Clears all tokens
- User must log in again to access protected resources

---

### Password Reset

**Method**: Request password reset email

**Client Code**:
```typescript
const { data, error } = await supabase.auth.resetPasswordForEmail(
  'student@plasu.edu.ng',
  {
    redirectTo: `${window.location.origin}/auth?mode=login`,
  }
);
```

**Success Response** (200 OK):
```json
{}
```

**Authorization**: None (public endpoint)

**Notes**:
- Sends password reset email
- Email contains magic link
- Link redirects to app with reset token
- User sets new password via update

---

## Student Endpoints

### Get Current Student Profile

**Method**: Query students table

**Client Code**:
```typescript
const { data, error } = await supabase
  .from('students')
  .select('*')
  .eq('user_id', auth.uid())
  .single();
```

**RLS Policy**: `Students can view their own profile`

**Success Response**:
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "matric_number": "ND/CS/2024/001",
  "first_name": "John",
  "last_name": "Doe",
  "middle_name": "Smith",
  "email": "john.doe@plasu.edu.ng",
  "phone": "08012345678",
  "level": "ND1",
  "department": "Computer Science",
  "faculty": "School of ICT",
  "date_of_birth": "2000-01-01",
  "gender": "Male",
  "address": "123 Main St",
  "state_of_origin": "Plateau",
  "lga": "Jos North",
  "password_changed": false,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

**Authorization**: Requires student authentication

**Notes**:
- Returns only current student's profile
- RLS prevents viewing other students

---

### Update Student Profile

**Method**: Update students table

**Client Code**:
```typescript
const { data, error } = await supabase
  .from('students')
  .update({
    phone: '08098765432',
    address: '456 New Street',
  })
  .eq('user_id', auth.uid());
```

**RLS Policy**: `Students can update their own profile`

**Request Body**:
```json
{
  "phone": "08098765432",
  "address": "456 New Street"
}
```

**Success Response** (200 OK):
```json
{
  "id": "uuid",
  "phone": "08098765432",
  "address": "456 New Street",
  ...
}
```

**Authorization**: Requires student authentication

**Notes**:
- Students can only update their own record
- Cannot update: matric_number, user_id, level
- Can update: phone, address, profile info

---

### Get Student by Matric Number (Lookup for Login)

**Method**: Query students table by matric number

**Client Code**:
```typescript
const { data, error } = await supabase
  .from('students')
  .select('email, id, password_changed')
  .eq('matric_number', 'ND/CS/2024/001')
  .single();
```

**Success Response**:
```json
{
  "email": "student@plasu.edu.ng",
  "id": "uuid",
  "password_changed": false
}
```

**Authorization**: None (needed for login flow)

**Notes**:
- Used to convert matric number to email for login
- Public endpoint (no sensitive data exposed)
- Only returns email, id, password_changed flag

---

## Admin Endpoints

### Get All Students

**Method**: Query students table

**Client Code**:
```typescript
const { data, error } = await supabase
  .from('students')
  .select('*')
  .order('created_at', { ascending: false });
```

**RLS Policy**: `Admins can view all students`

**Success Response**:
```json
[
  {
    "id": "uuid1",
    "matric_number": "ND/CS/2024/001",
    "first_name": "John",
    "last_name": "Doe",
    ...
  },
  {
    "id": "uuid2",
    "matric_number": "ND/CS/2024/002",
    "first_name": "Jane",
    "last_name": "Smith",
    ...
  }
]
```

**Authorization**: Requires admin authentication

**Query Parameters** (optional):
- `level`: Filter by level (ND1, ND2)
- `department`: Filter by department
- `order`: Sort order

**Example with Filters**:
```typescript
const { data, error } = await supabase
  .from('students')
  .select('*')
  .eq('level', 'ND1')
  .order('last_name');
```

---

### Create Student

**Method**: Insert into students and auth.users

**Client Code**:
```typescript
// Step 1: Create auth user
const { data: authData, error: authError } = await supabase.auth.signUp({
  email: 'newstudent@plasu.edu.ng',
  password: '123456', // 6-digit PIN
  options: {
    data: {
      first_name: 'New',
      last_name: 'Student',
    }
  }
});

// Step 2: Create student record
const { data, error } = await supabase
  .from('students')
  .insert({
    user_id: authData.user.id,
    matric_number: 'ND/CS/2024/003',
    first_name: 'New',
    last_name: 'Student',
    email: 'newstudent@plasu.edu.ng',
    phone: '08011111111',
    level: 'ND1',
    password_changed: false,
  })
  .select()
  .single();
```

**Request Body**:
```json
{
  "matric_number": "ND/CS/2024/003",
  "first_name": "New",
  "last_name": "Student",
  "email": "newstudent@plasu.edu.ng",
  "phone": "08011111111",
  "level": "ND1",
  "pin": "123456"
}
```

**Success Response** (201 Created):
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "matric_number": "ND/CS/2024/003",
  "first_name": "New",
  "last_name": "Student",
  ...
}
```

**Authorization**: Requires admin authentication

**Notes**:
- Creates both auth user and student record
- Matric number must be unique
- Email must be unique
- PIN is used as password

---

### Update Student

**Method**: Update students table

**Client Code**:
```typescript
const { data, error } = await supabase
  .from('students')
  .update({
    phone: '08099999999',
    level: 'ND2',
  })
  .eq('id', studentId)
  .select()
  .single();
```

**Request Body**:
```json
{
  "phone": "08099999999",
  "level": "ND2"
}
```

**Authorization**: Requires admin authentication

**Notes**:
- Admins can update any student field
- Should not update user_id or matric_number in production

---

### Delete Student

**Method**: Delete from students table

**Client Code**:
```typescript
const { error } = await supabase
  .from('students')
  .delete()
  .eq('id', studentId);
```

**Success Response** (200 OK):
```json
{}
```

**Authorization**: Requires admin authentication

**Notes**:
- Cascades to related records (results, fees, etc.)
- Also should delete auth user
- Consider soft delete (set inactive flag) instead

---

## Results Endpoints

### Get Student Results

**Method**: Query results table with course join

**Client Code** (Student):
```typescript
const { data, error } = await supabase
  .from('results')
  .select(`
    *,
    course:courses(*)
  `)
  .eq('student_id', currentStudentId)
  .eq('session', '2024/2025');
```

**Client Code** (Admin - All Students):
```typescript
const { data, error } = await supabase
  .from('results')
  .select(`
    *,
    student:students(*),
    course:courses(*)
  `)
  .eq('session', '2024/2025')
  .order('created_at', { ascending: false });
```

**Success Response**:
```json
[
  {
    "id": "uuid",
    "student_id": "uuid",
    "course_id": "uuid",
    "session": "2024/2025",
    "ca_score": 25,
    "exam_score": 65,
    "total_score": 90,
    "grade": "A",
    "grade_point": 4.0,
    "created_at": "2024-01-01T00:00:00Z",
    "course": {
      "id": "uuid",
      "course_code": "CS 101",
      "course_title": "Introduction to Computing",
      "credit_unit": 3,
      "level": "ND1",
      "semester": "First"
    }
  }
]
```

**RLS Policy**: 
- Students: `Students can view their own results`
- Admins: `Admins can manage all results`

**Authorization**: Requires authentication (student or admin)

---

### Upload Result

**Method**: Insert into results table

**Client Code**:
```typescript
const { data, error } = await supabase
  .from('results')
  .insert({
    student_id: 'student-uuid',
    course_id: 'course-uuid',
    session: '2024/2025',
    ca_score: 25,
    exam_score: 65,
  })
  .select()
  .single();
```

**Request Body**:
```json
{
  "student_id": "uuid",
  "course_id": "uuid",
  "session": "2024/2025",
  "ca_score": 25,
  "exam_score": 65
}
```

**Success Response** (201 Created):
```json
{
  "id": "uuid",
  "student_id": "uuid",
  "course_id": "uuid",
  "session": "2024/2025",
  "ca_score": 25,
  "exam_score": 65,
  "total_score": 90,
  "grade": "A",
  "grade_point": 4.0,
  ...
}
```

**Authorization**: Requires admin authentication

**Notes**:
- `total_score` is auto-calculated (CA + Exam)
- `grade` and `grade_point` auto-calculated via trigger
- CA score: 0-30 (enforced by constraint)
- Exam score: 0-70 (enforced by constraint)
- Unique constraint: (student_id, course_id, session)

---

### Update Result

**Method**: Update results table

**Client Code**:
```typescript
const { data, error } = await supabase
  .from('results')
  .update({
    ca_score: 28,
    exam_score: 68,
  })
  .eq('id', resultId)
  .select()
  .single();
```

**Authorization**: Requires admin authentication

**Notes**:
- Total score, grade, and grade point recalculated automatically
- Cannot update if student has already seen the result (optional policy)

---

### Delete Result

**Method**: Delete from results table

**Client Code**:
```typescript
const { error } = await supabase
  .from('results')
  .delete()
  .eq('id', resultId);
```

**Authorization**: Requires admin authentication

---

### Bulk Upload Results

**Method**: Insert multiple results

**Client Code**:
```typescript
const resultsArray = [
  {
    student_id: 'uuid1',
    course_id: 'uuid-course',
    session: '2024/2025',
    ca_score: 25,
    exam_score: 65,
  },
  {
    student_id: 'uuid2',
    course_id: 'uuid-course',
    session: '2024/2025',
    ca_score: 28,
    exam_score: 60,
  },
  // ... more results
];

const { data, error } = await supabase
  .from('results')
  .insert(resultsArray)
  .select();
```

**Request Body**:
```json
[
  {
    "student_id": "uuid1",
    "course_id": "uuid",
    "session": "2024/2025",
    "ca_score": 25,
    "exam_score": 65
  },
  {
    "student_id": "uuid2",
    "course_id": "uuid",
    "session": "2024/2025",
    "ca_score": 28,
    "exam_score": 60
  }
]
```

**Authorization**: Requires admin authentication

**Notes**:
- All records validated before insertion
- Atomic transaction (all or nothing)
- Duplicate records rejected
- Frontend should parse CSV and format data

---

## Courses Endpoints

### Get All Courses

**Method**: Query courses table

**Client Code**:
```typescript
const { data, error } = await supabase
  .from('courses')
  .select('*')
  .eq('level', 'ND1')
  .eq('semester', 'First')
  .order('course_code');
```

**Success Response**:
```json
[
  {
    "id": "uuid",
    "course_code": "CS 101",
    "course_title": "Introduction to Computing",
    "credit_unit": 3,
    "level": "ND1",
    "semester": "First",
    "department": "Computer Science",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

**RLS Policy**: `Everyone can view courses`

**Authorization**: Requires authentication (student or admin)

---

### Create Course

**Method**: Insert into courses table

**Client Code**:
```typescript
const { data, error } = await supabase
  .from('courses')
  .insert({
    course_code: 'CS 205',
    course_title: 'Data Structures',
    credit_unit: 4,
    level: 'ND2',
    semester: 'First',
    department: 'Computer Science',
  })
  .select()
  .single();
```

**Authorization**: Requires admin authentication

**Notes**:
- Unique constraint: (course_code, level, semester)
- Same course code can exist for different levels/semesters

---

### Update Course

**Method**: Update courses table

**Client Code**:
```typescript
const { data, error } = await supabase
  .from('courses')
  .update({
    course_title: 'Advanced Data Structures',
    credit_unit: 5,
  })
  .eq('id', courseId);
```

**Authorization**: Requires admin authentication

---

### Delete Course

**Method**: Delete from courses table

**Client Code**:
```typescript
const { error } = await supabase
  .from('courses')
  .delete()
  .eq('id', courseId);
```

**Authorization**: Requires admin authentication

**Notes**:
- Will fail if course has associated results (foreign key constraint)
- Consider soft delete instead

---

## Fee Payments Endpoints

### Get Student Fee Status

**Method**: Query fee_payments table

**Client Code** (Student):
```typescript
const { data, error } = await supabase
  .from('fee_payments')
  .select('*')
  .eq('student_id', currentStudentId)
  .eq('session', '2024/2025');
```

**Client Code** (Admin - All Fees):
```typescript
const { data, error } = await supabase
  .from('fee_payments')
  .select(`
    *,
    student:students(*)
  `)
  .eq('session', '2024/2025')
  .order('created_at', { ascending: false });
```

**Success Response**:
```json
[
  {
    "id": "uuid",
    "student_id": "uuid",
    "session": "2024/2025",
    "level": "ND1",
    "semester": "First",
    "amount_due": 50000.00,
    "amount_paid": 50000.00,
    "status": "paid",
    "payment_date": "2024-01-15",
    "reference_number": "PAY123456",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

**Authorization**: Requires authentication

---

### Update Fee Payment

**Method**: Update fee_payments table

**Client Code**:
```typescript
const { data, error } = await supabase
  .from('fee_payments')
  .update({
    amount_paid: 50000.00,
    status: 'paid',
    payment_date: new Date().toISOString().split('T')[0],
    reference_number: 'PAY123456',
  })
  .eq('id', feePaymentId);
```

**Authorization**: Requires admin authentication

**Notes**:
- Status: 'paid', 'unpaid', 'partial'
- Auto-updates status based on amount_paid vs amount_due

---

## Announcements Endpoints

### Get Announcements

**Method**: Query announcements table

**Client Code** (Student - Sees relevant announcements):
```typescript
// RLS automatically filters based on student's level
const { data, error } = await supabase
  .from('announcements')
  .select('*')
  .order('created_at', { ascending: false });
```

**Client Code** (Admin - Sees all):
```typescript
const { data, error } = await supabase
  .from('announcements')
  .select(`
    *,
    admin:admins!created_by(first_name, last_name)
  `)
  .order('created_at', { ascending: false });
```

**Success Response**:
```json
[
  {
    "id": "uuid",
    "title": "Exam Timetable Released",
    "content": "The ND1 First Semester exam timetable has been published...",
    "target_level": "ND1",
    "is_general": false,
    "created_by": "uuid",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

**RLS Policy**: `Students can view relevant announcements`

**Authorization**: Requires authentication

---

### Create Announcement

**Method**: Insert into announcements table

**Client Code**:
```typescript
const { data, error } = await supabase
  .from('announcements')
  .insert({
    title: 'Important Notice',
    content: 'All students should...',
    target_level: null, // null for general announcement
    is_general: true,
    created_by: currentAdminId,
  })
  .select()
  .single();
```

**Request Body**:
```json
{
  "title": "Important Notice",
  "content": "All students should...",
  "target_level": null,
  "is_general": true,
  "created_by": "admin-uuid"
}
```

**Authorization**: Requires admin authentication

**Notes**:
- If `is_general` is true, all students see it
- If `target_level` is set, only that level sees it
- Can target specific level even if not general

---

### Update Announcement

**Method**: Update announcements table

**Client Code**:
```typescript
const { data, error } = await supabase
  .from('announcements')
  .update({
    title: 'Updated Notice',
    content: 'Updated content...',
  })
  .eq('id', announcementId);
```

**Authorization**: Requires admin authentication

---

### Delete Announcement

**Method**: Delete from announcements table

**Client Code**:
```typescript
const { error } = await supabase
  .from('announcements')
  .delete()
  .eq('id', announcementId);
```

**Authorization**: Requires admin authentication

---

## Carryovers Endpoints

### Get Student Carryovers

**Method**: Query carryovers table

**Client Code** (Student):
```typescript
const { data, error } = await supabase
  .from('carryovers')
  .select(`
    *,
    course:courses(*)
  `)
  .eq('student_id', currentStudentId)
  .eq('status', 'pending');
```

**Client Code** (Admin - All Carryovers):
```typescript
const { data, error } = await supabase
  .from('carryovers')
  .select(`
    *,
    student:students(*),
    course:courses(*)
  `)
  .order('created_at', { ascending: false });
```

**Success Response**:
```json
[
  {
    "id": "uuid",
    "student_id": "uuid",
    "course_id": "uuid",
    "original_session": "2023/2024",
    "original_semester": "First",
    "retake_session": null,
    "retake_semester": null,
    "status": "pending",
    "attempts": 1,
    "original_result_id": "uuid",
    "retake_result_id": null,
    "notes": null,
    "created_at": "2024-01-01T00:00:00Z",
    "course": {
      "course_code": "MTH 101",
      "course_title": "Mathematics I",
      ...
    }
  }
]
```

**Authorization**: Requires authentication

**Notes**:
- Auto-created when student gets grade F
- Status: 'pending', 'in_progress', 'cleared', 'failed'
- Attempts limited to 3

---

### Get Carryover Summary

**Method**: Query student_carryover_summary view

**Client Code**:
```typescript
const { data, error } = await supabase
  .from('student_carryover_summary')
  .select('*')
  .eq('student_id', currentStudentId)
  .single();
```

**Success Response**:
```json
{
  "student_id": "uuid",
  "matric_number": "ND/CS/2024/001",
  "first_name": "John",
  "last_name": "Doe",
  "level": "ND1",
  "pending_carryovers": 2,
  "in_progress_carryovers": 1,
  "cleared_carryovers": 3,
  "failed_carryovers": 0,
  "total_carryovers": 6
}
```

**Authorization**: Requires authentication

---

## Audit & Security Endpoints

### Get Audit Logs

**Method**: Query audit_logs table

**Client Code**:
```typescript
const { data, error } = await supabase
  .from('audit_logs')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(100);
```

**Success Response**:
```json
[
  {
    "id": "uuid",
    "admin_id": "uuid",
    "action": "PIN_RESET",
    "target_student_id": "uuid",
    "target_type": "student",
    "target_id": "uuid",
    "details": {
      "student_name": "John Doe",
      "matric_number": "ND/CS/2024/001"
    },
    "ip_address": "192.168.1.1",
    "user_agent": "Mozilla/5.0...",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

**Authorization**: Requires admin authentication

---

### Get Recent Admin Activities

**Method**: Query recent_admin_activities view

**Client Code**:
```typescript
const { data, error } = await supabase
  .from('recent_admin_activities')
  .select('*')
  .limit(50);
```

**Success Response**:
```json
[
  {
    "id": "uuid",
    "action": "RESULT_UPLOADED",
    "admin_name": "Admin Name",
    "admin_email": "admin@plasu.edu.ng",
    "target_student_name": "John Doe",
    "target_matric_number": "ND/CS/2024/001",
    "details": {...},
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

**Authorization**: Requires admin authentication

---

### Check Account Lockout Status

**Method**: Call database function

**Client Code**:
```typescript
const { data: isLocked, error } = await supabase
  .rpc('check_failed_login_attempts', {
    p_email: 'student@plasu.edu.ng',
    p_time_window_minutes: 30,
    p_max_attempts: 5,
  });
```

**Parameters**:
- `p_email`: Email to check
- `p_time_window_minutes`: Time window (default 30)
- `p_max_attempts`: Max failed attempts (default 5)

**Success Response**:
```json
true  // Account is locked
```

or

```json
false  // Account is not locked
```

**Authorization**: None (needed for login flow)

---

### Log Login Attempt

**Method**: Call database function

**Client Code**:
```typescript
const { data: attemptId, error } = await supabase
  .rpc('log_login_attempt', {
    p_email: 'student@plasu.edu.ng',
    p_identifier: 'ND/CS/2024/001',
    p_success: false,
    p_ip_address: '192.168.1.1',
    p_user_agent: navigator.userAgent,
    p_failure_reason: 'Invalid PIN',
  });
```

**Success Response**:
```json
"uuid-of-log-entry"
```

**Authorization**: None (system function)

---

## Database Functions

### calculate_grade()

**Purpose**: Calculate grade and grade point from total score

**Signature**:
```sql
calculate_grade(total_score INTEGER) 
RETURNS TABLE(grade TEXT, grade_point DECIMAL(3,2))
```

**Usage**:
```sql
SELECT * FROM calculate_grade(85);
```

**Returns**:
```
grade | grade_point
------|------------
A     | 4.0
```

**Grading Scale**:
- 70-100: A (4.0)
- 60-69: B (3.0)
- 50-59: C (2.0)
- 45-49: D (1.0)
- 0-44: F (0.0)

---

### auto_create_carryover()

**Purpose**: Automatically create carryover records for failed courses

**Trigger**: After INSERT or UPDATE on results table

**Behavior**:
- If grade is F, creates carryover record
- If grade is passing (A-D), marks carryover as cleared
- Auto-tracks attempts
- Links to original and retake results

**Not called directly** - triggered automatically

---

### log_admin_action()

**Purpose**: Log administrative actions for audit trail

**Signature**:
```sql
log_admin_action(
    p_admin_id UUID,
    p_action TEXT,
    p_target_student_id UUID DEFAULT NULL,
    p_target_type TEXT DEFAULT NULL,
    p_target_id UUID DEFAULT NULL,
    p_details JSONB DEFAULT NULL,
    p_ip_address TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
) RETURNS UUID
```

**Client Usage**:
```typescript
const { data: logId, error } = await supabase
  .rpc('log_admin_action', {
    p_admin_id: currentAdminId,
    p_action: 'STUDENT_CREATED',
    p_target_student_id: newStudentId,
    p_target_type: 'student',
    p_details: { matric_number: 'ND/CS/2024/003' },
  });
```

**Returns**: UUID of log entry

---

### check_failed_login_attempts()

**Purpose**: Check if account should be locked

**Signature**:
```sql
check_failed_login_attempts(
    p_email TEXT,
    p_time_window_minutes INTEGER DEFAULT 30,
    p_max_attempts INTEGER DEFAULT 5
) RETURNS BOOLEAN
```

**Returns**: `true` if locked, `false` if not

---

### log_login_attempt()

**Purpose**: Log a login attempt

**Signature**:
```sql
log_login_attempt(
    p_email TEXT,
    p_identifier TEXT,
    p_success BOOLEAN,
    p_ip_address TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_failure_reason TEXT DEFAULT NULL
) RETURNS UUID
```

**Returns**: UUID of log entry

---

### cleanup_old_login_attempts()

**Purpose**: Remove login attempts older than 90 days

**Signature**:
```sql
cleanup_old_login_attempts() RETURNS INTEGER
```

**Returns**: Number of records deleted

**Usage**:
```sql
SELECT cleanup_old_login_attempts();
```

**Should be run**: Periodically via cron job

---

## Error Handling

### Common Error Codes

#### 400 Bad Request
```json
{
  "code": "PGRST102",
  "message": "Bad request",
  "details": "Invalid input"
}
```

**Causes**:
- Invalid data format
- Missing required fields
- Constraint violation

---

#### 401 Unauthorized
```json
{
  "message": "JWT expired"
}
```

**Causes**:
- No auth token provided
- Expired session
- Invalid token

**Solution**: Refresh token or re-login

---

#### 403 Forbidden
```json
{
  "code": "42501",
  "message": "new row violates row-level security policy"
}
```

**Causes**:
- RLS policy denied access
- Attempting unauthorized operation
- User not in correct role

**Solution**: Check user permissions and role

---

#### 404 Not Found
```json
{
  "code": "PGRST116",
  "message": "The result contains 0 rows"
}
```

**Causes**:
- Resource doesn't exist
- RLS filtered out results
- Invalid ID

---

#### 409 Conflict
```json
{
  "code": "23505",
  "message": "duplicate key value violates unique constraint",
  "details": "Key (matric_number)=(ND/CS/2024/001) already exists."
}
```

**Causes**:
- Unique constraint violation
- Duplicate matric number
- Duplicate email

---

#### 500 Internal Server Error
```json
{
  "message": "Internal server error"
}
```

**Causes**:
- Database error
- Trigger failure
- Function error

**Solution**: Check server logs, report to admin

---

### Error Handling Best Practices

```typescript
try {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('id', studentId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found
      toast({
        title: 'Not Found',
        description: 'Student not found',
        variant: 'destructive',
      });
    } else if (error.code === '42501') {
      // RLS denied
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to view this resource',
        variant: 'destructive',
      });
    } else {
      // Generic error
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
    return;
  }

  // Success - use data
  console.log(data);

} catch (error) {
  console.error('Unexpected error:', error);
  toast({
    title: 'Error',
    description: 'An unexpected error occurred',
    variant: 'destructive',
  });
}
```

---

## Rate Limiting

### Login Attempts

- **Limit**: 5 failed attempts per 30 minutes
- **Lockout Duration**: 30 minutes
- **Tracking**: Via `login_attempts` table
- **Check**: Before each login attempt

### Implementation

```typescript
// Before attempting login
const { data: isLocked } = await supabase.rpc(
  'check_failed_login_attempts',
  { p_email: email }
);

if (isLocked) {
  toast({
    title: 'Account Locked',
    description: 'Too many failed attempts. Try again in 30 minutes.',
    variant: 'destructive',
  });
  return;
}

// Proceed with login attempt
```

---

## Pagination

### Using Supabase Pagination

```typescript
const pageSize = 20;
const pageNumber = 1;
const from = (pageNumber - 1) * pageSize;
const to = from + pageSize - 1;

const { data, error, count } = await supabase
  .from('students')
  .select('*', { count: 'exact' })
  .range(from, to)
  .order('created_at', { ascending: false });

console.log(`Showing ${data.length} of ${count} total records`);
```

---

## Conclusion

This API documentation provides comprehensive coverage of all endpoints and database operations in the Student Result Management System. All endpoints are protected by Row Level Security (RLS) policies and require appropriate authentication and authorization.

For implementation details, refer to:
- [RBAC Implementation Guide](./RBAC_IMPLEMENTATION_GUIDE.md)
- [System Implementation Guide](./SYSTEM_IMPLEMENTATION_GUIDE.md)
- [PIN Reset Policy](./PIN_RESET_POLICY.md)
