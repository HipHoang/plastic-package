import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout";
import CourseStudent from "./components/pages/student_screens/CourseStudent";
import HomeStudent from "./components/pages/student_screens/HomeStudent";
import CourseDetail from "./components/pages/student_screens/CourseDetail";
import LearningPage from "./components/pages/student_screens/LearningPage";
import AllCourses from "./components/pages/student_screens/AllCourses";
import PaymentSuccess from "./components/pages/student_screens/PaymentSuccess";
import PaymentFailed from "./components/pages/student_screens/PaymentFailed";

import TeacherDashboard from "./components/pages/teacher_screens/TeacherDashboard";
import CourseTeacher from "./components/pages/teacher_screens/CourseTeacher";
import TeacherProfile from "./components/pages/teacher_screens/TeacherProfile";
import TeacherCourseDetail from "./components/pages/teacher_screens/TeacherCourseDetail";
import AIChat from "./components/AIChat";
import PathwayStudent from "./components/pages/student_screens/PathwayStudent";
import AIStudent from "./components/pages/student_screens/AIStudent";
import FloatingAIChat from "./components/FloatingAIChat";

import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
  return (
    // Thay 'YOUR_GOOGLE_CLIENT_ID' bằng ID thật của bạn
    <GoogleOAuthProvider clientId="464192614331-ppagvtr5dl422hr7eb5i3cbq5n9a7f2g">
      <BrowserRouter>
        <Layout>
          <Routes>

            <Route path="/ai-chat" element={<AIChat />} />
            {/* student / public */}
            <Route path="/" element={<HomeStudent />} />
            <Route path="/courses" element={<CourseStudent />} />
            <Route path="/all-courses" element={<AllCourses />} />
            <Route path="/courses/:id" element={<CourseDetail />} />
            <Route path="/qa" element={<div>Trang hỏi đáp</div>} />
            <Route path="/settings" element={<div>Trang cài đặt</div>} />
            <Route path="/ai" element={<AIStudent />} />
            <Route path="/learn/:id" element={<LearningPage />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-failed" element={<PaymentFailed />} />
            <Route path="/pathway" element={<PathwayStudent />} />


{/* teacher */}
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/teacher/courses" element={<CourseTeacher />} />
            <Route path="/teacher/courses/:id" element={<TeacherCourseDetail />} />
            <Route path="/teacher/profile" element={<TeacherProfile />} />
            <Route path="/teacher/qa" element={<div>Trang hỏi đáp giáo viên</div>} />
            <Route path="/teacher/settings" element={<div>Trang cài đặt giáo viên</div>} />
          </Routes>
          <FloatingAIChat />
        </Layout>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;