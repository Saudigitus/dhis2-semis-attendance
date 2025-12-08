import { useState } from "react";
import { NoticeBox, Button } from "@dhis2/ui";
import { WithBorder, ModalComponent, CustomForm, WithPadding } from "dhis2-semis-components";
import { Form } from "react-final-form";
import { staticForm } from "../../constants/attendaceForm";
import styles from './assignStatus.module.css'
import classNames from "classnames";
import { Tooltip } from "@mui/material";
import { useSaveValues } from "../../hooks/attendance/saveValues";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { TableDataState } from "../../schema/table/tableDataSchema";
import { attendanceFormProps } from "../../types/attendance/attendanceTypes";
import { DisaleButtonsState } from "../../schema/attendance/disableAllBtns";
import { CheckCircleOutline, PlaylistAddCheckCircleOutlined } from "@mui/icons-material";
import useGetSelectedKeys from "../../hooks/config/useGetSelectedKeys";
import ConfirmModal from "../modal/modalConfirm";
import { useUrlParams } from "dhis2-semis-functions";

export default function AsssignStatus({ setSelected, selected, school, programData, setRefetch, selectable, i18n }: attendanceFormProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [openMarkAll, setOpenMarkAll] = useState(false)
    const tableValues = useRecoilValue(TableDataState)
    const { dataStoreData } = useGetSelectedKeys()
    const { attendance = {} as unknown as any } = dataStoreData
    const { statusOptions } = attendance
    const programStatusOptions = programData?.programStages?.
        find((x: any) => x?.id == attendance?.programStage)?.programStageDataElements?.
        find((x: any) => x.dataElement?.id == attendance?.status)?.dataElement?.optionSet
    const statusCodes = statusOptions.map((item: any) => item.code)
    const attendaceStatus = programStatusOptions?.options?.filter((student: any) => statusCodes.includes(student.value))
    const { formSubmit } = useSaveValues({ setLoading, dataStoreData, setSelected, setRefetch, setOpen, })
    const disable = useSetRecoilState(DisaleButtonsState)
    const { useQuery } = useUrlParams()
    const date = useQuery.get('selectedDate')!

    return (
        <>
            {selectable &&
                <Tooltip
                    disableHoverListener={selected?.length !== 0}
                    disableFocusListener={selected?.length !== 0}
                    disableTouchListener={selected?.length !== 0}
                    title={i18n.t("You need to select students first")}
                >
                    <span>
                        <Button
                            disabled={selected?.length === 0}
                            onClick={() => {
                                setOpen(true);
                            }} icon={<PlaylistAddCheckCircleOutlined />}
                            className={styles.btn}
                        >
                            <span>{i18n.t('Assing attendace')}</span>
                        </Button >
                    </span>
                </Tooltip>
            }

            <Tooltip
                title={selectable ? i18n.t("Disable multi attendance mode") : i18n.t("It will assign the same attendance status to all visible students in the table")}
            >
                <span>
                    <Button
                        loading={loading && !selectable}
                        disabled={selectable}
                        onClick={() => setOpenMarkAll(true)}
                        icon={<CheckCircleOutline style={selectable ? { color: 'rgba(0, 0, 0, 0.3)' } : { color: "#21B26D" }} />}
                        className={classNames(styles.btn, selectable && styles.markAll)}
                    >
                        <span>{i18n.t("Mark all as present")}</span>
                    </Button >
                </span>
            </Tooltip>

            {
                openMarkAll && <ConfirmModal
                    i18n={i18n}
                    onSave={async () => {
                        setOpenMarkAll(false)
                        disable(true)
                        const status = statusOptions.find((x: any) => x.configKey === 'presentCode')?.code
                        await formSubmit({ status }, tableValues.filter(x => x?.status !== "CANCELLED"))
                    }}
                    open={openMarkAll}
                    setOpen={setOpenMarkAll}
                />
            }
            {
                open && <ModalComponent
                    children={<WithPadding>
                        <NoticeBox title={`${i18n.t('Warning')}! ${selected.length} ${i18n.t("Students will be affected")}`} warning>
                            {i18n.t("The chosen attendance status will be assigned to the selected students")}
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
                                            name: `${i18n.t('Attendance')!}`,
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
                    title={i18n.t('Bulk attendance')}
                />
            }
        </>
    );
}