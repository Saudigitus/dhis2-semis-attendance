import { SingleSelectField, SingleSelectOption } from '@dhis2/ui'
import React, { useEffect, useState } from 'react'
import { SingleSelectProps } from '../../types/singleSelect/singleSelectTypes';
import { eventBody } from '../../utils/attendance/eventBody';
import { useShowAlerts, useUploadEvents, useUrlParams } from 'dhis2-semis-functions';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { TableDataState } from '../../schema/table/tableDataSchema';
import { TableDataRefetch } from 'dhis2-semis-types';
import { Center } from '@dhis2/ui';
import { CircularLoader } from '@dhis2/ui';
import { classAttendanceEvent } from '../../schema/attendance/classAttendanceEvent';
import { useAttendanceCompleteness } from '../../hooks/attendance/attendanceCompleteness';

function SingleSelect(props: SingleSelectProps) {
    const { options, status, disabled, ...rest } = props;
    const [selected, setSelected] = useState<any>("")
    const { hide, show } = useShowAlerts()
    const [tableValues, setTableValues] = useRecoilState(TableDataState)
    const setRefetch = useSetRecoilState(TableDataRefetch);
    const { uploadValues } = useUploadEvents()
    const { urlParameters, add, remove, useQuery } = useUrlParams();
    const { selectedDate } = urlParameters
    const attendanceEvent = useRecoilValue(classAttendanceEvent)
    const { completeOrDelete } = useAttendanceCompleteness()

    useEffect(() => setSelected(status), [status])

    const onchangeValue = async (value: string) => {
        add('position', `${props?.de}${rest.tei}`)

        await uploadValues({ events: [eventBody({ ...rest, date: selectedDate }, value)] }, 'COMMIT', 'CREATE_AND_UPDATE')
            .then(async (resp: any) => {
                if (resp?.validationReport?.errorReports?.length > 0) {
                    show({
                        message: `${("Occurred unknown error!")}`,
                        type: { critical: true }
                    });
                    setTimeout(hide, 5000);
                    remove('position')
                } else {

                    const event = resp?.bundleReport?.typeReportMap?.EVENT?.objectReports?.[0]?.uid
                    let copy = [...tableValues], index = tableValues?.findIndex((x: any) => x.trackedEntity === rest.tei)

                    if (rest?.absenceReason === rest?.de) {
                        copy[index] = { ...copy[index], [rest.date]: { ...copy[index][rest.date], absenceReason: value }, replace: true }
                    } else {
                        copy[index] = { ...copy[index], [rest.date]: { ...copy[index][rest.date], eventId: event, status: value, absenceOption: undefined }, replace: true }
                    }

                    remove('position')
                    setTableValues(copy)
                    setSelected(value)
                    setRefetch((prev: any) => !prev)
                    
                    if (!attendanceEvent) await completeOrDelete('create', false)
                }
            })
    }

    return (
        <div data-test="attendance-select-reason-container">
            {
                (useQuery.get('position') != undefined && useQuery.get('position') == `${props?.de}${rest.tei}`) ?
                    <Center>
                        <CircularLoader small />
                    </Center>
                    :
                    <SingleSelectField
                        className="select"
                        disabled={!!(disabled || (useQuery.get('position') != undefined && useQuery.get('position') != `${props?.de}${rest.tei}`))}
                        {...rest}
                        selected={selected || null}
                        data-test="attendance-select-absence-reason"
                        onChange={(e: any) => { onchangeValue(options.find((x: any) => x.code === e.selected).code) }}
                    >
                        {options?.map((x: any) =>
                            <SingleSelectOption key={x.code} label={x.Component} value={x.code} data-test={`attendance-select-reason-option-${x.code}`}/>
                        )}
                    </SingleSelectField>
            }
        </div >
    )
}

export default SingleSelect
