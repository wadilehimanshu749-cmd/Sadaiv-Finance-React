import { useEffect } from "react";
import { Route, Routes, useLocation, Navigate } from "react-router-dom";
import Header from "./components/Header";
import TabBar from "./components/TabBar";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  const { pathname, search, hash } = useLocation();

  if (pathname !== pathname.toLowerCase()) {
    return <Navigate to={pathname.toLowerCase() + search + hash} replace />;
  }

  const isDashboard = pathname.startsWith("/dashboard");

  return (
    <>
      <ScrollToTop />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {isDashboard && <TabBar />}
    </>
  );
}
