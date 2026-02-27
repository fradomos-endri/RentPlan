import { Link, useLocation } from 'react-router-dom';
import { Settings, Menu, Car, LogOut, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import rentplanLogo from '@/assets/rentplan.png';
import { getStoredUser, logout, isLoggedIn } from '@/lib/auth';

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const user = getStoredUser();
  const loggedIn = isLoggedIn();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const navLinks = [
    { label: 'Browse Cars', href: '/cars' },
    { label: 'Agencies', href: '/agencies' },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'FAQ', href: '/faq' },
  ];

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${
      isHomePage 
        ? isScrolled 
          ? 'bg-white/90 backdrop-blur-md border-b border-gray-200/50 shadow-sm' 
          : 'bg-transparent border-b border-transparent'
        : 'bg-white border-b border-gray-200 shadow-sm'
    }`}>
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-baseline gap-0 group hover:opacity-80 transition">
          <span className={`font-black text-xl ${isHomePage && !isScrolled ? 'text-white' : 'text-gray-900'}`}>Rent</span>
          <span className="font-black text-xl text-blue-400">Plan</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.href} to={link.href}>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`${
                  isHomePage 
                    ? isScrolled
                      ? 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                      : 'text-white hover:text-white hover:bg-white/10'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {link.label}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Auth Section */}
        <div className="flex items-center gap-2">
          {loggedIn && user ? (
            <>
              {/* User Menu Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`rounded-full p-0 h-10 w-10 ${
                      isHomePage
                        ? isScrolled
                          ? 'text-blue-600 hover:bg-blue-50 border border-blue-200'
                          : 'text-white hover:bg-white/10 border border-white/30'
                        : 'text-blue-600 hover:bg-blue-50 border border-blue-200'
                    }`}
                  >
                    <UserIcon className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.full_name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    {user.role === 'business' && <p className="text-xs leading-none text-blue-600 font-semibold">Business Account</p>}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <UserIcon className="mr-2 h-4 w-4" />
                      <span>My Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link to="/signin" className="hidden md:block">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`${
                    isHomePage 
                      ? 'text-white/90 hover:text-white hover:bg-white/10' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Sign In
                </Button>
              </Link>
              <Link to="/signup" className="hidden md:block">
                <Button size="sm" className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-md">
                  Sign Up
                </Button>
              </Link>
            </>
          )}

          {/* Mobile nav */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button 
                variant="ghost" 
                size="icon" 
                className={`${
                  isHomePage 
                    ? isScrolled
                      ? 'text-gray-700 hover:text-gray-900'
                      : 'text-white hover:text-white hover:bg-white/10'
                    : 'text-gray-700'
                }`}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <nav className="flex flex-col gap-2 mt-8">
                {navLinks.map((link) => (
                  <Link 
                    key={link.href} 
                    to={link.href}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Button variant="ghost" className="w-full justify-start">
                      {link.label}
                    </Button>
                  </Link>
                ))}
                <hr className="my-4" />
                {loggedIn && user ? (
                  <>
                    <Link to="/profile" onClick={() => setMobileOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <UserIcon className="mr-2 h-4 w-4" />
                        My Profile
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-red-500 hover:text-red-600"
                      onClick={() => {
                        handleLogout();
                        setMobileOpen(false);
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/signin" onClick={() => setMobileOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/signup" onClick={() => setMobileOpen(false)}>
                      <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white">
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
