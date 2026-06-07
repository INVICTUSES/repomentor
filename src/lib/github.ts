import type { FileNode, GitHubIssue, RepoContext } from "./types";

const GITHUB_API = "https://api.github.com";
const MAX_TREE_ITEMS = 10_000;

function headers(token?: string): HeadersInit {
  const h: HeadersInit = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

async function ghFetch<T>(path: string, token?: string): Promise<T> {
  const res = await fetch(`${GITHUB_API}${path}`, { headers: headers(token) });
  if (!res.ok) {
    if (res.status === 404) throw new Error("GitHub repository not found or not accessible");
    if (res.status === 403) throw new Error("GitHub rate limit reached or access denied");
    throw new Error(`GitHub request failed with status ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function parseRepoUrl(url: string): { owner: string; repo: string } {
  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    throw new Error("Invalid GitHub URL. Example: https://github.com/owner/repo");
  }

  if (parsed.protocol !== "https:" || parsed.hostname.toLowerCase() !== "github.com") {
    throw new Error("Invalid GitHub URL. Example: https://github.com/owner/repo");
  }

  const parts = parsed.pathname.replace(/\/+$/, "").split("/").filter(Boolean);
  if (parts.length !== 2) {
    throw new Error("Use a repository URL like https://github.com/owner/repo");
  }

  const [owner, rawRepo] = parts;
  const repo = rawRepo.replace(/\.git$/, "");
  const namePattern = /^[A-Za-z0-9_.-]+$/;
  if (!namePattern.test(owner) || !namePattern.test(repo) || owner.startsWith(".") || repo.startsWith(".")) {
    throw new Error("Use a valid GitHub owner and repository name");
  }

  return { owner, repo };
}

interface RepoMeta {
  private: boolean;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics?: string[];
  default_branch: string;
}

export interface RepoMetadata {
  owner: string;
  repo: string;
  isPrivate: boolean;
  description: string | null;
  stars: number;
  forks: number;
  language: string | null;
  topics: string[];
  defaultBranch: string;
}

interface TreeItem {
  path: string;
  type: "blob" | "tree";
  size?: number;
}

interface TreeResponse {
  tree: TreeItem[];
  truncated?: boolean;
}

interface IssueItem {
  number: number;
  title: string;
  body: string | null;
  labels: { name: string }[];
  html_url: string;
  state: string;
}

const KEY_FILES = [
  "README.md",
  "readme.md",
  "package.json",
  "requirements.txt",
  "pyproject.toml",
  "Cargo.toml",
  "go.mod",
  "pom.xml",
  "build.gradle",
  "Gemfile",
  "composer.json",
  "Makefile",
  "Dockerfile",
  "docker-compose.yml",
  "CONTRIBUTING.md",
  "LICENSE",
  ".github/workflows",
];

export async function fetchRepoMetadata(
  owner: string,
  repo: string,
  githubToken?: string
): Promise<RepoMetadata> {
  const meta = await ghFetch<RepoMeta>(`/repos/${owner}/${repo}`, githubToken);

  return {
    owner,
    repo,
    isPrivate: meta.private,
    description: meta.description,
    stars: meta.stargazers_count,
    forks: meta.forks_count,
    language: meta.language,
    topics: meta.topics ?? [],
    defaultBranch: meta.default_branch,
  };
}

async function fetchReadme(owner: string, repo: string, token?: string): Promise<string> {
  try {
    const res = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/readme`,
      { headers: { ...headers(token), Accept: "application/vnd.github.raw" } }
    );
    if (!res.ok) return "";
    return res.text();
  } catch {
    return "";
  }
}

async function fetchKeyFileContent(
  owner: string,
  repo: string,
  path: string,
  token?: string
): Promise<string | null> {
  try {
    const res = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`,
      { headers: { ...headers(token), Accept: "application/vnd.github.raw" } }
    );
    if (!res.ok) return null;
    const text = await res.text();
    return text.slice(0, 8000);
  } catch {
    return null;
  }
}

export async function fetchRepoContext(
  url: string,
  githubToken?: string
): Promise<RepoContext> {
  const { owner, repo } = parseRepoUrl(url);

  const meta = await fetchRepoMetadata(owner, repo, githubToken);

  const [treeData, issues] = await Promise.all([
    ghFetch<TreeResponse>(
      `/repos/${owner}/${repo}/git/trees/${meta.defaultBranch}?recursive=1`,
      githubToken
    ),
    ghFetch<IssueItem[]>(
      `/repos/${owner}/${repo}/issues?state=open&per_page=30&sort=updated`,
      githubToken
    ),
  ]);

  if (treeData.truncated || treeData.tree.length > 10000) {
    throw new Error(
      `Repository is too large to analyze safely. RepoMentor supports up to ${MAX_TREE_ITEMS.toLocaleString()} tree items.`
    );
  }

  const readme = await fetchReadme(owner, repo, githubToken);

  const fileTree: FileNode[] = treeData.tree
    .filter((t) => !t.path.startsWith(".git/"))
    .map((t) => ({
      path: t.path,
      type: t.type === "tree" ? "dir" : "file",
      size: t.size,
    }));

  const paths = new Set(fileTree.map((f) => f.path));
  const keyFiles: Record<string, string> = {};

  const filesToFetch = KEY_FILES.filter((kf) => {
    if (paths.has(kf)) return true;
    return fileTree.some(
      (f) => f.path === kf || f.path.startsWith(kf + "/")
    );
  });

  await Promise.all(
    filesToFetch.slice(0, 8).map(async (path) => {
      const content = await fetchKeyFileContent(owner, repo, path, githubToken);
      if (content) keyFiles[path] = content;
    })
  );

  const openIssues: GitHubIssue[] = issues
    .filter((i) => !i.html_url.includes("/pull/"))
    .map((i) => ({
      number: i.number,
      title: i.title,
      body: i.body,
      labels: i.labels.map((l) => l.name),
      url: i.html_url,
      state: i.state,
    }));

  return {
    owner,
    repo,
    url: `https://github.com/${owner}/${repo}`,
    description: meta.description,
    isPrivate: meta.isPrivate,
    stars: meta.stars,
    forks: meta.forks,
    language: meta.language,
    topics: meta.topics,
    defaultBranch: meta.defaultBranch,
    readme: readme.slice(0, 12000),
    fileTree,
    keyFiles,
    issues: openIssues,
  };
}

export function getTopLevelFolders(fileTree: FileNode[]): string[] {
  const folders = new Set<string>();
  for (const node of fileTree) {
    const parts = node.path.split("/");
    if (parts.length === 1 && node.type === "dir") folders.add(parts[0]);
    else if (parts.length > 1) folders.add(parts[0]);
  }
  return [...folders].sort();
}
