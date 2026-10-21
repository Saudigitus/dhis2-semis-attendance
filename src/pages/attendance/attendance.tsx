import { useRecoilState, useRecoilValue } from 'recoil';
import { ProgramConfig, D2I18n } from 'dhis2-semis-types'
import React, { useEffect, useState } from "react";
import { TableDataRefetch, Modules } from "dhis2-semis-types"
import { Table, useSchoolCalendarKey } from "dhis2-semis-components";
import { ReasonOfAbsenseState } from '../../schema/attendance/disableAllBtns';
import EnrollmentActionsButtons from "../../components/enrollmentButtons/EnrollmentActionsButtons";
import { useCheckFilters, useHeader, useTableData, useUrlParams, useViewPortWidth } from "dhis2-semis-functions";
import { tableDataFormatter } from '../../utils/table/tableDataFormatter';
import InfoPageHolder from '../info/infoPage';
import { TableDataState } from '../../schema/table/tableDataSchema';
import AsssignStatus from '../../components/assingStatus/assignStatus';
import useGetSelectedKeys from '../../hooks/config/useGetSelectedKeys';
import { Button, IconView24, IconViewOff24 } from "@dhis2/ui";
import { useGetAttenceStatus } from '../../hooks/attendance/useGetAttenceStatus';
import { classAttendanceEvent } from '../../schema/attendance/classAttendanceEvent';
import { completenessLoading } from '../../schema/attendance/completenessLoading';
import useGetRegistration from '../../hooks/useAllTeis/useGetRegistration';
import { attendanceStageFields, onlyStageFilters } from '../../utils/attendance/stageFields';

