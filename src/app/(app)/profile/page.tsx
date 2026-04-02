'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { CheckCircle, Edit, Target, Plus, Send, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

type Goal = {
  id: string;
  description: string;
  status: 'Active' | 'Completed';
};

type UserProfile = {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    profileImageUrl: string;
    generalInterests?: string[];
    religiousAffiliationId?: string;
}

const personalizedContent = [
    {
        category: '🔬 विज्ञान और धर्म',
        items: ['बिग बैंग और सृष्टि - वैज्ञानिक और धार्मिक दृष्टि', 'क्वांटम भौतिकी और अद्वैत वेदांत में समानताएं']
    },
    {
        category: '🧠 किशोर मनोविज्ञान',
        items: ['गुस्से पर काबू कैसे पाएं? (धार्मिक दृष्टिकोण)', 'माता-पिता से संवाद कैसे करें?']
    },
    {
        category: '🎓 करियर मार्गदर्शन',
        items: ['वैज्ञानिक बनने के लिए ध्यान क्यों जरूरी है?', 'नैतिकता और वैज्ञानिक शोध']
    }
];

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

    const goalsRef = useMemoFirebase(() => {
        if (!user) return null;
        return collection(firestore, 'users', user.uid, 'goals');
    }, [firestore, user]);
    const { data: goals, isLoading: areGoalsLoading } = useCollection<Goal>(goalsRef);

    const handleAddGoal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGoal.trim() || !user) return;
        
        setIsAddingGoal(true);
        const goalData = {
            description: newGoal,
            status: 'Active' as const,
            startDate: serverTimestamp(),
            userId: user.uid,
        };

        const goalsCollectionRef = collection(firestore, `users/${user.uid}/goals`);
        await addDocumentNonBlocking(goalsCollectionRef, goalData);

        setNewGoal('');
        setIsAddingGoal(false);
    };

    const handleToggleGoalStatus = (goal: Goal) => {
        if (!user) return;
        const goalDocRef = doc(firestore, 'users', user.uid, 'goals', goal.id);
        const newStatus = goal.status === 'Active' ? 'Completed' : 'Active';
        updateDocumentNonBlocking(goalDocRef, { status: newStatus });
    };

    if (isUserLoading || isProfileLoading) {
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
                    <CardContent><Loader2 className="mx-auto h-8 w-8 animate-spin" /></CardContent>
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
            <p className="text-muted-foreground">आयु: {userProfile?.dateOfBirth ? 'Not set' : '16 वर्ष (उदा.)'} | कक्षा: 11वीं (विज्ञान) (उदा.)</p>
            <p className="text-muted-foreground">रुचियां: {userProfile?.generalInterests?.join(', ') || 'भौतिकी, खगोल विज्ञान, क्रिकेट (उदा.)'}</p>
            <p className="text-muted-foreground">धर्म: {userProfile?.religiousAffiliationId || 'हिंदू (जिज्ञासु)'}</p>
          </div>
          <Button variant="outline" asChild><Link href="/wip"><Edit className="mr-2 h-4 w-4" />प्रोफाइल संपादित करें</Link></Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">📊 आपके लिए वैयक्तिकृत सामग्री</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            {personalizedContent.map(content => (
                <div key={content.category}>
                    <h3 className="font-semibold text-lg">{content.category}</h3>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
                        {content.items.map(item => <li key={item}>{item}</li>)}
                    </ul>
                    <Button variant="link" className="p-0 h-auto" asChild><Link href="/wip">और पढ़ें</Link></Button>
                    <Separator className="mt-4"/>
                </div>
            ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle className="font-headline text-2xl">🎯 आपके लक्ष्य</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
            {areGoalsLoading && <Loader2 className="h-6 w-6 animate-spin" />}
            {goals && goals.map(goal => (
                <div key={goal.id} className={`flex items-center justify-between p-3 rounded-lg ${goal.status === 'Completed' ? 'bg-green-100 dark:bg-green-900/50' : 'bg-muted'}`}>
                    <div className="flex items-center gap-3">
                        <Target className={`h-5 w-5 ${goal.status === 'Completed' ? 'text-green-600' : 'text-primary'}`}/>
                        <p className={goal.status === 'Completed' ? 'line-through text-muted-foreground' : ''}>{goal.description}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleToggleGoalStatus(goal)}>
                        <CheckCircle className={`mr-2 h-4 w-4 ${goal.status === 'Completed' ? 'text-green-600' : ''}`}/>
                        {goal.status === 'Completed' ? 'पूर्ण' : 'ट्रैक करें'}
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
            <CardTitle className="font-headline text-2xl">💬 आपके और कुलगुरु के बीच वार्तालाप</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-4 rounded-lg border p-4">
                <div className="flex justify-start">
                    <p className="max-w-[80%] rounded-lg bg-muted p-3"><strong>आप:</strong> मुझे समझ नहीं आता कि अगर भगवान है तो दुनिया में इतना दुख क्यों है?</p>
                </div>
                <div className="flex justify-end">
                    <div className="max-w-[80%] rounded-lg bg-secondary text-secondary-foreground p-3 text-right">
                        <p><strong>कुलगुरु:</strong> यह बहुत गहरा प्रश्न है। विभिन्न धर्मों में इसके उत्तर हैं:</p>
                        <ul className="list-none text-right mt-2 space-y-1">
                            <li>हिंदू - कर्म का सिद्धांत</li>
                            <li>बौद्ध - दुख का कारण इच्छा</li>
                            <li>ईसाई - स्वतंत्र इच्छा (Free Will)</li>
                        </ul>
                         <p className="mt-2">क्या तुम इनमें से किसी पर चर्चा करना चाहोगे?</p>
                    </div>
                </div>
            </div>
            <div className="flex justify-center gap-4">
                <Button asChild><Link href="/dashboard">चर्चा जारी रखें</Link></Button>
            </div>
        </CardContent>
      </Card>

    </div>
  );
}
