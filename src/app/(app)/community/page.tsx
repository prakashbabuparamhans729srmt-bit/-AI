import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Calendar, Plus, Search, ThumbsUp } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';


const topics = [
  { title: 'क्या आधुनिकता में संस्कार बचाए रखना संभव है?', answers: 45, comments: 23 },
  { title: 'बच्चों को मोबाइल से दूर कैसे रखें?', answers: 78, comments: 34 },
  { title: 'विभिन्न धर्मों में विवाह के नियम - अनुभव साझा करें', answers: 112, comments: 56 },
  { title: 'क्या AI कुलगुरु पर भरोसा किया जा सकता है?', answers: 234, comments: 89 },
];

const events = [
    { date: '20 अप्रैल', title: 'ऑनलाइन सत्संग - सभी धर्म एक साथ' },
    { date: '25 अप्रैल', title: 'माता-पिता परामर्श शिविर (निःशुल्क)' },
    { date: '30 अप्रैल', title: 'युवा संवाद - करियर और धर्म' },
];

const bestPostAuthorAvatar = PlaceHolderImages.find(img => img.id === 'community-best-post-author');

export default function CommunityPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold font-headline">👥 भारत के परिवारों का समुदाय</h1>
        <p className="text-muted-foreground mt-2 text-lg">1,25,000+ सदस्य</p>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input placeholder="विषय या प्रश्न खोजें..." className="pl-10 h-11" />
          </div>
          <Button className="w-full md:w-auto" asChild>
            <Link href="#">
              <Plus className="mr-2 h-5 w-5" />
              नया विषय शुरू करें
            </Link>
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">🔥 आज के चर्चा विषय</CardTitle>
        </CardHeader>
        <CardContent className="space-y-0 p-0">
          {topics.map((topic, index) => (
            <div key={index} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border-b last:border-b-0">
              <p className="font-semibold flex-grow mb-2 md:mb-0">{topic.title}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground shrink-0">
                <span>उत्तर: {topic.answers}</span>
                <span>टिप्पणियाँ: {topic.comments}</span>
                <Button variant="secondary" size="sm" asChild><Link href="#">पढ़ें</Link></Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-accent bg-accent/10">
        <CardHeader>
          <CardTitle className="font-headline text-yellow-600">🌟 सप्ताह का सर्वश्रेष्ठ पोस्ट</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
                <Avatar>
                    {bestPostAuthorAvatar && <AvatarImage src={bestPostAuthorAvatar.imageUrl} />}
                    <AvatarFallback>रश</AvatarFallback>
                </Avatar>
                <p className="font-semibold">रमेश शर्मा, जयपुर</p>
            </div>
          <blockquote className="italic border-l-4 border-accent pl-4">
          "मैंने AI गुरु से पूछा कि मेरे बेटे को नशे की लत से कैसे छुड़ाऊं। उसने न केवल धार्मिक दृष्टिकोण से समझाया, बल्कि वैज्ञानिक तरीके भी बताए और नजदीकी पुनर्वास केंद्र के बारे में भी बताया। आज मेरा बेटा ठीक है। धन्यवाद कुलगुरु!"
          </blockquote>
          <div className="flex items-center gap-2 text-primary">
            <ThumbsUp className="h-5 w-5" />
            <span className="font-medium">245 लोगों ने भावुक किया</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">📅 आगामी सामुदायिक कार्यक्रम</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {events.map((event) => (
            <div key={event.title} className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                <Calendar className="h-6 w-6 text-primary"/>
                <div>
                    <p className="font-bold">{event.date}:</p>
                    <p>{event.title}</p>
                </div>
            </div>
          ))}
          <div className="flex justify-center gap-4 pt-4">
              <Button asChild><Link href="#">शामिल हों</Link></Button>
              <Button variant="outline" asChild><Link href="#">याद दिलाएं</Link></Button>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
