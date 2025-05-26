import { DataStoreProps } from "dhis2-semis-types"

export interface useDaveValuesProps {
    setOpen: (args: boolean) => void
    setSelected: (args: any) => void
    setRefetch: (args: any) => void
    dataStoreData: DataStoreProps[0]
    setLoading: (args: boolean) => void
    date: any
}

export interface attendanceFormProps {
    selectable: boolean
    setSelected: (args: any) => void
    setRefetch: (args: any) => void
    programData: any
    dataStoreData: any
    selected: any[]
    school: string
    date: string
}