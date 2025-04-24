import { useAttendanceConst } from "../../hooks/attendance/attendanceConst";
import { selectedDataStoreKey } from "dhis2-semis-types";
import { getComponent } from "../attendance/getComponent";
import { getAttendanceComponent } from "../attendance/getAttendanceComponent";

export function tableDataFormatter() {
    const { attendanceConst } = useAttendanceConst()
    const { getAttendanceIcon } = getAttendanceComponent({})

    function formatData(data: any[], headers: any[], attendanceOptions: any[], attendanceKey: selectedDataStoreKey['attendance']): any[] {
        const regex = /\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})\b/
        const empty = { key: 'Empty', code: 'Empty' }
        let copyData = [...data];

        if (headers.some(item => regex.test(item.id))) {
            for (const head of headers.filter((x) => x.schoolDay)) {
                for (let index = 0; index < copyData.length; index++) {
                    if (!copyData[index][head.id] || copyData[index][head.id] === undefined) {
                        const icon = getComponent(empty, attendanceConst)

                        copyData[index][head.id] = icon
                    } else {
                        const attendance = attendanceOptions.find(x => x.code === copyData[index][head.id]['status'])

                        const icon = getComponent(attendance, attendanceConst)
                        copyData[index][head.id] = icon
                    }
                }
            }

            for (const head of headers.filter((x) => !x.schoolDay)) {
                for (let index = 0; index < copyData.length; index++) {
                    const icon = getComponent({
                        key: 'NonSchoolDay',
                        code: 'NonSchoolDay'
                    }, attendanceConst)
                    copyData[index][head.id] = icon
                }
            }
        } else {
            for (const head of headers) {
                for (let index = 0; index < copyData.length; index++) {
                    const icon = getAttendanceIcon(attendanceKey.statusOptions, attendanceConst, head.header)
                    copyData[index][head.id] = icon
                }
            }
        }

        return copyData
    }

    return { formatData }
}

