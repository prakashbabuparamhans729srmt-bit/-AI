import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/10 p-4">
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <Logo className="h-12 w-12" />
          </div>
          <CardTitle className="text-2xl font-headline">लॉग इन करें</CardTitle>
          <CardDescription>कुलगुरु AI में आपका स्वागत है</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">ईमेल</Label>
              <Input id="email" type="email" placeholder="name@example.com" required />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">पासवर्ड</Label>
                <Link href="#" className="ml-auto inline-block text-sm underline">
                  पासवर्ड भूल गए?
                </Link>
              </div>
              <Input id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full" asChild>
                <Link href="/dashboard">लॉग इन</Link>
            </Button>
            <Button variant="outline" className="w-full">
              Google से लॉग इन करें
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            खाता नहीं है?{' '}
            <Link href="/register" className="underline">
              पंजीकरण करें
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
