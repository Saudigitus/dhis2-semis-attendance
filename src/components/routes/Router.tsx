import React from 'react';
import { Routes, Route, HashRouter } from 'react-router-dom';
import { FullLayout } from '../../layout';
import { Attendance } from '../../pages';

export default function Router() {
    console.log("Router")
    return (
        <HashRouter>
            <Routes>
                <Route path='/' element={<FullLayout />}>
                    <Route key={'attendance'} path={'/'} element={<Attendance />} />
                </Route>
            </Routes>
        </HashRouter>
    );
}
