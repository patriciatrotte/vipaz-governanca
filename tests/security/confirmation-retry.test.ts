import test from 'node:test';
import assert from 'node:assert/strict';
import { confirmationKey,getOrCreateConfirmationId } from '../../src/services/persistence/pendingParticipantConfirmation';

function store() {
  const m=new Map<string,string>();
  return {getItem:(k:string)=>m.get(k)??null,setItem:(k:string,v:string)=>{m.set(k,v);},removeItem:(k:string)=>{m.delete(k);}};
}
const UUID='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
test('confirmation survives connection loss and reload with same opaque identity',()=>{
  const s=store(),key=confirmationKey('user-1',UUID);
  const first=getOrCreateConfirmationId(s,key,()=>UUID);
  let generated=0;
  const second=getOrCreateConfirmationId(s,key,()=>{generated++;return 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';});
  assert.equal(first,second);
  assert.equal(generated,0);
  s.removeItem(key);
  assert.notEqual(getOrCreateConfirmationId(s,key,()=> 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'),first);
});
test('confirmation namespaces differ across actor and session',()=>{
  assert.notEqual(confirmationKey('user-1',UUID),confirmationKey('user-2',UUID));
  assert.notEqual(confirmationKey('user-1',UUID),confirmationKey('user-1','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'));
});
test('invalid pending marker blocks duplicate identity creation',()=>{
  const s=store(),key=confirmationKey('user-1',UUID);
  s.setItem(key,'broken');
  assert.throws(()=>getOrCreateConfirmationId(s,key,()=>UUID),/Reconcilie/);
});
test('storage refusal blocks confirmation',()=>{
  const s={getItem:(_k:string)=>null,setItem:(_k:string,_v:string)=>{throw Error('quota');},removeItem:(_k:string)=>{}};
  assert.throws(()=>getOrCreateConfirmationId(s,'key',()=>UUID),/preservar/);
});

test('two participants in one session receive distinct operation IDs; second timeout retains its ID',()=>{
  const s=store(),key=confirmationKey('user-1',UUID);
  const first=getOrCreateConfirmationId(s,key,()=>UUID);
  // Server confirms first participant; UI clears marker before enabling next person.
  s.removeItem(key);
  const secondUuid='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
  const second=getOrCreateConfirmationId(s,key,()=>secondUuid);
  assert.notEqual(first,second);
  // Simulated network loss on second confirmation: do not clear the marker.
  const resumed=getOrCreateConfirmationId(s,key,()=>{throw Error('new ID would duplicate second participant');});
  assert.equal(resumed,second);
  assert.equal(s.getItem(key),second);
});
test('failed local marker removal prevents starting a new participant',()=>{
  const s=store(),key=confirmationKey('user-1',UUID);
  const first=getOrCreateConfirmationId(s,key,()=>UUID);
  // No successful removeItem: the next attempt MUST reuse the pending ID.
  assert.equal(getOrCreateConfirmationId(s,key,()=> 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'),first);
});
