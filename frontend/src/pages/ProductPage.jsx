import React, { useState, useEffect } from "react";
import {
  Search,
  Loader,
  Filter,
  ChevronDown,
  DollarSign,
  Tag,
  ShoppingCart,
  Plus,
  Zap,
  Star,
} from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const getImageUrl = (path) => {
  if (!path) return "https://via.placeholder.com/400x400?text=No+Image";
  if (path.startsWith("http")) return path;
  return `https://website-glassesstore.onrender.com${path}`;
};

const BACKENDURL = import.meta.env.VITE_BECKEND_API_URL||"http://localhost:5000/api";

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [dynamicFlavors, setDynamicFlavors] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const maxPriceFilter = parseInt(searchParams.get("maxPrice")) || 20000000;
  const categoryId = searchParams.get("category") || "";
  const searchTerm = searchParams.get("q") || "";
  const flavorFilter = searchParams.get("flavor") || "";

  useEffect(() => {
    axios
      .get(`${BACKENDURL}/categories`)
      .then((res) => setCategories(res.data))
      .catch((err) => console.log(err));
  }, []);

  // Reset danh sách khi bộ lọc thay đổi
  useEffect(() => {
    setProducts([]);
    setPage(1);
    setHasMore(true);
  }, [maxPriceFilter, categoryId, searchTerm, flavorFilter]);

  // Fetch sản phẩm
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // --- LOGIC MỚI: TỰ ĐỘNG RANDOM KHI Ở TRANG TẤT CẢ ---
        let sortType = "newest"; // Mặc định là mới nhất

        // Điều kiện: Không chọn danh mục AND Không tìm kiếm AND Không lọc thương hiệu
        if (!categoryId && !searchTerm && !flavorFilter) {
          sortType = "random";
        }
        // -------------------------------------------------------

        const params = {
          q: searchTerm || undefined,
          category: categoryId || undefined,
          flavor: flavorFilter || undefined,
          page: page,
          limit: 9,
          maxPrice: maxPriceFilter < 20000000 ? maxPriceFilter : undefined,
          sort: sortType, // Gửi tham số sort xuống Backend
        };

        const res = await axios.get(`${BACKENDURL}/products`, {
          params,
        });
        const newItems = res.data.items || [];

        if (page === 1) setProducts(newItems);
        else setProducts((prev) => [...prev, ...newItems]);

        if (page >= res.data.pages || newItems.length === 0) setHasMore(false);
        else setHasMore(true);
      } catch (err) {
        console.log("Lỗi tải sản phẩm:", err);
      } finally {
        setLoading(false);
      }
    };
    const t = setTimeout(fetchProducts, 300);
    return () => clearTimeout(t);
  }, [page, maxPriceFilter, categoryId, searchTerm, flavorFilter]);

  // Fetch danh sách thương hiệu từ server
  useEffect(() => {
    axios
      .get(`${BACKENDURL}/products/flavors`)
      .then((res) => setDynamicFlavors(res.data))
      .catch((err) => console.log(err));
  }, []);

  const handlePriceChange = (e) =>
    setSearchParams((prev) => {
      prev.set("maxPrice", e.target.value);
      return prev;
    });
  const handleCategoryChange = (id) =>
    setSearchParams((prev) => {
      if (id) prev.set("category", id);
      else prev.delete("category");
      return prev;
    });
  const handleFlavorChange = (flavor) =>
    setSearchParams((prev) => {
      if (flavor === flavorFilter) prev.delete("flavor");
      else prev.set("flavor", flavor);
      return prev;
    });
  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchParams((prev) => {
      if (val) prev.set("q", val);
      else prev.delete("q");
      return prev;
    });
  };

  const clearFilters = () => {
    setSearchParams({});
  };
  const handleLoadMore = () => setPage((prev) => prev + 1);

  const handleQuickAdd = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    const token = localStorage.getItem("ACCESS_TOKEN");
    if (!token) {
      if (window.confirm("Đăng nhập để mua hàng?")) navigate("/login");
      return;
    }
    setAddingId(product._id);
    try {
      await axios.post(
        `${BACKENDURL}/cart/add`,
        { productId: product._id, qty: 1, attrs: {} },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      window.dispatchEvent(new Event("CART_UPDATED"));
    } catch (err) {
      console.error(err);
      alert("Lỗi thêm giỏ hàng");
    } finally {
      setTimeout(() => setAddingId(null), 500);
    }
  };

  const formatCurrency = (n) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(n);

  return (
    <div className="bg-gray-50 min-h-screen font-sans flex flex-col">
      <div className="bg-blue-100 py-12 mb-8 text-center">
        <h1 className="text-5xl font-extrabold text-blue-700 mb-3 font-serif">
          Bộ sưu tập kính thời trang
        </h1>
        <p className="text-blue-500 text-lg">
          Tôn vinh phong cách, sắc nét từng ánh nhìn
        </p>
      </div>

      <div className="container mx-auto px-4 pb-16 flex-grow">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-1/4 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 sticky top-20">
              <div className="mb-8">
                <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                  <Filter className="w-5 h-5" /> Danh Mục
                </h3>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => handleCategoryChange("")}
                      className={`w-full px-3 py-2 rounded-lg flex justify-between ${categoryId === "" ? "bg-blue-50 text-blue-700 font-bold" : "hover:bg-gray-50"}`}
                    >
                      <span>Tất cả</span>
                      {categoryId === "" && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </button>
                  </li>
                  {categories.map((cat) => (
                    <li key={cat._id}>
                      <button
                        onClick={() => handleCategoryChange(cat._id)}
                        className={`w-full px-3 py-2 rounded-lg flex justify-between ${categoryId === cat._id ? "bg-blue-50 text-blue-700 font-bold" : "hover:bg-gray-50"}`}
                      >
                        <span>{cat.name}</span>
                        {categoryId === cat._id && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mb-8 border-t border-gray-100 pt-6">
                <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5" /> Thương Hiệu
                </h3>
                <ul className="space-y-2">
                  {/* Nút mặc định: Tất cả (xóa lọc thương hiệu) */}
                  <li>
                    <button
                      onClick={() => handleFlavorChange("")}
                      className={`w-full px-3 py-2 rounded-lg flex justify-between items-center ${
                        flavorFilter === ""
                          ? "bg-blue-50 text-blue-700 font-bold"
                          : "hover:bg-gray-50 text-gray-600"
                      }`}
                    >
                      <span>Tất cả</span>
                      {flavorFilter === "" && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </button>
                  </li>

                  {/* Map danh sách thương hiệu lấy từ API */}
                  {dynamicFlavors.map((flavor) => (
                    <li key={flavor}>
                      <button
                        onClick={() => handleFlavorChange(flavor)}
                        className={`w-full px-3 py-2 rounded-lg flex justify-between items-center ${
                          flavorFilter === flavor
                            ? "bg-blue-50 text-blue-700 font-bold"
                            : "hover:bg-gray-50 text-gray-600"
                        }`}
                      >
                        <span>{flavor}</span>
                        {flavorFilter === flavor && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" /> Giá Tiền
                </h3>
                <input
                  type="range"
                  min="0"
                  max="20000000"
                  step="20000"
                  value={maxPriceFilter}
                  onChange={handlePriceChange}
                  className="w-full accent-blue-500 cursor-pointer"
                />
                <p className="mt-2 text-center text-sm text-gray-700">
                  Giá dưới <b>{formatCurrency(maxPriceFilter)}</b>
                </p>
              </div>
            </div>
          </aside>

          <main className="w-full lg:w-3/4">
            <div className="mb-8 bg-white p-4 rounded-2xl shadow-sm border border-blue-100 flex items-center">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Bạn đang tìm loại kính gì..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
              </div>
            </div>

            {products.length === 0 && !loading ? (
              <div className="text-center py-24">
                <Search className="w-8 h-8 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Không tìm thấy sản phẩm nào</p>
                <button
                  className="text-blue-600 underline mt-3 hover:text-blue-800"
                  onClick={clearFilters}
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => {
                  const productSlug = product.slug || product?.slug?.current;
                  const img = getImageUrl(product?.images?.[0]?.url);
                  const isAdding = addingId === product._id;

                  // Logic Giá Flash Sale (Giữ nguyên)
                  const isFlashSale = product.isFlashSale;
                  const currentPrice = isFlashSale
                    ? product.flashSalePrice
                    : product.salePrice > 0
                      ? product.salePrice
                      : product.price;
                  const originalPrice = product.price;

                  return (
                    <Link
                      to={`/san-pham/${productSlug}`}
                      key={product._id}
                      className={`group bg-white p-3 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-transparent hover:border-blue-100 block relative overflow-hidden ${isFlashSale ? "ring-1 ring-orange-200" : ""}`}
                    >
                      <div className="h-60 rounded-xl overflow-hidden bg-gray-100 mb-4 relative">
                        <img
                          src={img}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/400x400?text=Error";
                          }}
                        />
                        {product.stock === 0 && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold uppercase backdrop-blur-[2px]">
                            Hết hàng
                          </div>
                        )}
                        {isFlashSale && (
                          <div className="absolute top-2 right-2 bg-yellow-400 text-red-700 text-xs font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1 animate-pulse z-10">
                            <Zap size={10} fill="currentColor" /> Sale
                          </div>
                        )}
                        {product.stock > 0 && (
                          <button
                            onClick={(e) => handleQuickAdd(e, product)}
                            disabled={isAdding}
                            className={`absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 transform ${isAdding ? "bg-white text-blue-500 opacity-100 scale-100" : "bg-white text-blue-600 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 hover:bg-blue-600 hover:text-white"}`}
                            title="Thêm nhanh vào giỏ"
                          >
                            {isAdding ? (
                              <Loader className="w-5 h-5 animate-spin" />
                            ) : (
                              <Plus className="w-6 h-6" />
                            )}
                          </button>
                        )}
                      </div>
                      <div className="px-2">
                        <h3 className="font-bold font-serif text-lg mb-1 text-gray-800 group-hover:text-blue-600 transition line-clamp-1">
                          {product.name}
                        </h3>
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                          <span className="font-medium line-clamp-1">
                            {product.flavor || "Thời trang"}
                          </span>

                          <div className="flex items-center gap-1">
                            <Star
                              size={14}
                              className="text-yellow-400 fill-yellow-400"
                            />

                            <span className="text-gray-700 font-medium">
                              {product.avgRating || "0.0"}
                            </span>

                            <span className="text-gray-400">
                              ({product.reviewCount || 0} đánh giá) 
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center">
                          {/* PRICE */}
                          <div className="flex flex-col">
                            <p
                              className={`text-xl font-bold ${
                                isFlashSale ? "text-red-600" : "text-dark-600"
                              }`}
                            >
                              {formatCurrency(currentPrice)}
                            </p>

                            {currentPrice < originalPrice && (
                              <span className="text-xs text-gray-400 line-through">
                                {formatCurrency(originalPrice)}
                              </span>
                            )}
                          </div>

                          {/* SPACER */}
                          <div className="flex-1" />

                          {/* ACTION BUTTONS */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={async (e) => {
                                e.preventDefault();
                                e.stopPropagation();

                                const token =
                                  localStorage.getItem("ACCESS_TOKEN");
                                if (!token) {
                                  navigate("/login");
                                  return;
                                }

                                try {
                                  await axios.post(
                                    `${BACKENDURL}/cart/add`,
                                    { productId: product._id, qty: 1 },
                                    {
                                      headers: {
                                        Authorization: `Bearer ${token}`,
                                      },
                                    },
                                  );

                                  window.dispatchEvent(
                                    new Event("CART_UPDATED"),
                                  );
                                  navigate("/cart");
                                } catch (err) {
                                  console.error("Lỗi Mua ngay:", err);
                                  alert(
                                    err.response?.data?.message ||
                                      "Không thể thêm vào giỏ hàng",
                                  );
                                }
                              }}
                              className="px-4 py-2 text-sm font-semibold rounded-full bg-blue-600 text-white hover:bg-blue-700 transition"
                            >
                              Mua ngay
                            </button>

                            <button className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 hover:bg-blue-100 transition">
                              <ShoppingCart size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            <div className="mt-12 text-center">
              {loading && (
                <div className="flex justify-center mb-4">
                  <Loader className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              )}
              {!loading && hasMore && products.length > 0 && (
                <button
                  onClick={handleLoadMore}
                  className="bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 font-bold py-3 px-8 rounded-full shadow-sm hover:shadow-md transition-all transform active:scale-95 flex items-center gap-2 mx-auto"
                >
                  Xem thêm sản phẩm <ChevronDown size={20} />
                </button>
              )}
              {!loading && !hasMore && products.length > 0 && (
                <p className="text-gray-400 italic">
                  Đã hiển thị tất cả sản phẩm
                </p>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
