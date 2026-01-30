import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { CheckCircle, XCircle, ShoppingBag, ArrowRight } from "lucide-react";

const OrderSuccess = () => {
  const location = useLocation();
  const [status, setStatus] = useState("loading");
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    // Lấy các tham số từ URL mà Backend redirect về
    const query = new URLSearchParams(location.search);
    const responseCode = query.get("vnp_ResponseCode");
    const txnRef = query.get("vnp_TxnRef");

    setOrderId(txnRef);

    if (responseCode === "00") {
      setStatus("success");
    } else {
      setStatus("error");
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
        {status === "success" ? (
          <>
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 p-4 rounded-full">
                <CheckCircle size={60} className="text-green-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Thanh toán thành công!
            </h1>
            <p className="text-gray-500 mb-6">
              Cảm ơn bạn đã tin tưởng. Đơn hàng <strong>#{orderId}</strong> của
              bạn đang được xử lý.
            </p>
          </>
        ) : (
          <>
            <div className="flex justify-center mb-6">
              <div className="bg-red-100 p-4 rounded-full">
                <XCircle size={60} className="text-red-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Thanh toán thất bại
            </h1>
            <p className="text-gray-500 mb-6">
              Giao dịch không thành công hoặc đã bị hủy. Vui lòng kiểm tra lại
              phương thức thanh toán.
            </p>
          </>
        )}

        <div className="space-y-3">
          <Link
            to={status === "success" ? `/order/${orderId}` : "/checkout"}
            className="w-full py-3 px-6 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all"
          >
            {status === "success"
              ? "Xem chi tiết đơn hàng"
              : "Thử lại thanh toán"}
            <ArrowRight size={18} />
          </Link>

          <Link
            to="/"
            className="w-full py-3 px-6 bg-gray-100 text-gray-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-all"
          >
            <ShoppingBag size={18} /> Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
