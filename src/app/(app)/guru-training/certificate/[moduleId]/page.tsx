'use client';

import { useParams, useRouter } from 'next/navigation';
import { useFirestore, useDoc, useMemoFirebase, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CornerUpLeft, Download, Award, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

type CourseModule = {
  id: string;
  name: string;
};

type UserProfile = {
    firstName: string;
    lastName: string;
};

export default function CertificatePage() {
  const { moduleId } = useParams() as { moduleId: string };
  const firestore = useFirestore();
  const router = useRouter();
  const { user } = useUser();

  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const moduleRef = useMemoFirebase(() => {
    if (!firestore || !moduleId) return null;
    // Attempt to find in generic activities or specific training path if structured
    return doc(firestore, 'trainingCourses/guru-cert-1/modules', moduleId);
  }, [firestore, moduleId]);
  const { data: module, isLoading: isModuleLoading } = useDoc<CourseModule>(moduleRef);

  if (isProfileLoading || isModuleLoading) {
    return <div className="flex justify-center items-center h-[60vh]"><Loader2 className="h-10 w-10 animate-spin" /></div>;
  }

  const fullName = userProfile ? `${userProfile.firstName} ${userProfile.lastName || ''}` : 'प्रशिक्षु गुरु';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <CornerUpLeft className="mr-2 h-4 w-4" />
        वापस जाएं
      </Button>

      <Card className="border-8 border-double border-primary/20 shadow-2xl relative overflow-hidden bg-background">
        <div className="absolute top-0 right-0 p-8 opacity-10">
            <Award className="h-64 w-64 text-primary" />
        </div>
        
        <CardContent className="p-12 text-center space-y-12 relative z-10">
          <div className="space-y-4">
            <Award className="h-20 w-20 mx-auto text-primary" />
            <h1 className="text-5xl font-bold font-headline text-secondary">प्रमाणपत्र</h1>
            <p className="text-xl uppercase tracking-widest text-muted-foreground">प्रमाणित किया जाता है कि</p>
          </div>

          <div className="py-4 border-b-2 border-primary/20 inline-block px-12">
            <h2 className="text-4xl font-headline font-bold">{fullName}</h2>
          </div>

          <p className="text-2xl font-body max-w-2xl mx-auto leading-relaxed">
            ने <strong>कुलगुरु प्रशिक्षण कार्यक्रम</strong> के अंतर्गत मॉड्यूल <br/>
            <span className="text-primary text-3xl font-headline block mt-4">"{module?.name || 'विशेषज्ञ पाठ्यक्रम'}"</span>
            को सफलतापूर्वक पूरा किया है।
          </p>

          <div className="flex flex-col items-center gap-2 pt-8">
            <ShieldCheck className="h-12 w-12 text-green-600" />
            <p className="text-sm font-semibold text-muted-foreground uppercase">कुलगुरु AI द्वारा सत्यापित</p>
          </div>

          <div className="flex justify-between items-end pt-12">
             <div className="text-left">
                <p className="font-headline text-xl">दिनांक</p>
                <p className="text-muted-foreground">{new Date().toLocaleDateString('hi-IN')}</p>
             </div>
             <div className="text-right">
                <p className="font-headline text-xl italic">कुलगुरु संस्थान</p>
                <div className="h-1 w-32 bg-muted mt-2"></div>
             </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center gap-4">
          <Button size="lg" className="px-8" onClick={() => window.print()}>
            <Download className="mr-2 h-5 w-5" /> डाउनलोड करें
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/guru-training">प्रशिक्षण जारी रखें</Link>
          </Button>
      </div>
    </div>
  );
}
