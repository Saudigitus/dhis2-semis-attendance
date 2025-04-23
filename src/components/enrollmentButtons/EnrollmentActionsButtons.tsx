import React, { useState } from 'react'
import { ButtonStrip, IconUserGroup16, Button, IconCalendar24, IconAddCircle24 } from "@dhis2/ui";
import Tooltip from '@material-ui/core/Tooltip';
import styles from './enrollmentActionsButtons.module.css'
import { useGetSectionTypeLabel, useUrlParams } from 'dhis2-semis-functions';
import { Form } from "react-final-form";
import { ProgramConfig, selectedDataStoreKey } from 'dhis2-semis-types'
import { DataExporter, DataImporter, CustomDropdown as DropdownButton } from 'dhis2-semis-components';
import ShowStats from '../stats/showStats';
import { Event } from '@material-ui/icons';

function EnrollmentActionsButtons({ programData, selectedDataStoreKey, filetrState, selected }: { selected: any, filetrState: any, programData: ProgramConfig, selectedDataStoreKey: selectedDataStoreKey }) {
    const { urlParameters } = useUrlParams();
    const { school: orgUnit, class: section, grade, academicYear } = urlParameters();
    const { sectionName } = useGetSectionTypeLabel();
    const [stats, setStats] = useState<{ posted: number, conflicts: any[] }>({ posted: 0, conflicts: [] })
    const [open, setOpen] = useState<boolean>(false)
    const [anchorElAddNew, setAnchorElAddNew] = useState<null | HTMLElement>(null);
    const [anchorViewLast, setAnchorViewLast] = useState<null | HTMLElement>(null);

    const enrollmentOptions: any = [
        {
            label: <DataImporter
                baseURL='http://localhost:8080'
                importMode='COMMIT'
                label={'Bulk Final Result'}
                module='final-result'
                onError={(e: any) => { console.log(e) }}
                programConfig={programData}
                sectionType={sectionName}
                selectedSectionDataStore={selectedDataStoreKey}
                updating={false}
                title={"Bulk Final Result"}
            />,
            divider: true,
            disabled: false,
        },
        {
            label: <DataExporter
                Form={Form}
                baseURL='http://localhost:8080'
                eventFilters={filetrState.dataElements}
                fileName='teste'
                label='Export Final Result'
                module='final-result'
                onError={(e: any) => console.log(e)}
                programConfig={programData}
                sectionType={sectionName}
                selectedSectionDataStore={selectedDataStoreKey}
                empty={false}
                stagesToExport={[selectedDataStoreKey?.['final-result']?.programStage as unknown as string]}
            />,
            divider: false,
            disabled: false,
        }
    ];

    return (
        <div className={styles.container}>
            <ShowStats open={open} setOpen={setOpen} stats={stats} />
            <ButtonStrip className={styles.work_buttons}>
                <Tooltip title={orgUnit === null ? "Please select an organisation unit before" : ""}>
                    <span onClick={(event: React.MouseEvent<HTMLElement>) => { setAnchorElAddNew(event.currentTarget) }}>
                        <Button icon={<IconAddCircle24 />}>Take attendance</Button>
                    </span>
                </Tooltip>

                <Tooltip title={orgUnit === null ? "Please select an organisation unit before" : ""}>
                    <span onClick={(event: React.MouseEvent<HTMLElement>) => { setAnchorViewLast(event.currentTarget ) }}>
                        <Button icon={<Event />}>View attendance records</Button>
                    </span>
                </Tooltip>

                <DropdownButton
                    name={<span className={styles.work_buttons_text}>Bulk Final Result</span> as unknown as string}
                    disabled={!!(orgUnit == undefined || section == undefined || grade == undefined || academicYear == undefined)}
                    icon={<IconUserGroup16 />}
                    options={enrollmentOptions}
                />
            </ButtonStrip>
        </div>
    )
}

export default EnrollmentActionsButtons
