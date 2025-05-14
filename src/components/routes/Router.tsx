import React from 'react';
import { Attendance } from '../../pages';
import { Routes, Route, HashRouter } from 'react-router-dom';
import WithHeaderBarLayout from '../../layout/WithHeaderBarLayout';

export default function Router() {

    return (
        <HashRouter>
            <Routes>
                <Route path='/'
                    element={<WithHeaderBarLayout />}
                >
                    <Route key={'attendance'} path={'/'} element={<Attendance />} />
                </Route>
            </Routes>
        </HashRouter>
    );
}