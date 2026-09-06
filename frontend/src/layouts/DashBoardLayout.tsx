import { Outlet } from "react-router-dom";

function DashboardLayout() {
  return (
    <div className="dashboard-layout">
      <Outlet />
    </div>
  );
}

export default DashboardLayout;