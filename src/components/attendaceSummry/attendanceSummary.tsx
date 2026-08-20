import { useRecoilValue } from 'recoil';
import styles from './attendanceSummary.module.css'
import { TableDataRefetch } from 'dhis2-semis-types';
import { useEffect, useState } from 'react';
import useGetSelectedKeys from '../../hooks/config/useGetSelectedKeys';
import { useCheckFilters, useGetEvents, useUrlParams } from 'dhis2-semis-functions';
import { allStudents } from '../../schema/students/allStudentList';
import { ModalComponent, useSchoolCalendarKey } from 'dhis2-semis-components';
import useCheckAttendaceDataElements from '../../hooks/common/useCheckDataElements';
import { Button, NoticeBox } from '@dhis2/ui';

export default function AttendanceSummary({ totalRecords, selectedDates }: { totalRecords: number, selectedDates: any }) {
    const reorganizeData = useRecoilValue(TableDataRefetch);
    const { dataStoreData } = useGetSelectedKeys()
    const { urlParameters } = useUrlParams();
    const { school } = urlParameters;
    const [totalAbsent, setTotalAbsent] = useState(0)
    const { getEvents } = useGetEvents()
    const allSt = useRecoilValue(allStudents)
    const { getFilters } = useCheckFilters({ filters: (dataStoreData?.filters?.dataElements ?? []) as unknown as any })
    const { academicYear: academicYearId } = useSchoolCalendarKey()
    const { verifyStageDataElements } = useCheckAttendaceDataElements()
    const { allPresent, missing } = verifyStageDataElements()
    const [showDetails, setShowDetails] = useState(false)

    useEffect(() => {

        const fetchAttendanceSummary = async () => {
            for (const attendanceStatus of dataStoreData?.attendance?.statusOptions ?? []) {
                const { data, pagination } = await getEvents({
                    program: dataStoreData?.program,
                    programStage: dataStoreData.attendance?.programStage,
                    ...selectedDates,
                    orgUnit: school,
                    filter: [
                        [`${dataStoreData?.attendance?.status}:in:${attendanceStatus?.code}`],
                        ...(urlParameters?.academicYear ? [`${academicYearId}:in:${urlParameters?.academicYear}`] : []),
                        ...getFilters(),
                    ],
                    trackedEntities: allSt?.map(x => x?.trackedEntity).join(';'),
                    totalPages: true,
                    pageSize: 100
                })

                setTotalAbsent(pagination?.total || 0)
            }
        }

        if (allPresent && selectedDates?.occurredAfter && selectedDates?.occurredBefore && allSt!?.length > 0) fetchAttendanceSummary()
    }, [reorganizeData, selectedDates, setTotalAbsent, allSt, allPresent])

    if (!allPresent) {
        return (
            <>
                <div className={styles.attendanceStats}>
                    <div className={styles.warningMessage}>
                        <div className={styles.warningIcon}>⚠</div>
                        <div className={styles.warningText}>
                            Missing configurations for attendance status.
                        </div>
                        <Button
                            small
                            secondary
                            onClick={() => setShowDetails(true)}
                        >
                            See more details
                        </Button>
                    </div>
                </div>

                <ModalComponent
                    handleClose={() => setShowDetails(false)}
                    open={showDetails}
                    showActions
                    size='medium'
                    position='top'
                    actions={[
                        { name: "Close", onClick: () => setShowDetails(false) }
                    ] as unknown as any}
                    children={
                        <div style={{ padding: '8px 0' }}>
                            <NoticeBox
                                title="Missing data elements in attendance program stage"
                                warning
                            >
                                To make the best use of the attendance mode feature, you need to associate these data elements with the attendance program stage.
                            </NoticeBox>

                            <div style={{ marginTop: '20px' }}>
                                <table className={styles.missingTable}>
                                    <thead>
                                        <tr>
                                            <th>Used as</th>
                                            <th>Data Element ID</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {missing.map((m: any) => (
                                            <tr key={m.id}>
                                                <td>{m.label}</td>
                                                <td>
                                                    <code className={styles.mono}>{m.id}</code>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    }
                />
            </>
        )
    }

    return (
        <div className={styles.attendanceStats}>
            <div className={`${styles.statBadge} ${styles.presentBadge}`}>
                <span className={styles.statLabel}>Present</span>
                <strong className={styles.statValue}>
                    {totalRecords - totalAbsent}
                </strong>
            </div>

            <div className={`${styles.statBadge} ${styles.absentBadge}`}>
                <span className={styles.statLabel}>Absent</span>
                <strong className={styles.statValue}>
                    {totalAbsent}
                </strong>
            </div>
        </div>
    )
}