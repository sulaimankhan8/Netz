'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import useProgress from '@/app/utils/progress/useProgress';
import useAccount from '@/app/utils/progress/useAccount';
import { markOnboardingSeen, PROGRESS_EVENT } from '@/app/utils/progress/engine';
import { GROUPS, GEMS, MONTH_MEDAL_DAYS, ONBOARDING, PRO_REWARD_AT, PRO_SEASONS, PRO_TASKS, STREAK_MEDALS, TASKS, MAX_FREEZES, DEFAULT_ROBOT_NAME } from '@/app/utils/progress/catalog';
import useIsPro, { useProStatus } from '@/app/utils/useIsPro';
import { refreshPro } from '@/app/utils/proClient';
import { PLANS } from '@/app/utils/pricing';
import NetzRobot from '@/app/components/mascot/NetzRobot';
import { FlameIcon, GemIcon, MedalBadge, MedalIcon, RobotHead } from '@/app/components/mascot/art';
import OnboardingDialog from './OnboardingDialog';
import AdSlot from '@/app/components/ads/AdSlot';
import useAdsAllowed from '@/app/utils/ads/useAdsAllowed';
import { AD_REWARD } from '@/app/utils/ads/adsPolicy';
import { adRewardsLeft } from '@/app/utils/ads/adReward';
import { REWARDED_UNIT, playRewarded } from '@/app/utils/ads/gpt';
import { claimAdReward } from '@/app/utils/progress/cloudSync';
import ShopDialog from './ShopDialog';
import Banner from '@/app/components/mascot/banners';
import { BANNER_BY_ID, SKIN_BY_ID, YEAR_BADGE_PRICE, equippedBanner, equippedSkin } from '@/app/utils/progress/shop';
import { PF_FONT } from './fonts';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const LAUNCH = { year: 2026, month: 10 };
const GROUP_ORDER = ['unit1', 'unit2', 'unit3', 'unit4', 'unit5', 'notes', 'playground', 'sharing'];

const BTN = 'inline-flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-xl font-bold text-[14px] transition-colors';
const BTN_QUIET = `${BTN} bg-[var(--pf-tray)] text-[var(--pf-ink)] border border-[var(--pf-line)] hover:brightness-95`;
const BTN_MAIN = `${BTN} bg-[var(--pf-accent)] text-[var(--pf-accent-ink)] hover:brightness-105`;
const BTN_SOON = `${BTN} bg-[var(--pf-tray)] text-[var(--pf-text2)] disabled:bg-[var(--pf-tray)] disabled:text-[var(--pf-text2)] disabled:opacity-100 border border-dashed border-[var(--pf-line)] cursor-not-allowed`;
const CARD_TITLE = 'pf-display m-0 text-[22px] font-semibold leading-tight';

