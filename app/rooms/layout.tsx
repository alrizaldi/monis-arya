'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import Sidebar from '@/components/Sidebar';

export default function RoomsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session } = useAuth();
  const router = useRouter();

  // Redirect only when session is definitively null (not just undefined during loading)
  useEffect(() => {
    if (session === null) {
      router.push('/login');
    }
  }, [session, router]);

  // Show loading state while session is being determined
  if (session === undefined) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // If session is null (user not authenticated), don't render anything since redirect is happening
  if (session === null) {
    return null;
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
        {children}
      </main>
    </div>
  );
}