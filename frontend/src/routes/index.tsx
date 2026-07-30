import { createBrowserRouter } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import Home from "../pages/Home";
import Conference from "../pages/Conference";
import ConferenceDetail from "../pages/ConferenceDetail";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import Register from "../pages/Register";
import NotFound from "../pages/NotFound";

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
        path: "conferences",
        element: <Conference />,
      },
      {
        path: "conferences/:id",
        element: <ConferenceDetail />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
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