function plural(n, word) {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

function formatDay(day) {
  if (!day) return '';
  const [y, m, d] = day.split('-').map(Number);
  return `${d} ${MONTHS[m - 1].slice(0, 3)} ${y}`;
}

function Hex({ group, id, size = 36 }) {
  const g = GROUPS[group] || GROUPS.unit1;
  return <MedalBadge family="task" id={id} earned fill={g.fill} rim={g.rim} size={size} label="" />;
}

/* ---------------- sections ---------------- */

function Header({ summary, robotName, signedIn, bannerId, skinId, onOpenShop }) {
  return (
    <section className="pf-card overflow-hidden">
      <Banner id={bannerId} height={180} className="md:h-[200px]" />
      <div className="flex flex-wrap items-start gap-4 md:gap-6 px-4 md:px-8 pb-6 pt-3">
        <div className="relative z-[1] -mt-14 md:-mt-16 flex h-[96px] w-[96px] md:h-[120px] md:w-[120px] flex-none items-center justify-center rounded-full border-[5px] border-[var(--pf-surface)] bg-[#132034]">
          <RobotHead size={76} skin={skinId} title={`Your robot, ${robotName || DEFAULT_ROBOT_NAME}`} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h1 className="pf-display m-0 text-[26px] md:text-[32px] font-semibold">{summary.displayName || 'Your profile'}</h1>
            <span className="text-[14px] text-[var(--pf-text2)]">
              {`Robot: ${robotName || DEFAULT_ROBOT_NAME}`} · {signedIn ? 'saved to your account' : 'saved on this device'}
            </span>
          </div>
          <ul className="m-0 flex list-none flex-wrap gap-2 p-0" aria-label="Your progress">
            <li className="inline-flex items-center gap-1.5 rounded-full bg-[var(--pf-tray)] px-3 py-1.5 text-[14px] font-medium"><FlameIcon />{summary.streak}-day streak</li>
            <li className="inline-flex items-center gap-1.5 rounded-full bg-[var(--pf-tray)] px-3 py-1.5 text-[14px] font-medium"><GemIcon />{plural(summary.gems, 'gem')}</li>
            <li className="inline-flex items-center gap-1.5 rounded-full bg-[var(--pf-tray)] px-3 py-1.5 text-[14px] font-medium"><MedalIcon />{plural(summary.medalCount, 'medal')}</li>
          </ul>
        </div>
        <div className="flex gap-2 self-end">
          <button type="button" className={BTN_QUIET} onClick={() => onOpenShop('banners')}>Change banner</button>
          <button type="button" className={BTN_MAIN} onClick={() => onOpenShop('banners')}>Shop</button>
        </div>
      </div>
    </section>
  );
}

function GettingStarted({ state, onMeetRobot, account }) {
  const done = ONBOARDING.filter((s) => state.onboarding[s.id]).length;
  if (done === ONBOARDING.length) return null;
  return (
    <section className="pf-card p-5 md:p-6 flex flex-col gap-4" aria-labelledby="pf-start">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="pf-start" className={CARD_TITLE}>Getting started</h2>
          <p className="m-0 mt-1 text-[14px] text-[var(--pf-text2)]">{done} of {ONBOARDING.length} done · each gives a medal and {GEMS.onboarding} gems</p>
        </div>
        {!state.onboarding['onboard.meet-robot'] && (
          <button type="button" className={BTN_MAIN} onClick={onMeetRobot}>Meet your robot</button>
        )}
      </div>
      <ol className="m-0 grid list-none gap-2 p-0 sm:grid-cols-2 lg:grid-cols-5">
        {ONBOARDING.map((step) => {
          const isDone = !!state.onboarding[step.id];
          const soon = step.id === 'onboard.account' && !account.configured;
          return (
            <li key={step.id} className="flex items-center gap-3 rounded-2xl bg-[var(--pf-tray)] p-3">
              <MedalBadge family="onboarding" id={step.id} earned={isDone} size={40} label={`${step.medal}${isDone ? ', earned' : ', not earned yet'}`} />
              <div className="min-w-0">
                <div className="text-[14px] font-bold leading-snug">{step.medal}</div>
                <div className="text-[12px] leading-snug text-[var(--pf-text2)]">{soon && !isDone ? 'Accounts are coming soon' : step.name}</div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function Today({ summary, className }) {
  const done = Math.min(summary.doneToday, summary.goal);
  const ring = 2 * Math.PI * 34;
  const next = summary.today.find((t) => !t.done);
  const goalMet = summary.doneToday >= summary.goal;
  return (
    <section className={`pf-card p-4 sm:p-5 md:p-6 flex flex-col gap-4 ${className}`} aria-labelledby="pf-today">
      <div className="flex flex-wrap items-center gap-4">
        <svg width="76" height="76" viewBox="0 0 84 84" role="img" aria-label={`Daily goal: ${done} of ${summary.goal} tasks`}>
          <circle cx="42" cy="42" r="34" fill="none" stroke="var(--pf-tray)" strokeWidth="10" />
          <circle cx="42" cy="42" r="34" fill="none" stroke="#FBAE3D" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${(ring * done) / summary.goal} ${ring}`} transform="rotate(-90 42 42)" />
          <text x="42" y="49" textAnchor="middle" className="pf-display" fontWeight="700" fontSize="20" fill="var(--pf-ink)">{done}/{summary.goal}</text>
        </svg>
        <div className="min-w-0 flex-1">
          <h2 id="pf-today" className={CARD_TITLE}>Today</h2>
          <p className="m-0 mt-1 text-[14px] text-[var(--pf-text2)]">
            {goalMet ? "Today's goal is done." : `${plural(summary.goal - done, 'more task')} for today's goal: +${GEMS.dailyGoal} gems. Any task counts; these are ideas.`}
          </p>
        </div>
        <div className="flex items-end gap-2">
          <p className="m-0 hidden sm:block max-w-[180px] rounded-[14px_14px_4px_14px] bg-[var(--pf-tray)] px-3 py-2 text-[13px] leading-snug">
            {goalMet ? 'Great work today. See you tomorrow!' : next ? `${next.name} next? I'm ready.` : 'Pick any task below.'}
          </p>
          <NetzRobot size={64} trackPointer sleepAfterMs={120000} title="Your robot" />
        </div>
      </div>
      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {summary.today.map((t) => (
          <li key={t.id} className="flex items-center gap-3 rounded-2xl bg-[var(--pf-tray)] p-3">
            <Hex group={t.group} id={t.id} />
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-bold leading-snug">{t.name}</div>
              <div className="text-[13px] text-[var(--pf-text2)]">
                {/* Phones: the gems sit in this line so the task name keeps its width */}
                <span className="sm:hidden font-semibold text-[var(--pf-accent-text)]">+{t.first ? GEMS.firstTime : GEMS.repeat} gems · </span>
                {t.medal} · {t.first ? 'first time, new medal' : 'repeat'}
              </div>
            </div>
            <span className="hidden sm:inline pf-display font-semibold text-[var(--pf-accent-text)]">+{t.first ? GEMS.firstTime : GEMS.repeat}</span>
            {t.done ? (
              <span className="inline-flex min-h-[44px] min-w-[56px] sm:min-w-[76px] items-center justify-center rounded-xl bg-[var(--pf-done-bg)] px-3 text-[14px] font-bold text-[var(--pf-done-ink)]">Done</span>
            ) : (
              <Link href={t.href} className={`${BTN_MAIN} min-w-[56px] sm:min-w-[76px]`} aria-label={`Go: ${t.name}`}>Go</Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Calendar({ state, today }) {
  const [y, m] = today.split('-').map(Number);
  const first = new Date(y, m - 1, 1);
  const lead = (first.getDay() + 6) % 7;
  const count = new Date(y, m, 0).getDate();
  const cells = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= count; d++) cells.push(d);
  const key = (d) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const todayNum = Number(today.slice(8));
  return (
    <div className="grid grid-cols-7 gap-1.5 text-center text-[12px]">
      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <div key={i} aria-hidden="true" className="text-[var(--pf-text2)]">{d}</div>)}
      {cells.map((d, i) => {
        if (!d) return <div key={i} />;
        const isDone = (state.daysDone[key(d)] || []).length > 0;
        return (
          <div
            key={i}
            className={`flex h-8 items-center justify-center rounded-[9px] ${isDone ? 'bg-[var(--pf-day-done)] font-bold text-[#141415]' : 'bg-[var(--pf-tray)] text-[var(--pf-text2)]'} ${d === todayNum ? 'ring-2 ring-[#FBAE3D]' : ''}`}
          >
            {d}
            {(isDone || d === todayNum) && <span className="sr-only">{isDone ? ', task done' : ''}{d === todayNum ? ', today' : ''}</span>}
          </div>
        );
      })}
    </div>
  );
}

function Streak({ state, summary, today, className }) {
  const next = STREAK_MEDALS.find((m) => m.days > summary.streak);
  const month = MONTHS[Number(today.slice(5, 7)) - 1];
  return (
    <section className={`pf-card p-5 md:p-6 flex flex-col gap-4 ${className}`} aria-labelledby="pf-streak">
      <h2 id="pf-streak" className="sr-only">Streak</h2>
      <div className="flex items-center gap-3">
        <FlameIcon size={46} />
        <div>
          <div className="pf-display text-[32px] font-bold leading-none">{plural(summary.streak, 'day')}</div>
          <div className="mt-1 text-[14px] text-[var(--pf-text2)]">Best {summary.bestStreak}{next ? ` · next medal at ${next.days}` : ' · every streak medal earned'}</div>
        </div>
      </div>
      <div className="flex items-center justify-between rounded-[14px] bg-[var(--pf-tray)] px-4 py-2.5">
        <span className="text-[14px]">Streak freezes</span>
        <span className="flex gap-1.5" aria-label={`${summary.freezes} of ${MAX_FREEZES} freezes`}>
          {Array.from({ length: MAX_FREEZES }, (_, i) => (
            <span key={i} className={`h-[22px] w-[22px] rounded-md ${i < summary.freezes ? 'bg-[#5BA8E0]' : 'border-2 border-dashed border-[var(--pf-line)]'}`} />
          ))}
        </span>
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <div className="font-bold">{month} {today.slice(0, 4)}</div>
        <div className="text-[13px] text-[var(--pf-text2)]">{summary.monthDays} / {MONTH_MEDAL_DAYS} days for the medal</div>
      </div>
      <Calendar state={state} today={today} />
      <p className="m-0 text-[13px] text-[var(--pf-text2)]">One task a day keeps the streak. Missed days take a freeze if you have one; medals you earned always stay.</p>
    </section>
  );
}

function seasonMonths(today) {
  const year = Number(today.slice(0, 4));
  const start = year === LAUNCH.year ? LAUNCH.month : 1;
  const list = [];
  for (let m = start; m <= 12; m++) list.push({ year, month: m });
  return list;
}

function MedalCase({ state, today, className }) {
  const [tab, setTab] = useState('tasks');
  const [selected, setSelected] = useState(null);

  const tabs = useMemo(() => {
    const months = seasonMonths(today);
    const year = today.slice(0, 4);
    return {
      tasks: {
        label: 'Tasks',
        items: TASKS.map((t) => {
          const g = GROUPS[t.group];
          return { id: `task.${t.id}`, family: 'task', fill: g.fill, rim: g.rim, name: t.medal, how: t.name, href: t.href, earnedOn: state.tasksFirstDone[t.id] };
        }),
      },
      onboarding: {
        label: 'Onboarding',
        items: ONBOARDING.map((s) => ({ id: s.id, family: 'onboarding', name: s.medal, how: s.name, earnedOn: state.onboarding[s.id] })),
      },
      streak: {
        label: 'Streak',
        items: STREAK_MEDALS.map((m) => ({ id: m.id, family: 'streak', tier: m.tier, days: m.days, name: `${m.days}-day streak`, how: `Keep a ${m.days}-day streak · ${m.tierName} tier · +${m.gems} gems`, earnedOn: state.medals[m.id] })),
      },
      seasons: {
        label: 'Seasons',
        items: [
          ...months.map(({ year: y, month }) => {
            const id = `month.${y}-${String(month).padStart(2, '0')}`;
            return { id, family: 'season', name: `${MONTHS[month - 1]} ${y}`, how: `Do tasks on ${MONTH_MEDAL_DAYS} days of ${MONTHS[month - 1]} · +${GEMS.monthMedal} gems`, earnedOn: state.medals[id] };
          }),
          { id: `year.${year}`, family: 'season', name: `${year} year badge`, how: `Buy it in the shop for ${YEAR_BADGE_PRICE.toLocaleString('en-IN')} gems during ${year}. Free for everyone.`, earnedOn: state.medals[`year.${year}`] },
          { id: `pro.${year}`, family: 'season', name: `${year} Pro medal`, how: `Pro members: finish the ${year} Pro tasks. Kept forever.`, earnedOn: state.medals[`pro.${year}`] },
        ],
      },
    };
  }, [state, today]);

  const items = tabs[tab].items;
  const earned = (key) => tabs[key].items.filter((i) => i.earnedOn).length;
  const total = Object.keys(tabs).reduce((n, k) => n + earned(k), 0);
  const current = items.find((i) => i.id === selected);

  return (
    <section className={`pf-card p-5 md:p-6 flex flex-col gap-4 ${className}`} aria-labelledby="pf-medals">
      <div className="flex items-center justify-between">
        <h2 id="pf-medals" className={CARD_TITLE}>Medal case</h2>
        <span className="text-[14px] text-[var(--pf-text2)]">{total} earned</span>
      </div>
      <div role="tablist" aria-label="Medal families" className="flex flex-wrap gap-2">
        {Object.entries(tabs).map(([key, t]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => { setTab(key); setSelected(null); }}
            className={`min-h-[40px] rounded-full px-4 text-[14px] font-bold ${tab === key ? 'bg-[var(--pf-accent)] text-[var(--pf-accent-ink)]' : 'bg-[var(--pf-tray)] text-[var(--pf-ink)]'}`}
          >
            {t.label} {earned(key)}/{t.items.length}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="grid grid-cols-[repeat(auto-fill,minmax(48px,1fr))] gap-2">
        {items.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setSelected(m.id === selected ? null : m.id)}
            aria-pressed={m.id === selected}
            aria-label={`${m.name}, ${m.earnedOn ? 'earned' : 'not earned yet'}`}
            className={`flex aspect-square items-center justify-center rounded-xl p-0.5 ${m.id === selected ? 'bg-[var(--pf-tray)] ring-2 ring-[#FBAE3D]' : ''}`}
          >
            <MedalBadge family={m.family} id={m.id} earned={!!m.earnedOn} fill={m.fill} rim={m.rim} tier={m.tier} days={m.days} size={48} label="" />
          </button>
        ))}
      </div>
      {current ? (
        <div className="flex items-center gap-4 rounded-2xl bg-[var(--pf-tray)] p-4" aria-live="polite">
          <MedalBadge family={current.family} id={current.id} earned={!!current.earnedOn} fill={current.fill} rim={current.rim} tier={current.tier} days={current.days} size={80} label={current.name} />
          <div className="min-w-0 flex-1">
            <div className="pf-display text-[19px] font-semibold">{current.name}</div>
            <div className="text-[14px] text-[var(--pf-text2)]">{current.how}</div>
            <div className="mt-1 text-[13px] font-bold">{current.earnedOn ? `Earned ${formatDay(current.earnedOn)}` : 'Not earned yet'}</div>
          </div>
          {!current.earnedOn && current.href && <Link href={current.href} className={BTN_MAIN}>Go</Link>}
        </div>
      ) : (
        <p className="m-0 text-[14px] text-[var(--pf-text2)]">Tap a medal to see what it is for and when you earned it.</p>
      )}
    </section>
  );
}

function AllTasks({ state, className }) {
  return (
    <section className={`pf-card p-5 md:p-6 flex flex-col gap-3 ${className}`} aria-labelledby="pf-all">
      <h2 id="pf-all" className={CARD_TITLE}>All {TASKS.length} tasks</h2>
      {GROUP_ORDER.map((group) => {
        const tasks = TASKS.filter((t) => t.group === group);
        const done = tasks.filter((t) => state.tasksFirstDone[t.id]).length;
        const g = GROUPS[group];
        return (
          <details key={group} className="group rounded-2xl">
            <summary className="flex min-h-[44px] cursor-pointer list-none items-center gap-3 rounded-xl px-1">
              <span className="w-[96px] flex-none font-semibold md:w-[120px]">{g.name}</span>
              <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-[var(--pf-tray)]" aria-hidden="true">
                <span className="block h-full rounded-full" style={{ width: `${(done / tasks.length) * 100}%`, background: g.fill }} />
              </span>
              <span className="pf-display w-[48px] text-right font-semibold text-[var(--pf-text2)]">{done}/{tasks.length}</span>
              <span className="text-[var(--pf-text2)] transition-transform group-open:rotate-90" aria-hidden="true">›</span>
            </summary>
            <ul className="m-0 mt-1 flex list-none flex-col gap-1 p-0 pb-2">
              {tasks.map((t) => {
                const isDone = !!state.tasksFirstDone[t.id];
                const soon = t.id === 'sharing.publish';
                return (
                  <li key={t.id} className="flex items-center gap-3 rounded-xl bg-[var(--pf-tray)] px-3 py-2">
                    <MedalBadge family="task" id={t.id} earned={isDone} fill={g.fill} rim={g.rim} size={30} label="" />
                    <span className="min-w-0 flex-1 text-[14px]"><span className="font-semibold">{t.medal}</span> · {t.name}</span>
                    {isDone ? (
                      <span className="text-[13px] font-bold text-[var(--pf-done-ink)]">Done</span>
                    ) : soon ? (
                      <span className="text-[13px] text-[var(--pf-text2)]">Soon</span>
                    ) : (
                      <Link href={t.href} className="inline-flex min-h-[40px] items-center rounded-lg px-3 text-[14px] font-bold text-[var(--pf-accent-text)] hover:underline">Go</Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </details>
        );
      })}
    </section>
  );
}

/** "Watch an ad, get gems" (NETZ_LAUNCH_PLAN.md 6.4): free accounts where ads are allowed, 3 a day. */
function WatchAd({ state, today, signedIn }) {
  const allowed = useAdsAllowed();
  const [phase, setPhase] = useState('idle');
  const [message, setMessage] = useState('');
  if (!allowed || !REWARDED_UNIT || !signedIn) return null;
  const left = adRewardsLeft(state, today);

  const watch = async () => {
    setPhase('playing');
    setMessage('');
    const result = await playRewarded();
    if (result === 'granted') {
      const claim = await claimAdReward();
      setMessage(claim.ok ? `+${AD_REWARD.gems} gems. Thanks for watching!` : 'The gems could not be added just now. Please try again later.');
    } else if (result === 'closed') {
      setMessage('Watch to the end to get the gems.');
    } else if (result === 'blocked') {
      setMessage('The ad could not load. An ad blocker may be stopping it.');
    } else {
      setMessage('No ad is available right now. Try again later.');
    }
    setPhase('idle');
  };

  return (
    <div className="flex flex-col gap-1">
      <button type="button" className={BTN_QUIET} onClick={watch} disabled={left === 0 || phase === 'playing'}>
        {phase === 'playing' ? 'Loading the ad…' : left === 0 ? 'No more ad gems today' : `Watch an ad · +${AD_REWARD.gems} gems (${left} left today)`}
      </button>
      {message && <p className="m-0 text-[13px] text-[var(--pf-text2)]" role="status">{message}</p>}
    </div>
  );
}

function Gems({ summary, state, today, signedIn, className, onOpenShop }) {
  return (
    <section className={`pf-card p-5 md:p-6 flex flex-col gap-3 ${className}`} aria-labelledby="pf-gems">
      <h2 id="pf-gems" className="sr-only">Gems</h2>
      <div className="flex items-center gap-3">
        <GemIcon size={32} />
        <span className="pf-display text-[30px] font-bold">{summary.gems}</span>
        <span className="text-[14px] text-[var(--pf-text2)]">gems</span>
      </div>
      <div className="text-[14px] text-[var(--pf-text2)]">Today {summary.gemsToday} of {GEMS.dailyCap} from repeated tasks</div>
      <div className="h-2 overflow-hidden rounded-full bg-[var(--pf-tray)]" aria-hidden="true">
        <div className="h-full bg-[#FBAE3D]" style={{ width: `${Math.min(100, (summary.gemsToday / GEMS.dailyCap) * 100)}%` }} />
      </div>
      <button type="button" className={BTN_QUIET} onClick={() => onOpenShop('banners')}>Open shop: banners, freezes, skins, year badge</button>
      <WatchAd state={state} today={today} signedIn={signedIn} />
    </section>
  );
}

/** The student's plan: what it is, when it renews or ends, and cancelling the renewal (plan 5.4 step 5). */
function YourPlan({ userId }) {
  const status = useProStatus();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  if (!status?.pro) return null;

  const date = status.until ? formatDay(status.until.slice(0, 10)) : '';
  const line = status.lifetime ? 'Pro for life. Nothing more to pay.'
    : status.renews ? `Renews on ${date}.` : `Pro until ${date}. It will not renew.`;

  const cancel = async () => {
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch('/api/billing/cancel', { method: 'POST' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'failed');
      await refreshPro(userId, { force: true });
      setMessage(`Cancelled. You keep Pro until ${date}.`);
    } catch {
      setMessage('Could not cancel just now. Please try again, or email us from the Contact page.');
    } finally {
      setBusy(false);
      setConfirming(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-[#1A2B45] p-4" aria-labelledby="pf-plan">
      <div className="flex items-baseline justify-between gap-3">
        <h3 id="pf-plan" className="m-0 text-[15px] font-bold">Your plan: Pro {PLANS[status.plan]?.label.toLowerCase() || ''}</h3>
      </div>
      <p className="m-0 text-[14px] text-[#D8D8DC]">{line}</p>
      {status.renews && !confirming && (
        <button type="button" className={`${BTN} self-start border border-[#2B4570] bg-transparent text-[#F4F4F2] hover:bg-[#2B4570]`} onClick={() => setConfirming(true)}>
          Cancel renewal
        </button>
      )}
      {status.renews && confirming && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[14px]">Stop renewing? You keep Pro until {date}.</span>
          <button type="button" disabled={busy} className={`${BTN} bg-[#D55E64] text-white hover:brightness-105`} onClick={cancel}>{busy ? 'Cancelling…' : 'Yes, cancel'}</button>
          <button type="button" disabled={busy} className={`${BTN} bg-transparent text-[#F4F4F2] hover:bg-[#2B4570]`} onClick={() => setConfirming(false)}>Keep it</button>
        </div>
      )}
      {message && <p className="m-0 text-[13px] text-[#FBAE3D]" role="status">{message}</p>}
      <p className="m-0 text-[12px] text-[#B4B4BA]">Payments are not refunded; cancelling keeps Pro until the paid date. See <Link href="/Refund" className="underline">Refunds</Link>.</p>
    </div>
  );
}

function Pro({ state, today, userId, className }) {
  const pro = useIsPro();
  const year = today.slice(0, 4);
  const season = PRO_SEASONS[year];
  // A year without a season yet still shows the student's plan
  if (!season) {
    return pro ? (
      <section className={`rounded-[24px] border border-[#2B4570] bg-[#132034] p-5 md:p-6 text-[#F4F4F2] ${className}`} aria-label="NETZ Pro">
        <YourPlan userId={userId} />
      </section>
    ) : null;
  }
  const tasks = PRO_TASKS.filter((t) => t.id.startsWith(`pro.${year}.`));
  const done = state.proTasks?.[year] || {};
  const count = tasks.filter((t) => done[t.id]).length;
  const rewards = [
    [`${BANNER_BY_ID[season.banner]?.name || 'Season'} banner`, PRO_REWARD_AT.banner],
    [`${SKIN_BY_ID[season.skin]?.name || 'Season'} robot skin`, PRO_REWARD_AT.skin],
    [`${year} Pro medal`, PRO_REWARD_AT.medal],
  ];
  return (
    <section className={`rounded-[24px] border border-[#2B4570] bg-[#132034] p-5 md:p-6 flex flex-col gap-3 text-[#F4F4F2] ${className}`} aria-labelledby="pf-pro">
      <YourPlan userId={userId} />
      <div className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#FBAE3D]">Pro · Season 1 · {season.name}</div>
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="pf-pro" className="pf-display m-0 text-[21px] font-semibold">{tasks.length} Pro tasks in {year}</h2>
        <span className="pf-display font-semibold text-[#B4B4BA]">{count}/{tasks.length}</span>
      </div>
      <span className="h-2.5 overflow-hidden rounded-full bg-[#2B4570]" aria-hidden="true">
        <span className="block h-full rounded-full bg-[#FBAE3D]" style={{ width: `${(count / tasks.length) * 100}%` }} />
      </span>
      <ul className="m-0 flex list-none flex-col gap-2 p-0 text-[14px]">
        {rewards.map(([name, at]) => (
          <li key={name} className="flex justify-between">
            <span>{name}</span>
            <span className={count >= at ? 'font-bold text-[#FBAE3D]' : 'text-[#B4B4BA]'}>{count >= at ? 'Yours' : `at ${at}`}</span>
          </li>
        ))}
      </ul>
      <details className="group">
        <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between text-[14px] font-bold">
          See the {tasks.length} tasks
          <span className="text-[#B4B4BA] transition-transform group-open:rotate-90" aria-hidden="true">›</span>
        </summary>
        <ul className="m-0 flex list-none flex-col gap-1 p-0 pb-1">
          {tasks.map((t) => (
            <li key={t.id} className="flex items-center gap-2 rounded-xl bg-[#1A2B45] px-3 py-2 text-[13px]">
              <span className={done[t.id] ? 'text-[#86EFAC]' : 'text-[#6B7A99]'} aria-hidden="true">{done[t.id] ? '✓' : '○'}</span>
              <span className="min-w-0 flex-1">{t.name}</span>
              <span className="sr-only">{done[t.id] ? 'done' : 'not done yet'}</span>
            </li>
          ))}
        </ul>
      </details>
      <p className="m-0 text-[13px] text-[#B4B4BA]">
        {pro ? 'Pro tasks count while you have Pro. What you unlock is kept forever.' : 'For Pro members. What you unlock is kept forever, even after Pro ends.'}
      </p>
      {!pro && <Link href="/Pricing" className={`${BTN} bg-[#FBAE3D] text-[#141415] hover:brightness-105`}>See Pro plans</Link>}
    </section>
  );
}

function SaveProgress({ account, className }) {
  const { configured, user, loading, signIn, signOut } = account;
  const [busy, setBusy] = useState(false);

  if (user) {
    return (
      <section className={`pf-card p-5 md:p-6 flex flex-col gap-3 ${className}`} aria-labelledby="pf-save">
        <h2 id="pf-save" className="pf-display m-0 text-[20px] font-semibold">Saved to your account</h2>
        <p className="m-0 text-[14px] leading-relaxed text-[var(--pf-text2)]">
          Signed in as <span className="font-semibold text-[var(--pf-ink)]">{user.email}</span>. Your medals, streak and gems are kept safe and follow you to every device you sign in on.
        </p>
        <button type="button" className={BTN_QUIET} onClick={signOut}>Sign out</button>
      </section>
    );
  }

  const start = async () => {
    setBusy(true);
    try {
      await signIn();
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={`pf-card p-5 md:p-6 flex flex-col gap-3 ${className}`} aria-labelledby="pf-save">
      <h2 id="pf-save" className="pf-display m-0 text-[20px] font-semibold">Save your progress</h2>
      <p className="m-0 text-[14px] leading-relaxed text-[var(--pf-text2)]">
        Your medals, streak and gems live on this device. Sign in to keep them safe and use them on your other devices. What you have earned here comes with you.
      </p>
      {configured ? (
        <button type="button" className={`${BTN} border border-[var(--pf-line)] bg-white text-[#141415] hover:brightness-95`} onClick={start} disabled={busy || loading}>
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
          {busy ? 'Opening Google…' : 'Continue with Google'}
        </button>
      ) : (
        <button type="button" disabled className={BTN_SOON}>Continue with Google · soon</button>
      )}
    </section>
  );
}

/* ---------------- page ---------------- */

export default function ProfileView() {
  const snap = useProgress();
  const account = useAccount();
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  // Which shop tab is open, or null when the shop is closed
  const [shopTab, setShopTab] = useState(null);

  // First visit: open the onboarding by itself once
  useEffect(() => {
    if (!snap) return;
    const { state } = snap;
    if (!state.onboarding['onboard.meet-robot'] && !state.onboardingSeen) setOnboardingOpen(true);
  }, [snap]);

  const closeOnboarding = (finished) => {
    setOnboardingOpen(false);
    if (!finished) {
      markOnboardingSeen();
      window.dispatchEvent(new CustomEvent(PROGRESS_EVENT, { detail: { kind: 'onboarding.closed', events: [] } }));
    }
  };

  return (
    <div className={`pf ${PF_FONT} min-h-screen w-full`}>
      <main className="md:ml-[80px] mx-auto flex max-w-[1240px] flex-col gap-6 px-4 py-5 md:px-8 md:py-8">
        {!snap ? (
          <div className="pf-card h-[320px]" aria-busy="true" aria-label="Loading your profile" />
        ) : (
          <>
            <Header summary={snap.summary} robotName={snap.state.robotName} signedIn={!!account.user} bannerId={equippedBanner(snap.state)} skinId={equippedSkin(snap.state)} onOpenShop={setShopTab} />
            <GettingStarted state={snap.state} onMeetRobot={() => setOnboardingOpen(true)} account={account} />
            <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start">
              <div className="contents lg:flex lg:flex-col lg:gap-6">
                <Today summary={snap.summary} className="order-1" />
                <MedalCase state={snap.state} today={snap.today} className="order-3" />
                <AllTasks state={snap.state} className="order-4" />
                {/* Profile's one ad, below the tasks (plan 6.2) */}
                <AdSlot place="profile" className="order-4" />
              </div>
              <div className="contents lg:flex lg:flex-col lg:gap-6">
                <Streak state={snap.state} summary={snap.summary} today={snap.today} className="order-2" />
                <Gems summary={snap.summary} state={snap.state} today={snap.today} signedIn={!!account.user} className="order-5" onOpenShop={setShopTab} />
                <Pro state={snap.state} today={snap.today} userId={account.user?.id || null} className="order-6" />
                <SaveProgress account={account} className="order-7" />
              </div>
            </div>
          </>
        )}
      </main>
      {shopTab && snap && (
        <ShopDialog state={snap.state} account={account} initialTab={shopTab} onClose={() => setShopTab(null)} />
      )}
      {onboardingOpen && snap && (
        <OnboardingDialog
          initial={{ robotName: snap.state.robotName, displayName: snap.state.displayName, units: snap.state.units }}
          onClose={closeOnboarding}
        />
      )}
    </div>
  );
}

