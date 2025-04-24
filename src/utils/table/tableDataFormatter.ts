import { getIcon } from "../attendance/getIcon";
import { useAttendanceConst } from "../../hooks/attendance/attendanceConst";

export function tableDataFormatter() {
    const { attendanceConst } = useAttendanceConst()

    function formatData(data: any[], headers: any[], attendanceOptions: any[]): any[] {
        let copyData = [...data];
        const empty = {
            key: 'Empty',
            code: 'Empty'
        }

        for (const head of headers.filter((x) => x.schoolDay)) {
            for (let index = 0; index < copyData.length; index++) {
                if (!copyData[index][head.id] || copyData[index][head.id] === undefined) {
                    const icon = getIcon(empty, attendanceConst)

                    copyData[index][head.id] = icon
                } else {
                    const attendance = attendanceOptions.find(x => x.code === copyData[index][head.id]['status'])

                    const icon = getIcon(attendance??empty, attendanceConst)
                    copyData[index][head.id] = icon
                }
            }
        }

        for (const head of headers.filter((x) => !x.schoolDay)) {
            for (let index = 0; index < copyData.length; index++) {
                const icon = getIcon({
                    key: 'NonSchoolDay',
                    code: 'NonSchoolDay'
                }, attendanceConst)
                copyData[index][head.id] = icon
            }
        }

        return copyData
    }

    return { formatData }
}

