/**
 * ExerciseData.ts
 * Static definitions for all exercises. This is the local source of truth.
 * Exercise metadata is NOT fetched from Firestore in the MVP.
 */

export interface Exercise {
  id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard" | "unknown";
  category: "cooking" | "cleaning" | "personal_care" | "daily_living";
  steps: string[];
  assetRefs: { [key: string]: string };
  estimatedMinutes: number;
  icon: string;
  isSkeleton?: boolean;
}

export class ExerciseData {
  /**
   * All available exercises (local static data).
   */
  static readonly EXERCISES: { [key: string]: Exercise } = {
    TOMATO_PREP: {
      id: "exercise_001",
      title: "Tomato Prep",
      description:
        "Learn to prepare a tomato for cooking. Practice grabbing, placing, and cutting skills.",
      difficulty: "easy",
      category: "cooking",
      icon: "knife",
      steps: [
        "Pick up tomato and place on plate",
        "Pick up the knife",
        "Place knife on top of tomato",
        "Cut the tomato"
      ],
      assetRefs: {
        tomato: "Food Pack/Meshes/C_tomato_GEO",
        tomatoMaterial: "Food Pack/Materials/tomato.mat",
        knife: "Kitchen Pack/Meshes/C_knife_chopping_GEO",
        knifeMaterial: "Kitchen Pack/Materials/knife_chopping.mat",
        countertop: "Home Pack/Meshes/C_countertop_empty_GEO",
        countertopMaterial: "Home Pack/Materials/countertop_empty.mat"
      },
      estimatedMinutes: 2
    },

    SET_TABLE: {
      id: "exercise_002",
      title: "Set the Table",
      description:
        "Practice proper table setting. Arrange plate, utensils, and glass in the correct positions.",
      difficulty: "easy",
      category: "cooking",
      icon: "plate",
      steps: [
        "Grab plate from stack and place on table",
        "Grab fork and place to the left of the plate",
        "Grab knife and place to the right of the plate",
        "Grab glass and place at the top-right"
      ],
      assetRefs: {
        plate: "Kitchen Pack/Meshes/C_plate_GEO",
        plateMaterial: "Kitchen Pack/Materials/plate.mat",
        fork: "Kitchen Pack/Meshes/C_fork_GEO",
        knife: "Kitchen Pack/Meshes/C_knife_GEO",
        glass: "Kitchen Pack/Meshes/C_jar_GEO",
        glassMaterial: "Kitchen Pack/Materials/jar.mat",
        table: "Home Pack/Meshes/C_table_dining_GEO",
        tableMaterial: "Home Pack/Materials/table_dining.mat"
      },
      estimatedMinutes: 3
    }
  };

  /**
   * Skeleton activities shown in Browse but not yet playable.
   */
  static readonly SKELETON_ACTIVITIES: Exercise[] = [
    {
      id: "skeleton_laundry",
      title: "Laundry",
      description: "Sort, wash, and fold clothes with step-by-step guidance.",
      difficulty: "unknown",
      category: "daily_living",
      icon: "shirt",
      steps: [],
      assetRefs: {},
      estimatedMinutes: 0,
      isSkeleton: true
    },
    {
      id: "skeleton_grocery",
      title: "Grocery Shopping",
      description: "Practice making a list and selecting items from store shelves.",
      difficulty: "unknown",
      category: "daily_living",
      icon: "cart",
      steps: [],
      assetRefs: {},
      estimatedMinutes: 0,
      isSkeleton: true
    },
    {
      id: "skeleton_bed",
      title: "Making Bed",
      description: "Learn the steps to make your bed neatly each morning.",
      difficulty: "unknown",
      category: "daily_living",
      icon: "bed",
      steps: [],
      assetRefs: {},
      estimatedMinutes: 0,
      isSkeleton: true
    },
    {
      id: "skeleton_watering",
      title: "Watering Plants",
      description: "Care for indoor plants with proper watering technique.",
      difficulty: "unknown",
      category: "daily_living",
      icon: "plant",
      steps: [],
      assetRefs: {},
      estimatedMinutes: 0,
      isSkeleton: true
    },
    {
      id: "skeleton_cleaning",
      title: "Cleaning Up",
      description: "Tidy a room by picking up items and wiping surfaces.",
      difficulty: "unknown",
      category: "cleaning",
      icon: "broom",
      steps: [],
      assetRefs: {},
      estimatedMinutes: 0,
      isSkeleton: true
    },
    {
      id: "skeleton_organizing",
      title: "Organizing Your Day",
      description: "Plan and prioritize daily tasks with a simple schedule.",
      difficulty: "unknown",
      category: "personal_care",
      icon: "calendar",
      steps: [],
      assetRefs: {},
      estimatedMinutes: 0,
      isSkeleton: true
    },
    {
      id: "skeleton_cooking_basics",
      title: "Cooking Basics",
      description: "Practice assembling a simple sandwich from ingredients.",
      difficulty: "unknown",
      category: "cooking",
      icon: "sandwich",
      steps: [],
      assetRefs: {},
      estimatedMinutes: 0,
      isSkeleton: true
    },
    {
      id: "skeleton_dishwashing",
      title: "Washing Dishes",
      description: "Rinse, scrub, and dry dishes in the correct order.",
      difficulty: "unknown",
      category: "cleaning",
      icon: "dish",
      steps: [],
      assetRefs: {},
      estimatedMinutes: 0,
      isSkeleton: true
    }
  ];

  /**
   * Get exercise by ID.
   */
  static getExercise(exerciseId: string): Exercise | null {
    for (const key in ExerciseData.EXERCISES) {
      const exercise = ExerciseData.EXERCISES[key];
      if (exercise.id === exerciseId) {
        return exercise;
      }
    }
    return null;
  }

  /**
   * Get all real (playable) exercises.
   */
  static getAllExercises(): Exercise[] {
    const exercises: Exercise[] = [];
    for (const key in ExerciseData.EXERCISES) {
      exercises.push(ExerciseData.EXERCISES[key]);
    }
    return exercises;
  }

  /**
   * Get all exercises including skeletons (for browse panel).
   */
  static getAllBrowseItems(): Exercise[] {
    const items: Exercise[] = [];
    for (const key in ExerciseData.EXERCISES) {
      items.push(ExerciseData.EXERCISES[key]);
    }
    for (const skeleton of ExerciseData.SKELETON_ACTIVITIES) {
      items.push(skeleton);
    }
    return items;
  }

  /**
   * Get exercises by category.
   */
  static getExercisesByCategory(
    category: "cooking" | "cleaning" | "personal_care"
  ): Exercise[] {
    const exercises: Exercise[] = [];
    for (const key in ExerciseData.EXERCISES) {
      const exercise = ExerciseData.EXERCISES[key];
      if (exercise.category === category) {
        exercises.push(exercise);
      }
    }
    return exercises;
  }
}
