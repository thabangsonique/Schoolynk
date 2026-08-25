import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import heroImg from "./assets/hero.png";
import { getCurrentUserProfile } from "./services/authService";
import "./index.css";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import { Loader } from "lucide-react";
import { Route, Routes } from "react-router-dom";

//loading ui.
const LoadingPage = () => {
  return (
    <div className="min-h-screen flex justify-center items-center bg-background">
      <Loader size={32} />
      <p className="text-primary">Loading SchooLynk...</p>
    </div>
  );
};

const HomeRedirect = () => {
  //grab user login and profile from authContext provider,
};

function App() {
  return (
    <Routes>
      {/* landing page */}
      <Route path="/" element={<HomeRedirect />} />

      {/* login page- if user not logged in */}
      <Route path="/login" element={<LoginPage />} />

      {/* protected routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoutes={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teacher/dashboard"
        element={
          <ProtectedRoute allowedRoutes={["teacher"]}>
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
export default App;
