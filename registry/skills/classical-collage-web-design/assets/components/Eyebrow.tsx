/* eslint-disable */
// @ts-nocheck
// Reference file from a Claude skill: type-checking and lint are off so it can't break your project.
// If you copy it into your app, install the packages it imports and delete these four lines.
import clsx from 'clsx';

/** Category label. `slashes` adds the warm-variant "// " prefix and mono styling. */
export function Eyebrow({ children, slashes = false, className }: { children: React.ReactNode; slashes?: boolean; className?: string }) {
  return (
    <p className={clsx(slashes ? 'font-mono text-[11px] tracking-[.08em]' : 'text-label font-medium', 'uppercase opacity-70', className)}>
      {slashes && '// '}{children}
    </p>
  );
}
