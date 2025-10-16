import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthWrapper";
import { CreditCard, Search, CheckCircle, XCircle, Clock } from "lucide-react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";

interface FeePayment {
  id: string;
  student_id: string;
  status: string;
  session: string;
  semester: string;
  amount_paid?: number;
  student?: {
    matric_number: string;
    first_name: string;
    last_name: string;
    email: string;
    level: string;
  };
}

const AdminFeeManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [feePayments, setFeePayments] = useState<FeePayment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [admin, setAdmin] = useState<any>(null);

  useEffect(() => {
    if (!authLoading) {
      checkAdminAccess();
    }
  }, [authLoading, user]);

  const checkAdminAccess = async () => {
    const adminSession = localStorage.getItem('adminSession');
    if (adminSession) {
      try {
        const sessionData = JSON.parse(adminSession);
        if (sessionData.isDefaultAdmin) {
          setAdmin(sessionData);
          await loadFeePayments();
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error('Admin session error:', error);
      }
    }

    if (!user) {
      navigate("/admin/login");
      return;
    }

    const { data: adminData, error } = await supabase
      .from('admins')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error || !adminData) {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    setAdmin(adminData);
    await loadFeePayments();
    setLoading(false);
  };

  const loadFeePayments = async () => {
    const { data, error } = await supabase
      .from('fee_payments')
      .select(`
        *,
        student:students(matric_number, first_name, last_name, email, level)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load fee payments",
        variant: "destructive",
      });
      return;
    }

    setFeePayments(data || []);
  };

  const updateFeeStatus = async (id: string, status: 'paid' | 'unpaid' | 'partial') => {
    const { error } = await supabase
      .from('fee_payments')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update fee status",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Fee status updated successfully",
    });

    await loadFeePayments();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'unpaid':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'partial':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" } = {
      paid: "default",
      unpaid: "destructive",
      partial: "secondary",
    };
    return <Badge variant={variants[status] || "secondary"}>{status.toUpperCase()}</Badge>;
  };

  const filteredPayments = feePayments.filter(payment => {
    const matchesSearch = payment.student?.matric_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.student?.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.student?.last_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || payment.status === filterStatus;
    const matchesLevel = filterLevel === "all" || payment.student?.level === filterLevel;
    return matchesSearch && matchesStatus && matchesLevel;
  });

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <AdminSidebar adminName={admin?.first_name ? `${admin.first_name} ${admin.last_name}` : "Administrator"} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2 flex-1">
            <CreditCard className="w-5 h-5" />
            <h1 className="text-xl font-semibold">Fee Management</h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <Card>
            <CardHeader>
              <CardTitle>Manage Student Fee Payments</CardTitle>
              <CardDescription>View and update student fee payment statuses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <Label htmlFor="search">Search Student</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by matric number or name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger id="status" className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="unpaid">Unpaid</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="level">Level</Label>
                  <Select value={filterLevel} onValueChange={setFilterLevel}>
                    <SelectTrigger id="level" className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="ND1">ND1</SelectItem>
                      <SelectItem value="ND2">ND2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Matric Number</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Semester</TableHead>
                      <TableHead>Session</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No fee payment records found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-mono">{payment.student?.matric_number}</TableCell>
                          <TableCell>
                            {payment.student?.first_name} {payment.student?.last_name}
                          </TableCell>
                          <TableCell>{payment.student?.level}</TableCell>
                          <TableCell>{payment.semester}</TableCell>
                          <TableCell>{payment.session}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(payment.status)}
                              {getStatusBadge(payment.status)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={payment.status}
                              onValueChange={(value) => updateFeeStatus(payment.id, value as any)}
                            >
                              <SelectTrigger className="w-[130px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="paid">Mark Paid</SelectItem>
                                <SelectItem value="unpaid">Mark Unpaid</SelectItem>
                                <SelectItem value="partial">Mark Partial</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AdminFeeManagement;
