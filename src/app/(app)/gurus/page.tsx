'use client';

import { useState, useMemo } from 'react';
import { useFirestore, useCollection, useMemoFirebase, useUser, setDocumentNonBlocking } from '@/firebase';
import { collection, query, where, orderBy, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

type Guru = {
    id: string;
    userId: string;
    city: string;
    familiesManagedCount: number;
    overallRating: number;
    profileImageUrl?: string;
    firstName: string;
    lastName: string;
    specializations: string[];
};

export default function GurusListPage() {
    const firestore = useFirestore();
    const [searchTerm, setSearchTerm] = useState('');
    const { user } = useUser();
    const router = useRouter();
    const { toast } = useToast();

    const gurusQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'gurus'), where('isApproved', '==', true), orderBy('overallRating', 'desc'));
    }, [firestore]);

    const { data: gurus, isLoading: gurusLoading } = useCollection<Guru>(gurusQuery);

    const filteredGurus = useMemo(() => {
        if (!gurus) return [];
        if (!searchTerm.trim()) return gurus;
        const lowercasedTerm = searchTerm.toLowerCase();
        return gurus.filter(guru =>
            guru.firstName.toLowerCase().includes(lowercasedTerm) ||
            guru.lastName.toLowerCase().includes(lowercasedTerm) ||
            guru.city.toLowerCase().includes(lowercasedTerm) ||
            guru.specializations.some(spec => spec.toLowerCase().includes(lowercasedTerm))
        );
    }, [gurus, searchTerm]);

    const handleTalkToGuru = async (guru: Guru) => {
        if (!user) {
            toast({ title: 'बातचीत शुरू करने के लिए कृपया लॉग इन करें।', variant: 'destructive' });
            router.push('/login');
            return;
        }
        if (user.uid === guru.userId) {
            toast({ title: 'आप खुद से बात नहीं कर सकते।', variant: 'destructive' });
            return;
        }

        const channelId = [user.uid, guru.userId].sort().join('_');
        const channelRef = doc(firestore, 'chat_channels', channelId);
        
        try {
            const channelSnap = await getDoc(channelRef);
            if (!channelSnap.exists()) {
                await setDocumentNonBlocking(channelRef, {
                    id: channelId,
                    participantIds: [user.uid, guru.userId],
                    createdAt: serverTimestamp(),
                    lastUpdatedAt: serverTimestamp(),
                    lastMessage: 'चैट शुरू हो गया है।',
                }, { merge: true });
            }
            router.push(`/chat/${channelId}`);
        } catch (error) {
            console.error("Error creating/getting chat channel:", error);
            toast({ title: 'चैट शुरू करने में विफल।', variant: 'destructive' });
        }
    };


    return (
        <div className="space-y-8">
            <Card className="text-center">
                <CardHeader>
                    <CardTitle className="font-headline text-4xl">🧘 प्रमाणित कुलगुरु</CardTitle>
                    <CardDescription className="text-lg text-muted-foreground">
                        हमारे विशेषज्ञ गुरुओं से मिलें जो आपका मार्गदर्शन करने के लिए यहाँ हैं।
                    </CardDescription>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader>
                     <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="खोजें: नाम, शहर, या विशेषज्ञता..."
                            className="pl-10 h-11"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {gurusLoading && <div className="p-10 text-center flex justify-center items-center gap-2"><Loader2 className="h-6 w-6 animate-spin" /><span>गुरु सूची लोड हो रही है...</span></div>}
                    {!gurusLoading && filteredGurus.length === 0 && (
                        <p className="p-10 text-center text-muted-foreground">
                            {searchTerm ? `"${searchTerm}" के लिए कोई गुरु नहीं मिला।` : 'अभी कोई प्रमाणित गुरु उपलब्ध नहीं है।'}
                        </p>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredGurus.map(guru => (
                            <Card key={guru.id} className="flex flex-col transition-shadow hover:shadow-lg">
                                <CardHeader className="items-center text-center">
                                    <Avatar className="h-24 w-24 mb-4">
                                        <AvatarImage src={guru.profileImageUrl || `https://picsum.photos/seed/${guru.userId}/200/200`} />
                                        <AvatarFallback>{(guru.firstName || 'G').charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <CardTitle>{guru.firstName} {guru.lastName}</CardTitle>
                                    <CardDescription>{guru.city}</CardDescription>
                                     <div className="flex items-center gap-1 text-yellow-500 pt-2">
                                        <Star className="h-5 w-5 fill-current" />
                                        <span className="font-bold text-lg">{guru.overallRating || 'N/A'}</span>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-grow space-y-3">
                                     <div>
                                        <h4 className="font-semibold text-sm mb-1">विशेषज्ञता</h4>
                                        <div className="flex flex-wrap gap-1">
                                            {guru.specializations.map(spec => (
                                                <span key={spec} className="bg-secondary text-secondary-foreground text-xs font-medium px-2 py-0.5 rounded-full">{spec}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm mb-1">अनुभव</h4>
                                        <p className="text-sm text-muted-foreground">{guru.familiesManagedCount || 0} परिवारों का मार्गदर्शन किया</p>
                                    </div>
                                </CardContent>
                                <div className="p-6 pt-0">
                                    <Button className="w-full" onClick={() => handleTalkToGuru(guru)}>बात करें</Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
