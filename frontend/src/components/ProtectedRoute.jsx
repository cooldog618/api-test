import { Navigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function ProtectedRoute({ children }) {
  const { initialized, isAuthenticated } = useAuthStore();

  if (!initialized) {
    return <div style={{ padding: "40px" }}>로딩중...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}