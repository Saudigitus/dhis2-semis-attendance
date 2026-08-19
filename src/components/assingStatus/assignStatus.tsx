import { useState } from "react";
import { NoticeBox, Button } from "@dhis2/ui";
import { WithBorder, ModalComponent, CustomForm, WithPadding } from "dhis2-semis-components";
import { Form } from "react-final-form";
import { staticForm } from "../../constants/attendaceForm";
import styles from './assignStatus.module.css'
import { CircularProgress } from "@mui/material";
import { useSaveValues } from "../../hooks/attendance/saveValues";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { attendanceFormProps } from "../../types/attendance/attendanceTypes";
import { DisaleButtonsState } from "../../schema/attendance/disableAllBtns";
import { CheckCircleOutline, HighlightOff, EditNote } from "@mui/icons-material";
import useGetSelectedKeys from "../../hooks/config/useGetSelectedKeys";
import ConfirmModal from "../modal/modalConfirm";
import { useUrlParams } from "dhis2-semis-functions";
import { IconUserGroup16 } from "@dhis2/ui";
import { CustomDropdown as DropdownButton } from 'dhis2-semis-components';
import classNames from "classnames";
import { useAttendanceCompleteness } from "../../hooks/attendance/attendanceCompleteness";
import { useAttendanceOptions } from "../../hooks/attendance/useGetAttendanceOptions";
import { completenessLoading } from "../../schema/attendance/completenessLoading";
import { classAttendanceEvent } from "../../schema/attendance/classAttendanceEvent";

export default function AssignStatus({
    setSelected, selected, school, setRefetch, i18n, loadingTableData, totalRecords, selectedDates
}: attendanceFormProps) {
    const completeness = useRecoilValue(completenessLoading)
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [selectedOption, setSelectedOption] = useState({ value: '', label: '' })
    const [openMarkAll, setOpenMarkAll] = useState(false)
    const { dataStoreData } = useGetSelectedKeys()
    const { attendance = {} as unknown as any } = dataStoreData
    const { formSubmit } = useSaveValues({ setLoading, dataStoreData, setSelected, setRefetch, setOpen, })
    const disable = useSetRecoilState(DisaleButtonsState)
    const { useQuery } = useUrlParams()
    const date = useQuery.get('selectedDate')!
    const { completeOrDelete } = useAttendanceCompleteness()
    const { validAttendanceStatus } = useAttendanceOptions()
    const allowAttendanceStatus = attendance?.attendanceStatus?.allowAttendanceStatus === true
    const attendanceEvent = useRecoilValue(classAttendanceEvent)

    const disableMarkAllAs = allowAttendanceStatus && !!!attendanceEvent ? true :
        allowAttendanceStatus && attendanceEvent?.status === 'ACTIVE' ? false
            : allowAttendanceStatus && attendanceEvent?.status == 'COMPLETED' ? true : false


    const options = validAttendanceStatus?.map((item: any) => ({
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
            {allowAttendanceStatus && <Button
                loading={completeness?.loading}
                disabled={completeness?.refetch || loadingTableData}
                onClick={() => completeOrDelete(
                    attendanceEvent?.status === 'ACTIVE' ? totalRecords : null,
                    selectedDates,
                    (attendanceEvent?.status === 'COMPLETED' || !attendanceEvent) ? 'ACTIVE' : 'COMPLETED'
                )}
                icon={
                    !attendanceEvent ? <EditNote style={{ color: "#ffb300" }} />
                        : (attendanceEvent?.status === 'ACTIVE')
                            ? <CheckCircleOutline style={{ color: "#21B26D" }} />
                            : (attendanceEvent?.status === 'COMPLETED') && <HighlightOff />
                }
                className={classNames(attendanceEvent ? styles.btn : styles.pulseBtn)}
                destructive={(attendanceEvent && attendanceEvent?.status === 'COMPLETED')}
            >
                <span>{
                    completeness?.loading && !attendanceEvent ? "loading" :
                        attendanceEvent ? attendanceEvent?.status === 'ACTIVE' ? i18n.t("Complete attendance") : attendanceEvent?.status === 'COMPLETED' && i18n.t("Update attendance") : i18n.t("Start attendance")
                }
                </span>
            </Button >}

            <span>
                <DropdownButton
                    name={<span className={styles.work_buttons_text}>{i18n.t('Mark all as')}</span> as unknown as string}
                    icon={loading ? <CircularProgress size={14} /> : <IconUserGroup16 />}
                    options={allowAttendanceStatus ? [...options,
                    {
                        label: "Present", value: "null", onClick: () => {
                            setSelectedOption({ value: "null", label: "Present" })
                            setOpenMarkAll(true)
                        }
                    }
                    ] : options}
                    disabled={loadingTableData || loading || completeness?.loading || disableMarkAllAs}
                />
            </span>

            {
                openMarkAll && <ConfirmModal
                    i18n={i18n}
                    onSave={async () => {
                        setOpenMarkAll(false)
                        disable(true)
                        await formSubmit({ status: selectedOption.value })
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
                                            fields: [...staticForm(validAttendanceStatus) as unknown as any]
                                        }
                                    ]}
                                    storyBook={false}
                                    withButtons={true}
                                    onFormSubtmit={(e: any) => formSubmit(e)}
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