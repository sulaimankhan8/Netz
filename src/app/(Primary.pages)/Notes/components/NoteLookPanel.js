'use client';

import { useRef, useState } from 'react';
import { LuCircleDashed, LuImagePlus, LuPalette } from 'react-icons/lu';
import { BADGES, BannerFill, COVER_ART, COVER_PATTERNS, CoverArt, LINE_ICONS, LOOK_COLOURS, MATHS_FONT, MATHS_SYMBOLS, MAX_BADGES, STATUSES, badgesOf, coverStyle, lookColour, lookOf } from '../utils/noteLook';
import { deleteBannerImage, saveBannerImage } from '../utils/imageStore';
import { BTN_SECONDARY, FIELD, FIELD_INPUT, Popover, Segmented, TOUCH, useCoarsePointer } from './ui';

const LABEL = 'text-xs font-semibold text-nt-text2';
const SECTION = 'flex flex-col gap-2.5 px-4 py-3.5 border-t border-nt-line';
const REMOVE = `h-7 ${TOUCH} px-2 rounded-lg text-xs font-semibold text-nt-danger hover:bg-nt-danger-tint`;

/** A colour swatch: a dot in a 36 px button (44 on touch); the chosen one has a ring. */
function Swatch({ colour, name, chosen, onPick, tint = false }) {
  const c = lookColour(colour);
  return (
    <button
      type="button"
      onClick={onPick}
      aria-label={name}
      aria-pressed={chosen}
      title={name}
      className={`w-8 h-8 ${TOUCH} shrink-0 inline-flex items-center justify-center rounded-full`}
    >
      <span
        className="block w-6 h-6 rounded-full"
        style={{
          background: tint ? c.tint : c.dot,
          boxShadow: [tint ? `inset 0 0 0 1px ${c.fg}` : null, chosen ? '0 0 0 2px rgb(var(--nt-surface)), 0 0 0 4px rgb(var(--nt-ink))' : null].filter(Boolean).join(', ') || undefined
        }}
      />
    </button>
  );
}

function NoneSwatch({ chosen, onPick, label }) {
  return (
    <button type="button" onClick={onPick} aria-label={label} aria-pressed={chosen} title={label} className={`w-8 h-8 ${TOUCH} shrink-0 inline-flex items-center justify-center rounded-full text-nt-text2`}>
      <span className="w-6 h-6 rounded-full flex items-center justify-center" style={{ boxShadow: chosen ? '0 0 0 2px rgb(var(--nt-surface)), 0 0 0 4px rgb(var(--nt-ink))' : undefined }}>
        <LuCircleDashed className="w-6 h-6" aria-hidden="true" />
      </span>
    </button>
  );
}

/**
 * Note look: the note's colour, icon (maths symbols, line icons or up to two letters), cover
 * pattern, status, and the colours of its tags. Everything is optional and saved at once.
 */
