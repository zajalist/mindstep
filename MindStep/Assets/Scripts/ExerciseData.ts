/**
 * ExerciseData.ts
 * Static definitions for all exercises. This is the local source of truth.
 * Exercise metadata is NOT fetched from Firestore in the MVP.
 */

export interface Exercise {
  id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  category: "cooking" | "cleaning" | "personal_care";
  steps: string[];
  assetRefs: { [key: string]: string };
  estimatedMinutes: number;
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
        "Learn to prepare a tomato for cooking. You'll practice grabbing, placing, and cutting skills.",
      difficulty: "easy",
      category: "cooking",
      steps: [
        "Grab tomato and place on your virtual table",
        "Grab knife",
        "Place knife on top of tomato",
        "Cut it"
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
   * Get all exercises (for browsing).
   */
  static getAllExercises(): Exercise[] {
    const exercises: Exercise[] = [];
    for (const key in ExerciseData.EXERCISES) {
      exercises.push(ExerciseData.EXERCISES[key]);
    }
    return exercises;
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
