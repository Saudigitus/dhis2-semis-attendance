import { InfoPage } from "dhis2-semis-components";
import { D2I18n } from "dhis2-semis-types";

export default function InfoPageHolder({ i18n }: { i18n: D2I18n }) {
    return (
        <InfoPage
            dataTest="attendance-info-page"
            title={i18n.t("SEMIS-Attendance")}
            sections={[
                {
                    sectionTitle: i18n.t("Follow the instructions to proceed"),
                    instructions: [
                        i18n.t("Select the Organization unit you want to view data"),
                        i18n.t("Use global filters(Class, Grade and Academic Year)")
                    ]
                }
            ]}
        />
    )
}