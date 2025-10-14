# Admin Authentication Flow

This document explains how admin authentication works in the system.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE CLOUD                            │
│                                                              │
│  ┌───────────────────┐         ┌──────────────────┐        │
│  │   auth.users      │         │  public.admins   │        │
│  │                   │         │                  │        │
│  │  - id (UUID)      │◄───────►│  - user_id (FK)  │        │
│  │  - email          │  Link   │  - email         │        │
│  │  - encrypted_pw   │         │  - first_name    │        │
│  │  - created_at     │         │  - last_name     │        │
│  └───────────────────┘         │  - staff_id      │        │
│                                 │  - department    │        │
│                                 │  - role          │        │
│                                 └──────────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

## Setup Flow

### Complete Admin Creation Process
```
Developer → Set SUPABASE_SERVICE_ROLE_KEY → Run npm run setup-admin
    │
    ▼
create-admin.js Script
    │
    ├─► Step 1: Check if admin exists
    │   └─► Query public.admins table
    │
    ├─► Step 2: Create auth user
    │   └─► POST to Supabase Auth API
    │       └─► Creates record in auth.users
    │           └─► Returns user.id
    │
    ├─► Step 3: Create admin record
    │   └─► INSERT INTO public.admins
    │       └─► Links user_id to auth user
    │
    └─► Step 4: Verify setup
        └─► Query to confirm both records exist
```

## Login Flow

### Authentication Steps
```
1. User enters credentials
   ↓
2. supabase.auth.signInWithPassword()
   ↓
3. Supabase verifies password
   ↓
4. Returns JWT token + session
   ↓
5. Check: Is user in admins table?
   ↓
6. YES: Grant access    NO: Sign out + deny
   ↓
7. Store session data
   ↓
8. Navigate to dashboard
```

## Security Layers

```
Layer 1: Supabase Authentication
  ✓ Password hashing (bcrypt)
  ✓ JWT token generation
  ✓ Session management

Layer 2: Admin Table Verification
  ✓ Check admins table membership
  ✓ Verify user_id link

Layer 3: Row Level Security (RLS)
  ✓ Database-level access control
  ✓ Policies check admin status
  ✓ Automatic enforcement

Layer 4: Frontend Protection
  ✓ Route guards
  ✓ Session validation
  ✓ Automatic redirects
```

## Key Differences: Old vs New

### Old System (Hardcoded)
- ❌ Hardcoded email/password
- ❌ No real authentication
- ❌ Manual session in localStorage
- ❌ No audit trail
- ❌ No password security

### New System (Real Auth)
- ✅ Real Supabase authentication
- ✅ Bcrypt password hashing
- ✅ JWT-based sessions
- ✅ Full audit logs
- ✅ RLS integration
- ✅ Scalable (add more admins easily)

## Access Control with RLS

When an admin queries data:
```
1. Request includes JWT token
   ↓
2. Supabase extracts auth.uid() from token
   ↓
3. RLS policy checks:
   "Does auth.uid() exist in admins table?"
   ↓
4. If YES: Allow query
   If NO: Deny access
```

Example RLS Policy:
```sql
CREATE POLICY "Admins can view all students"
ON public.students FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.admins 
    WHERE user_id = auth.uid()
  )
);
```

## Troubleshooting

### Can't Login?
1. Check if user exists: Supabase → Auth → Users
2. Check if admin record exists: Supabase → Table Editor → admins
3. Verify user_id matches in both tables
4. Check browser console for errors

### "Access Denied"?
1. User authenticated but not in admins table
2. user_id is null in admin record
3. Run setup script again to link accounts

### Session Expires?
1. Check Supabase project settings → Auth → JWT expiry
2. Ensure cookies are enabled
3. Use HTTPS in production

## Related Documentation

- [QUICK_START.md](../QUICK_START.md) - Setup guide
- [ADMIN_SETUP.md](../ADMIN_SETUP.md) - Detailed documentation  
- [IMPLEMENTATION_SUMMARY.md](../IMPLEMENTATION_SUMMARY.md) - Technical details
