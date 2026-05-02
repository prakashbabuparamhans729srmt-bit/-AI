'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  HeartHandshake,
  BookOpen,
  Users,
  MessageSquare,
  Sparkles,
  LifeBuoy,
  Bot,
  Search,
  Mic,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Logo } from '@/components/logo';
import { Input } from '@/components/ui/input';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const featureList = [
  {
    icon: <BookOpen className="h-8 w-8" />,
    title: 'सभी धर्म एक मंच पर',
    description: 'विभिन्न धर्मों के ज्ञान और शिक्षाओं को एक ही स्थान पर खोजें।',
    href: '/knowledge-hub'
  },
  {
    icon: <Sparkles className="h-8 w-8" />,
    title: 'दैनिक मार्गदर्शन',
    description: 'अपने और अपने परिवार के लिए व्यक्तिगत दैनिक विचार और प्रेरणा प्राप्त करें।',
    href: '/dashboard'
  },
  {
    icon: <LifeBuoy className="h-8 w-8" />,
    title: 'संकट परामर्श',
    description: 'कठिन समय में एआई गुरु से सहानुभूतिपूर्ण और तत्काल सहायता प्राप्त करें।',
    href: '/crisis-counseling'
  },
  {
    icon: <HeartHandshake className="h-8 w-8" />,
    title: 'ध्यान और योग',
    description: 'शांति और मानसिक स्पष्टता के लिए निर्देशित ध्यान और योग सत्र।',
    href: '/meditation-yoga'
  },
  {
    icon: <Users className="h-8 w-8" />,
    title: 'परिवार प्रोफाइल',
    description: 'प्रत्येक सदस्य की आध्यात्मिक यात्रा को समझने के लिए परिवार प्रोफाइल बनाएं।',
    href: '/profile'
  },
  {
    icon: <Bot className="h-8 w-8" />,
    title: '24x7 AI सहायक',
    description: 'आपके आध्यात्मिक प्रश्नों का उत्तर देने के लिए हमारा एआई गुरु हमेशा उपलब्ध है।',
    href: '/community'
  },
];

const staticTestimonials = [
  {
    name: 'प्रिया, दिल्ली',
    avatar: PlaceHolderImages.find((img) => img.id === 'testimonial1'),
    text: 'कुलगुरु AI ने हमारे परिवार को एक नई दिशा दी है। अब हम सब साथ मिलकर आध्यात्मिक मार्ग पर चल रहे हैं।',
  },
  {
    name: 'रमेश, चेन्नई',
    avatar: PlaceHolderImages.find((img) => img.id === 'testimonial2'),
    text: 'बच्चों को संस्कार मिल रहे हैं और धर्म का सही ज्ञान भी। यह ऐप हर भारतीय परिवार के लिए एक वरदान है।',
  },
];


type Testimonial = {
    id: string;
    quote: string;
    authorName: string;
    authorUserId?: string;
}

const heroImage = PlaceHolderImages.find((img) => img.id === 'hero');

