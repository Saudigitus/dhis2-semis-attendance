import { useDataStoreKey } from "dhis2-semis-components";
import { useGetSectionTypeLabel } from "dhis2-semis-functions";

export const useAttendanceConst = () => {
    const { sectionName } = useGetSectionTypeLabel()
    const dataStoreData: any = useDataStoreKey({ sectionType: sectionName });

    function attendanceConst(key: "present" | "late" | "absent") {
        return dataStoreData.attendance.statusOptions.find((option: any) => option.key === key)?.code
    }

    return {
        attendanceConst
    }
}
