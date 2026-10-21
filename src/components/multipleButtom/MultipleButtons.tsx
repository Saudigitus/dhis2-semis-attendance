import React, { useEffect, useState } from "react";
import styles from "./button.module.css";
import classNames from "classnames";
import { ButtonProps } from "../../types/MultipleBtns/MultipleButtonsTypes";
import { useUrlParams } from "dhis2-semis-functions";
import { CircularLoader } from "@dhis2/ui";
import { Button, ButtonGroup } from "@mui/material";
import useAttendanceValue from "../../hooks/attendance/useAttendanceValue";

export default function MultipleButtons(props: ButtonProps) {
    const { items, status, disabled, ...rest } = props;
    const [selected, setSelected] = useState<any>("")
    const { useQuery } = useUrlParams();

    useEffect(() => setSelected(status), [status])
    const { onchangeValue } = useAttendanceValue({
        data: rest,
        position: (value) => `${value}${rest.tei}`,
        skipIfUnchanged: status,
        setSelected,
    });

    return (
        <ButtonGroup color="primary">
            {items?.map((item) => {
                return (
                    <Button disabled={!!(disabled || (useQuery.get('savingAttendance') != undefined && useQuery.get('savingAttendance') != `${item?.code}${rest.tei}`))} key={item?.code}
                        className={classNames(
                            selected === item?.code && styles["active-button"],
                            styles.label,
                        )}
                        onClick={async () => { await onchangeValue(item.code) }}
                    >
                        <span className={styles.simpleButtonLabel}>
                            {
                                (useQuery.get('savingAttendance') != undefined && useQuery.get('savingAttendance') == `${item?.code}${rest.tei}`)
                                    ? <CircularLoader small /> :
                                    item.Component
                            }
                        </span>
                    </Button>
                )
            })}
        </ButtonGroup>
    );
}
