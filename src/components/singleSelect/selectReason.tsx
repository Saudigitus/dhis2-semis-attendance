import { SingleSelectField, SingleSelectOption } from '@dhis2/ui'
import React, { useEffect, useState } from 'react'
import { SingleSelectProps } from '../../types/singleSelect/singleSelectTypes';
import { eventBody } from '../../utils/attendance/eventBody';
import { useShowAlerts } from 'dhis2-semis-functions';
import usePostEvents from "../../hooks/events/useUploadEvents";
import { useRecoilState } from 'recoil';
import { TableDataState } from 'src/schema/table/tableDataSchema';
import { TableDataRefetch } from 'dhis2-semis-types';

function SingleSelect(props: SingleSelectProps) {
    const { options, status, ...rest } = props;
    const [selected, setSelected] = useState<any>("")
    const { saveValues } = usePostEvents()
    const { hide, show } = useShowAlerts()
    const [tableValues, setTableValues] = useRecoilState(TableDataState)
    const [refetch, setRefetch] = useRecoilState(TableDataRefetch);

    useEffect(() => {
        setSelected(status)
    }, [status])

    const onchangeValue = async (value: string) => {
        await saveValues([eventBody(rest, value)]).then((resp: any) => {

            if (resp?.validationReport?.errorReports?.length > 0) {
                show({
                    message: `${("Occurred unknown error!")}`,
                    type: { critical: true }
                });
                setTimeout(hide, 5000);
            } else {
                const event = resp?.bundleReport?.typeReportMap?.EVENT?.objectReports?.[0]?.uid
                let copy = [...tableValues], index = tableValues?.findIndex((x: any) => x.trackedEntity === rest.tei)

                if (rest?.absenceReason === rest?.de) {
                    copy[index] = { ...copy[index], [rest.date]: { ...copy[index][rest.date], absenceReason: value }, replace: true }
                } else {
                    copy[index] = { ...copy[index], [rest.date]: { ...copy[index][rest.date], eventId: event, status: value, absenceOption: undefined }, replace: true }
                }

                setTableValues(copy)
                setSelected(value)
                setRefetch(!refetch)
            }
        })
    }

    return (
        <div>
            <SingleSelectField
                className="select"
                {...props}
                selected={selected || null}
                onChange={(e: any) => { onchangeValue(options.find((x: any) => x.code === e.selected).code) }}
            >
                {options?.map((x: any) =>
                    <SingleSelectOption key={x.code} label={x.Component} value={x.code} />
                )}
            </SingleSelectField>
        </div>
    )
}

export default SingleSelect
