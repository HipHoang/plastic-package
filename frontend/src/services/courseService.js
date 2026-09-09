import apiClient from "../untils/auth";

export const courseService = {
  async getAllCourses() {
    try {
      const res = await apiClient.get("/courses/");
      const raw = res.data;
      const products = raw?.data?.results || [];

      if (!Array.isArray(products)) {
        throw new Error("Invalid product list format");
      }

      return products.map((item) => this.normalizeProduct(item));
    } catch (error) {
      console.error(
        "getAllProducts ERROR:",
        error.response?.data || error
      );
      return [];
    }
  },

  async createProduct(productData) {
    try {
      const res = await apiClient.post("/courses/", productData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return res.data;
    } catch (error) {
      console.error(
        "createProduct ERROR:",
        error.response?.data || error
      );
      throw error;
    }
  },

  // Giữ createCourse để các component cũ chưa đổi tên vẫn hoạt động
  async createCourse(courseData) {
    return this.createProduct(courseData);
  },

  async getProductById(id) {
    try {
      const res = await apiClient.get(`/courses/${id}`);
      const product = res.data?.data;

      if (!product) {
        throw new Error("Product not found");
      }

      return this.normalizeProduct(product);
    } catch (error) {
      console.error(
        "getProductById ERROR:",
        error.response?.data || error
      );
      return null;
    }
  },

  // Giữ getCourseById để tương thích với component cũ
  async getCourseById(id) {
    return this.getProductById(id);
  },

  async searchProductsPaged(params = {}) {
    try {
      const query = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (
          value !== undefined &&
          value !== null &&
          value !== ""
        ) {
          query.append(key, value);
        }
      });

      const res = await apiClient.get(
        `/courses/search?${query.toString()}`
      );

      const raw = res.data?.data || {};

      return {
        ...raw,
        results: (raw.results || []).map((item) =>
          this.normalizeProduct(item)
        ),
      };
    } catch (error) {
      console.error(
        "searchProductsPaged ERROR:",
        error.response?.data || error
      );

      return {
        results: [],
        total: 0,
        page: 1,
        size: 10,
        total_pages: 0,
      };
    }
  },

  // Giữ tên cũ để component hiện tại không bị lỗi
  async searchCoursesPaged(params = {}) {
    return this.searchProductsPaged(params);
  },

  async searchProducts(params = {}) {
    try {
      const response = await apiClient.get("/courses/search", {
        params,
      });

      const rawData = response.data?.data || response.data;

      return (rawData?.results || []).map((item) =>
        this.normalizeProduct(item)
      );
    } catch (error) {
      console.error(
        "searchProducts ERROR:",
        error.response?.data || error
      );
      return [];
    }
  },

  // Giữ tên cũ để tương thích
  async searchCourses(params = {}) {
    return this.searchProducts(params);
  },

  normalizeProduct(product) {
    return {
      // ID
      id: product.product_id ?? product.course_id ?? product.id,

      productId:
        product.product_id ?? product.course_id ?? product.id,

      // Tên sản phẩm
      title:
        product.name ||
        product.title ||
        "Sản phẩm chưa có tên",

      name:
        product.name ||
        product.title ||
        "Sản phẩm chưa có tên",

      description:
        product.description ||
        "Chưa có mô tả sản phẩm",

      // Thông tin sản phẩm bao bì
      material: product.material || "",
      thickness: product.thickness || "",
      width: product.width || "",
      height: product.height || "",
      length: product.length || "",
      color: product.color || "",
      printing: product.printing || "",
      usage: product.usage || "",

      minOrderQuantity:
        Number(
          product.min_order_quantity ??
          product.minOrderQuantity ??
          1
        ) || 1,

      unit: product.unit || "cái",

      // Danh mục
      categoryId:
        product.category_id ??
        product.categoryId ??
        null,

      category:
        product.category ||
        product.product_category?.name ||
        "Khác",

      // Giá
      price: Number(product.price || 0),

      // Hình ảnh
      image:
        product.image ||
        product.thumbnail ||
        "",

      thumbnail:
        product.thumbnail ||
        product.image ||
        "",

      // Đánh giá
      rating:
        product.avg_rating !== undefined &&
        product.avg_rating !== null
          ? Number(product.avg_rating)
          : Number(product.rating || 0),

      totalReviews:
        Number(product.total_reviews || 0),

      // Trạng thái
      isActive:
        product.is_active !== undefined
          ? Boolean(product.is_active)
          : true,

      isPublished:
        product.is_published !== undefined
          ? Boolean(product.is_published)
          : true,

      // Nhà sản xuất
      manufacturer:
        product.manufacturer || "ASIAPP",

      // Giữ một số field cũ để component LMS chưa đổi tên vẫn chạy
      instructor:
        product.instructor_name ||
        product.instructor?.name ||
        "ASIAPP",

      instructorName:
        product.instructor_name ||
        "ASIAPP",

      level:
        product.level ||
        "Tiêu chuẩn",

      totalDuration:
        product.total_duration ||
        "Liên hệ",

      totalChapters: 0,
      totalLessons: 0,

      introVideoThumbnail:
        product.image ||
        product.thumbnail ||
        "",

      outcomes: [],

      chapters: [],

      createdAt:
        product.created_at || null,

      updatedAt:
        product.updated_at || null,

      // Giữ dữ liệu gốc nếu sau này cần thêm trường
      raw: product,
    };
  },

  // Tương thích với code cũ
  normalizeCourse(course) {
    return this.normalizeProduct(course);
  },
};