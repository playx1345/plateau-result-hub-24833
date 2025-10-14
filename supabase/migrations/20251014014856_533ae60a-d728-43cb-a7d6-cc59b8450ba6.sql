-- Create students table
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  matric_number TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  middle_name TEXT,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  level TEXT NOT NULL CHECK (level IN ('ND1', 'ND2')),
  department TEXT DEFAULT 'Computer Science',
  faculty TEXT DEFAULT 'School of Information and Communication Technology',
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('Male', 'Female')),
  address TEXT,
  state_of_origin TEXT,
  lga TEXT,
  password_changed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admins table
CREATE TABLE public.admins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create courses table
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  credit_hours INTEGER NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('ND1', 'ND2')),
  semester TEXT NOT NULL CHECK (semester IN ('First', 'Second')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create results table
CREATE TABLE public.results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  ca_score NUMERIC(5,2),
  exam_score NUMERIC(5,2),
  total_score NUMERIC(5,2),
  grade TEXT,
  grade_point NUMERIC(3,2),
  session TEXT NOT NULL,
  semester TEXT NOT NULL CHECK (semester IN ('First', 'Second')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, course_id, session, semester)
);

-- Create fee_payments table
CREATE TABLE public.fee_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  amount_paid NUMERIC(12,2) NOT NULL,
  amount_due NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('paid', 'partial', 'unpaid')),
  session TEXT NOT NULL,
  semester TEXT NOT NULL CHECK (semester IN ('First', 'Second')),
  payment_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create announcements table
CREATE TABLE public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  target_level TEXT CHECK (target_level IN ('ND1', 'ND2', 'All')),
  created_by UUID REFERENCES public.admins(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for students table
CREATE POLICY "Students can view their own data"
ON public.students FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Students can update their own data"
ON public.students FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for admins table
CREATE POLICY "Admins can view their own data"
ON public.admins FOR SELECT
USING (auth.uid() = user_id);

-- RLS Policies for courses table
CREATE POLICY "Anyone can view courses"
ON public.courses FOR SELECT
USING (true);

-- RLS Policies for results table
CREATE POLICY "Students can view their own results"
ON public.results FOR SELECT
USING (
  student_id IN (
    SELECT id FROM public.students WHERE user_id = auth.uid()
  )
);

-- RLS Policies for fee_payments table
CREATE POLICY "Students can view their own fee payments"
ON public.fee_payments FOR SELECT
USING (
  student_id IN (
    SELECT id FROM public.students WHERE user_id = auth.uid()
  )
);

-- RLS Policies for announcements table
CREATE POLICY "Students can view announcements"
ON public.announcements FOR SELECT
USING (
  target_level = 'All' OR 
  target_level IN (
    SELECT level FROM public.students WHERE user_id = auth.uid()
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admins_updated_at
  BEFORE UPDATE ON public.admins
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_results_updated_at
  BEFORE UPDATE ON public.results
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fee_payments_updated_at
  BEFORE UPDATE ON public.fee_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to verify admin login
CREATE OR REPLACE FUNCTION public.verify_admin_login(
  admin_email TEXT,
  admin_password TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- For demo purposes, check against hardcoded credentials
  -- In production, this should verify against the admins table
  RETURN admin_email = 'admin@plasu.edu.ng' AND admin_password = 'Admin123456';
END;
$$;