'use client';

import { useEffect, useState } from 'react';
import { ASSETS_EVENT, assetUrl, getAsset } from '../utils/assetStore';

/** The library record for an id (null while loading or when it is not on this device). Follows changes. */
export function useAssetRecord(id) {
  const [record, setRecord] = useState(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    let alive = true;
    const load = () => getAsset(id).then((r) => {
      if (!alive) return;
      setRecord(r && !r.deletedAt ? r : null);
      setLoaded(true);
    });
    load();
    const onChange = (e) => {
      if (!e.detail?.id || e.detail.id === id) load();
    };
    window.addEventListener(ASSETS_EVENT, onChange);
    return () => {
      alive = false;
      window.removeEventListener(ASSETS_EVENT, onChange);
    };
  }, [id]);
  return { record, loaded };
}

/** An object URL for an item's preview (or main file), or `fallback` (e.g. the note's own small copy). */
export function useAssetUrl(id, part = 'preview', fallback = '', updatedAt = 0) {
  const [url, setUrl] = useState(fallback || '');
  useEffect(() => {
    let alive = true;
    if (!id) return undefined;
    assetUrl(id, part)
      .then((u) => {
        if (alive && u) setUrl(u);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [id, part, updatedAt]);
  useEffect(() => {
    if (fallback && !url) setUrl(fallback);
  }, [fallback, url]);
  return url;
}
