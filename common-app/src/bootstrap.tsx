import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ModuleRegistry } from "ag-grid-community";
import {
  AllEnterpriseModule,
  LicenseManager,
  IntegratedChartsModule
} from "ag-grid-enterprise";

import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';
import { BrowserRouter } from "react-router-dom";

ModuleRegistry.registerModules([
  AllEnterpriseModule,
  IntegratedChartsModule.with(AgChartsEnterpriseModule),
]);
LicenseManager.setLicenseKey("[TRIAL]_this_{AG_Charts_and_AG_Grid}_Enterprise_key_{AG-092283}_is_granted_for_evaluation_only___Use_in_production_is_not_permitted___Please_report_misuse_to_legal@ag-grid.com___For_help_with_purchasing_a_production_key_please_contact_info@ag-grid.com___You_are_granted_a_{Single_Application}_Developer_License_for_one_application_only___All_Front-End_JavaScript_developers_working_on_the_application_would_need_to_be_licensed___This_key_will_deactivate_on_{14 September 2025}____[v3]_[0102]_MTc1NzgwNDQwMDAwMA==9e87e5dbbd2e65bc37d2fcdc9f0929cc");


const rootElement = document.getElementById("app");
if (!rootElement) throw new Error("Root element not found");

const root = ReactDOM.createRoot(rootElement);

root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

