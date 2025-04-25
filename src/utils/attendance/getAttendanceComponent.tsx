import React from "react";
import { getComponent } from "./getComponent";
import AttendaceComponent from "./attendanceComponent";

export const getAttendanceComponent = ({ setSelectedState, selectedState }: any) => {

    function getAttendanceIcon(attendanceOptions: any, attendanceConst: any, component: string) {

        const codeComponent: any = {
            "Reason of absence": <AttendaceComponent
                id={"no id"}
                items={attendanceOptions?.map((option: any) => {
                    return {
                        code: option.code,
                        type: "attendance",
                        Component: getComponent(option, attendanceConst),
                    }
                })}
                disabled={false}
                selectedState={selectedState}
                setSelectedState={setSelectedState}
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
                disabled={false}
                selectedState={selectedState}
                setSelectedState={setSelectedState}
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
