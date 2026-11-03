// Page frame for every method page. The markup and classes are the ones the 34 hand-written pages use,
// moved here so new pages share them (METHODS_IMPLEMENTATION_PLAN.md, step A3).
import FullscreenToggle from '@/app/components/FullscreenToggle';
import { EditorialThemeToggle } from '@/app/components/editorial';
import AlgorithmNavigation from '@/app/components/AlgorithmNavigation';

/** Background, width, side-bar gap and the previous/next links under the content. */
export function MethodPage({ children }) {
  return (
    <FullscreenToggle className="w-full min-h-screen">
      <div className="w-full min-h-screen bg-[#FAF8F5] dark:bg-[#111111] text-black dark:text-white transition-colors editorial-grid-bg">
        <div className="md:ml-[80px]">
          <section className="container mx-auto px-4 md:px-8 py-10 space-y-10 max-w-6xl">
            {children}
            <AlgorithmNavigation />
          </section>
        </div>
      </div>
    </FullscreenToggle>
  );
}

/**
 * Yellow unit badge, two-line heading and the intro paragraph.
 * The intro should answer first: one plain sentence saying what the method does.
 */
export function MethodHeader({ badge, title, subtitle, children }) {
  return (
    <div className="space-y-4 pt-2">
      <div className="flex justify-between items-start">
        <div className="inline-block border-2 border-black dark:border-white bg-[#FFE600] text-black px-3 py-0.5 text-xs font-mono font-black uppercase tracking-widest shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-md">
          {badge}
        </div>
        <EditorialThemeToggle />
      </div>

      <h1 className="text-3xl md:text-5xl font-black tracking-tight uppercase leading-tight text-black dark:text-white">
        {`${title} `}<br />
        {subtitle && <span className="underline decoration-4 underline-offset-8 decoration-black dark:decoration-white">{subtitle}</span>}
      </h1>

      {children && (
        <p className="text-base md:text-lg font-medium text-neutral-700 dark:text-neutral-300 max-w-3xl leading-relaxed">
          {children}
        </p>
      )}
    </div>
  );
}

/** The "Laboratory" section that holds the live calculator. */
export function Lab({ heading = 'Interactive Live Calculator', children }) {
  return (
    <div className="pt-8 border-t-2 border-black/80 dark:border-neutral-700 space-y-6">
      <div className="inline-block border border-black/60 dark:border-neutral-600 bg-black text-white dark:bg-white dark:text-black px-2.5 py-0.5 text-xs font-mono font-bold rounded-md uppercase mb-1">
        LABORATORY
      </div>
      <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
        {heading}
      </h2>
      {children}
    </div>
  );
}
