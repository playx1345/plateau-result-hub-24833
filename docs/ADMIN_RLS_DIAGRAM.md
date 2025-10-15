# Admin RLS Security Architecture

## Before the Fix ❌

```
┌─────────────────────────────────────────────────────────────┐
│                     SUPABASE DATABASE                        │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              public.admins table                      │  │
│  │              RLS: ENABLED ⚠️                          │  │
│  │                                                       │  │
│  │  Policies:                                            │  │
│  │  ✓ "Admins can view their own profile"               │  │
│  │  ✓ "Admins can update their own profile"             │  │
│  │                                                       │  │
│  │  ⚠️  NO EXPLICIT DENIAL POLICY                       │  │
│  │  ⚠️  NO POLICY BLOCKING NON-ADMINS                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘

         ↓                                    ↓
         
┌──────────────────┐              ┌──────────────────┐
│  Student User    │              │   Admin User     │
│                  │              │                  │
│  Auth Token ✓    │              │  Auth Token ✓    │
│                  │              │                  │
│  SELECT *        │              │  SELECT *        │
│  FROM admins     │              │  FROM admins     │
│                  │              │  WHERE user_id=  │
│  ⚠️ MIGHT WORK!  │              │     auth.uid()   │
│  (Security Gap)  │              │                  │
│                  │              │  ✅ WORKS        │
└──────────────────┘              └──────────────────┘
```

### Security Issue
- Only positive policies (admin can view own data)
- No explicit denial for non-admins
- Potential for unauthorized access
- Students might query admin emails

---

## After the Fix ✅

```
┌─────────────────────────────────────────────────────────────┐
│                     SUPABASE DATABASE                        │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              public.admins table                      │  │
│  │              RLS: ENABLED ✅                          │  │
│  │                                                       │  │
│  │  Policies:                                            │  │
│  │  ✅ SELECT: "Only admins can view admin records"     │  │
│  │     → EXISTS (SELECT 1 FROM admins                   │  │
│  │              WHERE user_id = auth.uid())             │  │
│  │                                                       │  │
│  │  ✅ UPDATE: "Admins can update their own profile"    │  │
│  │     → auth.uid() = user_id AND admin check           │  │
│  │                                                       │  │
│  │  ✅ INSERT: "Deny admin insert for regular users"    │  │
│  │     → WITH CHECK (false)                             │  │
│  │                                                       │  │
│  │  ✅ DELETE: "Deny admin deletion for regular users"  │  │
│  │     → USING (false)                                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘

         ↓                                    ↓
         
┌──────────────────┐              ┌──────────────────┐
│  Student User    │              │   Admin User     │
│                  │              │                  │
│  Auth Token ✓    │              │  Auth Token ✓    │
│                  │              │  (in admins tbl) │
│  SELECT *        │              │                  │
│  FROM admins     │              │  SELECT *        │
│                  │              │  FROM admins     │
│  ❌ BLOCKED!     │              │  WHERE user_id=  │
│  (Access Denied) │              │     auth.uid()   │
│                  │              │                  │
│  Error: Policy   │              │  ✅ WORKS        │
│  violation       │              │                  │
└──────────────────┘              └──────────────────┘
```

### Security Improvement
- Explicit policy checking admin status
- Non-admins completely blocked
- INSERT/DELETE denied for regular users
- Defense in depth with multiple checks

---

## Policy Evaluation Flow

### When a Student Queries `admins` Table

```
1. Student makes query:
   ┌──────────────────────────────────────┐
   │ SELECT * FROM admins                 │
   └──────────────────────────────────────┘
                  ↓
2. PostgreSQL checks RLS:
   ┌──────────────────────────────────────┐
   │ Is RLS enabled on admins table?      │
   │ → YES ✓                              │
   └──────────────────────────────────────┘
                  ↓
3. Evaluate SELECT policy:
   ┌──────────────────────────────────────┐
   │ Policy: "Only admins can view..."    │
   │ Condition: EXISTS (                  │
   │   SELECT 1 FROM admins               │
   │   WHERE user_id = auth.uid()         │
   │ )                                    │
   └──────────────────────────────────────┘
                  ↓
4. Check student's auth.uid():
   ┌──────────────────────────────────────┐
   │ auth.uid() = "student-uuid-123"      │
   │ Check: Does this exist in            │
   │        admins.user_id?               │
   │ → NO ❌                              │
   └──────────────────────────────────────┘
                  ↓
5. Result:
   ┌──────────────────────────────────────┐
   │ ❌ POLICY VIOLATION                  │
   │ Return: Empty result or error        │
   │ Student cannot see admin records     │
   └──────────────────────────────────────┘
```

