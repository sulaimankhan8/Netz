'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { IconDownload } from './icons';

/*
 * One shared store for the browser's install prompt, so every Install button on the page uses the
 * same saved event. Chrome, Edge and Android fire beforeinstallprompt; iPhone, iPad, Safari and
 * Firefox never do, so they get a short hint instead.
 */
let deferredPrompt = null;
let installed = false;
let version = 0;
const listeners = new Set();

function emit() {
  version += 1;
  listeners.forEach((listener) => listener());
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    emit();
  });
  window.addEventListener('appinstalled', () => {
    installed = true;
    deferredPrompt = null;
    emit();
  });
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function isStandalone() {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

function isAppleTouch() {
  const ua = window.navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) || (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
}

export function useInstall() {
  useSyncExternalStore(subscribe, () => version, () => 0);
  const [env, setEnv] = useState({ ready: false, standalone: false, apple: false });

  useEffect(() => {
    setEnv({ ready: true, standalone: isStandalone(), apple: isAppleTouch() });
  }, []);

  const prompt = useCallback(async () => {
    if (!deferredPrompt) return false;
    const event = deferredPrompt;
    deferredPrompt = null;
    event.prompt();
    const { outcome } = await event.userChoice;
    if (outcome === 'accepted') installed = true;
    emit();
    return true;
  }, []);

  return {
    ready: env.ready,
    installed: installed || env.standalone,
    canPrompt: Boolean(deferredPrompt),
    hint: env.apple
      ? 'On iPhone or iPad: tap Share, then Add to Home Screen.'
      : 'Use your browser menu: Install app (Chrome, Edge) or Add to Home Screen.',
    prompt,
  };
}

/**
 * Install button. Opens the browser's install prompt when there is one; otherwise shows a short
 * hint. Hidden once NETZ runs as an installed app.
 */
export default function InstallButton({ className = 'ld-btn ld-btn-secondary ld-btn-sm', hintUp = false, label = 'Install app', icon = true }) {
  const { ready, installed: isInstalled, canPrompt, hint, prompt } = useInstall();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      if (event.type === 'keydown' && event.key !== 'Escape') return;
      if (event.type === 'pointerdown' && wrapRef.current?.contains(event.target)) return;
      setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  if (ready && isInstalled) return null;

  const onClick = async () => {
    if (canPrompt) {
      await prompt();
      return;
    }
    setOpen((value) => !value);
  };

  return (
    <span className="ld-install" ref={wrapRef}>
      <button type="button" className={className} onClick={onClick} aria-expanded={canPrompt ? undefined : open}>
        {icon && <IconDownload />}
        {label}
      </button>
      {open && (
        <span role="status" className={`ld-install-hint${hintUp ? ' is-up' : ''}`}>
          {hint}
        </span>
      )}
    </span>
  );
}
