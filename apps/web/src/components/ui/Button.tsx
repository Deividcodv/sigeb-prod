import Link from 'next/link';
import type { ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps {
  children: ReactNode;
  href?: string;
  variant?: Variant;
  className?: string;
  type?: 'button' | 'submit';
  onClick?: () => void;
  disabled?: boolean;
}

const styles: Record<Variant, string> = {
  primary:
    'border-[3px] border-brutal-tinta bg-brutal-gold text-brutal-tinta shadow-brutal-sm hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none',
  secondary:
    'border-[3px] border-brutal-tinta bg-brutal-tinta text-brutal-papel shadow-brutal-sm hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none',
  ghost:
    'border-[3px] border-brutal-tinta bg-transparent text-brutal-tinta hover:bg-brutal-cyan hover:border-brutal-tinta',
  danger:
    'border-[3px] border-brutal-tinta bg-brutal-rojo text-brutal-tinta shadow-brutal-sm hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none',
};

export function Button({
  children,
  href,
  variant = 'primary',
  className = '',
  type = 'button',
  onClick,
  disabled = false,
}: ButtonProps) {
  const base =
    'inline-block rounded-brutal px-6 py-3 font-brut font-bold uppercase tracking-wide transition-all';
  const classes = `${base} ${styles[variant]} ${disabled ? 'cursor-not-allowed opacity-50 hover:translate-x-0 hover:translate-y-0 hover:shadow-brutal-sm' : ''} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}