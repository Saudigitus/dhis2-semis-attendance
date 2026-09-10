import { useRecoilState, useRecoilValue } from 'recoil';
import { ProgramConfig, VariablesTypes, D2I18n } from 'dhis2-semis-types'
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
import { Button, IconView24, IconViewOff24, Chip } from "@dhis2/ui";
import { useGetAttenceStatus } from '../../hooks/attendance/useGetAttenceStatus';
import { classAttendanceEvent } from '../../schema/attendance/classAttendanceEvent';
import { completenessLoading } from '../../schema/attendance/completenessLoading';
import useGetRegistration from '../../hooks/useAllTeis/useGetRegistration';
import { allStudents } from '../../schema/students/allStudentList';

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
    const { columns } = useHeader({ dataStoreData, programConfigData: program as unknown as ProgramConfig, programStage: attendance?.programStage });
    const { getEnrollmentStatus } = useGetAttenceStatus({ setAttendanceEvent, setattendanceHeaders, selectedDates, setCompletenessLoading, attendanceHeaders })
    const [students, setAllData] = useRecoilState(allStudents)
    const { getRegistrationData } = useGetRegistration()

    useEffect(() => void getRegistrationData(), [school])

    useEffect(() => {
        if (selectedDates?.occurredAfter && selectedDates?.occurredBefore && areAllSelected()) {
            void getData({
                program: program!?.id as string,
                orgUnit: urlParameters?.school!,
                baseProgramStage: dataStoreData?.registration?.programStage,
                attributeFilters: filterState.attributes,
                dataElementFilters: [
                    ...(urlParameters?.academicYear ? [`${academicYearId}:in:${urlParameters?.academicYear}`] : []),
                    ...getFilters() as unknown as any
                ],
                attendanceConfig: attendance,
                ...selectedDates,
                otherProgramStage: attendance?.programStage,
                order: dataStoreData.defaults.defaultOrder || "occurredAt:desc",
            }).then((resp: any) => {
                setAllData(resp?.data)
                setIsTableReady(true)
            })
        }
    }, [filterState.attributes, refetch, selectedDates, urlParameters])

    useEffect(() => {
        if (attendance?.attendanceStatus?.allowAttendanceStatus && attendanceMode == 'edit')
            getEnrollmentStatus([])
    }, [completeness.refetch, selectedDates])

    useEffect(() => {
        if (attendance?.attendanceStatus?.allowAttendanceStatus && (tableData?.data?.length > 0 && attendanceMode != 'edit'))
            getEnrollmentStatus(tableData)
    }, [tableData?.data])

    useEffect(() => {
        let copy: any = []
        const start = (pagination?.page - 1) * pagination?.pageSize
        const end = start + pagination?.pageSize
        const toReplace = tableValues?.findIndex(x => x.replace)
        const notUpdated = tableData.data?.find((x: any) => x.trackedEntity == tableData?.data?.[toReplace]?.trackedEntity)
        if (toReplace >= 0) {
            copy = [...tableValues]
            copy[toReplace] = { ...notUpdated, [selectedDate!]: tableValues?.[toReplace]?.[selectedDate!] }
            setAllData([...copy])
        }

        setPagination((prev) => ({ ...prev, totalPages: Math.ceil(tableData?.data?.length / pagination.pageSize), totalElements: tableData?.data?.length }))
        setTableValues(formatData([...(copy?.length > 0 ? copy : tableData?.data)]?.slice(start, end), attendanceHeaders, attendanceEvent))
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
                                ...(columns ?? []).filter((x: any) => x.visible && x.type !== VariablesTypes.DataElement),
                                ...(columns ?? []).filter((x: any) => dataStoreData?.filters?.dataElements?.some((y: any) => y.dataElement == x.id)),
                                ...(Array.isArray(attendanceHeaders) ? attendanceHeaders : []),
                            ]}
                            selected={selected}
                            setSelected={setSelected}
                            selectable={selectable}
                            tableData={tableValues}
                            defaultFilterNumber={5}
                            enableInactiveRowSelection={false}
                            filterState={filterState}
                            loading={!isTableReady || loading || (completeness?.loading && attendanceMode != 'edit')}
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
                                    baseUrl={baseUrl}
                                    totalRecords={tableData?.pagination?.totalElements}
                                    selectedDates={selectedDates}
                                />
                            }
                            beforeSettings={
                                (attendanceMode == 'edit') ?
                                    <>
                                        <AsssignStatus
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
                            pagination={pagination}
                            setPagination={setPagination}
                            paginate={!loading}
                        />
                    </>
            }
        </div>
    )
}
