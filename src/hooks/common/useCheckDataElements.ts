import { useSchoolCalendarKey } from "dhis2-semis-components";
import useGetSelectedKeys from "../config/useGetSelectedKeys";

export default function useCheckAttendaceDataElements() {
    const { program, dataStoreData } = useGetSelectedKeys()
    const { attendance = {} as unknown as any, filters } = dataStoreData
    const { academicYear } = useSchoolCalendarKey()

    function verifyStageDataElements() {
        const stageDataElements = program?.programStages
            ?.find(x => x.id == attendance.programStage)?.programStageDataElements
            ?.map(x => x.dataElement) ?? []

        const stageDataElementIds = new Set(
            stageDataElements.map((de: any) => de?.id).filter(Boolean)
        )

        const filterDataElements = filters?.dataElements ?? []

        const filterResults = filterDataElements.map((filterDe: any) => ({
            source: "filter",
            code: filterDe.code,
            label: filterDe.label,
            dataElementId: filterDe.dataElement,
            existsInStage: stageDataElementIds.has(filterDe.dataElement)
        }))

        const academicYearResult = academicYear ? {
            source: "academicYear",
            code: "academicYear",
            label: "Academic Year",
            dataElementId: academicYear,
            existsInStage: stageDataElementIds.has(academicYear)
        } : null

        const results = academicYearResult
            ? [...filterResults, academicYearResult]
            : filterResults

        const allPresent = results.every((r: any) => r.existsInStage)

        const missing = results
            .filter((r: any) => !r.existsInStage)
            .map((r: any) => ({ id: r.dataElementId, code: r.code, label: r.label, source: r.source }))

        return {
            allPresent,
            missing,
            results
        }
    }

    return { verifyStageDataElements }
}