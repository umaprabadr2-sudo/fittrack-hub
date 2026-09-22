import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BookOpen,
  ClipboardList,
  Dumbbell,
  Flame,
  HeartPulse,
  LineChart,
  Play,
  Target,
} from "lucide-react";

const FEATURES = [
  {
    icon: HeartPulse,
    color: "text-rose-300",
    chip: "bg-rose-500/15 border-rose-500/30",
    title: "Health metrics",
    description:
      "Track daily steps and resting heart rate, and watch your trends light up over time.",
  },
  {
    icon: Dumbbell,
    color: "text-violet-300",
    chip: "bg-violet-500/15 border-violet-500/30",
    title: "Live workout sessions",
    description:
      "Start a session and train along with animated exercises, a running timer, and live calories.",
  },
  {
    icon: ClipboardList,
    color: "text-cyan-300",
    chip: "bg-cyan-500/15 border-cyan-500/30",
    title: "Custom plans",
    description:
      "Start from a template or build a routine from scratch, day by day.",
  },
  {
    icon: LineChart,
    color: "text-lime-300",
    chip: "bg-lime-500/15 border-lime-500/30",
    title: "Progress insights",
    description:
      "Calories, minutes, and frequency charted in vibrant color so trends pop.",
  },
  {
    icon: Target,
    color: "text-orange-300",
    chip: "bg-orange-500/15 border-orange-500/30",
    title: "Goals & milestones",
    description:
      "Set measurable targets and hit 25 / 50 / 75 / 100% milestones one by one.",
  },
  {
    icon: BookOpen,
    color: "text-emerald-300",
    chip: "bg-emerald-500/15 border-emerald-500/30",
    title: "Exercise library",
    description:
      "Form cues for every movement so you train correctly and safely.",
  },
];

const STATS = [
  { icon: Flame, value: "45m", label: "median session", color: "text-orange-300" },
  { icon: Activity, value: "6", label: "tracked metrics", color: "text-cyan-300" },
  { icon: Dumbbell, value: "15+", label: "library exercises", color: "text-violet-300" },
];

function FloatingIcon({
  icon: Icon,
  className,
  delay,
  duration,
}: {
  icon: typeof Dumbbell;
  className: string;
  delay: number;
  duration: number;
}) {
  return (
    <motion.div
      className={`absolute hidden items-center justify-center rounded-2xl border backdrop-blur-sm lg:flex ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1, y: [0, -12, 0] }}
      transition={{
        opacity: { duration: 0.6, delay },
        scale: { duration: 0.6, delay },
        y: {
          duration,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
          delay,
        },
      }}
    >
      <Icon className="size-6" />
    </motion.div>
  );
}

export default function Landing() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="relative flex min-h-screen flex-col overflow-hidden bg-background text-foreground"
    >
      {/* Ambient gradient orbs */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[720px] -translate-x-1/2 rounded-full opacity-25 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, var(--chart-1), transparent)",
        }}
      />
      <div
        className="pointer-events-none absolute -left-40 top-1/3 h-[380px] w-[380px] rounded-full opacity-15 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, var(--chart-4), transparent)",
        }}
      />
      <div
        className="pointer-events-none absolute -right-40 top-1/2 h-[380px] w-[380px] rounded-full opacity-15 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, var(--chart-2), transparent)",
        }}
      />

      {/* Nav */}
      <header className="relative z-10 border-b">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
          <span className="font-display text-base font-semibold tracking-tight">
            FitTrack<span className="text-primary">Hub</span>
          </span>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <a href="/auth">Sign in</a>
            </Button>
            <Button asChild size="sm" className="glow">
              <a href="/auth">Get started</a>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex-1">
        <section className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-6 pb-24 pt-24 text-center">
          <FloatingIcon
            icon={Dumbbell}
            className="left-4 top-24 size-14 border-violet-500/40 bg-violet-500/15 text-violet-300"
            delay={0.3}
            duration={3.2}
          />
          <FloatingIcon
            icon={Flame}
            className="right-10 top-32 size-14 border-orange-500/40 bg-orange-500/15 text-orange-300"
            delay={0.5}
            duration={2.7}
          />
          <FloatingIcon
            icon={HeartPulse}
            className="left-16 bottom-10 size-14 border-rose-500/40 bg-rose-500/15 text-rose-300"
            delay={0.7}
            duration={3.6}
          />
          <FloatingIcon
            icon={Activity}
            className="right-16 bottom-16 size-14 border-cyan-500/40 bg-cyan-500/15 text-cyan-300"
            delay={0.9}
            duration={3}
          />

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-primary"
          >
            No noise. Just momentum.
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="font-display mt-6 max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-6xl"
          >
            Every rep. Every step.{" "}
            <span className="text-gradient">Momentum you can see.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            Start a live animated session, log workouts in seconds, and watch
            your steps, heart rate, and calories turn into charts that actually
            make you want to move.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.3 }}
            className="mt-9 flex flex-col items-center gap-3 sm:flex-row"
          >
            <Button asChild size="lg" className="glow h-12 px-7 text-base">
              <a href="/auth">
                <Play className="mr-1 size-4" />
                Start training
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 border-primary/40 px-7 text-base text-primary hover:bg-primary/10 hover:text-primary"
            >
              <a href="/auth">
                Continue as guest
                <ArrowRight className="ml-1 size-4" />
              </a>
            </Button>
          </motion.div>
          <p className="mt-4 text-xs text-muted-foreground">
            Free forever · Email or guest sign-in · Your data stays yours
          </p>
        </section>

        {/* Stats strip */}
        <section className="relative z-10 border-y bg-card/60 backdrop-blur-sm">
          <div className="mx-auto grid w-full max-w-6xl grid-cols-3 divide-x divide-border px-6">
            {STATS.map(({ icon: Icon, value, label, color }) => (
              <div key={label} className="flex flex-col items-center gap-1 py-10">
                <Icon className={`size-5 ${color}`} />
                <p className="font-display tabular mt-2 text-3xl font-bold tracking-tight">
                  {value}
                </p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="relative z-10 mx-auto w-full max-w-6xl px-6 py-24">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need,{" "}
              <span className="text-gradient">in full color</span>
            </h2>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              Six focused tools that make your fitness data feel alive.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, color, chip, title, description }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
                className="group rounded-xl border bg-card/70 p-6 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_12px_40px_-16px_var(--primary)]"
              >
                <span
                  className={`inline-flex size-11 items-center justify-center rounded-lg border ${chip}`}
                >
                  <Icon className={`size-5 ${color}`} />
                </span>
                <h3 className="mt-4 font-medium">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Closing CTA */}
        <section className="relative z-10 border-t">
          <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center overflow-hidden px-6 py-24 text-center">
            <div
              className="pointer-events-none absolute bottom-0 left-1/2 h-[300px] w-[600px] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
              style={{
                background:
                  "radial-gradient(closest-side, var(--chart-1), transparent)",
              }}
            />
            <h2 className="font-display relative max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
              Your first session is{" "}
              <span className="text-gradient">one tap away.</span>
            </h2>
            <p className="relative mt-4 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
              Sign in, hit start, and train with the timer — your stats fill in
              automatically.
            </p>
            <Button asChild size="lg" className="glow relative mt-9 h-12 px-8 text-base">
              <a href="/auth">
                Get started free
                <ArrowRight className="ml-1 size-4" />
              </a>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-6 py-6 text-xs text-muted-foreground sm:flex-row">
          <span>
            FitTrack<span className="text-primary">Hub</span> — fitness, in
            color
          </span>
          <span>Built for one person: you.</span>
        </div>
      </footer>
    </motion.div>
  );
}
