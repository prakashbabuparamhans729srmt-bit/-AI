'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUser, useFirestore, useDoc, updateDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CornerUpLeft } from 'lucide-react';
import Link from 'next/link';

// Schema for the form validation
const profileFormSchema = z.object({
  firstName: z.string().min(2, { message: "पहला नाम कम से कम 2 अक्षर का होना चाहिए।" }),
  lastName: z.string().min(2, { message: "अंतिम नाम कम से कम 2 अक्षर का होना चाहिए।" }),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  educationLevel: z.string().optional(),
  religiousAffiliationId: z.string().optional(),
  generalInterests: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

type UserProfile = {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    generalInterests?: string[];
    religiousAffiliationId?: string;
    educationLevel?: string;
}

const religions = [
    { id: 'Hinduism', name: 'हिन्दू धर्म' },
    { id: 'Islam', name: 'इस्लाम' },
    { id: 'Christianity', name: 'ईसाई धर्म' },
    { id: 'Sikhism', name: 'सिख धर्म' },
    { id: 'Buddhism', name: 'बौद्ध धर्म' },
    { id: 'Jainism', name: 'जैन धर्म' },
    { id: 'Judaism', name: 'यहूदी धर्म' },
    { id: 'Atheist', name: 'नास्तिक' },
    { id: 'Other', name: 'अन्य' },
];

export default function EditProfilePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: '',
      educationLevel: '',
      religiousAffiliationId: '',
      generalInterests: '',
    },
  });

  useEffect(() => {
    if (userProfile) {
      form.reset({
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        dateOfBirth: userProfile.dateOfBirth || '',
        gender: userProfile.gender || '',
        educationLevel: userProfile.educationLevel || '',
        religiousAffiliationId: userProfile.religiousAffiliationId || '',
        generalInterests: userProfile.generalInterests?.join(', ') || '',
      });
    }
  }, [userProfile, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user || !userProfileRef) return;

    setIsSaving(true);
    try {
        const interestsArray = data.generalInterests ? data.generalInterests.split(',').map(s => s.trim()).filter(Boolean) : [];
        const updateData = {
            ...data,
            generalInterests: interestsArray,
        };

        await updateDocumentNonBlocking(userProfileRef, updateData);

        toast({
            title: "प्रोफ़ाइल अपडेट किया गया",
            description: "आपकी जानकारी सफलतापूर्वक सहेज ली गई है।",
        });
        router.push('/profile');
    } catch (error) {
        console.error("Error updating profile:", error);
        toast({
            variant: "destructive",
            title: "एक त्रुटि हुई",
            description: "प्रोफ़ाइल अपडेट करने में विफल। कृपया पुन: प्रयास करें।",
        });
    } finally {
        setIsSaving(false);
    }
  };

  if (isUserLoading || isProfileLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!user) {
    return (
      <div className="text-center">
        <p>प्रोफ़ाइल संपादित करने के लिए कृपया लॉग इन करें।</p>
        <Button asChild className="mt-4"><Link href="/login">लॉग इन</Link></Button>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <Button variant="ghost" onClick={() => router.back()} className="mb-4 w-fit pl-1">
            <CornerUpLeft className="mr-2 h-4 w-4" />
            प्रोफ़ाइल पर वापस जाएं
        </Button>
        <CardTitle className="font-headline text-3xl">📝 प्रोफ़ाइल संपादित करें</CardTitle>
        <CardDescription>अपनी व्यक्तिगत जानकारी यहाँ अपडेट करें।</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>पहला नाम</FormLabel>
                        <FormControl>
                            <Input placeholder="आपका पहला नाम" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>अंतिम नाम</FormLabel>
                        <FormControl>
                            <Input placeholder="आपका अंतिम नाम" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>जन्म तिथि</FormLabel>
                        <FormControl>
                            <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>लिंग</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="अपना लिंग चुनें..." />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="पुरुष">पुरुष</SelectItem>
                                <SelectItem value="महिला">महिला</SelectItem>
                                <SelectItem value="अन्य">अन्य</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
             <FormField
                control={form.control}
                name="educationLevel"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>शिक्षा स्तर</FormLabel>
                    <FormControl>
                        <Input placeholder="जैसे: 12वीं पास, स्नातक..." {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            <FormField
                control={form.control}
                name="religiousAffiliationId"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>प्राथमिक धार्मिक संबद्धता</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="अपना धर्म चुनें..." />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {religions.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="generalInterests"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>सामान्य रुचियां</FormLabel>
                    <FormControl>
                        <Input placeholder="जैसे: भौतिकी, खगोल विज्ञान, क्रिकेट..." {...field} />
                    </FormControl>
                    <FormDescription>
                        अपनी रुचियों को अल्पविराम (comma) से अलग करें।
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />

            <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>रद्द करें</Button>
                <Button type="submit" disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    सहेजें
                </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
