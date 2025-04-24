
import { useSetRecoilState } from 'recoil';
import { useDataQuery } from "@dhis2/app-runtime"
// import { SchoolCalendarSate } from '../../schema/schoolCalendarSchema';
import { useShowAlerts } from 'dhis2-semis-functions';

const DATASTORE_QUERY = ({
    config: {
        resource: "dataStore/semis/schoolCalendar",
        params: {
            fields: "*"
        }
    }
})

export function useGetSchoolDays() {
    // const setSchoolDays = useSetRecoilState(SchoolCalendarSate);
    const { hide, show } = useShowAlerts()

    const { data, loading, error } = useDataQuery<{ config: any }>(DATASTORE_QUERY, {
        onError(error) {
            // show({
            //     message: `${("Could not get data")}: ${error.message}`,
            //     type: { critical: true }
            // });
            // setTimeout(hide, 5000);
        },
        onComplete(response) {
            // setSchoolDays(response?.config);
        }
    })

    return {
        data,
        loadingSchoolDays: loading,
        error
    }
}
