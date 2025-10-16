import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthWrapper";
import { Bell } from "lucide-react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { StudentSidebar } from "@/components/StudentSidebar";

interface Announcement {
  id: string;
  title: string;
  content: string;
  target_level?: 'ND1' | 'ND2';
  is_general: boolean;
  created_at: string;
}

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  level: 'ND1' | 'ND2';
}

const StudentAnnouncements = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [student, setStudent] = useState<Student | null>(null);

  useEffect(() => {
    if (!authLoading) {
      loadData();
    }
  }, [authLoading, user]);

  const loadData = async () => {
    if (!user) {
      navigate("/auth?mode=login");
      return;
    }

    try {
      // Load student data
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('id, first_name, last_name, level')
        .eq('user_id', user.id)
        .single();

      if (studentError) {
        toast({
          title: "Error",
          description: "Failed to load student profile",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      setStudent(studentData);

      // Load announcements (general + specific to student level)
      const { data: announcementsData, error: announcementsError } = await supabase
        .from('announcements')
        .select('*')
        .or(`is_general.eq.true,target_level.eq.${studentData.level}`)
        .order('created_at', { ascending: false });

      if (announcementsError) {
        toast({
          title: "Error",
          description: "Failed to load announcements",
          variant: "destructive",
        });
      } else {
        setAnnouncements(announcementsData || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <StudentSidebar studentName={student ? `${student.first_name} ${student.last_name}` : "Student"} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2 flex-1">
            <Bell className="w-5 h-5" />
            <h1 className="text-xl font-semibold">Announcements</h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <Card>
            <CardHeader>
              <CardTitle>Latest Announcements</CardTitle>
              <CardDescription>
                Stay updated with important information and notices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {announcements.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No announcements at this time</p>
                  </div>
                ) : (
                  announcements.map((announcement) => (
                    <Card key={announcement.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <CardTitle className="text-lg">{announcement.title}</CardTitle>
                            <CardDescription>
                              {announcement.is_general ? (
                                <Badge variant="secondary">General</Badge>
                              ) : (
                                <Badge variant="outline">{announcement.target_level}</Badge>
                              )}
                              {" • "}
                              {new Date(announcement.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm whitespace-pre-wrap">{announcement.content}</p>
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

export default StudentAnnouncements;
