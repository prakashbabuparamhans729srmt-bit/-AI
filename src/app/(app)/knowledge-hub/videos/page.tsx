'use client';

import { useRouter } from 'next/navigation';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CornerUpLeft, Youtube } from 'lucide-react';

type VideoArticle = {
  id: string;
  title: string;
  summary: string;
  author?: string;
};


export default function VideoArticlesPage() {
  const router = useRouter();
  const firestore = useFirestore();

  const videosQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    // Filter articles where the category is 'विद्वानों के विचार'
    return query(
        collection(firestore, 'knowledgeArticles'), 
        where('category', '==', 'विद्वानों के विचार'),
        orderBy('publicationDate', 'desc')
    );
  }, [firestore]);

  const { data: videos, isLoading } = useCollection<VideoArticle>(videosQuery);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">🎬 विद्वानों के विचार</h1>
          <p className="text-muted-foreground mt-1">हमारे संग्रह से सभी वीडियो व्याख्यान देखें।</p>
        </div>
        <Button variant="ghost" onClick={() => router.back()}>
            <CornerUpLeft className="mr-2 h-4 w-4" />
            ज्ञान केंद्र पर वापस जाएं
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>वीडियो सूची</CardTitle>
          <CardDescription>विशेषज्ञों द्वारा दिए गए व्याख्यान।</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && (
            <div className="flex justify-center items-center p-10">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="ml-4">वीडियो लोड हो रहे हैं...</p>
            </div>
          )}
          {!isLoading && (!videos || videos.length === 0) && (
            <div className="text-center text-muted-foreground p-10">
              <p>इस श्रेणी में कोई वीडियो नहीं मिला।</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos && videos.map((video) => (
              <Link href={`/knowledge-hub/${video.id}`} key={video.id} className="block">
                <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg"><Youtube className="h-5 w-5 text-red-500" /> {video.title}</CardTitle>
                        <CardDescription>{video.author ? `द्वारा: ${video.author}` : ''}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-3">{video.summary}</p>
                    </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
