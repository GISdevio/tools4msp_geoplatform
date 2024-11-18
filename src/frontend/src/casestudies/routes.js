import React from 'react'
import {
    BrowserRouter,
    Route,
    Routes,
} from "react-router-dom";

import ListCasestudies from "./modules/ListCasestudies";
import CasestudyPage from './modules/Casestudy';
import CasestudyLayers from './modules/Casestudy/Layers';
import CasestudyInputs from './modules/Casestudy/Inputs';
import CasestudyRuns from './modules/Casestudy/Runs';
import CasestudyRun from './modules/Casestudy/Run';
import CasestudyInput from './modules/Casestudy/Input';
import CreateCasestudy from './modules/CreateCasestudy';

export default function AppRoutes() {
    return (
        <BrowserRouter path="casestudies">
            <Routes>
                <Route path="/casestudies/" element={<ListCasestudies />} />
                <Route path="/casestudies/create/" element={<CreateCasestudy />} />
                <Route path="/casestudies/:id/" element={<CasestudyPage />}>
                    <Route index element={<CasestudyLayers />} />
                    <Route path="/casestudies/:id/inputs/" element={<CasestudyInputs />}>
                        <Route path="/casestudies/:id/inputs/:inputId" element={<CasestudyInput />} />
                    </Route>
                    <Route path="/casestudies/:id/runs/:runId" element={<CasestudyRun />} />
                    <Route path="/casestudies/:id/runs/" element={<CasestudyRuns />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}
