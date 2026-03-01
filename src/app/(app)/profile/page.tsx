import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { CheckCircle, Edit, Target, Plus, Send } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

const aryanAvatar = PlaceHolderImages.find((img) => img.id === 'family-son');

const personalizedContent = [
    {
        category: '🔬 विज्ञान और धर्म',
        items: ['बिग बैंग और सृष्टि - वैज्ञानिक और धार्मिक दृष्टि', 'क्वांटम भौतिकी और अद्वैत वेदांत में समानताएं']
    },
    {
        category: '🧠 किशोर मनोविज्ञान',
        items: ['गुस्से पर काबू कैसे पाएं? (धार्मिक दृष्टिकोण)', 'माता-पिता से संवाद कैसे करें?']
    },
    {
        category: '🎓 करियर मार्गदर्शन',
        items: ['वैज्ञानिक बनने के लिए ध्यान क्यों जरूरी है?', 'नैतिकता और वैज्ञानिक शोध']
    }
];

const goals = [
    'प्रतिदिन 10 मिनट ध्यान करूंगा',
    'सप्ताह में एक धार्मिक लेख पढ़ूंगा',
    'माता-पिता से रोज बात करूंगा',
]

export default function ProfilePage() {
  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
          <Avatar className="h-24 w-24">
            {aryanAvatar && <AvatarImage src={aryanAvatar.imageUrl} alt="Aryan Sharma" />}
            <AvatarFallback>आ</AvatarFallback>
          </Avatar>
          <div className="flex-grow text-center md:text-left">
            <h1 className="text-3xl font-bold font-headline">आर्यन शर्मा</h1>
            <p className="text-muted-foreground">आयु: 16 वर्ष | कक्षा: 11वीं (विज्ञान)</p>
            <p className="text-muted-foreground">रुचियां: भौतिकी, खगोल विज्ञान, क्रिकेट</p>
            <p className="text-muted-foreground">धर्म: हिंदू (जिज्ञासु)</p>
          </div>
          <Button variant="outline" asChild><Link href="/wip"><Edit className="mr-2 h-4 w-4" />प्रोफाइल संपादित करें</Link></Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">📊 आर्यन के लिए वैयक्तिकृत सामग्री</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            {personalizedContent.map(content => (
                <div key={content.category}>
                    <h3 className="font-semibold text-lg">{content.category}</h3>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
                        {content.items.map(item => <li key={item}>{item}</li>)}
                    </ul>
                    <Button variant="link" className="p-0 h-auto" asChild><Link href="/wip">और पढ़ें</Link></Button>
                    <Separator className="mt-4"/>
                </div>
            ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle className="font-headline text-2xl">🎯 आर्यन के लक्ष्य</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
            {goals.map(goal => (
                <div key={goal} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                        <Target className="h-5 w-5 text-primary"/>
                        <p>{goal}</p>
                    </div>
                    <Button variant="ghost" size="sm" asChild><Link href="/wip"><CheckCircle className="mr-2 h-4 w-4"/>ट्रैक करें</Link></Button>
                </div>
            ))}
            <div className="pt-4">
                <Button variant="outline" className="w-full" asChild>
                    <Link href="/wip">
                      <Plus className="mr-2 h-4 w-4"/> नया लक्ष्य जोड़ें
                    </Link>
                </Button>
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle className="font-headline text-2xl">💬 आर्यन और कुलगुरु के बीच वार्तालाप</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-4 rounded-lg border p-4">
                <div className="flex justify-start">
                    <p className="max-w-[80%] rounded-lg bg-muted p-3"><strong>आर्यन:</strong> मुझे समझ नहीं आता कि अगर भगवान है तो दुनिया में इतना दुख क्यों है?</p>
                </div>
                <div className="flex justify-end">
                    <div className="max-w-[80%] rounded-lg bg-secondary text-secondary-foreground p-3 text-right">
                        <p><strong>कुलगुरु:</strong> आर्यन, यह बहुत गहरा प्रश्न है। विभिन्न धर्मों में इसके उत्तर हैं:</p>
                        <ul className="list-none text-right mt-2 space-y-1">
                            <li>हिंदू - कर्म का सिद्धांत</li>
                            <li>बौद्ध - दुख का कारण इच्छा</li>
                            <li>ईसाई - स्वतंत्र इच्छा (Free Will)</li>
                        </ul>
                         <p className="mt-2">क्या तुम इनमें से किसी पर चर्चा करना चाहोगे?</p>
                    </div>
                </div>
            </div>
            <div className="flex justify-center gap-4">
                <Button asChild><Link href="/wip">हाँ, कर्म पर</Link></Button>
                <Button variant="outline" asChild><Link href="/wip">नहीं, और पूछना है</Link></Button>
            </div>
        </CardContent>
      </Card>

    </div>
  );
}
