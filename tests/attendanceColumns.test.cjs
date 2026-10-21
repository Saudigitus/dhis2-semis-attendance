const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const source = fs.readFileSync(path.join(__dirname, '../src/utils/common/getAttendanceDEHeaders.ts'), 'utf8');
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const mod = { exports: {} };
const stubRequire = name => name === 'dhis2-semis-types' ? { VariablesTypes: { Attendance: 'attendance' } } : require(name);
new Function('module', 'exports', 'require', js)(mod, mod.exports, stubRequire);
const { getAttendanceDEHeaders } = mod.exports;

const de = id => ({ displayInReports: true, dataElement: { id, displayName: id } });
const program = { programStages: [{ id: 'att', programStageDataElements: ['year', 'grade', 'class', 'status', 'reason'].map(de) }] };

function columnsFor(columnDataElements) {
    let headers;
    getAttendanceDEHeaders({ setattendanceHeaders: h => { headers = h } }).getDataElementsHeaders(program, 'att', columnDataElements);
    return headers.map(h => h.id);
}

test('Take attendance adds only the status and the reason of absence columns (SEMIS-227)', () => {
    assert.deepEqual(columnsFor(['status', 'reason']), ['status', 'reason']);
});

test('grade and class/section of the attendance stage never replace the enrollment columns (SEMIS-227)', () => {
    const ids = columnsFor(['status', 'reason']);
    assert.ok(!ids.includes('grade') && !ids.includes('class') && !ids.includes('year'));
});

test('without a reason of absence configured, only the status column (SEMIS-227)', () => {
    assert.deepEqual(columnsFor(['status']), ['status']);
});
