'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Loader2, CornerUpLeft, Send } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, serverTimestamp, limit } from 'firebase/firestore';
import { conversationalCrisisCounseling } from '@/ai/flows/conversational-crisis-counseling';
import { Logo } from '@/components/logo';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type Message = {
  id?: string;
  role: 'user' | 'model';
  content: string;
  timestamp?: any;
};

const WELCOME_MESSAGE: Message = {
    role: 'model',
    content: 'नमस्ते। आप अकेले नहीं हैं। कृपया मुझे बताएं कि आप कैसा महसूस कर रहे हैं या आपके मन में क्या चल रहा है। मैं यहां आपको सुनने और समर्थन देने के लिए हूं।',
};

export default function CrisisChatPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();
    const [userInput, setUserInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const messagesQuery = useMemoFirebase(() => {
        if (!user) return null;
        const messagesRef = collection(firestore, `users/${user.uid}/conversations/crisis-chat/messages`);
        return query(messagesRef, orderBy('timestamp', 'asc'), limit(50));
    }, [firestore, user]);

    const { data: conversation, isLoading: messagesLoading } = useCollection<Message>(messagesQuery);
    
    const messages = useMemo(() => {
        if (!conversation || conversation.length === 0) {
            return [WELCOME_MESSAGE];
        }
        return [WELCOME_MESSAGE, ...conversation];
    }, [conversation]);

    useEffect(() => {
        if (scrollAreaRef.current) {
            const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
            if (viewport) {
                setTimeout(() => viewport.scrollTop = viewport.scrollHeight, 100);
            }
        }
    }, [messages, isSending]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || !user) return;

        const userMessageText = userInput;
        setIsSending(true);
        setUserInput('');

        const messagesRef = collection(firestore, `users/${user.uid}/conversations/crisis-chat/messages`);
        
        const userMessageData = {
            role: 'user' as const,
            content: userMessageText,
            timestamp: serverTimestamp(),
        };
        
        addDocumentNonBlocking(messagesRef, userMessageData);

        try {
            const history = (conversation || []).map(msg => ({ role: msg.role, content: msg.content }));
            
            const response = await conversationalCrisisCounseling({ 
                question: userMessageText,
                history: history
            });
      
            const aiMessageData = {
                role: 'model' as const,
                content: response.answer,
                timestamp: serverTimestamp(),
            };
            addDocumentNonBlocking(messagesRef, aiMessageData);
      
        } catch (error) {
            console.error("Error with AI crisis counseling:", error);
            const errorMessageData = {
                role: 'model' as const,
                content: 'माफ़ कीजिए, मुझे उत्तर देने में कुछ समस्या आ रही है। कृपया कुछ देर बाद पुनः प्रयास करें।',
                timestamp: serverTimestamp(),
            };
            addDocumentNonBlocking(messagesRef, errorMessageData);
        } finally {
            setIsSending(false);
        }
    };
    
    if (isUserLoading) {
        return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!user) {
        toast({
            variant: 'destructive',
            title: 'लॉग इन आवश्यक है',
            description: 'सहायता प्राप्त करने के लिए कृपया लॉग इन करें।',
        });
        router.push('/login?redirect=/crisis-counseling/chat');
        return null;
    }

    return (
        <Card className="flex h-[calc(100vh-8rem)] flex-col">
             <CardHeader className="flex flex-row items-center border-b p-4">
                <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.push('/crisis-counseling')}>
                    <CornerUpLeft className="h-5 w-5" />
                </Button>
                <Avatar className="h-10 w-10 mr-4">
                    <Logo />
                </Avatar>
                <div className="flex-grow">
                    <CardTitle className="text-lg font-bold">कुलगुरु AI - संकट सहायक</CardTitle>
                    <p className="text-sm text-green-500 flex items-center gap-1">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        ऑनलाइन
                    </p>
                </div>
            </CardHeader>
            <CardContent className="flex-grow p-0">
                <ScrollArea className="h-full" ref={scrollAreaRef}>
                    <div className="p-4 space-y-4">
                        {messagesLoading && messages.length <= 1 && (
                            <div className="flex justify-center p-10"><Loader2 className="h-8 w-8 animate-spin" /></div>
                        )}
                        {messages.map((msg, index) => (
                             <div key={index} className={cn('flex items-end gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                                {msg.role !== 'user' && (
                                    <Avatar className="h-8 w-8">
                                        <Logo/>
                                    </Avatar>
                                )}
                                <div className={cn("max-w-[80%] rounded-lg px-4 py-2", msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                </div>
                                {msg.role === 'user' && (
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user.photoURL || `https://picsum.photos/seed/${user.uid}/100/100`} />
                                        <AvatarFallback>{user.displayName?.charAt(0) || 'A'}</AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))}
                         {isSending && (
                            <div className="flex items-end gap-2 justify-start">
                                <Avatar className="h-8 w-8"><Logo/></Avatar>
                                <div className="max-w-[80%] rounded-lg px-4 py-2 bg-muted flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin"/>
                                    <p className="text-sm">सोच रहा है...</p>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
            <CardFooter className="p-4 border-t">
                 <form onSubmit={handleSubmit} className="w-full flex items-center gap-2">
                    <Input 
                        placeholder="अपनी बात यहाँ लिखें..." 
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        disabled={isSending}
                    />
                    <Button type="submit" size="icon" disabled={isSending || !userInput.trim()}>
                        {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        <span className="sr-only">भेजें</span>
                    </Button>
                </form>
            </CardFooter>
        </Card>
    );
}
