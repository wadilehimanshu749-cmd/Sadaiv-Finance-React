import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AppLayout, AuthLayout, PublicLayout } from "./layouts";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Loan from "./pages/components/Loan";
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

  return (
    <>
      <ScrollToTop />

      <Routes>
        {/* Public site public header */}

        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />

          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Login / Sign up no site header */}
        
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>

        {/* Logged-in app app header + tab bar. */}
        
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/loan" element={<Loan />} />
        </Route>
      </Routes>
    </>
  );
}
