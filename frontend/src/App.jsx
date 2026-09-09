import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import Layout from "./components/layout/Layout";

import HomeStudent from "./components/pages/student_screens/HomeStudent";
import AllCourses from "./components/pages/student_screens/AllCourses";
import CourseDetail from "./components/pages/student_screens/CourseDetail";
import OrderHistory from "./components/pages/student_screens/OrderHistory";
import OrderDetail from "./components/pages/student_screens/OrderDetail";
import PaymentSuccess from "./components/pages/student_screens/PaymentSuccess";
import PaymentFailed from "./components/pages/student_screens/PaymentFailed";

import CourseTeacher from "./components/pages/teacher_screens/CourseTeacher";
import TeacherProfile from "./components/pages/teacher_screens/TeacherProfile";
import TeacherCourseDetail from "./components/pages/teacher_screens/TeacherCourseDetail";
import ProductManagement from "./components/pages/teacher_screens/ProductManagement";

import AIStudent from "./components/pages/student_screens/AIStudent";
import AIChat from "./components/AIChat";
import FloatingAIChat from "./components/FloatingAIChat";

function App() {
  return (
    <GoogleOAuthProvider clientId="464192614331-ppagvtr5dl422hr7eb5i3cbq5n9a7f2g">
      <BrowserRouter>
        <Layout>
          <Routes>
            {/* =========================
                WEBSITE / CUSTOMER
            ========================= */}

            <Route path="/" element={<HomeStudent />} />

            <Route path="/products" element={<AllCourses />} />

            <Route path="/all-courses" element={<AllCourses />} />

            <Route path="/products/:id" element={<CourseDetail />} />

            <Route path="/courses/:id" element={<CourseDetail />} />

            {/* =========================
                CUSTOMER ORDERS
            ========================= */}

            <Route path="/orders" element={<OrderHistory />} />

            <Route
              path="/orders/:orderId"
              element={<OrderDetail />}
            />

            {/* =========================
                PAYMENT
            ========================= */}

            <Route
              path="/payment-success"
              element={<PaymentSuccess />}
            />

            <Route
              path="/payment-failed"
              element={<PaymentFailed />}
            />

            {/* =========================
                CUSTOMER SUPPORT
            ========================= */}

            <Route
              path="/ai"
              element={<AIStudent />}
            />

            <Route
              path="/ai-chat"
              element={<AIChat />}
            />

            <Route
              path="/qa"
              element={
                <div className="p-8">
                  Trang hỏi đáp
                </div>
              }
            />

            <Route
              path="/settings"
              element={
                <div className="p-8">
                  Trang cài đặt
                </div>
              }
            />

            {/* =========================
                ADMIN - PRODUCTS
            ========================= */}

            <Route
              path="/admin/products"
              element={<ProductManagement />}
            />

            <Route
              path="/teacher/products"
              element={<ProductManagement />}
            />

            {/* =========================
                ADMIN - ORDERS
            ========================= */}

            <Route
              path="/admin/orders"
              element={<CourseTeacher />}
            />

            <Route
              path="/teacher/courses"
              element={<CourseTeacher />}
            />

            <Route
              path="/admin/orders/:id"
              element={<TeacherCourseDetail />}
            />

            <Route
              path="/teacher/courses/:id"
              element={<TeacherCourseDetail />}
            />

            {/* =========================
                ADMIN - CATEGORIES
            ========================= */}

            <Route
              path="/admin/categories"
              element={
                <div className="p-8">
                  <h1 className="text-2xl font-bold">
                    Quản lý danh mục sản phẩm
                  </h1>
                  <p className="mt-2 text-gray-600">
                    Chức năng quản lý danh mục đang được xây dựng.
                  </p>
                </div>
              }
            />

            <Route
              path="/teacher/categories"
              element={
                <div className="p-8">
                  <h1 className="text-2xl font-bold">
                    Quản lý danh mục sản phẩm
                  </h1>
                  <p className="mt-2 text-gray-600">
                    Chức năng quản lý danh mục đang được xây dựng.
                  </p>
                </div>
              }
            />

            {/* =========================
                ADMIN - CUSTOMERS
            ========================= */}

            <Route
              path="/admin/customers"
              element={
                <div className="p-8">
                  <h1 className="text-2xl font-bold">
                    Quản lý khách hàng
                  </h1>
                  <p className="mt-2 text-gray-600">
                    Chức năng quản lý khách hàng đang được xây dựng.
                  </p>
                </div>
              }
            />

            <Route
              path="/teacher/customers"
              element={
                <div className="p-8">
                  <h1 className="text-2xl font-bold">
                    Quản lý khách hàng
                  </h1>
                  <p className="mt-2 text-gray-600">
                    Chức năng quản lý khách hàng đang được xây dựng.
                  </p>
                </div>
              }
            />

            {/* =========================
                ADMIN - NEWS
            ========================= */}

            <Route
              path="/admin/news"
              element={
                <div className="p-8">
                  <h1 className="text-2xl font-bold">
                    Quản lý tin tức
                  </h1>
                  <p className="mt-2 text-gray-600">
                    Chức năng quản lý tin tức đang được xây dựng.
                  </p>
                </div>
              }
            />

            <Route
              path="/teacher/news"
              element={
                <div className="p-8">
                  <h1 className="text-2xl font-bold">
                    Quản lý tin tức
                  </h1>
                  <p className="mt-2 text-gray-600">
                    Chức năng quản lý tin tức đang được xây dựng.
                  </p>
                </div>
              }
            />

            {/* =========================
                ADMIN - REVIEWS
            ========================= */}

            <Route
              path="/admin/reviews"
              element={
                <div className="p-8">
                  <h1 className="text-2xl font-bold">
                    Quản lý đánh giá
                  </h1>
                  <p className="mt-2 text-gray-600">
                    Chức năng quản lý đánh giá đang được xây dựng.
                  </p>
                </div>
              }
            />

            <Route
              path="/teacher/reviews"
              element={
                <div className="p-8">
                  <h1 className="text-2xl font-bold">
                    Quản lý đánh giá
                  </h1>
                  <p className="mt-2 text-gray-600">
                    Chức năng quản lý đánh giá đang được xây dựng.
                  </p>
                </div>
              }
            />

            {/* =========================
                ADMIN - PROFILE
            ========================= */}

            <Route
              path="/admin/profile"
              element={<TeacherProfile />}
            />

            <Route
              path="/teacher/profile"
              element={<TeacherProfile />}
            />

            {/* =========================
                ADMIN - SETTINGS
            ========================= */}

            <Route
              path="/admin/settings"
              element={
                <div className="p-8">
                  <h1 className="text-2xl font-bold">
                    Cài đặt quản trị
                  </h1>
                  <p className="mt-2 text-gray-600">
                    Chức năng cài đặt đang được xây dựng.
                  </p>
                </div>
              }
            />

            <Route
              path="/teacher/settings"
              element={
                <div className="p-8">
                  <h1 className="text-2xl font-bold">
                    Cài đặt quản trị
                  </h1>
                  <p className="mt-2 text-gray-600">
                    Chức năng cài đặt đang được xây dựng.
                  </p>
                </div>
              }
            />
          </Routes>

          <FloatingAIChat />
        </Layout>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;