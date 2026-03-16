import { useQuery } from "@tanstack/react-query";
import {
  getDepartmentComparison,
  getKpis,
  getRecentCampaigns,
  getTrends,
  type DashboardKpi,
  type DepartmentComparison,
  type RecentCampaign,
  type TrendPoint,
} from "@/src/lib/api/dashboard";

export function useKpis() {
  return useQuery<DashboardKpi[]>({
    queryKey: ["dashboard", "kpis"],
    queryFn: getKpis,
  });
}

export function useTrends() {
  return useQuery<TrendPoint[]>({
    queryKey: ["dashboard", "trends"],
    queryFn: getTrends,
  });
}

export function useDepartmentComparison() {
  return useQuery<DepartmentComparison[]>({
    queryKey: ["dashboard", "department-comparison"],
    queryFn: getDepartmentComparison,
  });
}

export function useRecentCampaigns() {
  return useQuery<RecentCampaign[]>({
    queryKey: ["dashboard", "recent-campaigns"],
    queryFn: getRecentCampaigns,
  });
}
