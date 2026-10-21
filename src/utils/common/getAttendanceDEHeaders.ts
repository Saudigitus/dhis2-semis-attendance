import { VariablesTypes } from "dhis2-semis-types"

export function getAttendanceDEHeaders({ setattendanceHeaders }: { setattendanceHeaders: (args: any[]) => void }) {

    // Only the attendance status and the reason of absence become columns: the other fields of the stage
    // (grade, class/section...) would hide the enrollment values of the same data elements (SEMIS-227).
    function getDataElementsHeaders(programData: any, attendanceStage: string, columnDataElements: string[]) {
        const dataElements = programData?.programStages?.find((x: any) => x.id === attendanceStage)?.programStageDataElements
            ?.filter((x: any) => columnDataElements.includes(x.dataElement.id))
            ?.map((x: any) => {

            return {
                id: x.dataElement.id,
                displayName: x.dataElement.displayName,
                header: x.dataElement.displayName,
                required: true,
                name: x.dataElement.displayName,
                labelName: x.dataElement.displayName,
                valueType: 'custom',
                options: { optionSet: x?.dataElement?.optionSet },
                initialOptions: { optionSet: x?.dataElement?.optionSet },
                visible: x?.displayInReports,
                disabled: false,
                pattern: '',
                searchable: false,
                error: false,
                content: '',
                key: "",
                type: VariablesTypes?.Attendance,
                class: "center",
            }
        })
        setattendanceHeaders(dataElements)
    }

    return { getDataElementsHeaders }
}