import { api } from "./api";

export type ReviewRequest = {
  project_name: string;
  language: string;
  code: string;
  review_depth: "quick" | "deep";
  source_provider?: string;
  source_repo?: string;
  source_branch?: string;
  source_path?: string;
  source_url?: string;
};

export type ReviewIssue = {
  title: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  category: "Security" | "Bug" | "Performance" | "Readability" | "Best Practice";
  line_number: number;
  description: string;
  suggested_fix: string;
  fixed_code?: string;
};

export type ReviewResponse = {
  review_id?: number;
  project_name: string;
  language: string;
  score: number;
  summary: string;
  issues: ReviewIssue[];
  improved_code: string;
  source_provider?: string | null;
  source_repo?: string | null;
  source_branch?: string | null;
  source_path?: string | null;
  source_url?: string | null;
};

export type PaginatedResponse<T> = {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
};

export type ReviewListItem = {
  id: number;
  project_name: string;
  language: string;
  score: number;
  summary?: string | null;
  improved_code?: string | null;
  source_provider?: string | null;
  source_repo?: string | null;
  source_branch?: string | null;
  source_path?: string | null;
  source_url?: string | null;
  created_at: string;
  issues_count: number;
};

export type IssueListItem = {
  id: number;
  title: string;
  severity: string;
  category: string;
  line_number: number;
  description: string;
  suggested_fix?: string | null;
  fixed_code?: string | null;
  status: "Open" | "In Progress" | "Fixed" | "Ignored";
  github_issue_url?: string | null;
  github_repo?: string | null;
  review_id: number;
  project_name?: string | null;
};

export async function analyzeCode(payload: ReviewRequest): Promise<ReviewResponse> {
  const response = await api.post<ReviewResponse>("/api/v1/reviews/analyze", payload);
  return response.data;
}

export async function getReviews(): Promise<PaginatedResponse<ReviewListItem>> {
  const response = await api.get<PaginatedResponse<ReviewListItem>>("/api/v1/reviews?limit=100&sort_by=created_at&sort_order=desc");
  return response.data;
}

export async function getReview(id: string | number): Promise<ReviewResponse> {
  const response = await api.get<ReviewResponse>(`/api/v1/reviews/${id}`);
  return response.data;
}

export async function getIssues(): Promise<PaginatedResponse<IssueListItem>> {
  const response = await api.get<PaginatedResponse<IssueListItem>>("/api/v1/issues?limit=100");
  return response.data;
}

export async function updateIssueStatus(id: string | number, status: IssueListItem["status"]): Promise<IssueListItem> {
  const response = await api.patch<IssueListItem>(`/api/v1/issues/${id}`, { status });
  return response.data;
}

export async function deleteIssue(id: string | number): Promise<void> {
  await api.delete(`/api/v1/issues/${id}`);
}
