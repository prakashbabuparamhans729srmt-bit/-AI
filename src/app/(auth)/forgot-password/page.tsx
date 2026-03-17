'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';
import { useAuth } from '@/firebase';
import { sendPasswordResetEmail, AuthError } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';


export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const { toast } = useToast();

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        variant: 'destructive',
        title: 'ईमेल आवश्यक है',
        description: 'कृपया अपना ईमेल पता दर्ज करें।',
      });
      return;
    }
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: 'ईमेल भेजा गया',
        description: 'पासवर्ड रीसेट करने के लिए लिंक आपके ईमेल पर भेज दिया गया है।',
      });
    } catch (error) {
      const authError = error as AuthError;
      toast({
        variant: 'destructive',
        title: 'त्रुटि',
        description: authError.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/10 p-4">
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <Logo className="h-12 w-12" />
          </div>
          <CardTitle className="text-2xl font-headline">पासवर्ड भूल गए?</CardTitle>
          <CardDescription>अपना ईमेल दर्ज करें और हम आपको पासवर्ड रीसेट करने के लिए एक लिंक भेजेंगे।</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordReset} className="grid gap-4">
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
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              रीसेट लिंक भेजें
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <Link href="/login" className="underline">
              लॉग इन पर वापस जाएं
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
