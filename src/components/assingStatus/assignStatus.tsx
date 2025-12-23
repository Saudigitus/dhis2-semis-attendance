import { useState } from "react";
import { NoticeBox, Button } from "@dhis2/ui";
import { WithBorder, ModalComponent, CustomForm, WithPadding } from "dhis2-semis-components";
import { Form } from "react-final-form";
import { staticForm } from "../../constants/attendaceForm";
import styles from './assignStatus.module.css'
import { CircularProgress } from "@mui/material";
import { useSaveValues } from "../../hooks/attendance/saveValues";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { TableDataState } from "../../schema/table/tableDataSchema";
import { attendanceFormProps } from "../../types/attendance/attendanceTypes";
import { DisaleButtonsState } from "../../schema/attendance/disableAllBtns";
import { CheckCircleOutline, HighlightOff } from "@mui/icons-material";
import useGetSelectedKeys from "../../hooks/config/useGetSelectedKeys";
import ConfirmModal from "../modal/modalConfirm";
import { useUrlParams } from "dhis2-semis-functions";
import { IconUserGroup16 } from "@dhis2/ui";
import { CustomDropdown as DropdownButton } from 'dhis2-semis-components';
import classNames from "classnames";
import { useAttendanceCompleteness } from "../../hooks/attendance/attendanceCompleteness";

export default function AssignStatus({
    setSelected, selected, school, programData, setRefetch, i18n, disabled, attendanceEvent, completenessLoading, setCompletenessLoading
}: attendanceFormProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [selectedOption, setSelectedOption] = useState({ value: '', label: '' })
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
    const { completeOrDelete } = useAttendanceCompleteness({ setCompletenessLoading })

    const options = attendaceStatus?.map((item: any) => ({
        label: item.label,
        onClick: () => {
            setSelectedOption({ value: item.value, label: item.label })
            setOpenMarkAll(true)
        },
        value: item.value,
        divider: true,
    }))

    return (
        <>
            { attendance?.attendanceStatus?.allowAttendanceStatus && <Button
                loading={completenessLoading?.loading}
                disabled={completenessLoading?.refetch || disabled}
                onClick={() => completeOrDelete(attendanceEvent)}
                icon={!attendanceEvent ? <CheckCircleOutline style={{ color: "#21B26D" }} /> : <HighlightOff />}
                className={classNames(styles.btn)}
                destructive={attendanceEvent}
            >
                <span>{completenessLoading?.loading && !attendanceEvent ? "" : attendanceEvent ? i18n.t("Uncomplete attendance") : i18n.t("Complete attendance")}</span>
            </Button >}

            <span>
                <DropdownButton
                    name={<span className={styles.work_buttons_text}>{i18n.t('Mark all as')}</span> as unknown as string}
                    icon={loading ? <CircularProgress size={14} /> : <IconUserGroup16 />}
                    options={options}
                    disabled={disabled || loading}
                />
            </span>

            {
                openMarkAll && <ConfirmModal
                    i18n={i18n}
                    onSave={async () => {
                        setOpenMarkAll(false)
                        disable(true)
                        await formSubmit({ status: selectedOption.value }, tableValues.filter(x => x?.status !== "CANCELLED"))
                    }}
                    open={openMarkAll}
                    selectedOption={selectedOption}
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