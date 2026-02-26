import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight, Calendar, MessageSquare, BookOpen, HeartPulse, Sparkles, Hand, Users, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

const familyMembers = [
  { name: 'राजेश', role: 'पिता', avatarId: 'family-father' },
  { name: 'सीमा', role: 'माता', avatarId: 'family-mother' },
  { name: 'आर्यन', role: 'पुत्र 16', avatarId: 'family-son' },
  { name: 'अनन्या', role: 'पुत्री 12', avatarId: 'family-daughter' },
];

const quickServices = [
  { icon: <MessageSquare className="h-8 w-8" />, label: 'प्रश्न पूछें' },
  { icon: <HeartPulse className="h-8 w-8" />, label: 'संकट परामर्श' },
  { icon: <Sparkles className="h-8 w-8" />, label: 'आज की कथा' },
  { icon: <BookOpen className="h-8 w-8" />, label: 'धर्म ग्रंथ अध्ययन' },
  { icon: <Hand className="h-8 w-8" />, label: 'संस्कार मार्गदर्शन' },
  { icon: <Users className="h-8 w-8" />, label: 'बच्चों के लिए विशेष' },
];

export default function DashboardPage() {
  return (
    <div className="grid gap-8">
      {/* Date and Welcome */}
      <p className="text-lg text-muted-foreground">आज: मंगलवार, 15 अप्रैल 2025</p>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2 grid gap-8">
          <Card className="bg-gradient-to-br from-primary/20 to-secondary/20">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">🌄 आज का सुविचार</CardTitle>
            </CardHeader>
            <CardContent>
              <blockquote className="text-xl italic">
                "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन"
              </blockquote>
              <p className="mt-2 text-right text-muted-foreground">- श्रीमद्भगवद्गीता</p>
            </CardContent>
            <CardFooter className="gap-2">
              <Button>इस पर चिंतन करें</Button>
              <Button variant="secondary">साझा करें</Button>
            </CardFooter>
          </Card>

          {/* Quick Services */}
          <div>
            <h2 className="text-2xl font-bold font-headline mb-4">🔍 त्वरित सेवाएं</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {quickServices.map((service, index) => (
                <Card key={index} className="flex flex-col items-center justify-center p-4 text-center hover:bg-accent/50 hover:shadow-lg transition-all cursor-pointer">
                  <div className="text-primary mb-2">{service.icon}</div>
                  <p className="font-semibold">{service.label}</p>
                </Card>
              ))}
            </div>
          </div>
          
           {/* Chat with Kulguru */}
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">💬 कुलगुरु से वार्तालाप</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-4 max-h-60 overflow-y-auto p-2">
                <div className="flex justify-end">
                    <p className="max-w-[80%] rounded-lg bg-muted p-3 text-right">मेरे बेटे को पढ़ाई में मन नहीं लगता।</p>
                </div>
                <div className="flex justify-start">
                    <p className="max-w-[80%] rounded-lg bg-secondary text-secondary-foreground p-3">आर्यन की रुचि किन विषयों में है? उसे विज्ञान पसंद है, तो आप उसे विज्ञान की रोचक कहानियों और प्रयोगों के माध्यम से प्रेरित कर सकते हैं।</p>
                </div>
              </div>
              <Separator />
               <div className="flex w-full items-center space-x-2">
                <Input type="text" placeholder="यहाँ लिखें..." className="flex-1" />
                <Button type="submit">
                  <Send className="h-4 w-4" />
                  <span className="sr-only">भेजें</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 grid gap-8">
          {/* Family Members */}
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">👪 परिवार के सदस्य (4)</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              {familyMembers.map((member) => {
                const avatar = PlaceHolderImages.find((img) => img.id === member.avatarId);
                return (
                  <div key={member.name} className="flex flex-col items-center text-center space-y-2">
                    <Avatar className="h-20 w-20">
                      {avatar && <AvatarImage src={avatar.imageUrl} alt={avatar.description} data-ai-hint={avatar.imageHint} />}
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <p className="font-semibold">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                    <Button variant="outline" size="sm">देखें</Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Today's Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">📅 आज के कार्यक्रम</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <Calendar className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p>शाम 6:00 बजे - परिवार ध्यान (सभी सदस्य)</p>
                  <p>रात 8:30 बजे - आर्यन के साथ करियर चर्चा</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="ghost">याद दिलाएं</Button>
              <Button variant="link">
                सभी देखें <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>

           {/* Family Progress Tracker */}
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">📊 परिवार प्रगति ट्रैकर</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>साप्ताहिक ध्यान: 70%</Label>
                <Progress value={70} className="h-2" />
              </div>
              <div>
                <Label>संस्कार पालन: 60%</Label>
                <Progress value={60} className="h-2" />
              </div>
              <div>
                <Label>परिवार संवाद: 80%</Label>
                <Progress value={80} className="h-2" />
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="secondary" className="w-full">सुधार के सुझाव</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
