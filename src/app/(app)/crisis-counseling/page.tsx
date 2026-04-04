'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Headset, MessageCircle, Music, BookOpen, Wind, Loader2, Star } from 'lucide-react';
import Link from 'next/link';
import { crisisCounseling, CrisisCounselingInput, CrisisCounselingOutput } from '@/ai/flows/ai-guru-crisis-counseling';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


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


const immediateHelp = [
    { icon: <Music />, text: '5 मिनट का ध्यान संगीत', action: 'सुनें', href: '/wip' },
    { icon: <MessageCircle />, text: '"ॐ" का जाप', action: 'करें', href: '/wip' },
    { icon: <Wind />, text: '2 मिनट की गहरी सांसें', action: 'शुरू करें', href: '/wip' },
    { icon: <BookOpen />, text: 'प्रेरणादायक कहानी', action: 'पढ़ें', href: '/wip' },
];

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
            <Link href="/community">
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
                {immediateHelp.map(item => (
                    <div key={item.text} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="text-primary">{item.icon}</div>
                            <p>{item.text}</p>
                        </div>
                        <Button variant="default" asChild><Link href={item.href}>{item.action}</Link></Button>
                    </div>
                ))}
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
                                        <Button variant="secondary" size="sm" asChild><Link href="/wip">बात करें</Link></Button>
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
