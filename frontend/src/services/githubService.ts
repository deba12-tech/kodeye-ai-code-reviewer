import { api } from "./api";

export type GitHubProfile = {
  connected: boolean;
  username?: string | null;
  github_user_id?: string | null;
};

export type GitHubRepo = {
  name: string;
  full_name: string;
  owner: string;
  default_branch: string;
  private: boolean;
  html_url: string;
  language?: string | null;
  updated_at?: string | null;
};

export type GitHubRepoFileItem = {
  name: string;
  path: string;
  type: "file" | "dir";
  size?: number | null;
  language?: string | null;
  importable: boolean;
};

export type GitHubRepoFilesResponse = {
  repo: string;
  branch: string;
  path: string;
  items: GitHubRepoFileItem[];
};

export type GitHubRepoFileContent = {
  repo: string;
  branch: string;
  path: string;
  name: string;
  language: string;
  content: string;
};

export type GitHubScanFileResponse = {
  review_id: number;
  project_name: string;
  language: string;
  score: number;
  issues_count: number;
};

export async function connectGitHub(access_token: string): Promise<GitHubProfile> {
  const response = await api.post<GitHubProfile>("/api/v1/github/connect", { access_token });
  return response.data;
}

export async function getGitHubProfile(): Promise<GitHubProfile> {
  const response = await api.get<GitHubProfile>("/api/v1/github/me");
  return response.data;
}

export async function getGitHubRepos(): Promise<GitHubRepo[]> {
  const response = await api.get<GitHubRepo[]>("/api/v1/github/repos");
  return response.data;
}

export const getRepos = getGitHubRepos;

export async function getRepoFiles(
  owner: string,
  repo: string,
  path = "",
  branch?: string
): Promise<GitHubRepoFilesResponse> {
  const response = await api.get<GitHubRepoFilesResponse>(`/api/v1/github/repos/${owner}/${repo}/files`, {
    params: { path, branch: branch || undefined },
  });
  return response.data;
}

export async function getRepoFileContent(
  owner: string,
  repo: string,
  path: string,
  branch?: string
): Promise<GitHubRepoFileContent> {
  const response = await api.get<GitHubRepoFileContent>(`/api/v1/github/repos/${owner}/${repo}/file`, {
    params: { path, branch: branch || undefined },
  });
  return response.data;
}

export async function scanGithubFile(
  owner: string,
  repo: string,
  path: string,
  branch?: string,
  projectName?: string
): Promise<GitHubScanFileResponse> {
  const response = await api.post<GitHubScanFileResponse>(`/api/v1/github/repos/${owner}/${repo}/scan-file`, {
    path,
    branch: branch || undefined,
    project_name: projectName || undefined,
  });
  return response.data;
}

export async function createGitHubIssue(issue_id: number, repo: string): Promise<{ issue_url: string; repo: string }> {
  const response = await api.post<{ issue_url: string; repo: string }>("/api/v1/github/create-issue", { issue_id, repo });
  return response.data;
}

export async function disconnectGitHub(): Promise<void> {
  await api.delete("/api/v1/github/disconnect");
}
