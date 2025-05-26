import { useState } from "react";
import { NoticeBox, Button } from "@dhis2/ui";
import { WithBorder, ModalComponent, CustomForm, WithPadding } from "dhis2-semis-components";
import { Form } from "react-final-form";
import { staticForm } from "../../constants/attendaceForm";
import PlaylistAddCheckIcon from '@material-ui/icons/PlaylistAddCheck';
import styles from './assignStatus.module.css'
import { CheckCircleOutline } from "@material-ui/icons";
import classNames from "classnames";
import { Tooltip } from "@mui/material";
import { useSaveValues } from "../../hooks/attendance/saveValues";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { TableDataState } from "../../schema/table/tableDataSchema";
import { useAttendanceConst } from "../../hooks/attendance/attendanceConst";
import { attendanceFormProps } from "../../types/attendance/attendanceTypes";
import { DisaleButtonsState } from "../../schema/attendance/disableAllBtns";

export default function AsssignStatus({ setSelected, selected, school, date, programData, dataStoreData, setRefetch, selectable }: attendanceFormProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const { attendanceConst } = useAttendanceConst()
    const tableValues = useRecoilValue(TableDataState)
    const programStatusOptions = programData?.programStages?.
        find((x: any) => x.id == dataStoreData?.attendance?.programStage)?.programStageDataElements?.
        find((x: any) => x.dataElement?.id == dataStoreData?.attendance?.status)?.dataElement?.optionSet
    const statusCodes = dataStoreData?.attendance?.statusOptions.map((item: any) => item.code)
    const attendaceStatus = programStatusOptions?.options?.filter((student: any) => statusCodes.includes(student.value))
    const { formSubmit } = useSaveValues({ setLoading, date, dataStoreData, setSelected, setRefetch, setOpen, })
    const disable = useSetRecoilState(DisaleButtonsState)
    
    return (
        <>
            {selectable &&
                <Tooltip
                    disableHoverListener={selected?.length !== 0}
                    disableFocusListener={selected?.length !== 0}
                    disableTouchListener={selected?.length !== 0}
                    title="You need to select students first"
                >
                    <span>
                        <Button
                            disabled={selected?.length === 0}
                            onClick={() => {
                                setOpen(true);
                            }} icon={<PlaylistAddCheckIcon />}
                            className={styles.btn}
                        >
                            <span>Assing attendace</span>
                        </Button >
                    </span>
                </Tooltip>
            }

            <Tooltip
                title={selectable ? "Disable multi-attendance mode" : "It will assign the same attendance status to all visible students in the table"}
            >
                <span>
                    <Button
                        loading={loading && !selectable}
                        disabled={selectable}
                        onClick={() => {
                            disable(true)
                            formSubmit({ status: attendanceConst("present") }, tableValues.filter(x => x?.status !== "CANCELLED"))
                        }}
                        icon={<CheckCircleOutline style={selectable ? { color: 'rgba(0, 0, 0, 0.3)' } : { color: "#21B26D" }} />}
                        className={classNames(styles.btn, selectable && styles.markAll)}
                    >
                        <span>Mark all as present</span>
                    </Button >
                </span>
            </Tooltip>

            {
                open && <ModalComponent
                    children={<WithPadding>
                        <NoticeBox title={`WARNING! ${selected.length} students will be affected`} warning>
                            The chosen attendance status will be assigned to the selected students
                        </NoticeBox>
                        <WithPadding />
                        <WithBorder type="all" >
                            <WithPadding>
                                <CustomForm
                                    Form={Form}
                                    loading={loading}
                                    initialValues={{ registeringSchool: school, attendanceDay: date, studentsNumber: selected.length }}
                                    formFields={[
                                        {
                                            storyBook: false,
                                            name: "Attendance",
                                            description: "",
                                            fields: [...staticForm(attendaceStatus) as unknown as any]
                                        }
                                    ]}
                                    storyBook={false}
                                    withButtons={true}
                                    onFormSubtmit={(e) => formSubmit(e, selected)}
                                    onCancel={() => setOpen(false)}
                                />
                            </WithPadding>
                        </WithBorder>
                    </WithPadding>}
                    open={open}
                    handleClose={() => setOpen(false)}
                    title="Bulk Attendance"
                />
            }
        </>
    );
}