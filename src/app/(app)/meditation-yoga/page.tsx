'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Wind, Heart } from 'lucide-react';

type Activity = {
  id: string;
  name: string;
  description: string;
  type: 'Meditation' | 'Yoga';
  estimatedDurationMinutes: number;
};

const activityIcons: { [key: string]: React.ReactNode } = {
  'Meditation': <Heart className="h-8 w-8 text-pink-500" />,
  'Yoga': <Wind className="h-8 w-8 text-green-500" />,
};

export default function MeditationYogaPage() {
  const firestore = useFirestore();

  const activitiesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'activities'),
      where('type', 'in', ['Meditation', 'Yoga']),
      orderBy('name')
    );
  }, [firestore]);

  const { data: activities, isLoading } = useCollection<Activity>(activitiesQuery);

  return (
    <div className="space-y-8">
      <Card className="text-center bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/50 dark:to-blue-900/50">
        <CardHeader>
          <CardTitle className="font-headline text-4xl">🧘 ध्यान और योग</CardTitle>
          <CardDescription className="text-lg mt-2">
            मन की शांति और शारीरिक स्वास्थ्य के लिए निर्देशित सत्र।
          </CardDescription>
        </CardHeader>
      </Card>

      {isLoading && (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-lg">सत्र लोड हो रहे हैं...</p>
        </div>
      )}
      
      {!isLoading && activities && activities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity) => (
            <Card key={activity.id} className="flex flex-col hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div>{activityIcons[activity.type]}</div>
                  <CardTitle className="text-2xl font-headline">{activity.name}</CardTitle>
                </div>
                <CardDescription>
                  अवधि: {activity.estimatedDurationMinutes} मिनट | प्रकार: {activity.type === 'Meditation' ? 'ध्यान' : 'योग'}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground line-clamp-3">{activity.description}</p>
              </CardContent>
              <div className="p-6 pt-0">
                <Button className="w-full" asChild>
                  <Link href={`/activity/${activity.id}`}>सत्र शुरू करें</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        !isLoading && (
          <Card>
            <CardContent className="p-10 text-center">
              <p className="text-muted-foreground">अभी कोई ध्यान या योग सत्र उपलब्ध नहीं है।</p>
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
}
