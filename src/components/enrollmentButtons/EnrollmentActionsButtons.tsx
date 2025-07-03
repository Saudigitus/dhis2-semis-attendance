import React, { useEffect, useState } from 'react'
import { ButtonStrip, IconUserGroup16, IconAddCircle24 } from "@dhis2/ui";
import styles from './enrollmentActionsButtons.module.css'
import { useGetSectionTypeLabel, useUrlParams, unavailableSchoolDays, useShowAlerts, useCheckFilters } from 'dhis2-semis-functions';
import { Form } from "react-final-form";
import { DataExporter, DataImporter, CustomDropdown as DropdownButton, DropDownCalendar } from 'dhis2-semis-components';
import { getAttendanceDEHeaders } from '../../utils/common/getAttendanceDEHeaders';
import { EnrollmentButtonsProps } from '../../types/enrollmentButons/enrollmentButtonsTypes';
import { format } from "date-fns";
import { generateattendanceHeaders } from '../../utils/header/generateAttendanceDays';
import { useConfig } from '@dhis2/app-runtime';
import { Tooltip } from '@mui/material';
import { Event } from '@mui/icons-material';
import useGetSelectedKeys from '../../hooks/config/useGetSelectedKeys';

function EnrollmentActionsButtons(props: EnrollmentButtonsProps) {
    const { selectable, setIsTableReady, selectedDataStoreKey, config, setattendanceHeaders, setSelectedDates, setSelectable } = props
    const { baseUrl } = useConfig()
    const { dataStoreData, program: programData } = useGetSelectedKeys()
    const { urlParameters, add } = useUrlParams();
    const { sectionName } = useGetSectionTypeLabel();
    const { unavailableDays } = unavailableSchoolDays()
    const [editModeValue, setEditModeValue] = useState<any>("")
    const { school: orgUnit, class: section, grade, academicYear, attendanceMode, selectedDate } = urlParameters();
    const [viewModeValue, setViewModeValue] = useState<any>({ selectedDate: selectedDate ? new Date(selectedDate) : new Date() })
    const { getValidDays } = generateattendanceHeaders({ setattendanceHeaders, setSelectedDates })
    const { getDataElementsHeaders } = getAttendanceDEHeaders({ setattendanceHeaders })
    const { areAllSelected } = useCheckFilters({ filters: (dataStoreData.filters.dataElements ?? []) as unknown as any })
    const { hide, show } = useShowAlerts()

    const showAlert = (error: any) => {
        show({ message: `Unknown error: ${error}`, type: { critical: true } })
        setTimeout(hide, 5000);
    }

    const enrollmentOptions: any = [
        {
            label: <DataImporter
                baseURL={baseUrl}
                label={`Import ${sectionName}'s atendances`}
                module='attendance'
                onError={(e: any) => { showAlert(e) }}
                programConfig={programData!}
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
                eventFilters={[
                    ...(academicYear ? [`${selectedDataStoreKey.registration.academicYear}:in:${academicYear}`] : []),
                    ...(grade ? [`${selectedDataStoreKey.registration.grade}:in:${grade}`] : []),
                    ...(section ? [`${selectedDataStoreKey.registration.section}:in:${section}`] : []),
                ]}
                baseURL={baseUrl}
                label={`Export ${sectionName}'s atendances`}
                module='attendance'
                onError={(e: any) => { showAlert(e) }}
                programConfig={programData!}
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
        if (config || editModeValue) {
            setIsTableReady(false)
            const start = new Date(viewModeValue?.selectedDate ?? selectedDate)
            const formated = format(new Date(start), "yyyy-MM-dd")
            add('attendanceMode', 'view')
            add('selectedDate', formated)
            getValidDays(start, config)
            setSelectedDates((prev: any) => ({ occurredAfter: formated, occurredBefore: formated }))
        }
    }, [viewModeValue, config])

    useEffect(() => {
        if (editModeValue || attendanceMode == 'edit') {
            setIsTableReady(false)
            let currentDate = format(new Date(editModeValue?.selectedDate ?? selectedDate), "yyyy-MM-dd")
            add('selectedDate', currentDate)
            add('attendanceMode', 'edit')

            setSelectedDates((prev: any) => ({ occurredAfter: currentDate, occurredBefore: currentDate }))
            getDataElementsHeaders(programData, selectedDataStoreKey?.['attendance']?.programStage)
        }
    }, [editModeValue])

    return (
        <div className={styles.container}>
            <ButtonStrip className={styles.work_buttons}>
                {/* {attendanceMode == 'edit' && <Button destructive={selectable} onClick={() => setSelectable((prev: any) => !prev)} icon={<PlaylistAddCheckCircleOutlined />}> {selectable ? `Cancel multi-attendance` : `Multi-attendance`}</Button>} */}
                <Tooltip title={orgUnit === null ? "Please select an organisation unit before" : ""}>
                    <DropDownCalendar config={config} dateDisabler={unavailableDays} label='Take attendance' icon={<IconAddCircle24 />} setValue={(e) => setEditModeValue((prev: any) => ({ ...e }))} value={editModeValue} />
                </Tooltip>

                <Tooltip title={orgUnit === null ? "Please select an organisation unit before" : ""}>
                    <DropDownCalendar config={config} dateDisabler={unavailableDays} label='View attendance records' icon={<Event />} setValue={(e) => setViewModeValue((prev: any) => ({ ...e }))} value={viewModeValue} />
                </Tooltip>

                {attendanceMode != 'edit' &&
                    <Tooltip title={(grade === null || section === null) ? "Please select class and grade" : ""}>
                        <span>
                            <DropdownButton
                                name={<span className={styles.work_buttons_text}>Bulk Attendance</span> as unknown as string}
                                disabled={!!(orgUnit == undefined || !areAllSelected() || academicYear == undefined)}
                                icon={<IconUserGroup16 />}
                                options={enrollmentOptions}
                            />
                        </span>
                    </Tooltip>
                }
            </ButtonStrip>
        </div>
    )
}

export default EnrollmentActionsButtons
