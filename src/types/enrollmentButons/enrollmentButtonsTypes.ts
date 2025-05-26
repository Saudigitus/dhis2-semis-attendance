import { ProgramConfig, selectedDataStoreKey } from "dhis2-semis-types"

export interface EnrollmentButtonsProps {
    setSelectedDates: (args: any) => void
    selectable: boolean
    setSelectable: (args: any) => void
    setattendanceHeaders: (args: any[]) => void
    config: any
    loading: boolean
    programData: ProgramConfig
    selectedDataStoreKey: selectedDataStoreKey
}