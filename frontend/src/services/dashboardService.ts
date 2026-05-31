import { api } from "./api";
import type { ReviewListItem } from "./reviewService";

export type DashboardStats = {
  total_reviews: number;
  total_issues: number;
  open_issues: number;
  fixed_issues: number;
  critical_issues: number;
  average_score: number;
  recent_reviews: ReviewListItem[];
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await api.get<DashboardStats>("/api/v1/dashboard/stats");
  return response.data;
}
