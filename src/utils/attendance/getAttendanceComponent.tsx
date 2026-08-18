import React from "react";
import { getComponent } from "./getComponent";
import AttendaceComponent from "./attendanceComponent";

export const getAttendanceComponent = () => {

    function getAttendanceIcon(attendanceOptions: any, attendanceConst: any, type: string, status: string, props: any, moreThan3?: boolean) {
        const disabled = props?.disabled || props?.enrollmentStatus == 'CANCELLED'

        return (
            <AttendaceComponent
                id={"no_id"}
                items={attendanceOptions?.map((option: any) => {
                    return {
                        code: option.code,
                        type: type,
                        Component: type == 'attendance' ? getComponent(option, attendanceConst, disabled, moreThan3) : option.label,
                    }
                })}
                status={status}
                disabled={disabled}
                {...props}
            />
        )
    }

    return { getAttendanceIcon }
}
