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
