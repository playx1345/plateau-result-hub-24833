import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthWrapper";
import { Bell, Plus, Trash2 } from "lucide-react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Announcement {
  id: string;
  title: string;
  content: string;
  target_level?: 'ND1' | 'ND2';
  is_general: boolean;
  created_at: string;
  created_by: string;
}

const AdminAnnouncements = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [admin, setAdmin] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    target_level: "",
    is_general: true,
  });

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
          await loadAnnouncements();
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
    await loadAnnouncements();
    setLoading(false);
  };

  const loadAnnouncements = async () => {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load announcements",
        variant: "destructive",
      });
      return;
    }

    setAnnouncements(data || []);
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!admin?.id) {
      toast({
        title: "Error",
        description: "Admin ID not found",
        variant: "destructive",
      });
      return;
    }

    const announcementData: any = {
      title: newAnnouncement.title,
      content: newAnnouncement.content,
      is_general: newAnnouncement.is_general,
      created_by: admin.id,
    };

    if (!newAnnouncement.is_general && newAnnouncement.target_level) {
      announcementData.target_level = newAnnouncement.target_level;
    }

    const { error } = await supabase
      .from('announcements')
      .insert([announcementData]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create announcement",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Announcement created successfully",
    });

    setNewAnnouncement({
      title: "",
      content: "",
      target_level: "",
      is_general: true,
    });
    setShowForm(false);
    await loadAnnouncements();
  };

  const handleDeleteAnnouncement = async (id: string) => {
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete announcement",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Announcement deleted successfully",
    });

    await loadAnnouncements();
  };

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
            <Bell className="w-5 h-5" />
            <h1 className="text-xl font-semibold">Announcements</h1>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-2" />
            New Announcement
          </Button>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          {showForm && (
            <Card>
              <CardHeader>
                <CardTitle>Create New Announcement</CardTitle>
                <CardDescription>Send announcements to students</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newAnnouncement.title}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      value={newAnnouncement.content}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                      rows={4}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Announcement Type</Label>
                    <Select
                      value={newAnnouncement.is_general ? "general" : "specific"}
                      onValueChange={(value) => {
                        setNewAnnouncement({
                          ...newAnnouncement,
                          is_general: value === "general",
                          target_level: value === "general" ? "" : newAnnouncement.target_level,
                        });
                      }}
                    >
                      <SelectTrigger id="type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General (All Students)</SelectItem>
                        <SelectItem value="specific">Specific Level</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {!newAnnouncement.is_general && (
                    <div className="space-y-2">
                      <Label htmlFor="level">Target Level</Label>
                      <Select
                        value={newAnnouncement.target_level}
                        onValueChange={(value) => setNewAnnouncement({ ...newAnnouncement, target_level: value })}
                      >
                        <SelectTrigger id="level">
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ND1">ND1</SelectItem>
                          <SelectItem value="ND2">ND2</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button type="submit">Create Announcement</Button>
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>All Announcements</CardTitle>
              <CardDescription>Manage your announcements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {announcements.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No announcements yet</p>
                ) : (
                  announcements.map((announcement) => (
                    <Card key={announcement.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg">{announcement.title}</CardTitle>
                            <CardDescription>
                              {announcement.is_general ? (
                                <Badge variant="secondary">General</Badge>
                              ) : (
                                <Badge variant="outline">{announcement.target_level}</Badge>
                              )}
                              {" • "}
                              {new Date(announcement.created_at).toLocaleDateString()}
                            </CardDescription>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this announcement? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteAnnouncement(announcement.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{announcement.content}</p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AdminAnnouncements;
