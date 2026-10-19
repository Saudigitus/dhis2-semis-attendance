import { eventBody } from "../../utils/attendance/eventBody"
import { useCheckFilters, useGetEvents, useGetRegitration, useUploadEvents, useUrlParams } from "dhis2-semis-functions"
import { useRecoilValue, useSetRecoilState } from "recoil"
import { DisaleButtonsState } from "../../schema/attendance/disableAllBtns"
import { useDaveValuesProps } from "../../types/attendance/attendanceTypes"
import { allStudents } from '../../schema/students/allStudentList';
import { useSchoolCalendarKey } from "dhis2-semis-components"
import { format } from "date-fns"

export function useSaveValues({ setLoading, dataStoreData, setRefetch, setSelected, setOpen, selectedDates }: useDaveValuesProps) {
    const { useQuery, urlParameters } = useUrlParams()
    const date = useQuery.get('selectedDate')!
    const orgUnit = useQuery.get('school')!
    const { uploadValues } = useUploadEvents()
    const disable = useSetRecoilState(DisaleButtonsState)
    const students = useRecoilValue(allStudents)
    const { attendance = {} as unknown as any, program } = dataStoreData
    const allowAttendanceStatus = attendance?.attendanceStatus?.allowAttendanceStatus === true
    const { useGetRegitrationDataElements } = useGetRegitration()
    const { getFilters } = useCheckFilters({ filters: (dataStoreData?.filters?.dataElements ?? []) as unknown as any })
    const { getEvents } = useGetEvents()
    const { academicYear: academicYearId } = useSchoolCalendarKey()

    async function formSubmit(values: any) {
        setLoading(true)
        let events = []
        const importStrategy = (values?.status === 'null' && allowAttendanceStatus) ? 'DELETE' : 'CREATE_AND_UPDATE'
        const rDataElements = useGetRegitrationDataElements()

        let loadedEvents = [], page = 1, pageSize = 500, fetchedEvents: any = []

        do {
            loadedEvents = await getEvents({
                program: dataStoreData?.program,
                orgUnitMode: "SELECTED",
                programStage: dataStoreData.attendance?.programStage,
                ...selectedDates,
                orgUnit: orgUnit,
                filter: [
                    ...(urlParameters?.academicYear ? [`${academicYearId}:in:${urlParameters?.academicYear}`] : []),
                    ...getFilters(),
                ] as any,
                pageSize,
                page,
                fields: "enrollment,event,occurredAt"
            })

            fetchedEvents = [...fetchedEvents, ...loadedEvents]
            page++
        } while (loadedEvents?.length === pageSize)

        const eventsMap = new Map(
            fetchedEvents
                .filter((item: any) => format(new Date(item.occurredAt), 'yyyy-MM-dd') === date)
                .map((item: any) => [item.enrollment, item.event])
        );

        if (importStrategy !== 'DELETE')
            for (const tei of students) {
                const eventId = eventsMap.get(tei.enrollment) ?? null

                events.push(eventBody({
                    tei: tei.trackedEntity,
                    event: eventId,
                    program: program,
                    stage: dataStoreData?.attendance?.programStage,
                    absenceReason: dataStoreData?.attendance?.absenceReason,
                    de: dataStoreData?.attendance?.status,
                    school: orgUnit,
                    enrollment: tei.enrollment,
                    date: date,
                    dataElements: rDataElements,
                }, values.status, allowAttendanceStatus))
            }
        else {
            const enrollmentIds = new Set(students.map(item => item.enrollment))
            events = fetchedEvents?.
                filter((x: any) => format(new Date(x.occurredAt), 'yyyy-MM-dd') === date
                    && enrollmentIds.has(x.enrollment)
                )
        }

        await uploadValues({ events: events }, 'COMMIT', importStrategy)
            .then(() => { disable(false); setLoading(false); setRefetch((prev: any) => (!prev)); setOpen(false); setSelected([]) })
            .catch(() => { setLoading(false); setOpen(false); disable(false) })
    }

    return { formSubmit }
}