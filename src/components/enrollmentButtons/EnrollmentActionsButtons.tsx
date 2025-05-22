import React, { useEffect, useState } from 'react'
import { ButtonStrip, IconUserGroup16, IconAddCircle24 } from "@dhis2/ui";
import Tooltip from '@material-ui/core/Tooltip';
import styles from './enrollmentActionsButtons.module.css'
import { useGetSectionTypeLabel, useUrlParams, unavailableSchoolDays } from 'dhis2-semis-functions';
import { Form } from "react-final-form";
import { DataExporter, DataImporter, CustomDropdown as DropdownButton, DropDownCalendar } from 'dhis2-semis-components';
import { Event } from '@material-ui/icons';
import { getAttendanceDEHeaders } from '../../utils/common/getAttendanceDEHeaders';
import { EnrollmentButtonsProps } from '../../types/enrollmentButons/enrollmentButtonsTypes';
import { format } from "date-fns";
import { generateattendanceHeaders } from '../../utils/header/generateAttendanceDays';
import { Button } from "@dhis2/ui";
import PlaylistAddCheckIcon from '@material-ui/icons/PlaylistAddCheck';
import { useConfig } from '@dhis2/app-runtime';

function EnrollmentActionsButtons(props: EnrollmentButtonsProps) {
    const { selectable, programData, selectedDataStoreKey, filetrState, config, setattendanceHeaders, setSelectedDates, setSelectable } = props
    const { baseUrl } = useConfig()
    const { urlParameters, add } = useUrlParams();
    const { sectionName } = useGetSectionTypeLabel();
    const { unavailableDays } = unavailableSchoolDays()
    const [editModeValue, setEditModeValue] = useState<any>("")
    const { school: orgUnit, class: section, grade, academicYear, attendanceMode, selectedDate } = urlParameters();
    const [viewModeValue, setViewModeValue] = useState<any>({ selectedDate: selectedDate ? new Date(selectedDate) : new Date() })
    const { getValidDays } = generateattendanceHeaders({ setattendanceHeaders, setSelectedDates })
    const { getDataElementsHeaders } = getAttendanceDEHeaders({ setattendanceHeaders })

    const enrollmentOptions: any = [
        {
            label: <DataImporter
                baseURL={baseUrl}
                label={'Import students atendances'}
                module='attendance'
                onError={(e: any) => { console.log(e) }}
                programConfig={programData}
                sectionType={sectionName}
                selectedSectionDataStore={selectedDataStoreKey}
                updating={false}
                title={"Bulk Attendance"}
            />,
            divider: true,
            disabled: false,
        },
        {
            label: <DataExporter
                Form={Form}
                baseURL={baseUrl}
                eventFilters={filetrState.dataElements}
                fileName='teste'
                label='Export students atendances'
                module='attendance'
                onError={(e: any) => console.log(e)}
                programConfig={programData}
                sectionType={sectionName}
                selectedSectionDataStore={selectedDataStoreKey}
                empty={false}
                stagesToExport={[selectedDataStoreKey?.attendance?.programStage as unknown as string]}
            />,
            divider: false,
            disabled: false,
        },
    ];

    useEffect(() => {
        if (config && attendanceMode != 'edit') {
            const start = new Date(viewModeValue?.selectedDate ?? selectedDate)
            add('attendanceMode', 'view')
            add('selectedDate', format(new Date(start), "yyyy-MM-dd"))
            getValidDays(start, config)
        }
    }, [viewModeValue, config])

    useEffect(() => {
        if (editModeValue || attendanceMode == 'edit') {
            let currentDate = format(new Date(editModeValue?.selectedDate ?? selectedDate), "yyyy-MM-dd")
            add('selectedDate', currentDate)
            add('attendanceMode', 'edit')

            setSelectedDates({ occurredAfter: currentDate, occurredBefore: currentDate })
            getDataElementsHeaders(programData, selectedDataStoreKey?.['attendance']?.programStage)
        }
    }, [editModeValue])

    return (
        <div className={styles.container}>
            <ButtonStrip className={styles.work_buttons}>
                {attendanceMode == 'edit' && <Button destructive={selectable} onClick={() => setSelectable((prev: any) => !prev)} icon={<PlaylistAddCheckIcon />}> {selectable ? `Cancel multi-select` : `Multi-select`}</Button>}
                <Tooltip title={orgUnit === null ? "Please select an organisation unit before" : ""}>
                    <DropDownCalendar config={config} dateDisabler={unavailableDays} label='Take attendance' icon={<IconAddCircle24 />} setValue={setEditModeValue} value={editModeValue} />
                </Tooltip>

                <Tooltip title={orgUnit === null ? "Please select an organisation unit before" : ""}>
                    <DropDownCalendar config={config} dateDisabler={unavailableDays} label='View attendance records' icon={<Event />} setValue={setViewModeValue} value={viewModeValue} />
                </Tooltip>

                {attendanceMode != 'edit' && <DropdownButton
                    name={<span className={styles.work_buttons_text}>Bulk Final Result</span> as unknown as string}
                    disabled={!!(orgUnit == undefined || section == undefined || grade == undefined || academicYear == undefined)}
                    icon={<IconUserGroup16 />}
                    options={enrollmentOptions}
                />}
            </ButtonStrip>
        </div>
    )
}

export default EnrollmentActionsButtons
