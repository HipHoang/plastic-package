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
import Products from "./components/pages/customer_screens/Products";
import ProductDetail from "./components/pages/customer_screens/ProductDetail";
import OrderHistory from "./components/pages/customer_screens/OrderHistory";
import OrderDetail from "./components/pages/customer_screens/OrderDetail";
import PaymentSuccess from "./components/pages/customer_screens/PaymentSuccess";
import PaymentFailed from "./components/pages/customer_screens/PaymentFailed";

import OrderManagement from "./components/pages/admin_screens/OrderManagement";
import AdminDashboard from "./components/pages/admin_screens/AdminDashboard";
import { useAuth } from "./context/AuthProvider";
import { getStoredAuth, isAdminRole, isStaffRole } from "./untils/auth";

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const storedUser = getStoredAuth()?.user;

  if (loading) {
    return <div className="p-8 text-slate-500">Đang xác thực quyền truy cập...</div>;
  }

  const currentUser = user || storedUser;
  const isAdmin = isAdminRole(currentUser?.role) || isStaffRole(currentUser?.role);

  return isAdmin ? children : <Navigate to="/" replace />;
};
import AdminProfile from "./components/pages/admin_screens/AdminProfile";
import OrderDetailAdmin from "./components/pages/admin_screens/OrderDetailAdmin";
import ProductManagement from "./components/pages/admin_screens/ProductManagement";
import ManagementList from "./components/pages/admin_screens/ManagementList";
import AdminNews from "./components/pages/admin_screens/AdminNews";
import AdminReviews from "./components/pages/admin_screens/AdminReviews";

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
              path="/admin/dashboard"
              element={<AdminRoute><AdminDashboard /></AdminRoute>}
            />

            <Route
              path="/admin/products"
              element={<AdminRoute><ProductManagement /></AdminRoute>}
            />

            {/* =========================
                ADMIN - ORDERS
            ========================= */}

            <Route
              path="/admin/orders"
              element={<AdminRoute><OrderManagement /></AdminRoute>}
            />

            <Route
              path="/admin/orders/:id"
              element={<AdminRoute><OrderDetailAdmin /></AdminRoute>}
            />

            {/* =========================
                ADMIN - CATEGORIES
            ========================= */}

            <Route
              path="/admin/categories"
              element={<AdminRoute><ManagementList resource="categories" /></AdminRoute>}
            />

            {/* =========================
                ADMIN - CUSTOMERS
            ========================= */}

            <Route
              path="/admin/customers"
              element={<AdminRoute><ManagementList resource="customers" /></AdminRoute>}
            />

            {/* =========================
                ADMIN - NEWS
            ========================= */}

            <Route
              path="/admin/news"
              element={<AdminRoute><AdminNews /></AdminRoute>}
            />

            {/* =========================
                ADMIN - REVIEWS
            ========================= */}

            <Route
              path="/admin/reviews"
              element={<AdminRoute><AdminReviews /></AdminRoute>}
            />

            {/* =========================
                ADMIN - PROFILE
            ========================= */}

            <Route
              path="/admin/profile"
              element={<AdminRoute><AdminProfile /></AdminRoute>}
            />

            {/* =========================
                ADMIN - SETTINGS
            ========================= */}

            <Route
              path="/admin/settings"
              element={<AdminRoute><div className="p-8">
                <h1 className="text-2xl font-bold">Cài đặt quản trị</h1>
                <p className="mt-2 text-gray-600">Chức năng cài đặt đang được xây dựng.</p>
              </div></AdminRoute>}
            />
          </Routes>

          <FloatingAIChat />
        </Layout>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
