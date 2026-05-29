'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      let result;
      if (isSignUp) {
        result = await signUp(email, password);
      } else {
        result = await signIn(email, password);
      }
      
      if (result.error) {
        // Handle specific error messages
        if (result.error.message.includes('Rate limit')) {
          setError('Too many requests. Please try again later or contact administrator.');
        } else if (result.error.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please try again.');
        } else if (result.error.message.includes('User already registered')) {
          setError('Email already registered. Please try logging in instead.');
        } else {
          setError(result.error.message || 'An unexpected error occurred');
        }
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">{isSignUp ? 'Create Account' : 'Login'}</CardTitle>
          <CardDescription>
            {isSignUp 
              ? 'Enter your details to create an account for the insurance approval monitoring system'
              : 'Enter your credentials to access the insurance approval monitoring system'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="you@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                minLength={6}
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
            </Button>
            
            <div className="mt-4 text-center text-sm text-gray-600">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                }}
                disabled={isLoading}
                className="font-medium text-blue-600 hover:text-blue-500 disabled:opacity-50"
              >
                {isSignUp 
                  ? 'Already have an account? Sign in' 
                  : "Don't have an account? Sign up"}
              </button>
            </div>
            
            <p className="mt-4 text-center text-xs text-gray-500">
              Note: First-time users need to create an account. 
              If you encounter rate limits, please contact the system administrator to create your account.
              Demo credentials: demo@example.com / password123 (if available)
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}