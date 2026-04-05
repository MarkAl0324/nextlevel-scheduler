export type StaffingStatus = "none" | "prov_imbalance" | "overstaffed" | "balanced"

/**
 * Determines the staffing status for a single day.
 *
 * @param staffedCount  - MAs with any entry (working, regardless of provider assignment)
 * @param assignedCount - MAs with a provider assigned (non-null provider_id)
 * @param provsCount    - Distinct providers scheduled that day
 */
export function getStaffingStatus(
  staffedCount: number,
  assignedCount: number,
  provsCount: number,
): StaffingStatus {
  if (staffedCount === 0) return "none"
  if (assignedCount < staffedCount) return "prov_imbalance"
  if (staffedCount > provsCount) return "overstaffed"
  return "balanced"
}

export function getStatusBorderClass(status: StaffingStatus): string {
  switch (status) {
    case "none":           return "border-l-[#EF4444]"
    case "prov_imbalance": return "border-l-[#F59E0B]"
    case "overstaffed":    return "border-l-[#3B82F6]"
    case "balanced":       return "border-l-[#61CE70]"
  }
}

export function getStatusLabel(status: StaffingStatus): string {
  switch (status) {
    case "none":           return "No MAs"
    case "prov_imbalance": return "Unassigned MAs"
    case "overstaffed":    return "Overstaffed"
    case "balanced":       return "Balanced"
  }
}

export function getStatusDotColor(status: StaffingStatus): string {
  switch (status) {
    case "none":           return "#EF4444"
    case "prov_imbalance": return "#F59E0B"
    case "overstaffed":    return "#3B82F6"
    case "balanced":       return "#61CE70"
  }
}
