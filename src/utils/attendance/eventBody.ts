import { format } from "date-fns";

export function eventBody(rest: any, value: any, allowAttendanceStatus: any) {

    return {
        ...(rest.event ? { event: rest.event } : {}),
        ...(allowAttendanceStatus === true && value === 'null' ? {} : {
            trackedEntity: rest.tei,
            program: rest.program,
            programStage: rest.stage,
            orgUnit: rest.ou,
            dataValues: [
                {
                    dataElement: rest.de,
                    value: value
                },
                ...(rest?.absenceReason != rest?.de ? [{
                    dataElement: rest?.absenceReason,
                    value: undefined
                }] : [])
            ],
            enrollment: rest.enrollment,
            eventDate: format(new Date(rest.date), "yyyy-MM-dd"),
            occurredAt: format(new Date(rest.date), "yyyy-MM-dd")
        })
    }
}