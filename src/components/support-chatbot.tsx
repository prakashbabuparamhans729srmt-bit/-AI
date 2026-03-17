'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageCircle, Mic, Send, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export function SupportChatbot() {
    const [isOpen, setIsOpen] = useState(false);

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
                           <ScrollArea className="h-80 pr-4">
                                <div className="space-y-4">
                                    <div className="flex justify-start">
                                        <p className="max-w-[85%] rounded-lg bg-muted p-3 text-sm">नमस्ते! मैं आपका सहायक हूँ। आप मुझसे इस ऐप के बारे में कुछ भी पूछ सकते हैं।</p>
                                    </div>
                                    <div className="flex justify-end">
                                        <p className="max-w-[85%] rounded-lg bg-primary text-primary-foreground p-3 text-sm">संकट परामर्श पेज कहाँ है?</p>
                                    </div>
                                    <div className="flex justify-start">
                                        <p className="max-w-[85%] rounded-lg bg-muted p-3 text-sm">आप बाईं ओर नेविगेशन बार में "संकट परामर्श" पर क्लिक कर सकते हैं।</p>
                                    </div>
                                </div>
                           </ScrollArea>
                        </CardContent>
                        <CardFooter>
                            <div className="flex w-full items-center space-x-2">
                                <Input type="text" placeholder="संदेश लिखें..." className="flex-1" />
                                <Button type="button" size="icon" variant="ghost">
                                    <Mic className="h-5 w-5" />
                                    <span className="sr-only">बोलें</span>
                                </Button>
                                <Button type="submit" size="icon">
                                    <Send className="h-5 w-5" />
                                    <span className="sr-only">भेजें</span>
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </>
    )
}
