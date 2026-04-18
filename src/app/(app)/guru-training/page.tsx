'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Search, Star, Calendar, FileText, Loader2, GraduationCap } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc, setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, limit, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

// Types based on backend.json
type TrainingCourse = {
    id: string;
    name: string;
    description: string;
    durationYears: number;
};

type CourseModule = {
    id: string;
    name: string;
    description: string;
    syllabusTopics: string[];
};

type Guru = {
    id: string;
    userId: string;
    city: string;
    familiesManagedCount: number;
    overallRating: number;
    profileImageUrl?: string;
    firstName: string;
    lastName: string;
    specializations: string[];
};

type CommunityEvent = {
    id: string;
    startDate: string;
    name: string;
    attendeeIds?: string[];
    attendeeCount?: number;
};

// New Type for training progress
type GuruTrainingProgress = {
    id: string;
    courseModuleId: string;
    status: 'Not Started' | 'In Progress' | 'Completed';
    progressPercentage: number;
};


export default function GuruTrainingPage() {
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();
    const { toast } = useToast();
    const router = useRouter();
    const [isJoining, setIsJoining] = useState(false);
    const [registeringEventId, setRegisteringEventId] = useState<string | null>(null);

    // Fetch user's main profile to get name, etc.
    const userProfileRef = useMemoFirebase(() => {
        if (!user) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);
    const { data: userProfile, isLoading: isUserProfileLoading } = useDoc<any>(userProfileRef);

    // Fetch guru profile
    const guruProfileRef = useMemoFirebase(() => {
        if (!user) return null;
        return doc(firestore, 'gurus', user.uid);
    }, [firestore, user]);
    const { data: guruProfile, isLoading: isGuruProfileLoading } = useDoc<Guru>(guruProfileRef);


    // Fetch the main training course (assuming one for now)
    const coursesQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'trainingCourses'), limit(1));
    }, [firestore]);
    const { data: courses, isLoading: coursesLoading } = useCollection<TrainingCourse>(coursesQuery);
    const course = courses?.[0];

    // Fetch modules for that course
    const modulesQuery = useMemoFirebase(() => {
        if (!firestore || !course?.id) return null;
        return query(collection(firestore, `trainingCourses/${course.id}/modules`), orderBy('name', 'asc'));
    }, [firestore, course]);
    const { data: modules, isLoading: modulesLoading } = useCollection<CourseModule>(modulesQuery);

    // NEW: Fetch training progress
    const trainingProgressQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(collection(firestore, `gurus/${user.uid}/trainingProgress`));
    }, [firestore, user]);
    const { data: trainingProgress, isLoading: progressLoading } = useCollection<GuruTrainingProgress>(trainingProgressQuery);

    // NEW: Create a map for easy progress lookup
    const progressMap = useMemo(() => {
        if (!trainingProgress) return new Map<string, GuruTrainingProgress>();
        return new Map(trainingProgress.map(p => [p.courseModuleId, p]));
    }, [trainingProgress]);


    const gurusQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'gurus'), orderBy('overallRating', 'desc'), limit(4));
    }, [firestore]);
    const { data: activeGurus, isLoading: gurusLoading } = useCollection<Guru>(gurusQuery);
    
    const workshopsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'communityEvents'), orderBy('startDate', 'asc'), limit(3));
    }, [firestore]);
    const { data: workshops, isLoading: workshopsLoading } = useCollection<CommunityEvent>(workshopsQuery);

    const handleJoinTraining = async () => {
        if (!user || !userProfile || !guruProfileRef) {
            toast({ variant: 'destructive', title: 'त्रुटि', description: 'कृपया पुन: प्रयास करें।' });
            return;
        }
        setIsJoining(true);
        try {
            const newGuruData = {
                id: user.uid,
                userId: user.uid,
                firstName: userProfile.firstName || 'अनाम',
                lastName: userProfile.lastName || '',
                profileImageUrl: userProfile.profileImageUrl || `https://picsum.photos/seed/${user.uid}/100/100`,
                city: '',
                specializations: ['प्रशिक्षण में'],
                languageSkills: ['हिंदी'],
                isApproved: false,
                overallRating: 0,
                familiesManagedCount: 0,
                certifiedCourseModuleIds: []
            };
            await setDocumentNonBlocking(guruProfileRef, newGuruData, { merge: true });
            toast({ title: 'बधाई हो!', description: 'आप गुरु प्रशिक्षण कार्यक्रम में शामिल हो गए हैं।' });
        } catch (error) {
            console.error('Failed to create guru profile:', error);
            toast({ variant: 'destructive', title: 'एक त्रुटि हुई', description: 'कार्यक्रम में शामिल होने में विफल। कृपया पुन: प्रयास करें।' });
        } finally {
            setIsJoining(false);
        }
    };

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

    const handleRegisterForEvent = async (event: CommunityEvent) => {
        if (!user) {
            toast({ variant: 'destructive', title: 'लॉग इन आवश्यक है', description: 'किसी कार्यक्रम में शामिल होने के लिए कृपया लॉग इन करें।' });
            router.push('/login');
            return;
        }
        setRegisteringEventId(event.id);
        
        const eventDocRef = doc(firestore, 'communityEvents', event.id);
        const currentAttendeeIds = event.attendeeIds || [];
        const isRegistered = currentAttendeeIds.includes(user.uid);
        
        let newAttendeeIds;
        if (isRegistered) {
            newAttendeeIds = currentAttendeeIds.filter(id => id !== user.uid);
            toast({ title: 'पंजीकरण रद्द किया गया', description: `आप अब "${event.name}" कार्यक्रम में शामिल नहीं हैं।`});
        } else {
            newAttendeeIds = [...currentAttendeeIds, user.uid];
            toast({ title: 'पंजीकरण सफल!', description: `आप "${event.name}" कार्यक्रम में शामिल हो गए हैं।`});
        }
        const newAttendeeCount = newAttendeeIds.length;

        try {
            await updateDocumentNonBlocking(eventDocRef, { 
                attendeeIds: newAttendeeIds,
                attendeeCount: newAttendeeCount
            });
        } catch (error) {
            console.error('Error registering for event:', error);
            toast({ variant: 'destructive', title: 'एक त्रुटि हुई', description: 'पंजीकरण में विफल। कृपया पुन: प्रयास करें।' });
        } finally {
            setRegisteringEventId(null);
        }
    };
    
    const curriculumLoading = coursesLoading || modulesLoading || progressLoading;

    if (isUserLoading || isGuruProfileLoading || isUserProfileLoading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!user) {
        return (
            <div className="text-center p-10">
                <Card className="max-w-md mx-auto">
                    <CardHeader>
                        <CardTitle>लॉग इन आवश्यक है</CardTitle>
                        <CardDescription>गुरु प्रशिक्षण कार्यक्रम देखने के लिए कृपया लॉग इन करें।</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="mt-4"><Link href="/login">लॉग इन</Link></Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!guruProfile) {
        return (
            <Card className="text-center max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">गुरु बनने की अपनी यात्रा शुरू करें</CardTitle>
                    <CardDescription className="text-lg mt-2">
                       हमारे प्रशिक्षण कार्यक्रम में शामिल हों और सैकड़ों परिवारों को मार्गदर्शन देने की क्षमता हासिल करें।
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button size="lg" onClick={handleJoinTraining} disabled={isJoining}>
                        {isJoining ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <GraduationCap className="mr-2 h-5 w-5" />}
                        प्रशिक्षण कार्यक्रम में शामिल हों
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-8">
            <Card className="text-center bg-gradient-to-br from-secondary/80 to-secondary/60 text-secondary-foreground">
                <CardHeader>
                    <CardTitle className="font-headline text-4xl">🧘 आप एक प्रशिक्षु कुलगुरु हैं</CardTitle>
                    <CardDescription className="text-secondary-foreground/80 text-lg">
                        "एक गुरु सैकड़ों परिवारों को दिशा दे सकता है"
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center gap-4">
                    <Button variant="default" size="lg" className="bg-white text-secondary hover:bg-gray-100" asChild><Link href="/wip">मेरा डैशबोर्ड</Link></Button>
                    <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10" asChild><Link href="/wip">सहायता</Link></Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">📚 {coursesLoading ? 'पाठ्यक्रम लोड हो रहा है...' : course?.name || 'गुरु प्रशिक्षण पाठ्यक्रम'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {curriculumLoading && <div className="p-6 text-center"><Loader2 className="h-6 w-6 animate-spin" /></div>}
                    {!curriculumLoading && (!modules || modules.length === 0) && <p className="p-6 text-muted-foreground text-center">अभी कोई पाठ्यक्रम मॉड्यूल उपलब्ध नहीं है।</p>}
                    
                    {modules && modules.map((item) => {
                        const moduleProgress = progressMap.get(item.id);
                        const progress = moduleProgress?.progressPercentage ?? 0;
                        const isCompleted = moduleProgress?.status === 'Completed';
                        const status = isCompleted ? 'प्रमाणपत्र' : 'जारी रखें';

                        return (
                            <div key={item.id} className="space-y-3 p-4 border rounded-lg">
                               <div className="flex justify-between items-center">
                                 <h3 className="font-bold text-lg">🕉️ {item.name}</h3>
                                 <Button variant={isCompleted ? "secondary" : "default"} size="sm" asChild>
                                    <Link href={isCompleted ? '/wip' : `/guru-training/module/${item.id}`}>
                                      {isCompleted && <FileText className="mr-2 h-4 w-4" />}
                                      {status}
                                    </Link>
                                </Button>
                               </div>
                               {item.syllabusTopics && (
                                 <ul className="list-disc pl-5 text-muted-foreground">
                                     {item.syllabusTopics.map(d => <li key={d}>{d}</li>)}
                                 </ul>
                               )}
                               <div className="flex items-center gap-2">
                                    <Progress value={progress} className="flex-grow" />
                                    <span className="text-sm font-medium">{progress}%</span>
                               </div>
                            </div>
                        )
                    })}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">👥 सक्रिय गुरुओं की सूची</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input placeholder="खोजें: शहर, नाम, भाषा..." className="pl-10 h-11" />
                    </div>
                    <div className="space-y-4">
                        {gurusLoading && <div className="p-6 text-center"><Loader2 className="h-6 w-6 animate-spin" /></div>}
                        {!gurusLoading && (!activeGurus || activeGurus.length === 0) && <p className="p-6 text-muted-foreground text-center">अभी कोई सक्रिय गुरु उपलब्ध नहीं है।</p>}
                        {activeGurus && activeGurus.map(guru => (
                            <div key={guru.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                <div className="flex items-center gap-4">
                                    <Avatar>
                                        <AvatarImage src={guru.profileImageUrl || `https://picsum.photos/seed/${guru.userId}/100/100`} />
                                        <AvatarFallback>{(guru.firstName || 'G').charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">{guru.firstName} {guru.lastName} - {guru.city}</p>
                                        <p className="text-sm text-muted-foreground">{guru.familiesManagedCount || 0} परिवार</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-yellow-500">
                                    <Star className="h-5 w-5 fill-current" />
                                    <span className="font-bold">{guru.overallRating || 0}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="text-center pt-6">
                        <Button variant="outline" asChild><Link href="/gurus">सभी देखें</Link></Button>
                    </div>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">📅 आगामी कार्यशालाएं</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     {workshopsLoading && <div className="p-6 text-center"><Loader2 className="h-6 w-6 animate-spin" /></div>}
                     {!workshopsLoading && (!workshops || workshops.length === 0) && <p className="p-6 text-muted-foreground text-center">अभी कोई आगामी कार्यशाला नहीं है।</p>}
                    {workshops && workshops.map((event) => {
                        const isRegistered = user ? event.attendeeIds?.includes(user.uid) : false;
                        const isRegistering = registeringEventId === event.id;
                        return (
                            <div key={event.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 bg-muted rounded-lg">
                                <div className='flex items-center gap-4 flex-grow'>
                                    <Calendar className="h-6 w-6 text-primary flex-shrink-0"/>
                                    <div>
                                        <p className="font-bold">{formatEventDate(event.startDate)}:</p>
                                        <p>{event.name}</p>
                                    </div>
                                </div>
                                <Button 
                                    onClick={() => handleRegisterForEvent(event)} 
                                    disabled={!user || isRegistering}
                                    variant={isRegistered ? "secondary" : "default"}
                                    className="w-full sm:w-auto"
                                >
                                    {isRegistering ? <Loader2 className="h-4 w-4 animate-spin"/> : (isRegistered ? 'आप पंजीकृत हैं' : 'पंजीकरण करें')}
                                </Button>
                            </div>
                        );
                    })}
                </CardContent>
            </Card>

        </div>
    );
}
