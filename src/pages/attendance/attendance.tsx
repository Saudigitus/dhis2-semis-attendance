import { useRecoilState, useRecoilValue } from 'recoil';
import { ProgramConfig, VariablesTypes } from 'dhis2-semis-types'
import React, { useEffect, useState } from "react";
import { TableDataRefetch, Modules } from "dhis2-semis-types"
import { useDataStoreKey } from 'dhis2-semis-components'
import { Table, useProgramsKeys } from "dhis2-semis-components";
import EnrollmentActionsButtons from "../../components/enrollmentButtons/EnrollmentActionsButtons";
import { useGetSectionTypeLabel, useHeader, useTableData, useUrlParams, useViewPortWidth } from "dhis2-semis-functions";
import { useGetSchoolDays } from '../../hooks/schoolDays/useGetSchoolDays';
import { tableDataFormatter } from '../../utils/table/tableDataFormatter';
import InfoPageHolder from '../info/infoPage';
import { TableDataState } from '../../schema/table/tableDataSchema';

export default function Attendance() {
    const { sectionName } = useGetSectionTypeLabel()
    const dataStoreData: any = useDataStoreKey({ sectionType: sectionName });
    const programsValues: any = useProgramsKeys();
    const programData = programsValues[0];
    const { viewPortWidth } = useViewPortWidth();
    const { urlParameters } = useUrlParams();
    const [attendanceHeaders, setattendanceHeaders] = useState<any>([])
    const [selectedDay, setSelectedDates] = useState<{ occurredAfter: string, occurredBefore: string }>({ occurredAfter: "", occurredBefore: "" })
    const [pagination, setPagination] = useState({ page: 1, pageSize: 5, totalPages: 0 })
    const { academicYear, grade, class: section, schoolName, school } = urlParameters();
    const { getData, tableData, loading } = useTableData({ module: Modules.Attendance });
    const { columns } = useHeader({ dataStoreData, programConfigData: programData as unknown as ProgramConfig, tableColumns: [], programStage: dataStoreData?.attendance?.programStage });
    const [filterState, setFilterState] = useState<{ dataElements: any[], attributes: any[] }>({ attributes: [], dataElements: [] });
    const refetch = useRecoilValue(TableDataRefetch);
    const { data, loadingSchoolDays } = useGetSchoolDays()
    const { formatData } = tableDataFormatter()
    const [tableValues, setTableValues] = useRecoilState(TableDataState)

    useEffect(() => {
        if (selectedDay.occurredAfter && selectedDay.occurredBefore) {
            void getData({
                page: pagination.page,
                pageSize: pagination.pageSize,
                program: programData.id as string,
                orgUnit: "Shc3qNhrPAz",
                baseProgramStage: dataStoreData?.registration?.programStage,
                attributeFilters: filterState.attributes,
                dataElementFilters: [`${dataStoreData.registration.academicYear}:in:2025`],
                attendanceConfig: dataStoreData?.attendance,
                ...selectedDay,
                otherProgramStage: dataStoreData?.attendance.programStage
            })
        }
    }, [filterState, pagination.page, pagination.pageSize, selectedDay])

    useEffect(() => {
        let copy: any = []
        const toReplace = tableValues?.findIndex(x => x.replace)
        const notUpdated = tableData.data?.find(x => x.trackedEntity == tableData.data?.[toReplace]?.trackedEntity)

        if (toReplace >= 0) {
            copy = [...tableValues]
            copy[toReplace] = { ...notUpdated, [selectedDay?.occurredAfter]: tableValues?.[toReplace]?.[selectedDay?.occurredAfter] }
            console.log( copy[toReplace] ,'iiiii')
        }

        setPagination((prev) => ({ ...prev, totalPages: tableData.pagination.totalPages }))
        setTableValues(formatData(
            [...(copy?.length > 0 ? copy : tableData.data)],
            attendanceHeaders,
            dataStoreData.attendance.statusOptions,
            dataStoreData?.['attendance'],
            selectedDay?.occurredAfter)
        )
    }, [tableData, refetch])

    useEffect(() => {
        const filters = [
            academicYear && `${dataStoreData.registration.academicYear}:in:${academicYear}`,
            grade && `${dataStoreData.registration.grade}:in:${grade}`,
            section && `${dataStoreData.registration.section}:in:${section}`,
        ]
        setFilterState(() => ({ dataElements: filters, attributes: [] }))
    }, [academicYear, grade, section])

    return (
        <div style={{ height: "85vh" }}>
            {
                !(Boolean(schoolName) && Boolean(school)) ?
                    <InfoPageHolder />
                    :
                    <>
                        <Table
                            programConfig={programData as unknown as any}
                            title="Attendance"
                            viewPortWidth={viewPortWidth}
                            columns={[
                                ...columns.filter(x => (x.visible && x.type !== VariablesTypes.DataElement)),
                                ...attendanceHeaders
                            ]}
                            tableData={tableValues}
                            defaultFilterNumber={5}
                            filterState={filterState}
                            loading={loading || loadingSchoolDays}
                            rightElements={
                                <EnrollmentActionsButtons
                                    setattendanceHeaders={setattendanceHeaders}
                                    config={data?.config}
                                    loading={!!(loading || loadingSchoolDays)}
                                    filetrState={filterState}
                                    selectedDataStoreKey={dataStoreData}
                                    programData={programData as unknown as ProgramConfig}
                                    setSelectedDates={setSelectedDates}
                                />
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
