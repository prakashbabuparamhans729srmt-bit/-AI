import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground', className)}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path d="M9.5 15.5c-3 0-4-1-4-4s1-4 4-4c2.5 0 4 1.333 4 2.5a3.5 3.5 0 01-3.5 3.5" />
        <path d="M18.5 12c0 3.5-1.5 5-5 5" />
      </svg>
    </div>
  );
}
