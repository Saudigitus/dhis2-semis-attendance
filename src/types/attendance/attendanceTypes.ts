import { D2I18n, DataStoreProps } from "dhis2-semis-types"

export interface useDaveValuesProps {
    setOpen: (args: boolean) => void
    setSelected: (args: any) => void
    setRefetch: (args: any) => void
    dataStoreData: DataStoreProps[0]
    setLoading: (args: boolean) => void
}

export interface attendanceFormProps {
    selectable: boolean
    setSelected: (args: any) => void
    setRefetch: (args: any) => void
    programData: any
    selected: any[]
    school: string
    disabled: boolean
    i18n: D2I18n
}