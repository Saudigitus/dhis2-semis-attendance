import React from 'react'
import { Router } from '../components/routes'
import { HashRouter } from 'react-router-dom'
import { AppWrapper } from 'dhis2-semis-components'

const App = () => {

    return (
        // <AppWrapper baseUrl='http://localhost:8080' dataStoreKey='dataStore/semis/values' >
        //     <HashRouter>
        <Router />
        //     </HashRouter>
        // </AppWrapper>
    )
}

export default App