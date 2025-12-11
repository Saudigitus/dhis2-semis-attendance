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

const verifyOccurredAt = (date: string, setattendanceHeaders: any) => {
    const occurredAt = getOccurredAt(date)
    setattendanceHeaders((prev: any[]) => {
        const index = prev.findIndex((header: any) => header.id === occurredAt);

        if (index !== -1) {
            const newHeaders = [...prev];
            newHeaders[index].color = "green";
            return newHeaders;
        }
        return prev;
    });
}

export const useGetAttenceStatus = ({ setattendanceHeaders, selectedDates, setAttendanceEvent, setCompletenessLoading }: { setAttendanceEvent: (args: any) => void, setattendanceHeaders: (args: any) => void, selectedDates: { occurredAfter: string, occurredBefore: string }, setCompletenessLoading: (args: any) => void }) => {
    const { getEvents } = useGetEvents()
    const { urlParameters } = useUrlParams();
    const { dataStoreData } = useGetSelectedKeys()
    const { school: orgUnit, academicYear, attendanceMode, selectedDate } = urlParameters;
    const { academicYear: academicYearId } = useSchoolCalendarKey()
    const { getFilters } = useCheckFilters({ filters: (dataStoreData.filters.dataElements ?? []) as unknown as any })

    async function getEnrollmentStatus() {
        setCompletenessLoading({ loading: true })
        const data = await getEvents({
            program: dataStoreData.attendance.attendanceStatus?.program,
            fields: "occurredAt,event",
            programStage: dataStoreData.attendance.attendanceStatus?.programStage,
            filter: [...getFilters() as any, [`${academicYearId}:in:${academicYear}`]],
            ...selectedDates,
            orgUnit: orgUnit as unknown as any,
            skipPaging: true
        })

        if (attendanceMode === 'edit') {
            const event = data.find((cdata: any) => getOccurredAt(cdata.occurredAt) === selectedDate)
            setAttendanceEvent(event)

        } else for (const cdata of data) {
            verifyOccurredAt(cdata.occurredAt, setattendanceHeaders)
        }
        setCompletenessLoading({ loading: false })
    }

    return { getEnrollmentStatus }
}