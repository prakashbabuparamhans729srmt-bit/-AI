'use client';

import { useParams, useRouter } from 'next/navigation';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CornerUpLeft } from 'lucide-react';

type Article = {
  id: string;
  title: string;
  summary: string;
};

// Mapping from URL-friendly English name to display-friendly Hindi name
const religionNameMap: { [key: string]: string } = {
  'Hinduism': 'हिन्दू धर्म',
  'Islam': 'इस्लाम',
  'Christianity': 'ईसाई धर्म',
  'Sikhism': 'सिख धर्म',
  'Buddhism': 'बौद्ध धर्म',
  'Judaism': 'यहूदी धर्म',
};


export default function ReligionArticlesPage() {
  const params = useParams();
  const router = useRouter();
  const firestore = useFirestore();

  // It's possible params.religionName is an array, so we take the first element.
  const religionName = Array.isArray(params.religionName) ? params.religionName[0] : params.religionName;
  const displayReligionName = religionName ? religionNameMap[religionName] || religionName : '';

  const articlesQuery = useMemoFirebase(() => {
    if (!firestore || !religionName) return null;
    // We assume that the English religion name is present in the topicTags
    // for filtering purposes. This is a simplification.
    return query(collection(firestore, 'knowledgeArticles'), where('topicTags', 'array-contains', religionName));
  }, [firestore, religionName]);

  const { data: articles, isLoading } = useCollection<Article>(articlesQuery);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">📚 {displayReligionName}</h1>
          <p className="text-muted-foreground mt-1">{displayReligionName} से संबंधित लेख और ज्ञान।</p>
        </div>
        <Button variant="ghost" onClick={() => router.back()}>
            <CornerUpLeft className="mr-2 h-4 w-4" />
            ज्ञान केंद्र पर वापस जाएं
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>लेख सूची</CardTitle>
          <CardDescription>{displayReligionName} पर आधारित लेख।</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && (
            <div className="flex justify-center items-center p-10">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="ml-4">लेख लोड हो रहे हैं...</p>
            </div>
          )}
          {!isLoading && (!articles || articles.length === 0) && (
            <div className="text-center text-muted-foreground p-10">
              <p>इस विषय पर कोई लेख नहीं मिला।</p>
            </div>
          )}
          {articles && articles.map((article) => (
            <div key={article.id} className="border-b pb-4 last:border-b-0 last:pb-0">
              <h3 className="text-lg font-semibold">{article.title}</h3>
              <p className="text-muted-foreground mt-1">{article.summary}</p>
              <Button variant="link" className="p-0 h-auto mt-2" asChild>
                <Link href={`/knowledge-hub/${article.id}`}>पूरा पढ़ें</Link>
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
