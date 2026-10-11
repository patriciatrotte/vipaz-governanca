import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assessRecordInventory } from '../src/services/persistence/assessmentInventory.ts';
const cycle = { id: 'cycle-a', organization_id: 'org-a' };
test('no records means not recorded, never N1 or permission to publish', () => {
  assert.deepEqual(assessRecordInventory(cycle, [], [], []), {state:'NOT_RECORDED',criterionCount:0,capabilityCount:0,snapshotCount:0,canPublish:false});
});
test('even human-confirmed records require rule and source reconciliation', () => {
  const result = assessRecordInventory(cycle, [{cycle_id:cycle.id,human_status:'CONFIRMED'}], [], []);
  assert.equal(result.state, 'REQUIRES_REVIEW'); assert.equal(result.canPublish,false);
});
test('cross-cycle records are incompatible', () => {
  assert.equal(assessRecordInventory(cycle, [{cycle_id:'cycle-b'}], [], []).state,'INCOMPATIBLE');
});
test('snapshot of another institution is incompatible', () => {
  assert.equal(assessRecordInventory(cycle, [], [], [{cycle_id:cycle.id,organization_id:'org-b'}]).state,'INCOMPATIBLE');
});
test('superseded results do not stand in for an active evaluation', () => {
  assert.equal(assessRecordInventory(cycle, [{cycle_id:cycle.id,superseded_by:'new'}], [], []).state,'NOT_RECORDED');
});
