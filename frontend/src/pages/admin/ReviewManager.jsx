import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Star,
  Check,
  Trash2,
  MessageSquare,
  CornerDownRight,
  Eye,
  EyeOff,
} from "lucide-react";

//  HÀM XỬ LÝ ẢNH (FINAL VERSION): Xử lý mọi trường hợp
const getImageUrl = (product) => {
  if (!product) return "https://placehold.co/150?text=No+Product";
  let path = product.image || (product.images && product.images[0]);
  if (typeof path === "object" && path?.url) path = path.url;
  if (!path) return "https://placehold.co/150?text=No+Img";
  if (path.startsWith("http")) return path;
  path = path.replace(/\\/g, "/");
  if (!path.startsWith("/")) path = "/" + path;
  if (!path.startsWith("/uploads")) {
    path = "/uploads" + path;
  }
  return `https://website-glassesstore.onrender.com${path}`;
};

const BACKENDURL = import.meta.env.VITE_BECKEND_API_URL||"http://localhost:5000/api";

const ReviewManager = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState({});

  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem("ACCESS_TOKEN");
      const res = await axios.get(
        `${BACKENDURL}/reviews/admin/all`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setReviews(res.data);
    } catch (error) {
      console.error("Lỗi tải reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleToggleApprove = async (id) => {
    try {
      const token = localStorage.getItem("ACCESS_TOKEN");
      await axios.put(
        `${BACKENDURL}/reviews/${id}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      fetchReviews();
    } catch (error) {
      alert("Lỗi cập nhật trạng thái", error);
    }
  };

  // const handleDelete = async (id) => {
  //   if (!window.confirm("Bạn chắc chắn muốn xóa đánh giá này?")) return;
  //   try {
  //     const token = localStorage.getItem("ACCESS_TOKEN");
  //     await axios.delete(`${BACKENDURL}/reviews/${id}`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     setReviews(reviews.filter((r) => r._id !== id));
  //   } catch (error) {
  //     alert("Lỗi khi xóa", error);
  //   }
  // };

  const handleReply = async (id) => {
    if (!replyText[id]) return alert("Vui lòng nhập nội dung trả lời");
    try {
      const token = localStorage.getItem("ACCESS_TOKEN");
      await axios.put(
        `${BACKENDURL}/reviews/${id}/reply`,
        { response: replyText[id] },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      alert("Đã trả lời thành công!");
      fetchReviews();
      setReplyText({ ...replyText, [id]: "" });
    } catch (error) {
      alert("Lỗi khi gửi câu trả lời", error);
    }
  };

  // 1. Lọc theo trạng thái phản hồi
  const filteredReviews = reviews.filter((r) => {
    if (filterStatus === "replied") return !!r.adminResponse;
    if (filterStatus === "not_replied") return !r.adminResponse;
    return true;
  });

  // 2. Tính toán phân trang
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredReviews.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500">Đang tải đánh giá...</div>
    );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Star className="text-yellow-500" /> Quản Lý Đánh Giá & Bình Luận
      </h2>

      <div className="flex flex-wrap gap-2 mb-6 border-b pb-4">
        {[
          { id: "all", label: "Tất cả" },
          { id: "not_replied", label: "Chưa phản hồi" },
          { id: "replied", label: "Đã phản hồi" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setFilterStatus(tab.id);
              setCurrentPage(1); // Reset về trang 1 khi lọc
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              filterStatus === tab.id
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {currentItems.length > 0 ? (
          currentItems.map((review) => (
            <div
              key={review._id}
              className={`p-4 rounded-lg border transition ${review.approved ? "border-gray-200 bg-white" : "border-red-200 bg-red-50"}`}
            >
              <div className="flex flex-col md:flex-row gap-4">
                {/*  PHẦN HIỂN THỊ ẢNH */}
                <div className="w-20 h-20 flex-shrink-0 border border-gray-200 rounded-md overflow-hidden bg-gray-50">
                  <img
                    // Truyền nguyên OBJECT product vào hàm
                    src={getImageUrl(review.product)}
                    alt={review.product?.name || "Sản phẩm"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://placehold.co/150?text=No+Img";
                    }}
                  />
                </div>

                {/* Phần nội dung review */}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-gray-800">
                        {review.product?.name || "Sản phẩm đã xóa"}
                      </h4>
                      <div className="text-sm text-gray-500 mb-1">
                        Bởi:{" "}
                        <span className="font-medium text-gray-700">
                          {review.user?.name}
                        </span>{" "}
                        •{" "}
                        {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                      </div>
                    </div>

                    <span
                      className={`px-2 py-1 text-xs rounded-full border ${review.approved ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"}`}
                    >
                      {review.approved ? "Đang hiện" : "Đang ẩn"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-yellow-400 my-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        fill={i < review.rating ? "currentColor" : "none"}
                        className={i < review.rating ? "" : "text-gray-300"}
                      />
                    ))}
                    <span className="text-gray-600 text-sm ml-2 font-medium">
                      "{review.title}"
                    </span>
                  </div>

                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg text-sm">
                    {review.content}
                  </p>

                  <div className="mt-3 ml-4 pl-4 border-l-2 border-gray-200">
                    {review.adminResponse ? (
                      <div className="text-sm">
                        <div className="flex items-center gap-2 font-bold text-blue-600 mb-1">
                          <CornerDownRight size={16} /> Phản hồi của Shop:
                        </div>
                        <p className="text-gray-600 bg-blue-50 p-2 rounded">
                          {review.adminResponse}
                        </p>
                      </div>
                    ) : (
                      <div className="flex gap-2 mt-2">
                        <input
                          type="text"
                          className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-blue-500"
                          placeholder="Nhập câu trả lời..."
                          value={replyText[review._id] || ""}
                          onChange={(e) =>
                            setReplyText({
                              ...replyText,
                              [review._id]: e.target.value,
                            })
                          }
                        />
                        <button
                          onClick={() => handleReply(review._id)}
                          className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 flex items-center gap-1"
                        >
                          <MessageSquare size={16} /> Trả lời
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end gap-3">
                <button
                  onClick={() => handleToggleApprove(review._id)}
                  className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded transition ${review.approved ? "text-gray-500 hover:bg-gray-100" : "hover:text-white-600 hover:bg-green-300"}`}
                >
                  {review.approved ? (
                    <>
                      <EyeOff size={16} className="text-red-500" />
                      <span className="text-red-500">Ẩn đánh giá</span>
                    </>
                  ) : (
                    <>
                      <Eye size={16} className="text-green-500" />{" "}
                      <span className="text-green-500">Duyệt hiển thị</span>
                    </>
                  )}
                </button>
                {/* <button
                  onClick={() => handleDelete(review._id)}
                  className="flex items-center gap-1 text-sm px-3 py-1.5 rounded text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={16} /> Xóa
                </button> */}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-gray-400">
            Chưa có đánh giá nào.
          </div>
        )}
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8 pt-6 border-t">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50 text-sm"
          >
            Trước
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-8 h-8 rounded text-sm font-medium ${
                currentPage === i + 1
                  ? "bg-blue-600 text-white"
                  : "border hover:bg-gray-50"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50 text-sm"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewManager;
