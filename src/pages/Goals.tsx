import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Progress } from "@/components/ui/progress";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Plus, Target, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Goal = Doc<"goals">;

const GOAL_TYPES = [
  { value: "weight_loss", label: "Weight loss" },
  { value: "muscle_gain", label: "Muscle gain" },
  { value: "endurance", label: "Endurance" },
  { value: "custom", label: "Custom" },
] as const;

function GoalsInner() {
  const goals = useQuery(api.goals.listGoals);
  const createGoal = useMutation(api.goals.createGoal);
  const updateGoalProgress = useMutation(api.goals.updateGoalProgress);
  const deleteGoal = useMutation(api.goals.deleteGoal);

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updates, setUpdates] = useState<Record<string, string>>({});
  const [title, setTitle] = useState("");
  const [type, setType] = useState<string>("weight_loss");
  const [currentValue, setCurrentValue] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [unit, setUnit] = useState("kg");
  const [direction, setDirection] = useState<"up" | "down">("down");
  const [targetDate, setTargetDate] = useState("");

  const resetForm = () => {
    setTitle("");
    setType("weight_loss");
    setCurrentValue("");
    setTargetValue("");
    setUnit("kg");
    setDirection("down");
    setTargetDate("");
  };

  const handleCreate = async () => {
    const cur = Number(currentValue);
    const tgt = Number(targetValue);
    if (!title.trim()) {
      toast.error("Give your goal a title");
      return;
    }
    if (!Number.isFinite(cur) || !Number.isFinite(tgt)) {
      toast.error("Enter valid current and target values");
      return;
    }
    setSaving(true);
    try {
      await createGoal({
        title: title.trim(),
        type: type as Goal["type"],
        currentValue: cur,
        targetValue: tgt,
        unit: unit.trim() || "units",
        direction,
        targetDate: targetDate || undefined,
      });
      toast.success("Goal created");
      resetForm();
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create goal",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleProgress = async (goal: Goal, raw: string) => {
    const num = Number(raw);
    if (!Number.isFinite(num)) {
      toast.error("Enter a number");
      return;
    }
    try {
      await updateGoalProgress({ id: goal._id, currentValue: num });
      toast.success("Progress updated");
    } catch {
      // ignore
    }
  };

  const progressPct = (goal: Goal) => {
    const span = Math.abs(goal.startValue - goal.targetValue);
    if (span === 0) return goal.status === "achieved" ? 100 : 0;
    if (goal.direction === "down") {
      const done = Math.max(goal.startValue - goal.currentValue, 0);
      return Math.min(100, Math.max(0, Math.round((done / span) * 100)));
    }
    const done = Math.max(goal.currentValue - goal.startValue, 0);
    return Math.min(100, Math.max(0, Math.round((done / span) * 100)));
  };

  const handleDelete = async (id: Goal["_id"]) => {
    try {
      await deleteGoal({ id });
    } catch {
      // ignore
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Goals</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Set measurable targets and log progress toward them.
          </p>
        </div>
        <Dialog
          open={open}
          onOpenChange={(next) => {
            setOpen(next);
            if (!next) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="size-4" />
              New goal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>New goal</DialogTitle>
              <DialogDescription>
                Define a measurable target — update it as you go.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="goal-title">Title</Label>
                <Input
                  id="goal-title"
                  placeholder="e.g. Lose 5 kg by December"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label>Type</Label>
                  <Select
                    value={type}
                    onValueChange={(v) => {
                      setType(v);
                      const map: Record<
                        string,
                        { unit: string; dir: "up" | "down" }
                      > = {
                        weight_loss: { unit: "kg", dir: "down" },
                        muscle_gain: { unit: "kg", dir: "up" },
                        endurance: { unit: "min", dir: "up" },
                        custom: { unit, dir: direction },
                      };
                      const m = map[v];
                      setUnit(m.unit);
                      setDirection(m.dir);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GOAL_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Direction</Label>
                  <Select
                    value={direction}
                    onValueChange={(v) => setDirection(v as "up" | "down")}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="up">Increase</SelectItem>
                      <SelectItem value="down">Decrease</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="goal-current">Current</Label>
                  <Input
                    id="goal-current"
                    type="number"
                    value={currentValue}
                    onChange={(e) => setCurrentValue(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="goal-target">Target</Label>
                  <Input
                    id="goal-target"
                    type="number"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="goal-unit">Unit</Label>
                  <Input
                    id="goal-unit"
                    placeholder="kg"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="goal-date">Target date (optional)</Label>
                <Input
                  id="goal-date"
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Milestones at 25 / 50 / 75 / 100% are tracked automatically.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleCreate}
                disabled={saving}
                className="w-full"
              >
                {saving ? "Creating…" : "Create goal"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      {!goals ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          Loading…
        </p>
      ) : goals.length === 0 ? (
        <Card className="shadow-none">
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <Target className="size-8 text-muted-foreground/40" />
            <div>
              <p className="text-sm font-medium">No goals yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Create your first goal to start tracking milestones.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {goals.map((goal) => {
            const pct = progressPct(goal);
            const achieved = goal.status === "achieved";
            return (
              <Card key={goal._id} className="shadow-none">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-sm">{goal.title}</CardTitle>
                      <CardDescription className="text-xs">
                        {GOAL_TYPES.find((t) => t.value === goal.type)?.label}
                        {goal.targetDate ? ` · by ${goal.targetDate}` : ""}
                      </CardDescription>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      {achieved && <Badge>Done</Badge>}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-7 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(goal._id)}
                        aria-label="Delete goal"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="flex items-baseline justify-between">
                    <p className="tabular text-2xl font-semibold">
                      {goal.currentValue}{" "}
                      <span className="text-sm font-normal text-muted-foreground">
                        / {goal.targetValue} {goal.unit}
                      </span>
                    </p>
                    <span className="tabular text-sm text-muted-foreground">
                      {pct}%
                    </span>
                  </div>
                  <Progress value={pct} />
                  <div className="grid grid-cols-4 gap-1.5">
                    {[25, 50, 75, 100].map((m) => (
                      <div
                        key={m}
                        className={
                          pct >= m
                            ? "rounded-md border px-2 py-1 text-center text-[11px] font-medium"
                            : "rounded-md border px-2 py-1 text-center text-[11px] text-muted-foreground"
                        }
                      >
                        {m}%
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      className="h-8 flex-1"
                      type="number"
                      placeholder={`New ${goal.unit} value`}
                      value={updates[goal._id] ?? ""}
                      onChange={(e) =>
                        setUpdates((prev) => ({
                          ...prev,
                          [goal._id]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleProgress(goal, updates[goal._id] ?? "");
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleProgress(goal, updates[goal._id] ?? "")}
                    >
                      Update
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Goals() {
  return (
    <AppShell>
      <GoalsInner />
    </AppShell>
  );
}
