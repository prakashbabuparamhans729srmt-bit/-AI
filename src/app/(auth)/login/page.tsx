'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';
import { User, Loader2 } from 'lucide-react';
import { useAuth, useUser, useFirestore, setDocumentNonBlocking } from '@/firebase';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  AuthError,
} from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (error) {
      const authError = error as AuthError;
      toast({
        variant: 'destructive',
        title: 'लॉग इन विफल',
        description: authError.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const googleUser = result.user;

      // Create/merge user profile in Firestore
      const userDocRef = doc(firestore, 'users', googleUser.uid);
      const displayName = googleUser.displayName || '';
      const [firstName, ...lastNameParts] = displayName.split(' ');
      const lastName = lastNameParts.join(' ');

      const userProfile = {
        id: googleUser.uid,
        familyId: null, // User can create/join a family later
        firstName: firstName || 'उपयोगकर्ता',
        lastName: lastName || '',
        dateOfBirth: '', // Placeholder
        gender: '', // Placeholder
        email: googleUser.email,
        profileImageUrl: googleUser.photoURL || `https://picsum.photos/seed/${googleUser.uid}/200/200`
      };
      
      // Use non-blocking set to create/merge the profile document
      setDocumentNonBlocking(userDocRef, userProfile, { merge: true });

      router.push('/dashboard');
    } catch (error) {
      const authError = error as AuthError;
      toast({
        variant: 'destructive',
        title: 'Google साइन-इन विफल',
        description: authError.message,
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };
  
  const handleGuestSignIn = async () => {
    setIsGuestLoading(true);
    try {
      const userCredential = await signInAnonymously(auth);
      const guestUser = userCredential.user;

      // Create a user profile for the guest user
      const userDocRef = doc(firestore, 'users', guestUser.uid);
      const userProfile = {
        id: guestUser.uid,
        familyId: null, // No family for guests
        firstName: 'अतिथि',
        lastName: '',
        dateOfBirth: '', // Placeholder
        gender: '', // Placeholder
        email: null,
        profileImageUrl: guestUser.photoURL || `https://picsum.photos/seed/${guestUser.uid}/200/200`
      };
      
      // Use non-blocking set to create the profile document
      setDocumentNonBlocking(userDocRef, userProfile, { merge: true });

      router.push('/dashboard');
    } catch (error) {
       const authError = error as AuthError;
       toast({
        variant: 'destructive',
        title: 'अतिथि लॉग इन विफल',
        description: authError.message,
      });
    } finally {
        setIsGuestLoading(false);
    }
  };


  if (isUserLoading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-background via-primary/10 to-secondary/10 p-4">
      <Card className="mx-auto w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mb-4 flex justify-center">
            <Logo className="h-16 w-16" />
          </div>
          <CardTitle className="text-3xl font-headline text-primary">लॉग इन करें</CardTitle>
          <CardDescription className="text-lg">कुलगुरु AI में आपका स्वागत है</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">ईमेल</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com" 
                required 
                className="bg-background/80" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">पासवर्ड</Label>
                <Link href="/forgot-password" className="ml-auto inline-block text-sm underline hover:text-primary">
                  पासवर्ड भूल गए?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                required 
                className="bg-background/80" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full text-lg py-6" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              लॉग इन
            </Button>
          </form>
             <div className="relative mt-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  या
                </span>
              </div>
            </div>
            <div className="grid gap-4 pt-4">
            <Button variant="outline" className="w-full text-lg py-6" onClick={handleGoogleSignIn} disabled={isGoogleLoading}>
              {isGoogleLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5"><title>Google</title><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.08-2.58 1.9-4.55 1.9-3.46 0-6.3-2.8-6.3-6.2s2.84-6.2 6.3-6.2c2.03 0 3.38.77 4.16 1.5l2.4-2.32C17.4.82 15.14 0 12.48 0 5.86 0 0 5.58 0 12s5.86 12 12.48 12c7.14 0 11.94-4.96 11.94-12.2 0-.76-.08-1.5-.22-2.22H12.48z"/></svg>}
              Google से लॉग इन करें
            </Button>
            <Button variant="secondary" className="w-full text-lg py-6" onClick={handleGuestSignIn} disabled={isGuestLoading}>
                {isGuestLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <User className="mr-2 h-5 w-5" />}
                अतिथि के रूप में जारी रखें
            </Button>
            </div>
          <div className="mt-6 text-center text-sm">
            खाता नहीं है?{' '}
            <Link href="/register" className="underline hover:text-primary">
              पंजीकरण करें
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
