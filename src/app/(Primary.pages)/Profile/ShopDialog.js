'use client';

import { useEffect, useRef, useState } from 'react';
import Banner from '@/app/components/mascot/banners';
import NetzRobot from '@/app/components/mascot/NetzRobot';
import { GemIcon, MedalBadge } from '@/app/components/mascot/art';
import { MAX_FREEZES } from '@/app/utils/progress/catalog';
import { BANNERS, equippedBanner, equippedSkin, FREEZE_PRICE, ownedBanners, ownedSkins, SKINS, YEAR_BADGE_PRICE, yearBadgeOnSale } from '@/app/utils/progress/shop';
import { shopAction } from '@/app/utils/progress/cloudSync';

const BTN = 'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-4 text-[14px] font-bold';
const BTN_MAIN = `${BTN} bg-[var(--pf-accent)] text-[var(--pf-accent-ink)]`;
const BTN_QUIET = `${BTN} border border-[var(--pf-line)] bg-[var(--pf-tray)] text-[var(--pf-ink)]`;
const BTN_OFF = `${BTN} border border-dashed border-[var(--pf-line)] bg-[var(--pf-tray)] text-[var(--pf-text2)] cursor-not-allowed disabled:opacity-100`;

const ERRORS = {
  not_enough_gems: 'Not enough gems yet. Finish a few tasks and come back.',
  freezes_full: `You already hold ${MAX_FREEZES} streak freezes, the most you can keep.`,
  already_owned: 'You already own this.',
  not_for_sale: 'This one is not for sale right now.',
  signed_out: 'Sign in to buy. Gems are kept safe on your account.',
  offline: "You're offline. Try again when you're connected.",
  no_progress_yet: 'Your account is still saving your progress. Try again in a moment.',
};

/**
 * The gem shop (NETZ_LAUNCH_PLAN.md 2.5): banners, streak freezes, robot skins (artboard 13) and the
 * year badge (bought with gems, free for everyone).
 * Buying needs an account; browsing does not. onClose()
 */
