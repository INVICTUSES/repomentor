import type { FileNode, TechStackItem } from "./types";

const MANIFEST_RULES: {
  file: string;
  tech: { name: string; category: string }[];
}[] = [
  { file: "package.json", tech: [{ name: "Node.js", category: "Runtime" }, { name: "npm", category: "Package Manager" }] },
  { file: "pnpm-lock.yaml", tech: [{ name: "pnpm", category: "Package Manager" }] },
  { file: "yarn.lock", tech: [{ name: "Yarn", category: "Package Manager" }] },
  { file: "requirements.txt", tech: [{ name: "Python", category: "Language" }, { name: "pip", category: "Package Manager" }] },
  { file: "pyproject.toml", tech: [{ name: "Python", category: "Language" }] },
  { file: "Pipfile", tech: [{ name: "Python", category: "Language" }, { name: "Pipenv", category: "Package Manager" }] },
  { file: "Cargo.toml", tech: [{ name: "Rust", category: "Language" }, { name: "Cargo", category: "Package Manager" }] },
  { file: "go.mod", tech: [{ name: "Go", category: "Language" }] },
  { file: "pom.xml", tech: [{ name: "Java", category: "Language" }, { name: "Maven", category: "Build Tool" }] },
  { file: "build.gradle", tech: [{ name: "Java/Kotlin", category: "Language" }, { name: "Gradle", category: "Build Tool" }] },
  { file: "Gemfile", tech: [{ name: "Ruby", category: "Language" }] },
  { file: "composer.json", tech: [{ name: "PHP", category: "Language" }] },
  { file: "Dockerfile", tech: [{ name: "Docker", category: "DevOps" }] },
  { file: "docker-compose.yml", tech: [{ name: "Docker Compose", category: "DevOps" }] },
  { file: "Makefile", tech: [{ name: "Make", category: "Build Tool" }] },
];

const FRAMEWORK_PATTERNS: { pattern: RegExp; name: string; category: string }[] = [
  { pattern: /"next"\s*:/, name: "Next.js", category: "Framework" },
  { pattern: /"react"\s*:/, name: "React", category: "Framework" },
  { pattern: /"vue"\s*:/, name: "Vue.js", category: "Framework" },
  { pattern: /"@angular\//, name: "Angular", category: "Framework" },
  { pattern: /"express"\s*:/, name: "Express", category: "Framework" },
  { pattern: /"fastapi"/i, name: "FastAPI", category: "Framework" },
  { pattern: /"django"/i, name: "Django", category: "Framework" },
  { pattern: /"flask"/i, name: "Flask", category: "Framework" },
  { pattern: /"tailwindcss"/, name: "Tailwind CSS", category: "Styling" },
  { pattern: /"typescript"/, name: "TypeScript", category: "Language" },
  { pattern: /"prisma"/, name: "Prisma", category: "ORM" },
  { pattern: /"jest"/, name: "Jest", category: "Testing" },
  { pattern: /"vitest"/, name: "Vitest", category: "Testing" },
  { pattern: /"pytest"/, name: "pytest", category: "Testing" },
];

const EXTENSION_MAP: Record<string, { name: string; category: string }> = {
  ".ts": { name: "TypeScript", category: "Language" },
  ".tsx": { name: "TypeScript/React", category: "Language" },
  ".js": { name: "JavaScript", category: "Language" },
  ".jsx": { name: "JavaScript/React", category: "Language" },
  ".py": { name: "Python", category: "Language" },
  ".rs": { name: "Rust", category: "Language" },
  ".go": { name: "Go", category: "Language" },
  ".java": { name: "Java", category: "Language" },
  ".rb": { name: "Ruby", category: "Language" },
  ".php": { name: "PHP", category: "Language" },
  ".swift": { name: "Swift", category: "Language" },
  ".kt": { name: "Kotlin", category: "Language" },
};

export function detectTechStack(
  fileTree: FileNode[],
  keyFiles: Record<string, string>,
  primaryLanguage: string | null
): TechStackItem[] {
  const found = new Map<string, TechStackItem>();
  const paths = new Set(fileTree.map((f) => f.path));

  const add = (name: string, category: string, evidence: string, confidence: TechStackItem["confidence"]) => {
    const key = `${category}:${name}`;
    if (!found.has(key)) {
      found.set(key, { name, category, confidence, evidence });
    }
  };

  for (const rule of MANIFEST_RULES) {
    if (paths.has(rule.file)) {
      for (const t of rule.tech) {
        add(t.name, t.category, `Found ${rule.file}`, "high");
      }
    }
  }

  for (const [path, content] of Object.entries(keyFiles)) {
    for (const fp of FRAMEWORK_PATTERNS) {
      if (fp.pattern.test(content)) {
        add(fp.name, fp.category, `Detected in ${path}`, "high");
      }
    }
  }

  const extCounts = new Map<string, number>();
  for (const node of fileTree) {
    if (node.type !== "file") continue;
    const ext = node.path.slice(node.path.lastIndexOf("."));
    if (EXTENSION_MAP[ext]) {
      extCounts.set(ext, (extCounts.get(ext) ?? 0) + 1);
    }
  }

  for (const [ext, count] of extCounts) {
    if (count >= 3) {
      const info = EXTENSION_MAP[ext];
      add(info.name, info.category, `${count} ${ext} files`, count > 10 ? "high" : "medium");
    }
  }

  if (primaryLanguage) {
    add(primaryLanguage, "Language", "GitHub primary language", "high");
  }

  if (paths.has(".github/workflows")) {
    add("GitHub Actions", "CI/CD", "Found .github/workflows", "high");
  }

  return [...found.values()].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.confidence] - order[b.confidence];
  });
}
