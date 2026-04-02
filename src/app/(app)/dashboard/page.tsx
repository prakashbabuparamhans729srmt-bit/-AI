'use client';

import { useState, useMemo, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight, Calendar, MessageSquare, BookOpen, HeartPulse, Sparkles, Hand, Users, Send, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { Label } from '@/components/ui/label';
import { aiGuruGuidance } from '@/ai/flows/ai-guru-guidance';
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase, FirestorePermissionError, errorEmitter } from '@/firebase';
import { collection, query, orderBy, serverTimestamp, addDoc, getDoc, doc } from 'firebase/firestore';
import { personalizedDailyWisdom, type PersonalizedDailyWisdomOutput } from '@/ai/flows/personalized-daily-wisdom';
import { Skeleton } from '@/components/ui/skeleton';


const quickServices = [
  { icon: <MessageSquare className="h-8 w-8" />, label: 'प्रश्न पूछें', href: '/community' },
  { icon: <HeartPulse className="h-8 w-8" />, label: 'संकट परामर्श', href: '/crisis-counseling' },
  { icon: <Sparkles className="h-8 w-8" />, label: 'आज की कथा', href: '/kids-corner' },
  { icon: <BookOpen className="h-8 w-8" />, label: 'धर्म ग्रंथ अध्ययन', href: '/knowledge-hub' },
  { icon: <Hand className="h-8 w-8" />, label: 'संस्कार मार्गदर्शन', href: '/rules' },
  { icon: <Users className="h-8 w-8" />, label: 'बच्चों के लिए विशेष', href: '/kids-corner' },
];

type Message = {
  id?: string;
  senderType: 'User' | 'AI';
  content: string;
  timestamp?: any;
};

type UserProfile = {
  id: string;
  firstName: string;
  profileImageUrl: string;
  roleInFamily?: string;
}

