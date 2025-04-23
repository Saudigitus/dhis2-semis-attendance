import React from 'react'
import { AppWrapper } from 'dhis2-semis-components'
import { Router } from '../components/routes'

const App = () => {
    return (
        <AppWrapper dataStoreKey='semis/values'>
            <Router/>
        </AppWrapper>
    )
}

export default App