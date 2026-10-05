import React, { useState, Suspense, lazy } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Dices, RefreshCw } from 'lucide-react';

const GradientWaves = lazy(() => import('./components/GradientWaves'));

// STAGE 7: Performance - Lazy-load all 12 intro text components on demand
const TechText = lazy(() => import('./components/TechText'));
const FoldText = lazy(() => import('./components/FoldText'));
const ParticleText = lazy(() => import('./components/ParticleText'));
const StrokeText = lazy(() => import('./components/StrokeText'));
const Shuffle = lazy(() => import('./components/Shuffle'));
const ScrambledText = lazy(() => import('./components/ScrambledText'));
const TextType = lazy(() => import('./components/TextType'));
const RotatingText = lazy(() => import('./components/RotatingText'));
const TextPressure = lazy(() => import('./components/TextPressure'));
const DecryptedText = lazy(() => import('./components/DecryptedText'));
const BlurText = lazy(() => import('./components/BlurText'));
const SplitText = lazy(() => import('./components/SplitText'));

const INTRO_EFFECTS = [
  { id: 'tech', label: 'TechText (Canvas Blueprint)' },
  { id: 'fold', label: 'FoldText (3D Origami Cascade)' },
  { id: 'particle', label: 'ParticleText (Interactive Starfield)' },
  { id: 'stroke', label: 'StrokeText (SVG Pen Draw & Wipe)' },
  { id: 'shuffle', label: 'Shuffle (Matrix Scramble Strips)' },
  { id: 'scramble', label: 'ScrambledText (Hover Distance Decode)' },
  { id: 'type', label: 'TextType (Terminal Typewriter)' },
  { id: 'rotate', label: 'RotatingText (Spring Flipping Badges)' },
  { id: 'pressure', label: 'TextPressure (Variable Font Stretch)' },
  { id: 'decrypted', label: 'DecryptedText (Cipher Matrix Reveal)' },
  { id: 'blur', label: 'BlurText (Motion Blurry Focus)' },
  { id: 'split', label: 'SplitText (GSAP Eased Letter Drop)' }
] as const;

type EffectId = (typeof INTRO_EFFECTS)[number]['id'];

const getRandomEffect = (): EffectId => {
  const randomIndex = Math.floor(Math.random() * INTRO_EFFECTS.length);
  return INTRO_EFFECTS[randomIndex].id;
};

