import { D2I18n, selectedDataStoreKey } from "dhis2-semis-types"

export interface EnrollmentButtonsProps {
    setSelectedDates: (args: any) => void
    selectable: boolean
    setSelectable: (args: any) => void
    setIsTableReady: (args: any) => void
    setattendanceHeaders: (args: any[]) => void
    setRefetch: (args: any) => void
    loading: boolean
    selectedDataStoreKey: selectedDataStoreKey
    i18n: D2I18n
    baseUrl: string
}
