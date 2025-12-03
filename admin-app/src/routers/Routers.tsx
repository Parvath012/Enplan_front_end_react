import React from "react";
import { createBrowserRouter, Outlet } from "react-router-dom";
import EntitySetupApp from "entitySetupApp/EntitySetupApp";
import UserManagementApp from "userManagementApp/UserManagementApp";
import DataManagementApp from "dataManagementApp/DataManagementApp";
import Users from "../pages/userManagement/Users";
import UsersFromJava from "../pages/userManagement/UsersFromJava";
import LeftSidebar from "../components/LeftSidebar";
import Header from "../components/Header";
import "../styles/layouts.css";

// Base layout with only LeftSidebar
const BaseLayout = () => (
  <div className="app-container">
    <LeftSidebar />
    <div className="content-container">
      <div id = "entity-app-container" className="base-content">
        <Outlet />
      </div>
    </div>
  </div>
);

// Admin layout with Header and LeftSidebar
const AdminLayout = () => (
  <div className="app-container">
    <LeftSidebar />
    <div className="content-container">
      <Header />
      <div id = "entity-app-container" className="admin-content">
        <Outlet />
      </div>
    </div>
  </div>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <BaseLayout />,
    // errorElement: <ErrorPage />,
    children: [
      {
        index: true, // default child route for "/"
        element: <div style={{ padding: '20px' }}>Welcome to EnPlan-2.0</div>,
      },
      {
        path: "help",
        element: <div>Help & Support</div>,
      },
      {
        path:  "data-management/*",
        element: <DataManagementApp /> ,
      },
      {
        path: "masters",
        element: <div>Masters</div>,
      },
      {
        path: "budgeting",
        element: <div>Budgeting</div>,
      },
      {
        path: "inventory",
        element: <div>Inventory / OTB</div>,
      },
      {
        path: "assortment",
        element: <div>Assortment</div>,
      },
      {
        path: "allocation",
        element: <div>Allocation & Replenishment</div>,
      },
      {
        path: "fp-and-a",
        element: <div>FP & A</div>,
      },
      {
        path: "notifications",
        element: <div>Notifications</div>,
      },
      // {
      //   path: "home-app/*",
      //   element: <HomeApp />,
      // },
      // {
      //   path: "budgeting-app/*",
      //   element: <BudgetingApp />,
      // },
      {
        path: "users",
        element: <Users />
      },
      {
        path: "java-users",
        element: <UsersFromJava />
      },
    ],
  },
  // Admin section with header
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <div>Admin Dashboard</div>,
      },
      {
        path: "users",
        element: <Users />
      },
      {
        path: "java-users",
        element: <UsersFromJava />
      },
      {
        path: "entity-setup/*",
        element:<EntitySetupApp /> 
      },
      // Adding header navigation items under admin layout
      {
        path: "template",
        element: <div>Template Page</div>,
      },
      {
        path: "settings",
        element: <div>Settings Page</div>,
      },
      {
        path: "infrastructure",
        element: <div>Infrastructure Page</div>,
      },
      {
        path: "user-management/*",
        element: <UserManagementApp />,
      },
      {
        path: "workflows",
        element: <div>Workflows Page</div>,
      },
      {
        path: "dashboards",
        element: <div>Dashboards Page</div>,
      }
    ]
  }
]);
