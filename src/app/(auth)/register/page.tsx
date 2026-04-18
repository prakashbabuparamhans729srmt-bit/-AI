'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';
import { useAuth, useFirestore, useUser, setDocumentNonBlocking, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { createUserWithEmailAndPassword, AuthError } from 'firebase/auth';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyName.trim()) {
        toast({
            variant: 'destructive',
            title: 'परिवार का नाम आवश्यक है',
            description: 'कृपया अपने परिवार का नाम दर्ज करें।',
        });
        return;
    }
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      // 1. Create a new family for the new user
      const familiesColRef = collection(firestore, 'families');
      const familyData = {
          familyName: familyName,
          headOfFamilyUserId: newUser.uid,
          memberUserIds: [newUser.uid],
          registrationDate: serverTimestamp(),
      };
      
      const familyDocRef = await addDocumentNonBlocking(familiesColRef, familyData);
      if (!familyDocRef) {
          throw new Error("Family document could not be created.");
      }
      const familyId = familyDocRef.id;

      // 2. Update the family document with its own ID
      await updateDocumentNonBlocking(doc(firestore, 'families', familyId), { id: familyId });

      // 3. Create the user profile and link it to the new family
      const userDocRef = doc(firestore, 'users', newUser.uid);
      const userProfile = {
          id: newUser.uid,
          familyId: familyId,
          firstName: firstName,
          lastName: lastName,
          dateOfBirth: '', // Placeholder
          gender: '', // Placeholder
          email: newUser.email,
          profileImageUrl: newUser.photoURL || `https://picsum.photos/seed/${newUser.uid}/200/200`
      };
      
      await setDocumentNonBlocking(userDocRef, userProfile, { merge: true });

      toast({
        title: 'पंजीकरण सफल',
        description: 'आपका खाता बन गया है। अब आपको डैशबोर्ड पर ले जाया जा रहा है।',
      });

      router.push('/dashboard');

    } catch (error) {
      const authError = error as AuthError;
      toast({
        variant: 'destructive',
        title: 'पंजीकरण विफल',
        description: authError.code ? authError.message : (error as Error).message,
      });
    } finally {
      setIsLoading(false);
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
    <div className="flex min-h-screen items-center justify-center bg-secondary/10 p-4">
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
             <Logo className="h-12 w-12" />
          </div>
          <CardTitle className="text-2xl font-headline">निःशुल्क पंजीकरण करें</CardTitle>
          <CardDescription>आज ही अपनी आध्यात्मिक यात्रा शुरू करें</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="first-name">पहला नाम</Label>
                    <Input id="first-name" placeholder="उदा. राजेश" required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="last-name">अंतिम नाम</Label>
                    <Input id="last-name" placeholder="उदा. शर्मा" required value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="family-name">परिवार का नाम</Label>
              <Input 
                id="family-name" 
                placeholder="उदा. शर्मा परिवार" 
                required 
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">ईमेल</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">पासवर्ड (कम से कम 6 अक्षर)</Label>
              <Input 
                id="password" 
                type="password" 
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              खाता बनाएं
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            पहले से ही एक खाता है?{' '}
            <Link href="/login" className="underline">
              लॉग इन
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
