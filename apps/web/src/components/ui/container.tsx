import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

/** Centers page content at a consistent max width with horizontal padding. */
export function Container({
  children,
  className,
  size = 'default',
}: {
  children: ReactNode;
  className?: string;
  size?: 'default' | 'wide' | 'narrow';
}) {
  const width = size === 'wide' ? 'max-w-6xl' : size === 'narrow' ? 'max-w-3xl' : 'max-w-5xl';
  return <div className={cn('mx-auto w-full px-6', width, className)}>{children}</div>;
}
