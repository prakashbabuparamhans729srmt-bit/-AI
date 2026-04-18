'use client';

import { useParams, useRouter } from 'next/navigation';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CornerUpLeft, Clock, Package, Tag } from 'lucide-react';
import Link from 'next/link';

type Activity = {
  id: string;
  name: string;
  description: string;
  type: string;
  targetAgeGroup: string;
  estimatedDurationMinutes: number;
  materialsNeeded?: string[];
  instructionUrl?: string;
};

export default function ActivityDetailPage() {
  const { activityId } = useParams() as { activityId: string };
  const firestore = useFirestore();
  const router = useRouter();

  const activityRef = useMemoFirebase(() => {
    if (!firestore || !activityId) return null;
    return doc(firestore, 'activities', activityId);
  }, [firestore, activityId]);

  const { data: activity, isLoading } = useDoc<Activity>(activityRef);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">गतिविधि लोड हो रही है...</p>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="text-center h-[60vh] flex flex-col justify-center items-center">
        <h1 className="text-2xl font-bold">गतिविधि नहीं मिली</h1>
        <p className="text-muted-foreground mt-2">यह गतिविधि मौजूद नहीं है या हटा दी गई है।</p>
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
        <CardHeader>
          <CardTitle className="font-headline text-4xl">{activity.name}</CardTitle>
          <CardDescription className="text-lg pt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="flex items-center gap-1"><Tag className="h-4 w-4"/> प्रकार: {activity.type}</span>
            <span className="flex items-center gap-1"><Clock className="h-4 w-4"/> अवधि: {activity.estimatedDurationMinutes} मिनट</span>
            <span className="flex items-center gap-1"><Package className="h-4 w-4"/> आयु वर्ग: {activity.targetAgeGroup}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           <div>
                <h3 className="text-2xl font-semibold font-headline mb-2">विवरण</h3>
                 <p className="prose prose-lg dark:prose-invert max-w-none text-xl leading-relaxed whitespace-pre-wrap">
                    {activity.description}
                </p>
           </div>
          
          {activity.materialsNeeded && activity.materialsNeeded.length > 0 && (
            <div>
              <h3 className="text-2xl font-semibold font-headline mb-2">आवश्यक सामग्री</h3>
              <ul className="list-disc pl-5 space-y-1 text-lg">
                {activity.materialsNeeded.map((material, index) => (
                  <li key={index}>{material}</li>
                ))}
              </ul>
            </div>
          )}
          
          {activity.instructionUrl && (
             <div className="flex justify-center pt-4">
                 <Button size="lg" asChild>
                    <Link href={activity.instructionUrl} target="_blank">निर्देश देखें</Link>
                 </Button>
             </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
