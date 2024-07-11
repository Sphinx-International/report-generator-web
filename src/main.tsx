import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./Redux/store.ts"; 
import Auth from "./pages/Auth.tsx";
import UserManagment from "./pages/UserManagment.tsx";
import SitesManagment from "./pages/SitesManagment.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Missions from "./pages/Missions.tsx";
import MissionDetails from "./pages/MissionDetails.tsx";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
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
  {
    path: "/missions/1",
    element: <MissionDetails />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <React.StrictMode>
      <RouterProvider router={router} />{" "}
    </React.StrictMode>
  </Provider>
);
