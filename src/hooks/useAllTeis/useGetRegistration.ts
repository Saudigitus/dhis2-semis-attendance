import { useCheckFilters, useGetEvents, useUrlParams } from "dhis2-semis-functions"
import useGetSelectedKeys from "../config/useGetSelectedKeys"
import { useSchoolCalendarKey } from "dhis2-semis-components"
import { useSetRecoilState } from "recoil"
import { allStudents } from "../../schema/students/allStudentList"
import { useState } from "react"

export default function useGetRegistration() {
    const { getEvents } = useGetEvents()
    const { urlParameters } = useUrlParams()
    const { school: orgUnit } = urlParameters
    const { dataStoreData } = useGetSelectedKeys()
    const { getFilters } = useCheckFilters({ filters: (dataStoreData?.filters?.dataElements ?? []) as unknown as any })
    const { academicYear: academicYearId } = useSchoolCalendarKey()
    const setAll = useSetRecoilState(allStudents)
    const [loading, setLoading] = useState(false)

    async function getRegistrationData() {
        if (!orgUnit) return
        setLoading(true)

        let events = [], page = 1, pageSize = 100, fetchedEvents: any = []
        do {
            events = await getEvents({
                program: dataStoreData?.program as unknown as string,
                programStage: dataStoreData?.registration.programStage,
                fields: "trackedEntity,enrollment",
                filter: [
                    ...(urlParameters?.academicYear ? [`${academicYearId}:in:${urlParameters?.academicYear}`] : []),
                    ...getFilters() as unknown as any
                ],
                orgUnit: orgUnit as any,
                pageSize,
                page,
                orgUnitMode: 'SELECTED',
            }).catch((error) => {

            })

            fetchedEvents = [...fetchedEvents, ...events]
            page++
        } while (events?.length === pageSize)
        setAll(fetchedEvents)
        setLoading(false)
    }

    return { getRegistrationData, loadingAllStudens: loading }
}