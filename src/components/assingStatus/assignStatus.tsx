import { useUploadEvents } from "dhis2-semis-functions";
import { useState } from "react";
import { NoticeBox, Button } from "@dhis2/ui";
import { WithBorder, ModalComponent, CustomForm, WithPadding } from "dhis2-semis-components";
import { Form } from "react-final-form";
import { staticForm } from "../../constants/attendaceForm";
import PlaylistAddCheckIcon from '@material-ui/icons/PlaylistAddCheck';
import styles from './assignStatus.module.css'
import { eventBody } from "../../utils/attendance/eventBody";

export default function AsssignStatus({ setSelected, selected, school, date, programData, dataStoreData, setRefetch }: { setSelected: (args: any) => void, setRefetch: (args: any) => void, programData: any, dataStoreData: any, selected: any[], school: string, date: string }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const { uploadValues } = useUploadEvents()
    const programStatusOptions = programData?.programStages?.
        find((x: any) => x.id == dataStoreData?.attendance?.programStage)?.programStageDataElements?.
        find((x: any) => x.dataElement?.id == dataStoreData?.attendance?.status)?.dataElement?.optionSet
    const statusCodes = dataStoreData?.attendance?.statusOptions.map((item: any) => item.code)
    const attendaceStatus = programStatusOptions?.options?.filter((student: any) => statusCodes.includes(student.value))

    async function formSubmit(values: any) {
        setLoading(true)
        let events = []

        for (const tei of selected) {
            const eventId = tei?.[date]?.eventId ?? null

            events.push(eventBody({
                tei: tei.trackedEntity,
                event: eventId,
                program: tei.programId,
                stage: dataStoreData?.attendance?.programStage,
                absenceReason: dataStoreData?.attendance?.absenceReason,
                de: dataStoreData?.attendance?.status,
                ou: tei.orgUnitId,
                enrollment: tei.enrollmentId,
                date: date
            }, values.status))
        }

        await uploadValues({ events: events }, 'COMMIT', 'CREATE_AND_UPDATE')
            .then(() => { setLoading(false); setRefetch((prev: any) => (!prev)); setOpen(false); setSelected([]) })
            .catch(() => { setLoading(false); setOpen(false) })
    }

    return (
        <>
            <Button disabled={selected?.length == 0} onClick={() => {
                setOpen(true);
            }} icon={<PlaylistAddCheckIcon />}
                className={styles.btn}
            >
                <span>Assing attendace</span>
            </Button >

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
                                    onFormSubtmit={(e) => formSubmit(e)}
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