import { createBrowserRouter } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "./ProtectedRoute";

import Home from "../pages/Home";
import About from "../pages/About";
import ForOrganizer from "../pages/ForOrganizer";
import Conference from "../pages/Conference";
import ConferenceDetail from "../pages/ConferenceDetail";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import Register from "../pages/Register";
import NotFound from "../pages/NotFound";
import CreateConference from "../pages/CreateConference";


export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "about",
        element: <About />,
      },
      {
        path: "for-organizer",
        element: <ForOrganizer />,
      },
      {
        path: "conferences",
        element: <Conference />,
      },
      {
        path: "conferences/:id",
        element: <ConferenceDetail />,
      },
      {
        element: <ProtectedRoute allowedRoles={["ORGANIZER"]} />,
        children: [
          {
            path: "dashboard",
            element: <Dashboard />,
          },
          {
            path: "create-conference",
            element: <CreateConference />,
          },
        ],
      },
    ],
  },

  {
    path: "/login",
    element: <Login />,
  },

  {
    path: "/register",
    element: <Register />,
  },

  {
    path: "*",
    element: <NotFound />,
  },
]);