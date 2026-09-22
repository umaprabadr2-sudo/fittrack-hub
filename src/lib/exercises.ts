export type ExerciseCategory = "strength" | "cardio" | "flexibility";

export interface Exercise {
  name: string;
  category: ExerciseCategory;
  muscleGroups: string[];
  description: string;
  /** Short how-to cues shown in the detail dialog. */
  instructions: string[];
}

export const EXERCISES: Exercise[] = [
  // ---------- Strength ----------
  {
    name: "Barbell Back Squat",
    category: "strength",
    muscleGroups: ["Quads", "Glutes", "Core"],
    description:
      "The foundational lower-body lift. Builds raw leg strength and overall power.",
    instructions: [
      "Bar resting on upper traps, feet shoulder-width, toes slightly out.",
      "Brace your core, then sit back and down until thighs reach parallel.",
      "Keep knees tracking over toes; drive through mid-foot to stand.",
    ],
  },
  {
    name: "Bench Press",
    category: "strength",
    muscleGroups: ["Chest", "Triceps", "Shoulders"],
    description:
      "Primary horizontal press for upper-body pushing strength and chest development.",
    instructions: [
      "Lie flat, eyes under the bar, shoulder blades pinched and tucked.",
      "Lower the bar to mid-chest with elbows around 45 degrees.",
      "Press up and slightly back until arms lock out.",
    ],
  },
  {
    name: "Deadlift",
    category: "strength",
    muscleGroups: ["Hamstrings", "Glutes", "Back"],
    description:
      "Full-body posterior chain builder — one of the best measures of total strength.",
    instructions: [
      "Bar over mid-foot, shins close, grip just outside the knees.",
      "Flat back, chest up; take the slack out before pulling.",
      "Push the floor away and stand tall — no hyperextension at the top.",
    ],
  },
  {
    name: "Pull-Up",
    category: "strength",
    muscleGroups: ["Lats", "Biceps", "Core"],
    description:
      "Bodyweight vertical pull for back width and grip strength.",
    instructions: [
      "Hang with an overhand grip slightly wider than shoulders.",
      "Start each rep from a dead hang, shoulders engaged.",
      "Pull until your chin clears the bar, then lower with control.",
    ],
  },
  {
    name: "Overhead Press",
    category: "strength",
    muscleGroups: ["Shoulders", "Triceps", "Core"],
    description:
      "Standing barbell press that builds shoulder strength and trunk stability.",
    instructions: [
      "Bar at collarbone, grip just outside shoulders, glutes tight.",
      "Press straight up, moving your head back out of the bar path.",
      "Lock out overhead with the bar over mid-foot.",
    ],
  },
  {
    name: "Romanian Deadlift",
    category: "strength",
    muscleGroups: ["Hamstrings", "Glutes", "Lower Back"],
    description:
      "Hip-hinge accessory that hammers the hamstrings and improves deadlift lockout.",
    instructions: [
      "Start standing, soft knees, bar against thighs.",
      "Push hips back and slide the bar down your legs.",
      "Stop when you feel a deep hamstring stretch, then drive hips forward.",
    ],
  },
  {
    name: "Push-Up",
    category: "strength",
    muscleGroups: ["Chest", "Triceps", "Core"],
    description:
      "No-equipment pressing staple — scalable from knee push-ups to weighted.",
    instructions: [
      "Hands under shoulders, body in one rigid line.",
      "Lower until chest nearly touches the floor, elbows ~45 degrees.",
      "Push up explosively without letting the hips sag.",
    ],
  },
  {
    name: "Dumbbell Row",
    category: "strength",
    muscleGroups: ["Lats", "Rhomboids", "Biceps"],
    description:
      "Single-arm horizontal row that balances pressing volume and thickens the back.",
    instructions: [
      "One knee and hand on a bench, flat back, dumbbell hanging.",
      "Row the weight to your hip, elbow brushing your ribs.",
      "Lower slowly; avoid rotating the torso.",
    ],
  },
  // ---------- Cardio ----------
  {
    name: "Treadmill Run",
    category: "cardio",
    muscleGroups: ["Full Body", "Legs"],
    description:
      "Indoor running with adjustable pace and incline — ideal for steady-state or intervals.",
    instructions: [
      "Warm up 5 minutes at an easy walk or jog.",
      "Hold a conversational pace for steady state, or alternate 1 min fast / 2 min easy for intervals.",
      "Cool down 5 minutes and stretch.",
    ],
  },
  {
    name: "Outdoor Cycling",
    category: "cardio",
    muscleGroups: ["Quads", "Glutes", "Calves"],
    description:
      "Low-impact endurance work that is easy on the joints and great for long sessions.",
    instructions: [
      "Set saddle height so the knee is slightly bent at the bottom of the stroke.",
      "Keep cadence between 80–95 rpm for endurance rides.",
      "Fuel and hydrate for rides longer than an hour.",
    ],
  },
  {
    name: "Jump Rope",
    category: "cardio",
    muscleGroups: ["Calves", "Shoulders", "Core"],
    description:
      "High-intensity conditioning that also sharpens coordination and footwork.",
    instructions: [
      "Jump just an inch off the ground, landing softly on the balls of your feet.",
      "Spin the rope from the wrists, not the arms.",
      "Start with 30-second intervals and rest as needed.",
    ],
  },
  {
    name: "Rowing Machine",
    category: "cardio",
    muscleGroups: ["Full Body", "Back", "Legs"],
    description:
      "Full-body low-impact cardio — roughly 85% of your muscles per stroke.",
    instructions: [
      "Sequence each stroke: legs, then body, then arms.",
      "Recover in reverse: arms, body, then legs.",
      "Keep the damper moderate (4–6) and drive with the legs, not the lower back.",
    ],
  },
  // ---------- Flexibility ----------
  {
    name: "Vinyasa Yoga Flow",
    category: "flexibility",
    muscleGroups: ["Full Body", "Core"],
    description:
      "A flowing sequence linking breath and movement to build mobility, balance, and mind-body awareness.",
    instructions: [
      "Move one breath per movement through sun salutations.",
      "Flow through standing poses, then finish with seated stretches.",
      "Keep the breath steady and never force a range of motion.",
    ],
  },
  {
    name: "Seated Forward Fold",
    category: "flexibility",
    muscleGroups: ["Hamstrings", "Lower Back"],
    description:
      "Classic hamstring and lower-back stretch — perfect after leg day.",
    instructions: [
      "Sit with legs extended and a long, tall spine.",
      "Hinge forward from the hips, reaching toward your toes.",
      "Breathe deeply and hold 30–60 seconds.",
    ],
  },
  {
    name: "Hip Flexor Stretch",
    category: "flexibility",
    muscleGroups: ["Hips", "Quads"],
    description:
      "Targets the hip flexors that tighten from sitting — essential for squat depth.",
    instructions: [
      "Kneel in a half-kneeling position, back knee on a pad.",
      "Tuck your pelvis and shift gently forward.",
      "Hold 45 seconds per side, breathing slowly.",
    ],
  },
];

export const CATEGORY_LABELS: Record<ExerciseCategory, string> = {
  strength: "Strength",
  cardio: "Cardio",
  flexibility: "Flexibility",
};

export function findExercise(name: string): Exercise | undefined {
  const lower = name.trim().toLowerCase();
  return EXERCISES.find((e) => e.name.toLowerCase() === lower);
}
