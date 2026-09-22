import { AppShell } from "@/components/AppShell";
import { LogWorkoutDialog } from "@/components/LogWorkoutDialog";
import { WorkoutPlayer } from "@/components/WorkoutPlayer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import {
  CATEGORY_ACCENT,
  friendlyDate,
  formatMinutes,
  shortDayLabel,
  todayIso,
} from "@/lib/fitness";
import { useMutation, useQuery } from "convex/react";
import { Check, Flame, Footprints, HeartPulse, Play } from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function DashboardInner() {
  const { user } = useAuth();
  const today = todayIso();

  const todayWorkouts = useQuery(api.workouts.workoutsForDate, { date: today });
  const workoutStats = useQuery(api.workouts.workoutStats, { days: 7 });
  const metrics = useQuery(api.metrics.recentMetrics, { days: 14 });
  const todayMetrics = useQuery(api.metrics.metricsForDate, { date: today });
  const rhrTrend = useQuery(api.metrics.rhrTrend);

  const upsertMetrics = useMutation(api.metrics.upsertDailyMetrics);

  const [savingMetrics, setSavingMetrics] = useState(false);

  const chartData = (metrics ?? []).map((m) => ({
    ...m,
    label: shortDayLabel(m.date),
  }));
  const hasStepsData = chartData.some((d) => d.steps !== undefined);

  const weekMinutes = workoutStats?.totalMinutes ?? 0;
  const weekCalories = workoutStats?.totalCalories ?? 0;
  const todayCalories =
    todayWorkouts?.reduce((s, w) => s + w.caloriesBurned, 0) ?? 0;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{friendlyDate(today)}</p>
          <h1 className="font-display mt-1 text-2xl font-bold tracking-tight">
            {user?.name ? `Welcome back, ${user.name}` : "Welcome back"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <LogWorkoutDialog />
          <WorkoutPlayer />
        </div>
      </header>

      {/* Metric row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className="shadow-none">
          <CardContent className="pt-6">
            <span className="flex items-center gap-1.5 text-xs font-medium text-cyan-600">
              <Footprints className="size-3.5" />
              Steps today
            </span>
            <p className="tabular mt-2 text-3xl font-semibold tracking-tight">
              {todayMetrics?.steps !== undefined
                ? todayMetrics.steps.toLocaleString()
                : "—"}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardContent className="pt-6">
            <span className="flex items-center gap-1.5 text-xs font-medium text-rose-600">
              <HeartPulse className="size-3.5" />
              Resting HR
            </span>
            <p className="tabular mt-2 text-3xl font-semibold tracking-tight">
              {todayMetrics?.restingHeartRate ?? rhrTrend ?? "—"}
              {(todayMetrics?.restingHeartRate != null || rhrTrend != null) && (
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  bpm
                </span>
              )}
            </p>
            {todayMetrics?.restingHeartRate === undefined &&
              rhrTrend != null && (
                <p className="mt-1 text-[11px] text-muted-foreground">
                  7-day average
                </p>
              )}
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardContent className="pt-6">
            <span className="flex items-center gap-1.5 text-xs font-medium text-orange-600">
              <Flame className="size-3.5" />
              Calories today
            </span>
            <p className="tabular mt-2 text-3xl font-semibold tracking-tight">
              {todayCalories}
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                kcal
              </span>
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardContent className="pt-6">
            <span className="flex items-center gap-1.5 text-xs text-primary">
              <Play className="size-3.5" />
              This week
            </span>
            <p className="tabular mt-2 text-3xl font-semibold tracking-tight">
              {formatMinutes(weekMinutes)}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {weekCalories} kcal · {workoutStats?.totalWorkouts ?? 0} workouts
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Steps chart */}
        <Card className="shadow-none lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Daily steps</CardTitle>
            <CardDescription>Last 14 days</CardDescription>
          </CardHeader>
          <CardContent>
            {hasStepsData ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v: number) =>
                        v >= 1000 ? `${v / 1000}k` : String(v)
                      }
                    />
                    <Tooltip
                      cursor={{ fill: "var(--muted)" }}
                      contentStyle={{
                        borderRadius: 8,
                        border: "1px solid var(--border)",
                        fontSize: 12,
                      }}
                      formatter={(value: number) => [
                        value.toLocaleString(),
                        "Steps",
                      ]}
                    />
                    <Bar
                      dataKey="steps"
                      fill="var(--chart-1)"
                      radius={[3, 3, 0, 0]}
                      maxBarSize={28}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-64 flex-col items-center justify-center gap-1 text-center">
                <p className="text-sm text-muted-foreground">
                  No step data yet.
                </p>
                <p className="text-xs text-muted-foreground">
                  Log today&apos;s steps below to start the chart.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's metrics input + workouts */}
        <div className="flex flex-col gap-6">
          <TodayMetricsCard
            key={today}
            saved={todayMetrics}
            onSave={async (steps, rhr) => {
              setSavingMetrics(true);
              try {
                await upsertMetrics({
                  date: today,
                  steps: steps ? Number(steps) : undefined,
                  restingHeartRate: rhr ? Number(rhr) : undefined,
                });
              } finally {
                setSavingMetrics(false);
              }
            }}
            saving={savingMetrics}
          />

          <Card className="shadow-none">
            <CardHeader>
              <CardTitle className="text-base">Today&apos;s workouts</CardTitle>
              <CardDescription>
                {todayWorkouts?.length
                  ? `${todayWorkouts.length} logged`
                  : "Nothing logged yet"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {todayWorkouts?.length ? (
                todayWorkouts.map((w) => (
                  <div
                    key={w._id}
                    className="flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {w.exerciseName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {w.durationMinutes} min ·{" "}
                        <span className="capitalize">{w.intensity}</span>
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`capitalize ${CATEGORY_ACCENT[w.category]}`}
                    >
                      {w.category}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Hit “Start session” to train with the live timer.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

interface SavedMetrics {
  steps?: number;
  restingHeartRate?: number;
}

function TodayMetricsCard({
  saved,
  onSave,
  saving,
}: {
  saved: SavedMetrics | undefined | null;
  onSave: (steps: string, rhr: string) => Promise<void>;
  saving: boolean;
}) {
  const [steps, setSteps] = useState(
    saved?.steps !== undefined ? String(saved.steps) : "",
  );
  const [rhr, setRhr] = useState(
    saved?.restingHeartRate !== undefined ? String(saved.restingHeartRate) : "",
  );

  const handleSave = async () => {
    await onSave(steps, rhr);
  };

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="text-base">Today&apos;s metrics</CardTitle>
        <CardDescription>Steps and resting heart rate</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1.5">
            <label htmlFor="steps" className="text-xs text-muted-foreground">
              Steps
            </label>
            <Input
              id="steps"
              inputMode="numeric"
              placeholder="8000"
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <label htmlFor="rhr" className="text-xs text-muted-foreground">
              Heart rate
            </label>
            <Input
              inputMode="numeric"
              placeholder="62"
              value={rhr}
              onChange={(e) => setRhr(e.target.value)}
            />
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5"
          disabled={saving}
          onClick={handleSave}
        >
          <Check className="size-3.5" />
          Save
        </Button>
  </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  return (
    <AppShell>
      <DashboardInner />
    </AppShell>
  );
}
