'use client';

import { useParams, useRouter } from 'next/navigation';
import { useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CornerUpLeft, Target, BookOpen } from 'lucide-react';
import { differenceInYears } from 'date-fns';
import { Separator } from '@/components/ui/separator';

type UserProfile = {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    gender?: string;
    profileImageUrl?: string;
    generalInterests?: string[];
    roleInFamily?: string;
};

type Goal = {
  id: string;
  description: string;
  status: 'Active' | 'Completed';
};

export default function MemberProfilePage() {
    const { memberId } = useParams() as { memberId: string };
    const router = useRouter();
    const firestore = useFirestore();

    const userProfileRef = useMemoFirebase(() => {
        if (!firestore || !memberId) return null;
        return doc(firestore, 'users', memberId);
    }, [firestore, memberId]);
    const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

    const goalsQuery = useMemoFirebase(() => {
        if (!firestore || !memberId) return null;
        return query(collection(firestore, `users/${memberId}/goals`), where('status', '==', 'Active'));
    }, [firestore, memberId]);
    const { data: goals, isLoading: areGoalsLoading } = useCollection<Goal>(goalsQuery);

    const calculateAge = (dob: string | undefined) => {
        if (!dob) return null;
        try {
            return differenceInYears(new Date(), new Date(dob));
        } catch (e) {
            return null;
        }
    };
    const userAge = calculateAge(userProfile?.dateOfBirth);

    if (isProfileLoading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!userProfile) {
        return (
            <div className="text-center">
                <h1 className="text-2xl font-bold">सदस्य नहीं मिला</h1>
                <p className="text-muted-foreground mt-2">यह सदस्य प्रोफ़ाइल मौजूद नहीं है।</p>
                <Button onClick={() => router.back()} className="mt-4">
                    <CornerUpLeft className="mr-2 h-4 w-4" />
                    वापस जाएं
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4 w-fit pl-1">
                <CornerUpLeft className="mr-2 h-4 w-4" />
                डैशबोर्ड पर वापस जाएं
            </Button>
            <Card>
                <CardHeader className="text-center">
                     <Avatar className="h-32 w-32 mx-auto">
                        <AvatarImage src={userProfile.profileImageUrl || `https://picsum.photos/seed/${userProfile.id}/200/200`} alt={userProfile.firstName} />
                        <AvatarFallback>{userProfile.firstName?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                </CardHeader>
                <CardContent className="text-center space-y-2">
                    <CardTitle className="font-headline text-3xl">{userProfile.firstName} {userProfile.lastName}</CardTitle>
                    <CardDescription className="text-lg">
                        {userProfile.roleInFamily || 'परिवार का सदस्य'}
                        {userAge && ` | आयु: ${userAge} वर्ष`}
                    </CardDescription>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2"><BookOpen/> रुचियां</CardTitle>
                </CardHeader>
                <CardContent>
                    {userProfile.generalInterests && userProfile.generalInterests.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {userProfile.generalInterests.map(interest => (
                                <span key={interest} className="bg-secondary text-secondary-foreground text-sm font-medium px-3 py-1 rounded-full">{interest}</span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground">अभी कोई रुचि नहीं जोड़ी गई है।</p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2"><Target /> सक्रिय लक्ष्य</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {areGoalsLoading ? (
                        <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>
                    ) : goals && goals.length > 0 ? (
                        goals.map(goal => (
                            <div key={goal.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                                <Target className="h-5 w-5 text-primary"/>
                                <p>{goal.description}</p>
                            </div>
                        ))
                    ) : (
                         <p className="text-muted-foreground">कोई सक्रिय लक्ष्य नहीं है।</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
