import { useDataMutation } from "@dhis2/app-runtime";

const postEvent: any = {
    resource: 'tracker',
    type: 'create',
    data: ({ form }: any) => form,
    params: ({ params }: any) => params
}

const useUploadEvents = () => {
    const params = {
        async: false,
        atomicMode: "OBJECT",
        reportMode: "FULL"
    }

    const [mutate,] = useDataMutation(postEvent, {
        onComplete(data) {
            return data
        },
        onError(error) {
            return error
        },
    })

    async function saveValues(data: any) {
        return await mutate({ form: { events: data }, params: { ...params, importStrategy: "CREATE_AND_UPDATE" } })
    }

    return { saveValues }
}

export default useUploadEvents
