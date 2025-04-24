import { VariablesTypes } from "dhis2-semis-types"

export function getAttendanceDEHeaders({ setattendanceHeaders }: { setattendanceHeaders: (args: any[]) => void }) {

    function getDataElementsHeaders(programData: any, attendanceStage: string) {
        const dataElements = programData?.programStages?.find((x: any) => x.id === attendanceStage)?.programStageDataElements?.map((x: any) => {
            return {
                id: x.dataElement.id,
                displayName: x.dataElement.displayName,
                header: x.dataElement.displayName,
                required: true,
                name: x.dataElement.displayName,
                labelName: x.dataElement.displayName,
                valueType: 'custom',
                options: undefined,
                initialOptions: undefined,
                visible: true,
                disabled: false,
                pattern: '',
                searchable: false,
                error: false,
                content: '',
                key: "",
                type: VariablesTypes.Attendance,
                class: "center",
            }
        })
        setattendanceHeaders(dataElements)
    }

    return { getDataElementsHeaders }
}