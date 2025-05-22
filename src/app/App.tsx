import React from 'react'
import { Router } from '../components/routes'
import { HashRouter } from 'react-router-dom'
import { useConfig } from '@dhis2/app-runtime'
import { AppWrapper } from 'dhis2-semis-components'

const App = () => {
    const { baseUrl } = useConfig()

    return (
        <AppWrapper
            baseUrl={baseUrl}
            dataStoreKey='dataStore/semis/values'
        >
            <HashRouter>
                <Router />
            </HashRouter>
        </AppWrapper>
    )
}

export default App