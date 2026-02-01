import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  MessageSquare,
  Send,
  ShieldCheck,
  Loader,
  MapPin,
  Phone,
  Mail,
  Trash2,
  Image as ImageIcon,
  X,
  Store,
} from "lucide-react";

const BACKENDURL = import.meta.env.VITE_BECKEND_API_URL||"http://localhost:5000/api";

const ContactPage = () => {
  // State
  const [contacts, setContacts] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [chatInput, setChatInput] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);

  const token = localStorage.getItem("ACCESS_TOKEN");
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (token) fetchMyHistory();
    else setLoadingList(false);
  }, [token]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [selectedTicket?.conversation, selectedTicket]);

  const fetchMyHistory = async () => {
    try {
      const res = await axios.get(
        `${BACKENDURL}/contacts/my-history`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = res.data.data;
      setContacts(data);
      // Tự động chọn hội thoại đầu tiên nếu có
      if (data.length > 0 && !selectedTicket) {
        setSelectedTicket(data[0]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingList(false);
    }
  };

  const handleSelectTicket = async (ticket) => {
    setSelectedTicket(ticket);
    if (ticket.isReadByUser === false) {
      try {
        await axios.put(
          `${BACKENDURL}/contacts/${ticket._id}/read`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setContacts((prev) =>
          prev.map((c) =>
            c._id === ticket._id ? { ...c, isReadByUser: true } : c,
          ),
        );
      } catch (error) {
        console.error("Lỗi mark read", error);
      }
    }
  };

  // Tạo hội thoại mới khi chưa có gì
  const handleStartChat = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${BACKENDURL}/contacts`,
        { message: "Xin chào DHD - GlassesShop, mình cần hỗ trợ!" },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const newTicket = res.data.data;
      setContacts([newTicket, ...contacts]);
      setSelectedTicket(newTicket);
    } catch (error) {
      alert("Lỗi khởi tạo chat", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return alert("File quá lớn (Max 5MB)");
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!chatInput.trim() && !selectedFile) || !selectedTicket) return;
    const formData = new FormData();
    formData.append("message", chatInput);
    if (selectedFile) formData.append("image", selectedFile);

    try {
      const res = await axios.put(
        `${BACKENDURL}/contacts/${selectedTicket._id}/chat`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );
      const updatedTicket = res.data.data;
      setSelectedTicket(updatedTicket);
      const updatedList = contacts.map((c) =>
        c._id === updatedTicket._id ? updatedTicket : c,
      );
      setContacts(
        updatedList.sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
        ),
      );
      setChatInput("");
      clearSelectedFile();
    } catch (error) {
      alert("Lỗi gửi tin nhắn", error);
    }
  };

  const getImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `http://localhost:5000${path.startsWith("/") ? "" : "/"}${path}`;
  };

  const InfoCard = ({ icon: IconComponent, title, desc, color }) => {
    return (
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${color} text-white shadow-sm`}
        >
          <IconComponent size={18} />
        </div>
        <div>
          <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
          <p className="text-gray-500 text-xs">{desc}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FDF8F6] font-sans text-gray-800">
      {/* Header rút gọn */}
      <div className="bg-white border-b border-gray-100 py-6 px-4 mb-6 shadow-sm">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InfoCard
              icon={MapPin}
              title="Cửa hàng"
              desc="126 Nguyễn Thiện Thành, Hòa Thuận, Vĩnh Lonng"
              color="bg-red-500"
            />
            <InfoCard
              icon={Phone}
              title="Hotline"
              desc="0999 999 999"
              color="bg-orange-400"
            />
            <InfoCard
              icon={Mail}
              title="Hỗ trợ"
              desc="contact@dhdglassesshop.com"
              color="bg-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 pb-10">
        {!token ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-200">
            <p className="text-gray-500 mb-4">
              Vui lòng đăng nhập để nhắn tin với DHD - GlassesShop.
            </p>
            <a
              href="/login"
              className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-700 transition"
            >
              Đăng nhập
            </a>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col md:flex-row h-[70vh]">
            {/* --- DANH SÁCH CHAT --- */}
            <div className="w-full md:w-80 border-r border-gray-100 flex flex-col bg-gray-50">
              <div className="p-4 border-b border-gray-200 bg-white">
                <h2 className="font-bold text-gray-800 flex items-center gap-2">
                  <MessageSquare size={18} className="text-blue-600" /> Tin nhắn
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {loadingList ? (
                  <div className="text-center py-10">
                    <Loader className="animate-spin inline text-blue-500" />
                  </div>
                ) : contacts.length === 0 ? (
                  <div className="text-center py-10 px-4">
                    <p className="text-gray-400 text-xs mb-4">
                      Bạn chưa có hội thoại nào
                    </p>
                    <button
                      onClick={handleStartChat}
                      disabled={loading}
                      className={`text-xs px-4 py-2 rounded-lg font-bold text-white transition 
                            ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}
                        `}
                    >
                      {loading ? "Đang tạo..." : "Bắt đầu cuộc hội thoại"}
                    </button>
                  </div>
                ) : (
                  contacts.map((ticket) => {
                    const lastMsg =
                      ticket.conversation[ticket.conversation.length - 1];
                    const isUnread = !ticket.isReadByUser;

                    return (
                      <div
                        key={ticket._id}
                        onClick={() => handleSelectTicket(ticket)}
                        className={`p-3 rounded-xl cursor-pointer transition flex items-center gap-3 ${
                          selectedTicket?._id === ticket._id
                            ? "bg-blue-50 text-blue-700"
                            : "hover:bg-white hover:shadow-sm"
                        }`}
                      >
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 border border-blue-200 flex-shrink-0">
                          <Store size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <h4
                              className={`text-sm truncate ${isUnread ? "font-bold text-gray-900" : "font-semibold text-gray-600"}`}
                            >
                              DHD - GlassesShop
                            </h4>
                            {isUnread && (
                              <span className="bg-blue-500 w-2 h-2 rounded-full"></span>
                            )}
                          </div>
                          <p
                            className={`text-xs truncate ${isUnread ? "font-bold text-gray-800" : "text-gray-400"}`}
                          >
                            {lastMsg?.message || "Đã gửi một ảnh"}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* --- KHUNG CHAT --- */}
            <div className="flex-1 flex flex-col bg-white">
              {selectedTicket ? (
                <>
                  {/* Header Shop */}
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white z-10 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-sm">
                        <Store size={22} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-base flex items-center gap-1">
                          DHD - GlassesShop{" "}
                          <ShieldCheck size={14} className="text-blue-500" />
                        </h3>
                        <p className="text-[10px] text-green-500 font-bold">
                          Đang trực tuyến
                        </p>
                      </div>
                    </div>
                    {/* <button onClick={() => handleDeleteTicket(selectedTicket._id)} className="text-gray-300 hover:text-red-500 p-2 transition"><Trash2 size={18} /></button> */}
                  </div>

                  {/* Nội dung chat */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FDF8F6]/30">
                    {selectedTicket.conversation.map((msg, idx) => {
                      const isMe = msg.sender === "user";
                      return (
                        <div
                          key={idx}
                          className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[75%] ${isMe ? "bg-blue-600 text-white rounded-2xl rounded-tr-none shadow-blue-100" : "bg-white text-gray-700 border border-gray-100 rounded-2xl rounded-tl-none shadow-sm"} p-3 shadow-sm`}
                          >
                            {msg.image && (
                              <img
                                src={getImageUrl(msg.image)}
                                alt="sent"
                                className="max-w-full h-auto rounded-lg mb-2"
                                onClick={() =>
                                  window.open(getImageUrl(msg.image), "_blank")
                                }
                              />
                            )}
                            {msg.message && (
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                {msg.message}
                              </p>
                            )}
                            <div
                              className={`text-[9px] mt-1 opacity-60 ${isMe ? "text-right" : "text-left"}`}
                            >
                              {new Date(msg.timestamp).toLocaleTimeString(
                                "vi-VN",
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Input */}
                  <div className="p-3 bg-white border-t border-gray-100">
                    {previewUrl && (
                      <div className="pb-2 flex">
                        <div className="relative">
                          <img
                            src={previewUrl}
                            alt="preview"
                            className="h-14 w-auto rounded-lg border border-blue-200 shadow-sm"
                          />
                          <button
                            onClick={clearSelectedFile}
                            className="absolute -top-2 -right-2 bg-gray-500 text-white rounded-full p-0.5"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      </div>
                    )}
                    <form
                      onSubmit={handleSendMessage}
                      className="flex gap-2 items-center bg-gray-50 p-1 rounded-full border border-gray-200"
                    >
                      <button
                        type="button"
                        onClick={() => fileInputRef.current.click()}
                        className="p-2 text-gray-400 hover:text-blue-600 transition"
                      >
                        <ImageIcon size={20} />
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileSelect}
                      />
                      <input
                        type="text"
                        className="flex-1 px-4 py-2 bg-transparent outline-none text-sm"
                        placeholder="Nhắn tin cho shop..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                      />
                      <button
                        type="submit"
                        disabled={!chatInput.trim() && !selectedFile}
                        className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition disabled:bg-gray-300"
                      >
                        <Send size={18} />
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                  <MessageSquare size={48} className="mb-2 text-blue-100" />
                  <p className="text-sm">
                    Hãy chọn bắt đầu cuộc hội thoại để nhắn tin
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactPage;
