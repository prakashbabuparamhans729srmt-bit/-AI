'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Library,
  HeartPulse,
  Users,
  MessageCircle,
  GraduationCap,
  Settings,
  Baby,
  Scale,
} from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: <LayoutDashboard />, label: 'डैशबोर्ड' },
  { href: '/knowledge-hub', icon: <Library />, label: 'धर्म ज्ञान केंद्र' },
  { href: '/rules', icon: <Scale />, label: 'नियम संहिता' },
  { href: '/crisis-counseling', icon: <HeartPulse />, label: 'संकट परामर्श' },
  { href: '/kids-corner', icon: <Baby />, label: 'बच्चों का कोना' },
  { href: '/community', icon: <MessageCircle />, label: 'सामुदायिक मंच' },
  { href: '/profile', icon: <Users />, label: 'परिवार प्रोफाइल' },
  { href: '/guru-training', icon: <GraduationCap />, label: 'गुरु प्रशिक्षण' },
];

export function MainNav({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <SidebarMenu className={cn('gap-2', className)}>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href} legacyBehavior passHref>
            <SidebarMenuButton
              isActive={pathname === item.href}
              tooltip={item.label}
            >
              {item.icon}
              <span className="truncate">{item.label}</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
