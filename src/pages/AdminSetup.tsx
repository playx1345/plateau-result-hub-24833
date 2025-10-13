import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminSetup() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ step: string; success: boolean }[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  const addStatus = (step: string, success: boolean) => {
    setStatus(prev => [...prev, { step, success }]);
  };

  const setupAdmin = async () => {
    setLoading(true);
    setStatus([]);

    try {
      // Create admin account
      addStatus('Creating admin account...', true);
      const { data: adminAuth, error: adminAuthError } = await supabase.auth.admin.createUser({
        email: 'admin@plasu.edu.ng',
        password: 'Admin1234',
        email_confirm: true,
        user_metadata: { full_name: 'Admin Poly' }
      });

      if (adminAuthError) {
        addStatus('Admin creation failed: ' + adminAuthError.message, false);
        throw adminAuthError;
      }

      const { error: adminError } = await supabase.from('admins').insert({
        user_id: adminAuth.user.id,
        first_name: 'Admin',
        last_name: 'Poly',
        email: 'admin@plasu.edu.ng',
        staff_id: 'PLASU-ADMIN-001',
        department: 'Computer Science',
        role: 'Super Admin'
      });

      if (adminError) {
        addStatus('Admin profile creation failed: ' + adminError.message, false);
        throw adminError;
      }
      
      addStatus('Admin account created successfully', true);

      toast({
        title: "Admin Setup Complete!",
        description: "Admin account has been created successfully.",
      });

      setTimeout(() => navigate('/admin/login'), 2000);

    } catch (error: any) {
      console.error('Admin setup error:', error);
      toast({
        title: "Setup Failed",
        description: error.message || "An error occurred during admin setup.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Account Setup</h1>
          <p className="text-muted-foreground">
            Click the button below to create the admin account
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Admin Credentials:</h3>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Email:</strong> admin@plasu.edu.ng<br />
                <strong>Password:</strong> Admin1234<br />
                <strong>Name:</strong> Admin Poly<br />
                <strong>Staff ID:</strong> PLASU-ADMIN-001<br />
                <strong>Department:</strong> Computer Science
              </div>
            </div>
          </div>
        </div>

        <Button 
          onClick={setupAdmin} 
          disabled={loading}
          className="w-full mb-6"
          size="lg"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? 'Creating admin account...' : 'Create Admin Account'}
        </Button>

        {status.length > 0 && (
          <div className="space-y-2 bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">
            {status.map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                {item.success ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span>{item.step}</span>
              </div>
            ))}
          </div>
        )}

        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="w-full mt-4"
        >
          Back to Home
        </Button>
      </Card>
    </div>
  );
}
