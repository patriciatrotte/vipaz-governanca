import test from 'node:test';
import assert from 'node:assert/strict';
import { getOrCreatePendingCycle, pendingCycleKey } from '../../src/services/persistence/pendingCycleOpen';

function fakeStorage() {
  const data = new Map<string,string>();
  return {
    getItem: (key:string) => data.get(key) ?? null,
    setItem: (key:string,value:string) => {data.set(key,value);},
    removeItem: (key:string) => {data.delete(key);}
  };
}

test('network failure and reload reuse the exact pending operation', () => {
  const store = fakeStorage();
  const key = pendingCycleKey('Admin@Example.com','org-a');
  const original = getOrCreatePendingCycle(store,key,()=>({
    cycleLegacyId:'cycle-d1-fixed',cycleName:'Ciclo 2026.2',methodologyVersion:'1.0'
  }));
  // A network failure leaves the marker untouched; a fresh caller simulates reload.
  let generated = 0;
  const recovered = getOrCreatePendingCycle(store,key,()=>{
    generated++;
    return {cycleLegacyId:'WRONG',cycleName:'Other',methodologyVersion:'2.0'};
  });
  assert.deepEqual(recovered,original);
  assert.equal(generated,0);
  store.removeItem(key); // only after confirmed success
  const next = getOrCreatePendingCycle(store,key,()=>({
    cycleLegacyId:'cycle-d1-next',cycleName:'Ciclo 2026.2',methodologyVersion:'1.0'
  }));
  assert.notEqual(next.cycleLegacyId,original.cycleLegacyId);
});

test('pending identity is scoped by institutional login and organization', () => {
  assert.equal(pendingCycleKey('ADMIN@example.com','org-a'),pendingCycleKey('admin@example.com','org-a'));
  assert.notEqual(pendingCycleKey('admin@example.com','org-a'),pendingCycleKey('other@example.com','org-a'));
  assert.notEqual(pendingCycleKey('admin@example.com','org-a'),pendingCycleKey('admin@example.com','org-b'));
});

test('corrupt marker fails closed rather than generating another cycle', () => {
  const store=fakeStorage();
  store.setItem('pending','{bad json');
  let generated=0;
  assert.throws(()=>getOrCreatePendingCycle(store,'pending',()=>{
    generated++;
    return {cycleLegacyId:'new',cycleName:'Ciclo',methodologyVersion:'1'};
  }),/reconciliação/);
  assert.equal(generated,0);
});

test('storage failure blocks opening before a database request', () => {
  const broken={
    getItem: (_key:string)=>null,
    setItem: (_key:string,_value:string)=>{throw Error('quota');},
    removeItem: (_key:string)=>{}
  };
  assert.throws(()=>getOrCreatePendingCycle(broken,'pending',()=>({
    cycleLegacyId:'new',cycleName:'Ciclo',methodologyVersion:'1'
  })),/preservar/);
});
