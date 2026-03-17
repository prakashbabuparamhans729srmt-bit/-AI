import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';
import { User } from 'lucide-react';

export default function LoginPage() {
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
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">ईमेल</Label>
              <Input id="email" type="email" placeholder="name@example.com" required className="bg-background/80" />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">पासवर्ड</Label>
                <Link href="/forgot-password" className="ml-auto inline-block text-sm underline hover:text-primary">
                  पासवर्ड भूल गए?
                </Link>
              </div>
              <Input id="password" type="password" required className="bg-background/80" />
            </div>
            <Button type="submit" className="w-full text-lg py-6" asChild>
                <Link href="/dashboard">लॉग इन</Link>
            </Button>
             <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  या
                </span>
              </div>
            </div>
            <Button variant="outline" className="w-full text-lg py-6">
              <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5"><title>Google</title><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.08-2.58 1.9-4.55 1.9-3.46 0-6.3-2.8-6.3-6.2s2.84-6.2 6.3-6.2c2.03 0 3.38.77 4.16 1.5l2.4-2.32C17.4.82 15.14 0 12.48 0 5.86 0 0 5.58 0 12s5.86 12 12.48 12c7.14 0 11.94-4.96 11.94-12.2 0-.76-.08-1.5-.22-2.22H12.48z"/></svg>
              Google से लॉग इन करें
            </Button>
            <Button variant="secondary" className="w-full text-lg py-6" asChild>
                <Link href="/dashboard">
                    <User className="mr-2 h-5 w-5" />
                    अतिथि के रूप में जारी रखें
                </Link>
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
