import React, { useState, useEffect } from "react";
import {
  Star,
  Minus,
  Plus,
  ShoppingCart,
  ShieldCheck,
  Check,
  ChevronRight,
  Search,
  MessageSquare,
  User,
  Zap,
} from "lucide-react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const getImageUrl = (path) => {
  if (!path) return "https://via.placeholder.com/500x500?text=No+Image";
  if (path.startsWith("http")) return path;
  return `http://localhost:5000${path}`;
};

const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  // Review states
  const [reviews, setReviews] = useState([]);
  const [userRating, setUserRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewContent, setReviewContent] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    if (location.hash === "#reviews" && !loading && reviews) {
      const element = document.getElementById("reviews");
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 500);
      }
    }
  }, [location, loading, reviews]);

  useEffect(() => {
    const fetchProductData = async () => {
      if (!slug || slug === "undefined") {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(false);
      try {
        const res = await axios.get(
          `http://localhost:5000/api/products/slug/${slug}`,
        );
        setProduct(res.data);

        if (res.data && res.data.category) {
          const catId = res.data.category._id || res.data.category;
          const relatedRes = await axios.get(
            `http://localhost:5000/api/products`,
            {
              params: { category: catId, limit: 4 },
            },
          );
          setRelatedProducts(
            relatedRes.data.items.filter((p) => p._id !== res.data._id) || [],
          );
        }
      } catch (err) {
        console.error("Lỗi tải sản phẩm:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchProductData();
  }, [slug]);

  useEffect(() => {
    if (product?._id) {
      const fetchReviews = async () => {
        try {
          const res = await axios.get(
            `http://localhost:5000/api/reviews?productId=${product._id}`,
          );
          setReviews(res.data);
        } catch (err) {
          console.error("Lỗi tải review:", err);
        }
      };
      fetchReviews();
    }
  }, [product]);

  const handleAddToCart = async () => {
    const token = localStorage.getItem("ACCESS_TOKEN");
    if (!token) {
      if (
        window.confirm(
          "Bạn cần đăng nhập để mua hàng. Đi đến trang đăng nhập ngay?",
        )
      )
        navigate("/login");
      return;
    }
    setAddingToCart(true);
    try {
      await axios.post(
        "http://localhost:5000/api/cart/add",
        {
          productId: product._id,
          qty: quantity,
          attrs: {},
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      window.dispatchEvent(new Event("CART_UPDATED"));
      alert(
        `Đã thêm thành công ${quantity} chiếc "${product.name}" vào giỏ hàng!`,
      );
    } catch (err) {
      console.error(err);
      alert("Lỗi: Không thể thêm vào giỏ hàng.");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("ACCESS_TOKEN");
    if (!token) {
      alert("Bạn cần đăng nhập để đánh giá!");
      navigate("/login");
      return;
    }
    if (userRating === 0) {
      alert("Vui lòng chọn số sao!");
      return;
    }

    setSubmittingReview(true);
    try {
      await axios.post(
        "http://localhost:5000/api/reviews",
        {
          productId: product._id,
          rating: userRating,
          title: reviewTitle,
          content: reviewContent,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      alert("Cảm ơn bạn đã đánh giá!");
      setUserRating(0);
      setReviewTitle("");
      setReviewContent("");
      const res = await axios.get(
        `http://localhost:5000/api/reviews?productId=${product._id}`,
      );
      setReviews(res.data);
    } catch (err) {
      alert(
        "Lỗi: " + (err.response?.data?.message || "Không thể gửi đánh giá"),
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  if (error || !product)
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-4 bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-sm">
          <h2 className="text-2xl font-bold">Không tìm thấy sản phẩm</h2>
          <Link to="/san-pham" className="text-blue-600 mt-4 block">
            Quay lại
          </Link>
        </div>
      </div>
    );

  const images =
    product.images && product.images.length > 0
      ? product.images
      : [{ url: "" }];
  const mainImage = getImageUrl(images[selectedImageIndex]?.url);

  // LOGIC TÍNH GIÁ (Ưu tiên Flash Sale -> Sale thường -> Giá gốc)
  const isFlashSale = product.isFlashSale;
  const currentPrice = isFlashSale
    ? product.flashSalePrice
    : product.salePrice > 0
      ? product.salePrice
      : product.price;
  const originalPrice = product.price;
  const discountPercent = Math.round(
    ((originalPrice - currentPrice) / originalPrice) * 100,
  );

  return (
    <div className="bg-gray-50 min-h-screen font-sans text-gray-800 flex flex-col">
      <div className="bg-white border-b border-gray-100 sticky top-16 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-3 text-sm text-gray-500 flex items-center gap-2 overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-blue-600">
            Trang chủ
          </Link>{" "}
          <ChevronRight size={14} />
          <Link to="/san-pham" className="hover:text-blue-600">
            Sản phẩm
          </Link>{" "}
          <ChevronRight size={14} />
          <span className="text-gray-900 font-medium truncate">
            {product.name}
          </span>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-blue-50">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
            {/* LEFT: Images */}
            <div className="w-full lg:w-1/2 space-y-4">
              <div className="aspect-square max-w-[550px] mx-auto rounded-3xl overflow-hidden bg-gray-50 relative group border border-gray-200 shadow-sm">
                <img
                  src={mainImage}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/500x500?text=No+Image";
                  }}
                />

                {/* BADGE SALE */}
                {isFlashSale ? (
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-300 to-orange-400 text-red-800 text-sm font-extrabold px-4 py-1.5 rounded-full shadow-md flex items-center gap-1 animate-pulse">
                    <Zap size={14} fill="currentColor" /> Flash Sale -
                    {discountPercent}%
                  </div>
                ) : (
                  product.salePrice > 0 &&
                  product.salePrice < product.price && (
                    <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                      -{discountPercent}%
                    </div>
                  )
                )}
              </div>

              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-blue-300 justify-center">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                        selectedImageIndex === idx
                          ? "border-blue-600 ring-2 ring-blue-200 scale-105"
                          : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={getImageUrl(img.url)}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/100?text=Error";
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT: Info */}
            <div className="w-full lg:w-1/2 flex flex-col">
              {/* CATEGORY */}
              <div className="mb-4 text-sm">
                Danh mục:
                {product.category && (
                  <span className="ml-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold uppercase tracking-wide hover:bg-blue-200 transition">
                    <Link to={`/san-pham?category=${product.category._id}`}>
                      {product.category.name}
                    </Link>
                  </span>
                )}
              </div>

              {/* NAME */}
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
                {product.name}
              </h1>

              {/* PRICE BOX */}
              <div
                className={`mb-8 rounded-3xl border overflow-hidden ${
                  isFlashSale
                    ? "bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200"
                    : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100"
                }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-2">
                  {/* LEFT – PRICE */}
                  <div className="p-5 border-b md:border-b-0 md:border-r border-gray-200">
                    <p className="text-sm font-semibold text-gray-500 mb-1">
                      Giá bán
                    </p>

                    <div className="flex items-end gap-3 flex-wrap">
                      <span
                        className={`text-2xl font-extrabold ${
                          isFlashSale ? "text-red-600" : "text-gray-900"
                        }`}
                      >
                        {currentPrice.toLocaleString()}đ
                      </span>

                      {currentPrice < originalPrice && (
                        <span className="text-lg text-gray-400 line-through">
                          {originalPrice.toLocaleString()}đ
                        </span>
                      )}
                    </div>

                    {isFlashSale && (
                      <div className="mt-2 text-sm font-semibold text-orange-600 flex items-center gap-1">
                        <Zap size={14} /> Flash Sale đang diễn ra
                      </div>
                    )}
                  </div>

                  {/* RIGHT – BRAND */}
                  <div className="p-5">
                    <p className="text-sm font-semibold text-gray-500 mb-1">
                      Thương hiệu
                    </p>

                    <p className="text-gray-900 font-bold break-words text-2xl uppercase">
                      {product.flavor || "Đang cập nhật thương hiệu"}
                    </p>
                  </div>
                </div>
              </div>    

              {/* DESCRIPTION */}
              <div className="mb-8 p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
                <p className="text-sm font-semibold text-gray-500 mb-2">
                  Mô tả sản phẩm
                </p>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line break-words">
                  {product.description ||
                    "Đang cập nhật mô tả chi tiết sản phẩm..."}
                </p>
              </div>

              {/* STOCK */}
              <div className="mb-6">
                {product.stock > 0 ? (
                  <div className="inline-flex items-center gap-2 text-green-700 font-semibold bg-green-100 px-4 py-1.5 rounded-full">
                    <Check size={18} /> Còn {product.stock} sản phẩm
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 text-red-600 font-semibold bg-red-100 px-4 py-1.5 rounded-full">
                    <ShieldCheck size={18} /> Tạm hết hàng
                  </div>
                )}
              </div>

              {/* ACTIONS */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100">
                <div className="flex items-center border border-gray-300 rounded-2xl bg-white h-12 shadow-sm">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={product.stock === 0}
                    className="px-4 h-full hover:bg-gray-100 text-gray-600 rounded-l-2xl disabled:opacity-50"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-12 text-center font-bold text-lg">
                    {product.stock === 0 ? 0 : quantity}
                  </span>
                  <button
                    onClick={() => {
                      if (quantity < product.stock) setQuantity(quantity + 1);
                      else alert(`Chỉ còn ${product.stock} sản phẩm!`);
                    }}
                    disabled={quantity >= product.stock || product.stock === 0}
                    className="px-4 h-full hover:bg-gray-100 text-gray-600 rounded-r-2xl disabled:opacity-50"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart || product.stock === 0}
                  className={`flex-1 h-12 font-bold rounded-2xl flex items-center justify-center gap-2 transition-all
        ${
          product.stock === 0
            ? "bg-gray-400 text-white cursor-not-allowed"
            : addingToCart
              ? "bg-blue-400 text-white cursor-wait"
              : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:brightness-110 active:scale-[0.98] shadow-lg shadow-blue-200"
        }`}
                >
                  <ShoppingCart size={20} /> Thêm vào giỏ hàng
                </button>
              </div>
            </div>
          </div>

          <div
            id="reviews"
            className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-12 border-t border-gray-100 pt-12"
          >
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <MessageSquare className="text-blue-600" /> Đánh giá từ khách
                hàng
              </h3>
              {reviews.length === 0 ? (
                <p className="text-gray-500 italic">Chưa có đánh giá nào.</p>
              ) : (
                <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                  {reviews.map((rv) => (
                    <div
                      key={rv._id}
                      className="border-b border-gray-100 pb-6 last:border-0"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold">
                            <User size={20} />
                          </div>
                          <div>
                            <div className="font-bold text-gray-800">
                              {rv.user?.name || "Khách hàng"}
                            </div>
                            <div className="text-xs text-gray-400">
                              {new Date(rv.createdAt).toLocaleDateString(
                                "vi-VN",
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex bg-yellow-50 px-2 py-1 rounded-lg">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={
                                i < rv.rating
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300"
                              }
                            />
                          ))}
                        </div>
                      </div>
                      {rv.title && (
                        <h4 className="font-bold text-gray-700 text-sm mb-1">
                          {rv.title}
                        </h4>
                      )}
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {rv.content}
                      </p>
                      {rv.adminResponse && (
                        <div className="mt-3 ml-4 bg-gray-50 p-3 rounded-lg border-l-4 border-blue-400">
                          <p className="text-xs font-bold text-blue-600 mb-1">
                            Phản hồi từ cửa hàng:
                          </p>
                          <p className="text-sm text-gray-600">
                            {rv.adminResponse}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="bg-blue-50/50 p-8 rounded-2xl border border-blue-100 h-fit">
              <h3 className="text-xl font-bold text-gray-800 mb-6">
                Viết nhận xét của bạn
              </h3>
              <form onSubmit={handleSubmitReview}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bạn chấm mấy sao?
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setUserRating(star)}
                        className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                      >
                        <Star
                          size={32}
                          className={
                            star <= userRating
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                          }
                          strokeWidth={1.5}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiêu đề
                  </label>
                  <input
                    type="text"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 bg-white"
                    placeholder="Tóm tắt ngắn gọn..."
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nội dung
                  </label>
                  <textarea
                    rows="4"
                    value={reviewContent}
                    onChange={(e) => setReviewContent(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 bg-white"
                    placeholder="Chia sẻ cảm nhận..."
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 disabled:opacity-50"
                >
                  {submittingReview ? "Đang gửi..." : "Gửi Đánh Giá"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetailPage;
