import React, { useState } from 'react';
import Header from './Dashboard/Header';
import SideNavbar from './Dashboard/SideNavbar';
import SideNavbarMobile from './Dashboard/SideNavbarMobile'; // ✅ import mobile drawer

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false); // ✅ control drawer

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile sidebar */}
      <SideNavbarMobile open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Desktop sidebar */}
      <div className="hidden md:fixed md:w-64 md:block h-screen z-50 bg-white">
        <SideNavbar />
      </div>

      <div className="flex flex-col flex-1 w-0 md:ml-64 h-full overflow-auto">
        <Header setSidebarOpen={setSidebarOpen} />
        <main className="p-4 flex-1">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
