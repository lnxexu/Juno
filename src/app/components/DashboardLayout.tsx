import { Outlet, Link, useLocation } from 'react-router';
import {
  LayoutDashboard,
  MessageSquare,
  Brain,
  Users,
  BarChart3,
  Settings,
  Menu,
  X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';

export function DashboardLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof navigator === 'undefined') {
      return true;
    }

    return navigator.onLine;
  });
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Conversations', href: '/dashboard/conversations', icon: MessageSquare },
    { name: 'AI Training', href: '/dashboard/ai-training', icon: Brain },
    { name: 'Leads', href: '/dashboard/leads', icon: Users },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl">ReplyAI</span>
            </div>
            <button
              className="md:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${active
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white">
                {user?.name.split(' ').map(n => n[0]).join('') || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm truncate">{user?.name || 'User'}</div>
                <div className="text-xs text-gray-500 truncate">{user?.email || ''}</div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <button
            className="md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
              isOnline
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isOnline
                  ? 'bg-green-500 animate-pulse'
                  : 'bg-red-500'
              }`} />
              {isOnline ? 'AI Online' : 'AI Offline'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
