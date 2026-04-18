'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Headset, MessageCircle, Music, Wind, Loader2, Star, Activity as ActivityIcon, Heart, Brain } from 'lucide-react';
import Link from 'next/link';
import { crisisCounseling, CrisisCounselingInput, CrisisCounselingOutput } from '@/ai/flows/ai-guru-crisis-counseling';
import { useFirestore, useCollection, useMemoFirebase, useUser, setDocumentNonBlocking } from '@/firebase';
import { collection, query, where, limit, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';


// Mapping from Hindi UI text to English schema values
const crisisTypeMap: { [key: string]: CrisisCounselingInput['crisisType'] } = {
  '😢 पारिवारिक कलह': 'Family discord',
  '😟 आर्थिक तनाव': 'Financial stress',
  '😔 मृत्यु शोक': 'Grief of death',
  '😤 क्रोध समस्या': 'Anger issues',
  '😨 भय/चिंता': 'Fear/Anxiety',
  '😞 अकेलापन': 'Loneliness',
  '🍷 नशे की लत': 'Addiction',
  '💔 वैवाहिक समस्या': 'Marital problems',
  '👴 बुजुर्ग देखभाल': 'Elderly care',
};

const crisisTypes = Object.keys(crisisTypeMap);

const religionMap: { [key: string]: string } = {
    'हिंदू': 'Hindu',
    'इस्लाम': 'Islam',
    'ईसाई': 'Christian',
    'बौद्ध': 'Buddhist',
    'सिख': 'Sikh',
    'यहूदी': 'Jewish',
    'आस्तिक': 'Interfaith/Universal Spiritual Principles'
};
const religions = ['हिंदू', 'इस्लाम', 'ईसाई', 'बौद्ध', 'सिख', 'यहूदी'];

type Guru = {
    id: string;
    userId: string;
    city: string;
    overallRating: number;
    profileImageUrl?: string;
    firstName: string;
    lastName: string;
    specializations: string[];
};

type QuickActivity = {
  id: string;
  name: string;
  type: string;
};

const activityIcons: { [key: string]: React.ReactNode } = {
  'Meditation': <Heart className="text-pink-500" />,
  'Chanting': <Music className="text-blue-500" />,
  'Yoga': <Wind className="text-green-500" />,
  'Breathing': <Wind className="text-cyan-500" />,
  'Learning': <Brain className="text-purple-500" />,
  'default': <ActivityIcon className="text-gray-500" />,
};

const crisisToSpecializationMap: { [key: string]: string } = {
  'Family discord': 'Family Counseling',
  'Financial stress': 'Crisis Management',
  'Grief of death': 'Crisis Management',
  'Anger issues': 'Crisis Management',
  'Fear/Anxiety': 'Crisis Management',
  'Loneliness': 'Family Counseling',
  'Addiction': 'Crisis Management',
  'Marital problems': 'Family Counseling',
  'Elderly care': 'Family Counseling',
};


export default function CrisisCounselingPage() {
  const [selectedCrisis, setSelectedCrisis] = useState<string | null>(null);
  const [selectedReligion, setSelectedReligion] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<CrisisCounselingOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const firestore = useFirestore();
  const [relevantGurus, setRelevantGurus] = useState<Guru[] | null>(null);
  const [isGurusLoading, setIsGurusLoading] = useState(false);
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const quickActivitiesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'activities'),
      where('type', 'in', ['Meditation', 'Chanting', 'Yoga', 'Breathing']),
      limit(4)
    );
  }, [firestore]);

  const { data: quickActivities, isLoading: areActivitiesLoading } = useCollection<QuickActivity>(quickActivitiesQuery);


  useEffect(() => {
    if (selectedCrisis && selectedReligion) {
      const getGuidance = async () => {
        setIsLoading(true);
        setAiResponse(null);
        try {
          const crisis = crisisTypeMap[selectedCrisis];
          const religion = religionMap[selectedReligion];
          const response = await crisisCounseling({
            crisisType: crisis,
            religiousPreference: religion as any,
          });
          setAiResponse(response);
        } catch (error) {
          console.error("Error fetching AI guidance:", error);
          // Optionally, set an error state to show in the UI
        } finally {
          setIsLoading(false);
        }
      };
      getGuidance();
    }
  }, [selectedCrisis, selectedReligion]);

  const crisisKey = selectedCrisis ? crisisTypeMap[selectedCrisis] : null;
  const specialization = crisisKey ? crisisToSpecializationMap[crisisKey] : null;

  const gurusQuery = useMemoFirebase(() => {
    if (!firestore || !specialization) return null;
    return query(collection(firestore, 'gurus'), where('specializations', 'array-contains', specialization), where('isApproved', '==', true), limit(3));
  }, [firestore, specialization]);

  const { data: foundGurus, isLoading: queryLoading } = useCollection<Guru>(gurusQuery);
  
  useEffect(() => {
      setIsGurusLoading(queryLoading);
      if(foundGurus) {
          setRelevantGurus(foundGurus);
      }
  }, [foundGurus, queryLoading]);

  const handleCrisisSelection = (crisis: string) => {
    setSelectedCrisis(crisis);
    setSelectedReligion(null); // Reset religion
    setAiResponse(null); // Reset AI response
    setRelevantGurus(null); // Reset gurus
    setIsGurusLoading(true); // Start loading gurus
  };

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
      <Card className="text-center bg-gradient-to-br from-destructive/80 to-destructive/60 text-destructive-foreground">
        <CardHeader>
          <CardTitle className="font-headline text-4xl">🆘 क्या आपको सहायता चाहिए?</CardTitle>
          <CardDescription className="text-destructive-foreground/80 text-lg">
            🌟 आप अकेले नहीं हैं। हम आपके साथ हैं।
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center gap-4">
          <Button variant="secondary" size="lg" className="bg-white text-destructive hover:bg-gray-100" asChild>
            <Link href="/crisis-counseling/chat">
              <MessageCircle className="mr-2 h-5 w-5" />
              तुरंत बात करें
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10" asChild>
            <Link href="#immediate-help">शांत रहने के उपाय</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">1. समस्या चुनें:</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {crisisTypes.map((crisis) => (
            <Button
              key={crisis}
              variant={selectedCrisis === crisis ? 'default' : 'outline'}
              className="h-auto py-3 text-base"
              onClick={() => handleCrisisSelection(crisis)}
            >
              {crisis}
            </Button>
          ))}
        </CardContent>
      </Card>

      {selectedCrisis && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="font-headline text-primary">2. मार्गदर्शन के लिए अपनी आस्था चुनें:</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
                {religions.map(religion => (
                   <Button key={religion} variant={selectedReligion === religion ? 'secondary' : 'outline'} onClick={() => setSelectedReligion(religion)}>
                       {religion}
                   </Button>
                ))}
                <Button variant={selectedReligion === 'आस्तिक' ? 'secondary' : 'outline'} onClick={() => setSelectedReligion('आस्तिक')}>
                    आस्तिक (कोई विशेष धर्म नहीं)
                </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading && (
         <Card>
            <CardContent className="p-6 flex justify-center items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-lg">आपके लिए मार्गदर्शन तैयार किया जा रहा है...</p>
            </CardContent>
        </Card>
      )}

      {aiResponse && !isLoading && (
        <Card className="bg-accent/10">
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-accent-foreground">🧘 कुलगुरु का मार्गदर्शन</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-lg">
            <div>
              <h3 className="font-bold text-xl mb-2">संदेश:</h3>
              <p>{aiResponse.message}</p>
            </div>
            <div>
              <h3 className="font-bold text-xl mb-2">संबंधित शिक्षाएँ:</h3>
              <p className="whitespace-pre-wrap">{aiResponse.relevantTeachings}</p>
            </div>
            <div>
              <h3 className="font-bold text-xl mb-2">व्यावहारिक कदम:</h3>
              <ul className="list-disc pl-5 space-y-2">
                {aiResponse.practicalSteps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
        

        <Card id="immediate-help">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">🧘 शांति के लिए तुरंत उपाय</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {areActivitiesLoading && (
                  <>
                    <Skeleton className="h-20 rounded-lg" />
                    <Skeleton className="h-20 rounded-lg" />
                    <Skeleton className="h-20 rounded-lg" />
                    <Skeleton className="h-20 rounded-lg" />
                  </>
                )}
                {!areActivitiesLoading && quickActivities && quickActivities.length > 0 && quickActivities.map(item => (
                    <Link href={`/activity/${item.id}`} key={item.id} className="block">
                      <div className="flex items-center justify-between p-4 bg-muted rounded-lg h-full transition-all hover:bg-accent/50 hover:shadow-md">
                          <div className="flex items-center gap-3">
                              <div className="text-3xl">{activityIcons[item.type] || activityIcons.default}</div>
                              <p className="font-semibold">{item.name}</p>
                          </div>
                          <Button variant="default">शुरू करें</Button>
                      </div>
                    </Link>
                ))}
                {!areActivitiesLoading && (!quickActivities || quickActivities.length === 0) && (
                  <p className="col-span-full text-center text-muted-foreground p-4">अभी कोई त्वरित उपाय उपलब्ध नहीं हैं।</p>
                )}
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">📞 विशेषज्ञ गुरुओं से जुड़ें</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {selectedCrisis && isGurusLoading && (
                    <div className="flex justify-center items-center p-6">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <p className="ml-2">आपके लिए विशेषज्ञ गुरु खोजे जा रहे हैं...</p>
                    </div>
                )}
                {selectedCrisis && !isGurusLoading && relevantGurus && relevantGurus.length > 0 && (
                    <>
                        <p className="text-muted-foreground">आपकी चुनी हुई समस्या के लिए, ये गुरु आपकी सहायता कर सकते हैं:</p>
                        <div className="space-y-4">
                            {relevantGurus.map(guru => (
                                <div key={guru.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <Avatar>
                                            <AvatarImage src={guru.profileImageUrl || `https://picsum.photos/seed/${guru.userId}/100/100`} />
                                            <AvatarFallback>{(guru.firstName || 'G').charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold">{guru.firstName} {guru.lastName} - {guru.city}</p>
                                            <p className="text-sm text-muted-foreground">{guru.specializations.join(', ')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1 text-yellow-500">
                                            <Star className="h-5 w-5 fill-current" />
                                            <span className="font-bold">{guru.overallRating || 0}</span>
                                        </div>
                                        <Button variant="secondary" size="sm" onClick={() => handleTalkToGuru(guru)}>बात करें</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
                {selectedCrisis && !isGurusLoading && (!relevantGurus || relevantGurus.length === 0) && (
                    <p className="text-center text-muted-foreground p-4">
                        इस विषय के लिए अभी कोई विशेषज्ञ गुरु उपलब्ध नहीं है। आप हमारे <Link href="/community" className="text-primary underline">सामुदायिक मंच</Link> पर प्रश्न पूछ सकते हैं।
                    </p>
                )}
                {!selectedCrisis && (
                     <p className="text-center text-muted-foreground p-4">
                        मानव सहायता प्राप्त करने के लिए कृपया पहले ऊपर से कोई समस्या चुनें।
                    </p>
                )}
            </CardContent>
        </Card>

    </div>
  );
}
