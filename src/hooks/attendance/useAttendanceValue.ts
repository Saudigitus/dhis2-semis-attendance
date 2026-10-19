import { useGetRegitration, useShowAlerts, useUploadEvents, useUrlParams } from "dhis2-semis-functions";
import { useRecoilState, useSetRecoilState } from "recoil";
import { TableDataRefetch } from "dhis2-semis-types";
import { TableDataState } from "../../schema/table/tableDataSchema";
import { UseAttendanceValueProps } from "../../types/attendance/attendanceValueTypes";
import { eventBody } from "../../utils/attendance/eventBody";
import useGetSelectedKeys from "../config/useGetSelectedKeys";

export default function useAttendanceValue({
    data,
    position,
    setSelected,
    skipIfUnchanged,
}: UseAttendanceValueProps) {
    const { hide, show } = useShowAlerts();
    const [tableValues, setTableValues] = useRecoilState(TableDataState);
    const setRefetch = useSetRecoilState(TableDataRefetch);
    const { uploadValues } = useUploadEvents();
    const { add, remove } = useUrlParams();
    const { useGetRegitrationDataElements } = useGetRegitration();
    const { urlParameters } = useUrlParams();
    const { selectedDate, school } = urlParameters
    const { dataStoreData } = useGetSelectedKeys()
    const { attendance = {} as any } = dataStoreData
    const allowAttendanceStatus = attendance?.attendanceStatus?.allowAttendanceStatus

    const onchangeValue = async (value: string) => {
        if (skipIfUnchanged === value) return;

        add("position", position(value));
        const dataElements = useGetRegitrationDataElements();
        const importStrategy = allowAttendanceStatus && value === "null" ? "DELETE" : "CREATE_AND_UPDATE";
        const eventData = {
            ...data,
            date: selectedDate,
            school,
            dataElements,
        };

        await uploadValues(
            { events: [eventBody(eventData, value, allowAttendanceStatus)] },
            "COMMIT",
            importStrategy,
        ).then((response: any) => {
            if (response?.validationReport?.errorReports?.length > 0) {
                show({ message: "Occurred unknown error!", type: { critical: true } });
                setTimeout(hide, 5000);
                remove("position");
                return;
            }

            const event = response?.bundleReport?.typeReportMap?.EVENT?.objectReports?.[0]?.uid;
            const index = tableValues?.findIndex((row: any) => row.trackedEntity === data.tei);
            const copy = [...tableValues];

            if (data?.absenceReason === data?.de) {
                copy[index] = {
                    ...copy[index],
                    [data.date]: { ...copy[index][data.date], absenceReason: value },
                    replace: true,
                };
            } else {
                const currentDate = copy?.[index]?.[data.date] || {};
                const { eventId, ...other } = currentDate;
                copy[index] = {
                    ...copy[index],
                    [data.date]: {
                        ...other,
                        ...(allowAttendanceStatus && value === "null" ? {} : { eventId: event }),
                        status: value,
                        absenceOption: undefined,
                    },
                    replace: true,
                };
            }

            remove("position");
            setTableValues(copy);
            setSelected(value);
            setRefetch((previous: any) => !previous);
        });
    };

    return { onchangeValue };
}
