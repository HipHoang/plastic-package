import React from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import Layout from "./components/layout/Layout";

import Home from "./components/pages/Home";
import Products from "./components/pages/student_screens/Products";
import ProductDetail from "./components/pages/student_screens/ProductDetail";
import OrderHistory from "./components/pages/student_screens/OrderHistory";
import OrderDetail from "./components/pages/student_screens/OrderDetail";
import PaymentSuccess from "./components/pages/student_screens/PaymentSuccess";
import PaymentFailed from "./components/pages/student_screens/PaymentFailed";

import OrderManagement from "./components/pages/teacher_screens/OrderManagement";
import AdminProfile from "./components/pages/teacher_screens/AdminProfile";
import OrderDetailAdmin from "./components/pages/teacher_screens/OrderDetailAdmin";
import ProductManagement from "./components/pages/teacher_screens/ProductManagement";
import ManagementList from "./components/pages/teacher_screens/ManagementList";

import CustomerAI from "./components/pages/CustomerAI";
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

            <Route path="/" element={<Home />} />

            <Route path="/products" element={<Products />} />

            <Route path="/products/:id" element={<ProductDetail />} />

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
              element={<CustomerAI />}
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
              path="/admin/dashboard"
              element={<Navigate to="/admin/products" replace />}
            />

            <Route
              path="/teacher/dashboard"
              element={<Navigate to="/admin/products" replace />}
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
              element={<OrderManagement />}
            />

            <Route
              path="/admin/orders/:id"
              element={<OrderDetailAdmin />}
            />

            {/* =========================
                ADMIN - CATEGORIES
            ========================= */}

            <Route
              path="/admin/categories"
              element={<ManagementList resource="categories" />}
            />

            <Route
              path="/teacher/categories"
              element={<ManagementList resource="categories" />}
            />

            {/* =========================
                ADMIN - CUSTOMERS
            ========================= */}

            <Route
              path="/admin/customers"
              element={<ManagementList resource="customers" />}
            />

            <Route
              path="/teacher/customers"
              element={<ManagementList resource="customers" />}
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
              element={<AdminProfile />}
            />

            <Route
              path="/teacher/profile"
              element={<AdminProfile />}
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