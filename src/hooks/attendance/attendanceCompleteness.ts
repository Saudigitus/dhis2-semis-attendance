import { useCheckFilters, useShowAlerts, useUploadEvents, useUrlParams } from "dhis2-semis-functions";
import useGetSelectedKeys from "../config/useGetSelectedKeys"
import { useSchoolCalendarKey } from "dhis2-semis-components";

export function useAttendanceCompleteness({ setCompletenessLoading }: { setCompletenessLoading: (args: any) => void }) {
    const { dataStoreData } = useGetSelectedKeys()
    const { urlParameters } = useUrlParams();
    const { academicYear: academicYearId } = useSchoolCalendarKey()
    const { school, academicYear, selectedDate } = urlParameters;
    const { getUrlParamsAsObject } = useCheckFilters({ filters: (dataStoreData?.filters?.dataElements ?? []) as unknown as any })
    const { uploadValues } = useUploadEvents()
    const { hide, show } = useShowAlerts()

    const completeOrDelete = async (attendanceEvent: any) => {
        setCompletenessLoading({ loading: true })
        const importStrategy = attendanceEvent?.event ? 'DELETE' : 'CREATE_AND_UPDATE'
        const eventData = attendanceEvent?.event ? { event: attendanceEvent?.event } : {
            program: dataStoreData.attendance.attendanceStatus?.program,
            programStage: dataStoreData.attendance.attendanceStatus?.programStage,
            orgUnit: school,
            dataValues: [
                {
                    dataElement: academicYearId,
                    value: academicYear
                },
                {
                    dataElement: dataStoreData.attendance.attendanceStatus?.status,
                    value: true
                },
                ...(dataStoreData?.filters?.dataElements?.map((filter: any) => ({
                    dataElement: filter.dataElement,
                    value: getUrlParamsAsObject()[filter.ulrParam]
                })) ?? [])
            ],
            eventDate: selectedDate,
            occurredAt: selectedDate
        }

        await uploadValues({ events: [eventData] }, 'COMMIT', importStrategy)
            .then((resp: any) => {
                if (resp?.validationReport?.errorReports?.length > 0) {
                    show({
                        message: `${("Occurred unknown error!")}`,
                        type: { critical: true }
                    });
                    setTimeout(hide, 5000);
                }
            }).finally(() => setCompletenessLoading((prev: any) => ({ ...prev, refetch: !prev?.refetch })))

        return attendanceEvent?.attendanceStatus === "COMPLETE"
    }

    return { completeOrDelete }
}