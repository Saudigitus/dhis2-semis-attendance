import { useRecoilValue } from 'recoil';
import styles from './attendanceSummary.module.css'
import { TableDataRefetch } from 'dhis2-semis-types';
import { useEffect, useState } from 'react';
import useGetSelectedKeys from '../../hooks/config/useGetSelectedKeys';
import { useGetEvents, useUrlParams } from 'dhis2-semis-functions';

export default function AttendanceSummary({ totalRecords, selectedDates }: { totalRecords: number, selectedDates: any }) {
    const reorganizeData = useRecoilValue(TableDataRefetch);
    const { dataStoreData } = useGetSelectedKeys()
    const { urlParameters } = useUrlParams();
    const { school } = urlParameters;
    const [totalAbsent, setTotalAbsent] = useState(0)
    const { getEvents } = useGetEvents()

    useEffect(() => {
        const fetchAttendanceSummary = async () => {
            for (const attendanceStatus of dataStoreData?.attendance?.statusOptions ?? []) {
                const { data, pagination } = await getEvents({
                    program: dataStoreData?.program,
                    programStage: dataStoreData.attendance?.programStage,
                    ...selectedDates,
                    orgUnit: school,
                    filter: [
                        `${dataStoreData?.attendance?.status}:in:${attendanceStatus?.code}`
                    ],
                    totalPages: true,
                    pageSize: 1
                })

                setTotalAbsent(pagination?.total || 0)
            }
        }

        if (selectedDates?.occurredAfter && selectedDates?.occurredBefore) fetchAttendanceSummary()
    }, [reorganizeData, selectedDates, setTotalAbsent])

    return (
        // <div className="attendance-summary">
        //     <div className="summary-card present">
        //         <span className="summary-number">{(totalRecords - totalAbsent) || '--'}</span>
        //     </div>

        //     <div className="summary-card absent">
        //         <span className="summary-number">{totalAbsent}</span>
        //     </div>
        // </div>
        <div className={styles.attendanceStats}>
            <div className={`${styles.statBadge} ${styles.presentBadge}`}>
                {/* <span className={styles.statDot} /> */}
                <span className={styles.statLabel}>Present</span>
                <strong className={styles.statValue}>
                    {totalRecords - totalAbsent}
                </strong>
            </div>

            <div className={`${styles.statBadge} ${styles.absentBadge}`}>
                {/* <span className={styles.statDot} /> */}
                <span className={styles.statLabel}>Absent</span>
                <strong className={styles.statValue}>
                    {totalAbsent}
                </strong>
            </div>
        </div>
        // <div className="attendance-summary">
        //     <div className="summary-wrapper">
        //         <div className="summary-card present">
        //             <span className="summary-number">{(totalRecords - totalAbsent) || '--'}</span>
        //         </div>
        //         <span className="summary-label">Present</span>
        //     </div>

        //     <div className="summary-wrapper">
        //         <div className="summary-card absent">
        //             <span className="summary-number">{totalAbsent}</span>
        //         </div>
        //         <span className="summary-label">Absent</span>
        //     </div>
        // </div>
    )
}