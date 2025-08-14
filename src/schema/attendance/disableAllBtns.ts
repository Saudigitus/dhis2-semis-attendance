import { atom } from "recoil"

export const DisaleButtonsState = atom<boolean>({
    key: "disable-schema",
    default: false
})

export const ReasonOfAbsenseState = atom<boolean>({
    key: "reason-of-absense-state-get-state",
    default: false
})
