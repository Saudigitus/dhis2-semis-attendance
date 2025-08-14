import { useAttendanceConst } from "../../hooks/attendance/attendanceConst";
import { getComponent } from "../attendance/getComponent";
import { getAttendanceComponent } from "../attendance/getAttendanceComponent";
import useGetSelectedKeys from "../../hooks/config/useGetSelectedKeys";
import { useUrlParams } from "dhis2-semis-functions";
import { useRecoilValue } from "recoil";
import { ReasonOfAbsenseState } from "../../schema/attendance/disableAllBtns";

export function tableDataFormatter() {
    const seeReason = useRecoilValue(ReasonOfAbsenseState)
    const { attendanceConst } = useAttendanceConst()
    const { getAttendanceIcon } = getAttendanceComponent()
    const { dataStoreData } = useGetSelectedKeys()
    const { attendance } = dataStoreData
    const { statusOptions } = attendance
    const { urlParameters } = useUrlParams()
    const { selectedDate } = urlParameters()

    function formatData(data: any[], headers: any[] = []): any[] {
        const regex = /\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})\b/
        const empty = { ConfigKey: 'Empty', code: 'Empty' }
        let copyData = data.map(item => ({ ...item })), configKey: any = {}

        if (headers?.some(item => regex.test(item?.id))) {
            for (const head of headers?.filter((x) => x.schoolDay)) {
                for (let index = 0; index < data.length; index++) {

                    if (!data[index][head?.id] || data[index][head?.id] === undefined) {
                        const icon = getComponent(empty, attendanceConst)
                        copyData[index][head?.id] = icon
                    } else {
                        configKey = (statusOptions as unknown as any)?.find((x: any) => x.code === data?.[index]?.[head?.id]?.['status'])

                        if (seeReason && configKey?.ConfigKey == attendanceConst('absentCode')) {
                            const status = data?.[index]?.[head?.id]?.absenceOption
                            configKey = { ConfigKey: 'Absense', code: status ?? '--' }
                        }

                        const icon = getComponent(configKey, attendanceConst, data?.[index]?.status == 'CANCELLED', seeReason)
                        copyData[index][head?.id] = icon
                    }
                }
            }

            for (const head of headers?.filter((x) => !x.schoolDay)) {
                for (let index = 0; index < copyData.length; index++) {
                    const icon = getComponent({
                        ConfigKey: 'NonSchoolDay',
                        code: 'NonSchoolDay'
                    }, attendanceConst)
                    copyData[index][head?.id] = icon
                }
            }
        } else {
            for (const head of headers) {
                for (let index = 0; index < copyData.length; index++) {
                    let options: any = [], status = "", icon: any = '--'
                    const configKey = (statusOptions as unknown as any)?.find((x: any) => x.code === copyData?.[index]?.[selectedDate!]?.['status'])?.ConfigKey

                    const props = {
                        event: copyData[index]?.[selectedDate!]?.eventId,
                        ou: copyData[index]?.orgUnitId,
                        tei: copyData[index]?.trackedEntity,
                        program: copyData[index]?.programId,
                        stage: attendance.programStage,
                        de: head?.id,
                        date: selectedDate!,
                        enrollmentStatus: copyData[index]?.status,
                        enrollment: copyData[index]?.enrollmentId,
                        absenceReason: attendance.absenceReason,
                        statusDataElement: attendance.status,
                    }

                    if (head?.id === attendance.status) options = attendance.statusOptions
                    else options = head?.options?.optionSet?.options?.map((option: any) => { return { ...option, code: option.value } }) ?? []

                    if (copyData[index]?.[selectedDate!]) {
                        if (head?.id === attendance.absenceReason) status = options.find((x: any) => x.code === copyData[index][selectedDate!]['absenceOption'])?.code
                        else status = options.find((x: any) => x.code === copyData?.[index]?.[selectedDate!]?.['status'])?.code
                    }

                    if (head?.id === attendance.absenceReason && configKey === attendanceConst('absentCode')) {
                        icon = getAttendanceIcon(options, attendanceConst, 'absence', status, props)
                    } else if (head?.id === attendance.status) {
                        icon = getAttendanceIcon(options, attendanceConst, 'attendance', status, props)
                    }

                    copyData[index][head?.id] = icon
                }
            }
        }

        return copyData
    }

    return { formatData }
}

