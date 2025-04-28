import { format } from "date-fns";

export function eventBody(rest: any, value: any) {

    return {
        ...(rest.event ? { event: rest.event } : {}),
        trackedEntityInstance: rest.tei,
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
    }
}