export default function NoteLookPanel({ note, onUpdateNote, tagColours, onSetTagColour, anchorRef, onClose, isPhone }) {
  const look = lookOf(note);
  const coarse = useCoarsePointer();
  const colour = look.colour || 'grey';
  const c = lookColour(colour);
  const [iconTab, setIconTab] = useState(look.icon?.kind || 'maths');
  const [letters, setLetters] = useState(look.icon?.kind === 'letters' ? look.icon.value : '');
  const tags = note.tags || [];
  // Touch screens use 44 px swatches, so the colour rows wrap to two lines of five
  const narrow = isPhone || coarse;
  const [tagPicked, setTagPicked] = useState(tags[0] || null);

  const setLook = (part) => {
    // The first icon or banner brings a colour with it, so it shows at once
    const next = { ...(note.look || {}), ...part };
    if (!next.colour && (part.icon || part.cover)) next.colour = 'blue';
    onUpdateNote({ ...note, look: next });
  };

  // Banner: a picture that is replaced or removed is deleted from this device
  const [coverTab, setCoverTab] = useState(look.cover?.kind || 'pattern');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileRef = useRef(null);
  const setCover = (cover) => {
    const old = look.cover;
    setLook({ cover });
    if (old?.kind === 'image' && !(cover?.kind === 'image' && cover.value === old.value)) deleteBannerImage(old.value);
  };
  const handlePicture = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const id = await saveBannerImage(file);
      setCover({ kind: 'image', value: id });
    } catch (err) {
      setUploadError(err.message || 'Could not keep this picture.');
    } finally {
      setUploading(false);
    }
  };

  // Badges: up to four
  const badges = badgesOf(note);
  const toggleBadge = (id) => {
    const next = badges.includes(id) ? badges.filter((b) => b !== id) : [...badges, id].slice(0, MAX_BADGES);
    onUpdateNote({ ...note, badges: next });
  };

  const iconChosen = (kind, value) => look.icon?.kind === kind && look.icon?.value === value;
  const iconButton = (chosen) =>
    `w-10 h-10 ${TOUCH} inline-flex items-center justify-center rounded-[10px] transition-colors ${chosen ? '' : 'hover:bg-nt-tray'}`;
  const chosenStyle = (chosen) => ({ color: c.fg, background: chosen ? c.tint : undefined, boxShadow: chosen ? `inset 0 0 0 2px ${c.fg}` : undefined });

  return (
    <Popover
      title="Note look"
      onClose={onClose}
      anchorRef={anchorRef}
      isPhone={isPhone}
      icon={
        <span className="w-7 h-7 rounded-lg inline-flex items-center justify-center" style={{ background: c.tint, color: c.fg }} aria-hidden="true">
          <LuPalette className="w-4 h-4" />
        </span>
      }
    >
      <div className={isPhone ? 'pb-6' : ''} data-note-look>
        {/* Note colour */}
        <section className={SECTION} aria-label="Note colour">
          <div className="flex items-center justify-between">
            <span className={LABEL}>Note colour</span>
            <span className="text-xs text-nt-text2">{look.colour ? LOOK_COLOURS.find((x) => x.id === look.colour)?.name : 'None'}</span>
          </div>
          <div className={`grid justify-items-center -mx-1 ${narrow ? 'grid-cols-5 gap-y-1' : 'grid-cols-10'}`}>
            <NoneSwatch label="No colour" chosen={!look.colour} onPick={() => onUpdateNote({ ...note, look: { ...(note.look || {}), colour: null } })} />
            {LOOK_COLOURS.map((x) => (
              <Swatch key={x.id} colour={x.id} name={x.name} chosen={look.colour === x.id} onPick={() => setLook({ colour: x.id })} />
            ))}
          </div>
        </section>

        {/* Icon */}
        <section className={SECTION} aria-label="Icon">
          <div className="flex items-center justify-between">
            <span className={LABEL}>Icon</span>
            {look.icon && (
              <button type="button" onClick={() => setLook({ icon: null })} className={REMOVE}>
                Remove
              </button>
            )}
          </div>
          <Segmented
            label="Icon kind"
            value={iconTab}
            onChange={setIconTab}
            options={[
              { value: 'maths', label: 'Maths' },
              { value: 'icon', label: 'Icons' },
              { value: 'letters', label: 'Letters' }
            ]}
          />
          {iconTab === 'maths' && (
            <div className="grid grid-cols-7 gap-1 justify-items-center">
              {MATHS_SYMBOLS.map((s) => {
                const chosen = iconChosen('maths', s);
                return (
                  <button key={s} type="button" aria-label={`Symbol ${s}`} aria-pressed={chosen} onClick={() => setLook({ icon: { kind: 'maths', value: s } })} className={iconButton(chosen)} style={chosenStyle(chosen)}>
                    <span style={{ fontFamily: MATHS_FONT, fontStyle: 'italic', fontSize: 21, lineHeight: 1 }}>{s}</span>
                  </button>
                );
              })}
            </div>
          )}
          {iconTab === 'icon' && (
            <div className="grid grid-cols-7 gap-1 justify-items-center">
              {LINE_ICONS.map((i) => {
                const chosen = iconChosen('icon', i.id);
                return (
                  <button key={i.id} type="button" aria-label={i.name} aria-pressed={chosen} title={i.name} onClick={() => setLook({ icon: { kind: 'icon', value: i.id } })} className={iconButton(chosen)} style={chosenStyle(chosen)}>
                    <i.Icon className="w-5 h-5" aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          )}
          {iconTab === 'letters' && (
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const v = letters.trim();
                if (v) setLook({ icon: { kind: 'letters', value: v } });
              }}
            >
              <label className={`${FIELD} flex-1`}>
                <input
                  type="text"
                  value={letters}
                  maxLength={2}
                  aria-label="Up to two letters or numbers"
                  placeholder="e.g. U1"
                  onChange={(e) => {
                    const v = e.target.value.replace(/\s/g, '').slice(0, 2);
                    setLetters(v);
                    if (v) setLook({ icon: { kind: 'letters', value: v } });
                  }}
                  className={`${FIELD_INPUT} font-semibold`}
                />
              </label>
              <span className="text-xs text-nt-text2">Up to 2</span>
            </form>
          )}
        </section>

        {/* Banner: a pattern, built-in art, or a picture from this device */}
        <section className={SECTION} aria-label="Banner">
          <div className="flex items-center justify-between">
            <span className={LABEL}>Banner</span>
            {look.cover && (
              <button type="button" onClick={() => setCover(null)} className={REMOVE}>
                Remove
              </button>
            )}
          </div>
          <Segmented
            label="Banner kind"
            value={coverTab}
            onChange={setCoverTab}
            options={[
              { value: 'pattern', label: 'Patterns' },
              { value: 'art', label: 'Art' },
              { value: 'image', label: 'Picture' }
            ]}
          />
          {coverTab === 'pattern' && (
            <div className="grid grid-cols-4 gap-1.5">
              {COVER_PATTERNS.map((p) => {
                const chosen = look.cover?.kind === 'pattern' && look.cover.value === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    aria-pressed={chosen}
                    onClick={() => setCover({ kind: 'pattern', value: p.id })}
                    className="h-12 rounded-[10px] flex items-end justify-center pb-1 text-[11px] font-semibold"
                    style={{ ...coverStyle(colour, p.id, 0.55), color: c.fg, boxShadow: chosen ? `inset 0 0 0 2px ${c.fg}` : undefined }}
                  >
                    {p.name}
                  </button>
                );
              })}
            </div>
          )}
          {coverTab === 'art' && (
            <div className="grid grid-cols-2 gap-1.5">
              {COVER_ART.map((a) => {
                const chosen = look.cover?.kind === 'art' && look.cover.value === a.id;
                return (
                  <button
                    key={a.id}
                    type="button"
                    aria-pressed={chosen}
                    aria-label={`${a.name} art`}
                    onClick={() => setCover({ kind: 'art', value: a.id })}
                    className="relative h-14 rounded-[10px] overflow-hidden"
                    style={{ boxShadow: chosen ? `inset 0 0 0 2px ${c.fg}` : undefined }}
                  >
                    <CoverArt id={a.id} colour={colour} />
                    <span className="absolute left-1.5 bottom-1 px-1.5 rounded-md text-[11px] font-semibold" style={{ background: 'rgb(var(--nt-surface) / 0.85)', color: c.fg }}>
                      {a.name}
                    </span>
                    {chosen && <span className="absolute inset-0 rounded-[10px] pointer-events-none" style={{ boxShadow: `inset 0 0 0 2px ${c.fg}` }} />}
                  </button>
                );
              })}
            </div>
          )}
          {coverTab === 'image' && (
            <div className="flex flex-col gap-2">
              <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={handlePicture} aria-label="Choose a banner picture" />
              {look.cover?.kind === 'image' ? (
                <div className="flex items-center gap-2.5">
                  <span className="block w-28 h-14 rounded-[10px] overflow-hidden shrink-0">
                    <BannerFill cover={look.cover} colour={colour} />
                  </span>
                  <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className={`${BTN_SECONDARY} !h-9 flex-1`}>
                    <LuImagePlus className="w-4 h-4" aria-hidden="true" />
                    {uploading ? 'Saving…' : 'Replace'}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="h-20 rounded-xl border-[1.5px] border-dashed flex flex-col items-center justify-center gap-1 text-[13px] font-semibold transition-colors hover:bg-nt-tray"
                  style={{ borderColor: c.fg, color: c.fg }}
                >
                  <LuImagePlus className="w-5 h-5" aria-hidden="true" />
                  {uploading ? 'Saving the picture…' : 'Choose a picture'}
                </button>
              )}
              <p className="m-0 text-xs text-nt-text2">JPG, PNG or WebP, up to 15 MB. Kept on this device for now; it will sync once accounts arrive.</p>
              {uploadError && (
                <p className="m-0 text-xs font-semibold text-nt-danger" role="alert">
                  {uploadError}
                </p>
              )}
            </div>
          )}
        </section>

        {/* Badges: up to four, shown in the banner's corner */}
        <section className={SECTION} aria-label="Badges">
          <div className="flex items-center justify-between">
            <span className={LABEL}>Badges</span>
            <span className="text-xs text-nt-text2 tabular-nums">
              {badges.length} of {MAX_BADGES}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {BADGES.map((b) => {
              const on = badges.includes(b.id);
              const bc = lookColour(b.colour);
              const full = !on && badges.length >= MAX_BADGES;
              return (
                <button
                  key={b.id}
                  type="button"
                  aria-pressed={on}
                  disabled={full}
                  onClick={() => toggleBadge(b.id)}
                  className={`h-9 ${TOUCH} flex items-center gap-2 px-2.5 rounded-xl text-[13px] font-medium text-left transition-colors disabled:opacity-40 disabled:cursor-default ${on ? '' : 'hover:bg-nt-tray'}`}
                  style={on ? { background: bc.tint, color: bc.fg, boxShadow: `inset 0 0 0 2px ${bc.fg}` } : undefined}
                >
                  <b.Icon className="w-4 h-4 shrink-0" style={{ color: bc.fg }} aria-hidden="true" />
                  <span className="truncate">{b.name}</span>
                </button>
              );
            })}
          </div>
          {badges.length >= MAX_BADGES && <p className="m-0 text-xs text-nt-text2">Four is the most. Take one off to add another.</p>}
        </section>

        {/* Status */}
        <section className={SECTION} aria-label="Status">
          <span className={LABEL}>Status</span>
          <div className="grid grid-cols-2 gap-1.5">
            {STATUSES.map((s) => {
              const sc = lookColour(s.colour);
              const chosen = note.status === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={chosen}
                  onClick={() => onUpdateNote({ ...note, status: chosen ? null : s.id })}
                  className={`h-9 ${TOUCH} inline-flex items-center justify-center gap-1.5 rounded-full text-[13px] font-semibold`}
                  style={{ background: sc.tint, color: sc.fg, boxShadow: chosen ? `inset 0 0 0 2px ${sc.fg}` : undefined }}
                >
                  <s.Icon className="w-[15px] h-[15px]" aria-hidden="true" />
                  {s.name}
                </button>
              );
            })}
          </div>
          {note.status && (
            <button type="button" onClick={() => onUpdateNote({ ...note, status: null })} className={`self-start h-8 ${TOUCH} px-2 -ml-2 rounded-lg text-[13px] font-medium text-nt-text2 hover:bg-nt-tray`}>
              No status
            </button>
          )}
        </section>

        {/* Tag colours */}
        <section className={`${SECTION} pb-4`} aria-label="Tag colours">
          <span className={LABEL}>Tag colours</span>
          {tags.length === 0 ? (
            <p className="m-0 text-[13px] text-nt-text2">Add tags to this note to give them colours.</p>
          ) : (
            <>
              <div className="flex flex-wrap gap-1.5" role="group" aria-label="Tag">
                {tags.map((t) => {
                  const tc = lookColour(tagColours[t] || 'grey');
                  const on = t === tagPicked;
                  return (
                    <button
                      key={t}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setTagPicked(t)}
                      className={`h-8 ${TOUCH} px-3 rounded-full text-[13px] font-medium`}
                      style={{ background: tc.tint, color: tc.fg, boxShadow: on ? '0 0 0 2px rgb(var(--nt-surface)), 0 0 0 4px rgb(var(--nt-accent))' : undefined }}
                    >
                      # {t}
                    </button>
                  );
                })}
              </div>
              {tagPicked && (
                <div className={`grid justify-items-center -mx-1 ${narrow ? 'grid-cols-5 gap-y-1' : 'grid-cols-9'}`}>
                  <NoneSwatch label={`No colour for ${tagPicked}`} chosen={!tagColours[tagPicked]} onPick={() => onSetTagColour(tagPicked, null)} />
                  {LOOK_COLOURS.filter((x) => x.id !== 'grey').map((x) => (
                    <Swatch key={x.id} tint colour={x.id} name={`${x.name} for ${tagPicked}`} chosen={tagColours[tagPicked] === x.id} onPick={() => onSetTagColour(tagPicked, x.id)} />
                  ))}
                </div>
              )}
              <p className="m-0 text-xs text-nt-text2">A tag has one colour in every note.</p>
            </>
          )}
        </section>
      </div>
    </Popover>
  );
}
