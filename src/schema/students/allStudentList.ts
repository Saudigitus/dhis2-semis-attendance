import { atom } from "recoil"

export const allStudents = atom<any[]>({
    key: "all-student-list",
    default: []
})
