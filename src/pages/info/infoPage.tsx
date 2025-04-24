import { InfoPage } from "dhis2-semis-components";

export default function InfoPageHolder() {
    return (
        <InfoPage
            title="SEMIS-Attendance"
            sections={[
                {
                    sectionTitle: "Follow the instructions to proceed:",
                    instructions: [
                        "Select the Organization unit you want to view data",
                        "Use global filters(Class, Grade and Academic Year)"
                    ]
                }
            ]}
        />
    )
}