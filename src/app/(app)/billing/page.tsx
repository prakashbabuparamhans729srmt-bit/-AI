'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreditCard, Download } from "lucide-react";

// Mock data, in a real app this would come from a backend/Firestore
const currentPlan = {
    name: 'परिवार योजना',
    price: 'नि:शुल्क',
    features: [
        '5 परिवार के सदस्य',
        'बुनियादी AI मार्गदर्शन',
        'सामुदायिक मंच तक पहुंच',
    ],
};

const invoices = [
    { id: 'INV-2024-001', date: '15 अप्रैल, 2024', amount: '₹0.00', status: 'Paid' },
    { id: 'INV-2024-002', date: '15 मई, 2024', amount: '₹0.00', status: 'Paid' },
    { id: 'INV-2024-003', date: '15 जून, 2024', amount: '₹0.00', status: 'Paid' },
];

const paymentMethod = {
    cardType: 'Visa',
    last4: '4242',
    expiry: '12/26',
};

export default function BillingPage() {
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold font-headline">बिलिंग और सदस्यता</h1>

            <Card>
                <CardHeader>
                    <CardTitle>आपकी वर्तमान योजना</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                    <div>
                        <h3 className="text-xl font-semibold">{currentPlan.name} - <span className="text-primary">{currentPlan.price}</span></h3>
                        <p className="text-muted-foreground mt-2">आपकी योजना में शामिल हैं:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            {currentPlan.features.map(feature => <li key={feature}>{feature}</li>)}
                        </ul>
                    </div>
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
                        <CardDescription>आपकी डिफ़ॉल्ट भुगतान विधि।</CardDescription>
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
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>चालान</TableHead>
                                    <TableHead>तिथि</TableHead>
                                    <TableHead>स्थिति</TableHead>
                                    <TableHead className="text-right">डाउनलोड</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoices.map((invoice) => (
                                    <TableRow key={invoice.id}>
                                        <TableCell className="font-medium">{invoice.id}</TableCell>
                                        <TableCell>{invoice.date}</TableCell>
                                        <TableCell>
                                            <Badge variant={invoice.status === 'Paid' ? 'secondary' : 'default'} className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">भुगतान किया गया</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon">
                                                <Download className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
