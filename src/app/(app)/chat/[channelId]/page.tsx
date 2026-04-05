'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { doc, collection, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Loader2, CornerUpLeft, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { hi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

type ChatMessage = {
  id: string;
  senderId: string;
  content: string;
  timestamp: { seconds: number; nanoseconds: number };
};

type UserProfile = {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string;
};

type ChatChannel = {
  id: string;
  participantIds: string[];
};

export default function ChatPage() {
  const { channelId } = useParams() as { channelId: string };
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [userInput, setUserInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // --- Data Fetching ---

  const channelRef = useMemoFirebase(() => {
    if (!firestore || !channelId) return null;
    return doc(firestore, 'chat_channels', channelId);
  }, [firestore, channelId]);
  const { data: channel, isLoading: isChannelLoading } = useDoc<ChatChannel>(channelRef);

  const messagesQuery = useMemoFirebase(() => {
    if (!firestore || !channelId) return null;
    return query(collection(firestore, `chat_channels/${channelId}/messages`), orderBy('timestamp', 'asc'));
  }, [firestore, channelId]);
  const { data: messages, isLoading: areMessagesLoading } = useCollection<ChatMessage>(messagesQuery);
  
  const otherParticipantId = useMemo(() => {
    if (!channel || !user) return null;
    return channel.participantIds.find(id => id !== user.uid);
  }, [channel, user]);

  const otherParticipantProfileRef = useMemoFirebase(() => {
    if (!firestore || !otherParticipantId) return null;
    return doc(firestore, 'users', otherParticipantId);
  }, [firestore, otherParticipantId]);
  const { data: otherParticipantProfile, isLoading: isParticipantLoading } = useDoc<UserProfile>(otherParticipantProfileRef);
  
  // --- Effects ---

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            setTimeout(() => viewport.scrollTop = viewport.scrollHeight, 100);
        }
    }
  }, [messages]);

  // --- Handlers ---

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || !user || !channelId || isSending) return;

    setIsSending(true);
    const content = userInput;
    setUserInput('');

    const messagesColRef = collection(firestore, `chat_channels/${channelId}/messages`);
    const messageData = {
      channelId: channelId,
      senderId: user.uid,
      content: content,
      timestamp: serverTimestamp(),
    };

    try {
        const messageDocRef = await addDocumentNonBlocking(messagesColRef, messageData);
        if(!messageDocRef) throw new Error("Message could not be sent");

        await updateDocumentNonBlocking(doc(firestore, `chat_channels/${channelId}/messages`, messageDocRef.id), { id: messageDocRef.id });
        
        // Update last message on channel
        if(channelRef) {
            await updateDocumentNonBlocking(channelRef, {
                lastUpdatedAt: serverTimestamp(),
                lastMessage: content,
            });
        }
    } catch (error) {
        console.error("Error sending message:", error);
        toast({ variant: 'destructive', title: 'त्रुटि', description: 'आपका संदेश भेजने में विफल। कृपया पुन: प्रयास करें।' });
        setUserInput(content); // Put text back on error
    } finally {
        setIsSending(false);
    }
  };

  const formatMessageDate = (timestamp: { seconds: number; nanoseconds: number }) => {
    if (!timestamp) return '';
    try {
        return formatDistanceToNow(new Date(timestamp.seconds * 1000), { addSuffix: true, locale: hi });
    } catch {
        return '';
    }
  };

  // --- Render Logic ---

  if (isChannelLoading || isParticipantLoading) {
    return <div className="flex justify-center items-center h-[80vh]"><Loader2 className="h-10 w-10 animate-spin" /></div>;
  }

  if (!channel) {
    return <div className="text-center mt-10">चैट चैनल नहीं मिला।</div>;
  }
  
  const otherParticipantName = otherParticipantProfile ? `${otherParticipantProfile.firstName} ${otherParticipantProfile.lastName}` : 'उपयोगकर्ता';

  return (
    <Card className="flex flex-col h-[calc(100vh-10rem)]">
      <CardHeader className="flex flex-row items-center border-b p-4">
         <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.back()}>
            <CornerUpLeft className="h-5 w-5" />
          </Button>
          <Avatar className="h-10 w-10 mr-4">
            <AvatarImage src={otherParticipantProfile?.profileImageUrl || `https://picsum.photos/seed/${otherParticipantId}/100/100`} />
            <AvatarFallback>{otherParticipantName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-grow">
            <h2 className="text-lg font-bold">{otherParticipantName}</h2>
            <p className="text-sm text-muted-foreground">ऑनलाइन</p>
          </div>
      </CardHeader>
      <CardContent className="flex-grow p-0">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="p-4 space-y-4">
            {areMessagesLoading && <div className="flex justify-center p-10"><Loader2 className="h-8 w-8 animate-spin" /></div>}
            {messages?.map((msg) => (
              <div key={msg.id} className={cn('flex items-end gap-2', msg.senderId === user?.uid ? 'justify-end' : 'justify-start')}>
                {msg.senderId !== user?.uid && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={otherParticipantProfile?.profileImageUrl || `https://picsum.photos/seed/${otherParticipantId}/100/100`} />
                    <AvatarFallback>{otherParticipantName.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
                <div className={cn("max-w-[70%] rounded-lg px-4 py-2", msg.senderId === user?.uid ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <p className={cn("text-xs mt-1", msg.senderId === user?.uid ? 'text-primary-foreground/70' : 'text-muted-foreground/70')}>{formatMessageDate(msg.timestamp)}</p>
                </div>
                 {msg.senderId === user?.uid && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.photoURL || `https://picsum.photos/seed/${user.uid}/100/100`} />
                    <AvatarFallback>{user?.displayName?.charAt(0) || 'A'}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="w-full flex items-center gap-2">
            <Input 
                placeholder="संदेश लिखें..." 
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
