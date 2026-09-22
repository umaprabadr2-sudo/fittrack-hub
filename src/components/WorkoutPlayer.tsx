import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import {
  CATEGORY_ACCENT,
  estimateCaloriesClient,
  todayIso,
  type Intensity,
  type WorkoutCategory,
} from "@/lib/fitness";
import { CATEGORY_LABELS, EXERCISES } from "@/lib/exercises";
import { motion } from "framer-motion";
import {
  Dumbbell,
  Flame,
  Footprints,
  Pause,
  Play,
  Square,
  Timer,
  Waves,
} from "lucide-react";
import { useMutation } from "convex/react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

const CATEGORIES: WorkoutCategory[] = ["strength", "cardio", "flexibility"];
const INTENSITIES: Intensity[] = ["low", "moderate", "high"];
const RING_RADIUS = 84;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function fmtClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** Category-specific looping "workout" animation for the live session. */
function ExerciseAnimation({ category }: { category: WorkoutCategory }) {
  const shared =
    "relative z-10 flex size-24 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary";

  if (category === "strength") {
    return (
      <div className="relative flex size-40 items-center justify-center">
        <PulseRings />
        <motion.div
          className={shared}
          animate={{ y: [-12, 12], rotate: [-10, 10] }}
          transition={{ duration: 1.1, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
        >
          <Dumbbell className="size-10" />
        </motion.div>
      </div>
    );
  }

  if (category === "cardio") {
    return (
      <div className="relative flex size-40 items-center justify-center">
        <PulseRings />
        <motion.div
          className={shared}
          animate={{ x: [-14, 14], y: [5, -5], rotate: [-6, 6] }}
          transition={{ duration: 0.55, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
        >
          <Footprints className="size-10" />
        </motion.div>
        <motion.span
          className="absolute right-2 top-1/2 h-0.5 w-8 rounded bg-primary/40"
          animate={{ opacity: [0.9, 0.1], x: [0, 26] }}
          transition={{ duration: 0.55, repeat: Infinity, ease: "easeOut" }}
        />
        <motion.span
          className="absolute right-0 top-1/2 mt-3 h-0.5 w-6 rounded bg-primary/30"
          animate={{ opacity: [0.8, 0], x: [0, 22] }}
          transition={{ duration: 0.55, repeat: Infinity, ease: "easeOut", delay: 0.18 }}
        />
      </div>
    );
  }

  return (
    <div className="relative flex size-40 items-center justify-center">
      <PulseRings slow />
      <motion.div
        className={shared}
        animate={{ scale: [1, 1.16, 1], rotate: [0, 12, 0] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <Waves className="size-10" />
      </motion.div>
    </div>
  );
}

function PulseRings({ slow = false }: { slow?: boolean }) {
  return (
    <>
      {[0, 1].map((i) => (
        <motion.span
          key={i}
          className="absolute size-40 rounded-full border border-primary/30"
          animate={{ scale: [1, 1.45], opacity: [0.55, 0] }}
          transition={{
            duration: slow ? 3 : 1.6,
            repeat: Infinity,
            ease: "easeOut",
            delay: i * (slow ? 1.5 : 0.8),
          }}
        />
      ))}
      <motion.span
        className="absolute size-32 rounded-full bg-primary/10 blur-xl"
        animate={{ opacity: [0.35, 0.75, 0.35] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
    </>
  );
}

export function WorkoutPlayer({ children }: { children?: ReactNode }) {
  const logWorkout = useMutation(api.workouts.logWorkout);
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<"setup" | "running">("setup");
  const [category, setCategory] = useState<WorkoutCategory>("strength");
  const [exerciseName, setExerciseName] = useState("");
  const [planned, setPlanned] = useState("30");
  const [intensity, setIntensity] = useState<Intensity>("moderate");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");

  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0); // seconds
  const [saving, setSaving] = useState(false);

  // Tick the clock only while the session is running.
  useEffect(() => {
    if (phase !== "running" || !running) return;
    const id = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => window.clearInterval(id);
  }, [phase, running]);

  const plannedMin = Math.max(1, Number(planned) || 30);
  const progress = Math.min(1, elapsed / (plannedMin * 60));
  const kcalBurned = useMemo(() => {
    const perMin = estimateCaloriesClient(category, intensity, 1);
    return Math.round(perMin * (elapsed / 60));
  }, [category, intensity, elapsed]);

  const filteredExercises = useMemo(
    () => EXERCISES.filter((e) => e.category === category),
    [category],
  );

  const resetAll = () => {
    setPhase("setup");
    setRunning(false);
    setElapsed(0);
    setExerciseName("");
    setPlanned("30");
    setIntensity("moderate");
    setSets("");
    setReps("");
    setWeight("");
    setCategory("strength");
  };

  const handleStart = () => {
    if (!exerciseName.trim()) {
      toast.error("Pick an exercise to start");
      return;
    }
    setElapsed(0);
    setPhase("running");
    setRunning(true);
  };

  const handleFinish = async () => {
    const minutes = Math.max(1, Math.round(elapsed / 60));
    setSaving(true);
    try {
      await logWorkout({
        date: todayIso(),
        exerciseName: exerciseName.trim(),
        category,
        durationMinutes: minutes,
        intensity,
        sets: sets ? Number(sets) : undefined,
        reps: reps ? Number(reps) : undefined,
        weightKg: weight ? Number(weight) : undefined,
      });
      toast.success(`Session saved — ${minutes} min, ~${kcalBurned} kcal`);
      setOpen(false);
      resetAll();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save session",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) resetAll();
      }}
    >
      <DialogTrigger asChild>
        {children ?? (
          <Button size="sm" className="glow gap-1.5">
            <Play className="size-4" />
            Start session
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {phase === "setup" ? (
          <>
            <DialogHeader>
              <DialogTitle>Start a live session</DialogTitle>
              <DialogDescription>
                Pick your exercise, hit start, and train along with the timer.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select
                  value={category}
                  onValueChange={(v) => {
                    setCategory(v as WorkoutCategory);
                    setExerciseName("");
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {CATEGORY_LABELS[c]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="player-exercise">Exercise</Label>
                <Input
                  id="player-exercise"
                  list="player-suggestions"
                  placeholder="e.g. Barbell Back Squat"
                  value={exerciseName}
                  onChange={(e) => setExerciseName(e.target.value)}
                />
                <datalist id="player-suggestions">
                  {filteredExercises.map((e) => (
                    <option key={e.name} value={e.name} />
                  ))}
                </datalist>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="player-planned">Planned (min)</Label>
                  <Input
                    id="player-planned"
                    type="number"
                    min={1}
                    value={planned}
                    onChange={(e) => setPlanned(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Intensity</Label>
                  <Select
                    value={intensity}
                    onValueChange={(v) => setIntensity(v as Intensity)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INTENSITIES.map((i) => (
                        <SelectItem key={i} value={i}>
                          <span className="capitalize">{i}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {category === "strength" && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="player-sets">Sets</Label>
                    <Input
                      id="player-sets"
                      type="number"
                      min={1}
                      placeholder="3"
                      value={sets}
                      onChange={(e) => setSets(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="player-reps">Reps</Label>
                    <Input
                      id="player-reps"
                      type="number"
                      min={1}
                      placeholder="10"
                      value={reps}
                      onChange={(e) => setReps(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="player-weight">Weight kg</Label>
                    <Input
                      id="player-weight"
                      type="number"
                      min={0}
                      step={0.5}
                      placeholder="40"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                    />
                  </div>
                </div>
              )}
              <Button className="glow w-full gap-1.5" onClick={handleStart}>
                <Play className="size-4" />
                Start session
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader className="sr-only">
              <DialogTitle>Live session</DialogTitle>
              <DialogDescription>Workout in progress</DialogDescription>
            </DialogHeader>

            <div className="flex flex-col items-center gap-1 pt-2">
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium capitalize ${CATEGORY_ACCENT[category]}`}
              >
                {exerciseName.trim() || CATEGORY_LABELS[category]}
              </span>
            </div>

            <div className="flex flex-col items-center gap-5 py-2">
              <ExerciseAnimation category={category} />

              <div className="relative flex size-48 items-center justify-center">
                <svg className="absolute inset-0 -rotate-90" viewBox="0 0 192 192">
                  <circle
                    cx="96"
                    cy="96"
                    r={RING_RADIUS}
                    fill="none"
                    stroke="var(--border)"
                    strokeWidth="8"
                  />
                  <motion.circle
                    cx="96"
                    cy="96"
                    r={RING_RADIUS}
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={RING_CIRCUMFERENCE}
                    animate={{ strokeDashoffset: RING_CIRCUMFERENCE * (1 - progress) }}
                    transition={{ duration: 0.5, ease: "linear" }}
                  />
                </svg>
                <div className="flex flex-col items-center">
                  <span className="tabular text-4xl font-bold tracking-tight">
                    {fmtClock(elapsed)}
                  </span>
                  <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Timer className="size-3.5" />
                    of {plannedMin} min
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-full border border-orange-200 bg-orange-100 px-4 py-1.5 text-sm text-orange-700">
                <motion.span
                  animate={{ scale: [1, 1.25, 1] }}
                  transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Flame className="size-4" />
                </motion.span>
                <span className="tabular font-semibold">{kcalBurned}</span>
                <span className="text-orange-600/80">kcal burned</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="flex-1 gap-1.5"
                onClick={() => setRunning((r) => !r)}
              >
                {running ? (
                  <>
                    <Pause className="size-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="size-4" />
                    Resume
                  </>
                )}
              </Button>
              <Button
                variant="destructive"
                className="flex-1 gap-1.5"
                disabled={saving}
                onClick={handleFinish}
              >
                <Square className="size-4" />
                {saving ? "Saving…" : "Finish"}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
