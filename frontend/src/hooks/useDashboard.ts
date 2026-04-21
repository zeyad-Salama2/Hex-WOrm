import { useQuery } from "@tanstack/react-query";
import { getKpis, type DashboardKpi } from "@/src/lib/api/dashboard";

export function useKpis() {
  return useQuery<DashboardKpi[]>({
    queryKey: ["dashboard", "kpis"],
    queryFn: getKpis,
  });
}