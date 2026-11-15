import test from 'node:test';
import assert from 'node:assert/strict';
import {pageNumbers} from '../src/lib/pagination.js';

test('one page',()=>assert.deepEqual(pageNumbers(1,1),[1]));
test('beginning',()=>assert.deepEqual(pageNumbers(1,30),[1,2,30]));
test('middle',()=>assert.deepEqual(pageNumbers(12,30),[1,11,12,13,30]));
test('end',()=>assert.deepEqual(pageNumbers(30,30),[1,29,30]));
test('invalid inputs',()=>assert.deepEqual(pageNumbers(0,0),[]));
