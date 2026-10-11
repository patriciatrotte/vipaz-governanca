import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assessRecordInventory } from '../src/services/persistence/assessmentInventory.ts';
const cycle = { id: 'cycle-a', organization_id: 'org-a', methodology_version_id: 'v1' };
test('no records means not recorded, never N1 or permission to publish', () => {
  assert.deepEqual(assessRecordInventory(cycle, [], [], []), {state:'NOT_RECORDED',criterionCount:0,capabilityCount:0,snapshotCount:0,canPublish:false});
});
test('even human-confirmed records require rule and source reconciliation', () => {
  const result = assessRecordInventory(cycle, [{cycle_id:cycle.id,human_status:'CONFIRMED',methodology_version_id:'v1'}], [], []);
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


test('another methodology version is incompatible even for the same cycle', () => {
  assert.equal(assessRecordInventory(cycle, [{cycle_id:cycle.id,methodology_version_id:'v2'}], [], []).state,'INCOMPATIBLE');
});
test('missing version cannot make an existing evaluation compatible', () => {
  assert.equal(assessRecordInventory(cycle, [], [{cycle_id:cycle.id}], []).state,'INCOMPATIBLE');
});
