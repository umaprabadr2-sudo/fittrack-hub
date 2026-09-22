import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Activity,
  ArrowRight,
  BookOpen,
  ClipboardList,
  Dumbbell,
  Flame,
  HeartPulse,
  LineChart,
  Target,
} from "lucide-react";
import { motion } from "framer-motion";

const FEATURES = [
  {
    icon: HeartPulse,
    title: "Health metrics",
    description:
      "Track daily steps and resting heart rate, and watch your trends over time.",
  },
  {
    icon: Dumbbell,
    title: "Workout logging",
    description:
      "Strength, cardio, and flexibility sessions with duration, intensity, and sets × reps.",
  },
  {
    icon: ClipboardList,
    title: "Custom plans",
    description:
      "Start from a template or build a routine from scratch, day by day.",
  },
  {
    icon: LineChart,
    title: "Progress insights",
    description:
      "Calories, minutes, and frequency charted so the trend is easy to read.",
  },
  {
    icon: Target,
    title: "Goals & milestones",
    description:
      "Set measurable targets and mark progress at 25 / 50 / 75 / 100%.",
  },
  {
    icon: BookOpen,
    title: "Exercise library",
    description:
      "Form cues for every movement so you train correctly and safely.",
  },
];

const STATS = [
  { icon: Flame, value: "45m", label: "median session" },
  { icon: Activity, value: "6", label: "tracked metrics" },
  { icon: Dumbbell, value: "15+", label: "library exercises" },
];

export default function Landing() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex min-h-screen flex-col bg-background text-foreground"
    >
      {/* Nav */}
      <header className="border-b">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-6">
          <span className="text-sm font-semibold tracking-tight">
            FitTrack<span className="text-muted-foreground">Hub</span>
          </span>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <a href="/auth">Sign in</a>
            </Button>
            <Button asChild size="sm">
              <a href="/auth">Get started</a>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="mx-auto flex w-full max-w-6xl flex-col items-center px-6 pb-20 pt-24 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Minimal fitness tracking
          </p>
          <h1 className="mt-6 max-w-2xl text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
            Train with intention.
            <br />
            <span className="text-muted-foreground">Measure what matters.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
            Log workouts in seconds, watch your steps and heart rate, and see
            your progress in clean, honest charts. No noise — just the numbers
            that move you forward.
          </p>
          <div className="mt-8 flex items-center gap-3">
            <Button asChild size="lg" className="h-11 px-6">
              <a href="/auth">
                Start tracking
                <ArrowRight className="ml-1 size-4" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-11 px-6">
              <a href="/auth">Continue as guest</a>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Free · Email or guest sign-in · Your data stays yours
          </p>
        </section>

        {/* Stats strip */}
        <section className="border-y bg-muted/40">
          <div className="mx-auto grid w-full max-w-6xl grid-cols-3 divide-x px-6">
            {STATS.map(({ icon: Icon, value, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1 py-8"
              >
                <Icon className="size-4 text-muted-foreground" />
                <p className="tabular mt-1 text-2xl font-semibold tracking-tight">
                  {value}
                </p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto w-full max-w-6xl px-6 py-20">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-semibold tracking-tight">
              Everything you need, nothing you don&apos;t
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Six focused tools for a complete picture of your fitness.
            </p>
          </div>
          <div className="grid gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div key={title} className="bg-background p-6">
                <Icon className="size-5 text-foreground" />
                <h3 className="mt-4 text-sm font-medium">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Closing CTA */}
        <section className="border-t">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-6 py-20 text-center">
            <h2 className="max-w-xl text-2xl font-semibold tracking-tight">
              Your first workout is thirty seconds away.
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              Sign in, log a session, and watch the charts fill in.
            </p>
            <Button asChild size="lg" className="mt-8 h-11 px-8">
              <a href="/auth">
                Get started free
                <ArrowRight className="ml-1 size-4" />
              </a>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={cn("border-t")}>
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-6 py-6 text-xs text-muted-foreground sm:flex-row">
          <span>FitTrack Hub — minimal fitness tracking</span>
          <span>Built for one person: you.</span>
        </div>
      </footer>
    </motion.div>
  );
}
