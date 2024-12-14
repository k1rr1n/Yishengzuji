import { Outlet } from "react-router-dom";
import logo from "../assets/pathway.png";

export default function Layout() {
  return (
    // 主容器 flex布局 最小高度为屏幕高度
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-200 to-indigo-200 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      {/* header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm transition-colors duration-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          {/* logo */}
          <div className="flex items-center">
            <img src={logo} alt="Logo" className="h-8 w-auto mr-2" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Through Life <span className="tracking-wide">一生足迹</span>
            </span>
          </div>
        </div>
      </header>

      {/* main */}
      <main className="flex w-full items-center justify-center">
        <Outlet />
      </main>

      {/* footer */}
      <footer className="bg-white dark:bg-gray-800 shadow-sm mt-auto flex w-full items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            © 2024 Through Life. Created by Yiyang Zhang.
          </div>
        </div>
      </footer>
    </div>
  );
}
