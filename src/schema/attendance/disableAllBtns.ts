import { atom } from "recoil"

export const DisaleButtonsState = atom<boolean>({
    key: "disable-schema",
    default: false
})
