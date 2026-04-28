'use client';
import { useMemo } from 'react';
import Link from 'next/link';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreditCard, Download, Loader2 } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';

// Types based on backend.json
type Subscription = {
    id: string;
    planName: string;
    status: string;
};

type Invoice = {
    id: string;
    date: string; // ISO String
    amount: number;
    currency: string;
    status: string;
    invoiceUrl?: string;
};

// This is still mock data as it's not in the subscription schema
const planFeatures: { [key: string]: string[] } = {
    'परिवार योजना': [
        '5 परिवार के सदस्य',
        'बुनियादी AI मार्गदर्शन',
        'सामुदायिक मंच तक पहुंच',
    ],
    'default': [
        'बुनियादी सुविधाएँ'
    ]
};

// This is mock data, as payment methods are not stored in Firestore in this app
const paymentMethod = {
    cardType: 'Visa',
    last4: '4242',
    expiry: '12/26',
};

export default function BillingPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const subscriptionsQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, `users/${user.uid}/subscriptions`), limit(1));
    }, [firestore, user]);
    const { data: subscriptions, isLoading: subsLoading } = useCollection<Subscription>(subscriptionsQuery);
    const currentSubscription = subscriptions?.[0];

    const invoicesQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, `users/${user.uid}/invoices`), orderBy('date', 'desc'), limit(5));
    }, [firestore, user]);
    const { data: invoices, isLoading: invoicesLoading } = useCollection<Invoice>(invoicesQuery);

    const isLoading = isUserLoading || subsLoading || invoicesLoading;

    const formatInvoiceDate = (isoDate: string) => {
        if (!isoDate) return '';
        try {
            return new Date(isoDate).toLocaleDateString('hi-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            });
        } catch (e) {
            return 'अज्ञात';
        }
    };
    
    const formatCurrency = (amount: number, currency: string) => {
        try {
             return new Intl.NumberFormat('hi-IN', { style: 'currency', currency: currency }).format(amount);
        } catch {
            return `${currency} ${amount}`;
        }
    };

    if (isUserLoading) {
        return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!user) {
        return (
            <div className="text-center">
                <p>बिलिंग जानकारी देखने के लिए कृपया लॉग इन करें।</p>
                <Button asChild className="mt-4"><Link href="/login">लॉग इन</Link></Button>
            </div>
        );
    }
    
    const features = currentSubscription ? (planFeatures[currentSubscription.planName] || planFeatures.default) : [];

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold font-headline">बिलिंग और सदस्यता</h1>

            <Card>
                <CardHeader>
                    <CardTitle>आपकी वर्तमान योजना</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                    {isLoading ? (
                         <div>
                            <Skeleton className="h-7 w-48 mb-4" />
                            <Skeleton className="h-5 w-32 mb-2" />
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-4 w-36 mt-1" />
                            <Skeleton className="h-4 w-44 mt-1" />
                        </div>
                    ) : currentSubscription ? (
                        <div>
                            <h3 className="text-xl font-semibold">{currentSubscription.planName} - <span className="text-primary">{currentSubscription.planName === 'परिवार योजना' ? 'नि:शुल्क' : 'सशुल्क'}</span></h3>
                            <p className="text-muted-foreground mt-2">आपकी योजना में शामिल हैं:</p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                {features.map(feature => <li key={feature}>{feature}</li>)}
                            </ul>
                        </div>
                    ) : (
                        <div>
                             <h3 className="text-xl font-semibold">कोई सक्रिय योजना नहीं</h3>
                             <p className="text-muted-foreground mt-2">आपके पास अभी कोई सक्रिय सदस्यता योजना नहीं है।</p>
                        </div>
                    )}
                    <div className="bg-muted p-6 rounded-lg flex flex-col justify-center items-center text-center">
                        <h4 className="font-semibold">क्या आपको अधिक सुविधाएँ चाहिए?</h4>
                        <p className="text-sm text-muted-foreground mt-2">जल्द ही आ रहा है: गुरुओं के लिए प्रीमियम योजनाएं और परिवारों के लिए अतिरिक्त सुविधाएँ।</p>
                        <Button className="mt-4" disabled>प्रीमियम में अपग्रेड करें (जल्द आ रहा है)</Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-8 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>भुगतान विधि</CardTitle>
                        <CardDescription>आपकी डिफ़ॉल्ट भुगतान विधि। (यह एक उदाहरण है)</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center gap-4 p-6 border rounded-lg bg-muted">
                        <CreditCard className="h-8 w-8 text-muted-foreground" />
                        <div>
                            <p className="font-semibold">{paymentMethod.cardType} **** **** **** {paymentMethod.last4}</p>
                            <p className="text-sm text-muted-foreground">समाप्ति तिथि: {paymentMethod.expiry}</p>
                        </div>
                    </CardContent>
                    <CardFooter>
                         <Button variant="outline" className="mt-4">विधि बदलें</Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>चालान इतिहास (Invoice History)</CardTitle>
                         <CardDescription>आपके पिछले भुगतानों का रिकॉर्ड।</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                             <div className="space-y-2">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>चालान</TableHead>
                                    <TableHead>तिथि</TableHead>
                                    <TableHead>राशि</TableHead>
                                    <TableHead className="text-right">स्थिति</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoices && invoices.length > 0 ? invoices.map((invoice) => (
                                    <TableRow key={invoice.id}>
                                        <TableCell className="font-medium">{invoice.id.substring(0, 12)}...</TableCell>
                                        <TableCell>{formatInvoiceDate(invoice.date)}</TableCell>
                                        <TableCell>{formatCurrency(invoice.amount, invoice.currency || 'INR')}</TableCell>
                                        <TableCell className="text-right">
                                             <Badge variant={invoice.status.toLowerCase() === 'paid' ? 'secondary' : 'default'} className={invoice.status.toLowerCase() === 'paid' ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300" : ""}>{invoice.status}</Badge>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center h-24">कोई चालान नहीं मिला।</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}