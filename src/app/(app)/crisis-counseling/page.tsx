'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Headset, MessageCircle, Music, BookOpen, Wind } from 'lucide-react';
import Link from 'next/link';

const crisisTypes = [
  '😢 पारिवारिक कलह', '😟 आर्थिक तनाव', '😔 मृत्यु शोक',
  '😤 क्रोध समस्या', '😨 भय/चिंता', '😞 अकेलापन',
  '🍷 नशे की लत', '💔 वैवाहिक समस्या', '👴 बुजुर्ग देखभाल',
];

const immediateHelp = [
    { icon: <Music />, text: '5 मिनट का ध्यान संगीत', action: 'सुनें', href: '/crisis-counseling/listen' },
    { icon: <MessageCircle />, text: '"ॐ" का जाप', action: 'करें', href: '/crisis-counseling/chant' },
    { icon: <Wind />, text: '2 मिनट की गहरी सांसें', action: 'शुरू करें', href: '/crisis-counseling/breathe' },
    { icon: <BookOpen />, text: 'प्रेरणादायक कहानी', action: 'पढ़ें', href: '/crisis-counseling/story' },
];

export default function CrisisCounselingPage() {
  const [selectedCrisis, setSelectedCrisis] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      <Card className="text-center bg-gradient-to-br from-destructive/80 to-destructive/60 text-destructive-foreground">
        <CardHeader>
          <CardTitle className="font-headline text-4xl">🆘 क्या आपको सहायता चाहिए?</CardTitle>
          <CardDescription className="text-destructive-foreground/80 text-lg">
            🌟 आप अकेले नहीं हैं। हम आपके साथ हैं।
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center gap-4">
          <Button variant="secondary" size="lg" className="bg-white text-destructive hover:bg-gray-100" asChild>
            <Link href="/community">
              <MessageCircle className="mr-2 h-5 w-5" />
              तुरंत बात करें
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10" asChild>
            <Link href="#immediate-help">शांत रहने के उपाय</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">समस्या चुनें:</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {crisisTypes.map((crisis) => (
            <Button
              key={crisis}
              variant={selectedCrisis === crisis ? 'default' : 'outline'}
              className="h-auto py-3"
              onClick={() => setSelectedCrisis(crisis)}
            >
              {crisis}
            </Button>
          ))}
        </CardContent>
      </Card>

      {selectedCrisis === '😔 मृत्यु शोक' && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="font-headline text-primary">आपने चुना: 😔 मृत्यु का शोक</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="font-semibold text-lg">कुलगुरु का संदेश:</h3>
            <p>
              प्रिय सदस्य, मैं समझता हूँ यह समय बहुत कठिन है। विभिन्न धर्मों में मृत्यु के बाद के जीवन की अवधारणाएं हैं जो सांत्वना देती हैं:
            </p>
            <ul className="list-none space-y-2 pl-0">
                <li className="flex items-start"><span className="mr-2">🕉️</span> <strong>हिंदू:</strong> आत्मा अमर है, नए शरीर में जाती है।</li>
                <li className="flex items-start"><span className="mr-2">☪️</span> <strong>इस्लाम:</strong> आत्मा अल्लाह के पास जाती है, एक बेहतर स्थान पर।</li>
                <li className="flex items-start"><span className="mr-2">✝️</span> <strong>ईसाई:</strong> स्वर्ग में शांति और आनंद का जीवन।</li>
                <li className="flex items-start"><span className="mr-2">☸️</span> <strong>बौद्ध:</strong> पुनर्जन्म का चक्र, कर्म के अनुसार।</li>
            </ul>
            <p className="font-semibold pt-4">क्या आप किसी विशेष धर्म के अनुसार मार्गदर्शन चाहेंगे?</p>
            <div className="flex flex-wrap gap-2">
                <Button variant="secondary">हिंदू</Button>
                <Button variant="secondary">इस्लाम</Button>
                <Button variant="secondary">ईसाई</Button>
                <Button variant="secondary">बौद्ध</Button>
                <Button variant="secondary">सिख</Button>
            </div>
          </CardContent>
        </Card>
      )}

        <Card id="immediate-help">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">🧘 शांति के लिए तुरंत उपाय</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {immediateHelp.map(item => (
                    <div key={item.text} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="text-primary">{item.icon}</div>
                            <p>{item.text}</p>
                        </div>
                        <Button variant="default" asChild><Link href={item.href}>{item.action}</Link></Button>
                    </div>
                ))}
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">📞 मानव सहायता की आवश्यकता?</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 bg-secondary/10 rounded-lg">
                <p>निकटतम परामर्श केंद्र: आपके शहर में 3 केंद्र उपलब्ध हैं।</p>
                <div className="flex gap-4">
                    <Button variant="outline" asChild><Link href="/crisis-counseling/helplines">नंबर दिखाएं</Link></Button>
                    <Button asChild><Link href="/community"><Headset className="mr-2 h-5 w-5" /> मानव गुरु से बात करें</Link></Button>
                </div>
            </CardContent>
        </Card>

    </div>
  );
}
