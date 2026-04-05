'use client';

import { useState, useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc, serverTimestamp, query, orderBy, limit, where } from 'firebase/firestore';
import { CheckCircle, Edit, Target, Plus, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { differenceInYears } from 'date-fns';

type Goal = {
  id: string;
  description: string;
  status: 'Active' | 'Completed';
};

type UserProfile = {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string; // YYYY-MM-DD format
    gender: string;
    profileImageUrl: string;
    generalInterests?: string[];
    religiousAffiliationId?: string;
    educationLevel?: string;
}

type Message = {
  id: string;
  senderType: 'User' | 'AI';
  content: string;
};

type Article = {
  id: string;
  title: string;
  category: string;
};


export default function ProfilePage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const [newGoal, setNewGoal] = useState('');
    const [isAddingGoal, setIsAddingGoal] = useState(false);

    const userProfileRef = useMemoFirebase(() => {
        if (!user) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);
    const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

    // Query for personalized articles based on user's interests
    const articlesQuery = useMemoFirebase(() => {
        if (!firestore || !userProfile?.generalInterests || userProfile.generalInterests.length === 0) {
            return null;
        }
        return query(
            collection(firestore, 'knowledgeArticles'), 
            where('topicTags', 'array-contains-any', userProfile.generalInterests.slice(0, 10)),
            limit(6)
        );
    }, [firestore, userProfile]);
    const { data: personalizedArticles, isLoading: arePersonalizedArticlesLoading } = useCollection<Article>(articlesQuery);

    // Group fetched articles by category
    const groupedArticles = useMemo(() => {
        if (!personalizedArticles) return {};
        return personalizedArticles.reduce((acc, article) => {
            const category = article.category || 'अन्य';
            (acc[category] = acc[category] || []).push(article);
            return acc;
        }, {} as Record<string, Article[]>);
    }, [personalizedArticles]);


    const goalsQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, 'users', user.uid, 'goals'), orderBy('startDate', 'desc'));
    }, [firestore, user]);
    const { data: goals, isLoading: areGoalsLoading } = useCollection<Goal>(goalsQuery);

    const messagesQuery = useMemoFirebase(() => {
        if (!user) return null;
        const messagesRef = collection(firestore, `users/${user.uid}/conversations/dashboard-chat/messages`);
        return query(messagesRef, orderBy('timestamp', 'desc'), limit(4));
    }, [firestore, user]);
    const { data: messages, isLoading: messagesLoading } = useCollection<Message>(messagesQuery);
    const reversedMessages = useMemo(() => messages?.slice().reverse(), [messages]);


    const handleAddGoal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGoal.trim() || !user) return;
        
        setIsAddingGoal(true);
        const goalData = {
            description: newGoal,
            status: 'Active' as const,
            startDate: serverTimestamp(),
            userId: user.uid,
            unit: 'times',
            frequency: 'daily',
            targetValue: '1'
        };

        const goalsCollectionRef = collection(firestore, `users/${user.uid}/goals`);
        
        try {
            const docRef = await addDocumentNonBlocking(goalsCollectionRef, goalData);
            if(docRef) {
                // Now update the document with its own ID
                await updateDocumentNonBlocking(doc(firestore, `users/${user.uid}/goals`, docRef.id), { id: docRef.id });
            }
        } catch(error) {
            console.error("Error adding goal:", error);
        }

        setNewGoal('');
        setIsAddingGoal(false);
    };

    const handleToggleGoalStatus = (goal: Goal) => {
        if (!user) return;
        const goalDocRef = doc(firestore, 'users', user.uid, 'goals', goal.id);
        const newStatus = goal.status === 'Active' ? 'Completed' : 'Active';
        updateDocumentNonBlocking(goalDocRef, { status: newStatus });
    };

    const calculateAge = (dob: string) => {
        if (!dob) return null;
        try {
            return differenceInYears(new Date(), new Date(dob));
        } catch (e) {
            return null;
        }
    };
    
    const userAge = userProfile?.dateOfBirth ? calculateAge(userProfile.dateOfBirth) : null;

    if (isUserLoading || (isProfileLoading && !userProfile)) {
        return (
            <div className="space-y-8">
                <Card>
                    <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                        <Skeleton className="h-24 w-24 rounded-full" />
                        <div className="flex-grow space-y-2 text-center md:text-left">
                            <Skeleton className="h-8 w-48" />
                            <Skeleton className="h-4 w-64" />
                            <Skeleton className="h-4 w-56" />
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle className="font-headline text-2xl">🎯 आपके लक्ष्य</CardTitle></CardHeader>
                    <CardContent><div className="flex justify-center p-4"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></div></CardContent>
                </Card>
            </div>
        );
    }
    
    if (!user) {
         return (
             <div className="text-center">
                <p>प्रोफ़ाइल देखने के लिए कृपया लॉग इन करें।</p>
                <Button asChild className="mt-4"><Link href="/login">लॉग इन</Link></Button>
            </div>
         );
    }

  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={userProfile?.profileImageUrl || `https://picsum.photos/seed/${user.uid}/200/200`} alt={userProfile?.firstName || 'User'} />
            <AvatarFallback>{userProfile?.firstName?.charAt(0) || user.email?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-grow text-center md:text-left">
            <h1 className="text-3xl font-bold font-headline">{userProfile?.firstName || 'उपयोगकर्ता'} {userProfile?.lastName || ''}</h1>
            <p className="text-muted-foreground">
                {userAge ? `आयु: ${userAge} वर्ष` : ''}
                {userAge && userProfile?.educationLevel ? ' | ' : ''}
                {userProfile?.educationLevel ? `शिक्षा: ${userProfile.educationLevel}`: ''}
                {!userAge && !userProfile?.educationLevel ? 'आयु और शिक्षा की जानकारी उपलब्ध नहीं है' : ''}
            </p>
            <p className="text-muted-foreground">रुचियां: {userProfile?.generalInterests?.join(', ') || 'अभी कोई रुचि नहीं जोड़ी गई'}</p>
            <p className="text-muted-foreground">धर्म: {userProfile?.religiousAffiliationId || 'अभी कोई धर्म नहीं जोड़ा गया'}</p>
          </div>
          <Button variant="outline" asChild><Link href="/wip"><Edit className="mr-2 h-4 w-4" />प्रोफाइल संपादित करें</Link></Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">📊 आपके लिए वैयक्तिकृत सामग्री</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            {(isProfileLoading || arePersonalizedArticlesLoading) ? (
               <div className="space-y-4">
                  <div className="space-y-2"><Skeleton className="h-6 w-1/3" /><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-2/3" /></div>
                  <Separator/>
                  <div className="space-y-2"><Skeleton className="h-6 w-1/3" /><Skeleton className="h-4 w-3/4" /></div>
               </div>
            ) : Object.keys(groupedArticles).length > 0 ? (
                Object.entries(groupedArticles).map(([category, articlesInCategory]) => (
                    <div key={category}>
                        <h3 className="font-semibold text-lg">{category}</h3>
                        <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
                            {articlesInCategory.map(article => (
                                <li key={article.id}>
                                    <Link href={'/wip'} className="hover:underline hover:text-primary transition-colors">{article.title}</Link>
                                </li>
                            ))}
                        </ul>
                        <Button variant="link" className="p-0 h-auto" asChild><Link href="/knowledge-hub">और पढ़ें</Link></Button>
                        <Separator className="mt-4"/>
                    </div>
                ))
            ) : (
                <p className="text-muted-foreground text-center p-4">आपकी रुचियों के आधार पर कोई सामग्री नहीं मिली। अपनी प्रोफ़ाइल में और रुचियां जोड़ने का प्रयास करें।</p>
            )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle className="font-headline text-2xl">🎯 आपके लक्ष्य</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
            {areGoalsLoading && <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>}
            {goals && goals.map(goal => (
                <div key={goal.id} className={`flex items-center justify-between p-3 rounded-lg ${goal.status === 'Completed' ? 'bg-green-100 dark:bg-green-900/50' : 'bg-muted'}`}>
                    <div className="flex items-center gap-3">
                        <Target className={`h-5 w-5 ${goal.status === 'Completed' ? 'text-green-600' : 'text-primary'}`}/>
                        <p className={goal.status === 'Completed' ? 'line-through text-muted-foreground' : ''}>{goal.description}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleToggleGoalStatus(goal)}>
                        <CheckCircle className={`mr-2 h-4 w-4 ${goal.status === 'Completed' ? 'text-green-600' : ''}`}/>
                        {goal.status === 'Completed' ? 'पूर्ण' : 'चिह्नित करें'}
                    </Button>
                </div>
            ))}
             {!areGoalsLoading && goals?.length === 0 && (
                <p className="text-center text-muted-foreground">आपने अभी तक कोई लक्ष्य नहीं जोड़ा है।</p>
            )}
            <form onSubmit={handleAddGoal} className="pt-4 space-y-2">
                 <div className="flex w-full items-center space-x-2">
                     <Input 
                        placeholder="एक नया लक्ष्य जोड़ें (जैसे 'प्रतिदिन 10 मिनट ध्यान करूंगा')"
                        value={newGoal}
                        onChange={(e) => setNewGoal(e.target.value)}
                        disabled={isAddingGoal}
                     />
                    <Button type="submit" disabled={isAddingGoal || !newGoal.trim()}>
                        {isAddingGoal ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                        <span className="hidden sm:inline ml-2">जोड़ें</span>
                    </Button>
                 </div>
            </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle className="font-headline text-2xl">💬 हाल का वार्तालाप</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-4 rounded-lg border p-4 min-h-[10rem] flex flex-col justify-end">
                {messagesLoading && <div className="flex justify-center items-center h-full m-auto"><Loader2 className="h-6 w-6 animate-spin" /></div>}
                {!messagesLoading && (!reversedMessages || reversedMessages.length === 0) && <p className="text-center text-muted-foreground m-auto">आपने अभी तक कोई बातचीत नहीं की है। डैशबोर्ड पर जाकर बातचीत शुरू करें।</p>}
                {reversedMessages && reversedMessages.map(message => (
                     <div key={message.id} className={`flex ${message.senderType === 'User' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-lg p-3 text-sm ${message.senderType === 'User' ? 'bg-muted text-right' : 'bg-secondary text-secondary-foreground'}`}>
                           <p><strong>{message.senderType === 'User' ? 'आप' : 'कुलगुरु'}:</strong> {message.content}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-center gap-4">
                <Button asChild><Link href="/dashboard">चर्चा जारी रखें</Link></Button>
            </div>
        </CardContent>
      </Card>

    </div>
  );
}
