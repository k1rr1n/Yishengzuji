import { Outlet } from "react-router-dom";
import logo from "../assets/pathway.png";

export default function Layout() {
  return (
    // 主容器 flex布局 最小高度为屏幕高度
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-200 to-indigo-200 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      {/* header */}
      <header className="top-0 z-50 bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          {/* logo */}
          <div className="flex items-center">
            <img src={logo} alt="Logo" className="h-8 w-auto mr-2" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Through Life
            </span>
          </div>
        </div>
      </header>

      {/* main */}
      <main className="flex-1 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </div>
      </main>

      {/* footer */}
      <footer className="bg-white dark:bg-gray-800 shadow-sm mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            © 2024 Through Life. Created by Yiyang Zhang.
          </div>
        </div>
      </footer>
    </div>
  );
}
