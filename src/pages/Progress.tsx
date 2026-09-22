import { AppShell } from "@/components/AppShell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { formatMinutes, shortDayLabel } from "@/lib/fitness";
import { useQuery } from "convex/react";
import { Activity, Flame, Timer, TrendingUp } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const CATEGORY_COLORS: Record<string, string> = {
  strength: "var(--chart-1)",
  cardio: "var(--chart-3)",
  flexibility: "var(--chart-4)",
};

export default function Progress() {
  const stats = useQuery(api.workouts.workoutStats, { days: 30 });

  const daily = (stats?.daily ?? []).map((d) => ({
    ...d,
    label: shortDayLabel(d.date),
  }));

  const pieData = (stats?.byCategory ?? [])
    .filter((c) => c.minutes > 0)
    .map((c) => ({ name: c.category, value: c.minutes }));
  const totalCategoryMinutes = pieData.reduce((s, c) => s + c.value, 0);

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">Progress</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your last 30 days of training.
          </p>
        </header>

        {/* Summary tiles */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            {
              icon: Activity,
              label: "Workouts",
              value: String(stats?.totalWorkouts ?? 0),
            },
            {
              icon: Timer,
              label: "Total time",
              value: formatMinutes(stats?.totalMinutes ?? 0),
            },
            {
              icon: Flame,
              label: "Calories",
              value: `${(stats?.totalCalories ?? 0).toLocaleString()} kcal`,
            },
            {
              icon: TrendingUp,
              label: "Active days",
              value: `${stats?.activeDays ?? 0}/30`,
            },
          ].map(({ icon: Icon, label, value }) => (
            <Card key={label} className="shadow-none">
              <CardContent className="pt-6">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Icon className="size-3.5" />
                  {label}
                </span>
                <p className="tabular mt-2 text-2xl font-semibold tracking-tight">
                  {value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="shadow-none lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Calories burned</CardTitle>
              <CardDescription>Daily, last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={daily}
                    margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="calGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="0%"
                          stopColor="var(--chart-1)"
                          stopOpacity={0.25}
                        />
                        <stop
                          offset="100%"
                          stopColor="var(--chart-1)"
                          stopOpacity={0.02}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      interval={4}
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: "1px solid var(--border)",
                        fontSize: 12,
                      }}
                      formatter={(value: number) => [`${value} kcal`, "Calories"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="calories"
                      stroke="var(--chart-1)"
                      strokeWidth={1.5}
                      fill="url(#calGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader>
              <CardTitle className="text-base">Time by category</CardTitle>
              <CardDescription>Last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              {totalCategoryMinutes > 0 ? (
                <>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={55}
                          outerRadius={80}
                          paddingAngle={2}
                          strokeWidth={0}
                        >
                          {pieData.map((entry) => (
                            <Cell
                              key={entry.name}
                              fill={CATEGORY_COLORS[entry.name]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number, name: string) => [
                            `${Math.round((value / totalCategoryMinutes) * 100)}% · ${value}m`,
                            name,
                          ]}
                          contentStyle={{
                            borderRadius: 8,
                            border: "1px solid var(--border)",
                            fontSize: 12,
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <ul className="mt-2 flex flex-col gap-1.5">
                    {pieData.map((c) => (
                      <li
                        key={c.name}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="flex items-center gap-2 capitalize">
                          <span
                            className="inline-block size-2 rounded-full"
                            style={{ background: CATEGORY_COLORS[c.name] }}
                          />
                          {c.name}
                        </span>
                        <span className="tabular text-muted-foreground">
                          {Math.round((c.value / totalCategoryMinutes) * 100)}%
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                  No workouts in the last 30 days.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Active minutes</CardTitle>
            <CardDescription>Daily, last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={daily}
                  margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    interval={4}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "var(--muted)" }}
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid var(--border)",
                      fontSize: 12,
                    }}
                    formatter={(value: number) => [`${value} min`, "Active"]}
                  />
                  <Bar
                    dataKey="minutes"
                    fill="var(--chart-2)"
                    radius={[3, 3, 0, 0]}
                    maxBarSize={14}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
