import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';

export default function RegisterPage() {
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
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="family-name">परिवार का नाम</Label>
              <Input id="family-name" placeholder="उदा. शर्मा परिवार" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">ईमेल</Label>
              <Input id="email" type="email" placeholder="name@example.com" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">पासवर्ड</Label>
              <Input id="password" type="password" />
            </div>
            <Button type="submit" className="w-full" asChild>
                <Link href="/dashboard">खाता बनाएं</Link>
            </Button>
          </div>
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
