import { useUrlParams } from "dhis2-semis-functions";
import useGetSelectedKeys from "../../hooks/config/useGetSelectedKeys"
import { useSchoolCalendarKey } from "dhis2-semis-components";

export default function useGetRegitration() {
    const { dataStoreData } = useGetSelectedKeys()
    const { filters } = dataStoreData
    const { useQuery, urlParameters } = useUrlParams();
    const { academicYear: academicYearId } = useSchoolCalendarKey()
    const { academicYear } = urlParameters;

    function useGetRegitrationDataElements() {

        let dataElements = [
            {
                dataElement: academicYearId,
                value: academicYear
            }
        ]

        for (const item of filters?.dataElements) {
            dataElements.push({
                dataElement: item?.dataElement,
                value: useQuery.get(item?.ulrParam)
            })
        }

        return dataElements
    }

    return { useGetRegitrationDataElements }
}