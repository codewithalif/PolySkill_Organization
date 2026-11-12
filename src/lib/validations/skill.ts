import { z } from "zod";
import { SKILL_CATEGORIES, SKILL_LEVELS } from "@/lib/constants";

export const studentSkillSchema = z.object({
  name: z.string().min(1, "Skill name is required").max(60),
  category: z.enum(SKILL_CATEGORIES),
  level: z.enum(SKILL_LEVELS),
  progress: z.number().min(0).max(100),
  targetDate: z.string().optional().nullable(),
  learningGoal: z.string().max(300).optional().nullable(),
});

export type StudentSkillInput = z.infer<typeof studentSkillSchema>;
