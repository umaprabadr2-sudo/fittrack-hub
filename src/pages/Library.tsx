import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  CATEGORY_LABELS,
  EXERCISES,
  type Exercise,
} from "@/lib/exercises";
import { CATEGORY_ACCENT } from "@/lib/fitness";
import { Info } from "lucide-react";
import { useMemo, useState } from "react";

const CATEGORIES = ["all", "strength", "cardio", "flexibility"] as const;

function LibraryInner() {
  const [filter, setFilter] = useState<(typeof CATEGORIES)[number]>("all");
  const [selected, setSelected] = useState<Exercise | null>(null);

  const visible = useMemo(
    () => (filter === "all" ? EXERCISES : EXERCISES.filter((e) => e.category === filter)),
    [filter],
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Exercise library
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {EXERCISES.length} exercises with descriptions and form cues.
        </p>
      </header>

      <div className="flex gap-1.5">
        {CATEGORIES.map((c) => (
          <Button
            key={c}
            size="sm"
            variant={filter === c ? "default" : "outline"}
            className="h-8 capitalize"
            onClick={() => setFilter(c)}
          >
            {c === "all" ? "All" : CATEGORY_LABELS[c]}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((exercise) => (
          <Card
            key={exercise.name}
            className="shadow-none transition-colors hover:border-foreground/25"
          >
            <CardContent className="flex h-full flex-col gap-2 pt-6">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-sm font-medium leading-snug">
                  {exercise.name}
                </h2>
                <Badge
                  variant="outline"
                  className={`shrink-0 capitalize ${CATEGORY_ACCENT[exercise.category]}`}
                >
                  {exercise.category}
                </Badge>
              </div>
              <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                {exercise.description}
              </p>
              <p className="mt-auto pt-2 text-[11px] text-muted-foreground/80">
                {exercise.muscleGroups.join(" · ")}
              </p>
              <Button
                size="sm"
                variant="ghost"
                className="mt-1 h-7 w-fit gap-1 px-2 text-xs text-muted-foreground"
                onClick={() => setSelected(exercise)}
              >
                <Info className="size-3.5" />
                How to
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          {selected && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <DialogTitle>{selected.name}</DialogTitle>
                  <Badge
                    variant="outline"
                    className={`capitalize ${CATEGORY_ACCENT[selected.category]}`}
                  >
                    {selected.category}
                  </Badge>
                </div>
                <DialogDescription>{selected.description}</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-3">
                <p className="text-xs text-muted-foreground">
                  {selected.muscleGroups.join(" · ")}
                </p>
                <ol className="flex flex-col gap-2.5">
                  {selected.instructions.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm leading-relaxed">
                      <span
                        className={cn(
                          "tabular flex size-5 shrink-0 items-center justify-center rounded-full",
                          "bg-muted text-[11px] font-medium text-muted-foreground",
                        )}
                      >
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function Library() {
  return (
    <AppShell>
      <LibraryInner />
    </AppShell>
  );
}
