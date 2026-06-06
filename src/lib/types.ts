export type Difficulty = "beginner" | "intermediate" | "advanced";

export interface RepoContext {
  owner: string;
  repo: string;
  url: string;
  description: string | null;
  isPrivate: boolean;
  stars: number;
  forks: number;
  language: string | null;
  topics: string[];
  defaultBranch: string;
  readme: string;
  fileTree: FileNode[];
  keyFiles: Record<string, string>;
  issues: GitHubIssue[];
}

export interface FileNode {
  path: string;
  type: "file" | "dir";
  size?: number;
}

export interface GitHubIssue {
  number: number;
  title: string;
  body: string | null;
  labels: string[];
  url: string;
  state: string;
}

export interface TechStackItem {
  name: string;
  category: string;
  confidence: "high" | "medium" | "low";
  evidence: string;
}

export interface FolderExplanation {
  path: string;
  purpose: string;
  keyFiles: string[];
  beginnerTip?: string;
}

export interface IssueRecommendation {
  issueNumber: number;
  title: string;
  url: string;
  difficulty: Difficulty;
  difficultyReason: string;
  skillsNeeded: string[];
  estimatedHours: string;
  whyGoodFirst: string;
}

export interface LearningStep {
  step: number;
  title: string;
  description: string;
  resources: string[];
  estimatedTime: string;
}

export interface PRChecklistItem {
  item: string;
  category: "code" | "tests" | "docs" | "process";
}

export interface RepoAnalysis {
  summary: string;
  techStack: TechStackItem[];
  setupInstructions: string[];
  folderGuide: FolderExplanation[];
  recommendedIssues: IssueRecommendation[];
  learningPath: LearningStep[];
  prChecklist: PRChecklistItem[];
  testSuggestions: string[];
  beginnerFriendlyScore: number;
  contributionTips: string[];
}
