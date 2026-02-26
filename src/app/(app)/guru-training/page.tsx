import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Search, Star, Calendar, FileText } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';


const curriculum = [
    { year: 1, title: 'धर्म दर्शन', progress: 100, status: 'प्रमाणपत्र', details: ['सभी धर्मों का तुलनात्मक अध्ययन', 'प्रमुख ग्रंथों का सार'] },
    { year: 2, title: 'मनोविज्ञान और परामर्श', progress: 70, status: 'जारी रखें', details: ['पारिवारिक परामर्श तकनीक', 'संकट प्रबंधन'] },
    { year: 3, title: 'नैतिकता और नियम', progress: 40, status: 'जारी रखें', details: ['कानूनी ढांचा', 'मध्यस्थता कौशल'] },
];

const activeGurus = [
    { name: 'गुरु सुरेश जी', location: 'लखनऊ', families: 150, rating: 4.8, avatarSeed: 'guru-suresh' },
    { name: 'गुरु फातिमा', location: 'हैदराबाद', families: 120, rating: 4.9, avatarSeed: 'guru-fatima' },
    { name: 'गुरु चरण सिंह', location: 'अमृतसर', families: 200, rating: 4.7, avatarSeed: 'guru-charan' },
    { name: 'गुरु जॉन', location: 'केरल', families: 90, rating: 4.6, avatarSeed: 'guru-john' },
];

const workshops = [
    { date: '10-12 मई', title: 'गुरु प्रशिक्षण शिविर - दिल्ली' },
    { date: '17-19 मई', title: 'उन्नत परामर्श तकनीक - मुंबई' },
    { date: '24-26 मई', title: 'डिजिटल गुरु बनना - ऑनलाइन' },
];

export default function GuruTrainingPage() {
    return (
        <div className="space-y-8">
            <Card className="text-center bg-gradient-to-br from-secondary/80 to-secondary/60 text-secondary-foreground">
                <CardHeader>
                    <CardTitle className="font-headline text-4xl">🧘 क्या आप बनना चाहते हैं कुलगुरु?</CardTitle>
                    <CardDescription className="text-secondary-foreground/80 text-lg">
                        "एक गुरु सैकड़ों परिवारों को दिशा दे सकता है"
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center gap-4">
                    <Button variant="default" size="lg" className="bg-white text-secondary hover:bg-gray-100" asChild><Link href="#">आवेदन करें</Link></Button>
                    <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10" asChild><Link href="#">जानकारी लें</Link></Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">📚 गुरु प्रशिक्षण पाठ्यक्रम (3 वर्षीय)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {curriculum.map(item => (
                        <div key={item.year} className="space-y-3 p-4 border rounded-lg">
                           <div className="flex justify-between items-center">
                             <h3 className="font-bold text-lg">🕉️ वर्ष {item.year}: {item.title}</h3>
                             <Button variant={item.progress === 100 ? "secondary" : "default"} size="sm" asChild>
                                <Link href="#">
                                  {item.progress === 100 && <FileText className="mr-2 h-4 w-4" />}
                                  {item.status}
                                </Link>
                            </Button>
                           </div>
                           <ul className="list-disc pl-5 text-muted-foreground">
                               {item.details.map(d => <li key={d}>{d}</li>)}
                           </ul>
                           <div className="flex items-center gap-2">
                                <Progress value={item.progress} className="flex-grow" />
                                <span className="text-sm font-medium">{item.progress}%</span>
                           </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">👥 सक्रिय गुरुओं की सूची</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input placeholder="खोजें: शहर, नाम, भाषा..." className="pl-10 h-11" />
                    </div>
                    <div className="space-y-4">
                        {activeGurus.map(guru => (
                            <div key={guru.name} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                <div className="flex items-center gap-4">
                                    <Avatar>
                                        <AvatarImage src={`https://picsum.photos/seed/${guru.avatarSeed}/100/100`} />
                                        <AvatarFallback>{guru.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">{guru.name} - {guru.location}</p>
                                        <p className="text-sm text-muted-foreground">{guru.families} परिवार</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-yellow-500">
                                    <Star className="h-5 w-5 fill-current" />
                                    <span className="font-bold">{guru.rating}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="text-center pt-6">
                        <Button variant="outline" asChild><Link href="#">सभी देखें</Link></Button>
                    </div>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">📅 आगामी कार्यशालाएं</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {workshops.map((event) => (
                        <div key={event.title} className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                            <Calendar className="h-6 w-6 text-primary" />
                            <div>
                                <p className="font-bold">{event.date}:</p>
                                <p>{event.title}</p>
                            </div>
                        </div>
                    ))}
                    <div className="text-center pt-4">
                        <Button asChild><Link href="#">पंजीकरण करें</Link></Button>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}
