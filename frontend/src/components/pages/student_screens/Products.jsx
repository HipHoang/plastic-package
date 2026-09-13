import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FiArrowLeft,
  FiFilter,
  FiPackage,
  FiSearch,
} from "react-icons/fi";
import { useNavigate, useSearchParams } from "react-router-dom";
import { productService } from "../../../services/productService";

const PAGE_SIZE = 10;
const CATEGORY_OPTIONS = [
  { id: "1", label: "Túi PE" },
  { id: "2", label: "Túi PP" },
  { id: "3", label: "Túi HDPE" },
  { id: "4", label: "Túi rác" },
];

const formatPrice = (price) => {
  const value = Number(price || 0);
  return value <= 0 ? "Liên hệ báo giá" : `${value.toLocaleString("vi-VN")} VNĐ`;
};

const getProductId = (product) => product?.product_id || product?.id;
const getProductName = (product) => product?.name || product?.title || "Sản phẩm bao bì";
const getCategoryId = (category) => (
  CATEGORY_OPTIONS.find((option) => option.label === category || option.id === category)?.id || ""
);

const ProductImage = ({ image, name }) => {
  const [hasError, setHasError] = useState(false);

  if (!image || hasError) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center text-slate-300">
        <FiPackage size={48} />
        <span className="mt-2 text-xs">ASIAPP Packaging</span>
      </div>
    );
  }

  return (
    <img
      src={image}
      alt={name}
      onError={() => setHasError(true)}
      className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
    />
  );
};

