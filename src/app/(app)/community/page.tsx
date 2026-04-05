'use client';

import { useState, useMemo } from 'react';
import { useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, collectionGroup, where, limit, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Calendar, Plus, Search, ThumbsUp, Mic, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

type Topic = {
  id: string;
  title: string;
  totalPosts: number;
  totalComments: number;
  lastPostAt: any; // For orderBy
};
type Event = {
  id: string;
  startDate: string;
  title: string;
};
type Post = {
  id: string;
  content: string;
  authorUserId: string;
  likes: number;
};
type UserProfile = {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
};


export default function CommunityPage() {
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');

  const topicsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'forumTopics'), orderBy('lastPostAt', 'desc'));
  }, [firestore]);
  const { data: topics, isLoading: topicsLoading } = useCollection<Topic>(topicsQuery);

  const eventsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'communityEvents'), orderBy('startDate', 'asc'));
  }, [firestore]);
  const { data: events, isLoading: eventsLoading } = useCollection<Event>(eventsQuery);

  const bestPostQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collectionGroup(firestore, 'posts'), where('isBestPostOfTheWeek', '==', true), limit(1));
  }, [firestore]);
  const { data: bestPosts, isLoading: bestPostLoading } = useCollection<Post>(bestPostQuery);
  const bestPost = bestPosts?.[0];

  const authorProfileRef = useMemoFirebase(() => {
    if (!firestore || !bestPost?.authorUserId) return null;
    return doc(firestore, 'users', bestPost.authorUserId);
  }, [firestore, bestPost]);
  const { data: author, isLoading: authorLoading } = useDoc<UserProfile>(authorProfileRef);


  const filteredTopics = useMemo(() => {
    if (!topics) return [];
    if (!searchTerm.trim()) return topics;
    return topics.filter(topic =>
      topic.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [topics, searchTerm]);

  const formatEventDate = (isoDate: string) => {
    if (!isoDate) return '';
    try {
      const date = new Date(isoDate);
      const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };
      return date.toLocaleDateString('hi-IN', options);
    } catch (e) {
      return isoDate;
    }
  };

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
            <Input 
              placeholder="विषय या प्रश्न खोजें..." 
              className="pl-10 pr-12 h-11"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10">
              <Mic className="h-5 w-5" />
              <span className="sr-only">बोलकर खोजें</span>
            </Button>
          </div>
          <Button className="w-full md:w-auto" asChild>
            <Link href="/community/new">
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
          {topicsLoading && <div className="p-6 text-center"><Loader2 className="h-6 w-6 animate-spin" /></div>}
          {!topicsLoading && filteredTopics.length === 0 && (
             <p className="p-6 text-center text-muted-foreground">
              {searchTerm ? 'कोई परिणाम नहीं मिला।' : 'अभी कोई चर्चा विषय नहीं है। एक नया विषय शुरू करें।'}
            </p>
          )}
          {filteredTopics.map((topic) => (
            <div key={topic.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border-b last:border-b-0">
              <p className="font-semibold flex-grow mb-2 md:mb-0">{topic.title}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground shrink-0">
                <span>उत्तर: {topic.totalPosts || 0}</span>
                <span>टिप्पणियाँ: {topic.totalComments || 0}</span>
                <Button variant="secondary" size="sm" asChild><Link href={`/community/topic/${topic.id}`}>पढ़ें</Link></Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {(bestPostLoading || authorLoading) && (
        <Card className="border-accent bg-accent/10">
            <CardHeader>
                <CardTitle className="font-headline text-yellow-600">🌟 सप्ताह का सर्वश्रेष्ठ पोस्ट</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-5 w-32" />
                </div>
                <div className="space-y-2 border-l-4 border-accent pl-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-5 w-24" />
                </div>
            </CardContent>
        </Card>
      )}

      {!bestPostLoading && !authorLoading && bestPost && author && (
        <Card className="border-accent bg-accent/10">
            <CardHeader>
            <CardTitle className="font-headline text-yellow-600">🌟 सप्ताह का सर्वश्रेष्ठ पोस्ट</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src={author.profileImageUrl || `https://picsum.photos/seed/${author.id}/100/100`} />
                        <AvatarFallback>{author.firstName?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <p className="font-semibold">{author.firstName} {author.lastName}</p>
                </div>
            <blockquote className="italic border-l-4 border-accent pl-4">
                {bestPost.content}
            </blockquote>
            <div className="flex items-center gap-2 text-primary">
                <ThumbsUp className="h-5 w-5" />
                <span className="font-medium">{bestPost.likes || 0} लोगों ने पसंद किया</span>
            </div>
            </CardContent>
        </Card>
      )}


      <Card>
        <CardHeader>
          <CardTitle className="font-headline">📅 आगामी सामुदायिक कार्यक्रम</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {eventsLoading && <div className="p-6 text-center"><Loader2 className="h-6 w-6 animate-spin" /></div>}
          {!eventsLoading && events?.length === 0 && <p className="p-6 text-center text-muted-foreground">अभी कोई आगामी कार्यक्रम नहीं है।</p>}
          {events && events.map((event) => (
            <div key={event.id} className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                <Calendar className="h-6 w-6 text-primary"/>
                <div>
                    <p className="font-bold">{formatEventDate(event.startDate)}:</p>
                    <p>{event.title}</p>
                </div>
            </div>
          ))}
          <div className="flex justify-center gap-4 pt-4">
              <Button asChild><Link href="/wip">शामिल हों</Link></Button>
              <Button variant="outline" asChild><Link href="/wip">याद दिलाएं</Link></Button>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
