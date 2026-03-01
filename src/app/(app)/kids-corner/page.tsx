import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Puzzle, Paintbrush, Music, HelpCircle, Book, Drama } from 'lucide-react';
import Link from 'next/link';

const activities = [
  { icon: <Puzzle />, label: 'नैतिकता पहेली', href: '/wip' },
  { icon: <Paintbrush />, label: 'धार्मिक रंग भरना', href: '/wip' },
  { icon: <Music />, label: 'भजन और कव्वाली', href: '/wip' },
  { icon: <HelpCircle />, label: 'प्रश्नोत्तरी', href: '/wip' },
  { icon: <Book />, label: 'आज का मंत्र/दुआ', href: '/wip' },
  { icon: <Drama />, label: 'कठपुतली शो', href: '/wip' },
];

const ageGroups = [
  { age: '3-5 वर्ष', story: 'जानवरों की नैतिक कहानियाँ', href: '/wip' },
  { age: '6-8 वर्ष', story: 'रामायण की सरल कहानियाँ', href: '/wip' },
  { age: '9-12 वर्ष', story: 'महाभारत के पात्र', href: '/wip' },
  { age: '13-15 वर्ष', story: 'धर्म और विज्ञान', href: '/wip' },
];

const storyImage = PlaceHolderImages.find((img) => img.id === 'kids-story');

export default function KidsCornerPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-center font-headline">🧒 नमस्ते छोटे दोस्तों!</h1>
      
      <Card className="relative overflow-hidden text-center text-white bg-blue-400">
        {storyImage && (
            <Image 
                src={storyImage.imageUrl}
                alt={storyImage.description}
                fill
                className="object-cover opacity-50"
                data-ai-hint={storyImage.imageHint}
            />
        )}
        <div className="relative p-8 md:p-12 space-y-4">
            <div className="text-yellow-300 text-4xl">⭐⭐⭐⭐⭐</div>
            <h2 className="text-3xl font-bold font-headline">आज की कहानी: ईमानदार लकड़हारा</h2>
            <div className="flex justify-center gap-4">
                <Button asChild><Link href="/wip">कहानी सुनें</Link></Button>
                <Button variant="secondary" asChild><Link href="/wip">खुद पढ़ें</Link></Button>
                <Button variant="outline" className="text-white border-white" asChild><Link href="/wip">रंग भरें</Link></Button>
            </div>
        </div>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">🎮 खेल और गतिविधियाँ</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {activities.map((activity, index) => (
            <Link href={activity.href} key={index}>
            <Card className="flex flex-col items-center justify-center p-4 text-center hover:bg-accent/50 hover:shadow-lg transition-all cursor-pointer h-32">
              <div className="text-primary mb-2 text-4xl">{activity.icon}</div>
              <p className="font-semibold text-sm md:text-base">{activity.label}</p>
            </Card>
            </Link>
          ))}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">📚 आयु के अनुसार कहानियाँ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {ageGroups.map((group) => (
            <div key={group.age} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                    <span className="font-bold">{group.age}: </span>
                    <span>{group.story}</span>
                </div>
              <Button variant="ghost" asChild><Link href={group.href}>देखें ►</Link></Button>
            </div>
          ))}
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">🌈 रंग भरने वाले पन्ने</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
            <div className="flex justify-center gap-4 text-5xl mb-6">
                <span>🕉️</span>
                <span>☪️</span>
                <span>✝️</span>
                <span>🯴</span>
                <span>☸️</span>
            </div>
            <p className="text-muted-foreground mb-4">धार्मिक प्रतीक</p>
            <div className="flex justify-center gap-4">
                <Button variant="outline" asChild><Link href="/wip">पृष्ठ डाउनलोड करें</Link></Button>
                <Button asChild><Link href="/wip">रंग भरें ऑनलाइन</Link></Button>
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">👪 माता-पिता के लिए सुझाव</CardTitle>
        </CardHeader>
        <CardContent>
          <h3 className="font-semibold text-lg">अपने बच्चे को धर्म कैसे सिखाएं?</h3>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
            <li>सरल भाषा का प्रयोग करें</li>
            <li>प्रश्न पूछने दें</li>
            <li>उदाहरण देकर समझाएं</li>
          </ul>
          <Button variant="link" className="mt-2 p-0" asChild><Link href="/wip">और सुझाव पढ़ें</Link></Button>
        </CardContent>
      </Card>
    </div>
  );
}
