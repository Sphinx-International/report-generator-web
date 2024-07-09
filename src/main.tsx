import React from "react";
import ReactDOM from "react-dom/client";
import Auth from "./pages/Auth.tsx";
import UserManagment from "./pages/UserManagment.tsx";
import SitesManagment from "./pages/SitesManagment.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Missions from "./pages/Missions.tsx";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Auth />,
  },
  {
    path: "/users",
    element: <UserManagment />,
  },
  {
    path: "/sites",
    element: <SitesManagment />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/missions",
    element: <Missions />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />{" "}
  </React.StrictMode>
);
