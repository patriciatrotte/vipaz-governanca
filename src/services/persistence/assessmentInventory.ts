export type AssessmentRecordState = 'NOT_RECORDED' | 'REQUIRES_REVIEW' | 'INCOMPATIBLE' | 'UNAVAILABLE';
export interface AssessmentInventory {
  state: AssessmentRecordState;
  criterionCount: number;
  capabilityCount: number;
  snapshotCount: number;
  canPublish: false;
}
export function assessRecordInventory(cycle: { id: string; organization_id: string }, criteria: any[], capabilities: any[], snapshots: any[]): AssessmentInventory {
  const activeCriteria = criteria.filter(row => !row.superseded_by);
  const activeCapabilities = capabilities.filter(row => !row.superseded_by);
  const rows = [...activeCriteria, ...activeCapabilities, ...snapshots];
  const incompatible = rows.some(row => row.cycle_id !== cycle.id) ||
    snapshots.some(row => row.organization_id !== cycle.organization_id);
  return {
    state: incompatible ? 'INCOMPATIBLE' : rows.length ? 'REQUIRES_REVIEW' : 'NOT_RECORDED',
    criterionCount: activeCriteria.length,
    capabilityCount: activeCapabilities.length,
    snapshotCount: snapshots.length,
    // Inventory is never proof of validated methodology or sufficient evidence.
    canPublish: false
  };
}
