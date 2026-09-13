import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiFileText,
  FiMessageCircle,
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

const statusLabels = {
  published: "Đã đăng",
  draft: "Bản nháp",
};

const statusClasses = {
  published: "bg-green-100 text-green-700",
  draft: "bg-slate-100 text-slate-600",
};

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("vi-VN");
}

function getPostId(post) {
  return post?.post_id ?? post?.id ?? "-";
}

function getTitle(post) {
  return (
    post?.title ||
    post?.product_name ||
    `Bài viết #${getPostId(post)}`
  );
}

function getAuthor(post) {
  return (
    post?.author_name ||
    post?.user?.name ||
    "Không xác định"
  );
}

function getProductName(post) {
  return post?.product_name || post?.product?.name || "Không gắn sản phẩm";
}

function getCommentCount(post) {
  if (Array.isArray(post?.comments)) return post.comments.length;

  return typeof post?.comment_count === "number"
    ? post.comment_count
    : 0;
}

function getExcerpt(post) {
  const raw = String(post?.content || "").replace(/\s+/g, " ").trim();

  if (!raw) return "Không có nội dung.";

  return raw.length > 160 ? `${raw.slice(0, 160)}…` : raw;
}

function normalizeStatus(post) {
  const status = String(post?.status || "").toLowerCase();

  if (status === "draft") return "draft";

  return "published";
}

export default function AdminNews() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const loadPosts = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await adminService.getAdminPosts();

      const data = Array.isArray(response)
        ? response
        : response?.data || response?.posts || [];

      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("getAdminPosts ERROR:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Không thể tải danh sách tin tức"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const filteredPosts = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return posts;

    return posts.filter((post) =>
      [
        String(getPostId(post)),
        getTitle(post),
        getAuthor(post),
        getProductName(post),
        String(post?.content || ""),
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [posts, search]);

  const totalComments = posts.reduce(
    (sum, post) => sum + getCommentCount(post),
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Quản lý tin tức
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Danh sách bài viết của khách hàng trên hệ thống
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadPosts(true)}
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
                <FiFileText size={22} />
              </div>

              <div>
                <p className="text-sm text-gray-500">Tổng bài viết</p>
                <p className="text-2xl font-bold text-gray-800">
                  {posts.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-indigo-100 p-3 text-indigo-600">
                <FiMessageCircle size={22} />
              </div>

              <div>
                <p className="text-sm text-gray-500">Tổng bình luận</p>
                <p className="text-2xl font-bold text-gray-800">
                  {totalComments}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-5 rounded-xl bg-white p-4 shadow-sm">
          <div className="relative">
            <FiSearch
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm theo tiêu đề, tác giả, sản phẩm, nội dung..."
              className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <ErrorBanner
          message={error}
          onRetry={() => loadPosts(true)}
        />

        {loading ? (
          <LoadingState message="Đang tải danh sách tin tức..." />
        ) : filteredPosts.length === 0 ? (
          <EmptyState
            title="Không có bài viết"
            description={
              search
                ? "Không tìm thấy bài viết phù hợp với từ khóa."
                : "Hiện chưa có bài viết nào trên hệ thống."
            }
          />
        ) : (
          <div className="overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-3xl text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Bài viết</th>
                    <th className="px-4 py-3">Tác giả</th>
                    <th className="px-4 py-3">Sản phẩm</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Bình luận</th>
                    <th className="px-4 py-3">Ngày tạo</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredPosts.map((post) => {
                    const status = normalizeStatus(post);

                    return (
                      <tr
                        key={getPostId(post)}
                        className="border-t border-slate-100 align-top transition hover:bg-slate-50/60"
                      >
                        <td className="px-4 py-4 font-medium text-slate-500">
                          #{getPostId(post)}
                        </td>

                        <td className="max-w-md px-4 py-4">
                          <p className="font-semibold text-slate-800">
                            {getTitle(post)}
                          </p>

                          <p className="mt-1 text-xs leading-relaxed text-slate-500">
                            {getExcerpt(post)}
                          </p>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2 text-slate-700">
                            <FiUser size={15} className="text-slate-400" />
                            <span className="truncate">{getAuthor(post)}</span>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2 text-slate-700">
                            <FiPackage size={15} className="text-slate-400" />
                            <span className="truncate">
                              {getProductName(post)}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
                              statusClasses[status] ||
                              "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {statusLabels[status] || status}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-slate-700">
                          {getCommentCount(post)}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                          <div className="flex items-center gap-2">
                            <FiCalendar size={15} className="text-slate-400" />
                            {formatDate(post?.created_at)}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
              Hiển thị {filteredPosts.length} / {posts.length} bài viết
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
