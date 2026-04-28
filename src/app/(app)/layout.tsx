'use client';

import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { MainNav } from '@/components/main-nav';
import { UserNav } from '@/components/user-nav';
import Link from 'next/link';
import { useUser, useDoc, useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';

type UserProfile = {
  familyId?: string;
};

type Family = {
  familyName?: string;
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const familyRef = useMemoFirebase(() => {
    // Check if userProfile and familyId exist
    if (!userProfile?.familyId) return null;
    return doc(firestore, 'families', userProfile.familyId);
  }, [firestore, userProfile]);
  const { data: family, isLoading: isFamilyLoading } = useDoc<Family>(familyRef);
  
  // Determine the family name to display
  const familyName = isUserLoading || isProfileLoading || isFamilyLoading 
    ? '...' // Show loading indicator
    : (user && user.isAnonymous)
      ? 'अतिथि'
      : (family?.familyName || 'परिवार');
      
  const notificationsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, `users/${user.uid}/notifications`), where('isRead', '==', false));
  }, [firestore, user]);
  const { data: unreadNotifications } = useCollection<{id: string}>(notificationsQuery);
  const unreadCount = unreadNotifications?.length || 0;


  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Logo />
            <span className="text-lg font-headline font-semibold">कुलगुरु AI</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <MainNav />
        </SidebarContent>
        <SidebarFooter>
          {/* Can add footer items here if needed */}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-40 w-full border-b bg-background">
          <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
            <div className="flex gap-2 items-center">
              <SidebarTrigger className="md:hidden" />
              <div className="hidden md:block font-headline text-2xl">
                🌞 नमस्ते {familyName}!
              </div>
            </div>

            <div className="flex flex-1 items-center justify-end space-x-4">
              <nav className="flex items-center space-x-1">
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/notifications" className="relative">
                    <Bell className="h-5 w-5" />
                     {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
                        {unreadCount}
                      </span>
                    )}
                    <span className="sr-only">Notifications</span>
                  </Link>
                </Button>
                <UserNav />
              </nav>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
