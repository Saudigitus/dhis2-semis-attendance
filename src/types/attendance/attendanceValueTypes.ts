import { Dispatch, SetStateAction } from "react";

export interface UseAttendanceValueProps {
    data: any;
    position: (value: string) => string;
    setSelected: Dispatch<SetStateAction<any>>;
    skipIfUnchanged?: string;
}
