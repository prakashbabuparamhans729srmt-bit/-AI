'use client'

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageCircle, Mic, Send, X, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supportChat } from '@/ai/flows/support-chatbot-flow';

type ChatMessage = {
    sender: 'user' | 'bot';
    text: string;
};

export function SupportChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { sender: 'bot', text: 'नमस्ते! मैं आपका सहायक हूँ। आप मुझसे इस ऐप के बारे में कुछ भी पूछ सकते हैं।' }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        setTimeout(() => {
             if (scrollAreaRef.current) {
                const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
                if (viewport) {
                    viewport.scrollTop = viewport.scrollHeight;
                }
            }
        }, 100);
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim()) return;

        const userMessage: ChatMessage = { sender: 'user', text: userInput };
        setMessages(prev => [...prev, userMessage]);
        setUserInput('');
        setIsLoading(true);
        scrollToBottom();

        try {
            const response = await supportChat({ question: userInput });
            const botMessage: ChatMessage = { sender: 'bot', text: response.answer };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error("Support chat error:", error);
            const errorMessage: ChatMessage = { sender: 'bot', text: 'माफ़ कीजिए, मुझे उत्तर देने में कुछ समस्या आ रही है।' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
            scrollToBottom();
        }
    };

    return (
        <>
            <div className="fixed bottom-6 right-6 z-50">
                <Button size="icon" className="rounded-full w-16 h-16 shadow-lg transition-transform hover:scale-110" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X className="h-8 w-8" /> : <MessageCircle className="h-8 w-8" />}
                    <span className="sr-only">सहायता चैटबॉट</span>
                </Button>
            </div>

            {isOpen && (
                <div className="fixed bottom-24 right-6 z-50">
                    <Card className="w-80 md:w-96 shadow-2xl">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="font-headline text-xl">सहायक चैटबॉट</CardTitle>
                            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                                <X className="h-5 w-5"/>
                            </Button>
                        </CardHeader>
                        <CardContent>
                           <ScrollArea className="h-80 pr-4" ref={scrollAreaRef}>
                                <div className="space-y-4">
                                    {messages.map((message, index) => (
                                        <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <p className={`max-w-[85%] rounded-lg p-3 text-sm ${message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                                {message.text}
                                            </p>
                                        </div>
                                    ))}
                                    {isLoading && (
                                        <div className="flex justify-start">
                                            <p className="max-w-[85%] rounded-lg bg-muted p-3 text-sm flex items-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin"/>
                                                <span>लिख रहा है...</span>
                                            </p>
                                        </div>
                                    )}
                                </div>
                           </ScrollArea>
                        </CardContent>
                        <CardFooter>
                            <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
                                <Input 
                                    type="text" 
                                    placeholder="संदेश लिखें..." 
                                    className="flex-1"
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value)}
                                    disabled={isLoading}
                                />
                                <Button type="button" size="icon" variant="ghost" disabled={isLoading}>
                                    <Mic className="h-5 w-5" />
                                    <span className="sr-only">बोलें</span>
                                </Button>
                                <Button type="submit" size="icon" disabled={isLoading || !userInput.trim()}>
                                    <Send className="h-5 w-5" />
                                    <span className="sr-only">भेजें</span>
                                </Button>
                            </form>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </>
    )
}
