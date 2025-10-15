# Admin Account Setup Guide

This guide explains how to create a real admin user in Supabase Cloud for the Plateau State Polytechnic Result Hub.

## Overview

The admin account is created using Supabase's authentication system. This ensures that:
- The admin user is a real authenticated user in Supabase Cloud
- Password security is handled by Supabase
- Admin sessions are properly managed
- Admin can access all administrative features

## Prerequisites

Before setting up the admin account, you need:

1. **Supabase Project Access**: Access to your Supabase project dashboard
2. **Service Role Key**: Your Supabase service role key (not the anon key)

## Getting Your Service Role Key

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/xglnamczjtdzsblkelhz
2. Navigate to **Settings** → **API**
3. Find the **service_role** key in the **Project API keys** section
4. Copy this key (it starts with `eyJ...`)

⚠️ **IMPORTANT**: Keep this key secure! Never commit it to version control or share it publicly.

## Method 1: Using the Setup Script (Recommended)

The easiest way to create the admin account is using our automated script.

### Steps:

1. **Set the environment variable** for the service role key:

   ```bash
   # On Linux/Mac:
   export SUPABASE_SERVICE_ROLE_KEY="your_service_role_key_here"
   
   # On Windows (Command Prompt):
   set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   
   # On Windows (PowerShell):
   $env:SUPABASE_SERVICE_ROLE_KEY="your_service_role_key_here"
   ```

2. **Run the setup script**:

   ```bash
   npm run setup-admin
   ```

3. **Wait for confirmation**:
   The script will output the admin credentials and confirm successful setup:
   ```
   🎉 Admin user successfully created in Supabase Cloud!
   
   🔑 Login Credentials:
      Email: admin@plasu.edu.ng
      Password: Admin123456
   ```

4. **Login to test**:
   - Navigate to the admin login page
   - Use the credentials shown above
   - You should be able to access the admin dashboard

## Method 2: Manual Setup via Supabase Dashboard

If you prefer to set up the admin manually:

### Step 1: Create Auth User

1. Go to your Supabase dashboard
2. Navigate to **Authentication** → **Users**
3. Click **Add user** → **Create new user**
4. Fill in:
   - **Email**: `admin@plasu.edu.ng`
   - **Password**: `Admin123456` (or your preferred password)
   - Check **Auto Confirm User** 
5. Click **Create user**
6. Copy the user's UUID (you'll need this in the next step)

### Step 2: Add Admin Record

1. Navigate to **Table Editor** → **admins** table
2. Click **Insert** → **Insert row**
3. Fill in:
   - **user_id**: Paste the UUID from Step 1
   - **email**: `admin@plasu.edu.ng`
   - **first_name**: `System`
   - **last_name**: `Administrator`
   - **staff_id**: `ADMIN001`
   - **department**: `Computer Science`
   - **role**: `Super Admin`
4. Click **Save**

### Step 3: Verify Setup

1. Go to the admin login page of your application
2. Login with:
   - Email: `admin@plasu.edu.ng`
   - Password: The password you set in Step 1
3. You should be able to access the admin dashboard

## Default Admin Credentials

After setup, the default admin credentials are:

- **Email**: `admin@plasu.edu.ng`
- **Password**: `Admin123456`
- **Name**: System Administrator
- **Staff ID**: ADMIN001
- **Department**: Computer Science

⚠️ **IMPORTANT**: Change the default password after first login!

## Changing the Admin Password

### Via Supabase Dashboard:

1. Go to **Authentication** → **Users**
2. Find the admin user (`admin@plasu.edu.ng`)
3. Click on the user
4. Click **Reset Password** or use **Send Magic Link**

### Programmatically:

You can also use Supabase's password reset flow:
1. Navigate to the admin login page
2. Click "Forgot Password" (if implemented)
3. Follow the reset instructions

## Troubleshooting

### Error: "Missing required environment variables"

**Solution**: Make sure you've set the `SUPABASE_SERVICE_ROLE_KEY` environment variable before running the script.

### Error: "Admin user already exists"

**Solution**: This is normal if you've already run the setup. The script will skip creating duplicate users.

### Error: "You are not authorized to access the admin panel"

**Possible causes**:
1. The admin record wasn't created in the `admins` table
2. The email doesn't match between auth.users and public.admins
3. RLS policies are blocking access

**Solution**: 
- Check that the admin record exists in the `admins` table
- Verify the `user_id` matches the auth user's UUID
- Check the migration was applied: `20251014020900_setup_real_admin.sql`

### Can't login after setup

**Solution**:
1. Verify the auth user was created:
   - Go to **Authentication** → **Users** in Supabase dashboard
   - Look for `admin@plasu.edu.ng`

2. Verify the admin record exists:
   - Go to **Table Editor** → **admins**
   - Look for the admin email
   - Check that `user_id` is not null

3. Check browser console for errors
4. Try clearing browser cache/cookies

## Database Migrations

The following migration files set up the admin infrastructure:

1. `20251014014856_533ae60a-d728-43cb-a7d6-cc59b8450ba6.sql` - Creates the base tables
2. `20251014020900_setup_real_admin.sql` - Sets up admin permissions and policies
3. `20251015003418_restrict_admin_table_access.sql` - **Security fix**: Adds restrictive RLS policies to prevent non-admin users from accessing admin records

Make sure these migrations have been applied to your Supabase project.

**Security Note**: The latest migration adds comprehensive Row Level Security (RLS) policies to prevent students and other non-admin users from accessing admin contact information. See [docs/SECURITY_FIX_ADMIN_RLS.md](docs/SECURITY_FIX_ADMIN_RLS.md) for details.

## Security Best Practices

1. **Change the default password** immediately after first login
2. **Never commit** the service role key to version control
3. **Use strong passwords** for admin accounts
4. **Limit admin access** to authorized personnel only
5. **Monitor admin activity** through Supabase logs
6. **Enable MFA** (Multi-Factor Authentication) for admin accounts when available
7. **RLS Policies**: The admins table is protected with restrictive Row Level Security policies that prevent non-admin users from accessing admin data. See [SECURITY_FIX_ADMIN_RLS.md](docs/SECURITY_FIX_ADMIN_RLS.md) for details.

## Adding Additional Admins

To add more admin users:

1. Create a new auth user in Supabase (see Method 2, Step 1)
2. Add their record to the `admins` table (see Method 2, Step 2)
3. Provide them with their credentials securely

Or modify the `scripts/create-admin.js` script to create additional admins.

## Support

If you encounter issues:

1. Check the Supabase logs in your dashboard
2. Verify all migrations have been applied
3. Check that RLS policies allow admin access
4. Review the browser console for error messages

For more help, contact the development team or check the main README.md file.
