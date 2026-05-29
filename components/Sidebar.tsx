'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { 
  Home, 
  Users, 
  Bed, 
  CreditCard, 
  FileText, 
  AlertTriangle, 
  Activity, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from './AuthProvider';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Patients', href: '/patients', icon: Users },
  { name: 'Rooms', href: '/rooms', icon: Bed },
  { name: 'Payers', href: '/payers', icon: CreditCard },
  { name: 'Submissions', href: '/submissions', icon: FileText },
  { name: 'Pending Monitor', href: '/pending', icon: AlertTriangle },
  { name: 'Audit Logs', href: '/audit', icon: Activity },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="icon" onClick={toggleSidebar}>
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Desktop sidebar - only visible on medium screens and larger */}
      <aside className="hidden md:block fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg flex flex-col">
        <div className="flex items-center justify-center h-16 border-b">
          <h1 className="text-xl font-bold text-blue-600">Insurance Monitor</h1>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <Link href={item.href}>
                    <div
                      className={`flex items-center px-4 py-3 rounded-lg cursor-pointer transition-colors ${
                        pathname === item.href
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      <span>{item.name}</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        <div className="p-4 border-t mt-auto">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile sidebar - appears as overlay when toggled */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:hidden transition-transform duration-300 ease-in-out flex flex-col`}
      >
        <div className="flex items-center justify-center h-16 border-b">
          <h1 className="text-xl font-bold text-blue-600">Insurance Monitor</h1>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <Link href={item.href} onClick={() => setIsOpen(false)}>
                    <div
                      className={`flex items-center px-4 py-3 rounded-lg cursor-pointer transition-colors ${
                        pathname === item.href
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      <span>{item.name}</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        <div className="p-4 border-t mt-auto">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => {
              handleSignOut();
              setIsOpen(false);
            }}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
}