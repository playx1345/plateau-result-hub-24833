# Security Fix: Restrictive RLS Policies for Admins Table

## Issue
The `admins` table had Row Level Security (RLS) enabled but lacked proper restrictive policies to prevent non-admin users from accessing admin records. While policies existed for admins to view their own data, there was no explicit policy blocking other authenticated users (like students) from potentially querying the admins table.

### Security Risk
Without restrictive SELECT policies, students or other authenticated users could potentially:
- Query the admins table to harvest administrator email addresses
- Use admin contact information for phishing attacks
- Conduct social engineering attacks
- Gather information about system administrators

## Solution
Created migration `20251015003418_restrict_admin_table_access.sql` that implements comprehensive RLS policies for the admins table:

### 1. SELECT Policy - "Only admins can view admin records"
```sql
CREATE POLICY "Only admins can view admin records"
ON public.admins FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.admins WHERE user_id = auth.uid()
  )
);
```

**Effect**: Only users whose `auth.uid()` exists in the `admins.user_id` column can view admin records. This completely blocks students and non-admin users from accessing admin data.

### 2. UPDATE Policy - "Admins can update their own profile"
```sql
CREATE POLICY "Admins can update their own profile"
ON public.admins FOR UPDATE
USING (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.admins WHERE user_id = auth.uid()
  )
);
```

**Effect**: Double verification - checks both that the user_id matches AND that the user is an admin. More restrictive than previous policies.

### 3. INSERT Policy - "Deny admin insert for regular users"
```sql
CREATE POLICY "Deny admin insert for regular users"
ON public.admins FOR INSERT
WITH CHECK (false);
```

**Effect**: Prevents regular users from creating admin records. The service role key (used by `scripts/create-admin.js`) bypasses RLS policies, so legitimate admin creation still works.

### 4. DELETE Policy - "Deny admin deletion for regular users"
```sql
CREATE POLICY "Deny admin deletion for regular users"
ON public.admins FOR DELETE
USING (false);
```

**Effect**: Prevents regular users from deleting admin records. Only the service role can delete admins if needed.

## Policies Removed
The migration drops and replaces these overly permissive policies:
- "Admins can view their own profile" (from `20250827004659_...sql`)
- "Admins can view their own data" (from `20251014014856_...sql`)
- "Admins can update their own profile" (replaced with more restrictive version)

## Impact on Application

### No Breaking Changes
All legitimate application functionality continues to work:

1. **Admin Dashboard** (`src/pages/AdminDashboard.tsx`): 
   - Queries own admin record with `.eq('user_id', user.id)` ✅
   
2. **Admin Login** (`src/pages/AdminLogin.tsx`):
   - Queries by email to verify admin status ✅
   
3. **Admin Features** (`AdminAnnouncements.tsx`, `AdminFeeManagement.tsx`):
   - Query own admin records ✅

4. **Admin Creation** (`scripts/create-admin.js`):
   - Uses service role key which bypasses RLS ✅

### Expected Behavior Changes

1. **Student Users**: 
   - ❌ Cannot query `admins` table (previously might have been able to)
   - ❌ Cannot view admin email addresses or contact information
   - ✅ This is the desired security improvement

2. **AdminSetup/DemoSetup Pages** (`src/pages/AdminSetup.tsx`, `src/pages/DemoSetup.tsx`):
   - ❌ INSERT operations will be blocked for regular users
   - ℹ️ These pages use the anon key and shouldn't be used in production
   - ✅ Use `scripts/create-admin.js` with service role key instead

## Testing the Fix

### Test 1: Admin Can View Their Own Record
```javascript
// As an authenticated admin user
const { data, error } = await supabase
  .from('admins')
  .select('*')
  .eq('user_id', auth.uid())
  .single();

// Expected: Success, returns admin record
```

### Test 2: Student Cannot View Admin Records
```javascript
// As an authenticated student user
const { data, error } = await supabase
  .from('admins')
  .select('*');

// Expected: Error or empty result, no admin records returned
```

### Test 3: Admin Creation via Service Role
```bash
# Set environment variables
export SUPABASE_URL="your-project-url"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Run admin creation script
npm run setup-admin

# Expected: Success, admin created in both auth.users and public.admins
```

## Deployment

### Migration Order
This migration (`20251015003418_*`) should be run after:
- `20250827004659_*` (initial schema)
- `20251014014856_*` (admin setup)
- `20251014020900_*` (real admin setup)

### Steps
1. Backup your database
2. Run the migration through Supabase dashboard or CLI
3. Verify policies with: `SELECT * FROM pg_policies WHERE tablename = 'admins';`
4. Test admin login and dashboard access
5. Verify students cannot query admins table

## Security Best Practices

This fix follows the principle of **least privilege**:
- ✅ Only grant access to those who need it
- ✅ Explicitly deny access by default
- ✅ Double-check permissions with multiple conditions
- ✅ Use service role only for trusted operations
- ✅ Prevent privilege escalation

## Related Documentation
- [ADMIN_FLOW.md](./ADMIN_FLOW.md) - Admin authentication flow
- [ADMIN_SETUP.md](../ADMIN_SETUP.md) - Admin setup guide
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