const Products = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestId = useRef(0);
  const q = searchParams.get("q") || "";
  const categoryFromUrl = searchParams.get("category") || "";
  const categoryIdFromUrl = searchParams.get("category_id") || "";
  const initialCategoryId = categoryIdFromUrl || getCategoryId(categoryFromUrl);

  const [products, setProducts] = useState([]);
  const [searchInput, setSearchInput] = useState(q);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [loadMoreError, setLoadMoreError] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    size: PAGE_SIZE,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    category_id: initialCategoryId,
    material: "",
    color: "",
    price: "",
    sort_by: "newest",
  });

  useEffect(() => {
    setSearchInput(q);
  }, [q]);

  useEffect(() => {
    setFilters((previous) => ({
      ...previous,
      category_id: categoryIdFromUrl || getCategoryId(categoryFromUrl),
    }));
  }, [categoryFromUrl, categoryIdFromUrl]);

  const buildParams = useCallback((page) => {
    const params = {
      page,
      size: PAGE_SIZE,
      q: q || undefined,
      category_id: filters.category_id || undefined,
      material: filters.material || undefined,
      color: filters.color || undefined,
      sort_by: filters.sort_by,
      order: "desc",
    };

    if (filters.price === "free") params.is_free = true;
    if (filters.price === "paid") params.is_free = false;
    return params;
  }, [q, filters]);

  const mergeProducts = (currentProducts, incomingProducts) => {
    const seenIds = new Set();
    return [...currentProducts, ...incomingProducts].filter((product, index) => {
      const id = getProductId(product);
      const key = id ?? `missing-${index}`;
      if (seenIds.has(key)) return false;
      seenIds.add(key);
      return true;
    });
  };

  useEffect(() => {
    let cancelled = false;
    const currentRequestId = ++requestId.current;

    const fetchProducts = async () => {
      setLoading(true);
      setLoadingMore(false);
      setError("");
      setLoadMoreError("");
      setProducts([]);
      setPagination({ page: 1, size: PAGE_SIZE, total: 0, totalPages: 0 });

      try {
        const response = await productService.searchProductsPaged(buildParams(1));
        if (cancelled || currentRequestId !== requestId.current) return;

        const results = Array.isArray(response?.results) ? response.results : [];
        setProducts(mergeProducts([], results));
        setPagination({
          page: Number(response?.page) || 1,
          size: Number(response?.size) || PAGE_SIZE,
          total: Number(response?.total) || 0,
          totalPages: Number(response?.total_pages) || 0,
        });
      } catch (fetchError) {
        if (!cancelled && currentRequestId === requestId.current) {
          console.error("Lỗi lấy sản phẩm:", fetchError);
          setError("Không thể tải sản phẩm. Vui lòng thử lại.");
        }
      } finally {
        if (!cancelled && currentRequestId === requestId.current) setLoading(false);
      }
    };

    fetchProducts();
    return () => { cancelled = true; };
  }, [buildParams]);

  const loadMore = async () => {
    if (loadingMore || loading || pagination.page >= pagination.totalPages) return;

    const nextPage = pagination.page + 1;
    const loadRequestId = requestId.current;
    setLoadingMore(true);
    setLoadMoreError("");

    try {
      const response = await productService.searchProductsPaged(buildParams(nextPage));
      if (loadRequestId !== requestId.current) return;

      const results = Array.isArray(response?.results) ? response.results : [];
      setProducts((currentProducts) => mergeProducts(currentProducts, results));
      setPagination((currentPagination) => ({
        ...currentPagination,
        page: Number(response?.page) || nextPage,
        size: Number(response?.size) || PAGE_SIZE,
        total: Number(response?.total) || currentPagination.total,
        totalPages: Number(response?.total_pages) || currentPagination.totalPages,
      }));
    } catch (loadError) {
      if (loadRequestId !== requestId.current) return;

      console.error("Lỗi tải thêm sản phẩm:", loadError);
      setLoadMoreError("Không thể tải thêm sản phẩm.");
    } finally {
      if (loadRequestId === requestId.current) setLoadingMore(false);
    }
  };

  const updateFilter = (key, value) => {
    requestId.current += 1;
    setFilters((previous) => ({ ...previous, [key]: value }));

    if (key === "category_id") {
      setSearchParams((previous) => {
        const next = new URLSearchParams(previous);
        next.delete("category");

        if (value) {
          next.set("category_id", value);
        } else {
          next.delete("category_id");
        }

        return next;
      });
    }
  };
  const submitSearch = (event) => {
    event.preventDefault();
    requestId.current += 1;

    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      const value = searchInput.trim();

      if (value) {
        next.set("q", value);
      } else {
        next.delete("q");
      }

      return next;
    });
  };
  const hasMore = pagination.totalPages > 0 && pagination.page < pagination.totalPages;

  return (
    <div className="space-y-8">
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 font-medium text-slate-700 transition hover:bg-gray-50"
        >
          <FiArrowLeft />
          Quay lại
        </button>
      </div>

      <section className="rounded-[28px] bg-linear-to-r from-[#021E4B] to-[#0757B8] px-6 py-10 text-center text-white sm:px-10">
        <div className="mx-auto flex max-w-3xl flex-col items-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
            <FiPackage size={28} />
          </div>
          <p className="text-sm font-semibold text-blue-200">ASIAPP PLASTIC PACKAGING</p>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">Sản phẩm bao bì</h1>
          <p className="mt-3 max-w-2xl text-blue-100">
            Khám phá các dòng túi PE, PP, HDPE, túi rác và các sản phẩm bao bì nhựa phù hợp với nhu cầu sử dụng.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <form onSubmit={submitSearch} className="flex min-h-11 flex-wrap items-center gap-3">
          <FiSearch className="shrink-0 text-slate-400" size={20} />
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Tìm kiếm sản phẩm..."
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none"
          />
          <button type="submit" className="rounded-lg bg-[#0047AB] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#00357D]">
            Tìm kiếm
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white px-5 py-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <FiFilter className="text-[#0047AB]" />
          <h2 className="font-bold text-slate-800">Bộ lọc sản phẩm</h2>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <select value={filters.category_id} onChange={(event) => updateFilter("category_id", event.target.value)} className="h-11 min-w-0 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
            <option value="">Tất cả danh mục</option>
            {CATEGORY_OPTIONS.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
          </select>
          <select value={filters.material} onChange={(event) => updateFilter("material", event.target.value)} className="h-11 min-w-0 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
            <option value="">Tất cả chất liệu</option>
            <option value="PE">PE</option>
            <option value="HDPE">HDPE</option>
            <option value="LDPE">LDPE</option>
            <option value="PP">PP</option>
          </select>
          <select value={filters.color} onChange={(event) => updateFilter("color", event.target.value)} className="h-11 min-w-0 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
            <option value="">Tất cả màu sắc</option>
            <option value="Trắng">Trắng</option>
            <option value="Đen">Đen</option>
            <option value="Trong">Trong</option>
            <option value="Màu">Màu</option>
          </select>
          <select value={filters.price} onChange={(event) => updateFilter("price", event.target.value)} className="h-11 min-w-0 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
            <option value="">Tất cả mức giá</option>
            <option value="free">Liên hệ báo giá</option>
            <option value="paid">Có giá bán</option>
          </select>
          <select value={filters.sort_by} onChange={(event) => updateFilter("sort_by", event.target.value)} className="h-11 min-w-0 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
            <option value="newest">Mới nhất</option>
            <option value="price_asc">Giá tăng dần</option>
            <option value="price_desc">Giá giảm dần</option>
            <option value="most_popular">Phổ biến</option>
          </select>
        </div>
      </section>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Danh sách sản phẩm</h2>
          {!loading && !error && (
            <p className="mt-1 text-sm text-slate-500">
              Đang hiển thị {products.length} / {pagination.total} sản phẩm
            </p>
          )}
        </div>
      </div>

      {loading && <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-slate-500">Đang tải sản phẩm...</div>}
      {!loading && error && (
        <div className="rounded-2xl border border-red-100 bg-white p-10 text-center">
          <p className="text-sm text-red-600">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 rounded-full bg-[#0047AB] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#00357D]">Thử lại</button>
        </div>
      )}
      {!loading && !error && products.length === 0 && (
        <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-300"><FiPackage size={32} /></div>
          <h3 className="mt-5 font-bold text-slate-700">Không tìm thấy sản phẩm</h3>
          <p className="mt-2 text-sm text-slate-500">Thử thay đổi từ khóa hoặc bộ lọc tìm kiếm.</p>
          <button onClick={() => navigate("/products")} className="mt-5 rounded-full bg-[#0047AB] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#00357D]">Xem tất cả sản phẩm</button>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => {
              const productId = getProductId(product);
              const productName = getProductName(product);
              return (
                <article key={productId} onClick={() => navigate(`/products/${productId}`)} className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <div className="relative h-52 shrink-0 overflow-hidden bg-slate-50">
                    <ProductImage
                      key={`${productId}-${product?.image || "placeholder"}`}
                      image={product?.image}
                      name={productName}
                    />
                    {product?.material && <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-[#0047AB] shadow-sm">{product.material}</span>}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="line-clamp-2 min-h-12 font-bold text-slate-800 transition-colors group-hover:text-[#0047AB]">{productName}</h3>
                    <p className="mt-2 min-h-4 text-xs text-slate-400">{product?.category || "Bao bì nhựa"}</p>
                    <div className="mt-4 space-y-1.5 text-sm text-slate-500">
                      {product?.thickness && <p>Độ dày: <span className="text-slate-700">{product.thickness}</span></p>}
                      {(product?.width || product?.height) && <p>Kích thước: <span className="text-slate-700">{product.width || "--"}{product.height ? ` × ${product.height}` : ""}</span></p>}
                      {product?.color && <p>Màu sắc: <span className="text-slate-700">{product.color}</span></p>}
                    </div>
                    <div className="mt-auto border-t border-gray-100 pt-4">
                      <div className="flex items-end justify-between gap-3">
                        <div><p className="text-xs text-slate-400">Giá tham khảo</p><p className="text-sm font-bold text-[#0047AB]">{formatPrice(product?.price)}</p></div>
                        <span className="text-right text-xs font-semibold text-[#0047AB]">Xem chi tiết →</span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          <div className="flex flex-col items-center gap-3 pb-2 pt-2">
            {loadMoreError && <p className="text-sm text-red-600">{loadMoreError}</p>}
            {hasMore ? (
              <button onClick={loadMore} disabled={loadingMore} className="min-w-52 rounded-full border border-[#0047AB] px-6 py-3 text-sm font-semibold text-[#0047AB] transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60">
                {loadingMore ? "Đang tải thêm sản phẩm..." : "Xem thêm sản phẩm"}
              </button>
            ) : <p className="text-sm text-slate-400">Đã hiển thị tất cả sản phẩm</p>}
            {loadMoreError && !loadingMore && <button onClick={loadMore} className="text-sm font-semibold text-[#0047AB] hover:underline">Thử lại</button>}
          </div>
        </>
      )}
    </div>
  );
};

export default Products;
