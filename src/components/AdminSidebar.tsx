import { useNavigate, useLocation } from "react-router-dom";
import {
  Shield,
  Home,
  Users,
  FileText,
  CreditCard,
  Bell,
  Calculator,
  LogOut,
  Settings
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface AdminSidebarProps {
  adminName?: string;
}

export function AdminSidebar({ adminName = "Administrator" }: AdminSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    localStorage.removeItem('adminSession');
    await supabase.auth.signOut();
    navigate("/");
  };

  const menuItems = [
    {
      title: "Dashboard",
      icon: Home,
      path: "/admin/dashboard",
    },
    {
      title: "Manage Students",
      icon: Users,
      path: "/admin/students",
    },
    {
      title: "Upload Results",
      icon: FileText,
      path: "/admin/upload",
    },
    {
      title: "Fee Management",
      icon: CreditCard,
      path: "/admin/fees",
    },
    {
      title: "Announcements",
      icon: Bell,
      path: "/admin/announcements",
    },
    {
      title: "CGP Calculator",
      icon: Calculator,
      path: "/admin/cgp-calculator",
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-orange-600 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">Admin Portal</h2>
            <p className="text-xs text-muted-foreground">{adminName}</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.path)}
                    isActive={location.pathname === item.path}
                    tooltip={item.title}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
