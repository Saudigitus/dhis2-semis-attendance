import { eventBody } from "../../utils/attendance/eventBody"
import { useUploadEvents, useUrlParams } from "dhis2-semis-functions"
import { useRecoilValue, useSetRecoilState } from "recoil"
import { DisaleButtonsState } from "../../schema/attendance/disableAllBtns"
import { useDaveValuesProps } from "../../types/attendance/attendanceTypes"
import { allStudents } from '../../schema/students/allStudentList';
import useGetRegitration from "../../utils/common/useGetRegistration"

export function useSaveValues({ setLoading, dataStoreData, setRefetch, setSelected, setOpen }: useDaveValuesProps) {
    const { useQuery } = useUrlParams()
    const date = useQuery.get('selectedDate')!
    const orgUnit = useQuery.get('school')!
    const { uploadValues } = useUploadEvents()
    const disable = useSetRecoilState(DisaleButtonsState)
    const students = useRecoilValue(allStudents)
    const { attendance = {} as unknown as any } = dataStoreData
    const allowAttendanceStatus = attendance?.attendanceStatus?.allowAttendanceStatus === true
    const { useGetRegitrationDataElements } = useGetRegitration()

    async function formSubmit(values: any) {
        setLoading(true)
        let events = []
        const importStrategy = (values?.status === 'null' && allowAttendanceStatus) ? 'DELETE' : 'CREATE_AND_UPDATE'
        const rDataElements = useGetRegitrationDataElements()

        for (const tei of students) {
            const eventId = tei?.[date]?.eventId ?? null

            events.push(eventBody({
                tei: tei.trackedEntity,
                event: eventId,
                program: tei.programId,
                stage: dataStoreData?.attendance?.programStage,
                absenceReason: dataStoreData?.attendance?.absenceReason,
                de: dataStoreData?.attendance?.status,
                school: orgUnit,
                enrollment: tei.enrollmentId,
                date: date,
                dataElements: rDataElements,
            }, values.status, allowAttendanceStatus))
        }

        await uploadValues({ events: events }, 'COMMIT', importStrategy)
            .then(() => { disable(false); setLoading(false); setRefetch((prev: any) => (!prev)); setOpen(false); setSelected([]) })
            .catch(() => { setLoading(false); setOpen(false); disable(false) })
    }

    return { formSubmit }
}