'use client';

import { useParams, useRouter } from 'next/navigation';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CornerUpLeft, User, Calendar } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { format } from 'date-fns';
import { hi } from 'date-fns/locale';

type Article = {
  id: string;
  title: string;
  fullContent: string;
  author?: string;
  publicationDate: string; // ISO string
  mediaUrls?: string[];
  category?: string;
};

const articleHeroImage = PlaceHolderImages.find((img) => img.id === 'article-hero');

export default function ArticleDetailPage() {
  const { articleId } = useParams() as { articleId: string };
  const firestore = useFirestore();
  const router = useRouter();

  const articleRef = useMemoFirebase(() => {
    if (!firestore || !articleId) return null;
    return doc(firestore, 'knowledgeArticles', articleId);
  }, [firestore, articleId]);

  const { data: article, isLoading } = useDoc<Article>(articleRef);

  const formatArticleDate = (isoDate: string) => {
    if (!isoDate) return '';
    try {
      const date = new Date(isoDate);
      return format(date, 'd MMMM yyyy', { locale: hi });
    } catch (e) {
      return '';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">लेख लोड हो रहा है...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center h-[60vh] flex flex-col justify-center items-center">
        <h1 className="text-2xl font-bold">लेख नहीं मिला</h1>
        <p className="text-muted-foreground mt-2">यह लेख मौजूद नहीं है या हटा दिया गया है।</p>
        <Button asChild className="mt-6">
          <Link href="/knowledge-hub">ज्ञान केंद्र पर वापस जाएं</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
       <Button variant="ghost" onClick={() => router.back()} className="mb-4 w-fit pl-1">
            <CornerUpLeft className="mr-2 h-4 w-4" />
            ज्ञान केंद्र पर वापस जाएं
        </Button>

      <Card className="overflow-hidden">
        {articleHeroImage && (
          <div className="relative h-72 w-full">
            <Image
              src={article.mediaUrls?.[0] || articleHeroImage.imageUrl}
              alt={article.title}
              fill
              className="object-cover"
              data-ai-hint={articleHeroImage.imageHint}
            />
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        )}
        <CardHeader className="relative -mt-20 z-10 text-white">
          {article.category && <p className="font-semibold text-primary-foreground/80">{article.category}</p>}
          <CardTitle className="font-headline text-4xl text-white">{article.title}</CardTitle>
          <CardDescription className="text-lg text-primary-foreground/90 flex flex-wrap items-center gap-x-4 gap-y-1 pt-2">
            {article.author && <span className="flex items-center gap-2"><User className="h-4 w-4" /> {article.author}</span>}
            {article.publicationDate && <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {formatArticleDate(article.publicationDate)}</span>}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="prose prose-lg dark:prose-invert max-w-none text-xl leading-relaxed whitespace-pre-wrap">
            {article.fullContent}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}