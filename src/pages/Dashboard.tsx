import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthWrapper";
import { 
  GraduationCap, 
  LogOut, 
  FileText, 
  AlertCircle, 
  CheckCircle,
  User,
  BookOpen,
  CreditCard,
  Bell,
  Calculator
} from "lucide-react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { StudentSidebar } from "@/components/StudentSidebar";

interface Student {
  id: string;
  matric_number: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  level: string;
  email: string;
  phone?: string;
  password_changed: boolean;
}

interface FeeStatus {
  status: string;
  session: string;
  semester: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, session, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<Student | null>(null);
  const [feeStatus, setFeeStatus] = useState<FeeStatus[]>([]);

  useEffect(() => {
    if (!authLoading) {
      checkAuthAndLoadData();
    }
  }, [authLoading, user]);

  const checkAuthAndLoadData = async () => {
    if (!user || !session) {
      navigate("/auth?mode=login");
      return;
    }

    try {
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (studentError) {
        toast({
          title: "Error",
          description: "Failed to load student profile",
          variant: "destructive",
        });
        return;
      }

      setStudent(studentData);

      // Fetch fee status
      const { data: feeData, error: feeError } = await supabase
        .from('fee_payments')
        .select('status, session, semester')
        .eq('student_id', studentData.id);

      if (!feeError && feeData) {
        setFeeStatus(feeData);
      }

    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
  };

  const getFeePaidStatus = (semester: string) => {
    const currentSession = "2024/2025"; // This should be dynamic
    const fee = feeStatus.find(f => 
      f.semester === semester && 
      f.session === currentSession
    );
    return fee?.status === 'paid';
  };

  const canViewResults = (level: string, semester: string) => {
    return getFeePaidStatus(semester);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Profile Not Found</h2>
            <p className="text-muted-foreground mb-4">
              Your student profile could not be loaded. Please contact the admin.
            </p>
            <Button onClick={handleLogout} variant="outline">
              Return to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <StudentSidebar studentName={`${student.first_name} ${student.last_name}`} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2 flex-1">
            <GraduationCap className="w-5 h-5" />
            <h1 className="text-xl font-semibold">Dashboard</h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 bg-gradient-to-br from-blue-50 to-green-50">
          <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="lg:col-span-1">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Student Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                  <p className="text-lg font-semibold">
                    {student.first_name} {student.middle_name && `${student.middle_name} `}{student.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Matric Number</p>
                  <p className="font-mono text-lg">{student.matric_number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Level</p>
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    {student.level}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p>{student.email}</p>
                </div>
                {student.phone && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phone</p>
                    <p>{student.phone}</p>
                  </div>
                 )}
                 <Button 
                   size="sm" 
                   variant="outline" 
                   className="w-full mt-4"
                   onClick={() => navigate("/profile")}
                 >
                   <User className="w-4 h-4 mr-2" />
                   Edit Profile
                 </Button>
               </CardContent>
             </Card>

            {/* Password Warning */}
            {!student.password_changed && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-800">Change Default Password</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        For security, please change your default password in your profile settings.
                      </p>
                      <Button 
                        size="sm" 
                        className="mt-3" 
                        variant="outline"
                        onClick={() => navigate("/profile")}
                      >
                        Update Password
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Quick Stats */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Level</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{student.level}</div>
                  <p className="text-xs text-muted-foreground">National Diploma</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Fee Status</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {getFeePaidStatus('First') ? 'Paid' : 'Pending'}
                  </div>
                  <p className="text-xs text-muted-foreground">Current Semester</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/cgp-calculator")}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Calculator className="w-4 h-4" />
                    CGP Calculator
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Calculate your cumulative grade point
                  </p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/announcements")}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Announcements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    View important announcements
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Results Access */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Academic Results
                </CardTitle>
                <CardDescription>
                  Access your semester results and academic performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* ND1 Results */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg">ND1 Results</h4>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Card className="relative">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium">First Semester</h5>
                          {getFeePaidStatus('First') ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-yellow-600" />
                          )}
                        </div>
                        <Button 
                          size="sm" 
                          className="w-full"
                          disabled={!canViewResults('ND1', 'First')}
                          onClick={() => navigate(`/results?level=ND1&semester=First`)}
                        >
                          {canViewResults('ND1', 'First') ? 'View Results' : 'Fee Required'}
                        </Button>
                        {!canViewResults('ND1', 'First') && (
                          <p className="text-xs text-muted-foreground mt-2 text-center">
                            Please complete fee payment
                          </p>
                        )}
                      </CardContent>
                    </Card>
                    
                    <Card className="relative">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium">Second Semester</h5>
                          {getFeePaidStatus('Second') ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-yellow-600" />
                          )}
                        </div>
                        <Button 
                          size="sm" 
                          className="w-full"
                          disabled={!canViewResults('ND1', 'Second')}
                          onClick={() => navigate(`/results?level=ND1&semester=Second`)}
                        >
                          {canViewResults('ND1', 'Second') ? 'View Results' : 'Fee Required'}
                        </Button>
                        {!canViewResults('ND1', 'Second') && (
                          <p className="text-xs text-muted-foreground mt-2 text-center">
                            Please complete fee payment
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* ND2 Results */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg">ND2 Results</h4>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Card className="relative">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium">First Semester</h5>
                          {getFeePaidStatus('First') ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-yellow-600" />
                          )}
                        </div>
                        <Button 
                          size="sm" 
                          className="w-full"
                          disabled={!canViewResults('ND2', 'First')}
                          onClick={() => navigate(`/results?level=ND2&semester=First`)}
                        >
                          {canViewResults('ND2', 'First') ? 'View Results' : 'Fee Required'}
                        </Button>
                        {!canViewResults('ND2', 'First') && (
                          <p className="text-xs text-muted-foreground mt-2 text-center">
                            Please complete fee payment
                          </p>
                        )}
                      </CardContent>
                    </Card>
                    
                    <Card className="relative">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium">Second Semester</h5>
                          {getFeePaidStatus('Second') ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-yellow-600" />
                          )}
                        </div>
                        <Button 
                          size="sm" 
                          className="w-full"
                          disabled={!canViewResults('ND2', 'Second')}
                          onClick={() => navigate(`/results?level=ND2&semester=Second`)}
                        >
                          {canViewResults('ND2', 'Second') ? 'View Results' : 'Fee Required'}
                        </Button>
                        {!canViewResults('ND2', 'Second') && (
                          <p className="text-xs text-muted-foreground mt-2 text-center">
                            Please complete fee payment
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Dashboard;