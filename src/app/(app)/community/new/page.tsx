'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useUser, useFirestore, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  title: z.string().min(10, { message: 'विषय कम से कम 10 अक्षर का होना चाहिए।' }).max(150, { message: 'विषय 150 अक्षर से अधिक नहीं हो सकता।' }),
  content: z.string().min(20, { message: 'विवरण कम से कम 20 अक्षर का होना चाहिए।' }),
});

export default function NewTopicPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      content: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'लॉग इन आवश्यक है',
        description: 'नया विषय शुरू करने के लिए कृपया लॉग इन करें।',
      });
      return;
    }

    setIsLoading(true);

    try {
      // 1. Create the ForumTopic document
      const topicsColRef = collection(firestore, 'forumTopics');
      const topicData = {
        title: values.title,
        description: values.content.substring(0, 100) + '...', // A short description from content
        creatorUserId: user.uid,
        createdAt: serverTimestamp(),
        lastPostAt: serverTimestamp(),
        tags: [],
        totalPosts: 1,
        totalComments: 0,
      };

      const topicDocRef = await addDocumentNonBlocking(topicsColRef, topicData);

      if (!topicDocRef) {
        throw new Error('Failed to create topic document reference.');
      }
      
      const topicId = topicDocRef.id;

      // Update the topic with its own ID
      await updateDocumentNonBlocking(doc(firestore, 'forumTopics', topicId), { id: topicId });

      // 2. Create the first ForumPost document in the subcollection
      const postsColRef = collection(firestore, `forumTopics/${topicId}/posts`);
      const postData = {
        forumTopicId: topicId,
        authorUserId: user.uid,
        content: values.content,
        createdAt: serverTimestamp(),
        likes: 0,
        emotionalReactions: [],
        isBestPostOfTheWeek: false,
      };

      const postDocRef = await addDocumentNonBlocking(postsColRef, postData);
      
      if (!postDocRef) {
        throw new Error('Failed to create post document reference.');
      }

      // Update the post with its own ID
      await updateDocumentNonBlocking(doc(firestore, `forumTopics/${topicId}/posts`, postDocRef.id), { id: postDocRef.id });

      toast({
        title: 'विषय सफलतापूर्वक बनाया गया!',
        description: 'आपको विषय पृष्ठ पर भेजा जा रहा है।',
      });

      // 3. Redirect to the new topic page
      router.push(`/community/topic/${topicId}`);

    } catch (error) {
      console.error('Error creating new topic:', error);
      toast({
        variant: 'destructive',
        title: 'एक त्रुटि हुई',
        description: 'विषय बनाने में विफल। कृपया पुन: प्रयास करें।',
      });
      setIsLoading(false);
    }
  };

  if (isUserLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  if (!user) {
      return (
          <div className="text-center">
             <p>नया विषय शुरू करने के लिए कृपया लॉग इन करें।</p>
             <Button asChild className="mt-4"><Link href="/login">लॉग इन</Link></Button>
         </div>
      );
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">📝 नया चर्चा विषय शुरू करें</CardTitle>
          <CardDescription>अपना प्रश्न या विचार समुदाय के साथ साझा करें।</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">विषय</FormLabel>
                    <FormControl>
                      <Input placeholder="अपने विषय को एक संक्षिप्त शीर्षक दें..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">विवरण</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="अपने प्रश्न या विचार का विस्तार से वर्णन करें..."
                        className="min-h-[200px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  रद्द करें
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  विषय प्रकाशित करें
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
