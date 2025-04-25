import { atom } from "recoil"

export const TableDataState = atom<any[]>({
    key: "tableData-schema",
    default: []
})
