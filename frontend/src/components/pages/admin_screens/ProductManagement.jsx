import React, { useEffect, useMemo, useState } from "react";
import adminService from "../../../services/adminService";
import apiClient from "../../../untils/auth";

const emptyForm = {
  title: "",
  description: "",
  price: "",
  category_id: "",
  material: "",
  thickness: "",
  width: "",
  height: "",
  length: "",
  color: "",
  printing: "",
  usage: "",
  min_order_quantity: 1,
  unit: "cái",
  image: null,
  is_published: true,
  is_active: true,
};

const formatPrice = (value) => {
  const number = Number(value || 0);

  if (!number) {
    return "Liên hệ báo giá";
  }

  return `${number.toLocaleString("vi-VN")} đ`;
};

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadProducts = async () => {
    try {
      setLoading(true);

      const response = await adminService.getAdminProducts();

      let productList = [];

      if (Array.isArray(response)) {
        productList = response;
      } else if (Array.isArray(response?.data)) {
        productList = response.data;
      } else if (Array.isArray(response?.products)) {
        productList = response.products;
      } else if (Array.isArray(response?.data?.products)) {
        productList = response.data.products;
      }

      setProducts(productList);
    } catch (error) {
      console.error("Không thể tải danh sách sản phẩm:", error);

      alert(
        error?.response?.data?.message ||
          "Không thể tải danh sách sản phẩm."
      );

      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await apiClient.get(
        "/products/product-categories"
      );

      let categoryList = [];

      if (Array.isArray(response?.data?.data)) {
        categoryList = response.data.data;
      } else if (Array.isArray(response?.data)) {
        categoryList = response.data;
      } else if (Array.isArray(response?.data?.products)) {
        categoryList = response.data.products;
      }

      setCategories(categoryList);
    } catch (error) {
      console.error("Không thể tải danh mục:", error);

      alert(
        error?.response?.data?.message ||
          "Không thể tải danh mục sản phẩm."
      );

      setCategories([]);
    }
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return products.filter((product) => {
      const productName = String(
        product.title || product.name || ""
      ).toLowerCase();

      const material = String(
        product.material || ""
      ).toLowerCase();

      const category = String(
        product.category || ""
      ).toLowerCase();

      const matchesSearch =
        !keyword ||
        productName.includes(keyword) ||
        material.includes(keyword) ||
        category.includes(keyword);

      const active = product.is_active !== false;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && active) ||
        (statusFilter === "inactive" && !active);

      return matchesSearch && matchesStatus;
    });
  }, [products, search, statusFilter]);

  const activeCount = products.filter(
    (product) => product.is_active !== false
  ).length;

  const inactiveCount = products.filter(
    (product) => product.is_active === false
  ).length;

  const openCreateModal = () => {
    setEditingProduct(null);
    setForm({ ...emptyForm });
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);

    setForm({
      title: product.title || product.name || "",
      description: product.description || "",
      price:
        product.price !== null && product.price !== undefined
          ? product.price
          : "",
      category_id: product.category_id || "",
      material: product.material || "",
      thickness: product.thickness || "",
      width: product.width || "",
      height: product.height || "",
      length: product.length || "",
      color: product.color || "",
      printing: product.printing || "",
      usage: product.usage || "",
      min_order_quantity: product.min_order_quantity || 1,
      unit: product.unit || "cái",
      image: null,
      is_published: product.is_published !== false,
      is_active: product.is_active !== false,
    });

    setShowModal(true);
  };

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
      files,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : type === "file"
          ? files?.[0] || null
          : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      alert("Vui lòng nhập tên sản phẩm.");
      return;
    }

    if (!form.material.trim()) {
      alert("Vui lòng nhập chất liệu.");
      return;
    }

    if (!form.category_id) {
      alert("Vui lòng chọn danh mục sản phẩm.");
      return;
    }

    if (
      !form.min_order_quantity ||
      Number(form.min_order_quantity) < 1
    ) {
      alert("Số lượng tối thiểu phải lớn hơn 0.");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("price", form.price || 0);
      formData.append("category_id", form.category_id);
      formData.append("material", form.material);
      formData.append("thickness", form.thickness);
      formData.append("width", form.width);
      formData.append("height", form.height);
      formData.append("length", form.length);
      formData.append("color", form.color);
      formData.append("printing", form.printing);
      formData.append("usage", form.usage);

      formData.append(
        "min_order_quantity",
        Number(form.min_order_quantity)
      );

      formData.append("unit", form.unit);

      formData.append(
        "is_published",
        form.is_published ? "true" : "false"
      );

      formData.append(
        "is_active",
        form.is_active ? "true" : "false"
      );

      if (form.image) {
        formData.append("image", form.image);
      }

      if (editingProduct) {
        const productId =
          editingProduct.product_id ||
          editingProduct.product_id ||
          editingProduct.id;

        await adminService.updateProduct(
          productId,
          formData
        );

        alert("Cập nhật sản phẩm thành công.");
      } else {
        await adminService.createProduct(formData);

        alert("Thêm sản phẩm thành công.");
      }

      setShowModal(false);
      setEditingProduct(null);
      setForm({ ...emptyForm });

      await loadProducts();
    } catch (error) {
      console.error("Lưu sản phẩm thất bại:", error);

      alert(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Không thể lưu sản phẩm."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (product) => {
    const productId =
      product.product_id ||
      product.product_id ||
      product.id;

    if (!productId) {
      return;
    }

    const productName =
      product.title ||
      product.name ||
      "sản phẩm này";

    if (
      !window.confirm(
        `Bạn có chắc muốn ngừng bán "${productName}" không?`
      )
    ) {
      return;
    }

    try {
      await adminService.deleteProduct(productId);

      alert("Đã ngừng bán sản phẩm.");

      await loadProducts();
    } catch (error) {
      console.error(
        "Không thể ngừng bán sản phẩm:",
        error
      );

      alert(
        error?.response?.data?.message ||
          "Không thể ngừng bán sản phẩm."
      );
    }
  };

  const handleActivate = async (product) => {
    const productId =
      product.product_id ||
      product.product_id ||
      product.id;

    if (!productId) {
      return;
    }

    try {
      const formData = new FormData();

      formData.append("is_active", "true");

      await adminService.updateProduct(
        productId,
        formData
      );

      alert("Đã mở bán lại sản phẩm.");

      await loadProducts();
    } catch (error) {
      console.error(
        "Không thể mở bán sản phẩm:",
        error
      );

      alert(
        error?.response?.data?.message ||
          "Không thể mở bán sản phẩm."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Quản lý sản phẩm
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Quản lý các sản phẩm bao bì PE, PP, HDPE và túi rác.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            + Thêm sản phẩm
          </button>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="text-sm text-gray-500">
              Tổng sản phẩm
            </div>

            <div className="mt-2 text-3xl font-bold text-gray-800">
              {products.length}
            </div>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="text-sm text-gray-500">
              Đang bán
            </div>

            <div className="mt-2 text-3xl font-bold text-green-600">
              {activeCount}
            </div>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="text-sm text-gray-500">
              Ngừng bán
            </div>

            <div className="mt-2 text-3xl font-bold text-red-600">
              {inactiveCount}
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-xl border bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row">
            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Tìm theo tên sản phẩm, chất liệu hoặc danh mục..."
              className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
            >
              <option value="all">
                Tất cả trạng thái
              </option>

              <option value="active">
                Đang bán
              </option>

              <option value="inactive">
                Ngừng bán
              </option>
            </select>

            <button
              type="button"
              onClick={() => {
                loadProducts();
                loadCategories();
              }}
              className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Làm mới
            </button>
          </div>
        </div>

        {loading ? (
          <div className="rounded-xl border bg-white p-10 text-center text-gray-500">
            Đang tải danh sách sản phẩm...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-xl border bg-white p-10 text-center">
            <div className="text-lg font-semibold text-gray-700">
              Chưa có sản phẩm
            </div>

            <p className="mt-2 text-sm text-gray-500">
              Không tìm thấy sản phẩm phù hợp.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => {
              const productId =
                product.product_id ||
                product.product_id ||
                product.id;

              const productName =
                product.title ||
                product.name ||
                "Sản phẩm";

              const active =
                product.is_active !== false;

              return (
                <div
                  key={productId}
                  className="overflow-hidden rounded-xl border bg-white shadow-sm"
                >
                  <div className="relative h-48 bg-gray-100">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={productName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-gray-400">
                        Chưa có hình ảnh
                      </div>
                    )}

                    <div className="absolute right-3 top-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          active
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {active
                          ? "Đang bán"
                          : "Ngừng bán"}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <h2 className="line-clamp-2 min-h-[56px] text-lg font-bold text-gray-800">
                      {productName}
                    </h2>

                    <div className="mt-3 space-y-2 text-sm">
                      <div className="flex justify-between gap-3">
                        <span className="text-gray-500">
                          Danh mục
                        </span>

                        <span className="text-right font-medium text-gray-800">
                          {product.category || "—"}
                        </span>
                      </div>

                      <div className="flex justify-between gap-3">
                        <span className="text-gray-500">
                          Chất liệu
                        </span>

                        <span className="text-right font-medium text-gray-800">
                          {product.material || "—"}
                        </span>
                      </div>

                      <div className="flex justify-between gap-3">
                        <span className="text-gray-500">
                          MOQ
                        </span>

                        <span className="font-medium text-gray-800">
                          {Number(
                            product.min_order_quantity || 1
                          ).toLocaleString("vi-VN")}{" "}
                          {product.unit || "cái"}
                        </span>
                      </div>

                      <div className="flex justify-between gap-3">
                        <span className="text-gray-500">
                          Giá
                        </span>

                        <span className="font-semibold text-blue-600">
                          {formatPrice(product.price)}
                        </span>
                      </div>

                      {product.width ||
                      product.height ||
                      product.length ? (
                        <div className="flex justify-between gap-3">
                          <span className="text-gray-500">
                            Kích thước
                          </span>

                          <span className="text-right font-medium text-gray-800">
                            {[
                              product.width,
                              product.height,
                              product.length,
                            ]
                              .filter(Boolean)
                              .join(" × ")}
                          </span>
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-5 flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          openEditModal(product)
                        }
                        className="flex-1 rounded-lg border border-blue-600 px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
                      >
                        Chỉnh sửa
                      </button>

                      {active ? (
                        <button
                          type="button"
                          onClick={() =>
                            handleDeactivate(product)
                          }
                          className="flex-1 rounded-lg border border-red-500 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                        >
                          Ngừng bán
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            handleActivate(product)
                          }
                          className="flex-1 rounded-lg border border-green-500 px-3 py-2 text-sm font-semibold text-green-600 hover:bg-green-50"
                        >
                          Mở bán
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[95vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-5 py-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {editingProduct
                    ? "Chỉnh sửa sản phẩm"
                    : "Thêm sản phẩm"}
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Nhập thông tin sản phẩm bao bì.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowModal(false)
                }
                className="text-2xl text-gray-400 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-5"
            >
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Tên sản phẩm *
                  </label>

                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Ví dụ: Túi PE trong suốt"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Chất liệu *
                  </label>

                  <select
                    name="material"
                    value={form.material}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                  >
                    <option value="">
                      Chọn chất liệu
                    </option>

                    <option value="PE">PE</option>
                    <option value="LDPE">LDPE</option>
                    <option value="HDPE">HDPE</option>
                    <option value="PP">PP</option>
                    <option value="PE nguyên sinh">
                      PE nguyên sinh
                    </option>
                    <option value="HDPE nguyên sinh">
                      HDPE nguyên sinh
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Danh mục *
                  </label>

                  <select
                    name="category_id"
                    value={form.category_id}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                  >
                    <option value="">
                      Chọn danh mục
                    </option>

                    {categories.map((category) => (
                      <option
                        key={
                          category.category_id ||
                          category.id
                        }
                        value={
                          category.category_id ||
                          category.id
                        }
                      >
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Giá bán
                  </label>

                  <input
                    type="number"
                    name="price"
                    min="0"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="Để 0 nếu cần báo giá"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Số lượng tối thiểu (MOQ) *
                  </label>

                  <input
                    type="number"
                    name="min_order_quantity"
                    min="1"
                    value={form.min_order_quantity}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Đơn vị
                  </label>

                  <select
                    name="unit"
                    value={form.unit}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                  >
                    <option value="cái">Cái</option>
                    <option value="kg">Kg</option>
                    <option value="tấn">Tấn</option>
                    <option value="cuộn">Cuộn</option>
                    <option value="bao">Bao</option>
                    <option value="roll">Roll</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Độ dày
                  </label>

                  <input
                    name="thickness"
                    value={form.thickness}
                    onChange={handleChange}
                    placeholder="Ví dụ: 30 micron"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Chiều rộng
                  </label>

                  <input
                    name="width"
                    value={form.width}
                    onChange={handleChange}
                    placeholder="Ví dụ: 30 cm"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Chiều cao
                  </label>

                  <input
                    name="height"
                    value={form.height}
                    onChange={handleChange}
                    placeholder="Ví dụ: 40 cm"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Chiều dài
                  </label>

                  <input
                    name="length"
                    value={form.length}
                    onChange={handleChange}
                    placeholder="Nếu có"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Màu sắc
                  </label>

                  <input
                    name="color"
                    value={form.color}
                    onChange={handleChange}
                    placeholder="Trong suốt, trắng, đen..."
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    In ấn
                  </label>

                  <input
                    name="printing"
                    value={form.printing}
                    onChange={handleChange}
                    placeholder="Không in / 1 màu / nhiều màu..."
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Hình ảnh sản phẩm
                  </label>

                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3"
                  />

                  {editingProduct?.image &&
                  !form.image ? (
                    <img
                      src={editingProduct.image}
                      alt="Ảnh hiện tại"
                      className="mt-3 h-32 w-32 rounded-lg object-cover"
                    />
                  ) : null}
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Mô tả
                  </label>

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Mô tả sản phẩm..."
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Công dụng
                  </label>

                  <textarea
                    name="usage"
                    value={form.usage}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Đựng thực phẩm, đóng gói hàng hóa, túi rác..."
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    id="is_published"
                    type="checkbox"
                    name="is_published"
                    checked={form.is_published}
                    onChange={handleChange}
                    className="h-4 w-4"
                  />

                  <label
                    htmlFor="is_published"
                    className="text-sm font-medium text-gray-700"
                  >
                    Hiển thị trên website
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    id="is_active"
                    type="checkbox"
                    name="is_active"
                    checked={form.is_active}
                    onChange={handleChange}
                    className="h-4 w-4"
                  />

                  <label
                    htmlFor="is_active"
                    className="text-sm font-medium text-gray-700"
                  >
                    Đang kinh doanh
                  </label>
                </div>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() =>
                    setShowModal(false)
                  }
                  className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Đang lưu..."
                    : editingProduct
                    ? "Lưu thay đổi"
                    : "Thêm sản phẩm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;