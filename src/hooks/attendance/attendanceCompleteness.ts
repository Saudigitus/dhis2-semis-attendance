import { useCheckFilters, useShowAlerts, useUploadEvents, useUrlParams, useGetEvents } from "dhis2-semis-functions";
import useGetSelectedKeys from "../config/useGetSelectedKeys"
import { useSchoolCalendarKey } from "dhis2-semis-components";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { completenessLoading } from "../../schema/attendance/completenessLoading";
import { classAttendanceEvent } from "../../schema/attendance/classAttendanceEvent";

export function useAttendanceCompleteness() {
    const setCompletenessLoading = useSetRecoilState(completenessLoading)
    const { dataStoreData } = useGetSelectedKeys()
    const { urlParameters } = useUrlParams();
    const { academicYear: academicYearId } = useSchoolCalendarKey()
    const { school, academicYear, selectedDate } = urlParameters;
    const { getUrlParamsAsObject } = useCheckFilters({ filters: (dataStoreData?.filters?.dataElements ?? []) as unknown as any })
    const { uploadValues } = useUploadEvents()
    const { hide, show } = useShowAlerts()
    const savedAttendanceEvent = useRecoilValue(classAttendanceEvent)
    const { getEvents } = useGetEvents()
    const { getFilters } = useCheckFilters({ filters: (dataStoreData?.filters?.dataElements ?? []) as unknown as any })

    const completeOrDelete = async (totalRecords: number | null, selectedDates: any, status: 'ACTIVE' | 'COMPLETED') => {
        setCompletenessLoading((prev) => ({ ...prev, loading: true }))
        const importStrategy = 'CREATE_AND_UPDATE'
        let summaries = []

        for (const attendaceStatus of dataStoreData?.attendance?.statusOptions) {
            if (status == 'COMPLETED' && !!attendaceStatus?.totalSummary) {
                const { data, pagination } = await getEvents({
                    program: dataStoreData?.program,
                    programStage: dataStoreData.attendance?.programStage,
                    ...selectedDates,
                    orgUnit: school,
                    filter: [
                        [`${dataStoreData?.attendance?.status}:in:${attendaceStatus?.code}`],
                        ...(urlParameters?.academicYear ? [`${academicYearId}:in:${urlParameters?.academicYear}`] : []),
                        ...getFilters(),
                    ],
                    totalPages: true,
                    pageSize: 1
                })

                summaries.push({
                    dataElement: attendaceStatus?.totalSummary,
                    value: pagination?.total
                })
            } else if (attendaceStatus?.totalSummary) {
                summaries.push({
                    dataElement: attendaceStatus.totalSummary,
                    value: null
                })
            }

        }

        const eventData = {
            ...(savedAttendanceEvent?.event ? { event: savedAttendanceEvent?.event } : {}),
            program: dataStoreData.attendance.attendanceStatus?.program,
            programStage: dataStoreData.attendance.attendanceStatus?.programStage,
            orgUnit: school,
            dataValues: [
                ...summaries,
                {
                    dataElement: academicYearId,
                    value: academicYear
                },
                {
                    dataElement: dataStoreData?.attendance?.attendanceStatus?.totalRecords,
                    value: totalRecords
                },
                ...(dataStoreData?.filters?.dataElements?.map((filter: any) => ({
                    dataElement: filter.dataElement,
                    value: getUrlParamsAsObject()[filter.ulrParam]
                })) ?? [])
            ],
            eventDate: selectedDate,
            occurredAt: selectedDate,
            status
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
            })
            .finally(() => setCompletenessLoading((prev: any) => ({ ...prev, refetch: !prev?.refetch })))

    }

    return { completeOrDelete }
}