import { AppShell } from "@/components/AppShell";
import { LogWorkoutDialog } from "@/components/LogWorkoutDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { friendlyDate, formatMinutes } from "@/lib/fitness";
import { useMutation, useQuery } from "convex/react";
import { Dumbbell, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

type WorkoutLog = Doc<"workoutLogs">;
type CategoryFilter = "all" | "strength" | "cardio" | "flexibility";

function WorkoutsInner() {
  const workouts = useQuery(api.workouts.listWorkouts, { limit: 100 });
  const deleteWorkout = useMutation(api.workouts.deleteWorkout);
  const [filter, setFilter] = useState<CategoryFilter>("all");

  const grouped = useMemo(() => {
    const list = (workouts ?? []).filter(
      (w) => filter === "all" || w.category === filter,
    );
    const byDate = new Map<string, WorkoutLog[]>();
    for (const w of list) {
      const arr = byDate.get(w.date) ?? [];
      arr.push(w);
      byDate.set(w.date, arr);
    }
    return [...byDate.entries()];
  }, [workouts, filter]);

  const handleDelete = async (id: WorkoutLog["_id"]) => {
    try {
      await deleteWorkout({ id });
    } catch {
      // ignore
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Workouts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every session you&apos;ve logged, newest first.
          </p>
        </div>
        <LogWorkoutDialog />
      </header>

      {/* Filters */}
      <div className="flex gap-1.5">
        {(["all", "strength", "cardio", "flexibility"] as const).map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? "default" : "outline"}
            className="capitalize h-8"
            onClick={() => setFilter(f)}
          >
            {f}
          </Button>
        ))}
      </div>

      {!workouts ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          Loading…
        </p>
      ) : grouped.length === 0 ? (
        <Card className="shadow-none">
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <Dumbbell className="size-8 text-muted-foreground/40" />
            <div>
              <p className="text-sm font-medium">No workouts yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Log your first session to see it here.
              </p>
            </div>
            <LogWorkoutDialog>
              <Button size="sm" className="mt-2 gap-1.5">
                Log your first workout
              </Button>
            </LogWorkoutDialog>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          {grouped.map(([date, logs]) => {
            const minutes = logs.reduce((s, l) => s + l.durationMinutes, 0);
            const calories = logs.reduce((s, l) => s + l.caloriesBurned, 0);
            return (
              <section key={date} className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between">
                  <h2 className="text-sm font-medium">
                    {friendlyDate(date)}
                  </h2>
                  <p className="tabular text-xs text-muted-foreground">
                    {formatMinutes(minutes)} · {calories} kcal
                  </p>
                </div>
                <Card className="shadow-none">
                  <CardContent className="p-0">
                    <ul className="divide-y">
                      {logs.map((w) => (
                        <li
                          key={w._id}
                          className="flex items-center justify-between gap-3 px-4 py-3"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {w.exerciseName}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {w.durationMinutes} min ·{" "}
                              <span className="capitalize">{w.intensity}</span>
                              {w.sets != null && w.reps != null
                                ? ` · ${w.sets}×${w.reps}`
                                : ""}
                              {w.weightKg != null ? ` · ${w.weightKg} kg` : ""}
                              {w.notes ? ` — ${w.notes}` : ""}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <span className="tabular hidden text-xs text-muted-foreground sm:block">
                              {w.caloriesBurned} kcal
                            </span>
                            <Badge
                              variant="outline"
                              className="hidden capitalize sm:inline-flex"
                            >
                              {w.category}
                            </Badge>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="size-7 text-muted-foreground hover:text-destructive"
                              onClick={() => handleDelete(w._id)}
                              aria-label="Delete workout"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Workouts() {
  return (
    <AppShell>
      <WorkoutsInner />
    </AppShell>
  );
}
