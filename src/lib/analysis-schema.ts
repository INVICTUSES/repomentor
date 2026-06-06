import { z } from "zod";
import type { RepoAnalysis } from "./types";

export const techStackItemSchema = z.object({
  name: z.string().min(1).max(80),
  category: z.string().min(1).max(80),
  confidence: z.enum(["high", "medium", "low"]),
  evidence: z.string().min(1).max(300),
});

export const folderExplanationSchema = z.object({
  path: z.string().min(1).max(200),
  purpose: z.string().min(1).max(500),
  keyFiles: z.array(z.string().max(300)).max(20),
  beginnerTip: z.string().max(500).optional(),
});

export const issueRecommendationSchema = z.object({
  issueNumber: z.number().int().nonnegative(),
  title: z.string().min(1).max(300),
  url: z.string().url(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  difficultyReason: z.string().min(1).max(500),
  skillsNeeded: z.array(z.string().max(80)).max(12),
  estimatedHours: z.string().min(1).max(80),
  whyGoodFirst: z.string().min(1).max(500),
});

export const learningStepSchema = z.object({
  step: z.number().int().positive(),
  title: z.string().min(1).max(160),
  description: z.string().min(1).max(700),
  resources: z.array(z.string().max(300)).max(10),
  estimatedTime: z.string().min(1).max(80),
});

export const prChecklistItemSchema = z.object({
  item: z.string().min(1).max(240),
  category: z.enum(["code", "tests", "docs", "process"]),
});

export const repoAnalysisSchema = z.object({
  summary: z.string().min(1).max(5000),
  techStack: z.array(techStackItemSchema).max(20),
  setupInstructions: z.array(z.string().min(1).max(500)).max(20),
  folderGuide: z.array(folderExplanationSchema).max(12),
  recommendedIssues: z.array(issueRecommendationSchema).max(8),
  learningPath: z.array(learningStepSchema).max(10),
  prChecklist: z.array(prChecklistItemSchema).max(15),
  testSuggestions: z.array(z.string().min(1).max(500)).max(15),
  beginnerFriendlyScore: z.number().min(1).max(10),
  contributionTips: z.array(z.string().min(1).max(500)).max(12),
});

export function parseRepoAnalysis(value: unknown): RepoAnalysis {
  return repoAnalysisSchema.parse(value);
}
