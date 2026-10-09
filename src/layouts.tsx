import { Outlet } from "react-router-dom";
import Header from "./components/Header";
import TabBar from "./components/TabBar";

// for public pages (non logged-in user)

export function PublicLayout() {
  return (
    <>
      <Header variant="public" />
      <Outlet />
    </>
  );
}

// for logged-in user other sites

export function AuthLayout() {
  return <Outlet />;
}

// for Logged-in user
export function AppLayout() {
  return (
    <>
      <Header variant="app" />
      <Outlet />
      <TabBar />
    </>
  );
}
