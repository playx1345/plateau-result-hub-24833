# Quick Start: Admin Setup

This is a simplified guide to get you started quickly. For detailed information, see [ADMIN_SETUP.md](ADMIN_SETUP.md).

## Step 1: Get Your Service Role Key

1. Open your Supabase dashboard: https://supabase.com/dashboard
2. Select your project (`xglnamczjtdzsblkelhz`)
3. Go to **Settings** → **API**
4. Copy the **service_role** key (not the anon key!)

## Step 2: Set Environment Variable

Choose your operating system:

### Linux/Mac:
```bash
export SUPABASE_SERVICE_ROLE_KEY="your_service_role_key_here"
```

### Windows (Command Prompt):
```cmd
set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Windows (PowerShell):
```powershell
$env:SUPABASE_SERVICE_ROLE_KEY="your_service_role_key_here"
```

## Step 3: Run the Setup Script

```bash
npm run setup-admin
```

Expected output:
```
🚀 Starting admin user creation...

1️⃣  Checking if admin user already exists...
2️⃣  Creating admin auth user...
✅ Auth user created successfully
   User ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   Email: admin@plasu.edu.ng

3️⃣  Creating/updating admin record in database...
✅ Admin record created successfully

4️⃣  Verifying admin setup...
✅ Admin setup verified!

📋 Admin Details:
   Email: admin@plasu.edu.ng
   Name: System Administrator
   Staff ID: ADMIN001
   Department: Computer Science
   User ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

🔑 Login Credentials:
   Email: admin@plasu.edu.ng
   Password: Admin123456

🎉 Admin user successfully created in Supabase Cloud!
```

## Step 4: Login and Test

1. Navigate to your application: http://localhost:5173 (or your deployed URL)
2. Click **"Admin Login"**
3. Enter credentials:
   - **Email**: `admin@plasu.edu.ng`
   - **Password**: `Admin123456`
4. You should now be in the admin dashboard!

## Step 5: Change the Password (Important!)

After first login, change the default password:

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Click on `admin@plasu.edu.ng`
3. Click **Send Password Recovery Email** or **Reset Password**

## Troubleshooting

### "Missing required environment variables"
- You didn't set `SUPABASE_SERVICE_ROLE_KEY`
- Make sure you exported it in the same terminal session

### "Admin user already exists"
- This is normal! The admin was already created
- Just try logging in with the credentials

### "You are not authorized to access the admin panel"
- Check if admin record exists in Supabase Dashboard → Table Editor → admins
- Make sure `user_id` is not null in the admin record
- Verify the migration `20251014020900_setup_real_admin.sql` was applied

### Can't login
1. Check browser console for errors (F12)
2. Verify user exists: Supabase Dashboard → Authentication → Users
3. Try resetting password from Supabase Dashboard
4. Check that the email matches exactly

## What Next?

- ✅ Admin is set up and working
- 📚 Read [ADMIN_SETUP.md](ADMIN_SETUP.md) for detailed information
- 🔐 Change the default password
- 👥 Add more admin users if needed
- 📖 Read [README.md](README.md) for full documentation

## Need Help?

- Check [ADMIN_SETUP.md](ADMIN_SETUP.md) for detailed troubleshooting
- Review [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) for technical details
- Check Supabase logs in your dashboard
- Look at browser console for error messages

---

**Security Reminder**: Never commit the service role key to git! It's only needed for initial setup.
