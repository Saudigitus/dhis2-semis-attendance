import React from 'react'
import { Router } from '../components/routes'
import { HashRouter } from 'react-router-dom'
import { AppWrapper } from 'dhis2-semis-components'
import { useConfig } from '@dhis2/app-runtime'

const App = () => {
    const { baseUrl } = useConfig()

    return (
        // <AppWrapper
        //     baseUrl={baseUrl}
        //     dataStoreKey="dataStore/semis/values"
        //     schoolCalendarKey='dataStore/semis/schoolCalendar'
        // >
        //     <HashRouter>
                <Router />
        //     </HashRouter >
        // </AppWrapper>
    )
}

export default App