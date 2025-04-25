import { ProgramConfig, selectedDataStoreKey } from "dhis2-semis-types"

export interface EnrollmentButtonsProps {
    setSelectedDates: (args: any) => void
    setattendanceHeaders: (args: any[]) => void
    config: any
    loading: boolean
    filetrState: any
    programData: ProgramConfig
    selectedDataStoreKey: selectedDataStoreKey
}