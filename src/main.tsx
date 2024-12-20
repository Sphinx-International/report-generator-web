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
import WorkorderByUser from "./pages/WorkordersByUser.tsx";
import Sites from "./pages/Sites.tsx";
import LosCommands from "./pages/LosCommands.tsx";
import UsersPerformance from "./pages/usersPerformance.tsx";
import ProtectedRoute from "./routes middlewares/ProtectedRoute.tsx";
import RedirectBasedOnRole from "./routes middlewares/RedirectBasedOnRole.tsx";
import Page404 from "./pages/Page404.tsx";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import GlobalBeforeUnload from "./routes middlewares/GlobalBeforeUnload.tsx";
import { SnackbarProvider } from "notistack";

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
    element: <ProtectedRoute element={<UserManagment />} allowedRoles={[0]} />,
  },
  {
    path: "/my-account",
    element: <ProtectedRoute element={<Account />} allowedRoles={[0, 1, 2]} />,
  },
  {
    path: "/edit-user/:id",
    element: <ProtectedRoute element={<EditUsers />} allowedRoles={[0]} />,
  },
  {
    path: "/dashboard",
    element: <ProtectedRoute element={<Dashboard />} allowedRoles={[0]} />,
  },
  {
    path: "/dashboard/overview",
    element: <ProtectedRoute element={<Dashboard />} allowedRoles={[0]} />,
  },
  {
    path: "/dashboard/users-performance",
    element: (
      <ProtectedRoute element={<UsersPerformance />} allowedRoles={[0]} />
    ),
  },
  {
    path: "/workorders",
    element: <ProtectedRoute element={<Missions />} allowedRoles={[0, 1, 2]} />,
  },
  {
    path: "/workorders/:id",
    element: (
      <ProtectedRoute element={<MissionDetails />} allowedRoles={[0, 1, 2]} />
    ),
  },
  {
    path: "/workorders-by-user/:userInfo",
    element: (
      <ProtectedRoute element={<WorkorderByUser />} allowedRoles={[0, 1, 2]} />
    ),
  },
  {
    path: "/mails",
    element: <ProtectedRoute element={<Groups />} allowedRoles={[0, 1]} />,
  },
  {
    path: "/mails/groups",
    element: <ProtectedRoute element={<Groups />} allowedRoles={[0, 1]} />,
  },
  {
    path: "/mails/individuals",
    element: <ProtectedRoute element={<Individuals />} allowedRoles={[0, 1]} />,
  },

  {
    path: "/los",
    element: <ProtectedRoute element={<LosCommands />} allowedRoles={[0, 1]} />,
  },
  {
    path: "/los/site-management",
    element: <ProtectedRoute element={<Sites />} allowedRoles={[0, 1]} />,
  },
  {
    path: "/los/commands",
    element: <ProtectedRoute element={<LosCommands />} allowedRoles={[0, 1]} />,
  },

  {
    path: "*",
    element: <Page404 />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <React.StrictMode>
      <GlobalBeforeUnload>
        <SnackbarProvider maxSnack={3}>
          {" "}
          {/* Wrap your app with SnackbarProvider */}
          <RouterProvider router={router} />
        </SnackbarProvider>
      </GlobalBeforeUnload>
    </React.StrictMode>
  </Provider>
);
