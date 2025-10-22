# Role-Based Access Control (RBAC) Implementation Guide

## Overview

This document provides a comprehensive guide to the Role-Based Access Control (RBAC) implementation in the Student Result Management System (SRMS). RBAC ensures that users can only access resources and perform actions appropriate to their role.

## Table of Contents

1. [RBAC Principles](#rbac-principles)
2. [Roles Definition](#roles-definition)
3. [Permissions Matrix](#permissions-matrix)
4. [Implementation Layers](#implementation-layers)
5. [Database-Level Security (RLS)](#database-level-security-rls)
6. [Application-Level Security](#application-level-security)
7. [Testing RBAC](#testing-rbac)
8. [Security Considerations](#security-considerations)

---

## RBAC Principles

### Core Principles

The SRMS implements RBAC based on these fundamental security principles:

#### 1. **Principle of Least Privilege**
- Users are granted only the minimum level of access required to perform their duties
- Students can only view their own data
- Admins have elevated privileges but only for legitimate administrative tasks

#### 2. **Separation of Duties**
- Clear separation between student and admin roles
- Different authentication methods for different roles
- Distinct dashboards and interfaces

#### 3. **Defense in Depth**
- Multiple layers of security (database, API, UI)
- Security enforced at every layer
- Never rely solely on frontend restrictions

#### 4. **Mandatory Access Control**
- Access is enforced by the system, not optional
- Users cannot bypass security controls
- Database-level enforcement (RLS)

---

## Roles Definition

### 1. Student Role

**Identifier**: `role = 'student'`

**Authentication Method**: 
- Matriculation Number + 6-digit PIN
- OR Email + 6-digit PIN

**Primary Table**: `students`

**Characteristics**:
- Authenticated via Supabase Auth
- Record in `students` table linked to `auth.users` via `user_id`
- Can only access own data (scoped by `student_id`)
- Read-only access to most data
- Limited write access (profile updates only)

**Key Attributes**:
```typescript
interface Student {
  id: UUID;
  user_id: UUID; // Links to auth.users
  matric_number: string; // Unique identifier
  first_name: string;
  last_name: string;
  email: string;
  level: 'ND1' | 'ND2';
  // ... other attributes
}
```

### 2. Admin Role

**Identifier**: `role = 'admin'`

**Authentication Method**: 
- Email + Password (longer, more complex than student PIN)

**Primary Table**: `admins`

**Characteristics**:
- Authenticated via Supabase Auth
- Record in `admins` table linked to `auth.users` via `user_id`
- Can access all student data
- Full CRUD permissions on most tables
- Cannot create/delete other admins (requires service role)

**Key Attributes**:
```typescript
interface Admin {
  id: UUID;
  user_id: UUID; // Links to auth.users
  staff_id: string; // Unique identifier
  first_name: string;
  last_name: string;
  email: string;
  role: 'admin';
  department: string;
  // ... other attributes
}
```

### 3. Service Role (System)

**Identifier**: `role = 'service_role'`

**Authentication Method**: 
- Service role key (Supabase)

**Characteristics**:
- Bypasses all RLS policies
- Used for system operations
- Admin account creation
- Automated tasks
- **Never exposed to frontend**

---

## Permissions Matrix

### Complete RBAC Matrix

| Resource / Action | Student | Admin | Service Role |
|-------------------|---------|-------|--------------|
| **Authentication** |
| Login with matric + PIN | ✅ | ❌ | N/A |
| Login with email + password | ❌ | ✅ | N/A |
| Logout | ✅ | ✅ | N/A |
| Change own PIN | ✅ | ❌ | N/A |
| Change own password | ❌ | ✅ | N/A |
| Reset password via email | ✅ | ✅ | N/A |
| **Students Table** |
| View own profile | ✅ | ✅ (all) | ✅ |
| View other students | ❌ | ✅ | ✅ |
| Update own profile | ✅ | ❌ | ✅ |
| Update other students | ❌ | ✅ | ✅ |
| Create student | ❌ | ✅ | ✅ |
| Delete student | ❌ | ✅ | ✅ |
| **Admins Table** |
| View own admin profile | ❌ | ✅ (own) | ✅ |
| View other admins | ❌ | ✅ | ✅ |
| Update own admin profile | ❌ | ✅ (own) | ✅ |
| Update other admins | ❌ | ❌ | ✅ |
| Create admin | ❌ | ❌ | ✅ |
| Delete admin | ❌ | ❌ | ✅ |
| **Results Table** |
| View own results | ✅ | ✅ (all) | ✅ |
| View other students' results | ❌ | ✅ | ✅ |
| Upload/Create results | ❌ | ✅ | ✅ |
| Update results | ❌ | ✅ | ✅ |
| Delete results | ❌ | ✅ | ✅ |
| Download own results as PDF | ✅ | ✅ | N/A |
| Bulk upload results (CSV) | ❌ | ✅ | ✅ |
| **Courses Table** |
| View courses | ✅ | ✅ | ✅ |
| Create courses | ❌ | ✅ | ✅ |
| Update courses | ❌ | ✅ | ✅ |
| Delete courses | ❌ | ✅ | ✅ |
| **Fee Payments Table** |
| View own fee status | ✅ | ✅ (all) | ✅ |
| View other students' fees | ❌ | ✅ | ✅ |
| Update own fee status | ❌ | ❌ | ✅ |
| Update fee payments | ❌ | ✅ | ✅ |
| **Announcements Table** |
| View relevant announcements | ✅ | ✅ | ✅ |
| Create announcements | ❌ | ✅ | ✅ |
| Update announcements | ❌ | ✅ | ✅ |
| Delete announcements | ❌ | ✅ | ✅ |
| **Carryovers Table** |
| View own carryovers | ✅ | ✅ (all) | ✅ |
| View other students' carryovers | ❌ | ✅ | ✅ |
| Create carryover | ❌ | Auto | ✅ |
| Update carryover status | ❌ | ✅ | ✅ |
| **GPA/CGPA Calculation** |
| Calculate own GPA/CGPA | ✅ | ✅ (any) | N/A |
| View GPA breakdown | ✅ | ✅ | N/A |
| **PIN Management** |
| Reset own PIN (self-service) | ✅ | ❌ | N/A |
| Reset student PIN (admin) | ❌ | ✅ | ✅ |
| View PIN reset history | ❌ | ✅ | ✅ |
| **Audit Logs** |
| View audit logs | ❌ | ✅ | ✅ |
| Create audit log entries | ❌ | Auto | ✅ |
| **Dashboard Access** |
| Access student dashboard | ✅ | ❌ | N/A |
| Access admin dashboard | ❌ | ✅ | N/A |
| Access analytics | ❌ | ✅ | N/A |

### Legend
- ✅ **Permitted** - User can perform this action
- ❌ **Denied** - User cannot perform this action
- **Auto** - Action performed automatically by system
- **N/A** - Not applicable for this role

---

## Implementation Layers

The RBAC system is enforced at three layers:

### Layer 1: Database Level (RLS Policies)
- **Primary defense** - Cannot be bypassed
- PostgreSQL Row Level Security
- Enforced on every database query
- Independent of application logic

### Layer 2: API/Backend Level
- **Secondary defense** - Validates requests
- Supabase API automatically enforces RLS
- Additional validation in Edge Functions
- Prevents unauthorized API calls

### Layer 3: UI/Frontend Level
- **User experience** - Not for security
- Hides unauthorized options
- Prevents confusion
- Provides better UX
- **Never trusted for security**

---

## Database-Level Security (RLS)

### Row Level Security Overview

RLS policies are PostgreSQL security features that restrict which rows users can access in a table based on policies you define.

**Key Benefits**:
- ✅ Cannot be bypassed by application code
- ✅ Enforced at database level
- ✅ Protects against SQL injection
- ✅ Works with any database client
- ✅ Independent of application logic

### Policy Structure

```sql
CREATE POLICY "policy_name" 
ON table_name
FOR operation (SELECT, INSERT, UPDATE, DELETE, ALL)
USING (condition for existing rows)
WITH CHECK (condition for new/updated rows);
```

### Students Table Policies

**File**: `supabase/migrations/20250827004659_81f0ccd9-5e1f-408b-9a08-8273a6da1185.sql`

#### Policy 1: Students Can View Own Profile

```sql
CREATE POLICY "Students can view their own profile" 
ON public.students
FOR SELECT 
USING (auth.uid() = user_id);
```

**Explanation**:
- Operation: SELECT (read)
- Condition: Current user's ID (`auth.uid()`) matches the student's `user_id`
- Effect: Students can only SELECT rows where they are the subject
- Example: Student A can view student A's record, but not student B's

#### Policy 2: Students Can Update Own Profile

```sql
CREATE POLICY "Students can update their own profile" 
ON public.students
FOR UPDATE 
USING (auth.uid() = user_id);
```

**Explanation**:
- Operation: UPDATE (modify)
- Condition: Same as above
- Effect: Students can only UPDATE their own record
- Prevents students from modifying other students' data

#### Policy 3: Admins Can Manage All Students

```sql
CREATE POLICY "Admins can view all students" 
ON public.students
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.admins 
        WHERE user_id = auth.uid()
    )
);
```

**Explanation**:
- Operation: ALL (SELECT, INSERT, UPDATE, DELETE)
- Condition: User exists in `admins` table
- Effect: If authenticated user is an admin, they can perform all operations
- Uses subquery to verify admin status

### Results Table Policies

#### Policy 1: Students Can View Own Results

```sql
CREATE POLICY "Students can view their own results" 
ON public.results
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.students 
        WHERE id = results.student_id 
        AND user_id = auth.uid()
    )
);
```

**Explanation**:
- Operation: SELECT
- Condition: Checks if current user owns the student record linked to this result
- Effect: Students can only view results where `student_id` matches their student record
- Joins to students table to verify ownership

#### Policy 2: Admins Can Manage All Results

```sql
CREATE POLICY "Admins can manage all results" 
ON public.results
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.admins 
        WHERE user_id = auth.uid()
    )
);
```

**Explanation**:
- Operation: ALL
- Condition: User is an admin
- Effect: Admins can view, create, update, and delete any result
- No student_id restriction for admins

### Admins Table Policies

**File**: `supabase/migrations/20251015003418_restrict_admin_table_access.sql`

These policies are more restrictive to protect admin information.

#### Policy 1: Only Admins Can View Admin Records

```sql
CREATE POLICY "Only admins can view admin records" 
ON public.admins
FOR SELECT 
USING (
    auth.uid() IN (SELECT user_id FROM public.admins)
);
```

**Explanation**:
- Operation: SELECT
- Condition: User must be in admins table
- Effect: Students cannot query admin table at all
- Prevents admin email harvesting

#### Policy 2: Admins Can Update Own Profile

```sql
CREATE POLICY "Admins can update their own profile" 
ON public.admins
FOR UPDATE 
USING (
    auth.uid() = user_id 
    AND auth.uid() IN (SELECT user_id FROM public.admins)
);
```

**Explanation**:
- Operation: UPDATE
- Condition: Double verification (own record AND is admin)
- Effect: Admins can only update their own profile
- Prevents privilege escalation

#### Policy 3: Deny Admin Creation

```sql
CREATE POLICY "Deny admin insert for regular users" 
ON public.admins
FOR INSERT 
WITH CHECK (false);
```

**Explanation**:
- Operation: INSERT
- Condition: `false` (always denies)
- Effect: No one can create admin via normal auth
- Only service role can bypass this
- Prevents unauthorized admin creation

#### Policy 4: Deny Admin Deletion

```sql
CREATE POLICY "Deny admin deletion for regular users" 
ON public.admins
FOR DELETE 
USING (false);
```

**Explanation**:
- Operation: DELETE
- Condition: `false` (always denies)
- Effect: No one can delete admins via normal auth
- Only service role can bypass this
- Prevents accidental admin deletion

### Courses Table Policies

#### Policy 1: Everyone Can View Courses

```sql
CREATE POLICY "Everyone can view courses" 
ON public.courses
FOR SELECT 
USING (true);
```

**Explanation**:
- Operation: SELECT
- Condition: `true` (always allows)
- Effect: All authenticated users can view course catalog
- Necessary for students to see available courses

#### Policy 2: Admins Can Manage Courses

```sql
CREATE POLICY "Admins can manage courses" 
ON public.courses
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.admins 
        WHERE user_id = auth.uid()
    )
);
```

**Explanation**:
- Operation: ALL (except SELECT, which is handled by policy 1)
- Condition: User is admin
- Effect: Only admins can create, update, delete courses

### Fee Payments Table Policies

#### Policy 1: Students View Own Fee Status

```sql
CREATE POLICY "Students can view their own fee status" 
ON public.fee_payments
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.students 
        WHERE id = fee_payments.student_id 
        AND user_id = auth.uid()
    )
);
```

**Explanation**:
- Operation: SELECT
- Condition: Student owns the fee payment record
- Effect: Students can only see their own fee status
- Cannot see other students' payment information

#### Policy 2: Admins Manage All Fee Payments

```sql
CREATE POLICY "Admins can manage all fee payments" 
ON public.fee_payments
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.admins 
        WHERE user_id = auth.uid()
    )
);
```

**Explanation**:
- Operation: ALL
- Condition: User is admin
- Effect: Admins can view and update all fee payments

### Announcements Table Policies

#### Policy 1: Students View Relevant Announcements

```sql
CREATE POLICY "Students can view relevant announcements" 
ON public.announcements
FOR SELECT 
USING (
    is_general = true 
    OR target_level = (
        SELECT level FROM public.students 
        WHERE user_id = auth.uid()
    )
);
```

**Explanation**:
- Operation: SELECT
- Condition: Announcement is general OR targeted to student's level
- Effect: Students see all general announcements + level-specific ones
- Smart filtering based on student level

#### Policy 2: Admins Manage Announcements

```sql
CREATE POLICY "Admins can manage announcements" 
ON public.announcements
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.admins 
        WHERE user_id = auth.uid()
    )
);
```

**Explanation**:
- Operation: ALL
- Condition: User is admin
- Effect: Admins can create, view, update, delete announcements

### Carryovers Table Policies

**File**: `supabase/migrations/20251022135000_add_carryovers_table.sql`

#### Policy 1: Students View Own Carryovers

```sql
CREATE POLICY "Students can view their own carryovers" 
ON public.carryovers
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.students 
        WHERE id = carryovers.student_id 
        AND user_id = auth.uid()
    )
);
```

**Explanation**:
- Operation: SELECT
- Condition: Student owns the carryover record
- Effect: Students can only see their own failed courses

#### Policy 2: Admins Manage All Carryovers

```sql
CREATE POLICY "Admins can manage all carryovers" 
ON public.carryovers
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.admins 
        WHERE user_id = auth.uid()
    )
);
```

**Explanation**:
- Operation: ALL
- Condition: User is admin
- Effect: Admins can view and manage all carryover records

### Audit Logs Policies

**File**: `supabase/migrations/20251022135100_add_audit_and_security_tables.sql`

#### Policy 1: Admins Can View Audit Logs

```sql
CREATE POLICY "Admins can view audit logs" 
ON public.audit_logs
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.admins 
        WHERE user_id = auth.uid()
    )
);
```

**Explanation**:
- Operation: SELECT
- Condition: User is admin
- Effect: Only admins can view audit trail
- Students cannot see admin activities

#### Policy 2: Admins Can Insert Audit Logs

```sql
CREATE POLICY "Admins can insert audit logs" 
ON public.audit_logs
FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.admins 
        WHERE user_id = auth.uid() 
        AND id = admin_id
    )
);
```

**Explanation**:
- Operation: INSERT
- Condition: User is admin AND logging their own action
- Effect: Admins can only create logs for themselves
- Prevents impersonation in audit trail

---

## Application-Level Security

### Authentication Guards

#### AuthWrapper Component

**File**: `src/components/AuthWrapper.tsx`

Provides authentication context and ensures user is logged in:

```typescript
export const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    session,
    loading,
    signOut: () => supabase.auth.signOut(),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
```

**Usage in Components**:

```typescript
const SomeProtectedComponent = () => {
  const { user, session, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user || !session) {
    navigate("/auth?mode=login");
    return null;
  }

  // Component logic for authenticated users
  return <div>Protected content</div>;
};
```

### Role Verification

#### Student-Only Components

```typescript
const StudentResults = () => {
  const { user, session } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);

  useEffect(() => {
    const loadStudent = async () => {
      if (!user) {
        navigate("/auth");
        return;
      }

      // Verify user is a student
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error || !data) {
        // User is not a student - deny access
        toast({
          title: "Access Denied",
          description: "You don't have permission to view this page",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setStudent(data);
    };

    loadStudent();
  }, [user]);

  // Rest of component
};
```

#### Admin-Only Components

```typescript
const AdminDashboard = () => {
  const { user, session } = useAuth();
  const [admin, setAdmin] = useState<Admin | null>(null);

  useEffect(() => {
    const verifyAdmin = async () => {
      if (!user) {
        navigate("/admin/login");
        return;
      }

      // Verify user is an admin
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error || !data) {
        // User is not an admin - deny access
        await supabase.auth.signOut();
        toast({
          title: "Access Denied",
          description: "You are not authorized to access the admin panel",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setAdmin(data);
    };

    verifyAdmin();
  }, [user]);

  // Rest of component
};
```

### Data Access Patterns

#### Student Accessing Own Data

```typescript
// Student viewing their own results
const loadStudentResults = async () => {
  const { data: student } = await supabase
    .from('students')
    .select('id')
    .eq('user_id', user.id)
    .single();

  // This query is automatically scoped by RLS
  // Student can only see their own results
  const { data: results } = await supabase
    .from('results')
    .select(`
      *,
      course:courses(*)
    `)
    .eq('student_id', student.id)
    .eq('session', selectedSession);

  // RLS ensures results are filtered to this student only
  return results;
};
```

#### Admin Accessing All Data

```typescript
// Admin viewing all students' results
const loadAllResults = async () => {
  // Verify admin status first
  const { data: admin } = await supabase
    .from('admins')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!admin) {
    throw new Error("Not authorized");
  }

  // This query returns all results because user is admin
  // RLS policy allows admins to see all
  const { data: results } = await supabase
    .from('results')
    .select(`
      *,
      student:students(*),
      course:courses(*)
    `)
    .order('created_at', { ascending: false });

  // RLS grants access to all results for admins
  return results;
};
```

### UI-Level Restrictions

#### Conditional Rendering Based on Role

```typescript
const Sidebar = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isStudent, setIsStudent] = useState(false);

  useEffect(() => {
    const checkRole = async () => {
      // Check if user is admin
      const { data: adminData } = await supabase
        .from('admins')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (adminData) {
        setIsAdmin(true);
        return;
      }

      // Check if user is student
      const { data: studentData } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (studentData) {
        setIsStudent(true);
      }
    };

    if (user) {
      checkRole();
    }
  }, [user]);

  return (
    <div>
      {isStudent && (
        <>
          <SidebarItem to="/dashboard">Dashboard</SidebarItem>
          <SidebarItem to="/results">My Results</SidebarItem>
          <SidebarItem to="/profile">Profile</SidebarItem>
        </>
      )}
      
      {isAdmin && (
        <>
          <SidebarItem to="/admin/dashboard">Dashboard</SidebarItem>
          <SidebarItem to="/admin/students">Manage Students</SidebarItem>
          <SidebarItem to="/admin/results">Upload Results</SidebarItem>
          <SidebarItem to="/admin/announcements">Announcements</SidebarItem>
        </>
      )}
    </div>
  );
};
```

**Important**: UI restrictions are for user experience only. They do NOT provide security. All security must be enforced at the database and API level.

---

## Testing RBAC

### Manual Testing Procedures

#### Test 1: Student Cannot Access Other Students' Data

```typescript
// As Student A (logged in)
const testUnauthorizedAccess = async () => {
  // Get Student A's ID
  const { data: studentA } = await supabase
    .from('students')
    .select('id')
    .eq('user_id', auth.uid())
    .single();

  // Try to access Student B's results (different student_id)
  const studentBId = 'some-other-student-uuid';
  
  const { data: results, error } = await supabase
    .from('results')
    .select('*')
    .eq('student_id', studentBId);

  // Expected: data should be empty array or null
  // Expected: No error, but no results returned due to RLS
  console.log('Results:', results); // Should be [] or null
  console.log('Can access other student data:', results && results.length > 0); // Should be false
};
```

#### Test 2: Student Cannot Modify Results

```typescript
// As Student (logged in)
const testUnauthorizedModification = async () => {
  const resultId = 'some-result-uuid';
  
  // Try to update a result
  const { error } = await supabase
    .from('results')
    .update({ exam_score: 100 })
    .eq('id', resultId);

  // Expected: error should be present (permission denied)
  console.log('Can modify results:', !error); // Should be false
  console.log('Error:', error); // Should show permission error
};
```

#### Test 3: Admin Can Access All Students

```typescript
// As Admin (logged in)
const testAdminAccess = async () => {
  // Try to fetch all students
  const { data: students, error } = await supabase
    .from('students')
    .select('*');

  // Expected: Should return all students
  console.log('Number of students:', students?.length); // Should be > 0
  console.log('Can access all students:', !error); // Should be true
};
```

#### Test 4: Student Cannot View Admin Table

```typescript
// As Student (logged in)
const testStudentCannotViewAdmins = async () => {
  const { data: admins, error } = await supabase
    .from('admins')
    .select('*');

  // Expected: data should be empty due to RLS
  console.log('Admins visible to student:', admins); // Should be [] or null
  console.log('Can view admins:', admins && admins.length > 0); // Should be false
};
```

### Automated Testing

#### Test Suite Example

```typescript
describe('RBAC Tests', () => {
  describe('Student Access', () => {
    it('should allow student to view own results', async () => {
      const { data, error } = await studentClient
        .from('results')
        .select('*')
        .eq('student_id', studentId);

      expect(error).toBeNull();
      expect(data).not.toBeNull();
      expect(data.length).toBeGreaterThan(0);
    });

    it('should prevent student from viewing other students results', async () => {
      const { data, error } = await studentClient
        .from('results')
        .select('*')
        .eq('student_id', otherStudentId);

      expect(data).toEqual([]);
    });

    it('should prevent student from modifying results', async () => {
      const { error } = await studentClient
        .from('results')
        .update({ exam_score: 100 })
        .eq('id', resultId);

      expect(error).not.toBeNull();
    });

    it('should prevent student from viewing admin table', async () => {
      const { data } = await studentClient
        .from('admins')
        .select('*');

      expect(data).toEqual([]);
    });
  });

  describe('Admin Access', () => {
    it('should allow admin to view all students', async () => {
      const { data, error } = await adminClient
        .from('students')
        .select('*');

      expect(error).toBeNull();
      expect(data).not.toBeNull();
    });

    it('should allow admin to create results', async () => {
      const { error } = await adminClient
        .from('results')
        .insert({
          student_id: studentId,
          course_id: courseId,
          session: '2024/2025',
          ca_score: 25,
          exam_score: 65,
        });

      expect(error).toBeNull();
    });

    it('should allow admin to update students', async () => {
      const { error } = await adminClient
        .from('students')
        .update({ phone: '1234567890' })
        .eq('id', studentId);

      expect(error).toBeNull();
    });
  });
});
```

---

## Security Considerations

### Common Vulnerabilities & Mitigations

#### 1. **Privilege Escalation**

**Risk**: User tries to elevate their permissions

**Mitigation**:
- ✅ RLS policies prevent unauthorized access
- ✅ Admin creation restricted to service role only
- ✅ Double verification in admin update policies
- ✅ No client-side role assignment

#### 2. **Horizontal Privilege Escalation**

**Risk**: Student A tries to access Student B's data

**Mitigation**:
- ✅ RLS policies enforce student_id scoping
- ✅ All queries automatically filtered by auth.uid()
- ✅ Cannot bypass using direct SQL
- ✅ Subqueries verify ownership

#### 3. **SQL Injection**

**Risk**: Malicious SQL in user input

**Mitigation**:
- ✅ Supabase uses parameterized queries
- ✅ All inputs sanitized by Supabase client
- ✅ TypeScript provides type safety
- ✅ Database constraints validate data

#### 4. **Session Hijacking**

**Risk**: Attacker steals user session

**Mitigation**:
- ✅ HTTPS enforced in production
- ✅ HttpOnly cookies
- ✅ Secure flag on cookies
- ✅ SameSite=Strict
- ✅ JWT tokens with expiration
- ✅ Automatic token refresh

#### 5. **Information Disclosure**

**Risk**: Sensitive data exposed to unauthorized users

**Mitigation**:
- ✅ RLS prevents data leakage
- ✅ Admin email addresses protected
- ✅ PIN hashes never exposed
- ✅ Error messages don't reveal system details

### Best Practices

1. **Always Assume Client is Compromised**
   - Never trust frontend security
   - Always validate on backend
   - Enforce RLS at database level

2. **Defense in Depth**
   - Multiple security layers
   - Database, API, and UI restrictions
   - Fail securely (deny by default)

3. **Principle of Least Privilege**
   - Grant minimum necessary permissions
   - Students only see own data
   - Admins only have needed privileges

4. **Regular Security Audits**
   - Review RLS policies periodically
   - Test authorization regularly
   - Monitor audit logs

5. **Secure Development Practices**
   - Never hardcode credentials
   - Use environment variables
   - Keep dependencies updated
   - Follow OWASP guidelines

---

## Conclusion

The RBAC implementation in SRMS provides:

1. ✅ **Strong Access Control** - Database-level enforcement via RLS
2. ✅ **Role Separation** - Clear distinction between students and admins
3. ✅ **Defense in Depth** - Multiple security layers
4. ✅ **Audit Trail** - All actions logged for compliance
5. ✅ **Scalability** - Easy to extend with new roles
6. ✅ **Compliance** - Meets FERPA and data protection standards

The system ensures that:
- Students can only access their own data
- Admins have necessary privileges for management
- Unauthorized access is prevented at all levels
- Security cannot be bypassed by clever clients
- All access is logged and auditable

This comprehensive RBAC implementation provides a secure foundation for the Student Result Management System.
