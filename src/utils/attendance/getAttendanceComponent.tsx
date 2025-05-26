import React from "react";
import { getComponent } from "./getComponent";
import AttendaceComponent from "./attendanceComponent";

export const getAttendanceComponent = () => {

    function getAttendanceIcon(attendanceOptions: any, attendanceConst: any, component: string, status: string, props: any) {

        const codeComponent: any = {
            "Reason of absence": <AttendaceComponent
                id={"no id_too"}
                items={attendanceOptions?.map((option: any) => {
                    return {
                        code: option.code,
                        type: "absence",
                        Component: option.label,
                    }
                })}
                status={status}
                disabled={props?.enrollmentStatus == 'CANCELLED'}
                {...props}
            />,
            Attendance: <AttendaceComponent
                id={"no id"}
                items={attendanceOptions?.map((option: any) => {
                    return {
                        code: option.code,
                        type: "attendance",
                        Component: getComponent(option, attendanceConst),
                    }
                })}
                status={status}
                disabled={props?.enrollmentStatus == 'CANCELLED'}
                {...props}
            />
        }

        return (
            <>
                {codeComponent?.[component]}
            </>
        )
    }

    return { getAttendanceIcon }
}
