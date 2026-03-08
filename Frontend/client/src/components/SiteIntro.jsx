import { useRef, useEffect, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import './SiteIntro.css';

/* ══════════════════════════════════════════════════════
   NORSE VISIONS v7  —  simplified, clean
   One flicker stream: Norse symbols + O D I N shapes
   mixed together → blur-dissolve into site
   ══════════════════════════════════════════════════════ */

const SKETCHES = [
  /* ─── Norse symbols ─────────────────────────────── */

  /* Ravens — Huginn & Muninn */
  {
    id: 'ravens',
    paths: `
      <path d="M128 222 Q88 192 48 212 Q78 182 128 222" stroke-width="2"/>
      <path d="M128 222 Q108 242 100 270 Q113 250 136 267 Q130 244 128 222" stroke-width="2"/>
      <path d="M114 208 L106 200" stroke-width="2.2"/>
      <circle cx="116" cy="214" r="3.5" fill="none" stroke-width="1.5"/>
      <path d="M48 212 Q28 220 12 228" stroke-width="1.3"/>
      <path d="M272 222 Q312 192 352 212 Q322 182 272 222" stroke-width="2"/>
      <path d="M272 222 Q292 242 300 270 Q287 250 264 267 Q270 244 272 222" stroke-width="2"/>
      <path d="M286 208 L294 200" stroke-width="2.2"/>
      <circle cx="284" cy="214" r="3.5" fill="none" stroke-width="1.5"/>
      <path d="M352 212 Q372 220 388 228" stroke-width="1.3"/>
      <path d="M190 330 L200 320 L210 330" stroke-width="1.3"/>
    `,
  },

  /* ─── O — Ouroboros · serpent ring ─────────────── */
  {
    id: 'ouroboros',
    paths: `
      <g transform="translate(44 52) scale(0.78)">
      <circle cx="200" cy="235" r="148" stroke-width="2.2" fill="none"/>
      <path d="M200 86 Q205 72 218 68 Q220 82 214 90 Q208 82 200 86Z" stroke-width="1.8" fill="none"/>
      <circle cx="210" cy="74" r="4" stroke-width="1.5" fill="none"/>
      <path d="M200 384 Q192 395 184 400 Q188 410 198 408 Q208 406 210 395 Q208 386 200 384Z" stroke-width="1.8" fill="none"/>
      <path d="M62 308 Q54 316 52 326" stroke-width="2" stroke-linecap="round"/>
      <path d="M74 340 Q68 348 70 358" stroke-width="2" stroke-linecap="round"/>
      <path d="M98 364 Q94 374 98 384" stroke-width="2" stroke-linecap="round"/>
      <path d="M132 378 Q130 388 134 396" stroke-width="1.8" stroke-linecap="round"/>
      </g>
    `,
  },

  /* Sacrifice · 9 Nights */
  {
    id: 'sacrifice',
    paths: `
      <path d="M200 75 L200 425" stroke-width="2.5"/>
      <path d="M200 130 Q132 100 80 112 M200 130 Q268 100 323 108" stroke-width="2"/>
      <path d="M200 158 L200 176" stroke-width="1.5"/>
      <ellipse cx="200" cy="197" rx="23" ry="29" stroke-width="2" fill="none"/>
      <path d="M177 218 L161 268 M223 218 L239 268" stroke-width="2"/>
      <path d="M177 244 L163 252 M223 244 L237 252" stroke-width="1.5"/>
      <path d="M161 268 L149 322 M239 268 L251 322" stroke-width="2"/>
      <path d="M200 158 L175 196 M200 158 L225 196" stroke-width="1.3"/>
    `,
  },

  /* ─── D — Viking Longship · curved hull arc ─────── */
  {
    id: 'longship',
    paths: `
      <g transform="translate(44 52) scale(0.78)">
      <path d="M100 100 Q310 100 318 240 Q310 380 100 380" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <path d="M100 100 L100 380" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <path d="M100 240 L190 240" stroke-width="1.6" fill="none"/>
      <path d="M190 98 L190 288" stroke-width="1.6" fill="none"/>
      <path d="M190 98 Q218 106 244 98" stroke-width="1.5" fill="none"/>
      <path d="M148 380 Q168 392 188 382" stroke-width="1.5" fill="none"/>
      <path d="M126 158 Q138 152 150 158" stroke-width="1.5" fill="none"/>
      <path d="M126 188 Q138 182 150 188" stroke-width="1.5" fill="none"/>
      <path d="M130 322 Q142 316 154 322" stroke-width="1.5" fill="none"/>
      </g>
    `,
  },

  /* Valknut */
  {
    id: 'valknut',
    paths: `
      <path d="M200 130 L252 218 L148 218 Z" stroke-width="2.2" fill="none"/>
      <path d="M165 224 L217 312 L113 312 Z" stroke-width="2.2" fill="none"/>
      <path d="M235 224 L287 312 L183 312 Z" stroke-width="2.2" fill="none"/>
      <path d="M148 218 L113 312 M252 218 L287 312" stroke-width="1.8"/>
      <path d="M113 312 L183 312 M217 312 L287 312" stroke-width="1.8"/>
    `,
  },

  /* ─── I — Gungnir rune-pillar · tall I-beam ─────── */
  {
    id: 'gungnir-i',
    paths: `
      <g transform="translate(44 52) scale(0.78)">
      <path d="M148 88 L252 88" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M200 88 L200 392" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M148 392 L252 392" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M200 88 L226 144 L200 138 L174 144 Z" stroke-width="1.8" fill="none"/>
      <path d="M172 192 L144 192 M172 212 L136 212 M172 232 L144 232" stroke-width="1.5"/>
      <path d="M228 272 L256 272 M228 292 L264 292 M228 312 L256 312" stroke-width="1.5"/>
      <circle cx="200" cy="106" r="4" stroke-width="1.5" fill="none"/>
      </g>
    `,
  },

  /* Geri & Freki — twin wolves */
  {
    id: 'wolves',
    paths: `
      <path d="M80 260 Q70 228 75 198 Q85 183 100 193 Q112 186 120 198 Q130 190 140 198 Q150 190 158 202" stroke-width="2"/>
      <path d="M75 198 L65 183 L72 181 L68 168 L78 173 L83 163 L91 173" stroke-width="1.6"/>
      <path d="M158 202 Q168 215 164 240 Q160 260 147 270 Q132 278 117 270 Q102 278 90 268 Q80 260 80 260" stroke-width="2"/>
      <circle cx="90" cy="195" r="3.5" fill="none" stroke-width="1.3"/>
      <path d="M320 260 Q330 228 325 198 Q315 183 300 193 Q288 186 280 198 Q270 190 260 198 Q250 190 242 202" stroke-width="2"/>
      <path d="M325 198 L335 183 L328 181 L332 168 L322 173 L317 163 L309 173" stroke-width="1.6"/>
      <path d="M242 202 Q232 215 236 240 Q240 260 253 270 Q268 278 283 270 Q298 278 310 268 Q320 260 320 260" stroke-width="2"/>
      <circle cx="310" cy="195" r="3.5" fill="none" stroke-width="1.3"/>
    `,
  },

  /* ─── N — N-Stave · double uprights + diagonal ──── */
  {
    id: 'n-stave',
    paths: `
      <g transform="translate(44 52) scale(0.78)">
      <path d="M118 88 L118 392" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M282 88 L282 392" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M118 88 L282 300" stroke-width="2" stroke-linecap="round"/>
      <circle cx="118" cy="88" r="7" stroke-width="1.8" fill="none"/>
      <circle cx="282" cy="88" r="7" stroke-width="1.8" fill="none"/>
      <circle cx="118" cy="392" r="7" stroke-width="1.8" fill="none"/>
      <circle cx="282" cy="392" r="7" stroke-width="1.8" fill="none"/>
      <path d="M97 142 L78 142 M97 174 L72 174" stroke-width="1.5"/>
      <path d="M303 268 L322 268 M303 298 L328 298" stroke-width="1.5"/>
      </g>
    `,
  },

  /* Mimir's Well · eye of wisdom — last hold */
  {
    id: 'mimirs-well',
    paths: `
      <ellipse cx="200" cy="310" rx="92" ry="32" stroke-width="2.2" fill="none"/>
      <path d="M108 310 L108 370 Q108 396 200 396 Q292 396 292 370 L292 310" stroke-width="2.2"/>
      <ellipse cx="200" cy="268" rx="20" ry="25" stroke-width="2" fill="none"/>
      <circle cx="200" cy="268" r="7" stroke-width="1.8" fill="none"/>
      <path d="M200 100 L200 242" stroke-width="2"/>
      <path d="M200 100 Q260 132 302 118 M200 100 Q140 132 98 118" stroke-width="1.6"/>
      <path d="M138 322 Q160 338 200 340 Q240 338 262 322" stroke-width="1.3"/>
    `,
  },
];

const HOLD_TIMES = [0.16, 0.11, 0.18, 0.13, 0.15, 0.12, 0.20, 0.14];

export default function SiteIntro() {
  const [visible, setVisible] = useState(true);

  const rootRef    = useRef(null);
  const sketchRef  = useRef(null);
  const hintRef    = useRef(null);
  const isExiting  = useRef(false);
  const flickerTL  = useRef(null);
  const autoTimer  = useRef(null);

  /* ── Skip if seen ── */
  useEffect(() => {
    if (sessionStorage.getItem('odin_intro_v10')) setVisible(false);
  }, []);

  /* ── Scroll lock ── */
  useEffect(() => {
    if (!visible) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [visible]);

  /* ── Flicker sequence ── */
  useEffect(() => {
    if (!visible) return;
    const el = sketchRef.current;
    if (!el) return;

    gsap.set(el, { opacity: 0 });
    gsap.set(hintRef.current, { opacity: 0 });

    const tl = gsap.timeline();
    flickerTL.current = tl;

    tl.to({}, { duration: 0.18 });

    SKETCHES.forEach((sketch, i) => {
      const isLast = i === SKETCHES.length - 1;
      const hold   = HOLD_TIMES[i % HOLD_TIMES.length];

      tl.call(() => { el.innerHTML = sketch.paths; });

      if (!isLast) {
        /* Fast flicker — snap on, hold briefly, snap off */
        tl.to(el, { opacity: 0.88, duration: 0.04, ease: 'none' });
        tl.to({}, { duration: hold });
        tl.to(el, { opacity: 0, duration: 0.05, ease: 'none' });
        tl.to({}, { duration: 0.022 }); /* tiny black gap */
      } else {
        /* Last sketch: fade in gracefully, then hint pulse */
        tl.to(el, { opacity: 0.92, duration: 0.4, ease: 'power2.out' });
        tl.to(hintRef.current, { opacity: 0.65, duration: 0.5 }, '+=0.3');
        tl.to(hintRef.current, {
          opacity: 0.2,
          duration: 1.3,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        }, '+=0.2');
        /* Auto reveal — separate delayedCall, NOT chained after repeat:-1 */
        tl.call(() => {
          autoTimer.current = gsap.delayedCall(4, () => {
            if (!isExiting.current) triggerReveal();
          });
        });
      }
    });

    return () => {
      tl.kill();
      autoTimer.current?.kill();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  /* ── Blur-dissolve reveal ── */
  const triggerReveal = useCallback(() => {
    if (isExiting.current) return;
    isExiting.current = true;
    flickerTL.current?.kill();
    autoTimer.current?.kill();

    const tl = gsap.timeline({
      onComplete: () => {
        sessionStorage.setItem('odin_intro_v10', '1');
        setVisible(false);
      },
    });

    tl.to(hintRef.current, { opacity: 0, duration: 0.3 }, 0);

    /* sketch dims and blurs first — anticipation */
    tl.to(sketchRef.current, {
      opacity: 0.3,
      filter: 'blur(8px)',
      scale: 1.03,
      duration: 0.45,
      ease: 'power2.inOut',
      transformOrigin: 'center center',
    }, 0);

    /* whole root blurs + fades — cinematic dissolve */
    tl.to(rootRef.current, {
      filter: 'blur(32px) brightness(0.3)',
      opacity: 0,
      duration: 1.2,
      ease: 'power2.inOut',
    }, 0.38);

  }, []);

  /* ── Keyboard ── */
  useEffect(() => {
    if (!visible) return;
    const onKey = (e) => {
      if (['Enter', ' ', 'Escape'].includes(e.key)) triggerReveal();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible, triggerReveal]);

  if (!visible) return null;

  return (
    <div
      ref={rootRef}
      className="si-root"
      onClick={triggerReveal}
      role="button"
      aria-label="Enter ODIN"
      tabIndex={0}
    >
      <svg
        ref={sketchRef}
        className="si-sketch"
        viewBox="0 0 400 480"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      />
      <p ref={hintRef} className="si-hint">click to enter</p>
    </div>
  );
}