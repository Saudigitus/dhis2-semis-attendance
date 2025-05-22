import React from 'react'
import { Router } from '../components/routes'
import { AppWrapper } from 'dhis2-semis-components'
import { HashRouter } from 'react-router-dom'

const App = () => {
    return (
        <AppWrapper dataStoreKey='dataStore/semis/values'>
            <HashRouter>
                <Router />
            </HashRouter>
        </AppWrapper>
    )
}

export default App