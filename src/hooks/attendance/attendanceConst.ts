import useGetSelectedKeys from "../config/useGetSelectedKeys";

export const useAttendanceConst = () => {
    const { dataStoreData } = useGetSelectedKeys()

    function attendanceConst(key: "presentCode" | "lateCode" | "absentCode" | "leaveCode") {
        return (dataStoreData as unknown as any)?.attendance?.statusOptions?.find((option: any) => option?.configKey === key)?.configKey
    }

    return {
        attendanceConst
    }
}
