import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import {
  estimateCaloriesClient,
  todayIso,
  type Intensity,
  type WorkoutCategory,
} from "@/lib/fitness";
import { EXERCISES, CATEGORY_LABELS } from "@/lib/exercises";
import { useMutation } from "convex/react";
import { Loader2, Plus } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

const CATEGORIES: WorkoutCategory[] = ["strength", "cardio", "flexibility"];
const INTENSITIES: Intensity[] = ["low", "moderate", "high"];

export function LogWorkoutDialog({
  children,
  defaultDate,
}: {
  children?: ReactNode;
  defaultDate?: string;
}) {
  const logWorkout = useMutation(api.workouts.logWorkout);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [category, setCategory] = useState<WorkoutCategory>("strength");
  const [exerciseName, setExerciseName] = useState("");
  const [duration, setDuration] = useState("45");
  const [intensity, setIntensity] = useState<Intensity>("moderate");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");

  const calories = useMemo(() => {
    const mins = Number(duration);
    if (!Number.isFinite(mins) || mins <= 0) return 0;
    return estimateCaloriesClient(category, intensity, mins);
  }, [category, intensity, duration]);

  const filteredExercises = useMemo(
    () => EXERCISES.filter((e) => e.category === category),
    [category],
  );

  const reset = () => {
    setCategory("strength");
    setExerciseName("");
    setDuration("45");
    setIntensity("moderate");
    setSets("");
    setReps("");
    setWeight("");
    setNotes("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const mins = Number(duration);
    if (!exerciseName.trim()) {
      toast.error("Enter an exercise name");
      return;
    }
    if (!Number.isFinite(mins) || mins <= 0) {
      toast.error("Enter a valid duration");
      return;
    }
    setSaving(true);
    try {
      await logWorkout({
        date: defaultDate ?? todayIso(),
        exerciseName: exerciseName.trim(),
        category,
        durationMinutes: mins,
        intensity,
        sets: sets ? Number(sets) : undefined,
        reps: reps ? Number(reps) : undefined,
        weightKg: weight ? Number(weight) : undefined,
        notes: notes || undefined,
      });
      toast.success("Workout logged");
      reset();
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to log workout",
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
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        {children ?? (
          <Button size="sm" className="gap-1.5">
            <Plus className="size-4" />
            Log workout
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log workout</DialogTitle>
          <DialogDescription>
            Record what you did — calories are estimated automatically.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
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
            <Label htmlFor="exercise">Exercise</Label>
            <Input
              id="exercise"
              list="exercise-suggestions"
              placeholder="e.g. Barbell Back Squat"
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
              required
            />
            <datalist id="exercise-suggestions">
              {filteredExercises.map((e) => (
                <option key={e.name} value={e.name} />
              ))}
            </datalist>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="duration">Duration (min)</Label>
              <Input
                id="duration"
                type="number"
                min={1}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
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
                <Label htmlFor="sets">Sets</Label>
                <Input
                  id="sets"
                  type="number"
                  min={1}
                  placeholder="3"
                  value={sets}
                  onChange={(e) => setSets(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reps">Reps</Label>
                <Input
                  id="reps"
                  type="number"
                  min={1}
                  placeholder="10"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
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

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              rows={2}
              placeholder="How did it feel?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between border-t pt-4 text-sm">
            <span className="text-muted-foreground">Estimated calories</span>
            <span className="tabular text-base font-medium">{calories} kcal</span>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={saving} className="w-full">
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save workout"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
