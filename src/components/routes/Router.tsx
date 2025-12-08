import React from 'react';
import { Attendance } from '../../pages';
import { Routes, Route } from 'react-router-dom';
import WithHeaderBarLayout from '../../layout/WithHeaderBarLayout';
import { D2I18n } from 'dhis2-semis-types';

export default function Router({ i18n }: { i18n: D2I18n }) {
    console.log(i18n,'b;aaaaaaa')
    return (
        <Routes>
            <Route path='/'
                element={<WithHeaderBarLayout />}
            >
                <Route key={'attendance'} path={'/'} element={<Attendance i18n={i18n} />} />
            </Route>
        </Routes>
    );
}