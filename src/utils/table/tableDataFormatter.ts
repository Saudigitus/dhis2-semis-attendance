import { useAttendanceConst } from "../../hooks/attendance/attendanceConst";
import { selectedDataStoreKey } from "dhis2-semis-types";
import { getComponent } from "../attendance/getComponent";
import { getAttendanceComponent } from "../attendance/getAttendanceComponent";

export function tableDataFormatter() {
    const { attendanceConst } = useAttendanceConst()
    const { getAttendanceIcon } = getAttendanceComponent()

    function formatData(
        data: any[],
        headers: any[],
        attendanceOptions: any[],
        attendanceKey: selectedDataStoreKey['attendance'],
        selectedDay: string
    ): any[] {
        const regex = /\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})\b/
        const empty = { key: 'Empty', code: 'Empty' }
        let copyData = data.map(item => ({ ...item }))

        if (headers.some(item => regex.test(item.id))) {
            for (const head of headers.filter((x) => x.schoolDay)) {
                for (let index = 0; index < copyData.length; index++) {
                    if (!copyData[index][head.id] || copyData[index][head.id] === undefined) {
                        const icon = getComponent(empty, attendanceConst)

                        copyData[index][head.id] = icon
                    } else {
                        const attendance = attendanceOptions.find(x => x.code === copyData[index][head.id]['status'])
                        console.log(copyData[index], 'KAKAKA')
                        const icon = getComponent(attendance, attendanceConst, copyData?.[index]?.status == 'CANCELLED')
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
                    let options: any = [], status = "", icon: any = '--'
                    const props = {
                        event: copyData[index]?.[selectedDay]?.eventId,
                        ou: copyData[index]?.orgUnitId,
                        tei: copyData[index]?.trackedEntity,
                        program: copyData[index]?.programId,
                        stage: attendanceKey.programStage,
                        de: head.id,
                        date: selectedDay,
                        enrollmentStatus: copyData[index]?.status,
                        enrollment: copyData[index]?.enrollmentId,
                        absenceReason: attendanceKey.absenceReason,
                        statusDataElement: attendanceKey.status,
                    }

                    if (head.id === attendanceKey.status) options = attendanceKey.statusOptions
                    else options = head?.options?.optionSet?.options?.map((option: any) => { return { ...option, code: option.value } }) ?? []

                    if (copyData[index]?.[selectedDay]) {
                        if (head.id === attendanceKey.absenceReason) status = options.find((x: any) => x.code === copyData[index][selectedDay]['absenceOption'])?.code
                        else status = options.find((x: any) => x.code === copyData?.[index]?.[selectedDay]?.['status'])?.code
                    }

                    if (head.id === attendanceKey.absenceReason && copyData?.[index]?.[selectedDay]?.['status'] === attendanceConst('absent')) {
                        icon = getAttendanceIcon(options, attendanceConst, head.header, status, props)
                    } else if (head.id === attendanceKey.status) {
                        icon = getAttendanceIcon(options, attendanceConst, head.header, status, props)
                    }

                    copyData[index][head.id] = icon
                }
            }
        }

        return copyData
    }

    return { formatData }
}