export default function Home() {
    const firestore = useFirestore();
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const testimonialsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(
        collection(firestore, 'public_testimonials'),
        where('status', '==', 'Approved'),
        limit(2)
        );
    }, [firestore]);

    const { data: testimonials, isLoading: testimonialsLoading } = useCollection<Testimonial>(testimonialsQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    const term = searchTerm.toLowerCase();

    // Keyword-based redirection
    if (term.includes('संकट') || term.includes('crisis') || term.includes('help')) {
        router.push('/crisis-counseling');
    } else if (term.includes('बच्चे') || term.includes('kids') || term.includes('कहानी') || term.includes('story')) {
        router.push('/kids-corner');
    } else if (term.includes('ज्ञान') || term.includes('knowledge') || term.includes('धर्म') || term.includes('religion')) {
        router.push('/knowledge-hub');
    } else if (term.includes('गुरु') || term.includes('guru')) {
        router.push('/gurus');
    } else {
        // Default to community search
        router.push(`/community?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo />
            <span className="hidden font-bold sm:inline-block font-headline text-lg">
              कुलगुरु AI
            </span>
          </Link>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <Button variant="ghost" asChild>
              <Link href="/login">लॉग इन</Link>
            </Button>
            <Button asChild>
              <Link href="/register">निःशुल्क पंजीकरण करें</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-12 md:py-24 lg:py-32">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover object-center opacity-20"
              data-ai-hint={heroImage.imageHint}
              priority
            />
          )}
          <div className="container relative px-4 md:px-6 text-center">
            <div className="flex flex-col items-center space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl font-headline text-primary">
                🌟 हर परिवार का अपना कुलगुरु 🌟
              </h1>
              <p className="mx-auto max-w-[700px] text-lg text-foreground/80 md:text-xl">
                धर्म, तर्क और विज्ञान का संगम - अब आपके घर पर।
              </p>
              <div className="space-x-4">
                <Button size="lg" asChild>
                  <Link href="/register">निःशुल्क पंजीकरण करें</Link>
                </Button>
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/knowledge-hub/videos">वीडियो देखें</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full bg-background py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline text-secondary">
                  विशेषताएं
                </h2>
                <p className="max-w-[900px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  आपकी आध्यात्मिक यात्रा के हर कदम पर आपका मार्गदर्शन करने के लिए डिज़ाइन की गई सुविधाएँ।
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-2 items-start gap-8 py-12 sm:grid-cols-3 md:gap-12 lg:max-w-none lg:grid-cols-3">
              {featureList.map((feature) => (
                <Link href={feature.href} key={feature.title}>
                  <Card className="text-center transition-transform transform hover:scale-105 hover:shadow-xl h-full">
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="rounded-full bg-primary/10 p-4 text-primary">
                          {feature.icon}
                        </div>
                        <h3 className="text-xl font-bold font-headline">{feature.title}</h3>
                        <p className="text-foreground/80">{feature.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Search Section */}
        <section id="search" className="w-full py-12 md:py-24 lg:py-32 bg-secondary/10">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline text-secondary">
                  कुछ भी खोजें
                </h2>
                <p className="max-w-[900px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  हमारे ज्ञान-कोष, सामुदायिक चर्चाओं और नियमों में से कुछ भी खोजें।
                </p>
              </div>
              <div className="w-full max-w-2xl pt-8">
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
                    <Input 
                        placeholder="धर्म, संकट, या कोई प्रश्न खोजें..." 
                        className="pl-14 pr-16 text-lg h-16 rounded-full shadow-lg" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button variant="ghost" size="icon" type="button" className="absolute right-2 top-1/2 -translate-y-1/2 h-14 w-14 rounded-full hover:bg-accent/50">
                      <Mic className="h-7 w-7" />
                      <span className="sr-only">बोलकर खोजें</span>
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline text-secondary">
                परिवारों की बातें
              </h2>
              <p className="mx-auto max-w-[600px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                देखें कि कुलगुरु AI ने पूरे भारत में परिवारों को कैसे सशक्त बनाया है।
              </p>
            </div>
            <div className="grid w-full grid-cols-1 gap-6 pt-8 md:grid-cols-2 lg:gap-12">
              {testimonialsLoading && (
                <>
                  <Card className="bg-background">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-3/4" />
                        <div className="flex items-center justify-center space-x-3 pt-2">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <Skeleton className="h-5 w-24" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-background">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-3/4" />
                        <div className="flex items-center justify-center space-x-3 pt-2">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <Skeleton className="h-5 w-24" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
              {testimonials && testimonials.map((testimonial) => (
                <Card key={testimonial.id} className="bg-background">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <p className="text-lg italic">"{testimonial.quote}"</p>
                      <div className="flex items-center justify-center space-x-3">
                        <Avatar>
                          <AvatarImage
                            src={`https://picsum.photos/seed/${testimonial.authorUserId || testimonial.id}/100/100`}
                            alt={testimonial.authorName}
                          />
                          <AvatarFallback>
                            {testimonial.authorName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <cite className="font-semibold not-italic">
                          - {testimonial.authorName}
                        </cite>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
               {!testimonialsLoading && (!testimonials || testimonials.length === 0) && (
                 staticTestimonials.map((testimonial) => (
                    <Card key={testimonial.name} className="bg-background">
                    <CardContent className="p-6">
                        <div className="space-y-4">
                        <p className="text-lg italic">"{testimonial.text}"</p>
                        <div className="flex items-center justify-center space-x-3">
                            <Avatar>
                            {testimonial.avatar && (
                                <AvatarImage
                                src={testimonial.avatar.imageUrl}
                                alt={testimonial.avatar.description}
                                data-ai-hint={testimonial.avatar.imageHint}
                                />
                            )}
                            <AvatarFallback>
                                {testimonial.name.charAt(0)}
                            </AvatarFallback>
                            </Avatar>
                            <cite className="font-semibold not-italic">
                            - {testimonial.name}
                            </cite>
                        </div>
                        </div>
                    </CardContent>
                    </Card>
                ))
               )}
            </div>
          </div>
        </section>

        {/* App Download Section */}
        <section id="download" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">
              ऐप डाउनलोड करें
            </h2>
            <p className="mx-auto max-w-[600px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mt-4">
              आज ही अपनी आध्यात्मिक यात्रा शुरू करें।
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button size="lg" variant="outline" asChild>
                <Link href="https://play.google.com/store" target="_blank">
                <svg
                  className="mr-2 h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M16.19 2.81a3.53 3.53 0 00-3.53 3.53v11.32a3.53 3.53 0 003.53 3.53 3.5 3.5 0 002.6-1.04l-3.3-3.3a.7.7 0 010-1l3.3-3.29a3.5 3.5 0 00-2.6-1.02zM12.66 6.34a3.52 3.52 0 01-2.6 1L3.3 14.1a.7.7 0 000 1l6.76 6.76a3.52 3.52 0 012.6 1 3.53 3.53 0 003.53-3.53V9.87a3.53 3.53 0 00-3.53-3.53z" />
                </svg>
                गूगल प्ले
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="https://www.apple.com/app-store/" target="_blank">
                <svg
                  className="mr-2 h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.63 20.31a9.5 9.5 0 01-5.69 2.19c-1.85 0-3.29-.63-4.42-1.89-1.13-1.26-1.9-3.03-1.9-5.32 0-2.43.8-4.24 2-5.41 1.2-1.17 2.7-1.76 4.5-1.76 1.73 0 3.12.55 4.18 1.65l-2.3 2.2a2.8 2.8 0 00-1.98-.82c-1.13 0-2.01.4-2.65 1.18-.64.78-.96 1.83-.96 3.14s.32 2.36.96 3.14c.64.78 1.52 1.17 2.65 1.17a2.9 2.9 0 002.1-.85l2.42 2.3zM18.8 3a2 2 0 012 2v.67a2 2 0 00-1.4 1.83 2 2 0 001.4 1.83V10a2 2 0 01-2 2h-.2a6.9 6.9 0 01-3.6-1.1C13.8 10 13 8.7 13 7.3c0-1.9 1.2-3.4 3-3.8V3h2.8z" />
                </svg>
                ऐप स्टोर
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-secondary/20 py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-foreground/60">
            © 2025 कुलगुरु AI - सर्वाधिकार सुरक्षित
          </p>
          <nav className="flex gap-4 sm:gap-6">
            <Link
              href="/wip"
              className="text-sm hover:underline underline-offset-4"
            >
              हमारे बारे में
            </Link>
            <Link
              href="/wip"
              className="text-sm hover:underline underline-offset-4"
            >
              सहायता
            </Link>
            <Link
              href="/wip"
              className="text-sm hover:underline underline-offset-4"
            >
              गोपनीयता
            </Link>
            <Link
              href="/wip"
              className="text-sm hover:underline underline-offset-4"
            >
              संपर्क
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
