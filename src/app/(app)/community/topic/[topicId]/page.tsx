'use client';
import { useMemo, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { doc, collection, query, orderBy, serverTimestamp, increment } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ThumbsUp, MessageSquare, CornerUpLeft, Send } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { hi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type Topic = {
    id: string;
    title: string;
    description: string;
    creatorUserId: string;
    createdAt: { seconds: number; nanoseconds: number };
    totalComments?: number;
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

type ForumComment = {
    id: string;
    authorUserId: string;
    content: string;
    createdAt: { seconds: number; nanoseconds: number };
    likes?: number;
    likedBy?: string[];
};

// Component for a single comment
function CommentItem({ comment, topicId, postId }: { comment: ForumComment; topicId: string; postId: string; }) {
    const firestore = useFirestore();
    const { user } = useUser();
    const { toast } = useToast();
    const [isLiking, setIsLiking] = useState(false);

    const { data: author, isLoading: isAuthorLoading } = useDoc<UserProfile>(
        useMemoFirebase(() => comment.authorUserId ? doc(firestore, 'users', comment.authorUserId) : null, [firestore, comment.authorUserId])
    );
    
    const hasLiked = useMemo(() => comment.likedBy?.includes(user?.uid || ''), [comment.likedBy, user]);

    const handleCommentLikeToggle = async () => {
        if (!user || !firestore || isLiking) return;
        setIsLiking(true);

        const commentRef = doc(firestore, `forumTopics/${topicId}/posts/${postId}/comments`, comment.id);
        const currentLikedBy = comment.likedBy || [];
        
        let newLikedBy;
        if (hasLiked) {
            newLikedBy = currentLikedBy.filter(uid => uid !== user.uid);
        } else {
            newLikedBy = [...currentLikedBy, user.uid];
        }
        
        try {
            await updateDocumentNonBlocking(commentRef, {
                likes: newLikedBy.length,
                likedBy: newLikedBy
            });
        } catch (error) {
            console.error("Failed to update comment like", error);
            toast({ variant: "destructive", title: "एक त्रुटि हुई", description: "टिप्पणी पसंद करने में विफल।" });
        } finally {
            setIsLiking(false);
        }
    };

    const formatCommentDate = (timestamp: { seconds: number; nanoseconds: number }) => {
        if (!timestamp) return '...';
        try {
            return formatDistanceToNow(new Date(timestamp.seconds * 1000), { addSuffix: true, locale: hi });
        } catch {
            return '...';
        }
    };

    return (
        <div className="flex gap-3">
            <Link href={`/member/${comment.authorUserId}`} className="flex-shrink-0">
                <Avatar className="h-8 w-8 cursor-pointer">
                    {isAuthorLoading ? <Loader2 className="h-full w-full animate-spin" /> : (
                        <>
                            <AvatarImage src={author?.profileImageUrl || `https://picsum.photos/seed/${comment.authorUserId}/100/100`} />
                            <AvatarFallback>{author?.firstName?.charAt(0) || 'U'}</AvatarFallback>
                        </>
                    )}
                </Avatar>
            </Link>
            <div className="flex-grow bg-muted/50 rounded-md px-3 py-2">
                <div className="flex items-center gap-2">
                    <Link href={`/member/${comment.authorUserId}`} className="font-semibold text-sm hover:underline">
                        {isAuthorLoading ? '...' : `${author?.firstName || 'अनाम'} ${author?.lastName || ''}`}
                    </Link>
                    <p className="text-xs text-muted-foreground">{formatCommentDate(comment.createdAt)}</p>
                </div>
                <p className="text-sm mt-1 whitespace-pre-wrap">{comment.content}</p>
                 <div className="flex items-center mt-1">
                    <Button variant="ghost" size="sm" className="flex items-center gap-1 h-7 px-1 text-xs" onClick={handleCommentLikeToggle} disabled={!user || isLiking}>
                        <ThumbsUp className={cn("h-3 w-3", hasLiked && "fill-current text-primary")} /> {comment.likes || 0}
                    </Button>
                </div>
            </div>
        </div>
    );
}

// Component for a single post
function PostItem({ post, topicId, topic }: { post: Post, topicId: string, topic: Topic }) {
    const firestore = useFirestore();
    const { user } = useUser();
    const { toast } = useToast();
    const [isLiking, setIsLiking] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    
    const authorProfileRef = useMemoFirebase(() => {
        if (!post.authorUserId) return null;
        return doc(firestore, 'users', post.authorUserId);
    }, [firestore, post.authorUserId]);
    const { data: author, isLoading: isAuthorLoading } = useDoc<UserProfile>(authorProfileRef);

    const commentsQuery = useMemoFirebase(() => {
        if (!firestore || !topicId || !post.id) return null;
        return query(collection(firestore, `forumTopics/${topicId}/posts/${post.id}/comments`), orderBy('createdAt', 'asc'));
    }, [firestore, topicId, post.id]);
    const { data: comments, isLoading: areCommentsLoading } = useCollection<ForumComment>(commentsQuery);

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
        const currentLikedBy = post.likedBy || [];
        
        let newLikedBy;
        if (hasLiked) {
            newLikedBy = currentLikedBy.filter(uid => uid !== user.uid);
        } else {
            newLikedBy = [...currentLikedBy, user.uid];
        }
        
        try {
            await updateDocumentNonBlocking(postRef, {
                likes: newLikedBy.length,
                likedBy: newLikedBy
            });
        } catch (error) {
            console.error("Failed to update like", error);
            toast({ variant: "destructive", title: "एक त्रुटि हुई", description: "पोस्ट पसंद करने में विफल।" });
        } finally {
            setIsLiking(false);
        }
    };

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim() || !user || !firestore) return;
        setIsSubmittingComment(true);

        try {
            const commentsColRef = collection(firestore, `forumTopics/${topicId}/posts/${post.id}/comments`);
            const commentData = {
                forumPostId: post.id,
                authorUserId: user.uid,
                content: commentText,
                createdAt: serverTimestamp(),
                likes: 0,
                likedBy: [],
            };
            const commentDocRef = await addDocumentNonBlocking(commentsColRef, commentData);
            if (!commentDocRef) throw new Error("Failed to create comment");

            await updateDocumentNonBlocking(commentDocRef, { id: commentDocRef.id });

            const topicRef = doc(firestore, 'forumTopics', topicId);
            await updateDocumentNonBlocking(topicRef, {
                totalComments: increment(1),
                lastPostAt: serverTimestamp(),
            });

            setCommentText('');

        } catch (error) {
             console.error("Error submitting comment:", error);
            toast({ variant: 'destructive', title: 'एक त्रुटि हुई', description: 'आपकी टिप्पणी पोस्ट करने में विफल।' });
        } finally {
            setIsSubmittingComment(false);
        }
    };

    return (
        <div className="flex gap-4">
            <Link href={`/member/${post.authorUserId}`} className="flex-shrink-0 mt-1">
                <Avatar className="h-10 w-10 cursor-pointer">
                    {isAuthorLoading ? <Loader2 className="h-full w-full animate-spin" /> : (
                        <>
                            <AvatarImage src={author?.profileImageUrl || `https://picsum.photos/seed/${post.authorUserId}/100/100`} />
                            <AvatarFallback>{author?.firstName?.charAt(0) || 'U'}</AvatarFallback>
                        </>
                    )}
                </Avatar>
            </Link>
            <div className="flex-grow">
                <div className="flex items-center gap-2">
                    <Link href={`/member/${post.authorUserId}`} className="font-semibold hover:underline">
                        {isAuthorLoading ? 'लोड हो रहा है...' : `${author?.firstName || 'अनाम'} ${author?.lastName || ''}`}
                    </Link>
                    <p className="text-xs text-muted-foreground">{formatPostDate(post.createdAt)}</p>
                </div>
                <p className="mt-1 whitespace-pre-wrap">{post.content}</p>
                <div className="flex items-center gap-4 mt-2">
                    <Button variant="ghost" size="sm" className="flex items-center gap-1" onClick={handleLikeToggle} disabled={!user || isLiking}>
                        <ThumbsUp className={cn("h-4 w-4", hasLiked && "fill-current text-primary")} /> {post.likes || 0}
                    </Button>
                    <Button variant="ghost" size="sm" className="flex items-center gap-1" onClick={() => setShowComments(!showComments)}>
                        <MessageSquare className="h-4 w-4" /> {areCommentsLoading ? '...' : comments?.length || 0} जवाब
                    </Button>
                </div>
                {showComments && (
                    <div className="pl-0 md:pl-8 mt-4 space-y-4">
                        {areCommentsLoading ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin"/> टिप्पणियाँ लोड हो रही हैं...
                            </div>
                        ) : comments && comments.length > 0 ? (
                            comments.map(comment => <CommentItem key={comment.id} comment={comment} topicId={topicId} postId={post.id} />)
                        ) : (
                            <p className="text-sm text-muted-foreground">अभी तक कोई टिप्पणी नहीं है।</p>
                        )}
                        
                        {user && (
                            <form onSubmit={handleCommentSubmit} className="flex items-start gap-2 pt-4">
                                <Avatar className="h-8 w-8 flex-shrink-0">
                                    <AvatarImage src={user.photoURL || `https://picsum.photos/seed/${user.uid}/100/100`} />
                                    <AvatarFallback>{user.displayName?.charAt(0) || 'A'}</AvatarFallback>
                                </Avatar>
                                <div className="flex-grow">
                                <Textarea 
                                    placeholder="एक टिप्पणी लिखें..."
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    className="min-h-[60px] text-sm"
                                    disabled={isSubmittingComment}
                                />
                                <Button type="submit" size="sm" className="mt-2" disabled={isSubmittingComment || !commentText.trim()}>
                                    {isSubmittingComment ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                    <span className="ml-2">टिप्पणी पोस्ट करें</span>
                                </Button>
                                </div>
                            </form>
                        )}
                    </div>
                )}
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
    const replyTextareaRef = useRef<HTMLTextAreaElement | null>(null);

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

            // Update topic's lastPostAt and totalPosts using increment
            await updateDocumentNonBlocking(topicRef!, {
                lastPostAt: serverTimestamp(),
                totalPosts: increment(1)
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
                        {posts && topic && posts.map(post => <PostItem key={post.id} post={post} topicId={topicId} topic={topic} />)}
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
                                            <FormLabel className="text-lg font-semibold">इस विषय में एक नया जवाब जोड़ें</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    ref={(e) => {
                                                        field.ref(e);
                                                        replyTextareaRef.current = e;
                                                    }}
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
