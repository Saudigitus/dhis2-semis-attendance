import { useCheckFilters, useGetEvents, useUrlParams } from "dhis2-semis-functions"
import useGetSelectedKeys from "../config/useGetSelectedKeys"
import { format } from "date-fns";
import { useSchoolCalendarKey } from "dhis2-semis-components";

//create a function to get occurredAt and format it to yyyy-MM-dd
const getOccurredAt = (date: string) => {
    return format(new Date(date), "yyyy-MM-dd")
}

// create a function to verify if the getOccurredAt is included in the setattendanceHeaders, 
// if exist change the color to green and update in the setattendanceHeaders. 

const verifyOccurredAt = (date: string, setattendanceHeaders: any, completed: string) => {
    const occurredAt = getOccurredAt(date)

    setattendanceHeaders((prev: any[]) => {
        const index = prev.findIndex((header: any) => header.id === occurredAt);

        if (index !== -1) {
            const newHeaders = [...prev];
            newHeaders[index].color = completed == 'true' ? "green" : "orange";
            return newHeaders;
        }

        return prev;
    });
}

export const useGetAttenceStatus = ({ setattendanceHeaders, selectedDates, setAttendanceEvent, setCompletenessLoading, attendanceHeaders }:
    { setAttendanceEvent: (args: any) => void, setattendanceHeaders: (args: any) => void, selectedDates: { occurredAfter: string, occurredBefore: string }, setCompletenessLoading: (args: any) => void, attendanceHeaders: any[] }) => {
    const { getEvents } = useGetEvents()
    const { dataStoreData } = useGetSelectedKeys()
    const { urlParameters } = useUrlParams();
    const { school: orgUnit, academicYear, attendanceMode, selectedDate } = urlParameters;
    const { academicYear: academicYearId } = useSchoolCalendarKey()
    const { getFilters } = useCheckFilters({ filters: (dataStoreData.filters.dataElements ?? []) as unknown as any })
    const { attendance } = dataStoreData

    async function getEnrollmentStatus(tableData: any) {
        setCompletenessLoading({ loading: true })
        const data = await getEvents({
            program: attendance?.attendanceStatus?.program,
            fields: "occurredAt,event,dataValues",
            programStage: attendance?.attendanceStatus?.programStage,
            filter: [...getFilters() as any, [`${academicYearId}:in:${academicYear}`]],
            ...selectedDates,
            orgUnit: orgUnit as unknown as any,
            paging: false
        })

        if (attendanceMode === 'edit') {
            const event = data.find((cdata: any) => getOccurredAt(cdata.occurredAt) === selectedDate)

            setAttendanceEvent(event)
        } else if (dataStoreData?.attendance?.attendanceStatus?.allowAttendanceStatus) {
            let copy = [...attendanceHeaders]

            for (let header of copy) {
                const completeNessEvent = data?.find((x: any) => getOccurredAt(x.occurredAt) === header.id)

                if (completeNessEvent) {
                    const attendanceStatusCompleted = completeNessEvent?.dataValues?.
                        find((x: any) => x.dataElement == dataStoreData.attendance.attendanceStatus?.status)?.
                        value
                    header.color = attendanceStatusCompleted == 'true' ? "green" : "orange";
                }

                if (header.color != "green" && header.color != "orange") {
                    for (let student of tableData?.data) {
                        if (student?.[header?.id]) header.color = 'orange'
                        break
                    }
                }
            }

            setattendanceHeaders(copy)
        }

        setCompletenessLoading({ loading: false })
    }

    return { getEnrollmentStatus }
}