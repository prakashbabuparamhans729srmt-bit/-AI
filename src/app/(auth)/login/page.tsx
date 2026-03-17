import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';

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
              Google से लॉग इन करें
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
