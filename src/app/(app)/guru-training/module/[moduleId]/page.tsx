'use client';

import { useParams, useRouter } from 'next/navigation';
import { useFirestore, useDoc, useCollection, useMemoFirebase, useUser, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { doc, collection, query, where, limit, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CornerUpLeft, BookOpen, FileText, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

type TrainingCourse = {
    id: string;
};

type CourseModule = {
  id: string;
  name: string;
  description: string;
  syllabusTopics: string[];
  resourceArticleIds?: string[];
};

type KnowledgeArticle = {
    id: string;
    title: string;
    summary: string;
};

// NEW Type
type GuruTrainingProgress = {
    id: string;
    courseModuleId: string;
    status: 'Not Started' | 'In Progress' | 'Completed';
    progressPercentage: number;
};

// A small component to render each resource article
function ResourceArticleItem({ articleId }: { articleId: string }) {
    const firestore = useFirestore();
    const articleRef = useMemoFirebase(() => doc(firestore, 'knowledgeArticles', articleId), [firestore, articleId]);
    const { data: article, isLoading } = useDoc<KnowledgeArticle>(articleRef);

    if (isLoading) {
        return <Skeleton className="h-16 w-full rounded-lg" />;
    }

    if (!article) {
        return null;
    }

    return (
        <Link href={`/knowledge-hub/${article.id}`} className="block p-3 rounded-lg hover:bg-muted">
            <h4 className="font-semibold text-primary">{article.title}</h4>
            <p className="text-sm text-muted-foreground line-clamp-2">{article.summary}</p>
        </Link>
    );
}

export default function ModuleDetailPage() {
  const { moduleId } = useParams() as { moduleId: string };
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const [isCompleting, setIsCompleting] = useState(false);


  // We need to get the course ID first, assuming there's only one course for now.
  const coursesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'trainingCourses'), limit(1));
  }, [firestore]);
  const { data: courses, isLoading: isCoursesLoading } = useCollection<TrainingCourse>(coursesQuery);
  const courseId = courses?.[0]?.id;

  const moduleRef = useMemoFirebase(() => {
    if (!firestore || !courseId || !moduleId) return null;
    return doc(firestore, `trainingCourses/${courseId}/modules`, moduleId);
  }, [firestore, courseId, moduleId]);

  const { data: module, isLoading: isModuleLoading } = useDoc<CourseModule>(moduleRef);

  // NEW: Fetch progress for this specific module
  const progressQuery = useMemoFirebase(() => {
    if (!firestore || !user || !moduleId) return null;
    return query(
      collection(firestore, `gurus/${user.uid}/trainingProgress`),
      where('courseModuleId', '==', moduleId),
      limit(1)
    );
  }, [firestore, user, moduleId]);
  const { data: progressData, isLoading: isProgressLoading } = useCollection<GuruTrainingProgress>(progressQuery);
  const moduleProgress = progressData?.[0];
  const isCompleted = moduleProgress?.status === 'Completed';


  const isLoading = isCoursesLoading || isModuleLoading || isProgressLoading;

  const handleMarkComplete = async () => {
    if (!user || !moduleId || !firestore) return;
    setIsCompleting(true);

    try {
        if (moduleProgress) {
            // Update existing progress document
            const progressRef = doc(firestore, `gurus/${user.uid}/trainingProgress`, moduleProgress.id);
            await updateDocumentNonBlocking(progressRef, {
                status: 'Completed',
                progressPercentage: 100,
                completionDate: serverTimestamp()
            });
        } else {
            // Create new progress document
            const progressColRef = collection(firestore, `gurus/${user.uid}/trainingProgress`);
            const newProgressData = {
                guruId: user.uid,
                courseModuleId: moduleId,
                status: 'Completed' as const,
                progressPercentage: 100,
                completionDate: serverTimestamp()
            };
            const docRef = await addDocumentNonBlocking(progressColRef, newProgressData);
            if(docRef) {
                 await updateDocumentNonBlocking(docRef, { id: docRef.id });
            }
        }
        toast({ title: 'बधाई!', description: `आपने "${module?.name}" मॉड्यूल पूरा कर लिया है।` });
    } catch(error) {
        console.error("Error marking module complete:", error);
        toast({ variant: "destructive", title: "एक त्रुटि हुई", description: "मॉड्यूल पूरा करने में विफल।" });
    } finally {
        setIsCompleting(false);
    }
  };


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">मॉड्यूल लोड हो रहा है...</p>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="text-center h-[60vh] flex flex-col justify-center items-center">
        <h1 className="text-2xl font-bold">मॉड्यूल नहीं मिला</h1>
        <p className="text-muted-foreground mt-2">यह मॉड्यूल मौजूद नहीं है या हटा दिया गया है।</p>
        <Button asChild className="mt-6">
          <Link href="/guru-training">गुरु प्रशिक्षण पर वापस जाएं</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
       <Button variant="ghost" onClick={() => router.back()} className="mb-4 w-fit pl-1">
            <CornerUpLeft className="mr-2 h-4 w-4" />
            गुरु प्रशिक्षण पर वापस जाएं
        </Button>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-4xl">🕉️ {module.name}</CardTitle>
          <CardDescription className="text-lg pt-2">
            {module.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
           <div>
                <h3 className="text-2xl font-semibold font-headline mb-4 flex items-center gap-2">
                    <FileText />
                    पाठ्यक्रम विषय
                </h3>
                 <ul className="list-disc pl-5 space-y-2 text-lg">
                    {module.syllabusTopics.map((topic, index) => (
                        <li key={index}>{topic}</li>
                    ))}
                </ul>
           </div>
          
          {module.resourceArticleIds && module.resourceArticleIds.length > 0 && (
            <div>
              <h3 className="text-2xl font-semibold font-headline mb-4 flex items-center gap-2">
                <BookOpen />
                अध्ययन संसाधन
              </h3>
              <div className="space-y-4">
                {module.resourceArticleIds.map((articleId) => (
                  <ResourceArticleItem key={articleId} articleId={articleId} />
                ))}
              </div>
            </div>
          )}
        </CardContent>
         <CardFooter className="bg-muted/50 p-6">
             <Button 
                size="lg" 
                onClick={handleMarkComplete}
                disabled={isCompleting || isCompleted}
                className="w-full md:w-auto"
            >
                {isCompleting ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                    <CheckCircle className="mr-2 h-5 w-5" />
                )}
                {isCompleted ? 'मॉड्यूल पूरा हुआ' : 'पूर्ण के रूप में चिह्नित करें'}
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
