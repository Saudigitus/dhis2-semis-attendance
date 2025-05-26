import React, { useEffect, useState } from "react";
import styles from "./button.module.css";
import { ButtonGroup, Button } from "@material-ui/core";
import classNames from "classnames";
import { ButtonProps } from "../../types/MultipleBtns/MultipleButtonsTypes";
import { useShowAlerts, useUploadEvents, useUrlParams } from "dhis2-semis-functions";
import { eventBody } from "../../utils/attendance/eventBody";
import { TableDataState } from "../../schema/table/tableDataSchema";
import { useRecoilState } from "recoil";
import { TableDataRefetch } from "dhis2-semis-types";
import { CircularLoader } from "@dhis2/ui";

export default function MultipleButtons(props: ButtonProps) {
    const { items, status, disabled, ...rest } = props;
    const [selected, setSelected] = useState<any>("")
    const { hide, show } = useShowAlerts()
    const [tableValues, setTableValues] = useRecoilState(TableDataState)
    const [refetch, setRefetch] = useRecoilState(TableDataRefetch);
    const { uploadValues } = useUploadEvents()
    const { urlParameters, add, remove } = useUrlParams();
    const { position } = urlParameters()

    useEffect(() => {
        setSelected(status)
    }, [status])

    const onchangeValue = async (value: string) => {
        if (value !== status) {
            add('position', `${value}${rest.tei}`)
            await uploadValues({ events: [eventBody(rest, value)] }, 'COMMIT', 'CREATE_AND_UPDATE').then((resp: any) => {
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

                    remove('position')
                    setTableValues(copy)
                    setSelected(value)
                    setRefetch(!refetch)
                }
            })
        }
    }

    return (
        <ButtonGroup color="primary">
            {items?.map((item) => {
                return (
                    <Button disabled={!!(disabled || (position != undefined && position != `${item?.code}${rest.tei}`))} key={item?.code}
                        className={classNames(
                            selected === item?.code && styles["active-button"],
                            styles.label
                        )}
                        onClick={() => { onchangeValue(item.code) }} >
                        <span className={styles.simpleButtonLabel}> {(position != undefined && position == `${item?.code}${rest.tei}`) ? <CircularLoader small /> : item.Component}</span>
                    </Button>
                )
            })}
        </ButtonGroup>
    );
}
