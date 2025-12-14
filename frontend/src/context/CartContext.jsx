import React, { createContext, useState, useEffect, useContext } from 'react';
import cartItemApi from '../api/cartItemApi';

// 1. Tạo Context
const CartContext = createContext();

// 2. Tạo Provider
export const CartProvider = ({ children }) => {
    const [cartCount, setCartCount] = useState(0);

    // Hàm gọi API để lấy số lượng mới nhất
    const fetchCartCount = async () => {
        try {
            // Kiểm tra nếu chưa login thì thôi (hoặc lấy từ localStorage nếu làm giỏ hàng offline)
            const token = localStorage.getItem('accessToken');
            if (!token) {
                setCartCount(0);
                return;
            }

            const res = await cartItemApi.getMyCart();
            // Backend trả về res.cart_summary.total_items (dựa trên code CartPage trước đó)
            setCartCount(res.cart_summary?.total_items || 0);
        } catch (error) {
            console.error("Lỗi lấy số lượng giỏ hàng", error);
        }
    };

    // Gọi 1 lần khi web vừa load
    useEffect(() => {
        fetchCartCount();
    }, []);

    return (
        <CartContext.Provider value={{ cartCount, fetchCartCount }}>
            {children}
        </CartContext.Provider>
    );
};

// 3. Hook để dùng nhanh ở các component khác
export const useCart = () => useContext(CartContext);