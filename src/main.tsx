import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./Redux/store.ts"; 
import Auth from "./pages/Auth.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import UserManagment from "./pages/UserManagment.tsx";
import SitesManagment from "./pages/SitesManagment.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Missions from "./pages/Missions.tsx";
import MissionDetails from "./pages/MissionDetails.tsx";
import ProtectedRoute from "./routes middlewares/ProtectedRoute.tsx"; 
import RedirectBasedOnRole from "./routes middlewares/RedirectBasedOnRole.tsx";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RedirectBasedOnRole />,
  },
  {
    path: "/login",
    element: <Auth />,
  },
  {
    path: "/reset-pass",
    element: <ResetPassword />,
  },
  {
    path: "/users",
    element: <ProtectedRoute element={<UserManagment />} allowedRoles={[0]}/>,
  },
  {
    path: "/sites",
    element: <ProtectedRoute element={<SitesManagment />} allowedRoles={[0, 1, 2]}/>,
  },
  {
    path: "/dashboard",
    element: <ProtectedRoute element={<Dashboard />} allowedRoles={[0]}/>,
  },
  {
    path: "/missions",
    element: <ProtectedRoute element={<Missions />} allowedRoles={[0, 1, 2]}/>,
  },
  {
    path: "/missions/:id",
    element: <ProtectedRoute element={<MissionDetails />} allowedRoles={[0, 1, 2]}/>,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  </Provider>
);
