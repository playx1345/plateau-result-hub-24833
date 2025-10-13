# Plateau State Polytechnic Result Hub

A comprehensive web-based student result management system for the Department of Computer Science, School of Information and Communication Technology, Plateau State Polytechnic Barkin Ladi.

## 🎓 Overview

This system provides a modern, secure platform for managing and viewing student academic results online. It enables students to check their semester results, view their academic profile, and track their progress, while administrators can efficiently manage student records, upload results, and handle various administrative tasks.

## ✨ Features

### For Students
- 📊 **View Semester Results** - Access ND1 and ND2 semester results with detailed breakdown
- 👤 **Profile Management** - View and update personal information
- 📋 **Result History** - Track academic performance across semesters
- 💳 **Fee Status** - Check school fee payment status
- 🔔 **Announcements** - Receive important notices and updates
- 🔒 **Secure Authentication** - Login with matric number and PIN
- 📄 **Download Results** - Export results as PDF for printing

### For Administrators
- 👥 **Student Management** - Create and manage student accounts
- 📝 **Result Upload** - Upload individual or bulk results
- 📊 **Bulk Upload** - Import results via CSV files
- 💰 **Fee Management** - Track and update fee payment status
- 📢 **Announcements** - Post general or level-specific announcements
- 📈 **Dashboard Analytics** - View system statistics and insights
- 🔐 **Secure Admin Panel** - Protected administrative interface

## 🛠️ Technology Stack

This project is built with modern web technologies:

- **Frontend Framework**: React 18.3 with TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn-ui
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL database, Authentication, Real-time)
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router DOM
- **Form Handling**: React Hook Form with Zod validation
- **PDF Generation**: jsPDF
- **CSV Parsing**: PapaParse
- **Icons**: Lucide React

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- **npm** or **yarn** package manager
- **Git** for version control

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/mutahtutu/plateau-result-hub-24833.git
cd plateau-result-hub-24833
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_SUPABASE_PROJECT_ID=your_supabase_project_id
```

### 4. Database Setup

The project includes SQL migrations in the `supabase/migrations` directory. These create:

- **Students table** - Store student information
- **Admins table** - Store administrator accounts
- **Courses table** - Computer Science courses (ND1 & ND2)
- **Results table** - Student academic results
- **Fee Payments table** - Fee payment tracking
- **Announcements table** - System announcements

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📖 Usage

### Student Access

1. Navigate to the home page
2. Click **"Student Login"** or **"View My Results"**
3. Login with your credentials:
   - **Matric Number**: Your assigned matriculation number
   - **PIN**: Your 6-digit PIN (default: 223344)
4. Access your dashboard to:
   - View semester results
   - Check fee status
   - Update profile information
   - Read announcements

### Administrator Access

1. Navigate to the home page
2. Click **"Admin Login"**
3. Login with admin credentials:
   - **Email**: admin@plasu.edu.ng
   - **Password**: Admin1234
4. Access the admin dashboard to:
   - Manage student accounts
   - Upload results (individual or bulk)
   - Manage fee payments
   - Post announcements
   - View system analytics

### Demo Setup

To quickly set up demo data for testing:

1. Navigate to `/demo-setup`
2. Click **"Setup Demo Data"**
3. This creates:
   - Demo admin account
   - Sample student accounts
   - Sample courses
   - Sample results
   - Sample announcements

## 🗄️ Database Schema

### Key Tables

**Students**
- Personal information (name, email, phone)
- Academic details (matric number, level, department)
- Authentication data

**Results**
- Course information
- CA scores (0-30)
- Exam scores (0-70)
- Total score and grade
- Session and semester

**Courses**
- Course code and title
- Credit units
- Level (ND1/ND2)
- Semester (First/Second)

**Fee Payments**
- Payment status (paid/unpaid/partial)
- Session and semester
- Amount and payment date

## 🔐 Default Accounts

### Admin Account
- **Email**: admin@plasu.edu.ng
- **Password**: Admin1234
- **Staff ID**: PLASU-ADMIN-001

### Demo Student Accounts (after demo setup)
- **Student 1**: CS/ND1/2024/001, PIN: 223344
- **Student 2**: CS/ND1/2024/002, PIN: 223344

## 📦 Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Build for development
npm run build:dev

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🌐 Deployment

### Using Lovable

1. Open [Lovable](https://lovable.dev/projects/1287f858-1ccc-4480-93de-3287353ea05f)
2. Click on **Share -> Publish**
3. Your app will be deployed automatically

### Using Vercel/Netlify

1. Connect your GitHub repository
2. Set environment variables
3. Deploy with one click

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Development Guide

### Code Editing Options

**Use your preferred IDE**
- Clone the repo locally
- Make changes and push
- Changes will be reflected in Lovable

**Edit directly in GitHub**
- Navigate to the desired file
- Click the "Edit" button (pencil icon)
- Make changes and commit

**Use GitHub Codespaces**
- Click "Code" button on GitHub
- Select "Codespaces" tab
- Click "New codespace"
- Edit and commit changes directly

**Use Lovable**
- Visit the [Lovable Project](https://lovable.dev/projects/1287f858-1ccc-4480-93de-3287353ea05f)
- Start prompting to make changes
- Changes are committed automatically

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🏫 Institution

**Plateau State Polytechnic Barkin Ladi**  
School of Information and Communication Technology  
Department of Computer Science

**Motto**: Technology for Progress

## 📞 Support

For issues, questions, or contributions, please open an issue on GitHub or contact the development team.

---

**Project URL**: https://lovable.dev/projects/1287f858-1ccc-4480-93de-3287353ea05f

Made with ❤️ for Plateau State Polytechnic Barkin Ladi
