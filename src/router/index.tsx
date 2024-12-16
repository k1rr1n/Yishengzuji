import { lazy, Suspense } from "react";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
  // useNavigate,
} from "react-router-dom";
import Layout from "../pages/layout";
// import { useAuth } from "../utils/useAuth";

// 懒加载页面组件
const Login = lazy(() => import("../pages/login"));
const Map = lazy(() => import("../pages/map"));

// guard 路由守卫
const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  // const navigate = useNavigate();
  // const { checkLoginState } = useAuth();

  // useEffect(() => {
  //   checkLoginState();
  //   navigate("/login");
  // }, []);

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
            <Map />
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
