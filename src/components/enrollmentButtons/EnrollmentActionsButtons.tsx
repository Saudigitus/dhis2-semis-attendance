import React, { useEffect, useState } from 'react'
import { ButtonStrip, IconUserGroup16, IconAddCircle24 } from "@dhis2/ui";
import Tooltip from '@material-ui/core/Tooltip';
import styles from './enrollmentActionsButtons.module.css'
import { useGetSectionTypeLabel, useUrlParams, unavailableSchoolDays } from 'dhis2-semis-functions';
import { Form } from "react-final-form";
import { ProgramConfig, selectedDataStoreKey } from 'dhis2-semis-types'
import { DataExporter, DataImporter, CustomDropdown as DropdownButton, DropDownCalendar } from 'dhis2-semis-components';
import ShowStats from '../stats/showStats';
import { Event } from '@material-ui/icons';
import { generateAttendanceDays } from '../../utils/header/generateAttendanceDays';
import { getAttendanceDEHeaders } from '../../utils/common/getAttendanceDEHeaders';

function EnrollmentActionsButtons({ programData, selectedDataStoreKey, filetrState, loading, config, setAttendanceDays }: { setAttendanceDays: (args: any[]) => void, config: any, loading: boolean, filetrState: any, programData: ProgramConfig, selectedDataStoreKey: selectedDataStoreKey }) {
    const { urlParameters } = useUrlParams();
    const { school: orgUnit, class: section, grade, academicYear } = urlParameters();
    const { sectionName } = useGetSectionTypeLabel();
    const [stats, setStats] = useState<{ posted: number, conflicts: any[] }>({ posted: 0, conflicts: [] })
    const [open, setOpen] = useState<boolean>(false)
    const [viewModeValue, setViewModeValue] = useState<any>({ selectedDate: new Date() })
    const [editModeValue, setEditModeValue] = useState<any>("")
    const { unavailableDays } = unavailableSchoolDays()
    const { getValidDays } = generateAttendanceDays({ setAttendanceDays })
    const { getDataElementsHeaders } = getAttendanceDEHeaders({ setAttendanceDays })

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

    useEffect(() => {
        if (config) {
            const start = new Date(viewModeValue?.selectedDate)
            getValidDays(start, config)
        }
    }, [viewModeValue, config])

    useEffect(() => {
        if (editModeValue) getDataElementsHeaders(programData, selectedDataStoreKey?.['attendance']?.programStage)
    }, [editModeValue])

    return (
        <div className={styles.container}>
            <ShowStats open={open} setOpen={setOpen} stats={stats} />
            {!loading && <ButtonStrip className={styles.work_buttons}>
                <Tooltip title={orgUnit === null ? "Please select an organisation unit before" : ""}>
                    <DropDownCalendar config={config} dateDisabler={unavailableDays} label='Take attendance' icon={<IconAddCircle24 />} setValue={setEditModeValue} value={editModeValue} />
                </Tooltip>

                <Tooltip title={orgUnit === null ? "Please select an organisation unit before" : ""}>
                    <DropDownCalendar config={config} dateDisabler={unavailableDays} label='View attendance records' icon={<Event />} setValue={setViewModeValue} value={viewModeValue} />
                </Tooltip>

                <DropdownButton
                    name={<span className={styles.work_buttons_text}>Bulk Final Result</span> as unknown as string}
                    disabled={!!(orgUnit == undefined || section == undefined || grade == undefined || academicYear == undefined)}
                    icon={<IconUserGroup16 />}
                    options={enrollmentOptions}
                />
            </ButtonStrip>}
        </div>
    )
}

export default EnrollmentActionsButtons
