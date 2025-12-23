import { atom } from "recoil"

export const completenessLoading = atom<{ refetch: boolean, loading: boolean }>({
    key: "completenessLoading",
    default: { refetch: false, loading: false }
})