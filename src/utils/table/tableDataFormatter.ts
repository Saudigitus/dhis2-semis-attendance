import { useAttendanceConst } from "../../hooks/attendance/attendanceConst";
import { getComponent } from "../attendance/getComponent";
import { getAttendanceComponent } from "../attendance/getAttendanceComponent";
import useGetSelectedKeys from "../../hooks/config/useGetSelectedKeys";
import { useUrlParams } from "dhis2-semis-functions";
import { useRecoilValue } from "recoil";
import { ReasonOfAbsenseState } from "../../schema/attendance/disableAllBtns";
import { useAttendanceOptions } from "../../hooks/attendance/useGetAttendanceOptions";

export function tableDataFormatter() {
    const seeReason = useRecoilValue(ReasonOfAbsenseState)
    const { attendanceConst } = useAttendanceConst()
    const { getAttendanceIcon } = getAttendanceComponent()
    const { dataStoreData = {} as unknown as any } = useGetSelectedKeys()
    const { attendance } = dataStoreData
    const { urlParameters } = useUrlParams()
    const { selectedDate } = urlParameters
    const { validAttendanceStatus } = useAttendanceOptions()

    function formatData(data: any[], headers: any[] = [], attendanceEvent: any = null): any[] {
        const regex = /\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})\b/
        const empty = { configKey: 'Empty', code: 'Empty' }
        let copyData = data.map(item => ({ ...item })), configKey: any = {}
        const allowAttendanceStatus = dataStoreData?.attendance?.attendanceStatus?.allowAttendanceStatus
        const disableAttendance = allowAttendanceStatus === true && !!!attendanceEvent ? true :
            allowAttendanceStatus === true && attendanceEvent?.status === 'ACTIVE' ? false
                : allowAttendanceStatus === true && attendanceEvent?.status == 'COMPLETED' ? true : false

        if (headers?.some(item => regex.test(item?.id))) {
            for (const head of headers?.filter((x) => x.schoolDay)) {
                for (let index = 0; index < data.length; index++) {

                    if (!data[index][head?.id] || data[index][head?.id] === undefined) {
                        const icon = getComponent(empty, attendanceConst)
                        copyData[index][head?.id] = icon
                    } else {
                        configKey = (validAttendanceStatus as unknown as any)?.find((x: any) => x.code === data?.[index]?.[head?.id]?.['status'])

                        if (seeReason && configKey?.configKey == attendanceConst('absentCode')) {
                            const status = data?.[index]?.[head?.id]?.absenceOption
                            configKey = { configKey: 'Absense', code: status ?? '--', label: status ?? '--' }
                        }

                        const icon = getComponent(configKey, attendanceConst, data?.[index]?.status == 'CANCELLED', seeReason)
                        copyData[index][head?.id] = icon
                    }
                }
            }

            for (const head of headers?.filter((x) => !x.schoolDay)) {
                for (let index = 0; index < copyData.length; index++) {
                    const icon = getComponent({
                        configKey: 'NonSchoolDay',
                        code: 'NonSchoolDay'
                    }, attendanceConst)
                    copyData[index][head?.id] = icon
                }
            }
        } else {
            for (const head of headers) {
                for (let index = 0; index < copyData.length; index++) {
                    let options: any = [],
                        status = (allowAttendanceStatus === true && !!attendanceEvent) ? "null" : "",
                        icon: any = '--'

                    const configKey = (validAttendanceStatus as unknown as any)?.find((x: any) => x.code === copyData?.[index]?.[selectedDate!]?.['status'])?.configKey

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
                        disabled: disableAttendance
                    }


                    if (head?.id === attendance.status) options = validAttendanceStatus
                    else options = head?.options?.optionSet?.options?.map((option: any) => { return { ...option, code: option.value } }) ?? []

                    if (copyData[index]?.[selectedDate!]) {
                        if (head?.id === attendance.absenceReason) {
                            status = allowAttendanceStatus === true && !attendanceEvent ? '' : options.find((x: any) => x.code === copyData[index][selectedDate!]['absenceOption'])?.code
                        } else {
                            status = allowAttendanceStatus === true && !attendanceEvent ? '' :
                                options.find((x: any) => x.code === copyData?.[index]?.[selectedDate!]?.['status'])?.code ?? copyData?.[index]?.[selectedDate!]?.['status']
                        }
                    }

                    // console.log(status,'the status')
                    if (head?.id === attendance.absenceReason && configKey === attendanceConst('absentCode')) {
                        icon = getAttendanceIcon(options, attendanceConst, 'absence', status, props)
                    } else if (head?.id === attendance.status) {

                        let updatedOptions = []
                        if (allowAttendanceStatus === true) {
                            updatedOptions = options?.filter((option: any) => option.configKey !== 'presentCode')
                            updatedOptions?.unshift({ configKey: 'null', code: 'null', key: 'null' })
                        } else updatedOptions = options

                        console.log(status)

                        icon = getAttendanceIcon(updatedOptions, attendanceConst, 'attendance', status, props, options?.length > 5)
                    }

                    copyData[index][head?.id] = icon
                }
            }
        }

        return copyData
    }

    return { formatData }
}

