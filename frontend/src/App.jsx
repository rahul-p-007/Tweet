import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUp/SignUpPage";
import Sidebar from "./components/sidebar/Sidebar";
import RightPanel from "./components/rightpanel/RightPanel";
import NotificationPage from "./pages/notification/NotificationPage";
import ProfilePage from "./pages/profile/ProfilePage";
import { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "./components/common/LoadingSpinner";
import { fetchAuthUser } from "./components/sidebar/service";

function App() {
  const { data: authuser, isLoading } = useQuery({
    queryKey: ["authuser"],
    // Now, both App.jsx and Sidebar.jsx use the same, robust fetchAuthUser function
    queryFn: fetchAuthUser,
    retry: false, // Do not retry on failure, as it's likely an unauthenticated state
  });

  // Log the authuser state to help debug in the console
  console.log("Current authuser state in App.jsx:", authuser);

  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex max-w-6xl mx-auto">
      {/* Sidebar is only rendered if authuser exists */}
      {authuser && <Sidebar />}
      <Routes>
        {/* Protected routes: redirect to login if authuser is null */}
        <Route
          path="/"
          element={authuser ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/notifications"
          element={authuser ? <NotificationPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile/:username"
          element={authuser ? <ProfilePage /> : <Navigate to="/login" />}
        />

        {/* Public routes: redirect to home if authuser exists (already logged in) */}
        <Route
          path="/signup"
          element={!authuser ? <SignUpPage /> : <Navigate to="/" />}
        />
        <Route
          path="/login"
          element={!authuser ? <LoginPage /> : <Navigate to="/" />}
        />
      </Routes>
      {/* RightPanel is only rendered if authuser exists */}
      {authuser && <RightPanel />}
      <Toaster />
    </div>
  );
}

export default App;
