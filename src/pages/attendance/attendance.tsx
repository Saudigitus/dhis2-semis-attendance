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
import { format } from 'date-fns'
import { useGetAttenceStatus } from '../../hooks/attendance/useGetAttenceStatus';

export default function Attendance({ i18n }: { i18n: D2I18n }) {
    const { program, dataStoreData } = useGetSelectedKeys()
    const { attendance = {} as unknown as any } = dataStoreData
    const { urlParameters } = useUrlParams(['position']);
    const { formatData } = tableDataFormatter()
    const { viewPortWidth } = useViewPortWidth();
    const [selected, setSelected] = useState<any>([])
    const [completenessLoading, setCompletenessLoading] = useState<any>({ refetch: false, loading: false })
    const [attendanceEvent, setAttendanceEvent] = useState<any | null>(null)
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
    const { schoolName, school, selectedDate, attendanceMode, academicYear } = urlParameters;
    const { getFilters, areAllSelected } = useCheckFilters({ filters: (dataStoreData?.filters?.dataElements ?? []) as unknown as any })
    const [filterState, setFilterState] = useState<{ dataElements: any[], attributes: any[] }>({ attributes: [], dataElements: [] });
    const [selectedDates, setSelectedDates] = useState<{ occurredAfter: string, occurredBefore: string }>({ occurredAfter: "", occurredBefore: "" })
    const { columns } = useHeader({ dataStoreData, programConfigData: program as unknown as ProgramConfig, programStage: attendance?.programStage });
    const { getEnrollmentStatus } = useGetAttenceStatus({ setAttendanceEvent, setattendanceHeaders, selectedDates, setCompletenessLoading })

    useEffect(() => {
        if (selectedDates?.occurredAfter && selectedDates?.occurredBefore && areAllSelected()) {
            void getData({
                page: pagination.page,
                pageSize: pagination.pageSize,
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
            }).then(() => setIsTableReady(true))
        }
    }, [filterState.attributes, pagination.page, pagination.pageSize, refetch, selectedDates, urlParameters])

    useEffect(() => {
        if (attendance?.attendanceStatus?.allowAttendanceStatus && academicYear && school && areAllSelected() && selectedDates?.occurredAfter && selectedDates?.occurredBefore) {
            setAttendanceEvent(null)
            getEnrollmentStatus()
        }
    }, [selectedDates, completenessLoading.refetch])

    useEffect(() => {
        let copy: any = []
        const toReplace = tableValues?.findIndex(x => x.replace)
        const notUpdated = tableData.data?.find(x => x.trackedEntity == tableData?.data?.[toReplace]?.trackedEntity)

        if (toReplace >= 0) {
            copy = [...tableValues]
            copy[toReplace] = { ...notUpdated, [selectedDate!]: tableValues?.[toReplace]?.[selectedDate!] }
        }

        setPagination((prev) => ({ ...prev, totalPages: tableData.pagination.totalPages, totalElements: tableData.pagination.totalElements }))
        setTableValues(formatData([...(copy?.length > 0 ? copy : tableData?.data)], attendanceHeaders))
    }, [tableData, reorganizeData, attendanceMode, seeReason])

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
                            loading={!isTableReady || loading}
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
                                />
                            }
                            beforeSettings={
                                attendanceMode == 'edit' ?
                                    <>
                                        <AsssignStatus
                                            disabled={loading}
                                            setSelected={setSelected}
                                            setRefetch={setRefetch}
                                            programData={program}
                                            school={schoolName!}
                                            selected={selected}
                                            selectable={selectable}
                                            i18n={i18n}
                                            attendanceEvent={attendanceEvent}
                                            completenessLoading={completenessLoading}
                                            setCompletenessLoading={setCompletenessLoading}
                                        />
                                        <Chip selected>
                                            {`${i18n.t('Selected date')}: ${selectedDate && format(new Date(selectedDate), 'dd/MM/yyyy')}`}
                                        </Chip>
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
