import React, { useEffect, useMemo, useState } from "react";
import {
  FiArrowRight,
  FiChevronRight,
  FiPackage,
  FiSearch,
  FiShield,
  FiTruck,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { productService } from "../../services/productService";
import { getStoredAuth } from "../../untils/auth";

const formatPrice = (price) => {
  const value = Number(price || 0);

  if (value <= 0) {
    return "Liên hệ báo giá";
  }

  return `${value.toLocaleString("vi-VN")} VNĐ`;
};

const getProductName = (product) =>
  product?.name || product?.title || "Sản phẩm bao bì";

const getProductId = (product) =>
  product?.product_id || product?.product_id || product?.id;

const ProductCard = ({ product, onClick }) => {
  const name = getProductName(product);

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
    >
      <div className="h-48 bg-slate-50 relative overflow-hidden flex items-center justify-center">
        {product?.image ? (
          <img
            src={product.image}
            alt={name}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-300">
            <FiPackage size={52} />
            <span className="text-xs mt-2">ASIAPP Packaging</span>
          </div>
        )}

        {product?.material && (
          <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-[#003B7A] text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
            {product.material}
          </span>
        )}
      </div>

      <div className="p-5">
        <h3 className="font-bold text-slate-800 line-clamp-2 min-h-12 group-hover:text-[#0047AB] transition-colors">
          {name}
        </h3>

        <div className="mt-3 space-y-1 text-sm text-slate-500">
          {product?.thickness && (
            <p>
              Độ dày:{" "}
              <span className="text-slate-700">{product.thickness}</span>
            </p>
          )}

          {(product?.width || product?.height) && (
            <p>
              Kích thước:{" "}
              <span className="text-slate-700">
                {product.width || "--"}
                {product.height ? ` × ${product.height}` : ""}
              </span>
            </p>
          )}

          {product?.color && (
            <p>
              Màu sắc:{" "}
              <span className="text-slate-700">{product.color}</span>
            </p>
          )}
        </div>

        <div className="border-t border-gray-100 mt-4 pt-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-slate-400">Giá sản phẩm</p>
            <p className="font-bold text-[#0047AB]">
              {formatPrice(product?.price)}
            </p>
          </div>

          <span className="w-9 h-9 rounded-full bg-blue-50 text-[#0047AB] flex items-center justify-center group-hover:bg-[#0047AB] group-hover:text-white transition-colors">
            <FiArrowRight size={17} />
          </span>
        </div>
      </div>
    </div>
  );
};

const CategoryCard = ({ title, description, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-lg hover:border-blue-100 transition-all cursor-pointer group"
  >
    <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0047AB] flex items-center justify-center mb-4 group-hover:bg-[#0047AB] group-hover:text-white transition-colors">
      <FiPackage size={22} />
    </div>

    <h3 className="font-bold text-slate-800 mb-2">
      {title}
    </h3>

    <p className="text-sm text-slate-500 line-clamp-2">
      {description || "Sản phẩm bao bì nhựa chất lượng cao."}
    </p>

    <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-[#0047AB]">
      Xem sản phẩm
      <FiChevronRight />
    </div>
  </div>
);

const GuestHome = ({ products, categories, loading }) => {
  const navigate = useNavigate();

  const featuredProducts = useMemo(
    () => products.slice(0, 8),
    [products]
  );

  return (
    <div className="space-y-12">

      {/* HERO */}
      <section className="relative overflow-hidden rounded-[28px] bg-[#021E4B] text-white shadow-xl">
        <div className="grid items-center gap-8 px-7 py-10 md:px-12 md:py-14 lg:grid-cols-[1.15fr_0.85fr] lg:px-16">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm">
              <FiPackage />
              ASIAPP Plastic Packaging
            </span>

            <h1 className="mt-5 text-4xl font-extrabold leading-tight md:text-5xl lg:text-6xl">
              Bao bì nhựa
              <br />
              cho chuỗi cung ứng
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-blue-100 md:text-lg">
              Danh mục túi PE, PP, HDPE và túi rác với thông số rõ ràng, phù hợp cho đóng gói, sản xuất và vận hành doanh nghiệp.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/products")}
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-bold text-[#003B7A] transition hover:bg-blue-50"
              >
                Xem sản phẩm
                <FiArrowRight />
              </button>

              <a
                href="tel:02873008899"
                className="rounded-full border border-white/30 bg-white/10 px-6 py-3 font-semibold transition hover:bg-white/20"
              >
                Liên hệ tư vấn
              </a>
            </div>

            <div className="mt-9 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/15 pt-5 text-sm text-blue-100">
              <span><strong className="text-xl text-white">{products.length}</strong> sản phẩm</span>
              <span><strong className="text-xl text-white">{categories.length}</strong> danh mục</span>
              <span>MOQ và thông số theo từng sản phẩm</span>
            </div>
          </div>

          <div className="relative min-h-64 overflow-hidden rounded-3xl border border-white/15 bg-white/10 p-4 lg:min-h-80">
            {featuredProducts[0]?.image ? (
              <img
                src={featuredProducts[0].image}
                alt={getProductName(featuredProducts[0])}
                className="h-full min-h-56 w-full object-contain rounded-2xl bg-white/95 p-5"
              />
            ) : (
              <div className="flex h-full min-h-56 flex-col items-center justify-center text-blue-100">
                <FiPackage size={72} />
                <span className="mt-3 text-sm">Bao bì nhựa ASIAPP</span>
              </div>
            )}
            {featuredProducts[0] && (
              <div className="absolute bottom-7 left-7 right-7 rounded-2xl bg-[#021E4B]/90 px-4 py-3 backdrop-blur-sm">
                <p className="text-xs text-blue-200">Sản phẩm tiêu biểu</p>
                <p className="mt-1 truncate font-semibold">{getProductName(featuredProducts[0])}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* USP */}
      <section id="gioi-thieu" className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 flex gap-4">
          <div className="w-12 h-12 shrink-0 rounded-xl bg-blue-50 text-[#0047AB] flex items-center justify-center">
            <FiPackage size={23} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">
              Đa dạng sản phẩm
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              PE, PP, HDPE và nhiều dòng bao bì khác.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 flex gap-4">
          <div className="w-12 h-12 shrink-0 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
            <FiShield size={23} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">
              Chất lượng ổn định
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Thông tin sản phẩm và thông số được quản lý rõ ràng.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 flex gap-4">
          <div className="w-12 h-12 shrink-0 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
            <FiTruck size={23} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">
              Phục vụ doanh nghiệp
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Hỗ trợ nhu cầu đóng gói và đặt hàng số lượng.
            </p>
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section>
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-sm font-semibold text-[#0047AB] mb-1">
              SẢN PHẨM TIÊU BIỂU
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800">
              Bao bì nhựa nổi bật
            </h2>
          </div>

          <button
            onClick={() => navigate("/products")}
            className="hidden sm:flex items-center gap-1 text-[#0047AB] text-sm font-semibold hover:underline"
          >
            Xem tất cả
            <FiChevronRight />
          </button>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-slate-500">
            Đang tải sản phẩm...
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-slate-500">
            Chưa có sản phẩm.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredProducts.map((product) => (
              <ProductCard
                key={getProductId(product)}
                product={product}
                onClick={() =>
                  navigate(`/products/${getProductId(product)}`)
                }
              />
            ))}
          </div>
        )}
      </section>

      {/* CATEGORIES */}
      <section>
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-sm font-semibold text-[#0047AB] mb-1">
              DANH MỤC
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800">
              Tìm sản phẩm theo nhu cầu
            </h2>
          </div>

          <button
            onClick={() => navigate("/products")}
            className="hidden sm:flex items-center gap-1 text-[#0047AB] text-sm font-semibold hover:underline"
          >
            Xem tất cả
            <FiChevronRight />
          </button>
        </div>

        {categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {categories.slice(0, 4).map((category) => (
              <CategoryCard
                key={category.id || category.category_id}
                title={category.name}
                description={category.description}
                onClick={() =>
                  navigate(
                    `/products?category_id=${
                      category.id || category.category_id
                    }`
                  )
                }
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {["Túi PE", "Túi PP", "Túi HDPE", "Túi rác"].map((item) => (
              <CategoryCard
                key={item}
                title={item}
                onClick={() =>
                  navigate(`/products?q=${encodeURIComponent(item)}`)
                }
              />
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="bg-[#021E4B] rounded-[28px] p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">
            Cần tư vấn sản phẩm bao bì?
          </h2>
          <p className="text-blue-100 mt-2">
            Liên hệ ASIAPP để được hỗ trợ về sản phẩm và số lượng đặt hàng.
          </p>
        </div>

        <a
          href="tel:02873008899"
          className="shrink-0 bg-white text-[#003B7A] px-7 py-3 rounded-full font-bold hover:bg-blue-50 transition"
        >
          Liên hệ tư vấn
        </a>
      </section>
    </div>
  );
};

const UserHome = ({ currentUser, products, loading }) => {
  const navigate = useNavigate();

  const firstName =
    currentUser?.name ||
    currentUser?.fullName ||
    currentUser?.email?.split("@")[0] ||
    "bạn";

  return (
    <div className="space-y-10">
      <section className="bg-linear-to-r from-[#021E4B] to-[#0757B8] rounded-[28px] p-8 md:p-12 text-white">
        <p className="text-blue-200 text-sm mb-2">
          Chào mừng bạn quay trở lại
        </p>

        <h1 className="text-3xl md:text-4xl font-bold">
          Xin chào, {firstName}
        </h1>

        <p className="text-blue-100 mt-3 max-w-2xl">
          Khám phá sản phẩm bao bì nhựa và lựa chọn giải pháp phù hợp
          cho nhu cầu của bạn.
        </p>

        <button
          onClick={() => navigate("/products")}
          className="mt-6 bg-white text-[#003B7A] px-6 py-3 rounded-full font-bold hover:bg-blue-50 transition flex items-center gap-2"
        >
          Xem sản phẩm
          <FiArrowRight />
        </button>
      </section>

      <section>
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-sm font-semibold text-[#0047AB]">
              GỢI Ý CHO BẠN
            </p>
            <h2 className="text-2xl font-bold text-slate-800">
              Sản phẩm nổi bật
            </h2>
          </div>

          <button
            onClick={() => navigate("/products")}
            className="flex items-center gap-1 text-[#0047AB] text-sm font-semibold"
          >
            Xem tất cả
            <FiChevronRight />
          </button>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-slate-500">
            Đang tải sản phẩm...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {products.slice(0, 8).map((product) => (
              <ProductCard
                key={getProductId(product)}
                product={product}
                onClick={() =>
                  navigate(`/products/${getProductId(product)}`)
                }
              />
            ))}
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <FiSearch className="text-[#0047AB] text-2xl mb-4" />
          <h3 className="font-bold text-slate-800">
            Tìm kiếm nhanh
          </h3>
          <p className="text-sm text-slate-500 mt-2">
            Tìm sản phẩm theo tên, chất liệu hoặc nhu cầu sử dụng.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <FiPackage className="text-[#0047AB] text-2xl mb-4" />
          <h3 className="font-bold text-slate-800">
            Thông số rõ ràng
          </h3>
          <p className="text-sm text-slate-500 mt-2">
            Xem chất liệu, kích thước, độ dày và các thông tin sản phẩm.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <FiTruck className="text-[#0047AB] text-2xl mb-4" />
          <h3 className="font-bold text-slate-800">
            Đặt hàng thuận tiện
          </h3>
          <p className="text-sm text-slate-500 mt-2">
            Chọn sản phẩm và tiến hành đặt hàng trực tuyến.
          </p>
        </div>
      </section>
    </div>
  );
};

const HomeStudent = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const auth = getStoredAuth();
  const currentUser = auth?.user || null;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productData, categoryData] = await Promise.all([
          productService.getProducts(),
          productService.getCategories
            ? productService.getCategories()
            : Promise.resolve([]),
        ]);

        setProducts(Array.isArray(productData) ? productData : []);
        setCategories(Array.isArray(categoryData) ? categoryData : []);
      } catch (error) {
        console.error("Lỗi tải dữ liệu trang chủ:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (currentUser) {
    return (
      <UserHome
        currentUser={currentUser}
        products={products}
        categories={categories}
        loading={loading}
      />
    );
  }

  return (
    <GuestHome
      products={products}
      categories={categories}
      loading={loading}
    />
  );
};

export default HomeStudent;