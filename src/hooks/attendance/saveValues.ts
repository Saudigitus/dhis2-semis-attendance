import { eventBody } from "../../utils/attendance/eventBody"
import { useUploadEvents, useUrlParams } from "dhis2-semis-functions"
import { useSetRecoilState } from "recoil"
import { DisaleButtonsState } from "../../schema/attendance/disableAllBtns"
import { useDaveValuesProps } from "../../types/attendance/attendanceTypes"

export function useSaveValues({ setLoading, dataStoreData, setRefetch, setSelected, setOpen }: useDaveValuesProps) {
    const { useQuery } = useUrlParams()
    const date = useQuery.get('selectedDate')!
    const { uploadValues } = useUploadEvents()
    const disable = useSetRecoilState(DisaleButtonsState)

    async function formSubmit(values: any, selected: any[]) {
        setLoading(true)
        let events = []

        for (const tei of selected) {
            const eventId = tei?.[date]?.eventId ?? null

            events.push(eventBody({
                tei: tei.trackedEntity,
                event: eventId,
                program: tei.programId,
                stage: dataStoreData?.attendance?.programStage,
                absenceReason: dataStoreData?.attendance?.absenceReason,
                de: dataStoreData?.attendance?.status,
                ou: tei.orgUnitId,
                enrollment: tei.enrollmentId,
                date: date
            }, values.status))
        }

        await uploadValues({ events: events }, 'COMMIT', 'CREATE_AND_UPDATE')
            .then(() => { disable(false); setLoading(false); setRefetch((prev: any) => (!prev)); setOpen(false); setSelected([]) })
            .catch(() => { setLoading(false); setOpen(false); disable(false) })
    }

    return { formSubmit }
}