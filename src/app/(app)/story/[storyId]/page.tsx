'use client';

import { useParams, useRouter } from 'next/navigation';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CornerUpLeft } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

type Story = {
  id: string;
  title: string;
  content: string;
  moralLesson: string;
  ageGroup: string;
  mediaUrls?: string[];
};

const storyDetailImage = PlaceHolderImages.find((img) => img.id === 'story-detail-hero');

export default function StoryDetailPage() {
  const { storyId } = useParams() as { storyId: string };
  const firestore = useFirestore();
  const router = useRouter();

  const storyRef = useMemoFirebase(() => {
    if (!firestore || !storyId) return null;
    return doc(firestore, 'stories', storyId);
  }, [firestore, storyId]);

  const { data: story, isLoading } = useDoc<Story>(storyRef);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">कहानी लोड हो रही है...</p>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="text-center h-[60vh] flex flex-col justify-center items-center">
        <h1 className="text-2xl font-bold">कहानी नहीं मिली</h1>
        <p className="text-muted-foreground mt-2">यह कहानी मौजूद नहीं है या हटा दी गई है।</p>
        <Button asChild className="mt-6">
          <Link href="/kids-corner">बच्चों के कोने पर वापस जाएं</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
       <Button variant="ghost" onClick={() => router.back()} className="mb-4 w-fit pl-1">
            <CornerUpLeft className="mr-2 h-4 w-4" />
            बच्चों के कोने पर वापस जाएं
        </Button>

      <Card className="overflow-hidden">
        {storyDetailImage && (
          <div className="relative h-64 w-full">
            <Image
              src={story.mediaUrls?.[0] || storyDetailImage.imageUrl}
              alt={story.title}
              fill
              className="object-cover"
              data-ai-hint={storyDetailImage.imageHint}
            />
          </div>
        )}
        <CardHeader>
          <CardTitle className="font-headline text-4xl">{story.title}</CardTitle>
          <CardDescription className="text-lg">
            नैतिक शिक्षा: {story.moralLesson} | आयु वर्ग: {story.ageGroup}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose prose-lg dark:prose-invert max-w-none text-xl leading-relaxed whitespace-pre-wrap">
            {story.content}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
