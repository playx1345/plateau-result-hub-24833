-- Create function to automatically create student profile when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_student()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert student profile with data from auth metadata
  INSERT INTO public.students (
    id,
    user_id,
    matric_number,
    first_name,
    last_name,
    middle_name,
    email,
    phone,
    level,
    department,
    faculty,
    date_of_birth,
    gender,
    address,
    state_of_origin,
    lga,
    password_changed
  )
  VALUES (
    gen_random_uuid(),
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'matric_number', ''),
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.raw_user_meta_data->>'middle_name',
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'level', 'ND1')::student_level,
    COALESCE(NEW.raw_user_meta_data->>'department', 'Computer Science'),
    COALESCE(NEW.raw_user_meta_data->>'faculty', 'School of Information and Communication Technology'),
    (NEW.raw_user_meta_data->>'date_of_birth')::date,
    NEW.raw_user_meta_data->>'gender',
    NEW.raw_user_meta_data->>'address',
    NEW.raw_user_meta_data->>'state_of_origin',
    NEW.raw_user_meta_data->>'lga',
    false
  );
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create student profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_student();

-- Create some default courses for ND1 and ND2
INSERT INTO public.courses (course_code, course_title, credit_unit, level, semester) VALUES
-- ND1 First Semester
('CSC101', 'Introduction to Computer Science', 3, 'ND1', 'First'),
('MTH101', 'General Mathematics I', 3, 'ND1', 'First'),
('PHY101', 'General Physics I', 3, 'ND1', 'First'),
('GST101', 'Communication in English I', 2, 'ND1', 'First'),
('GST102', 'Nigerian Peoples and Culture', 2, 'ND1', 'First'),
('CSC102', 'Computer Programming I', 4, 'ND1', 'First'),

-- ND1 Second Semester  
('CSC103', 'Computer Programming II', 4, 'ND1', 'Second'),
('MTH102', 'General Mathematics II', 3, 'ND1', 'Second'),
('PHY102', 'General Physics II', 3, 'ND1', 'Second'),
('GST103', 'Communication in English II', 2, 'ND1', 'Second'),
('STA101', 'Statistics for Physical Sciences', 3, 'ND1', 'Second'),
('CSC104', 'Computer Hardware', 3, 'ND1', 'Second'),

-- ND2 First Semester
('CSC201', 'Data Structures and Algorithms', 4, 'ND2', 'First'),
('CSC202', 'Database Systems', 4, 'ND2', 'First'),
('CSC203', 'Software Engineering', 3, 'ND2', 'First'),
('CSC204', 'Computer Networks', 3, 'ND2', 'First'),
('CSC205', 'Web Development', 4, 'ND2', 'First'),
('GST201', 'Entrepreneurship', 2, 'ND2', 'First'),

-- ND2 Second Semester
('CSC206', 'System Analysis and Design', 3, 'ND2', 'Second'),
('CSC207', 'Mobile App Development', 4, 'ND2', 'Second'),
('CSC208', 'Artificial Intelligence', 3, 'ND2', 'Second'),
('CSC209', 'Cybersecurity', 3, 'ND2', 'Second'),
('CSC210', 'Project', 6, 'ND2', 'Second'),
('STA201', 'Applied Statistics', 3, 'ND2', 'Second')

ON CONFLICT (course_code, level, semester) DO NOTHING;