export default function App() {
  const [activeEffect, setActiveEffect] = useState<EffectId>(() => getRandomEffect());

  const rollNewEffect = () => {
    setActiveEffect(prev => {
      const remaining = INTRO_EFFECTS.filter(e => e.id !== prev);
      const next = remaining[Math.floor(Math.random() * remaining.length)];
      return next.id;
    });
  };

  const currentMeta = INTRO_EFFECTS.find(e => e.id === activeEffect);

  return (
    <AuthProvider>
      <main className="min-h-screen w-full bg-black text-white flex flex-col items-center justify-center overflow-hidden relative select-none">
        {/* Dynamic Gradient Waves Background */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
          <Suspense fallback={null}>
            <GradientWaves
              horizonColor="#040d1a"
              waveColor="#0284c7"
              crestColor="#7dd3fc"
              speed={0.35}
              amplitude={3.8}
              waveScale={0.55}
              waveRatio={0.88}
              swell={38}
              turbulence={24}
              tilt={1.12}
              zoom={1.05}
              height={4.6}
              fogDepth={24}
              detail="medium"
              brightness={1.35}
              opacity={0.92}
              mouseInteraction={true}
              parallaxStrength={0.5}
              grain={true}
              grainIntensity={0.03}
            />
          </Suspense>
          {/* Subtle atmosphere shading ensuring text remains punchy and high contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/60 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50 pointer-events-none" />
        </div>

        {/* Intro Section - exactly 100vh full-screen */}
        <section className="h-screen w-full flex flex-col items-center justify-center relative px-4 sm:px-6 z-10">
          <div className="w-full max-w-5xl min-h-[360px] sm:min-h-[460px] md:min-h-[520px] flex items-center justify-center relative">
            <Suspense
              fallback={
                <div className="w-full max-w-4xl h-[220px] sm:h-[260px] md:h-[290px] flex items-center justify-center pointer-events-none" />
              }
            >
              {activeEffect === 'tech' && (
              <div key="tech" className="w-full max-w-4xl h-[220px] sm:h-[260px] md:h-[290px] relative flex items-center justify-center">
                <TechText
                  text="DoRaemon's Shop"
                  fontWeight={800}
                  fontSize={86}
                  letterSpacing={-0.03}
                  reveal="letter"
                  dashLength={4}
                  dashGap={2}
                  specks={15}
                  color="#ffffff"
                  accentColor="#38bdf8"
                  selection={true}
                  labels={true}
                  draggable={true}
                  sweep={true}
                  speed={1}
                />
              </div>
            )}

            {activeEffect === 'fold' && (
              <div key="fold" className="w-full max-w-4xl h-[220px] sm:h-[260px] md:h-[290px] flex items-center justify-center px-4">
                <FoldText
                  text="DoRaemon's Shop"
                  splitBy="char"
                  hinge="top"
                  trigger="mount"
                  duration={0.7}
                  stagger={0.045}
                  ease="power3.out"
                  perspective={800}
                  creaseShading={0.55}
                  fontSize="clamp(2.5rem, 6.5vw, 5.25rem)"
                  fontWeight={800}
                  color="#ffffff"
                />
              </div>
            )}

            {activeEffect === 'particle' && (
              <div key="particle" className="w-full max-w-4xl h-[220px] sm:h-[260px] md:h-[290px] relative flex items-center justify-center">
                <ParticleText
                  text="DoRaemon's Shop"
                  particleSize={2.2}
                  density={3.2}
                  color="#ffffff"
                  highlightColor="#38bdf8"
                  scatter={180}
                  gatherDuration={1500}
                  stagger={380}
                  pointerRepel={45}
                  repelRadius={130}
                  idleDrift={0.7}
                  trigger="mount"
                  fontSize="clamp(2.5rem, 6.5vw, 5.25rem)"
                  fontWeight={800}
                  glow={true}
                />
              </div>
            )}

            {activeEffect === 'stroke' && (
              <div key="stroke" className="w-full max-w-4xl h-[220px] sm:h-[260px] md:h-[290px] px-4 flex items-center justify-center">
                <StrokeText
                  text="DoRaemon's Shop"
                  strokeColor="#38bdf8"
                  fillColor="#ffffff"
                  strokeWidth={1.8}
                  drawDuration={1.5}
                  fillDelay={0.2}
                  stagger={0.045}
                  ease="power2.out"
                  trigger="mount"
                  fillMode="wipe"
                  fontSize={86}
                  fontWeight={800}
                  letterSpacing={-2}
                  className="w-full"
                />
              </div>
            )}

            {activeEffect === 'shuffle' && (
              <div key="shuffle" className="w-full max-w-4xl h-[220px] sm:h-[260px] md:h-[290px] px-4 flex flex-col items-center justify-center text-center">
                <Shuffle
                  text="DoRaemon's Shop"
                  shuffleDirection="down"
                  duration={0.4}
                  animationMode="evenodd"
                  shuffleTimes={2}
                  ease="power3.out"
                  stagger={0.035}
                  triggerOnce={false}
                  triggerOnHover={true}
                  className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white uppercase font-mono leading-none"
                  colorFrom="#38bdf8"
                  colorTo="#ffffff"
                />
              </div>
            )}

            {activeEffect === 'scramble' && (
              <div key="scramble" className="w-full max-w-4xl h-[220px] sm:h-[260px] md:h-[290px] flex items-center justify-center text-center px-4">
                <ScrambledText
                  radius={120}
                  duration={1.2}
                  speed={0.5}
                  scrambleChars="!@#$%&*+=-/<>:;~"
                  className="font-mono text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white leading-none m-0 text-center"
                >
                  DoRaemon's Shop
                </ScrambledText>
              </div>
            )}

            {activeEffect === 'type' && (
              <div key="type" className="w-full max-w-4xl h-[220px] sm:h-[260px] md:h-[290px] flex items-center justify-center text-center font-mono text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-none px-4">
                <TextType
                  text={["DoRaemon's Shop", "ESP32 and BW16", "Hand made with care", "DoRaemon's Shop"]}
                  typingSpeed={65}
                  deletingSpeed={35}
                  pauseDuration={1800}
                  showCursor={true}
                  cursorCharacter="▮"
                  cursorClassName="text-sky-400 font-normal"
                  textColors={["#ffffff", "#38bdf8", "#a78bfa", "#ffffff"]}
                  loop={true}
                  className="inline-block"
                />
              </div>
            )}

            {activeEffect === 'rotate' && (
              <div key="rotate" className="w-full max-w-4xl h-[220px] sm:h-[260px] md:h-[290px] flex items-center justify-center text-center text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-none px-4">
                <RotatingText
                  texts={[
                    "DoRaemon's Shop",
                    "2.4ghz and 5ghz tools",
                    "Customisable firmware",
                    "Various configurations",
                    "DoRaemon's Shop"
                  ]}
                  mainClassName="px-4 sm:px-6 py-2 sm:py-3 bg-neutral-900/90 border border-neutral-700/80 text-white rounded-2xl shadow-2xl justify-center font-mono"
                  staggerFrom="last"
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "-120%", opacity: 0 }}
                  staggerDuration={0.025}
                  splitLevelClassName="overflow-hidden pb-1"
                  transition={{ type: "spring", damping: 28, stiffness: 350 }}
                  rotationInterval={2200}
                />
              </div>
            )}

            {activeEffect === 'pressure' && (
              <div key="pressure" className="w-full max-w-4xl h-[220px] sm:h-[260px] md:h-[290px] relative flex items-center justify-center px-4">
                <TextPressure
                  text="DoRaemon's Shop"
                  flex={true}
                  width={true}
                  weight={true}
                  italic={true}
                  alpha={false}
                  stroke={false}
                  textColor="#ffffff"
                  minFontSize={36}
                  maxFontSize={86}
                  className="w-full font-bold"
                />
              </div>
            )}

            {activeEffect === 'decrypted' && (
              <div key="decrypted" className="w-full max-w-4xl h-[220px] sm:h-[260px] md:h-[290px] flex items-center justify-center text-center px-4 font-mono text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-none">
                <DecryptedText
                  text="DoRaemon's Shop"
                  speed={40}
                  maxIterations={15}
                  sequential={true}
                  revealDirection="center"
                  characters="!@#$%^&*()_+{}[]:;<>,.?/~0123456789"
                  className="text-white"
                  encryptedClassName="text-sky-400 opacity-80"
                  animateOn="view"
                />
              </div>
            )}

            {activeEffect === 'blur' && (
              <div key="blur" className="w-full max-w-4xl h-[220px] sm:h-[260px] md:h-[290px] flex items-center justify-center text-center px-4">
                <BlurText
                  text="DoRaemon's Shop"
                  delay={120}
                  animateBy="letters"
                  direction="top"
                  stepDuration={0.4}
                  className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white justify-center font-mono leading-none"
                />
              </div>
            )}

            {activeEffect === 'split' && (
              <div key="split" className="w-full max-w-4xl h-[220px] sm:h-[260px] md:h-[290px] flex items-center justify-center text-center px-4">
                <SplitText
                  text="DoRaemon's Shop"
                  className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white font-mono leading-none"
                  delay={40}
                  duration={0.9}
                  ease="power3.out"
                  splitType="chars"
                  from={{ opacity: 0, y: 50, rotateX: -60 }}
                  to={{ opacity: 1, y: 0, rotateX: 0 }}
                  textAlign="center"
                />
              </div>
            )}
            </Suspense>
          </div>

          {/* Discreet RNG Roll Controller & Info Badge */}
          <div className="absolute bottom-6 right-6 flex items-center gap-2 bg-neutral-950/80 backdrop-blur-md border border-neutral-800 rounded-full px-3 py-1.5 shadow-2xl text-xs text-neutral-400 z-50">
            <span className="flex items-center gap-1.5 font-mono text-[11px] text-neutral-300">
              <Dices className="w-3.5 h-3.5 text-sky-400" />
              <span>RNG:</span>
              <span className="text-white font-medium">{currentMeta?.label.split(' ')[0]}</span>
            </span>

            <button
              onClick={rollNewEffect}
              className="ml-1 p-1 hover:text-sky-300 transition-colors cursor-pointer rounded-full hover:bg-neutral-800"
              title="Roll another random effect"
              aria-label="Roll another random effect"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        </section>
      </main>
    </AuthProvider>
  );
}
