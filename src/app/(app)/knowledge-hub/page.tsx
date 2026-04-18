'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Mic, Loader2 } from 'lucide-react';
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
import { compareInterfaithConcept, InterfaithConceptComparisonOutput } from '@/ai/flows/interfaith-concept-comparison-flow';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit, where } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

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

type Article = {
  id: string;
  title: string;
  summary: string;
  publicationDate: string;
  author?: string;
}

export default function KnowledgeHubPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<InterfaithConceptComparisonOutput | null>(null);
  
  const firestore = useFirestore();

  const articlesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'knowledgeArticles'), orderBy('publicationDate', 'desc'), limit(3));
  }, [firestore]);

  const { data: articles, isLoading: articlesLoading } = useCollection<Article>(articlesQuery);
  
  const expertVideosQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
        collection(firestore, 'knowledgeArticles'), 
        where('category', '==', 'विद्वानों के विचार'), 
        limit(3)
    );
  }, [firestore]);
  const { data: expertVideos, isLoading: videosLoading } = useCollection<Article>(expertVideosQuery);


  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    setAiResponse(null);
    try {
      const response = await compareInterfaithConcept({ concept: searchTerm });
      setAiResponse(response);
    } catch (error) {
      console.error("Error fetching comparison:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold font-headline">🕉️ सभी धर्मों का ज्ञान - एक ही स्थान पर</h1>
        <p className="text-muted-foreground mt-2">खोजें, सीखें, और तुलना करें।</p>
      </div>

      <form onSubmit={handleSearch}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="धर्म, अवधारणा या प्रश्न खोजें (जैसे 'पाप की अवधारणा', 'स्वर्ग', 'कर्म')..." 
            className="pl-10 pr-24 text-lg h-12" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button variant="ghost" size="icon" type="button" className="absolute right-12 top-1/2 -translate-y-1/2 h-10 w-10">
            <Mic className="h-5 w-5" />
            <span className="sr-only">बोलकर खोजें</span>
          </Button>
          <Button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 h-10" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "खोजें"}
          </Button>
        </div>
      </form>

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
      
      {isLoading && (
         <Card>
            <CardContent className="p-6 flex justify-center items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-lg">आपके लिए जानकारी खोजी जा रही है...</p>
            </CardContent>
        </Card>
      )}

      {aiResponse && !isLoading && (
        <Card className="bg-primary/10">
          <CardHeader>
            <CardTitle className="font-headline text-primary">✨ तुलनात्मक अध्ययन: "{aiResponse.concept}"</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full" defaultValue={aiResponse.comparisons[0]?.faith}>
              {aiResponse.comparisons.map((item) => (
                 <AccordionItem value={item.faith} key={item.faith}>
                    <AccordionTrigger className="font-semibold text-lg">📖 {item.faith}</AccordionTrigger>
                    <AccordionContent className="text-base">
                      {item.perspective}
                    </AccordionContent>
                 </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {!aiResponse && !isLoading && (
        <Card className="bg-primary/10">
          <CardHeader>
            <CardTitle className="font-headline text-primary">✨ नए ज्ञान लेख</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {articlesLoading && (
              <div className="space-y-4">
                <div className="space-y-2"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6" /></div>
                <div className="space-y-2"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6" /></div>
                <div className="space-y-2"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6" /></div>
              </div>
            )}
            {!articlesLoading && articles?.length === 0 && (
              <p className="text-center text-muted-foreground">अभी कोई लेख उपलब्ध नहीं है।</p>
            )}
            {articles && articles.map((article) => (
              <div key={article.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                <h3 className="text-lg font-semibold">{article.title}</h3>
                <p className="text-muted-foreground mt-1">{article.summary}</p>
                <Button variant="link" className="p-0 h-auto mt-2" asChild><Link href={`/knowledge-hub/${article.id}`}>पूरा पढ़ें</Link></Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

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
              {videosLoading && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-9 w-20" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <Skeleton className="h-5 w-2/3" />
                      <Skeleton className="h-9 w-20" />
                  </div>
                </div>
              )}
              {!videosLoading && expertVideos && expertVideos.length > 0 && expertVideos.map(video => (
                  <div key={video.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <p>वीडियो: "{video.title}" - <span className="font-semibold">{video.author}</span></p>
                      <Button variant="secondary" asChild><Link href={`/knowledge-hub/${video.id}`}>देखें</Link></Button>
                  </div>
              ))}
              {!videosLoading && (!expertVideos || expertVideos.length === 0) && (
                <p className="text-center text-muted-foreground p-4">अभी कोई वीडियो उपलब्ध नहीं है।</p>
              )}
              <div className="text-center pt-4">
                <Button variant="outline" asChild><Link href="/wip">सभी वीडियो देखें</Link></Button>
              </div>
          </CardContent>
      </Card>

    </div>
  );
}
