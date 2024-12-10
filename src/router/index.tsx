import { lazy, Suspense } from "react";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import Layout from "../pages/layout";

// 懒加载页面组件
const App = lazy(() => import("../App"));
const Login = lazy(() => import("../pages/login"));

// guard 路由守卫
const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  // const {isAuthenticated} = useAuth();
  // if(!isAuthenticated) return <Navigate to="/login" replace />
  return children;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "",
        element: <Navigate to="/login" replace />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "home",
        element: (
          <RequireAuth>
            <App />
          </RequireAuth>
        ),
      },
    ],
  },
]);

export const AppRouter = () => (
  <Suspense fallback={<div>loading...</div>}>
    <RouterProvider router={router} />
  </Suspense>
);
