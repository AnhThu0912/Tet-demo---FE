import { Product } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface CartItem {
  productId: number;
  quantity: number;
  product: Product;
  lineTotal: number;
}

export interface CartSummary {
  totalItems: number;
  totalQuantity: number;
  totalPrice: number;
}

export interface CartData {
  items: CartItem[];
  summary: CartSummary;
}

/**
 * Lấy thông tin giỏ hàng
 */
export const getCart = async (): Promise<CartData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/cart`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const json = await response.json();
    const cartData: unknown = (json as ApiResponse<CartData>)?.data ?? json;
    
    if (cartData && typeof cartData === 'object' && 'items' in cartData) {
      return cartData as CartData;
    } else {
      throw new Error('Unexpected cart response shape');
    }
  } catch (error) {
    console.error('Error fetching cart:', error);
    throw error;
  }
};

/**
 * Thêm/Update sản phẩm vào giỏ hàng
 */
export const addToCart = async (productId: number, quantity: number): Promise<CartData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/cart/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
      body: JSON.stringify({
        productId,
        quantity,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const json = await response.json();
    const cartData: unknown = (json as ApiResponse<CartData>)?.data ?? json;
    
    if (cartData && typeof cartData === 'object' && 'items' in cartData) {
      return cartData as CartData;
    } else {
      throw new Error('Unexpected cart response shape');
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

/**
 * Cập nhật số lượng sản phẩm trong giỏ hàng
 */
export const updateCartItem = async (productId: number, quantity: number): Promise<CartData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/cart/items/${productId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
      body: JSON.stringify({
        quantity,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const json = await response.json();
    const cartData: unknown = (json as ApiResponse<CartData>)?.data ?? json;
    
    if (cartData && typeof cartData === 'object' && 'items' in cartData) {
      return cartData as CartData;
    } else {
      throw new Error('Unexpected cart response shape');
    }
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw error;
  }
};

/**
 * Xóa sản phẩm khỏi giỏ hàng
 */
export const removeCartItem = async (productId: number): Promise<CartData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/cart/items/${productId}`, {
      method: 'DELETE',
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const json = await response.json();
    const cartData: unknown = (json as ApiResponse<CartData>)?.data ?? json;
    
    if (cartData && typeof cartData === 'object' && 'items' in cartData) {
      return cartData as CartData;
    } else {
      throw new Error('Unexpected cart response shape');
    }
  } catch (error) {
    console.error('Error removing cart item:', error);
    throw error;
  }
};
