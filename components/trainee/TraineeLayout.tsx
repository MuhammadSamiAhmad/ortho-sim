"use client";

import type React from "react";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Activity,
  Trophy,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  GraduationCap,
} from "lucide-react";

interface TraineeLayoutProps {
  children: React.ReactNode;
  currentPage: "dashboard" | "attempts" | "rankings" | "chat" | "settings";
}

const TraineeLayout = ({ children, currentPage }: TraineeLayoutProps) => {
  const { data: session } = useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigation = [
    {
      name: "Dashboard",
      href: "/trainee/dashboard",
      icon: LayoutDashboard,
      current: currentPage === "dashboard",
    },
    {
      name: "My Attempts",
      href: "/trainee/surgical-attempts",
      icon: Activity,
      current: currentPage === "attempts",
    },
    {
      name: "Rankings",
      href: "/trainee/rankings",
      icon: Trophy,
      current: currentPage === "rankings",
    },
    {
      name: "AI Assistant",
      href: "/trainee/chatbot",
      icon: MessageSquare,
      current: currentPage === "chat",
    },
    {
      name: "Account Settings",
      href: "/trainee/settings",
      icon: Settings,
      current: currentPage === "settings",
    },
  ];

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-black/20 backdrop-blur-xl border-r border-white/10 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#00cfb6] rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-slate-900" />
              </div>
              <div>
                <h2 className="text-white font-semibold">OrthoSim</h2>
                <p className="text-gray-400 text-sm">Trainee Portal</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#00cfb6] rounded-full flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-slate-900" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">
                  {session?.user?.name}
                </p>
                <p className="text-gray-400 text-sm truncate">
                  {session?.user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={item.current ? "secondary" : "ghost"}
                    className={`w-full justify-start ${
                      item.current
                        ? "bg-[#00cfb6] text-slate-900 hover:bg-[#00cfb6]/90"
                        : "text-gray-300 hover:text-white hover:bg-white/10"
                    }`}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* Sign Out */}
          <div className="p-6 border-t border-white/10">
            <Button
              onClick={handleSignOut}
              variant="ghost"
              className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-white/10 bg-black/20 backdrop-blur-xl">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(true)}
            className="text-gray-400 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </Button>
          <h1 className="text-white font-semibold capitalize">{currentPage}</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default TraineeLayout;
