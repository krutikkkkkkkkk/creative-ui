import Image from 'next/image';
import { Eyebrow } from './Eyebrow';
import { PillButton } from './PillButton';
import { Reveal } from './Reveal';
import { DataTexture } from './DataTexture';

type HeroProps = {
  layout?: 'editorial' | 'stage';
  eyebrow?: string;
  lines: string[];            // headline lines, e.g. ["Money moves.", "The future begins here."]
  lead: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
  art: { src: string; alt: string };
  dataTexture?: 'finance' | 'ai';
  children?: React.ReactNode; // e.g. <FloatingCoins/> or cut-out hands
};

export function Hero({ layout = 'editorial', eyebrow, lines, lead, primary, secondary, art, dataTexture, children }: HeroProps) {
  const stage = layout === 'stage';
  return (
    <section className="relative min-h-[100svh] overflow-hidden">
      {dataTexture && <DataTexture kind={dataTexture} />}

      {!stage && (
        <div className="absolute inset-y-0 right-0 w-[70%] md:w-[58%]">
          <Image src={art.src} alt={art.alt} fill priority sizes="(min-width:768px) 58vw, 70vw" className="object-cover object-left-bottom" />
          <div aria-hidden className="dot-cloud absolute inset-0" />
        </div>
      )}
      {children}

      <div className={`relative z-10 mx-auto max-w-site px-gutter ${stage ? 'pt-[38vh] text-center' : 'pt-40 md:pt-48'}`}>
        <div className={stage ? 'mx-auto max-w-4xl' : 'max-w-xl'}>
          {eyebrow && <Reveal><Eyebrow slashes={stage}>{eyebrow}</Eyebrow></Reveal>}
          <h1 className="mt-4 font-serif text-display-xl text-ink">
            {lines.map((l, i) => <Reveal key={l} index={i + 1}><span className="block">{l}</span></Reveal>)}
          </h1>
          <Reveal index={lines.length + 1}>
            <p className={`mt-5 text-lead text-ink-70 ${stage ? 'mx-auto max-w-xl' : 'max-w-md'}`}>{lead}</p>
          </Reveal>
          <Reveal index={lines.length + 2}>
            <div className={`mt-8 flex flex-col gap-3 sm:flex-row ${stage ? 'justify-center' : ''}`}>
              <PillButton href={primary.href} variant={stage ? 'small' : 'primary'}>{primary.label}</PillButton>
              {secondary && <PillButton href={secondary.href} variant="secondary">{secondary.label}</PillButton>}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
