import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md';

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-accent text-white hover:-translate-y-0.5 hover:shadow-pop focus-visible:-translate-y-0.5 focus-visible:outline-accent',
  secondary:
    'border border-line/20 text-chalk hover:-translate-y-0.5 hover:border-line/40 focus-visible:outline-line/40',
  ghost: 'text-muted hover:text-chalk focus-visible:outline-line/40',
};

const SIZES: Record<Size, string> = {
  sm: 'px-4 py-2 text-[12px]',
  md: 'px-6 py-3 text-[13px]',
};

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-full font-bold uppercase tracking-wide transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

function classes(variant: Variant, size: Size, className?: string): string {
  return cn(BASE, VARIANTS[variant], SIZES[size], className);
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={classes(variant, size, className)} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  children,
  href,
  variant = 'primary',
  size = 'md',
  className,
  external,
}: {
  children: ReactNode;
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  external?: boolean;
}) {
  if (external) {
    return (
      <a href={href} className={classes(variant, size, className)} target="_blank" rel="noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={classes(variant, size, className)}>
      {children}
    </Link>
  );
}
