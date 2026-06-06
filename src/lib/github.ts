import type { FileNode, GitHubIssue, RepoContext } from "./types";

const GITHUB_API = "https://api.github.com";

function headers(token?: string): HeadersInit {
  const h: HeadersInit = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const resolved = token ?? process.env.GITHUB_TOKEN;
  if (resolved) h.Authorization = `Bearer ${resolved}`;
  return h;
}

async function ghFetch<T>(path: string, token?: string): Promise<T> {
  const res = await fetch(`${GITHUB_API}${path}`, { headers: headers(token) });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub API error ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

export function parseRepoUrl(url: string): { owner: string; repo: string } {
  const cleaned = url.trim().replace(/\/$/, "");
  const match = cleaned.match(
    /github\.com\/([^/]+)\/([^/]+?)(?:\.git)?(?:\/.*)?$/
  );
  if (!match) throw new Error("Invalid GitHub URL. Example: https://github.com/owner/repo");
  return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
}

interface RepoMeta {
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics?: string[];
  default_branch: string;
}

interface TreeItem {
  path: string;
  type: "blob" | "tree";
  size?: number;
}

interface TreeResponse {
  tree: TreeItem[];
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

  const meta = await ghFetch<RepoMeta>(`/repos/${owner}/${repo}`, githubToken);

  const [treeData, issues] = await Promise.all([
    ghFetch<TreeResponse>(
      `/repos/${owner}/${repo}/git/trees/${meta.default_branch}?recursive=1`,
      githubToken
    ),
    ghFetch<IssueItem[]>(
      `/repos/${owner}/${repo}/issues?state=open&per_page=30&sort=updated`,
      githubToken
    ),
  ]);

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
    stars: meta.stargazers_count,
    forks: meta.forks_count,
    language: meta.language,
    topics: meta.topics ?? [],
    defaultBranch: meta.default_branch,
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
