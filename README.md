<div align="center">

# 🎓 Plateau State Polytechnic Result Hub

### A Modern Student Result Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Powered-green)](https://supabase.com/)

*A comprehensive web-based student result management system for the Department of Computer Science, School of Information and Communication Technology, Plateau State Polytechnic Barkin Ladi.*

[Quick Start](#-quick-start) • [Features](#-features) • [Demo](#-demo-setup) • [Documentation](#-comprehensive-documentation) • [Support](#-support)

</div>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Key Features](#-features)
- [Screenshots](#-screenshots)
- [Technology Stack](#️-technology-stack)
- [System Requirements](#-system-requirements)
- [Quick Start](#-quick-start)
- [Installation & Setup](#-installation--setup)
- [Usage Guide](#-usage)
- [Security](#-security)
- [Database Schema](#️-database-schema)
- [API & Documentation](#-comprehensive-documentation)
- [Deployment](#-deployment)
- [Development Guide](#-development-guide)
- [Contributing](#-contributing)
- [Troubleshooting](#-troubleshooting)
- [FAQ](#-frequently-asked-questions)
- [License](#-license)
- [Support](#-support)

---

## 🎓 Overview

This system provides a **modern, secure platform** for managing and viewing student academic results online. It enables students to check their semester results, view their academic profile, and track their progress, while administrators can efficiently manage student records, upload results, and handle various administrative tasks.

### Why This System?

✅ **Secure & Reliable** - Built with enterprise-grade security (RLS, JWT, bcrypt)  
✅ **Easy to Use** - Intuitive interface for both students and administrators  
✅ **Real-time Updates** - Instant access to results and announcements  
✅ **Mobile Friendly** - Responsive design works on all devices  
✅ **Open Source** - MIT licensed, free to use and modify

## ✨ Features

<details open>
<summary><b>👨‍🎓 For Students</b></summary>

- 📊 **View Semester Results** - Access ND1 and ND2 semester results with detailed breakdown
- 👤 **Profile Management** - View and update personal information
- 📋 **Result History** - Track academic performance across semesters
- 💳 **Fee Status** - Check school fee payment status
- 🔔 **Announcements** - Receive important notices and updates
- 🔒 **Secure Authentication** - Login with email or matric number and PIN
- 📄 **Download Results** - Export results as PDF for printing
- 📱 **Mobile Responsive** - Access from any device

</details>

<details open>
<summary><b>👨‍💼 For Administrators</b></summary>

- 👥 **Student Management** - Create and manage student accounts
- 📝 **Result Upload** - Upload individual or bulk results
- 📊 **Bulk Upload** - Import results via CSV files
- 💰 **Fee Management** - Track and update fee payment status
- 📢 **Announcements** - Post general or level-specific announcements
- 📈 **Dashboard Analytics** - View system statistics and insights
- 🔐 **Secure Admin Panel** - Protected administrative interface
- 📝 **Audit Logging** - Track all administrative actions
- 🔍 **Advanced Search** - Find students and results quickly

</details>

## 📸 Screenshots

> **Note**: Visual previews of the system interface

### Student Dashboard
*Student can view their results, profile, and announcements in an intuitive interface*

### Admin Panel
*Administrators have full control over student management, result uploads, and system analytics*

> For live demo, see [Demo Setup](#-demo-setup) section below.

---

## 🛠️ Technology Stack

This project is built with modern web technologies:

| Category | Technology |
|----------|-----------|
| **Frontend Framework** | React 18.3 with TypeScript |
| **Build Tool** | Vite |
| **UI Components** | shadcn-ui |
| **Styling** | Tailwind CSS |
| **Backend** | Supabase (PostgreSQL, Auth, Real-time) |
| **State Management** | TanStack Query (React Query) |
| **Routing** | React Router DOM |
| **Form Handling** | React Hook Form with Zod validation |
| **PDF Generation** | jsPDF |
| **CSV Parsing** | PapaParse |
| **Icons** | Lucide React |

---

## 💻 System Requirements

Before you begin, ensure you have the following installed:

| Requirement | Version | Installation Guide |
|-------------|---------|-------------------|
| **Node.js** | v18 or higher | [Install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating) |
| **npm** | Latest | Comes with Node.js |
| **Git** | Latest | [Download Git](https://git-scm.com/downloads) |
| **Supabase Account** | Free tier works | [Sign up at Supabase](https://supabase.com/) |

**Optional:**
- **Code Editor**: VS Code, WebStorm, or your preferred IDE
- **Browser**: Latest Chrome, Firefox, or Edge for best experience

---

## 🚀 Quick Start

Get up and running in less than 5 minutes!

### Option 1: Automated Setup (Recommended)

```bash
# 1. Clone and install
git clone https://github.com/playx1345/plateau-result-hub-24833.git
cd plateau-result-hub-24833
npm install

# 2. Set up environment (copy and edit .env)
cp .env.example .env
# Edit .env with your Supabase credentials

# 3. Create admin account (see QUICK_START.md for details)
export SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
npm run setup-admin

# 4. Start the application
npm run dev
```

🎉 **That's it!** Open `http://localhost:5173` in your browser.

### Option 2: Manual Setup

For detailed step-by-step instructions, see the [Installation & Setup](#-installation--setup) section below.

---

## 🚀 Installation & Setup

### 📦 Step-by-Step Installation

<details>
<summary><b>Step 1: Clone the Repository</b></summary>

```bash
git clone https://github.com/playx1345/plateau-result-hub-24833.git
cd plateau-result-hub-24833
```

</details>

<details>
<summary><b>Step 2: Install Dependencies</b></summary>

```bash
npm install
```

This will install all required packages including React, Supabase, TailwindCSS, and more.

</details>

<details>
<summary><b>Step 3: Environment Configuration</b></summary>

Create a `.env` file in the root directory with your Supabase credentials:

```bash
# Copy the example file
cp .env.example .env
```

Then edit `.env` with your Supabase project details:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_SUPABASE_PROJECT_ID=your_supabase_project_id
```

**How to get these values:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the values from there

</details>

<details>
<summary><b>Step 4: Database Setup</b></summary>

The project includes SQL migrations in the `supabase/migrations` directory. These create:

- ✅ **Students table** - Store student information
- ✅ **Admins table** - Store administrator accounts
- ✅ **Courses table** - Computer Science courses (ND1 & ND2)
- ✅ **Results table** - Student academic results
- ✅ **Fee Payments table** - Fee payment tracking
- ✅ **Announcements table** - System announcements

**Apply migrations in Supabase:**
1. Go to **SQL Editor** in your Supabase dashboard
2. Run each migration file in order
3. Or use Supabase CLI: `supabase db push`

</details>

<details>
<summary><b>Step 5: Admin Account Setup</b></summary>

**IMPORTANT**: Before using the system, you need to create an admin account.

#### Quick Setup (Automated)

```bash
# Set your service role key (from Supabase Dashboard → Settings → API)
export SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"

# Run the setup script
npm run setup-admin
```

**Default admin credentials after setup:**
- **Email**: `admin@plasu.edu.ng`
- **Password**: `Admin123456` ⚠️ **Change after first login!**

#### Detailed Guides
- 📚 **Quick Start**: [QUICK_START.md](QUICK_START.md) - Fast setup in 5 steps
- 📖 **Detailed Guide**: [ADMIN_SETUP.md](ADMIN_SETUP.md) - Complete documentation with troubleshooting

</details>

<details>
<summary><b>Step 6: Start Development Server</b></summary>

```bash
npm run dev
```

The application will be available at:
```
🚀 Local: http://localhost:5173
```

**To access from other devices on your network:**
```bash
npm run dev -- --host
```

</details>

---

## 📖 Usage

### 👨‍🎓 Student Access

<details>
<summary>Click to expand student login guide</summary>

1. **Navigate to the home page** at `http://localhost:5173`
2. Click **"Student Login"** or **"View My Results"** button
3. **Login with your credentials:**
   - **Email or Matric Number**: Your registered email or matriculation number
   - **PIN**: Your 6-digit PIN (default: `223344`)
4. **Access your dashboard** to:
   - 📊 View semester results
   - 💳 Check fee status
   - 👤 Update profile information
   - 🔔 Read announcements
   - 📄 Download results as PDF

**Demo Student Credentials** (after demo setup):
```
Matric Number: CS/ND1/2024/001
PIN: 223344
```

</details>

### 👨‍💼 Administrator Access

<details>
<summary>Click to expand admin login guide</summary>

1. **First**: Set up the admin account using [ADMIN_SETUP.md](ADMIN_SETUP.md)
2. **Navigate to the home page**
3. Click **"Admin Login"** button
4. **Login with admin credentials:**
   - **Email**: `admin@plasu.edu.ng`
   - **Password**: `Admin123456` (default - **change after first login!**)
5. **Access the admin dashboard** to:
   - 👥 Manage student accounts
   - 📝 Upload results (individual or bulk via CSV)
   - 💰 Manage fee payments
   - 📢 Post announcements
   - 📈 View system analytics
   - 🔍 Search and filter students
   - 📊 Generate reports

**Admin Features:**
- Bulk result upload via CSV
- Student profile management
- Fee payment tracking
- Announcement system
- Audit logging
- Real-time analytics

</details>

### 🎭 Demo Setup

To quickly set up demo data for testing:

```bash
# Visit in browser
http://localhost:5173/demo-setup
```

Click **"Setup Demo Data"** to create:
- ✅ Demo admin account
- ✅ Sample student accounts (5 students)
- ✅ Sample courses (Computer Science ND1 & ND2)
- ✅ Sample results with various grades
- ✅ Sample announcements

**Demo Accounts Created:**
| Role | Email/Matric | Password/PIN |
|------|--------------|--------------|
| Admin | admin@plasu.edu.ng | Admin123456 |
| Student 1 | CS/ND1/2024/001 | 223344 |
| Student 2 | CS/ND1/2024/002 | 223344 |

---

## 🔒 Security

This system implements **multiple layers of enterprise-grade security**:

### Security Features

| Feature | Implementation |
|---------|---------------|
| 🔐 **Authentication** | Supabase Auth with bcrypt password hashing |
| 🛡️ **Row Level Security (RLS)** | Database-level access control policies |
| 👮 **Admin Protection** | Restrictive RLS policies prevent non-admin access |
| 🔑 **Session Management** | JWT-based secure session handling |
| 👤 **Authorization** | Role-based access control (RBAC) |
| 📝 **Audit Logging** | Comprehensive tracking of all admin actions |
| 🚫 **Rate Limiting** | Protection against brute force attacks |
| 📚 **Carryover Tracking** | Automated tracking of failed courses |

### Recent Security Updates

- ✅ **Admin RLS Policies**: Comprehensive RLS policies added to prevent unauthorized access to administrator contact information
- ✅ **PIN Management**: Secure PIN reset policies and procedures
- ✅ **Session Security**: Enhanced JWT token validation

**Documentation:**
- 📄 [Security Checklist](docs/SECURITY_CHECKLIST.md)
- 📄 [Admin RLS Fix](docs/SECURITY_FIX_ADMIN_RLS.md)
- 📄 [RBAC Implementation](docs/RBAC_IMPLEMENTATION_GUIDE.md)
- 📄 [PIN Reset Policy](docs/PIN_RESET_POLICY.md)

---

## 📚 Comprehensive Documentation

For detailed information about the system:

| Document | Description |
|----------|-------------|
| 📘 [System Implementation Guide](docs/SYSTEM_IMPLEMENTATION_GUIDE.md) | Complete overview of features and implementation |
| 🔐 [RBAC Implementation Guide](docs/RBAC_IMPLEMENTATION_GUIDE.md) | Role-based access control documentation |
| 📡 [API Documentation](docs/API_DOCUMENTATION.md) | Complete API reference for all endpoints |
| 🔑 [PIN Reset Policy](docs/PIN_RESET_POLICY.md) | PIN and password management policies |
| ⚡ [Quick Start Guide](QUICK_START.md) | Fast setup in 5 steps |
| 👨‍💼 [Admin Setup Guide](ADMIN_SETUP.md) | Step-by-step admin account creation |
| ✅ [Security Checklist](docs/SECURITY_CHECKLIST.md) | Security verification and testing |
| 🛡️ [Admin RLS Diagram](docs/ADMIN_RLS_DIAGRAM.md) | Visual security policies representation |

---

## 🗄️ Database Schema

### Overview

The system uses PostgreSQL (via Supabase) with the following key tables:

<details>
<summary><b>Students Table</b></summary>

Stores all student information and authentication data.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Link to auth.users |
| matric_number | TEXT | Unique matriculation number |
| first_name | TEXT | Student's first name |
| last_name | TEXT | Student's last name |
| email | TEXT | Student's email |
| phone | TEXT | Contact number |
| level | TEXT | ND1 or ND2 |
| department | TEXT | Department name |
| pin | TEXT | Hashed 6-digit PIN |
| created_at | TIMESTAMP | Account creation date |

</details>

<details>
<summary><b>Results Table</b></summary>

Stores student academic results.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| student_id | UUID | Foreign key to students |
| course_code | TEXT | Course identifier |
| course_title | TEXT | Course name |
| ca_score | INTEGER | Continuous Assessment (0-30) |
| exam_score | INTEGER | Exam score (0-70) |
| total_score | INTEGER | Total score (0-100) |
| grade | TEXT | Letter grade (A, B, C, D, F) |
| session | TEXT | Academic session |
| semester | TEXT | First or Second semester |
| created_at | TIMESTAMP | Result entry date |

</details>

<details>
<summary><b>Courses Table</b></summary>

Computer Science course catalog.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| course_code | TEXT | Unique course code |
| course_title | TEXT | Course name |
| credit_units | INTEGER | Credit units (2-4) |
| level | TEXT | ND1 or ND2 |
| semester | TEXT | First or Second |

</details>

<details>
<summary><b>Fee Payments Table</b></summary>

Track student fee payments.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| student_id | UUID | Foreign key to students |
| session | TEXT | Academic session |
| semester | TEXT | Semester |
| amount | DECIMAL | Payment amount |
| status | TEXT | paid/unpaid/partial |
| payment_date | TIMESTAMP | Date of payment |

</details>

<details>
<summary><b>Announcements Table</b></summary>

System-wide announcements.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| title | TEXT | Announcement title |
| content | TEXT | Announcement body |
| target_level | TEXT | All/ND1/ND2 |
| created_by | UUID | Admin user ID |
| created_at | TIMESTAMP | Creation date |

</details>

### Entity Relationship Diagram

```
Students ─┬─< Results
          ├─< Fee Payments
          └─< (view) Announcements

Courses ──< Results

Admins ───< Announcements
```

---

## 🔐 Default Accounts

### Admin Account (Production)
```
Email: admin@plasu.edu.ng
Password: Admin123456
Staff ID: ADMIN001
```
⚠️ **IMPORTANT**: Change this password immediately after first login!

### Demo Student Accounts (After Demo Setup)

| Matric Number | PIN | Email |
|---------------|-----|-------|
| CS/ND1/2024/001 | 223344 | student1@example.com |
| CS/ND1/2024/002 | 223344 | student2@example.com |

---

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on `http://localhost:5173` |
| `npm run build` | Build for production (optimized) |
| `npm run build:dev` | Build for development (with source maps) |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint to check code quality |
| `npm run setup-admin` | Create initial admin account |

**Development Tips:**
```bash
# Run dev server with network access
npm run dev -- --host

# Build and preview production
npm run build && npm run preview

# Check for linting errors
npm run lint
```

---

## 🌐 Deployment

### Deploy to Lovable (Recommended)

The easiest way to deploy this application:

1. Open your [Lovable Project](https://lovable.dev/projects/1287f858-1ccc-4480-93de-3287353ea05f)
2. Click **Share** → **Publish**
3. Your app will be deployed automatically with HTTPS

**Features:**
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Automatic deployments on push
- ✅ Preview deployments for PRs

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Configure Environment Variables**:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   VITE_SUPABASE_PROJECT_ID=your_supabase_project_id
   ```
3. **Deploy**: Click "Deploy" and Vercel will handle the rest

### Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start)

1. **Connect Repository**: Link your GitHub repository
2. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. **Environment Variables**: Add your Supabase credentials
4. **Deploy**: Click "Deploy site"

### Other Deployment Options

<details>
<summary>Deploy to GitHub Pages</summary>

```bash
# Add to vite.config.ts
base: '/plateau-result-hub-24833/'

# Build and deploy
npm run build
# Then deploy the dist folder to gh-pages branch
```

</details>

<details>
<summary>Deploy to Your Own Server</summary>

```bash
# Build the application
npm run build

# The dist folder contains the production build
# Upload to your server and configure nginx/apache
```

Example nginx configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/plateau-result-hub/dist;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

</details>

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### How to Contribute

1. **Fork the Repository**
   ```bash
   # Click the "Fork" button on GitHub
   ```

2. **Clone Your Fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/plateau-result-hub-24833.git
   cd plateau-result-hub-24833
   ```

3. **Create a Feature Branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```

4. **Make Your Changes**
   - Write clean, well-documented code
   - Follow the existing code style
   - Add tests if applicable

5. **Commit Your Changes**
   ```bash
   git add .
   git commit -m 'Add some AmazingFeature'
   ```

6. **Push to Your Fork**
   ```bash
   git push origin feature/AmazingFeature
   ```

7. **Open a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Describe your changes in detail

### Contribution Guidelines

- ✅ Follow TypeScript best practices
- ✅ Write clear commit messages
- ✅ Update documentation when needed
- ✅ Test your changes thoroughly
- ✅ Keep PRs focused on a single feature/fix
- ✅ Be respectful and constructive

### Code Style

This project uses:
- **ESLint** for code linting
- **TypeScript** for type safety
- **Prettier** for code formatting (if configured)

Run linting before committing:
```bash
npm run lint
```

### Areas We Need Help

- 🐛 Bug fixes
- 📝 Documentation improvements
- ✨ New features
- 🎨 UI/UX improvements
- 🧪 Testing improvements
- 🌍 Internationalization

---

## 📝 Development Guide

### Code Editing Options

<details>
<summary><b>Option 1: Local Development (Recommended)</b></summary>

**Best for**: Full control, debugging, and testing

```bash
# Clone and setup
git clone https://github.com/playx1345/plateau-result-hub-24833.git
cd plateau-result-hub-24833
npm install

# Start development
npm run dev
```

**Recommended IDEs:**
- Visual Studio Code with extensions:
  - ESLint
  - Prettier
  - TypeScript Vue Plugin
  - Tailwind CSS IntelliSense
- WebStorm
- Cursor

</details>

<details>
<summary><b>Option 2: GitHub Codespaces</b></summary>

**Best for**: Quick edits without local setup

1. Click **Code** button on GitHub
2. Select **Codespaces** tab
3. Click **Create codespace on main**
4. Wait for environment to load
5. Run `npm install && npm run dev`

Benefits:
- ✅ Pre-configured environment
- ✅ No local setup needed
- ✅ Works from any device

</details>

<details>
<summary><b>Option 3: GitHub Web Editor</b></summary>

**Best for**: Quick file edits and documentation

1. Navigate to file on GitHub
2. Click pencil icon (Edit)
3. Make changes
4. Commit directly or create PR

</details>

<details>
<summary><b>Option 4: Lovable Platform</b></summary>

**Best for**: AI-assisted development

1. Visit [Lovable Project](https://lovable.dev/projects/1287f858-1ccc-4480-93de-3287353ea05f)
2. Use AI prompts to make changes
3. Changes are committed automatically
4. Preview changes in real-time

</details>

### Project Structure

```
plateau-result-hub-24833/
├── src/
│   ├── components/        # React components
│   │   ├── ui/           # shadcn-ui components
│   │   └── ...           # Feature components
│   ├── pages/            # Page components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   ├── integrations/     # External service integrations
│   └── App.tsx           # Main application component
├── supabase/
│   └── migrations/       # Database migrations
├── public/               # Static assets
├── docs/                 # Documentation
└── scripts/              # Build and setup scripts
```

### Development Workflow

```bash
# 1. Create a new branch
git checkout -b feature/my-feature

# 2. Make changes and test
npm run dev

# 3. Lint your code
npm run lint

# 4. Build to check for errors
npm run build

# 5. Commit and push
git add .
git commit -m "Add my feature"
git push origin feature/my-feature

# 6. Open a Pull Request
```

---

## 🔧 Troubleshooting

### Common Issues and Solutions

<details>
<summary><b>Issue: "Cannot connect to Supabase"</b></summary>

**Solution:**
1. Check your `.env` file has correct Supabase credentials
2. Verify your Supabase project is active
3. Check browser console for specific error messages
4. Ensure your IP is not blocked by Supabase

</details>

<details>
<summary><b>Issue: "Admin login not working"</b></summary>

**Solution:**
1. Verify admin account exists: Supabase Dashboard → Authentication → Users
2. Check admin record in database: Table Editor → admins
3. Ensure `user_id` in admins table matches auth user ID
4. Try resetting password from Supabase dashboard
5. Clear browser cache and cookies

See [ADMIN_SETUP.md](ADMIN_SETUP.md) for detailed troubleshooting.

</details>

<details>
<summary><b>Issue: "Student PIN not working"</b></summary>

**Solution:**
1. Default PIN for demo students is `223344`
2. PINs are hashed in database - check with admin panel
3. Try resetting PIN through admin panel
4. Verify student account exists in database

</details>

<details>
<summary><b>Issue: "Database migrations not applied"</b></summary>

**Solution:**
1. Go to Supabase Dashboard → SQL Editor
2. Check migration history
3. Manually run migrations from `supabase/migrations/` folder
4. Or use Supabase CLI: `supabase db push`

</details>

<details>
<summary><b>Issue: "Build errors or TypeScript errors"</b></summary>

**Solution:**
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear build cache
rm -rf dist .vite

# Rebuild
npm run build
```

</details>

<details>
<summary><b>Issue: "Port 5173 already in use"</b></summary>

**Solution:**
```bash
# Kill process on port 5173
kill -9 $(lsof -ti:5173)

# Or use a different port
npm run dev -- --port 3000
```

</details>

### Getting Help

If you're still stuck:

1. 📖 Check the [comprehensive documentation](#-comprehensive-documentation)
2. 🔍 Search existing [GitHub Issues](https://github.com/playx1345/plateau-result-hub-24833/issues)
3. 💬 Open a new issue with:
   - Detailed description of the problem
   - Steps to reproduce
   - Error messages
   - Screenshots if applicable
   - Your environment (OS, Node version, etc.)

---

## ❓ Frequently Asked Questions

<details>
<summary><b>Can I use this for my own institution?</b></summary>

Yes! This project is MIT licensed and free to use. You can:
- Clone and customize for your institution
- Modify the branding and features
- Deploy to your own infrastructure
- Contribute improvements back to the project

</details>

<details>
<summary><b>Do I need to pay for Supabase?</b></summary>

No, Supabase offers a generous free tier that includes:
- Up to 500MB database space
- Up to 50,000 monthly active users
- Up to 2GB file storage
- Community support

This is more than enough for small to medium institutions.

</details>

<details>
<summary><b>How do I add more admin users?</b></summary>

1. **Via Supabase Dashboard:**
   - Create auth user in Authentication → Users
   - Add record in Table Editor → admins table
   
2. **Via Script:**
   - Modify `scripts/create-admin.js`
   - Add new admin details
   - Run `npm run setup-admin`

See [ADMIN_SETUP.md](ADMIN_SETUP.md) for details.

</details>

<details>
<summary><b>Can students reset their own PINs?</b></summary>

Currently, PIN resets must be done by administrators through the admin panel. This is a security measure to ensure proper identity verification. See [PIN_RESET_POLICY.md](docs/PIN_RESET_POLICY.md) for details.

</details>

<details>
<summary><b>How do I backup the database?</b></summary>

**Via Supabase Dashboard:**
1. Go to Database → Backups
2. Daily automatic backups are enabled by default
3. You can restore from any backup point

**Manual Export:**
1. Go to Table Editor
2. Click "Export" on each table
3. Download as CSV
4. Store securely

</details>

<details>
<summary><b>Is this production-ready?</b></summary>

Yes! The system includes:
- ✅ Comprehensive security (RLS, auth, RBAC)
- ✅ Production-ready database schema
- ✅ Error handling and validation
- ✅ Audit logging
- ✅ Performance optimization

However, always:
- Test thoroughly with your data
- Change default passwords
- Configure backups
- Monitor usage and performance

</details>

<details>
<summary><b>How do I update to the latest version?</b></summary>

```bash
# Add upstream remote (if not already added)
git remote add upstream https://github.com/playx1345/plateau-result-hub-24833.git

# Fetch latest changes
git fetch upstream

# Merge changes
git merge upstream/main

# Install any new dependencies
npm install

# Apply any new migrations
# Check supabase/migrations/ for new files
```

</details>

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### What this means:

✅ **Commercial use** - Use this in your commercial projects  
✅ **Modification** - Modify the code as you need  
✅ **Distribution** - Share this with others  
✅ **Private use** - Use this privately  

**Conditions:**
- Include the original license and copyright notice
- State any significant changes made to the code

---

## 🏫 Institution

<div align="center">

**Plateau State Polytechnic Barkin Ladi**  
*School of Information and Communication Technology*  
*Department of Computer Science*

**Motto**: *Technology for Progress*

</div>

---

## 📞 Support

### Getting Help

- 📖 **Documentation**: Check our [comprehensive docs](#-comprehensive-documentation)
- 🐛 **Bug Reports**: [Open an issue](https://github.com/playx1345/plateau-result-hub-24833/issues/new)
- 💡 **Feature Requests**: [Submit an idea](https://github.com/playx1345/plateau-result-hub-24833/issues/new)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/playx1345/plateau-result-hub-24833/discussions)

### Contact

For institutional inquiries:
- 📧 Email: support@plasu.edu.ng
- 🌐 Website: [Plateau State Polytechnic](https://www.plateaupolytechnic.edu.ng)

---

<div align="center">

## 🌟 Star History

If you find this project useful, please consider giving it a ⭐ on GitHub!

[![Star History Chart](https://api.star-history.com/svg?repos=playx1345/plateau-result-hub-24833&type=Date)](https://star-history.com/#playx1345/plateau-result-hub-24833&Date)

---

**Project Links**

[🚀 Live Demo](https://lovable.dev/projects/1287f858-1ccc-4480-93de-3287353ea05f) • [📖 Documentation](docs/) • [🐛 Issues](https://github.com/playx1345/plateau-result-hub-24833/issues) • [🤝 Contributing](#-contributing)

---

Made with ❤️ for **Plateau State Polytechnic Barkin Ladi**

*Empowering Education Through Technology*

</div>