export default function ShopDialog({ state, account, initialTab = 'banners', onClose }) {
  const [tab, setTab] = useState(initialTab);
  const [busy, setBusy] = useState(null);
  const [message, setMessage] = useState(null);
  const dialogRef = useRef(null);
  const closeRef = useRef(null);

  const canBuy = account.configured && !!account.user;
  const owned = ownedBanners(state);
  const wearing = equippedBanner(state);
  const ownedSkinIds = ownedSkins(state);
  const wearingSkin = equippedSkin(state);
  const badgeId = yearBadgeOnSale();
  const badgeYear = badgeId.slice(5);
  const hasBadge = !!state.medals?.[badgeId];

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll('button:not([disabled])');
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const act = async (action, itemId, doneText) => {
    setBusy(`${action}:${itemId}`);
    setMessage(null);
    const result = await shopAction(action, itemId);
    setBusy(null);
    setMessage(result.ok ? { ok: true, text: doneText } : { ok: false, text: ERRORS[result.error] || 'That did not work. Please try again.' });
  };

  return (
    <div className="fixed inset-0 z-[95] flex items-end justify-center bg-black/60 sm:items-center sm:p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pf-shop-title"
        className="pf flex max-h-[92vh] w-full max-w-[880px] flex-col overflow-hidden rounded-t-[28px] border border-[var(--pf-line)] bg-[var(--pf-surface)] shadow-2xl sm:rounded-[28px]"
      >
        <div className="flex flex-none items-center gap-3 border-b border-[var(--pf-line)] px-5 py-4">
          <h2 id="pf-shop-title" className="pf-display m-0 flex-1 text-[24px] font-semibold">Shop</h2>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--pf-tray)] px-3 py-1.5 text-[15px] font-bold" aria-label={`${state.gems} gems`}>
            <GemIcon size={18} />{state.gems}
          </span>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close shop" className="flex h-11 w-11 items-center justify-center rounded-xl text-[var(--pf-text2)] hover:bg-[var(--pf-tray)]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>

        <div role="tablist" aria-label="Shop sections" className="flex flex-none gap-2 overflow-x-auto px-5 pt-4">
          {[['banners', 'Banners'], ['freezes', 'Streak freezes'], ['skins', 'Robot skins'], ['year', 'Year badge']].map(([key, label]) => (
            <button key={key} type="button" role="tab" aria-selected={tab === key} onClick={() => { setTab(key); setMessage(null); }} className={`min-h-[40px] flex-none rounded-full px-4 text-[14px] font-bold ${tab === key ? 'bg-[var(--pf-accent)] text-[var(--pf-accent-ink)]' : 'bg-[var(--pf-tray)] text-[var(--pf-ink)]'}`}>
              {label}
            </button>
          ))}
        </div>

        {!canBuy && (
          <div className="mx-5 mt-4 flex flex-none flex-wrap items-center gap-3 rounded-2xl bg-[var(--pf-tray)] p-3 text-[14px]">
            <span className="flex-1">{account.configured ? 'Sign in to buy. Your gems are kept safe on your account.' : 'Buying opens when accounts are switched on. You can look around now.'}</span>
            {account.configured && <button type="button" className={BTN_MAIN} onClick={account.signIn}>Continue with Google</button>}
          </div>
        )}

        <div aria-live="polite" className="flex-none px-5">
          {message && (
            <p className={`m-0 mt-4 rounded-xl px-3 py-2 text-[14px] font-semibold ${message.ok ? 'bg-[var(--pf-done-bg)] text-[var(--pf-done-ink)]' : 'bg-[var(--pf-tray)] text-[var(--pf-ink)]'}`}>{message.text}</p>
          )}
        </div>

        <div role="tabpanel" className="min-h-0 flex-1 overflow-y-auto p-5">
          {tab === 'banners' && (
            <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2">
              {BANNERS.map((b) => {
                const isOwned = owned.includes(b.id);
                const isWorn = wearing === b.id;
                const short = !isOwned && b.price !== null && state.gems < b.price;
                let action = null;
                if (isWorn) action = <span className={`${BTN} bg-[var(--pf-done-bg)] text-[var(--pf-done-ink)]`}>Wearing</span>;
                else if (isOwned) action = <button type="button" className={BTN_QUIET} disabled={!canBuy || !!busy} onClick={() => act('equip', b.id, `${b.name} is now your banner.`)}>{busy === `equip:${b.id}` ? 'Saving…' : 'Wear'}</button>;
                else if (b.price === null) action = <span className="text-[13px] font-semibold text-[var(--pf-text2)]">Pro · {b.pro}</span>;
                else action = (
                  <button type="button" className={canBuy && !short ? BTN_MAIN : BTN_OFF} disabled={!canBuy || short || !!busy} onClick={() => act('buy', b.id, `${b.name} is yours. Wear it whenever you like.`)}>
                    <GemIcon size={15} />{busy === `buy:${b.id}` ? 'Buying…' : b.price}
                  </button>
                );
                return (
                  <li key={b.id} className={`overflow-hidden rounded-[18px] border bg-[var(--pf-surface)] ${isWorn ? 'border-2 border-[#FBAE3D]' : 'border-[var(--pf-line)]'}`}>
                    <Banner id={b.id} height={110} decorative />
                    <div className="flex items-center justify-between gap-3 px-4 py-3">
                      <div className="min-w-0">
                        <div className="font-bold">{b.name}</div>
                        <div className="text-[13px] text-[var(--pf-text2)]">{isOwned ? 'Owned' : b.price === 0 ? 'Free' : short ? `${b.price - state.gems} more gems` : ' '}</div>
                      </div>
                      {action}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {tab === 'freezes' && (
            <div className="flex flex-col items-center gap-4 rounded-2xl bg-[var(--pf-tray)] p-6 text-center">
              <div className="flex gap-2" aria-label={`You hold ${state.streak.freezes} of ${MAX_FREEZES} freezes`}>
                {Array.from({ length: MAX_FREEZES }, (_, i) => (
                  <span key={i} className={`h-12 w-12 rounded-xl ${i < state.streak.freezes ? 'bg-[#5BA8E0]' : 'border-2 border-dashed border-[var(--pf-line)]'}`} />
                ))}
              </div>
              <h3 className="pf-display m-0 text-[20px] font-semibold">Streak freeze</h3>
              <p className="m-0 max-w-[420px] text-[14px] text-[var(--pf-text2)]">Miss a day and a freeze is used by itself, so your streak keeps going. You can hold {MAX_FREEZES}.</p>
              <button
                type="button"
                className={canBuy && state.gems >= FREEZE_PRICE && state.streak.freezes < MAX_FREEZES ? BTN_MAIN : BTN_OFF}
                disabled={!canBuy || state.gems < FREEZE_PRICE || state.streak.freezes >= MAX_FREEZES || !!busy}
                onClick={() => act('buy', 'freeze', 'Streak freeze added.')}
              >
                <GemIcon size={15} />{busy === 'buy:freeze' ? 'Buying…' : state.streak.freezes >= MAX_FREEZES ? 'You hold the most' : `Buy for ${FREEZE_PRICE}`}
              </button>
            </div>
          )}

          {tab === 'year' && (
            <div className="flex flex-col items-center gap-4 rounded-2xl bg-[var(--pf-tray)] p-6 text-center">
              <MedalBadge family="season" id={badgeId} earned={hasBadge} size={96} label={`${badgeYear} year badge${hasBadge ? ', owned' : ''}`} />
              <h3 className="pf-display m-0 text-[20px] font-semibold">{badgeYear} year badge</h3>
              <p className="m-0 max-w-[420px] text-[14px] text-[var(--pf-text2)]">A laurel badge for your medal case, for everyone. It is only on sale during {badgeYear}, and it stays with you after.</p>
              <button
                type="button"
                className={canBuy && !hasBadge && state.gems >= YEAR_BADGE_PRICE ? BTN_MAIN : BTN_OFF}
                disabled={!canBuy || hasBadge || state.gems < YEAR_BADGE_PRICE || !!busy}
                onClick={() => act('buy', badgeId, `The ${badgeYear} year badge is in your medal case.`)}
              >
                <GemIcon size={15} />{busy === `buy:${badgeId}` ? 'Buying…' : hasBadge ? 'Owned' : `Buy for ${YEAR_BADGE_PRICE.toLocaleString('en-IN')}`}
              </button>
              {!hasBadge && state.gems < YEAR_BADGE_PRICE && <p className="m-0 text-[13px] text-[var(--pf-text2)]">{(YEAR_BADGE_PRICE - state.gems).toLocaleString('en-IN')} more gems</p>}
            </div>
          )}

          {tab === 'skins' && (
            <ul className="m-0 grid list-none grid-cols-2 gap-4 p-0 sm:grid-cols-3">
              {SKINS.map((k) => {
                const isOwned = ownedSkinIds.includes(k.id);
                const isWorn = wearingSkin === k.id;
                const short = !isOwned && k.price !== null && state.gems < k.price;
                let action = null;
                if (isWorn) action = <span className={`${BTN} w-full bg-[var(--pf-done-bg)] text-[var(--pf-done-ink)]`}>Wearing</span>;
                else if (isOwned) action = <button type="button" className={`${BTN_QUIET} w-full`} disabled={!canBuy || !!busy} onClick={() => act('equip', k.id, `Your robot is wearing ${k.name}.`)}>{busy === `equip:${k.id}` ? 'Saving…' : 'Wear'}</button>;
                else if (k.price === null) action = <span className="block text-center text-[13px] font-semibold text-[var(--pf-text2)]">Pro · {k.pro}</span>;
                else action = (
                  <button type="button" className={`${canBuy && !short ? BTN_MAIN : BTN_OFF} w-full`} disabled={!canBuy || short || !!busy} onClick={() => act('buy', k.id, `${k.name} is yours. Wear it whenever you like.`)}>
                    <GemIcon size={15} />{busy === `buy:${k.id}` ? 'Buying…' : k.price}
                  </button>
                );
                return (
                  <li key={k.id} className={`flex flex-col items-center gap-2 rounded-[18px] border bg-[var(--pf-surface)] p-3 ${isWorn ? 'border-2 border-[#FBAE3D]' : k.price === null ? 'border-[#D55E64]' : 'border-[var(--pf-line)]'}`}>
                    <NetzRobot size={112} skin={k.id} listen={false} title={`Robot in the ${k.name} skin`} />
                    <div className="w-full">
                      <div className="font-bold leading-tight">{k.name}</div>
                      <div className="text-[12px] leading-snug text-[var(--pf-text2)]">{isOwned ? 'Owned' : short ? `${k.price - state.gems} more gems` : k.idea}</div>
                    </div>
                    {action}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
