'use client';
import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { doc, collection, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ThumbsUp, MessageSquare, CornerUpLeft } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { hi } from 'date-fns/locale';
import { cn } from '@/lib/utils';

type Topic = {
    id: string;
    title: string;
    description: string;
    creatorUserId: string;
    createdAt: { seconds: number; nanoseconds: number };
};

type Post = {
    id: string;
    authorUserId: string;
    content: string;
    createdAt: { seconds: number; nanoseconds: number };
    likes: number;
    likedBy?: string[];
};

type UserProfile = {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl: string;
};

// Component for a single post
function PostItem({ post, topicId }: { post: Post, topicId: string }) {
    const firestore = useFirestore();
    const { user } = useUser();
    const [isLiking, setIsLiking] = useState(false);
    
    const authorProfileRef = useMemoFirebase(() => {
        if (!post.authorUserId) return null;
        return doc(firestore, 'users', post.authorUserId);
    }, [firestore, post.authorUserId]);
    const { data: author, isLoading: isAuthorLoading } = useDoc<UserProfile>(authorProfileRef);

    const hasLiked = useMemo(() => post.likedBy?.includes(user?.uid || ''), [post.likedBy, user]);

    const formatPostDate = (timestamp: { seconds: number; nanoseconds: number }) => {
        if (!timestamp) return '...';
        try {
            const date = new Date(timestamp.seconds * 1000);
            return formatDistanceToNow(date, { addSuffix: true, locale: hi });
        } catch {
            return '...';
        }
    };
    
    const handleLikeToggle = async () => {
        if (!user || !firestore || isLiking) return;
        setIsLiking(true);

        const postRef = doc(firestore, `forumTopics/${topicId}/posts`, post.id);
        const currentLikes = post.likes || 0;
        const currentLikedBy = post.likedBy || [];
        
        let newLikedBy;
        let newLikes;

        if (hasLiked) {
            // Unlike
            newLikedBy = currentLikedBy.filter(uid => uid !== user.uid);
            newLikes = Math.max(0, currentLikes - 1);
        } else {
            // Like
            newLikedBy = [...currentLikedBy, user.uid];
            newLikes = currentLikes + 1;
        }
        
        try {
            await updateDocumentNonBlocking(postRef, {
                likes: newLikes,
                likedBy: newLikedBy
            });
        } catch (error) {
            console.error("Failed to update like", error);
        } finally {
            setIsLiking(false);
        }
    };


    return (
        <div className="flex gap-4">
            <Avatar className="mt-1 h-10 w-10">
                {isAuthorLoading ? <Loader2 className="h-full w-full animate-spin" /> : (
                    <>
                        <AvatarImage src={author?.profileImageUrl || `https://picsum.photos/seed/${post.authorUserId}/100/100`} />
                        <AvatarFallback>{author?.firstName?.charAt(0) || 'U'}</AvatarFallback>
                    </>
                )}
            </Avatar>
            <div className="flex-grow">
                <div className="flex items-center gap-2">
                    <p className="font-semibold">{isAuthorLoading ? 'लोड हो रहा है...' : `${author?.firstName || 'अनाम'} ${author?.lastName || ''}`}</p>
                    <p className="text-xs text-muted-foreground">{formatPostDate(post.createdAt)}</p>
                </div>
                <p className="mt-1 whitespace-pre-wrap">{post.content}</p>
                <div className="flex items-center gap-4 mt-2">
                    <Button variant="ghost" size="sm" className="flex items-center gap-1" onClick={handleLikeToggle} disabled={!user || isLiking}>
                        <ThumbsUp className={cn("h-4 w-4", hasLiked && "fill-current text-primary")} /> {post.likes || 0}
                    </Button>
                     <Button variant="ghost" size="sm" className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" /> जवाब दें
                    </Button>
                </div>
            </div>
        </div>
    );
}

const replySchema = z.object({
  content: z.string().min(1, { message: 'जवाब खाली नहीं हो सकता।' }),
});

