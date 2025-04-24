import React from "react";
import { AccessTime, HighlightOff, CheckCircleOutline, ExitToApp, RemoveCircleOutline, NotInterestedOutlined } from "@material-ui/icons";
import { Chip, Tooltip } from "@mui/material";
import style from "./icon.module.css";

export const getIcon = (option: any, attendanceConst: any, disabled = false) => {
    const styles = { color: 'rgba(0, 0, 0, 0.3)' }

    const codeComponent = {
        [attendanceConst("present")]: <CheckCircleOutline style={disabled ? styles : { color: "#21B26D" }} />,
        [attendanceConst("late")]: <AccessTime style={disabled ? styles : { color: "#EAB631" }} />,
        [attendanceConst("absent")]: <HighlightOff style={disabled ? styles : { color: "#F05C5C" }} />,
        Empty: <RemoveCircleOutline style={{ color: "#ADAEB0" }} />,
        Absense: <Chip
            label={option?.key.substring(0, 1) + option?.key.substring(1, option?.key.length).toLowerCase()}
            size='small' className={style.reasonOfAbsense}
        />,
        NonSchoolDay: <NotInterestedOutlined style={{ color: "#da344d2e" }} />
    }

    console.log(option)
    return <>
        {
            <Tooltip title={option?.key}
                componentsProps={{
                    tooltip: {
                        sx: { textTransform: 'capitalize' }
                    }
                }}
                disableHoverListener={option?.code === 'Absense'}
            >
                {codeComponent?.[option?.code] ?? <ExitToApp style={disabled ? styles : { color: "#28AFEA" }} />}
            </Tooltip>
        }
    </>
}
