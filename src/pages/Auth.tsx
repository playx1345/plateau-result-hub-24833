import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState(searchParams.get("mode") || "login");

  // Login form state
  const [loginForm, setLoginForm] = useState({
    matricNumber: "",
    pin: ""
  });

  // Signup form state
  const [signupForm, setSignupForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    matricNumber: "",
    phoneNumber: "",
    level: "ND1",
    pin: "",
    confirmPin: ""
  });

  // Password reset state
  const [resetEmail, setResetEmail] = useState("");
  const [showReset, setShowReset] = useState(false);
  const [activeTab, setActiveTab] = useState("login");


  useEffect(() => {
    const newMode = searchParams.get("mode") || "login";
    setMode(newMode);
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First, find the student with the matric number
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('email, id, password_changed')
        .eq('matric_number', loginForm.matricNumber)
        .single();

      if (studentError || !studentData) {
        toast({
          title: "Login Failed",
          description: "Invalid matric number. Please check and try again.",
          variant: "destructive",
        });
        return;
      }

      // Use the PIN directly - it should be 6 digits
      const password = loginForm.pin;

      const { error } = await supabase.auth.signInWithPassword({
        email: studentData.email,
        password: password,
      });

      if (error) {
        toast({
          title: "Login Failed",
          description: error.message.includes("Invalid login") 
            ? "Invalid PIN. Please check your credentials."
            : error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });

      navigate("/dashboard");
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupForm.pin !== signupForm.confirmPin) {
      toast({
        title: "PIN Mismatch",
        description: "PINs do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (signupForm.pin.length !== 6) {
      toast({
        title: "Invalid PIN",
        description: "PIN must be exactly 6 digits.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Create auth user with 6-digit PIN as password
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signupForm.email,
        password: signupForm.pin,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            first_name: signupForm.firstName,
            last_name: signupForm.lastName,
          }
        }
      });

      if (authError) {
        toast({
          title: "Signup Failed",
          description: authError.message,
          variant: "destructive",
        });
        return;
      }

      if (!authData.user) {
        toast({
          title: "Signup Failed",
          description: "Could not create user account",
          variant: "destructive",
        });
        return;
      }

      // Create student record
      const { error: studentError } = await supabase
        .from('students')
        .insert({
          user_id: authData.user.id,
          matric_number: signupForm.matricNumber,
          first_name: signupForm.firstName,
          last_name: signupForm.lastName,
          email: signupForm.email,
          phone: signupForm.phoneNumber,
          level: signupForm.level as "ND1" | "ND2",
          password_changed: false
        });

      if (studentError) {
        toast({
          title: "Registration Failed",
          description: studentError.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Account Created",
        description: "Your account has been created successfully. Please check your email to verify your account.",
      });

      // Reset form
      setSignupForm({
        firstName: "",
        lastName: "",
        email: "",
        matricNumber: "",
        phoneNumber: "",
        level: "ND1",
        pin: "",
        confirmPin: ""
      });
      
      setActiveTab("login");
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

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth?mode=login`,
      });

      if (error) {
        toast({
          title: "Reset Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Reset Email Sent",
        description: "Check your email for password reset instructions",
      });

      setShowReset(false);
      setResetEmail("");
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


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">PLASU ICT Portal</h1>
          <p className="text-muted-foreground">Student Authentication</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            {!showReset ? (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <div className="text-center mb-4">
                    <h2 className="text-xl font-semibold">Student Login</h2>
                    <p className="text-sm text-muted-foreground">Enter your credentials to access your results</p>
                  </div>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="matricNumber">Matric Number</Label>
                      <Input
                        id="matricNumber"
                        type="text"
                        placeholder="e.g., ND/CS/2024/001"
                        value={loginForm.matricNumber}
                        onChange={(e) => setLoginForm({ ...loginForm, matricNumber: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pin">6-Digit PIN</Label>
                      <InputOTP
                        maxLength={6}
                        value={loginForm.pin}
                        onChange={(value) => setLoginForm({ ...loginForm, pin: value })}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                      <p className="text-xs text-muted-foreground">Enter the 6-digit PIN provided by your admin</p>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loading || loginForm.pin.length !== 6}
                    >
                      {loading ? "Signing In..." : "Sign In"}
                    </Button>
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setShowReset(true)}
                        className="text-sm text-primary hover:underline"
                      >
                        Forgot your PIN? Reset password
                      </button>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <div className="text-center mb-4">
                    <h2 className="text-xl font-semibold">Create Account</h2>
                    <p className="text-sm text-muted-foreground">Register as a new student</p>
                  </div>
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          type="text"
                          value={signupForm.firstName}
                          onChange={(e) => setSignupForm({ ...signupForm, firstName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          type="text"
                          value={signupForm.lastName}
                          onChange={(e) => setSignupForm({ ...signupForm, lastName: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signupEmail">Email</Label>
                      <Input
                        id="signupEmail"
                        type="email"
                        value={signupForm.email}
                        onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signupMatric">Matric Number</Label>
                      <Input
                        id="signupMatric"
                        type="text"
                        placeholder="e.g., ND/CS/2024/001"
                        value={signupForm.matricNumber}
                        onChange={(e) => setSignupForm({ ...signupForm, matricNumber: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        value={signupForm.phoneNumber}
                        onChange={(e) => setSignupForm({ ...signupForm, phoneNumber: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="level">Level</Label>
                      <Select value={signupForm.level} onValueChange={(value) => setSignupForm({ ...signupForm, level: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ND1">ND1</SelectItem>
                          <SelectItem value="ND2">ND2</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signupPin">Create 6-Digit PIN</Label>
                      <InputOTP
                        maxLength={6}
                        value={signupForm.pin}
                        onChange={(value) => setSignupForm({ ...signupForm, pin: value })}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPin">Confirm PIN</Label>
                      <InputOTP
                        maxLength={6}
                        value={signupForm.confirmPin}
                        onChange={(value) => setSignupForm({ ...signupForm, confirmPin: value })}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loading || signupForm.pin.length !== 6 || signupForm.confirmPin.length !== 6}
                    >
                      {loading ? "Creating Account..." : "Create Account"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            ) : (
              <>
                <div className="text-center mb-4">
                  <h2 className="text-xl font-semibold">Reset Password</h2>
                  <p className="text-sm text-muted-foreground">Enter your email to reset your password</p>
                </div>
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="resetEmail">Email Address</Label>
                    <Input
                      id="resetEmail"
                      type="email"
                      placeholder="Enter your registered email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Sending Reset Email..." : "Send Reset Email"}
                  </Button>
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setShowReset(false)}
                      className="text-sm text-muted-foreground hover:underline"
                    >
                      Back to login
                    </button>
                  </div>
                </form>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;