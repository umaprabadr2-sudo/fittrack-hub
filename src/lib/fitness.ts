export type WorkoutCategory = "strength" | "cardio" | "flexibility";
export type Intensity = "low" | "moderate" | "high";

/** Vibrant badge classes per workout category (light theme). */
export const CATEGORY_ACCENT: Record<WorkoutCategory, string> = {
  strength: "border-violet-200 bg-violet-100 text-violet-700",
  cardio: "border-orange-200 bg-orange-100 text-orange-700",
  flexibility: "border-cyan-200 bg-cyan-100 text-cyan-700",
};

/** MET values mirroring the server-side estimator (70 kg reference weight). */
const MET: Record<WorkoutCategory, Record<Intensity, number>> = {
  strength: { low: 3.5, moderate: 5.0, high: 6.5 },
  cardio: { low: 5.0, moderate: 8.0, high: 11.0 },
  flexibility: { low: 2.5, moderate: 3.0, high: 4.0 },
};

export function estimateCaloriesClient(
  category: WorkoutCategory,
  intensity: Intensity,
  minutes: number,
): number {
  const met = MET[category][intensity];
  return Math.round(((met * 3.5 * 70) / 200) * minutes);
}

/** Today's date as YYYY-MM-DD in local time. */
export function todayIso(): string {
  const d = new Date();
  const month = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

/** Short weekday + day label, e.g. "Mon 3" */
export function shortDayLabel(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
  });
}

export function friendlyDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  const today = todayIso();
  if (iso === today) return "Today";
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yIso = `${yesterday.getFullYear()}-${`${yesterday.getMonth() + 1}`.padStart(2, "0")}-${`${yesterday.getDate()}`.padStart(2, "0")}`;
  if (iso === yIso) return "Yesterday";
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatMinutes(total: number): string {
  if (total < 60) return `${Math.round(total)}m`;
  const h = Math.floor(total / 60);
  const m = Math.round(total % 60);
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}
