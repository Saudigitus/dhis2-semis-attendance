import { format } from "date-fns";
import { unavailableSchoolDays } from "dhis2-semis-functions";
import { Attribute, CustomAttributeProps, VariablesTypes } from "dhis2-semis-types";

export function generateAttendanceDays({ setAttendanceDays }: { setAttendanceDays: (args: any[]) => void }) {
    const { unavailableDays } = unavailableSchoolDays()

    const getValidDays = (date: Date, config: any) => {
        let validDays = []
        let counter = 0

        do {
            let currentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - counter)

            if (!unavailableDays(currentDate, config)) validDays.unshift({ schoolDay: true, date: format(currentDate, "yyyy-MM-dd") })
            else validDays.unshift({ schoolDay: false, date: format(currentDate, "yyyy-MM-dd") })

            counter++
        } while (validDays.length < 5)

        setAttendanceDays(validDays.map((dateString: { schoolDay: boolean, date: string }) => {
            return {
                id: dateString.date,
                displayName: dateString.date,
                header: dateString.date,
                required: true,
                name: dateString.date,
                labelName: dateString.date,
                valueType: Attribute.valueType.TEXT as unknown as CustomAttributeProps["valueType"],
                options: undefined,
                initialOptions: undefined,
                visible: true,
                disabled: false,
                pattern: '',
                searchable: false,
                error: false,
                content: '',
                key: "",
                type: 'custom',
                class: "center",
                schoolDay: dateString.schoolDay
            }
        }))
    }

    return { getValidDays }
}