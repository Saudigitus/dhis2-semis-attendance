import useGetSelectedKeys from "../config/useGetSelectedKeys";

export const useAttendanceConst = () => {
    const { dataStoreData } = useGetSelectedKeys()

    function attendanceConst(key: "present" | "late" | "absent") {
        return dataStoreData.attendance.statusOptions.find((option: any) => option.key === key)?.code
    }

    return {
        attendanceConst
    }
}
