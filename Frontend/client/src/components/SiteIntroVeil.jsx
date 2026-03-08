import { useRef, useEffect, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import './SiteIntro.css';

/* ══════════════════════════════════════════════════
   THE VEIL — ODIN Cinematic Intro
   Inspired by Fauve, award-winning agency intros
   ══════════════════════════════════════════════════ */

const TAGLINE_TEXT = 'Norse Intelligence  ·  Web3  ·  AI  ·  NFT';
const LETTERS = ['O', 'D', 'I', 'N'];

export default function SiteIntro() {
  const [visible, setVisible] = useState(true);
  const rootRef = useRef(null);
  const curtainLRef = useRef(null);
  const curtainRRef = useRef(null);
  const letterRefs = useRef([]);
  const lineRef = useRef(null);
  const taglineRef = useRef(null);
  const hintRef = useRef(null);
  const orb1Ref = useRef(null);
  const orb2Ref = useRef(null);
  const orb3Ref = useRef(null);
  const isExiting = useRef(false);

  /* ── Skip if already seen ──────────────────────────── */
  useEffect(() => {
    if (sessionStorage.getItem('odin_intro_v4')) {
      setVisible(false);
    }
  }, []);

  /* ── Scroll lock ───────────────────────────────────── */
  useEffect(() => {
    if (!visible) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [visible]);

  /* ── Entrance animation ────────────────────────────── */
  useEffect(() => {
    if (!visible) return;

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    /* Letters start clipped below their container */
    gsap.set(letterRefs.current, { yPercent: 115, opacity: 0 });
    gsap.set(lineRef.current, { scaleX: 0, transformOrigin: 'center center' });
    gsap.set(taglineRef.current, { opacity: 0, y: 14 });
    gsap.set(hintRef.current, { opacity: 0 });

    /* Orbs start small / invisible */
    gsap.set([orb1Ref.current, orb2Ref.current, orb3Ref.current], {
      scale: 0.4,
      opacity: 0,
    });

    // 1. Orbs fade in
    tl.to([orb1Ref.current, orb2Ref.current, orb3Ref.current], {
      opacity: 1,
      scale: 1,
      duration: 1.8,
      stagger: 0.25,
    }, 0);

    // 2. Letters clip up with dramatic stagger
    tl.to(letterRefs.current, {
      yPercent: 0,
      opacity: 1,
      duration: 1.0,
      stagger: 0.13,
      ease: 'expo.out',
    }, 0.15);

    // 3. Divider line expands
    tl.to(lineRef.current, {
      scaleX: 1,
      duration: 1.0,
      ease: 'expo.inOut',
    }, 0.85);

    // 4. Tagline fades in
    tl.to(taglineRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.8,
    }, 1.05);

    // 5. Hint pulse
    tl.to(hintRef.current, {
      opacity: 1,
      duration: 0.6,
      onComplete: () => {
        gsap.to(hintRef.current, {
          opacity: 0.25,
          duration: 1.4,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        });
      },
    }, 1.8);

    // Slow ambient orb drift (looping)
    gsap.to(orb1Ref.current, {
      x: 60, y: -40, duration: 8, ease: 'sine.inOut', yoyo: true, repeat: -1,
    });
    gsap.to(orb2Ref.current, {
      x: -50, y: 60, duration: 10, ease: 'sine.inOut', yoyo: true, repeat: -1,
    });
    gsap.to(orb3Ref.current, {
      x: 40, y: 30, duration: 7, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1,
    });

  }, [visible]);

  /* ── Exit animation — bi-directional curtain ───────── */
  const triggerReveal = useCallback(() => {
    if (isExiting.current) return;
    isExiting.current = true;

    const tl = gsap.timeline({
      onComplete: () => {
        sessionStorage.setItem('odin_intro_v4', '1');
        setVisible(false);
      },
    });

    // Fade out content fast
    tl.to([...letterRefs.current, lineRef.current, taglineRef.current, hintRef.current], {
      opacity: 0,
      duration: 0.25,
      ease: 'power2.in',
    }, 0);

    // Curtains close from edges to centre
    tl.fromTo(curtainLRef.current,
      { scaleX: 0, transformOrigin: 'left center' },
      { scaleX: 1, duration: 0.75, ease: 'expo.inOut' },
      0.1
    );
    tl.fromTo(curtainRRef.current,
      { scaleX: 0, transformOrigin: 'right center' },
      { scaleX: 1, duration: 0.75, ease: 'expo.inOut' },
      0.1
    );

    // Whole root fades out after curtains meet
    tl.to(rootRef.current, {
      opacity: 0,
      duration: 0.4,
      ease: 'power2.out',
    }, 0.7);

  }, []);

  /* ── Keyboard support ──────────────────────────────── */
  useEffect(() => {
    if (!visible) return;
    const onKey = (e) => {
      if (e.key === 'Enter' || e.key === ' ') triggerReveal();
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
      {/* ── SVG grain filter ────────────────────────── */}
      <svg className="si-grain-svg" aria-hidden="true">
        <defs>
          <filter id="si-grain-filter" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.72"
              numOctaves="4"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
            <feBlend in="SourceGraphic" mode="overlay" result="blend" />
            <feComposite in="blend" in2="SourceGraphic" operator="in" />
          </filter>
        </defs>
      </svg>
      <div className="si-grain" aria-hidden="true" />

      {/* ── Ambient orbs ────────────────────────────── */}
      <div ref={orb1Ref} className="si-orb si-orb--1" />
      <div ref={orb2Ref} className="si-orb si-orb--2" />
      <div ref={orb3Ref} className="si-orb si-orb--3" />

      {/* ── Main content ───────────────────────────── */}
      <div className="si-content">
        {/* Large letters */}
        <div className="si-letters" aria-label="ODIN">
          {LETTERS.map((letter, i) => (
            <div key={letter} className="si-letter-wrap">
              <span
                ref={(el) => (letterRefs.current[i] = el)}
                className="si-letter"
                aria-hidden="true"
              >
                {letter}
              </span>
            </div>
          ))}
        </div>

        {/* Expanding line */}
        <div ref={lineRef} className="si-line" />

        {/* Tagline */}
        <p ref={taglineRef} className="si-tagline">
          {TAGLINE_TEXT}
        </p>
      </div>

      {/* ── Hint ────────────────────────────────────── */}
      <p ref={hintRef} className="si-hint">
        click anywhere to enter
      </p>

      {/* ── Exit curtains ───────────────────────────── */}
      <div ref={curtainLRef} className="si-curtain si-curtain--l" />
      <div ref={curtainRRef} className="si-curtain si-curtain--r" />
    </div>
  );
}