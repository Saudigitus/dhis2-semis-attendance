import React from 'react'
import { Router } from '../components/routes'
// import { HashRouter } from 'react-router-dom'
// import { AppWrapper } from 'dhis2-semis-components'
import { useConfig } from '@dhis2/app-runtime'
import { D2I18n } from 'dhis2-semis-types'
import translation from '../locales/index'

const App = ({ i18n, baseUrl }: { i18n: D2I18n; baseUrl?: string }) => {
    const { baseUrl: localBaseUrl } = useConfig()
    const language = i18n == undefined ? translation : i18n
    const useBaseUrl = baseUrl || localBaseUrl

    return (
        <Router i18n={language} baseUrl={useBaseUrl} />
    )
}

export default App
