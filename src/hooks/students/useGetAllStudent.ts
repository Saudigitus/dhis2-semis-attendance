import { useCheckFilters, useTableData, useUrlParams } from "dhis2-semis-functions";
import { Modules } from "dhis2-semis-types"
import useGetSelectedKeys from "../config/useGetSelectedKeys";
import { useSchoolCalendarKey } from "dhis2-semis-components";
import { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import { allStudents } from "../../schema/students/allStudentList";

export function useGetAllStudents() {
    const { getData, loading } = useTableData({ module: Modules.Attendance });
    const { program, dataStoreData } = useGetSelectedKeys()
    const { urlParameters } = useUrlParams(['position']);
    const { academicYear: academicYearId } = useSchoolCalendarKey()
    const { getFilters } = useCheckFilters({ filters: (dataStoreData?.filters?.dataElements ?? []) as unknown as any })
    const setAll = useSetRecoilState(allStudents)

    useEffect(() => {
        void getData({
            paging: false,
            skipPaging: true,
            program: program!?.id as string,
            orgUnit: urlParameters?.school!,
            baseProgramStage: dataStoreData?.registration?.programStage,
            dataElementFilters: [
                ...(urlParameters?.academicYear ? [`${academicYearId}:in:${urlParameters?.academicYear}`] : []),
                ...getFilters() as unknown as any
            ],
        }).then((resp: any) => {
            setAll(resp?.data?.filter((x: any) => x?.status !== "CANCELLED"))
        })
    }, [urlParameters?.academicYear])

    return { loading }
}