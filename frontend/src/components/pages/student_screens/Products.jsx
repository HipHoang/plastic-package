import React, { useEffect, useState } from "react";
import {
  FiArrowLeft,
  FiFilter,
  FiPackage,
  FiSearch,
} from "react-icons/fi";
import { useNavigate, useSearchParams } from "react-router-dom";
import { productService } from "../../../services/productService";

const formatPrice = (price) => {
  const value = Number(price || 0);

  if (value <= 0) {
    return "Liên hệ báo giá";
  }

  return `${value.toLocaleString("vi-VN")} VNĐ`;
};

const getProductId = (product) =>
  product?.product_id || product?.product_id || product?.id;

const getProductName = (product) =>
  product?.name || product?.title || "Sản phẩm bao bì";

const Products = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const q = searchParams.get("q") || "";
  const categoryFromUrl = searchParams.get("category") || "";
  const categoryIdFromUrl = searchParams.get("category_id") || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    category: categoryFromUrl,
    material: "",
    color: "",
    price: "",
    sort_by: "newest",
  });

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      category: categoryFromUrl,
    }));
  }, [categoryFromUrl]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);

      try {
        const params = {
          q,
          category: filters.category || undefined,
          sort_by: filters.sort_by,
          order: "desc",
        };

        if (filters.material) {
          params.material = filters.material;
        }

        if (filters.color) {
          params.color = filters.color;
        }

        if (filters.price === "free") {
          params.is_free = true;
        }

        if (filters.price === "paid") {
          params.is_free = false;
        }

        if (categoryIdFromUrl) {
          params.category_id = categoryIdFromUrl;
        }

        const response = await productService.searchProductsPaged(params);

        setProducts(
          Array.isArray(response?.results)
            ? response.results
            : Array.isArray(response)
              ? response
              : []
        );
      } catch (error) {
        console.error("Lỗi lấy sản phẩm:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [
    q,
    categoryIdFromUrl,
    filters.category,
    filters.material,
    filters.color,
    filters.price,
    filters.sort_by,
  ]);

  return (
    <div className="space-y-8">
      {/* BACK */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white text-slate-700 font-medium hover:bg-gray-50 transition"
        >
          <FiArrowLeft />
          Quay lại
        </button>
      </div>

      {/* HEADER */}
      <div className="bg-linear-to-r from-[#021E4B] to-[#0757B8] rounded-[28px] p-8 md:p-10 text-white">
        <div className="flex items-start gap-4">
          <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-white/10 items-center justify-center">
            <FiPackage size={28} />
          </div>

          <div>
            <p className="text-blue-200 text-sm font-semibold mb-2">
              ASIAPP PLASTIC PACKAGING
            </p>

            <h1 className="text-3xl md:text-4xl font-bold">
              Sản phẩm bao bì
            </h1>

            <p className="text-blue-100 mt-3 max-w-2xl">
              Khám phá các dòng túi PE, PP, HDPE, túi rác và
              các sản phẩm bao bì nhựa phù hợp với nhu cầu sử dụng.
            </p>
          </div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <FiSearch className="text-slate-400 shrink-0" size={20} />

          <input
            value={q}
            readOnly
            placeholder="Tìm kiếm sản phẩm..."
            className="w-full outline-none text-sm text-slate-700 bg-transparent"
          />

          {q && (
            <span className="text-sm text-slate-500 whitespace-nowrap">
              Từ khóa: <strong>{q}</strong>
            </span>
          )}
        </div>
      </div>

      {/* FILTER */}
      <div className="bg-white border border-gray-100 rounded-2xl px-5 py-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <FiFilter className="text-[#0047AB]" />
          <h2 className="font-bold text-slate-800">
            Bộ lọc sản phẩm
          </h2>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* CATEGORY */}
          <select
            value={filters.category}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                category: e.target.value,
              }))
            }
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm outline-none focus:border-blue-500"
          >
            <option value="">Tất cả danh mục</option>
            <option value="PE">Túi PE</option>
            <option value="PP">Túi PP</option>
            <option value="HDPE">Túi HDPE</option>
            <option value="Túi rác">Túi rác</option>
          </select>

          {/* MATERIAL */}
          <select
            value={filters.material}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                material: e.target.value,
              }))
            }
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm outline-none focus:border-blue-500"
          >
            <option value="">Tất cả chất liệu</option>
            <option value="PE">PE</option>
            <option value="HDPE">HDPE</option>
            <option value="LDPE">LDPE</option>
            <option value="PP">PP</option>
          </select>

          {/* COLOR */}
          <select
            value={filters.color}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                color: e.target.value,
              }))
            }
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm outline-none focus:border-blue-500"
          >
            <option value="">Tất cả màu sắc</option>
            <option value="Trắng">Trắng</option>
            <option value="Đen">Đen</option>
            <option value="Trong">Trong</option>
            <option value="Màu">Màu</option>
          </select>

          {/* PRICE */}
          <select
            value={filters.price}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                price: e.target.value,
              }))
            }
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm outline-none focus:border-blue-500"
          >
            <option value="">Tất cả mức giá</option>
            <option value="free">Liên hệ báo giá</option>
            <option value="paid">Có giá bán</option>
          </select>

          {/* SORT */}
          <select
            value={filters.sort_by}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                sort_by: e.target.value,
              }))
            }
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm outline-none focus:border-blue-500"
          >
            <option value="newest">Mới nhất</option>
            <option value="price_asc">Giá tăng dần</option>
            <option value="price_desc">Giá giảm dần</option>
            <option value="most_popular">Phổ biến</option>
          </select>
        </div>
      </div>

      {/* RESULT */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Danh sách sản phẩm
          </h2>

          {!loading && (
            <p className="text-sm text-slate-500 mt-1">
              Hiển thị {products.length} sản phẩm
            </p>
          )}
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-slate-500">
          Đang tải sản phẩm...
        </div>
      )}

      {/* EMPTY */}
      {!loading && products.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-50 text-slate-300 flex items-center justify-center">
            <FiPackage size={32} />
          </div>

          <h3 className="font-bold text-slate-700 mt-5">
            Không tìm thấy sản phẩm
          </h3>

          <p className="text-sm text-slate-500 mt-2">
            Thử thay đổi từ khóa hoặc bộ lọc tìm kiếm.
          </p>

          <button
            onClick={() => navigate("/products")}
            className="mt-5 px-5 py-2.5 rounded-full bg-[#0047AB] text-white text-sm font-semibold hover:bg-[#00357D] transition"
          >
            Xem tất cả sản phẩm
          </button>
        </div>
      )}

      {/* PRODUCT GRID */}
      {!loading && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => {
            const productId = getProductId(product);
            const productName = getProductName(product);

            return (
              <div
                key={productId}
                onClick={() => navigate(`/products/${productId}`)}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
              >
                {/* IMAGE */}
                <div className="relative h-48 bg-slate-50 overflow-hidden">
                  {product?.image ? (
                    <img
                      src={product.image}
                      alt={productName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                      <FiPackage size={48} />
                      <span className="text-xs mt-2">
                        ASIAPP Packaging
                      </span>
                    </div>
                  )}

                  {product?.material && (
                    <span className="absolute top-3 left-3 bg-white/95 text-[#0047AB] text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
                      {product.material}
                    </span>
                  )}
                </div>

                {/* CONTENT */}
                <div className="p-5">
                  <h3 className="font-bold text-slate-800 line-clamp-2 min-h-12 group-hover:text-[#0047AB] transition-colors">
                    {productName}
                  </h3>

                  {product?.category && (
                    <p className="text-xs text-slate-400 mt-2">
                      {product.category}
                    </p>
                  )}

                  <div className="mt-4 space-y-1.5 text-sm text-slate-500">
                    {product?.thickness && (
                      <p>
                        Độ dày:{" "}
                        <span className="text-slate-700">
                          {product.thickness}
                        </span>
                      </p>
                    )}

                    {(product?.width || product?.height) && (
                      <p>
                        Kích thước:{" "}
                        <span className="text-slate-700">
                          {product.width || "--"}
                          {product.height
                            ? ` × ${product.height}`
                            : ""}
                        </span>
                      </p>
                    )}

                    {product?.color && (
                      <p>
                        Màu sắc:{" "}
                        <span className="text-slate-700">
                          {product.color}
                        </span>
                      </p>
                    )}
                  </div>

                  <div className="border-t border-gray-100 mt-4 pt-4">
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <p className="text-xs text-slate-400">
                          Giá tham khảo
                        </p>

                        <p className="font-bold text-[#0047AB] text-sm">
                          {formatPrice(product?.price)}
                        </p>
                      </div>

                      <span className="text-xs font-semibold text-[#0047AB]">
                        Xem chi tiết →
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Products;