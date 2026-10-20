const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const source = fs.readFileSync(path.join(__dirname, '../src/utils/attendance/stageFields.ts'), 'utf8');
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const mod = { exports: {} };
new Function('module', 'exports', 'require', js)(mod, mod.exports, require);
const { attendanceStageFields, onlyStageValues, onlyStageFilters } = mod.exports;

const stage = (id, ...des) => ({ id, programStageDataElements: des.map(de => ({ dataElement: { id: de } })) });
const program = { programStages: [stage('studentAtt', 'status', 'reason', 'year', 'grade', 'class'), stage('staffAtt', 'status', 'reason')] };
const classValues = [{ dataElement: 'year', value: '2025' }, { dataElement: 'grade', value: 'Grade 1' }, { dataElement: 'class', value: 'A' }];
const filters = ['year:in:2025', ['grade:in:Grade 1'], ['class:in:A']];

test('class values are saved only when the attendance stage has the field', () => {
    assert.deepEqual(onlyStageValues(classValues, attendanceStageFields(program, 'studentAtt')), classValues);
    assert.deepEqual(onlyStageValues(classValues, attendanceStageFields(program, 'staffAtt')), []);
    const partial = { programStages: [stage('att', 'status', 'year')] };
    assert.deepEqual(onlyStageValues(classValues, attendanceStageFields(partial, 'att')), [{ dataElement: 'year', value: '2025' }]);
});

test('attendance records are searched only by fields of the attendance stage', () => {
    assert.deepEqual(onlyStageFilters(filters, attendanceStageFields(program, 'studentAtt')), filters);
    assert.deepEqual(onlyStageFilters(filters, attendanceStageFields(program, 'staffAtt')), []);
});

test('no configuration: nothing is sent', () => {
    assert.deepEqual(onlyStageValues(classValues, attendanceStageFields(undefined, 'x')), []);
});
