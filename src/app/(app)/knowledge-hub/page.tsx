import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';

const religions = [
  { name: 'हिंदू', icon: '🕉️' },
  { name: 'इस्लाम', icon: '☪️' },
  { name: 'ईसाई', icon: '✝️' },
  { name: 'सिख', icon: '🯴' },
  { name: 'बौद्ध', icon: '☸️' },
  { name: 'यहूदी', icon: '✡️' },
];

const comparisonData = [
    { topic: 'ईश्वर', values: ['✅', '✅', '✅', '✅', '❌'] },
    { topic: 'पुनर्जन्म', values: ['✅', '❌', '❌', '✅', '✅'] },
    { topic: 'अहिंसा', values: ['✅', '✅', '✅', '✅', '✅'] },
    { topic: 'ध्यान', values: ['✅', '✅', '✅', '✅', '✅'] },
    { topic: 'तीर्थ', values: ['✅', '✅', '✅', '✅', '✅'] },
];

const expertVideos = [
    { title: 'सभी धर्मों में एकता', speaker: 'स्वामी रामदेव' },
    { title: 'इस्लाम और विज्ञान', speaker: 'डॉ. जाकिर नायक' },
    { title: 'ईसाई धर्म में प्रेम', speaker: 'फादर डिसूजा' },
]


export default function KnowledgeHubPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold font-headline">🕉️ सभी धर्मों का ज्ञान - एक ही स्थान पर</h1>
        <p className="text-muted-foreground mt-2">खोजें, सीखें, और तुलना करें।</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input placeholder="धर्म, अवधारणा या प्रश्न खोजें..." className="pl-10 text-lg h-12" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">📚 धर्म चयन करें</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {religions.map((religion) => (
            <Button variant="outline" key={religion.name} className="flex flex-col h-24 text-lg" asChild>
              <Link href="/wip">
                <span className="text-4xl">{religion.icon}</span>
                <span>{religion.name}</span>
              </Link>
            </Button>
          ))}
        </CardContent>
      </Card>
      
      <Card className="bg-primary/10">
        <CardHeader>
          <CardTitle className="font-headline text-primary">✨ आज का विशेष: "पाप की अवधारणा - विभिन्न धर्मों में"</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="font-semibold text-lg">📖 हिंदू धर्म में पाप</AccordionTrigger>
              <AccordionContent className="text-base">
                पाप अज्ञान से उत्पन्न होता है। कर्म सिद्धांत के अनुसार, प्रत्येक कर्म का फल मिलता है। पाप कर्मों से बचने के लिए धर्म का पालन आवश्यक है।
                <Button variant="link" className="p-0 h-auto mt-2" asChild><Link href="/wip">पूरा पढ़ें</Link></Button>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="font-semibold text-lg">📖 इस्लाम में पाप (गुनाह)</AccordionTrigger>
              <AccordionContent className="text-base">
                इस्लाम में गुनाह अल्लाह की आज्ञा का उल्लंघन है। तौबा (पश्चाताप) के माध्यम से अल्लाह से क्षमा मांगी जा सकती है।
                 <Button variant="link" className="p-0 h-auto mt-2" asChild><Link href="/wip">पूरा पढ़ें</Link></Button>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger className="font-semibold text-lg">📖 ईसाई धर्म में पाप (Sin)</AccordionTrigger>
              <AccordionContent className="text-base">
                ईसाई धर्म में मूल पाप (Original Sin) और व्यक्तिगत पाप की अवधारणा है। यीशु मसीह में विश्वास के द्वारा मुक्ति और पापों से क्षमा मिलती है।
                 <Button variant="link" className="p-0 h-auto mt-2" asChild><Link href="/wip">पूरा पढ़ें</Link></Button>
              </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-4">
              <AccordionTrigger className="font-semibold text-lg">🔬 वैज्ञानिक दृष्टिकोण</AccordionTrigger>
              <AccordionContent className="text-base">
                मनोवैज्ञानिक और समाजशास्त्रीय दृष्टिकोण से, पाप की अवधारणा सामाजिक मानदंडों और नैतिक कोड के उल्लंघन से जुड़ी है जो समूह के सामंजस्य को बनाए रखने में मदद करती है।
                 <Button variant="link" className="p-0 h-auto mt-2" asChild><Link href="/wip">पूरा पढ़ें</Link></Button>
              </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-5">
              <AccordionTrigger className="font-semibold text-lg text-primary">🤔 तुलनात्मक अध्ययन</AccordionTrigger>
              <AccordionContent className="text-base">
                अधिकांश धर्मों में समान नैतिक सिद्धांत पाए जाते हैं, जैसे हत्या, चोरी और झूठ बोलने की मनाही। ये सिद्धांत सार्वभौमिक मानवीय मूल्यों को दर्शाते हैं।
                 <Button variant="link" className="p-0 h-auto mt-2" asChild><Link href="/wip">तुलना देखें</Link></Button>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card>
          <CardHeader>
              <CardTitle className="font-headline">📊 धर्म तुलना चार्ट</CardTitle>
          </CardHeader>
          <CardContent>
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead className="font-bold">विषय</TableHead>
                          {religions.slice(0, 5).map(r => <TableHead key={r.name} className="text-center font-bold">{r.name}</TableHead>)}
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {comparisonData.map(row => (
                          <TableRow key={row.topic}>
                              <TableCell className="font-medium">{row.topic}</TableCell>
                              {row.values.map((value, index) => <TableCell key={index} className="text-center text-2xl">{value}</TableCell>)}
                          </TableRow>
                      ))}
                  </TableBody>
              </Table>
          </CardContent>
      </Card>

       <Card>
          <CardHeader>
              <CardTitle className="font-headline">💬 विद्वानों के विचार</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
              {expertVideos.map(video => (
                  <div key={video.title} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <p>वीडियो: "{video.title}" - <span className="font-semibold">{video.speaker}</span></p>
                      <Button variant="secondary" asChild><Link href="/wip">देखें</Link></Button>
                  </div>
              ))}
              <div className="text-center pt-4">
                <Button variant="outline" asChild><Link href="/wip">सभी वीडियो देखें</Link></Button>
              </div>
          </CardContent>
      </Card>

    </div>
  );
}
