import { SingleSelectField, SingleSelectOption } from '@dhis2/ui'
import React, { useEffect, useState } from 'react'
import { SingleSelectProps } from '../../types/singleSelect/singleSelectTypes';
import { useUrlParams } from "dhis2-semis-functions";
import useAttendanceValue from '../../hooks/attendance/useAttendanceValue';
import { Center } from '@dhis2/ui';
import { CircularLoader } from '@dhis2/ui';

function SingleSelect(props: SingleSelectProps) {
    const { options, status, disabled, ...rest } = props;
    const [selected, setSelected] = useState<any>("")
    const { useQuery } = useUrlParams();
    
    useEffect(() => setSelected(status), [status])

    const { onchangeValue } = useAttendanceValue({
        data: rest,
        position: () => `${props?.de}${rest.tei}`,
        setSelected,
    });

    return (
        <div>
            {
                (useQuery.get('savingAttendance') != undefined && useQuery.get('savingAttendance') == `${props?.de}${rest.tei}`) ?
                    <Center>
                        <CircularLoader small />
                    </Center>
                    :
                    <SingleSelectField
                        className="select"
                        disabled={!!(disabled || (useQuery.get('savingAttendance') != undefined && useQuery.get('savingAttendance') != `${props?.de}${rest.tei}`))}
                        {...rest}
                        selected={selected || null}
                        onChange={(e: any) => { onchangeValue(options.find((x: any) => x.code === e.selected).code) }}
                    >
                        {options?.map((x: any) =>
                            <SingleSelectOption key={x.code} label={x.Component} value={x.code} />
                        )}
                    </SingleSelectField>
            }
        </div >
    )
}

export default SingleSelect