export default function TopicPage() {
    const { topicId } = useParams() as { topicId: string };
    const { user } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const topicRef = useMemoFirebase(() => {
        if (!firestore || !topicId) return null;
        return doc(firestore, 'forumTopics', topicId);
    }, [firestore, topicId]);
    const { data: topic, isLoading: isTopicLoading } = useDoc<Topic>(topicRef);

    const postsQuery = useMemoFirebase(() => {
        if (!firestore || !topicId) return null;
        return query(collection(firestore, `forumTopics/${topicId}/posts`), orderBy('createdAt', 'asc'));
    }, [firestore, topicId]);
    const { data: posts, isLoading: arePostsLoading } = useCollection<Post>(postsQuery);

    const form = useForm<z.infer<typeof replySchema>>({
        resolver: zodResolver(replySchema),
        defaultValues: { content: '' },
    });

    const onSubmitReply = async (values: z.infer<typeof replySchema>) => {
        if (!user) {
            toast({ variant: 'destructive', title: 'आपको जवाब देने के लिए लॉग इन करना होगा।' });
            return;
        }
        setIsSubmitting(true);
        try {
            const postsColRef = collection(firestore, `forumTopics/${topicId}/posts`);
            const postData = {
                forumTopicId: topicId,
                authorUserId: user.uid,
                content: values.content,
                createdAt: serverTimestamp(),
                likes: 0,
                likedBy: [],
                emotionalReactions: [],
                isBestPostOfTheWeek: false,
            };
            const postDocRef = await addDocumentNonBlocking(postsColRef, postData);
            if (!postDocRef) throw new Error("Failed to create post");

            await updateDocumentNonBlocking(doc(firestore, `forumTopics/${topicId}/posts`, postDocRef.id), { id: postDocRef.id });

            // Update topic's lastPostAt and totalPosts
            await updateDocumentNonBlocking(topicRef!, {
                lastPostAt: serverTimestamp(),
                totalPosts: (posts?.length || 0) + 1
            });
            
            toast({ title: 'आपका जवाब पोस्ट कर दिया गया है!' });
            form.reset();
        } catch (error) {
            console.error("Error submitting reply:", error);
            toast({ variant: 'destructive', title: 'एक त्रुटि हुई', description: 'आपका जवाब पोस्ट करने में विफल। कृपया पुन: प्रयास करें।' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isTopicLoading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!topic) {
        return <div className="text-center">क्षमा करें, यह विषय नहीं मिला।</div>;
    }

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <Button variant="ghost" onClick={() => router.back()} className="mb-4 w-fit pl-1">
                        <CornerUpLeft className="mr-2 h-4 w-4" />
                        सभी विषयों पर वापस जाएं
                    </Button>
                    <CardTitle className="font-headline text-3xl">{topic.title}</CardTitle>
                    <CardDescription>
                       यह चर्चा समुदाय के सदस्यों द्वारा शुरू की गई थी।
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Separator />
                    {arePostsLoading && <div className="flex justify-center p-6"><Loader2 className="h-6 w-6 animate-spin" /></div>}
                    <div className="space-y-8">
                        {posts && posts.map(post => <PostItem key={post.id} post={post} topicId={topicId} />)}
                    </div>
                </CardContent>
                 <CardFooter>
                    {user ? (
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmitReply)} className="w-full space-y-4">
                                <FormField
                                    control={form.control}
                                    name="content"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-lg font-semibold">अपना जवाब दें</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="इस चर्चा में शामिल हों..."
                                                    className="min-h-[120px]"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    जवाब पोस्ट करें
                                </Button>
                            </form>
                        </Form>
                    ) : (
                        <div className="text-center w-full border-t pt-6">
                            <p className="text-muted-foreground">इस चर्चा में शामिल होने के लिए, कृपया लॉग इन करें।</p>
                            <Button asChild className="mt-4">
                                <Link href="/login">लॉग इन करें</Link>
                            </Button>
                        </div>
                    )}
                 </CardFooter>
            </Card>
        </div>
    );
}

