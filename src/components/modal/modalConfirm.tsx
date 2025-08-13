import { NoticeBox } from '@dhis2/ui'
import { ModalComponent } from 'dhis2-semis-components'

export default function ConfirmModal({ open, setOpen, onSave }: { onSave: () => void, open: boolean, setOpen: (open: boolean) => void }) {

    return (
        <ModalComponent
            children={
                <div>
                    <NoticeBox title={`WARNING! All listed students will be affected`} warning>
                        The present attendance status will be assigned to all students!
                    </NoticeBox>

                    <p style={{ margin: "25px 0" }}>Are you sure you want to mark all as present?</p>
                </div>
            }
            handleClose={() => setOpen(false)}
            open={open}
            showActions
            size='medium'
            position='top'
            actions={[
                { name: "Cancel", onClick: () => setOpen(false) },
                { name: "Yes, I'm sure", destructive: true, onClick: async () => onSave() }
            ] as unknown as any}
        />
    )
}