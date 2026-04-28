'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc, writeBatch } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Bell, CheckCheck } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { hi } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

type Notification = {
  id: string;
  title: string;
  description: string;
  link?: string;
  isRead: boolean;
  createdAt: { seconds: number; nanoseconds: number };
};

export default function NotificationsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const notificationsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, `users/${user.uid}/notifications`), orderBy('createdAt', 'desc'));
  }, [firestore, user]);

  const { data: notifications, isLoading } = useCollection<Notification>(notificationsQuery);

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  const handleMarkAsRead = async (notificationId: string) => {
    if (!user) return;
    const notificationRef = doc(firestore, `users/${user.uid}/notifications`, notificationId);
    try {
      await updateDocumentNonBlocking(notificationRef, { isRead: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({ variant: 'destructive', title: 'त्रुटि', description: 'सूचना को पढ़ने के रूप में चिह्नित करने में विफल।' });
    }
  };
  
  const handleMarkAllAsRead = async () => {
    if (!user || !notifications || unreadCount === 0) return;
    
    const batch = writeBatch(firestore);
    notifications.forEach(notification => {
        if (!notification.isRead) {
            const notificationRef = doc(firestore, `users/${user.uid}/notifications`, notification.id);
            batch.update(notificationRef, { isRead: true });
        }
    });

    try {
        await batch.commit();
        toast({ title: 'सफलतापूर्वक', description: 'सभी सूचनाओं को पढ़ लिया गया है।' });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        toast({ variant: 'destructive', title: 'त्रुटि', description: 'सभी सूचनाओं को पढ़ने के रूप में चिह्नित करने में विफल।' });
    }
  };

  const formatNotificationDate = (timestamp: { seconds: number; nanoseconds: number }) => {
    if (!timestamp) return '';
    try {
      return formatDistanceToNow(new Date(timestamp.seconds * 1000), { addSuffix: true, locale: hi });
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="font-headline text-3xl">सूचनाएं ({unreadCount} नई)</CardTitle>
            <CardDescription>आपकी हाल की गतिविधियां और अलर्ट।</CardDescription>
          </div>
          <Button onClick={handleMarkAllAsRead} disabled={unreadCount === 0}>
            <CheckCheck className="mr-2 h-4 w-4" />
            सभी को पढ़ा हुआ चिह्नित करें
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}
          {!isLoading && (!notifications || notifications.length === 0) && (
            <div className="text-center text-muted-foreground py-10">
              <Bell className="mx-auto h-12 w-12" />
              <p className="mt-4">आपके पास कोई सूचना नहीं है।</p>
            </div>
          )}
          <div className="space-y-4">
            {notifications?.map(notification => (
              <div
                key={notification.id}
                className={cn(
                  'flex items-start gap-4 rounded-lg border p-4 transition-colors',
                  notification.isRead ? 'bg-background' : 'bg-primary/5'
                )}
              >
                <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Bell className="h-5 w-5" />
                </div>
                <div className="flex-grow">
                  <p className="font-semibold">{notification.title}</p>
                  <p className="text-sm text-muted-foreground">{notification.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatNotificationDate(notification.createdAt)}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {notification.link && (
                      <Button size="sm" asChild>
                        <Link href={notification.link}>देखें</Link>
                      </Button>
                    )}
                    {!notification.isRead && (
                       <Button size="sm" variant="outline" onClick={() => handleMarkAsRead(notification.id)}>
                        पढ़ा हुआ चिह्नित करें
                       </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
