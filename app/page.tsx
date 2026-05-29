'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard which has the sidebar and navigation
    router.push('/dashboard');
  }, []);

  return null; // Render nothing since we're redirecting
}