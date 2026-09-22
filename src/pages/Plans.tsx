import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PLAN_TEMPLATES } from "@/lib/plan-templates";

type SavedPlan = Doc<"workoutPlans">;

interface BuilderExercise {
  name: string;
  sets: string;
  reps: string;
  minutes: string;
}

interface BuilderDay {
  label: string;
  exercises: BuilderExercise[];
}

const EMPTY_DAY: BuilderDay = { label: "", exercises: [] };
const EMPTY_EXERCISE: BuilderExercise = { name: "", sets: "", reps: "", minutes: "" };

function PlansInner() {
  const plans = useQuery(api.plans.listPlans);
  const createPlan = useMutation(api.plans.createPlan);
  const deletePlan = useMutation(api.plans.deletePlan);

  const [builderOpen, setBuilderOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [days, setDays] = useState<BuilderDay[]>([{ ...EMPTY_DAY, exercises: [{ ...EMPTY_EXERCISE }] }]);
  const [saving, setSaving] = useState(false);

  const resetBuilder = () => {
    setName("");
    setDescription("");
    setDays([{ ...EMPTY_DAY, exercises: [{ ...EMPTY_EXERCISE }] }]);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Give your plan a name");
      return;
    }
    const cleanedDays = days
      .map((d) => ({
        dayLabel: d.label.trim() || `Day ${days.indexOf(d) + 1}`,
        exercises: d.exercises
          .filter((e) => e.name.trim())
          .map((e) => ({
            name: e.name.trim(),
            ...(e.sets ? { sets: Number(e.sets) } : {}),
            ...(e.reps ? { reps: Number(e.reps) } : {}),
            ...(e.minutes ? { durationMinutes: Number(e.minutes) } : {}),
          })),
      }))
      .filter((d) => d.exercises.length > 0);

    if (cleanedDays.length === 0) {
      toast.error("Add at least one exercise");
      return;
    }

    setSaving(true);
    try {
      await createPlan({
        name: name.trim(),
        description: description || undefined,
        days: cleanedDays,
      });
      toast.success("Plan saved");
      resetBuilder();
      setBuilderOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save plan");
    } finally {
      setSaving(false);
    }
  };

  const handleUseTemplate = async (templateName: string) => {
    const template = PLAN_TEMPLATES.find((t) => t.name === templateName);
    if (!template) return;
    try {
      await createPlan({
        name: template.name,
        description: template.description,
        days: template.days,
      });
      toast.success(`“${template.name}” added to your plans`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save plan");
    }
  };

  const handleDelete = async (id: SavedPlan["_id"]) => {
    try {
      await deletePlan({ id });
    } catch {
      // ignore
    }
  };

  const updateDay = (i: number, patch: Partial<BuilderDay>) =>
    setDays((prev) => prev.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));

  const updateExercise = (
    dayIdx: number,
    exIdx: number,
    patch: Partial<BuilderExercise>,
  ) =>
    setDays((prev) =>
      prev.map((d, idx) =>
        idx === dayIdx
          ? {
              ...d,
              exercises: d.exercises.map((e, j) =>
                j === exIdx ? { ...e, ...patch } : e,
              ),
            }
          : d,
      ),
    );

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Plans</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Start from a template or build a routine from scratch.
          </p>
        </div>
        <Dialog open={builderOpen} onOpenChange={setBuilderOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="size-4" />
              New plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create a plan</DialogTitle>
              <DialogDescription>
                Group exercises into days. Sets/reps for strength, minutes for cardio.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="plan-name">Plan name</Label>
                <Input
                  id="plan-name"
                  placeholder="e.g. Winter Strength Block"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="plan-desc">Description (optional)</Label>
                <Textarea
                  id="plan-desc"
                  rows={2}
                  placeholder="What is this plan for?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {days.map((day, i) => (
                <div key={i} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <Input
                      className="h-8 border-0 bg-muted/50 px-2 text-sm font-medium"
                      placeholder={`Day ${i + 1} label`}
                      value={day.label}
                      onChange={(e) => updateDay(i, { label: e.target.value })}
                    />
                    {days.length > 1 && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-7 shrink-0 text-muted-foreground"
                        onClick={() =>
                          setDays((prev) => prev.filter((_, idx) => idx !== i))
                        }
                        aria-label="Remove day"
                      >
                        <X className="size-3.5" />
                      </Button>
                    )}
                  </div>
                  <div className="mt-2 flex flex-col gap-2">
                    {day.exercises.map((ex, j) => (
                      <div key={j} className="flex items-center gap-2">
                        <Input
                          className="h-8 flex-1"
                          placeholder="Exercise"
                          value={ex.name}
                          onChange={(e) =>
                            updateExercise(i, j, { name: e.target.value })
                          }
                        />
                        <Input
                          className="h-8 w-16"
                          placeholder="sets"
                          value={ex.sets}
                          onChange={(e) =>
                            updateExercise(i, j, { sets: e.target.value })
                          }
                        />
                        <Input
                          className="h-8 w-16"
                          placeholder="reps"
                          value={ex.reps}
                          onChange={(e) =>
                            updateExercise(i, j, { reps: e.target.value })
                          }
                        />
                        <Input
                          className="h-8 w-16"
                          placeholder="min"
                          value={ex.minutes}
                          onChange={(e) =>
                            updateExercise(i, j, { minutes: e.target.value })
                          }
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-7 shrink-0 text-muted-foreground"
                          onClick={() =>
                            updateDay(i, {
                              exercises: day.exercises.filter(
                                (_, idx) => idx !== j,
                              ),
                            })
                          }
                          aria-label="Remove exercise"
                        >
                          <X className="size-3.5" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-fit gap-1 px-2 text-xs text-muted-foreground"
                      onClick={() =>
                        updateDay(i, {
                          exercises: [...day.exercises, { ...EMPTY_EXERCISE }],
                        })
                      }
                    >
                      <Plus className="size-3.5" />
                      Add exercise
                    </Button>
                  </div>
                </div>
              ))}

              <Button
                variant="outline"
                size="sm"
                className="w-fit gap-1.5"
                onClick={() =>
                  setDays((prev) => [
                    ...prev,
                    { ...EMPTY_DAY, exercises: [{ ...EMPTY_EXERCISE }] },
                  ])
                }
              >
                <Plus className="size-3.5" />
                Add day
              </Button>
            </div>
            <DialogFooter>
              <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving ? "Saving…" : "Save plan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      {/* Saved plans */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">Your plans</h2>
        {!plans ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : plans.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No plans yet — add a template below or create your own.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <Card key={plan._id} className="shadow-none">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm">{plan.name}</CardTitle>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(plan._id)}
                      aria-label="Delete plan"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                  {plan.description && (
                    <CardDescription className="text-xs leading-relaxed">
                      {plan.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="flex flex-col gap-2 pt-0">
                  {plan.days.map((day, i) => (
                    <div
                      key={i}
                      className="rounded-md border px-3 py-2 last:mb-0"
                    >
                      <p className="text-xs font-medium">{day.dayLabel}</p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                        {day.exercises
                          .map((e) =>
                            e.sets != null && e.reps != null
                              ? `${e.name} ${e.sets}×${e.reps}`
                              : e.durationMinutes != null
                                ? `${e.name} ${e.durationMinutes}m`
                                : e.name,
                          )
                          .join(" · ")}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Templates */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">Templates</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {PLAN_TEMPLATES.map((template) => (
            <Card key={template.name} className="shadow-none">
              <CardHeader>
                <CardTitle className="text-sm">{template.name}</CardTitle>
                <CardDescription className="text-xs leading-relaxed">
                  {template.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 pt-0">
                {template.days.map((day, i) => (
                  <div key={i} className="rounded-md border px-3 py-2">
                    <p className="text-xs font-medium">{day.dayLabel}</p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                      {day.exercises
                        .map((e) =>
                          e.sets && e.reps
                            ? `${e.name} ${e.sets}×${e.reps}`
                            : e.durationMinutes
                              ? `${e.name} ${e.durationMinutes}m`
                              : e.name,
                        )
                        .join(" · ")}
                    </p>
                  </div>
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-1"
                  onClick={() => handleUseTemplate(template.name)}
                >
                  Use this template
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function Plans() {
  return (
    <AppShell>
      <PlansInner />
    </AppShell>
  );
}
