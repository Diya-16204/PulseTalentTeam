import test from 'node:test';
import assert from 'node:assert/strict';
import { parseRange, getRangeResponse } from '../src/utils/streaming.js';

test('parseRange returns null for missing or invalid range headers', () => {
  assert.equal(parseRange(undefined, 1000), null);
  assert.equal(parseRange('items=0-99', 1000), null);
  assert.equal(parseRange('bytes=900-100', 1000), null);
});

test('parseRange reads explicit and open-ended byte ranges', () => {
  assert.deepEqual(parseRange('bytes=0-99', 1000), { start: 0, end: 99 });
  assert.deepEqual(parseRange('bytes=250-', 1000), { start: 250, end: 999 });
});

test('getRangeResponse builds HTTP partial-content headers', () => {
  const response = getRangeResponse(0, 99, 1000);

  assert.equal(response.status, 206);
  assert.equal(response.headers['Content-Range'], 'bytes 0-99/1000');
  assert.equal(response.headers['Content-Length'], 100);
  assert.equal(response.headers['Accept-Ranges'], 'bytes');
});
