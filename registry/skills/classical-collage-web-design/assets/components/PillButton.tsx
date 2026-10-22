import clsx from 'clsx';
import Link from 'next/link';

type Variant = 'primary' | 'secondary' | 'small' | 'onDark';

const styles: Record<Variant, string> = {
  primary: 'h-12 px-6 text-base bg-ink text-bg',
  secondary: 'h-12 px-6 text-base bg-transparent text-ink border border-ink-25',
  small: 'h-9 px-4 font-mono text-[11px] tracking-[.08em] uppercase bg-ink text-bg',
  onDark: 'h-12 px-6 text-base bg-bg text-ink',
};

/** Pill button with the "label roll" hover (text slides up, duplicate enters from below). */
export function PillButton({
  href, children, variant = 'primary', dot = variant === 'small', className,
}: { href: string; children: React.ReactNode; variant?: Variant; dot?: boolean; className?: string }) {
  return (
    <Link
      href={href}
      className={clsx(
        'group inline-flex items-center gap-2 rounded-pill transition-colors duration-300 ease-out-quint',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        'hover:brightness-110', styles[variant], className,
      )}
    >
      {dot && <span aria-hidden className="size-1.5 rounded-full bg-current opacity-80" />}
      <span className="relative block overflow-hidden">
        <span className="block transition-transform duration-300 ease-out-quint group-hover:-translate-y-full">{children}</span>
        <span aria-hidden className="absolute inset-0 translate-y-full transition-transform duration-300 ease-out-quint group-hover:translate-y-0">{children}</span>
      </span>
    </Link>
  );
}
