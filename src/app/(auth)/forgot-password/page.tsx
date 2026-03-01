import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';

export default function ForgotPasswordPage() {
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
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">ईमेल</Label>
              <Input id="email" type="email" placeholder="name@example.com" required />
            </div>
            <Button type="submit" className="w-full">
              रीसेट लिंक भेजें
            </Button>
          </div>
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
