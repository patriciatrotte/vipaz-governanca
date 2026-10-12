/**
 * Local retry marker only; never grants authorization.
 * A database transaction with unique cycle legacy_id remains the source of truth.
 */
export type PendingCycleOpen = {
  cycleLegacyId: string;
  cycleName: string;
  methodologyVersion: string;
};

export type PendingCycleStore = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export function pendingCycleKey(userId: string, canonicalOrganizationId: string): string {
  if (!userId.trim() || !canonicalOrganizationId.trim()) {
    throw new Error('Identidade institucional incompleta.');
  }
  return `VIPAZ_PENDING_D1_OPEN:${encodeURIComponent(userId.trim().toLowerCase())}:${canonicalOrganizationId}`;
}

export function getOrCreatePendingCycle(
  store: PendingCycleStore,
  key: string,
  create: () => PendingCycleOpen
): PendingCycleOpen {
  let raw: string | null;
  try { raw = store.getItem(key); }
  catch { throw new Error('Não foi possível recuperar a abertura pendente.'); }
  if (raw !== null) {
    let parsed: unknown;
    try { parsed = JSON.parse(raw); }
    catch { throw new Error('Operação pendente inválida. É necessária reconciliação.'); }
    if (!parsed || typeof parsed !== 'object' ||
      typeof (parsed as PendingCycleOpen).cycleLegacyId !== 'string' ||
      !(parsed as PendingCycleOpen).cycleLegacyId.trim() ||
      typeof (parsed as PendingCycleOpen).cycleName !== 'string' ||
      !(parsed as PendingCycleOpen).cycleName.trim() ||
      typeof (parsed as PendingCycleOpen).methodologyVersion !== 'string' ||
      !(parsed as PendingCycleOpen).methodologyVersion.trim()) {
      throw new Error('Operação pendente inválida. É necessária reconciliação.');
    }
    return parsed as PendingCycleOpen;
  }
  const pending = create();
  try { store.setItem(key, JSON.stringify(pending)); }
  catch { throw new Error('Não foi possível preservar o identificador da operação.'); }
  return pending;
}
