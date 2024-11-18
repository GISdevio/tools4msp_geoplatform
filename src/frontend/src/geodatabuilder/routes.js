import React from 'react'
import {
    BrowserRouter,
    Route,
    Routes,
} from "react-router-dom";

import ListGeodatabuilder from "./modules/ListGeodatabuilder";
import GeodatabuilderPage from './modules/Geodatabuilder';
import GeodatabuilderDetail from './modules/Geodatabuilder/Detail';
import CreateGeodatabuilder from './modules/CreateGeodatabuilder';
import GeodatabuilderEdit from './modules/Geodatabuilder/Edit';
import GeodatabuilderEditExpression from './modules/Geodatabuilder/EditExpression';


export default function AppRoutes() {
    return (
        <BrowserRouter path="geodatabuilders">
            <Routes>
                <Route path="/geodatabuilders/" element={<ListGeodatabuilder />} />
                <Route path="/geodatabuilders/create/" element={<CreateGeodatabuilder />} />
                <Route path="/geodatabuilders/:id/" element={<GeodatabuilderPage />}>
                    <Route index element={<GeodatabuilderDetail />} />
                    <Route path="/geodatabuilders/:id/edit/" element={<GeodatabuilderEdit />}/>
                    <Route path="/geodatabuilders/:id/edit-expression/" element={<GeodatabuilderEditExpression />}/>
                </Route>
            </Routes>
        </BrowserRouter>
    )
}
