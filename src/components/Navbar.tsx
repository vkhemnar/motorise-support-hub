import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Zap, User, Settings, LogOut, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const {
    user,
    logout
  } = useAuth();
  const isActive = (path: string) => location.pathname === path;
  const navItems = user ? [] : [];
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  return <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group">
            <div className="p-1.5 sm:p-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg shadow-sm group-hover:scale-105 transition-transform duration-200">
              <Zap className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-navy hidden sm:block">MotoRise</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-primary hover:bg-muted/50'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

           {/* Right side actions */}
          <div className="hidden md:flex items-center space-x-3 sm:space-x-4">
            {user ? <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <div className={`p-1 rounded-full ${user.role === 'admin' ? 'bg-destructive' : 'bg-primary'}`}>
                    {user.role === 'admin' ? <Shield className="h-2 w-2 sm:h-3 sm:w-3 text-white" /> : <User className="h-2 w-2 sm:h-3 sm:w-3 text-white" />}
                  </div>
                  <span className="text-xs sm:text-sm text-muted-foreground capitalize">{user.role}</span>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-1.5 sm:p-2">
                      <User className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44 sm:w-48 bg-white shadow-elevation border border-border">
                    <DropdownMenuItem className="font-medium text-sm">
                      {user.name}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-xs text-muted-foreground">
                      {user.phone}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-sm">
                      <User className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-sm">
                      <Settings className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive text-sm">
                      <LogOut className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div> : <>
                <Button variant="outline" size="sm" onClick={() => navigate('/login')} className="text-xs sm:text-sm h-8 sm:h-9">
                  Sign In
                </Button>
                
              </>}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)} className="p-1.5 sm:p-2">
              {isOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && <div className="md:hidden absolute top-14 sm:top-16 left-0 right-0 bg-white border-b border-border shadow-lg">
            <div className="px-3 sm:px-4 py-3 sm:py-4 space-y-2 sm:space-y-3">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-primary hover:bg-muted/50'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {user && <div className="pt-3 border-t border-border space-y-2">
                  <div className="px-2 sm:px-3 py-2 text-sm text-muted-foreground">
                    {user.phone} ({user.role})
                  </div>
                  <Button variant="outline" className="w-full text-sm" onClick={() => {
              handleLogout();
              setIsOpen(false);
            }}>
                    <LogOut className="mr-2 h-3 w-3" />
                    Logout
                  </Button>
                </div>}
              
              {!user && <div className="pt-3 sm:pt-4 space-y-2">
                  <Button variant="outline" className="w-full text-sm" onClick={() => {
              navigate('/login');
              setIsOpen(false);
            }}>
                    Sign In
                  </Button>
                </div>}
            </div>
          </div>}
      </div>
    </nav>;
};