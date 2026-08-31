import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import heroImg from "./assets/hero.png";
import { getCurrentUserProfile } from "./services/authService";
import "./index.css";
import Login from "./pages/Login";
import ConfigureSchool from "./pages/ConfigureSchool";
import AdminDashboard from "./pages/AdminDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import { Loader } from "lucide-react";
import { Route, Routes, Navigate } from "react-router-dom";
import { useAuth } from "./context/authContext.jsx";
import AdminDashboardHome from "./pages/admin-pages/AdminDashboardHome.jsx";
import Teachers from "./pages/admin-pages/Teachers.jsx";
import Learners from "./pages/admin-pages/Learners.jsx";
import Classes from "./pages/admin-pages/Classes.jsx";
import Subjects from "./pages/admin-pages/Subjects.jsx";
import Attendance from "./pages/admin-pages/Attendance.jsx";
import Settings from "./pages/admin-pages/Settings.jsx";
import TeacherDashboardHome from "./pages/teacher-pages/TeacherDashboardHome.jsx";
import MyClass from "./pages/teacher-pages/MyClass.jsx";
import MyLearners from "./pages/teacher-pages/MyLearners.jsx";
import TakeAttendance from "./pages/teacher-pages/TakeAttendance.jsx";
import MyAttendance from "./pages/teacher-pages/MyAttendance.jsx";

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
  const { user, role, loading } = useAuth();

  if (loading) {
    return <LoadingPage />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (role === "teacher") {
    return <Navigate to="/teacher/dashboard" replace />;
  }

  return <p>Your account does not have a valid role</p>;
};

const ProtectedRoutes = ({ allowedRoles, children }) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <LoadingPage />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      {/* landing page */}
      <Route path="/" element={<HomeRedirect />} />
      {/* login page- if user not logged in */}
      <Route path="/login" element={<Login />} />
      {/* create account + configure school */}
      <Route path="/configure-school" element={<ConfigureSchool />} />
      {/* protected routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoutes allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoutes>
        }
      >
        {/* all the child routes for admin dashboard */}
        <Route index element={<AdminDashboardHome />} />
        <Route path="teachers" element={<Teachers />} />
        <Route path="learners" element={<Learners />} />
        <Route path="classes" element={<Classes />} />
        <Route path="subjects" element={<Subjects />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route
        path="/teacher/dashboard"
        element={
          <ProtectedRoutes allowedRoles={["teacher"]}>
            <TeacherDashboard />
          </ProtectedRoutes>
        }
      >
        {/* all the child routes for teacher dashboard */}
        <Route index element={<TeacherDashboardHome />} />
        <Route path="my-class" element={<MyClass />} />
        <Route path="my-learners" element={<MyLearners />} />
        <Route path="take-attendance" element={<TakeAttendance />} />
        <Route path="my-attendance" element={<MyAttendance />} />
      </Route>
      {/* redirect user from unknown route to the home page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
export default App;
