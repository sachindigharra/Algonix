import React, { useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Code2, Trophy, BookOpen, User,
  BarChart3, ChevronLeft, ChevronRight, Flame, Settings,
  LogOut, Menu, X, Sun, Moon, FileSpreadsheet } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/lib/Theme';

const navItems = [
{ icon: LayoutDashboard, label: 'Dashboard', path: '/' },
{ icon: Code2, label: 'Problems', path: '/problems' },
{ icon: Trophy, label: 'Contests', path: '/contests' },
{ icon: BookOpen, label: 'Learning', path: '/learning' },
{ icon: BarChart3, label: 'Analytics', path: '/analytics' },
{ icon: User, label: 'Portfolio', path: '/portfolio' },
{ icon: Settings, label: 'Settings', path: '/settings' },
{ icon: FileSpreadsheet, label: 'Import', path: '/import' }];


export default function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleMobileToggle = useCallback(() => setMobileOpen(prev => !prev), []);
  const handleCollapse = useCallback(() => setCollapsed(prev => !prev), []);
  const handleLogout = useCallback(() => supabase.auth.signOut(), []);
  const handleMobileClose = useCallback(() => setMobileOpen(false), []);

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 right-0 h-14 z-50 lg:hidden bg-card border-b border-border flex items-center px-4 gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="flex-shrink-0 text-foreground hover:text-foreground"
          onClick={handleMobileToggle}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <Flame className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-bold text-base tracking-tight text-foreground">Codolio</span>
      </div>

      {/* Overlay */}
      




      

      <aside className={cn(
      "fixed top-0 left-0 h-full z-40 bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300",
        collapsed ? "w-[72px]" : "w-64",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-border gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <Flame className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className={cn("font-bold text-lg tracking-tight transition-all duration-300 text-foreground", collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100")}>Codolio</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleMobileClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  isActive ?
                  "bg-primary text-primary-foreground shadow-md shadow-primary/20" :
                  "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                )}>
                
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>);

          })}
        </nav>

        {/* Collapse toggle */}
        <div className="hidden lg:flex items-center justify-end p-3 border-t border-border">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleCollapse}>
            
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>

        {/* Theme Toggle */}
        <div className="px-3 pb-2">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all w-full"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 flex-shrink-0" /> : <Moon className="w-5 h-5 flex-shrink-0" />}
            {!collapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
        </div>

        {/* Logout */}
        <div className="p-3 border-t border-border">
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-all w-full"
            )}>
            
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>);

}