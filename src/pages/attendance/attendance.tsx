import { useRecoilState, useRecoilValue } from 'recoil';
import { ProgramConfig, VariablesTypes } from 'dhis2-semis-types'
import React, { useEffect, useState } from "react";
import { TableDataRefetch, Modules } from "dhis2-semis-types"
import { Table } from "dhis2-semis-components";
import EnrollmentActionsButtons from "../../components/enrollmentButtons/EnrollmentActionsButtons";
import { useHeader, useTableData, useUrlParams, useViewPortWidth } from "dhis2-semis-functions";
import { useGetSchoolDays } from '../../hooks/schoolDays/useGetSchoolDays';
import { tableDataFormatter } from '../../utils/table/tableDataFormatter';
import InfoPageHolder from '../info/infoPage';
import { TableDataState } from '../../schema/table/tableDataSchema';
import AsssignStatus from '../../components/assingStatus/assignStatus';
import useGetSelectedKeys from '../../hooks/config/useGetSelectedKeys';

export default function Attendance() {
    const { program, dataStoreData } = useGetSelectedKeys()
    const { urlParameters, remove } = useUrlParams();
    const { formatData } = tableDataFormatter()
    const { viewPortWidth } = useViewPortWidth();
    const [selected, setSelected] = useState<any>([])
    const { data, loadingSchoolDays } = useGetSchoolDays()
    const reorganizeData = useRecoilValue(TableDataRefetch);
    const [selectable, setSelectable] = useState<boolean>(false)
    const [refetch, setRefetch] = useState<boolean>(false)
    const [attendanceHeaders, setattendanceHeaders] = useState<any>([])
    const [tableValues, setTableValues] = useRecoilState(TableDataState)
    const { getData, tableData, loading } = useTableData({ module: Modules.Attendance });
    const [pagination, setPagination] = useState({ page: 1, pageSize: 10, totalPages: 0, totalElements: 0 })
    const { academicYear, grade, class: section, schoolName, school, selectedDate, sectionType } = urlParameters();
    const [filterState, setFilterState] = useState<{ dataElements: any[], attributes: any[] }>({ attributes: [], dataElements: [] });
    const [selectedDay, setSelectedDates] = useState<{ occurredAfter: string, occurredBefore: string }>({ occurredAfter: "", occurredBefore: "" })
    const { columns } = useHeader({ dataStoreData, programConfigData: program as unknown as ProgramConfig, tableColumns: [], programStage: dataStoreData?.attendance?.programStage });

    useEffect(() => {
        return (() => {
            remove("selectedDate")
            remove("attendanceMode")
        })
    }, [])

    useEffect(() => {
        if (selectedDay.occurredAfter && selectedDay.occurredBefore) {
            void getData({
                page: pagination.page,
                pageSize: pagination.pageSize,
                program: program!.id as string,
                orgUnit: school!,
                baseProgramStage: dataStoreData?.registration?.programStage,
                attributeFilters: filterState.attributes,
                dataElementFilters: [
                    academicYear !== null ? `${dataStoreData.registration.academicYear}:in:${academicYear}` : null,
                    grade !== null ? `${dataStoreData.registration.grade}:in:${grade}` : null,
                    section !== null ? `${dataStoreData.registration.section}:in:${section}` : null,
                ].filter((filter): filter is string => filter !== null),
                attendanceConfig: dataStoreData?.attendance as any,
                ...selectedDay,
                otherProgramStage: dataStoreData?.attendance.programStage
            })
        }
    }, [sectionType, filterState, pagination.page, pagination.pageSize, selectedDay, refetch])

    useEffect(() => {
        let copy: any = []
        const toReplace = tableValues?.findIndex(x => x.replace)
        const notUpdated = tableData.data?.find(x => x.trackedEntity == tableData.data?.[toReplace]?.trackedEntity)

        if (toReplace >= 0) {
            copy = [...tableValues]
            copy[toReplace] = { ...notUpdated, [selectedDay?.occurredAfter]: tableValues?.[toReplace]?.[selectedDay?.occurredAfter] }
        }

        console.log(tableData.pagination, 648)
        setPagination((prev) => ({ ...prev, totalPages: tableData.pagination.totalPages, totalElements: tableData.pagination.totalElements }))
        setTableValues(formatData(
            [...(copy?.length > 0 ? copy : tableData.data)],
            attendanceHeaders,
            dataStoreData.attendance.statusOptions,
            dataStoreData?.['attendance'],
            selectedDay?.occurredAfter ?? selectedDate)
        )
    }, [tableData, reorganizeData])

    useEffect(() => {
        const filters = [
            academicYear && `${dataStoreData.registration.academicYear}:in:${academicYear}`,
            grade && `${dataStoreData.registration.grade}:in:${grade}`,
            section && `${dataStoreData.registration.section}:in:${section}`,
        ]
        setFilterState(() => ({ dataElements: filters, attributes: [] }))
    }, [academicYear, grade, section])

    console.log(attendanceHeaders, 4)

    return (
        <div style={{ height: "85vh" }}>
            {
                !(Boolean(schoolName) && Boolean(school)) ?
                    <InfoPageHolder />
                    :
                    <>
                        <Table
                            programConfig={program as unknown as any}
                            title="Attendance"
                            viewPortWidth={viewPortWidth}
                            columns={[
                                ...(columns ?? []).filter(x => x.visible && x.type !== VariablesTypes.DataElement),
                                ...(Array.isArray(attendanceHeaders) ? attendanceHeaders : []),
                            ]}
                            selected={selected}
                            setSelected={setSelected}
                            selectable={selectable}
                            tableData={tableValues}
                            defaultFilterNumber={5}
                            filterState={filterState}
                            loading={loading || loadingSchoolDays}
                            rightElements={
                                <EnrollmentActionsButtons
                                    selectable={selectable}
                                    setattendanceHeaders={setattendanceHeaders}
                                    config={data?.config}
                                    loading={!!(loading || loadingSchoolDays)}
                                    filetrState={filterState}
                                    selectedDataStoreKey={dataStoreData}
                                    programData={program as unknown as ProgramConfig}
                                    setSelectedDates={setSelectedDates}
                                    setSelectable={setSelectable}
                                />
                            }
                            beforeSettings={selectable ?
                                <AsssignStatus
                                    setSelected={setSelected}
                                    setRefetch={setRefetch}
                                    programData={program}
                                    dataStoreData={dataStoreData}
                                    date={selectedDay.occurredAfter}
                                    school={schoolName!}
                                    selected={selected}
                                /> :
                                <></>
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
