/**
 * Script to create a real admin user in Supabase Cloud
 * 
 * This script requires the Supabase Service Role Key (not the anon key)
 * Run with: node scripts/create-admin.js
 * 
 * Environment variables required:
 * - SUPABASE_URL: Your Supabase project URL
 * - SUPABASE_SERVICE_ROLE_KEY: Your Supabase service role key (from project settings)
 */

import { createClient } from '@supabase/supabase-js';

// Load environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing required environment variables');
  console.error('Please set:');
  console.error('  - SUPABASE_URL (or VITE_SUPABASE_URL)');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nYou can find the service role key in your Supabase project settings:');
  console.error('  Project Settings > API > service_role key');
  process.exit(1);
}

// Create admin credentials
const ADMIN_EMAIL = 'admin@plasu.edu.ng';
const ADMIN_PASSWORD = 'Admin123456';
const ADMIN_METADATA = {
  first_name: 'System',
  last_name: 'Administrator',
  staff_id: 'ADMIN001',
  department: 'Computer Science',
  role: 'Super Admin'
};

async function createAdminUser() {
  console.log('🚀 Starting admin user creation...\n');

  // Create Supabase client with service role key
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // Step 1: Check if admin user already exists
    console.log('1️⃣  Checking if admin user already exists...');
    const { data: existingAdmin } = await supabase
      .from('admins')
      .select('*')
      .eq('email', ADMIN_EMAIL)
      .single();

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists in database');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   ID: ${existingAdmin.id}`);
      
      // Check if they have an auth user
      if (existingAdmin.user_id) {
        console.log('✅ Admin already has an auth user linked');
        console.log('\n🎉 Admin setup is complete!');
        return;
      } else {
        console.log('⚠️  Admin record exists but has no auth user');
        console.log('   Attempting to create auth user and link...');
      }
    }

    // Step 2: Create auth user
    console.log('\n2️⃣  Creating admin auth user...');
    let authData = null;
    const { data: authResult, error: authError } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: ADMIN_METADATA
    });

    if (authError) {
      // Check if user already exists in auth
      if (authError.message.includes('already registered')) {
        console.log('⚠️  Auth user already exists. Attempting to retrieve...');
        
        // Try to get the existing user
        const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) throw listError;
        
        const existingAuthUser = listData.users.find(u => u.email === ADMIN_EMAIL);
        if (!existingAuthUser) {
          throw new Error('Could not find existing auth user');
        }
        
        console.log('✅ Found existing auth user');
        authData = { user: existingAuthUser };
      } else {
        throw authError;
      }
    } else {
      console.log('✅ Auth user created successfully');
      authData = authResult;
    }

    console.log(`   User ID: ${authData.user.id}`);
    console.log(`   Email: ${authData.user.email}`);

    // Step 3: Create or update admin record
    console.log('\n3️⃣  Creating/updating admin record in database...');
    
    if (existingAdmin) {
      // Update existing admin with user_id
      const { error: updateError } = await supabase
        .from('admins')
        .update({ user_id: authData.user.id })
        .eq('email', ADMIN_EMAIL);

      if (updateError) throw updateError;
      console.log('✅ Admin record updated with auth user ID');
    } else {
      // Create new admin record
      const { error: insertError } = await supabase
        .from('admins')
        .insert({
          user_id: authData.user.id,
          email: ADMIN_EMAIL,
          first_name: ADMIN_METADATA.first_name,
          last_name: ADMIN_METADATA.last_name,
          staff_id: ADMIN_METADATA.staff_id,
          department: ADMIN_METADATA.department,
          role: ADMIN_METADATA.role
        });

      if (insertError) {
        // Check if it's a duplicate
        if (insertError.code === '23505') {
          console.log('⚠️  Admin record already exists, skipping insert');
        } else {
          throw insertError;
        }
      } else {
        console.log('✅ Admin record created successfully');
      }
    }

    // Step 4: Verify setup
    console.log('\n4️⃣  Verifying admin setup...');
    const { data: verifyAdmin, error: verifyError } = await supabase
      .from('admins')
      .select('*')
      .eq('email', ADMIN_EMAIL)
      .single();

    if (verifyError) throw verifyError;

    console.log('✅ Admin setup verified!');
    console.log('\n📋 Admin Details:');
    console.log(`   Email: ${verifyAdmin.email}`);
    console.log(`   Name: ${verifyAdmin.first_name} ${verifyAdmin.last_name}`);
    console.log(`   Staff ID: ${verifyAdmin.staff_id || 'N/A'}`);
    console.log(`   Department: ${verifyAdmin.department || 'N/A'}`);
    console.log(`   User ID: ${verifyAdmin.user_id}`);
    
    console.log('\n🔑 Login Credentials:');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    
    console.log('\n🎉 Admin user successfully created in Supabase Cloud!');
    console.log('   You can now login at the admin portal.');

  } catch (error) {
    console.error('\n❌ Error creating admin user:', error.message);
    if (error.details) {
      console.error('   Details:', error.details);
    }
    if (error.hint) {
      console.error('   Hint:', error.hint);
    }
    process.exit(1);
  }
}

// Run the script
createAdminUser();
