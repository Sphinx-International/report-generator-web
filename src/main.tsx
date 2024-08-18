import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./Redux/store.ts"; 
import Auth from "./pages/Auth.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import UserManagment from "./pages/UserManagment.tsx";
import Account from "./pages/Account.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Missions from "./pages/Missions.tsx";
import MissionDetails from "./pages/MissionDetails.tsx";
import EditUsers from "./pages/EditUsers.tsx";
import Groups from "./pages/Groups.tsx";
import Individuals from "./pages/Individuals.tsx";
import ProtectedRoute from "./routes middlewares/ProtectedRoute.tsx"; 
import RedirectBasedOnRole from "./routes middlewares/RedirectBasedOnRole.tsx";
import Page404 from "./pages/Page404.tsx";
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
    path: "/my-account",
    element: <ProtectedRoute element={<Account />} allowedRoles={[0, 1, 2]}/>,
  },
  {
    path: "/edit-user/:id",
    element: <ProtectedRoute element={<EditUsers />} allowedRoles={[0]}/>,
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

  {
    path: "/mails",
    element: <ProtectedRoute element={<Groups />} allowedRoles={[0]}/>,
  },

  {
    path: "/mails/groups",
    element: <ProtectedRoute element={<Groups />} allowedRoles={[0]}/>,
  },
  {
    path: "/mails/individuals",
    element: <ProtectedRoute element={<Individuals />} allowedRoles={[0]}/>,
  },
  {
    path: "*",
    element: <Page404 />,
  },

]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  </Provider>
);
