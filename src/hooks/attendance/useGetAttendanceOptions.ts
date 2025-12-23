import useGetSelectedKeys from "../config/useGetSelectedKeys"

export function useAttendanceOptions() {
    const { dataStoreData = {} as unknown as any, program } = useGetSelectedKeys()
    const { attendance } = dataStoreData
    const { statusOptions } = attendance
    const programStatusOptionsValues = program?.programStages?.
        find((x: any) => x?.id == attendance?.programStage)?.programStageDataElements?.
        find((x: any) => x.dataElement?.id == attendance?.status)?.dataElement?.optionSet?.options?.
        map((x: any) => ({ value: x?.value, label: x.label }))

    const validAttendanceStatus = statusOptions?.reduce(
        (acc: any[], student: any) => {
            const opt = programStatusOptionsValues?.find((x: any) => x.value === student.code)

            if (opt) {
                acc.push({
                    ...student,
                    label: opt.label,
                    value: opt.value
                })
            }

            return acc
        }, [])

    return { validAttendanceStatus }
}