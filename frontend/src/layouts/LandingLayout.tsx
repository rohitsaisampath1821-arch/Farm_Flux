import { Outlet } from "react-router-dom";

function LandingLayout() {
  return (
    <div className="landing-layout">
      <Outlet />
    </div>
  );
}

export default LandingLayout;