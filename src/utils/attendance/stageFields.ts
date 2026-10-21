// Class values of the list (academic year and the filter fields of the section, e.g. grade and class
// for students, type of staff and employment type for staff) are saved with an attendance record only
// when the attendance program stage has that field, in both modes (with or without attendance status).
// The same rule is used to search the attendance records of the class.

// Ids of the data elements of the attendance program stage.
export function attendanceStageFields(program: any, attendanceStage?: string): Set<string> {
    const stage = (program?.programStages ?? []).find((x: any) => x?.id === attendanceStage)
    return new Set((stage?.programStageDataElements ?? []).map((x: any) => x?.dataElement?.id).filter(Boolean))
}

// Values ({ dataElement, value }) of fields that the attendance stage has.
export function onlyStageValues(dataValues: any[] = [], fields: Set<string>): any[] {
    return dataValues.filter((x: any) => x?.dataElement && fields.has(x.dataElement))
}

// Search filters ("field:in:value", alone or in a list) on fields that the attendance stage has.
export function onlyStageFilters(filters: any[] = [], fields: Set<string>): any[] {
    return filters.filter((filter: any) => fields.has(String(Array.isArray(filter) ? filter[0] : filter).split(":")[0]))
}
