import React from "react";
import { Chip, Tooltip } from "@mui/material";
import style from "./icon.module.css";
import { AccessTime, CheckCircleOutline, ExitToApp, HighlightOff, NotInterestedOutlined, RemoveCircleOutline } from "@mui/icons-material";

export const getComponent = (option: any, attendanceConst: any, disabled = false, seeReason = false) => {

    const styles = { color: 'rgba(0, 0, 0, 0.3)' }

    const codeComponent = {
        [attendanceConst("presentCode")]: <CheckCircleOutline style={disabled ? styles : { color: "#21B26D" }} />,
        [attendanceConst("lateCode")]: <AccessTime style={disabled ? styles : { color: "#EAB631" }} />,
        [attendanceConst("absentCode")]: <HighlightOff style={disabled ? styles : { color: "#F05C5C" }} />,
        Empty: <RemoveCircleOutline style={{ color: "#ADAEB0" }} />,
        Absense: <Chip
            label={option?.code?.substring(0, 1) + option?.code?.substring(1, option?.code.length)?.toLowerCase()}
            size='small' className={style.reasonOfAbsense}
        />,
        NonSchoolDay: <NotInterestedOutlined style={{ color: "#da344d2e" }} />,
    }

    return (
        <>
            {
                <Tooltip title={option?.key}
                    slotProps={{
                        tooltip: {
                            sx: { textTransform: 'capitalize' }
                        }
                    }}
                    disableHoverListener={option?.ConfigKey === 'Absense'}
                >
                    {codeComponent?.[option?.ConfigKey] ?? <ExitToApp style={disabled ? styles : { color: "#28AFEA" }} />}
                </Tooltip>
            }
        </>
    )
}
