import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiMessageSquare,
  FiStar,
  FiPackage,
  FiRefreshCw,
  FiSearch,
  FiUser,
  FiCalendar,
} from "react-icons/fi";
import adminService from "../../../services/adminService";
import {
  LoadingState,
  ErrorBanner,
  EmptyState,
} from "./AdminListStates";

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("vi-VN");
}

function getReviewId(review) {
  return review?.review_id ?? review?.id ?? "-";
}

function getRating(review) {
  const rating = Number(review?.rating);

  return Number.isFinite(rating) ? rating : 0;
}

function getProductName(review) {
  return (
    review?.product_name ||
    review?.product?.name ||
    "Không xác định"
  );
}

function getCustomerName(review) {
  return (
    review?.customer_name ||
    review?.user_name ||
    review?.user?.name ||
    "Khách hàng"
  );
}

function getCustomerEmail(review) {
  return review?.customer_email || review?.user?.email || "";
}

function getComment(review) {
  const raw = String(review?.comment || "").replace(/\s+/g, " ").trim();

  return raw || "Khách hàng không để lại nội dung.";
}

function RatingStars({ value }) {
  return (
    <span className="inline-flex items-center gap-0.5" title={`${value}/5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <FiStar
          key={star}
          size={15}
          className={
            star <= value
              ? "fill-amber-400 text-amber-400"
              : "text-slate-300"
          }
        />
      ))}
    </span>
  );
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [error, setError] = useState("");

  const loadReviews = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await adminService.getAdminReviews();

      const data = Array.isArray(response)
        ? response
        : response?.data || response?.reviews || [];

      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("getAdminReviews ERROR:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Không thể tải danh sách đánh giá"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const filteredReviews = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return reviews.filter((review) => {
      const matchesRating =
        ratingFilter === "all" ||
        getRating(review) === Number(ratingFilter);

      if (!matchesRating) return false;

      if (!keyword) return true;

      return [
        String(getReviewId(review)),
        getProductName(review),
        getCustomerName(review),
        getCustomerEmail(review),
        getComment(review),
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    });
  }, [reviews, search, ratingFilter]);

  const averageRating = reviews.length
    ? (
        reviews.reduce(
          (sum, review) => sum + getRating(review),
          0
        ) / reviews.length
      ).toFixed(1)
    : "0.0";

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Quản lý đánh giá
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Đánh giá sản phẩm của khách hàng
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadReviews(true)}
            disabled={refreshing}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            <FiRefreshCw
              className={refreshing ? "animate-spin" : ""}
              size={17}
            />
            Làm mới
          </button>
        </div>

        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-3 text-blue-600">
                <FiMessageSquare size={22} />
              </div>

              <div>
                <p className="text-sm text-gray-500">Tổng đánh giá</p>
                <p className="text-2xl font-bold text-gray-800">
                  {reviews.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-100 p-3 text-amber-600">
                <FiStar size={22} />
              </div>

              <div>
                <p className="text-sm text-gray-500">Điểm trung bình</p>
                <p className="text-2xl font-bold text-gray-800">
                  {averageRating} / 5
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-5 rounded-xl bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <FiSearch
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm theo sản phẩm, khách hàng, nội dung..."
                className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <select
              value={ratingFilter}
              onChange={(event) => setRatingFilter(event.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 md:w-56"
            >
              <option value="all">Tất cả số sao</option>
              <option value="5">5 sao</option>
              <option value="4">4 sao</option>
              <option value="3">3 sao</option>
              <option value="2">2 sao</option>
              <option value="1">1 sao</option>
            </select>
          </div>
        </div>

        <ErrorBanner
          message={error}
          onRetry={() => loadReviews(true)}
        />

        {loading ? (
          <LoadingState message="Đang tải danh sách đánh giá..." />
        ) : filteredReviews.length === 0 ? (
          <EmptyState
            title="Không có đánh giá"
            description={
              search || ratingFilter !== "all"
                ? "Không tìm thấy đánh giá phù hợp với bộ lọc."
                : "Hiện chưa có đánh giá nào trên hệ thống."
            }
          />
        ) : (
          <div className="overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-3xl text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Sản phẩm</th>
                    <th className="px-4 py-3">Khách hàng</th>
                    <th className="px-4 py-3">Đánh giá</th>
                    <th className="px-4 py-3">Nội dung</th>
                    <th className="px-4 py-3">Ngày tạo</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredReviews.map((review) => {
                    const rating = getRating(review);
                    const email = getCustomerEmail(review);

                    return (
                      <tr
                        key={getReviewId(review)}
                        className="border-t border-slate-100 align-top transition hover:bg-slate-50/60"
                      >
                        <td className="px-4 py-4 font-medium text-slate-500">
                          #{getReviewId(review)}
                        </td>

                        <td className="max-w-xs px-4 py-4">
                          <div className="flex items-start gap-2 text-slate-800">
                            <FiPackage
                              size={15}
                              className="mt-0.5 shrink-0 text-slate-400"
                            />
                            <span className="font-medium">
                              {getProductName(review)}
                            </span>
                          </div>
                        </td>

                        <td className="max-w-xs px-4 py-4">
                          <div className="flex items-start gap-2">
                            <FiUser
                              size={15}
                              className="mt-0.5 shrink-0 text-slate-400"
                            />

                            <div className="min-w-0">
                              <p className="font-medium text-slate-800">
                                {getCustomerName(review)}
                              </p>

                              {email && (
                                <p className="truncate text-xs text-slate-500">
                                  {email}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-4 py-4">
                          <RatingStars value={rating} />

                          <p className="mt-1 text-xs text-slate-500">
                            {rating}/5
                          </p>
                        </td>

                        <td className="max-w-md px-4 py-4 text-slate-600">
                          <p className="line-clamp-3 leading-relaxed">
                            {getComment(review)}
                          </p>
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                          <div className="flex items-center gap-2">
                            <FiCalendar size={15} className="text-slate-400" />
                            {formatDate(review?.created_at)}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
              Hiển thị {filteredReviews.length} / {reviews.length} đánh giá
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
