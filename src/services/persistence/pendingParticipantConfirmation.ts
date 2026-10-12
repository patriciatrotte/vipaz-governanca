/** Only an opaque operation ID is stored, never participant names or confirmation notes. */
export type PendingConfirmationStore = Pick<Storage,'getItem'|'setItem'|'removeItem'>;
export function confirmationKey(userId:string,sessionId:string):string {
  if(!userId.trim()||!sessionId.trim())throw Error('Identidade de confirmação incompleta.');
  return `VIPAZ_PENDING_PARTICIPANT:${encodeURIComponent(userId.toLowerCase())}:${sessionId}`;
}
export function getOrCreateConfirmationId(store:PendingConfirmationStore,key:string,generate:()=>string):string {
  let existing:string|null;
  try {existing=store.getItem(key);}catch{throw Error('Não foi possível recuperar a confirmação pendente.');}
  if(existing!==null) {
    if(!/^confirmed-[0-9a-f-]{36}$/i.test(existing))throw Error('Confirmação pendente inválida. Reconcilie antes de prosseguir.');
    return existing;
  }
  const id=`confirmed-${generate()}`;
  if(!/^confirmed-[0-9a-f-]{36}$/i.test(id))throw Error('Identificador de confirmação inválido.');
  try{store.setItem(key,id);}catch{throw Error('Não foi possível preservar a confirmação pendente.');}
  return id;
}