export default function DashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dailyWisdom, setDailyWisdom] = useState<PersonalizedDailyWisdomOutput | null>(null);
  const [isWisdomLoading, setIsWisdomLoading] = useState(true);

  const [familyMembers, setFamilyMembers] = useState<UserProfile[]>([]);
  const [isFamilyLoading, setIsFamilyLoading] = useState(true);

  const messagesQuery = useMemoFirebase(() => {
    if (!user) return null;
    const messagesRef = collection(firestore, `users/${user.uid}/conversations/dashboard-chat/messages`);
    return query(messagesRef, orderBy('timestamp', 'asc'));
  }, [firestore, user]);

  const { data: conversation, isLoading: messagesLoading } = useCollection<Message>(messagesQuery);
  
  // Get user profile to find familyId
  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  const { data: userProfile } = useDoc<any>(userProfileRef);

  // Get family document to find memberUserIds
  const familyRef = useMemoFirebase(() => {
    if (!userProfile?.familyId) return null;
    return doc(firestore, 'families', userProfile.familyId);
  }, [firestore, userProfile]);
  const { data: family } = useDoc<any>(familyRef);


  useEffect(() => {
    const fetchFamilyMembers = async () => {
      if (!family?.memberUserIds || !firestore) {
        setIsFamilyLoading(false);
        return;
      }
      
      setIsFamilyLoading(true);
      try {
        const memberPromises = family.memberUserIds.map((memberId: string) => 
          getDoc(doc(firestore, 'users', memberId))
        );
        const memberSnapshots = await Promise.all(memberPromises);
        const membersData = memberSnapshots
          .map(snap => snap.exists() ? snap.data() as UserProfile : null)
          .filter((member): member is UserProfile => member !== null);
        setFamilyMembers(membersData);
      } catch (error) {
        console.error("Error fetching family members:", error);
      } finally {
        setIsFamilyLoading(false);
      }
    };

    fetchFamilyMembers();
  }, [family, firestore]);

  useEffect(() => {
    const fetchWisdom = async () => {
      if (!familyMembers || familyMembers.length === 0) {
        // Can't personalize if we don't know the family yet
        setIsWisdomLoading(false);
        setDailyWisdom({
            dailyThought: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन',
            familyActivities: [],
            childrenStories: []
        });
        return;
      }
      setIsWisdomLoading(true);
      try {
        const familyMembersForApi = familyMembers.map(m => ({
          name: m.firstName,
          age: 30, // Placeholder age
          spiritualInterests: 'General'
        }));

        const response = await personalizedDailyWisdom({
          familyMembers: familyMembersForApi,
          familySpiritualPreference: 'Hinduism',
          currentDate: new Date().toLocaleDateString('hi-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        });
        setDailyWisdom(response);
      } catch (error) {
        console.error("Error fetching daily wisdom:", error);
        setDailyWisdom({
            dailyThought: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन',
            familyActivities: [],
            childrenStories: []
        });
      } finally {
        setIsWisdomLoading(false);
      }
    };

    fetchWisdom();
  }, [familyMembers]);

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || !user) return;

    const userMessageText = userInput;
    setIsLoading(true);
    setUserInput('');

    const messagesRef = collection(firestore, `users/${user.uid}/conversations/dashboard-chat/messages`);
    
    const userMessageData = {
      senderType: 'User' as const,
      senderId: user.uid,
      content: userMessageText,
      timestamp: serverTimestamp(),
      conversationId: 'dashboard-chat',
    };

    // Non-blocking write for user message
    addDoc(messagesRef, userMessageData).catch(err => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: messagesRef.path,
            operation: 'create',
            requestResourceData: userMessageData
        }));
        console.error("Error saving user message:", err);
    });

    try {
      const response = await aiGuruGuidance({ 
        question: userMessageText,
        religiousBackground: "Hindu" 
      });
      
      const aiMessageData = {
        senderType: 'AI' as const,
        content: response.guidance,
        timestamp: serverTimestamp(),
        conversationId: 'dashboard-chat',
      };

      // Non-blocking write for AI message
      addDoc(messagesRef, aiMessageData).catch(err => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
              path: messagesRef.path,
              operation: 'create',
              requestResourceData: aiMessageData
          }));
          console.error("Error saving AI message:", err);
      });
      
    } catch (error) {
      console.error("Error with AI guidance:", error);
      const errorMessageData = {
        senderType: 'AI' as const,
        content: 'माफ़ कीजिए, मुझे उत्तर देने में कुछ समस्या आ रही है।',
        timestamp: serverTimestamp(),
        conversationId: 'dashboard-chat',
      };
      addDoc(messagesRef, errorMessageData); // Also save error message to chat
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="grid gap-8">
      {/* Date and Welcome */}
      <p className="text-lg text-muted-foreground">आज: मंगलवार, 15 अप्रैल 2025</p>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2 grid gap-8">
          <Card className="bg-gradient-to-br from-primary/20 to-secondary/20">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">🌄 आज का सुविचार</CardTitle>
            </CardHeader>
            <CardContent>
              {isWisdomLoading ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>आपके लिए विचार लोड हो रहा है...</span>
                  </div>
              ) : (
                  <>
                      <blockquote className="text-xl italic">
                          "{dailyWisdom?.dailyThought}"
                      </blockquote>
                      <p className="mt-2 text-right text-muted-foreground">- कुलगुरु AI</p>
                  </>
              )}
            </CardContent>
            <CardFooter className="gap-2">
              <Button asChild><Link href="/wip">इस पर चिंतन करें</Link></Button>
              <Button variant="secondary" asChild><Link href="/wip">साझा करें</Link></Button>
            </CardFooter>
          </Card>

          {/* Quick Services */}
          <div>
            <h2 className="text-2xl font-bold font-headline mb-4">🔍 त्वरित सेवाएं</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {quickServices.map((service, index) => (
                <Link href={service.href} key={index}>
                  <Card className="flex flex-col items-center justify-center p-4 text-center hover:bg-accent/50 hover:shadow-lg transition-all cursor-pointer h-full">
                    <div className="text-primary mb-2">{service.icon}</div>
                    <p className="font-semibold">{service.label}</p>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
          
           {/* Chat with Kulguru */}
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">💬 कुलगुरु से वार्तालाप</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-4 max-h-60 overflow-y-auto p-4 border rounded-md">
                {(messagesLoading && !conversation) && (
                    <div className="flex justify-center items-center h-40">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                )}
                {conversation && conversation.map((message) => (
                   <div key={message.id} className={`flex ${message.senderType === 'User' ? 'justify-end' : 'justify-start'}`}>
                      <p className={`max-w-[80%] rounded-lg p-3 ${message.senderType === 'User' ? 'bg-muted text-right' : 'bg-secondary text-secondary-foreground'}`}>
                        {message.content}
                      </p>
                  </div>
                ))}
                 {isLoading && (
                    <div className="flex justify-start">
                        <p className="max-w-[80%] rounded-lg bg-secondary text-secondary-foreground p-3 flex items-center gap-2">
                           <Loader2 className="h-4 w-4 animate-spin"/>
                           <span>लिख रहा है...</span>
                        </p>
                    </div>
                )}
              </div>
              <Separator />
              <form onSubmit={handleChatSubmit}>
               <div className="flex w-full items-center space-x-2">
                <Input 
                  type="text" 
                  placeholder={user ? "यहाँ लिखें..." : "बातचीत करने के लिए कृपया लॉग इन करें"}
                  className="flex-1"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  disabled={isLoading || !user}
                />
                <Button type="submit" disabled={isLoading || !user}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  <span className="sr-only">भेजें</span>
                </Button>
              </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 grid gap-8">
          {/* Family Members */}
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">👪 परिवार के सदस्य ({familyMembers.length || 0})</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              {isFamilyLoading ? (
                <>
                  <div className="flex flex-col items-center space-y-2"><Skeleton className="h-20 w-20 rounded-full" /><Skeleton className="h-4 w-20" /><Skeleton className="h-3 w-16" /></div>
                  <div className="flex flex-col items-center space-y-2"><Skeleton className="h-20 w-20 rounded-full" /><Skeleton className="h-4 w-20" /><Skeleton className="h-3 w-16" /></div>
                </>
              ) : ( familyMembers.map((member) => (
                  <div key={member.id} className="flex flex-col items-center text-center space-y-2">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={member.profileImageUrl || `https://picsum.photos/seed/${member.id}/200/200`} alt={member.firstName || 'User'} />
                      <AvatarFallback>{member.firstName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                    <p className="font-semibold">{member.firstName}</p>
                    <p className="text-xs text-muted-foreground">{member.roleInFamily || 'सदस्य'}</p>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/profile">देखें</Link>
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Today's Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">📅 आज के कार्यक्रम</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <Calendar className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p>शाम 6:00 बजे - परिवार ध्यान (सभी सदस्य)</p>
                  <p>रात 8:30 बजे - आर्यन के साथ करियर चर्चा</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="ghost" asChild><Link href="/wip">याद दिलाएं</Link></Button>
              <Button variant="link" asChild>
                <Link href="/wip">
                  सभी देखें <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

           {/* Family Progress Tracker */}
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">📊 परिवार प्रगति ट्रैकर</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>साप्ताहिक ध्यान: 70%</Label>
                <Progress value={70} className="h-2" />
              </div>
              <div>
                <Label>संस्कार पालन: 60%</Label>
                <Progress value={60} className="h-2" />
              </div>
              <div>
                <Label>परिवार संवाद: 80%</Label>
                <Progress value={80} className="h-2" />
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="secondary" className="w-full" asChild><Link href="/wip">सुधार के सुझाव</Link></Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
