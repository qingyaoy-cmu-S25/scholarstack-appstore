import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import StudentStore from "./pages/student/Store.jsx";
import StudentAppDetail from "./pages/student/AppDetail.jsx";
import StudentMyApps from "./pages/student/MyApps.jsx";
import StudentChat from "./pages/student/Chat.jsx";
import VoiceTest from "./pages/student/VoiceTest.jsx";
import DeveloperDashboard from "./pages/developer/Dashboard.jsx";
import DeveloperSubmit from "./pages/developer/Submit.jsx";
import DeveloperApps from "./pages/developer/MyApps.jsx";
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import AdminReview from "./pages/admin/Review.jsx";
import AdminReviewDetail from "./pages/admin/ReviewDetail.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route path="/student" element={<Navigate to="/student/store" replace />} />
      <Route path="/student/store" element={<StudentStore />} />
      <Route path="/student/store/:appId" element={<StudentAppDetail />} />
      <Route path="/student/apps" element={<StudentMyApps />} />
      <Route path="/student/apps/:appId/chat" element={<StudentChat />} />
      <Route path="/voice-test" element={<VoiceTest />} />

      <Route path="/developer" element={<Navigate to="/developer/dashboard" replace />} />
      <Route path="/developer/dashboard" element={<DeveloperDashboard />} />
      <Route path="/developer/submit" element={<DeveloperSubmit />} />
      <Route path="/developer/apps" element={<DeveloperApps />} />

      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/review" element={<AdminReview />} />
      <Route path="/admin/review/:appId" element={<AdminReviewDetail />} />
    </Routes>
  );
}