export default function Attendance({ i18n, baseUrl }: { i18n: D2I18n, baseUrl: string }) {
    const { program, dataStoreData } = useGetSelectedKeys()
    const { attendance = {} as unknown as any } = dataStoreData
    const { urlParameters } = useUrlParams(['position']);
    const { formatData } = tableDataFormatter()
    const { viewPortWidth } = useViewPortWidth();
    const [selected, setSelected] = useState<any>([])
    const [completeness, setCompletenessLoading] = useRecoilState(completenessLoading)
    const [attendanceEvent, setAttendanceEvent] = useRecoilState(classAttendanceEvent)
    const [refetch, setRefetch] = useState<boolean>(false)
    const reorganizeData = useRecoilValue(TableDataRefetch);
    const [isTableReady, setIsTableReady] = useState(false);
    const [selectable, setSelectable] = useState<boolean>(false)
    const { academicYear: academicYearId } = useSchoolCalendarKey()
    const [attendanceHeaders, setattendanceHeaders] = useState<any>([])
    const [tableValues, setTableValues] = useRecoilState(TableDataState)
    const [seeReason, setSeeReason] = useRecoilState(ReasonOfAbsenseState)
    const { getData, tableData, loading } = useTableData({ module: Modules.Attendance });
    const [pagination, setPagination] = useState({ page: 1, pageSize: 50, totalPages: 0, totalElements: 0 })
    const { schoolName, school, selectedDate, attendanceMode } = urlParameters;
    const { getFilters, areAllSelected } = useCheckFilters({ filters: (dataStoreData?.filters?.dataElements ?? []) as unknown as any })
    const [filterState, setFilterState] = useState<{ dataElements: any[], attributes: any[] }>({ attributes: [], dataElements: [] });
    const [selectedDates, setSelectedDates] = useState<{ occurredAfter: string, occurredBefore: string }>({ occurredAfter: "", occurredBefore: "" })
    const { columns } = useHeader({ dataStoreData, programConfigData: program as unknown as ProgramConfig, programStage: "" });
    const { getEnrollmentStatus } = useGetAttenceStatus({ setAttendanceEvent, setattendanceHeaders, selectedDates, setCompletenessLoading, attendanceHeaders })
    const { getRegistrationData, loadingAllStudens } = useGetRegistration()

    useEffect(() => void getRegistrationData(), [urlParameters])

    useEffect(() => {
        if (selectedDates?.occurredAfter && selectedDates?.occurredBefore && areAllSelected()) {
            void getData({
                program: program!?.id as string,
                page: pagination?.page,
                pageSize: pagination?.pageSize,
                orgUnit: urlParameters?.school!,
                baseProgramStage: dataStoreData?.registration?.programStage,
                attributeFilters: filterState.attributes,
                dataElementFilters: [
                    ...(urlParameters?.academicYear ? [`${academicYearId}:in:${urlParameters?.academicYear}`] : []),
                    ...getFilters() as unknown as any
                ],
                // Attendance records are searched only by the class fields that the attendance stage has.
                attendanceDataElementFilters: onlyStageFilters([
                    ...(urlParameters?.academicYear ? [`${academicYearId}:in:${urlParameters?.academicYear}`] : []),
                    ...getFilters() as unknown as any
                ], attendanceStageFields(program, attendance?.programStage)),
                attendanceConfig: attendance,
                ...selectedDates,
                otherProgramStage: attendance?.programStage,
                order: dataStoreData.defaults.defaultOrder || "occurredAt:desc",
            }).then(_ => {
                setTableValues([])
                setIsTableReady(true)
            })
        }
    }, [filterState.attributes, refetch, selectedDates, urlParameters, pagination?.page, pagination?.pageSize])

    useEffect(() => {
        if (attendance?.attendanceStatus?.allowAttendanceStatus && attendanceMode == 'edit')
            getEnrollmentStatus([])
    }, [completeness.refetch, selectedDates, urlParameters])

    useEffect(() => {
        if (attendance?.attendanceStatus?.allowAttendanceStatus && (tableData?.data?.length > 0 && attendanceMode != 'edit'))
            getEnrollmentStatus(tableData)
    }, [tableData?.data, urlParameters])

    useEffect(() => {
        let copy: any = []
        const toReplace = tableValues?.findIndex(x => x.replace)
        const notUpdated = tableData.data?.find((x: any) => x.trackedEntity == tableData?.data?.[toReplace]?.trackedEntity)

        if (toReplace >= 0) {
            copy = [...tableValues]
            copy[toReplace] = { ...notUpdated, [selectedDate!]: tableValues?.[toReplace]?.[selectedDate!] }
        }

        // Build the table from the records just read; re-using the rows already drawn hid the saved absences in View.
        const formatedData = formatData([...(
            copy?.length > 0 ? copy : tableData?.data)
        ], attendanceHeaders, attendanceEvent)

        setPagination((prev) => ({ ...prev, totalPages: tableData?.pagination?.totalPages, totalElements: tableData?.pagination?.totalElements }))
        setTableValues(formatedData)
    }, [tableData, reorganizeData, attendanceMode, seeReason, pagination.page, attendanceEvent, attendanceHeaders])

    return (
        <div style={{ height: "85vh" }}>
            {
                !(Boolean(schoolName) && Boolean(school) && areAllSelected()) ?
                    <InfoPageHolder i18n={i18n} />
                    :
                    <>
                        <Table
                            programConfig={program as unknown as any}
                            title={i18n.t('Attendance title')}
                            viewPortWidth={viewPortWidth}
                            columns={[
                                ...(columns ?? []),
                                ...(Array.isArray(attendanceHeaders) ? attendanceHeaders : [])
                            ]}
                            selected={selected}
                            setSelected={setSelected}
                            selectable={selectable}
                            tableData={tableValues}
                            enableInactiveRowSelection={false}
                            filterState={filterState}
                            loading={!isTableReady || loading || (completeness?.loading && attendanceMode != 'edit') || loadingAllStudens}
                            rightElements={
                                <EnrollmentActionsButtons
                                    selectable={selectable}
                                    setIsTableReady={setIsTableReady}
                                    setattendanceHeaders={setattendanceHeaders}
                                    loading={loading}
                                    selectedDataStoreKey={dataStoreData}
                                    setSelectedDates={setSelectedDates}
                                    setSelectable={setSelectable}
                                    i18n={i18n}
                                    setRefetch={setRefetch}
                                    refetch={refetch}
                                    baseUrl={baseUrl}
                                    totalRecords={tableData?.pagination?.totalElements}
                                    selectedDates={selectedDates}
                                />
                            }
                            beforeSettings={
                                (attendanceMode == 'edit') ?
                                    <>
                                        <AsssignStatus
                                            disabled={tableData?.data?.length == 0}
                                            loadingTableData={loading}
                                            setSelected={setSelected}
                                            setRefetch={setRefetch}
                                            school={schoolName!}
                                            selected={selected}
                                            selectable={selectable}
                                            i18n={i18n}
                                            selectedDates={selectedDates}
                                            totalRecords={tableData?.pagination?.totalElements}
                                        />
                                    </>
                                    : <Button onClick={() => setSeeReason(!seeReason)} icon={seeReason ? <IconViewOff24 /> : <IconView24 />}>
                                        {seeReason ? i18n.t('Hide reason of absense') : i18n.t('View reason of absense')}
                                    </Button>
                            }
                            setFilterState={setFilterState}
                            pagination={tableData?.pagination}
                            setPagination={setPagination}
                            paginate={!loading}
                        />
                    </>
            }
        </div>
    )
}
