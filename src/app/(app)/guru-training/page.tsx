'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Search, Star, Calendar, FileText, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';

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
};

type CommunityEvent = {
    id: string;
    startDate: string;
    name: string;
};


export default function GuruTrainingPage() {
    const firestore = useFirestore();

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
    
    const curriculumLoading = coursesLoading || modulesLoading;

    return (
        <div className="space-y-8">
            <Card className="text-center bg-gradient-to-br from-secondary/80 to-secondary/60 text-secondary-foreground">
                <CardHeader>
                    <CardTitle className="font-headline text-4xl">🧘 क्या आप बनना चाहते हैं कुलगुरु?</CardTitle>
                    <CardDescription className="text-secondary-foreground/80 text-lg">
                        "एक गुरु सैकड़ों परिवारों को दिशा दे सकता है"
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center gap-4">
                    <Button variant="default" size="lg" className="bg-white text-secondary hover:bg-gray-100" asChild><Link href="/wip">आवेदन करें</Link></Button>
                    <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10" asChild><Link href="/wip">जानकारी लें</Link></Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">📚 {curriculumLoading ? 'पाठ्यक्रम लोड हो रहा है...' : course?.name || 'गुरु प्रशिक्षण पाठ्यक्रम'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {curriculumLoading && <div className="p-6 text-center"><Loader2 className="h-6 w-6 animate-spin" /></div>}
                    {!curriculumLoading && (!modules || modules.length === 0) && <p className="p-6 text-muted-foreground text-center">अभी कोई पाठ्यक्रम मॉड्यूल उपलब्ध नहीं है।</p>}
                    
                    {modules && modules.map((item, index) => {
                        // Using index for mock progress data
                        const progress = Math.max(20, 100 - index * 35);
                        const status = progress === 100 ? 'प्रमाणपत्र' : 'जारी रखें';

                        return (
                            <div key={item.id} className="space-y-3 p-4 border rounded-lg">
                               <div className="flex justify-between items-center">
                                 <h3 className="font-bold text-lg">🕉️ {item.name}</h3>
                                 <Button variant={progress === 100 ? "secondary" : "default"} size="sm" asChild>
                                    <Link href="/wip">
                                      {progress === 100 && <FileText className="mr-2 h-4 w-4" />}
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
                        <Button variant="outline" asChild><Link href="/wip">सभी देखें</Link></Button>
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
                    {workshops && workshops.map((event) => (
                        <div key={event.id} className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                            <Calendar className="h-6 w-6 text-primary" />
                            <div>
                                <p className="font-bold">{formatEventDate(event.startDate)}:</p>
                                <p>{event.name}</p>
                            </div>
                        </div>
                    ))}
                    <div className="text-center pt-4">
                        <Button asChild><Link href="/wip">पंजीकरण करें</Link></Button>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}
