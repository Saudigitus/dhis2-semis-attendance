import { NoticeBox } from '@dhis2/ui'
import { ModalComponent } from 'dhis2-semis-components'
import { D2I18n } from 'dhis2-semis-types'

export default function ConfirmModal({ open, setOpen, onSave, i18n }: { i18n: D2I18n, onSave: () => void, open: boolean, setOpen: (open: boolean) => void }) {

    return (
        <ModalComponent
            children={
                <div>
                    <NoticeBox title={`${i18n.t('warning')}! ${i18n.t("all_listed_students_will_be_affected")}`} warning>
                        {i18n.t("the_present_attendance_status_will_be_assigned_to_all_students")}!
                    </NoticeBox>

                    <p style={{ margin: "25px 0" }}>{i18n.t("are_you_sure_you_want_to_mark_all_as_present?")}</p>
                </div>
            }
            handleClose={() => setOpen(false)}
            open={open}
            showActions
            size='medium'
            position='top'
            actions={[
                { name: i18n.t("cancel"), onClick: () => setOpen(false) },
                { name: i18n.t("yes_im_sure"), destructive: true, onClick: async () => onSave() }
            ] as unknown as any}
        />
    )
}