### When an Admin Queries Their Own Record

```
1. Admin makes query:
   ┌──────────────────────────────────────┐
   │ SELECT * FROM admins                 │
   │ WHERE user_id = auth.uid()           │
   └──────────────────────────────────────┘
                  ↓
2. PostgreSQL checks RLS:
   ┌──────────────────────────────────────┐
   │ Is RLS enabled on admins table?      │
   │ → YES ✓                              │
   └──────────────────────────────────────┘
                  ↓
3. Evaluate SELECT policy:
   ┌──────────────────────────────────────┐
   │ Policy: "Only admins can view..."    │
   │ Condition: EXISTS (                  │
   │   SELECT 1 FROM admins               │
   │   WHERE user_id = auth.uid()         │
   │ )                                    │
   └──────────────────────────────────────┘
                  ↓
4. Check admin's auth.uid():
   ┌──────────────────────────────────────┐
   │ auth.uid() = "admin-uuid-456"        │
   │ Check: Does this exist in            │
   │        admins.user_id?               │
   │ → YES ✓                              │
   └──────────────────────────────────────┘
                  ↓
5. Result:
   ┌──────────────────────────────────────┐
   │ ✅ POLICY PASSED                     │
   │ Return: Admin's own record           │
   │ Admin can see their data             │
   └──────────────────────────────────────┘
```

---

## Service Role Bypass

### Admin Creation with Service Role

```
┌────────────────────────────────────────────────────┐
│  scripts/create-admin.js                           │
│                                                    │
│  Uses: SUPABASE_SERVICE_ROLE_KEY                  │
│        (Special key that bypasses RLS)            │
└────────────────────────────────────────────────────┘
                      ↓
┌────────────────────────────────────────────────────┐
│  1. Create auth user                               │
│     supabase.auth.admin.createUser()               │
│     → Returns user.id                              │
└────────────────────────────────────────────────────┘
                      ↓
┌────────────────────────────────────────────────────┐
│  2. Insert into admins table                       │
│     INSERT INTO admins (user_id, ...)              │
│                                                    │
│     🔓 Service role BYPASSES RLS                   │
│     ✅ INSERT policy ignored                       │
│     ✅ Admin record created successfully           │
└────────────────────────────────────────────────────┘
```

**Note**: Service role key has superuser privileges and bypasses ALL RLS policies. This is why the INSERT policy with `WITH CHECK (false)` doesn't block legitimate admin creation.

---

## Security Layers

```
┌─────────────────────────────────────────────────────────┐
│                    Layer 1: Authentication              │
│  • Supabase Auth validates JWT tokens                  │
│  • Ensures user is authenticated                       │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│                    Layer 2: RLS Policies                │
│  • PostgreSQL evaluates policies on every query        │
│  • Checks if user has permission                       │
│  • Enforces data access rules                          │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│                    Layer 3: Admin Check                 │
│  • Verifies user exists in admins table                │
│  • Confirms admin status before granting access        │
│  • Double verification for critical operations         │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│                    Layer 4: Data Access                 │
│  • User can only access permitted data                 │
│  • Admins: See admin records                           │
│  • Students: Blocked from admin table                  │
└─────────────────────────────────────────────────────────┘
```

---

## Threat Model

### Threat: Student Harvesting Admin Emails

**Before Fix:**
```
Student → Query admins → Might succeed → Get emails → Phishing
```

**After Fix:**
```
Student → Query admins → RLS blocks → Access denied → Safe ✅
```

### Threat: Privilege Escalation

**Before Fix:**
```
User → Insert self into admins → Might work → Gain admin → Bad!
```

**After Fix:**
```
User → Insert into admins → RLS blocks → INSERT denied → Safe ✅
```

### Threat: Unauthorized Admin Deletion

**Before Fix:**
```
Attacker → Delete admin record → Might work → Admin removed → Bad!
```

**After Fix:**
```
Attacker → Delete admin → RLS blocks → DELETE denied → Safe ✅
```

---

## Summary

| Aspect | Before | After |
|--------|--------|-------|
| **SELECT Access** | ⚠️ Unclear | ✅ Admin-only |
| **INSERT Access** | ⚠️ Unclear | ✅ Denied |
| **DELETE Access** | ⚠️ Unclear | ✅ Denied |
| **Update Access** | ⚠️ Basic | ✅ Restricted |
| **Student Access** | ⚠️ Possible | ❌ Blocked |
| **Admin Access** | ✅ Own data | ✅ All admin data |
| **Service Role** | ✅ Full access | ✅ Full access |

**Result**: Comprehensive RLS protection with defense in depth!
