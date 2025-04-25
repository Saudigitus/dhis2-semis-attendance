import { SingleSelectField, SingleSelectOption } from '@dhis2/ui'
import React, { useEffect, useState } from 'react'
import { SingleSelectProps } from '../../types/singleSelect/singleSelectTypes';
import { eventBody } from '../../utils/attendance/eventBody';
import { useShowAlerts } from 'dhis2-semis-functions';
import usePostEvents from "../../hooks/events/useUploadEvents";

function SingleSelect(props: SingleSelectProps) {
    const { options, status, ...rest } = props;
    const [selected, setSelected] = useState<any>("")
    const { saveValues } = usePostEvents()
    const { hide, show } = useShowAlerts()

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
                setSelected(value)
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
