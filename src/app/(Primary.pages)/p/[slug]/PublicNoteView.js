'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LuCopy, LuLightbulb } from 'react-icons/lu';
import KaTeXRenderer from '../../Notes/components/KaTeXRenderer';
import EmbeddedMathWidget from '../../Notes/components/EmbeddedMathWidget';
import QuizBlock from '../../Notes/components/QuizBlock';
import { BannerFill, NoteIcon, lookOf } from '../../Notes/utils/noteLook';
import { generateAccessKey, saveSingleNote } from '../../Notes/utils/noteStorage';
import { NT_FONT } from '../../Notes/utils/fonts';
import Banner from '@/app/components/mascot/banners';
import { RobotHead } from '@/app/components/mascot/art';

const noop = () => {};
const BTN = 'inline-flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-xl text-[15px] font-semibold transition-colors';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** A sketch shown only as an image, so nothing in it can run in a visitor's browser. */
function sketchSrc(content) {
  if (typeof content !== 'string') return null;
  if (content.startsWith('data:image/') || content.startsWith('https://')) return content;
  if (content.trim().startsWith('<svg')) return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(content)}`;
  return null;
}

function Block({ block }) {
  const text = typeof block.content === 'string' ? block.content : '';
  switch (block.type) {
    case 'heading1':
      return <h2 className="m-0 pt-4 text-[26px] md:text-[28px] leading-9 font-bold">{text}</h2>;
    case 'heading2':
      return <h3 className="m-0 pt-3 text-[21px] md:text-[22px] leading-[30px] font-semibold">{text}</h3>;
    case 'heading3':
      return <h4 className="m-0 pt-2 text-lg leading-[26px] font-semibold">{text}</h4>;
    case 'paragraph':
      return text ? <p className="m-0 text-base md:text-[17px] leading-[27px] whitespace-pre-wrap">{text}</p> : null;
    case 'math':
      return text ? (
        <div className="rounded-2xl bg-nt-math-tint min-h-[96px] px-4 py-4 flex items-center justify-center overflow-x-auto">
          <KaTeXRenderer math={text} blockMode />
        </div>
      ) : null;
    case 'callout':
      return (
        <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-nt-callout-tint">
          <LuLightbulb className="w-[18px] h-[18px] text-nt-callout shrink-0 mt-[3px]" aria-hidden="true" />
          <p className="m-0 text-[15px] leading-6">{text}</p>
        </div>
      );
    case 'widget':
      return <EmbeddedMathWidget config={block.widgetConfig} onChange={noop} />;
    case 'quiz':
      return <QuizBlock block={block} onUpdate={noop} canEdit={false} />;
    case 'ink': {
      const src = sketchSrc(text);
      return src ? (
        <figure className="m-0 rounded-2xl border border-nt-line bg-nt-surface p-4 flex flex-col items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={block.caption || 'Sketch'} className="max-h-80 max-w-full object-contain rounded" />
          {block.caption && <figcaption className="text-[13px] text-nt-text2">{block.caption}</figcaption>}
        </figure>
      ) : null;
    }
    default:
      return null;
  }
}

export default function PublicNoteView({ note }) {
  const router = useRouter();
  const [copying, setCopying] = useState(false);
  const data = note.data || {};
  const look = lookOf(data);
  // Image covers live on the author's device only, so the author's banner stands in for them
  const ownCover = look.cover && look.cover.kind !== 'image';
  const blocks = Array.isArray(data.blocks) ? data.blocks : [];
  const subtitle = data.subtitle && data.subtitle !== 'Click to add description...' ? data.subtitle : '';
  const tags = Array.isArray(data.tags) ? data.tags.filter((t) => typeof t === 'string').slice(0, 6) : [];
  const updated = note.updatedAt && Date.parse(note.updatedAt) - Date.parse(note.publishedAt) > 60 * 1000;

  const copyToMyNotes = () => {
    setCopying(true);
    const now = new Date().toISOString();
    const id = `note-${Date.now()}`;
    saveSingleNote({
      ...data,
      id,
      accessKey: generateAccessKey(),
      createdAt: now,
      updatedAt: now,
      isPublic: false,
      author: 'User',
      copiedFrom: note.slug,
    }, { report: false });
    router.push(`/Notes?open=${encodeURIComponent(id)}`);
  };

  const copyButton = (extra = '') => (
    <button type="button" onClick={copyToMyNotes} disabled={copying} className={`${BTN} bg-nt-accent-fill text-white hover:bg-nt-accent-fill/90 ${extra}`}>
      <LuCopy className="w-4 h-4" aria-hidden="true" />
      {copying ? 'Copying…' : 'Copy to my notes'}
    </button>
  );

  return (
    <div className={`${NT_FONT} min-h-screen w-full bg-nt-paper text-nt-ink`}>
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-nt-line bg-nt-surface px-4 md:px-8 py-2.5">
        <Link href="/" className="flex items-center gap-2 font-bold text-[20px]" aria-label="NETZ home">
          <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#132034]"><RobotHead size={28} title="" /></span>
          NETZ
        </Link>
        <span className="hidden md:block flex-1 text-[14px] text-nt-text2">Public note · read only</span>
        <span className="flex-1 md:hidden" />
        <Link href="/" className={`${BTN} border border-nt-line bg-nt-tray text-nt-ink hover:bg-nt-line`}>Open NETZ</Link>
        <span className="hidden md:inline-flex">{copyButton()}</span>
      </header>

      <main className="flex justify-center px-4 pt-5 md:pt-8 pb-32 md:pb-16">
        <article className="w-full max-w-[780px] flex flex-col gap-5">
          <div className="relative h-[130px] md:h-[180px] overflow-hidden rounded-[22px] border border-nt-line">
            {ownCover ? <BannerFill cover={look.cover} colour={look.colour} /> : <Banner id={note.author.banner} height="100%" decorative />}
          </div>

          <header className="flex flex-col gap-3">
            {tags.length > 0 && (
              <ul className="m-0 flex list-none flex-wrap gap-2 p-0" aria-label="Tags">
                {tags.map((t) => <li key={t} className="rounded-full bg-nt-tray px-2.5 py-1 text-[13px] font-semibold"># {t}</li>)}
              </ul>
            )}
            <div className="flex items-start gap-3">
              {look.icon && <NoteIcon note={data} size={44} placeholder={false} />}
              <h1 className="m-0 text-[30px] md:text-[40px] leading-tight font-bold">{note.title}</h1>
            </div>
            {subtitle && <p className="m-0 text-base md:text-[17px] text-nt-text2">{subtitle}</p>}
            <div className="flex items-center gap-3 pt-1">
              <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-[#132034]">
                <RobotHead size={34} skin={note.author.skin} title={note.author.robotName ? `${note.author.name}'s robot, ${note.author.robotName}` : `${note.author.name}'s robot`} />
              </span>
              <div className="flex flex-col">
                <span className="font-bold">{note.author.name}</span>
                <span className="text-[13px] text-nt-text2">
                  {note.author.medals} {note.author.medals === 1 ? 'medal' : 'medals'} · Published {formatDate(note.publishedAt)}{updated ? ` · updated ${formatDate(note.updatedAt)}` : ''}
                </span>
              </div>
            </div>
          </header>

          <div className="h-px bg-nt-line" />

          {blocks.map((block, i) => <Block key={block.id || i} block={block} />)}

          <aside className="mt-4 flex flex-col md:flex-row items-center gap-4 rounded-[22px] border border-[#2B4570] bg-[#132034] p-5 text-center md:text-left text-[#F4F4F2]">
            <svg width="72" height="78" viewBox="0 0 240 260" aria-hidden="true" className="flex-none">
              <ellipse cx="40" cy="94" rx="15" ry="24" fill="#F88F4A" /><ellipse cx="200" cy="94" rx="15" ry="24" fill="#F88F4A" />
              <rect x="72" y="144" width="90" height="70" rx="25" fill="#5E3463" /><rect x="128" y="158" width="24" height="40" rx="8" fill="#F88F4A" />
              <ellipse cx="99" cy="238" rx="18" ry="9" fill="#D55E64" /><ellipse cx="141" cy="238" rx="18" ry="9" fill="#D55E64" />
              <rect x="44" y="32" width="146" height="114" rx="38" fill="#5E3463" /><rect x="62" y="50" width="112" height="80" rx="26" fill="#141012" />
              <path d="M90 90 Q100 76 110 90 M130 90 Q140 76 150 90" stroke="#FBAE3D" strokeWidth="6" fill="none" strokeLinecap="round" />
            </svg>
            <div className="flex-1">
              <p className="m-0 text-[21px] font-semibold">Made with NETZ</p>
              <p className="m-0 text-[15px] text-[#B4B4BA]">Notes with live solvers, a handwriting whiteboard, streaks and medals. Free.</p>
            </div>
            <Link href="/" className={`${BTN} bg-[#FBAE3D] text-[#141415] hover:brightness-105`}>Start free</Link>
          </aside>
        </article>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-nt-line bg-nt-surface px-4 pt-3 md:hidden" style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))' }}>
        {copyButton('w-full')}
      </div>
    </div>
  );
}
