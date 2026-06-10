import { createBrowserRouter } from "react-router";
import Layout    from "./components/Layout";
import Login     from "./pages/Login";
import Signup    from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Analysis  from "./pages/Analysis";
import Players   from "./pages/Players";
import Matches   from "./pages/Matches";
import Stats     from "./pages/Stats";
import Settings  from "./pages/Settings";

export const router = createBrowserRouter([
  { path: "/login",  Component: Login  },
  { path: "/signup", Component: Signup },
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true,      Component: Dashboard },
      { path: "analysis", Component: Analysis  },
      { path: "players",  Component: Players   },
      { path: "matches",  Component: Matches   },
      { path: "stats",    Component: Stats     },
      { path: "settings", Component: Settings  },
    ],
  },
]);
