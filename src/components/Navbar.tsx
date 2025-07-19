import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Zap, User, Settings, LogOut, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const navItems = user ? [
    { name: 'Home', path: '/' },
    ...(user.role === 'admin' ? [
      { name: 'Dashboard', path: '/admin' },
      { name: 'All Tickets', path: '/admin/tickets' }
    ] : [
      { name: 'Support Chat', path: '/chat' },
      { name: 'My Tickets', path: '/tickets' },
      { name: 'FAQ', path: '/faq' }
    ])
  ] : [
    { name: 'Home', path: '/' },
    { name: 'Support', path: '/support' },
    { name: 'FAQ', path: '/faq' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="p-2 bg-[var(--gradient-primary)] rounded-lg shadow-[var(--shadow-electric)] group-hover:scale-105 transition-transform duration-200">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-navy">MotoRise</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right side actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className={`p-1 rounded-full ${user.role === 'admin' ? 'bg-destructive' : 'bg-primary'}`}>
                    {user.role === 'admin' ? (
                      <Shield className="h-3 w-3 text-white" />
                    ) : (
                      <User className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground capitalize">{user.role}</span>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-2">
                      <User className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-white shadow-elevation border border-border">
                    <DropdownMenuItem className="font-medium">
                      {user.name}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-xs text-muted-foreground">
                      {user.phone}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </Button>
                <Button 
                  className="btn-electric"
                  onClick={() => navigate('/login')}
                >
                  Get Support
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-border shadow-lg">
            <div className="px-4 py-4 space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-3 py-2 rounded-md text-base ${
                    isActive(item.path)
                      ? 'bg-primary text-white'
                      : 'text-muted-foreground hover:text-primary hover:bg-secondary'
                  } transition-colors duration-200`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 space-y-2">
                <Button variant="outline" className="w-full">
                  Sign In
                </Button>
                <Button className="w-full btn-electric">
                  Get Support
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};