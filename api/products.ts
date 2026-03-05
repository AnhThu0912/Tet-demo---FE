import { Product, Category } from '../types';

import { API_BASE_URL } from "../config/env";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

const DEFAULT_PRODUCT: Product = {
  id: 0,
  name: '',
  price: 0,
  category: Category.FOOD,
  isActive: true,
  image: '',
};

/**
 * Chuẩn hóa 1 product từ API (backend có thể trả is_active snake_case hoặc giá trị 1/0, "true"/"false").
 * Trả về product mặc định nếu raw null/undefined (tránh lỗi khi API cart không trả về object product).
 */
export function normalizeProduct(raw: Record<string, unknown> | null | undefined): Product {
  if (raw == null || typeof raw !== 'object') {
    return { ...DEFAULT_PRODUCT };
  }
  const isActiveRaw = raw.isActive ?? raw.is_active;
  const isActive = isActiveRaw === true || isActiveRaw === 1 || isActiveRaw === 'true' || isActiveRaw === '1';
  // Backend có thể trả price / unit_price / unit_price_per_item (snake_case)
  const price = Number(
    raw.price ?? raw.unit_price ?? (raw as Record<string, unknown>).unit_price_per_item ?? 0
  );
  return {
    id: Number(raw.id ?? 0),
    name: String(raw.name ?? ''),
    price,
    category: (raw.category as Category) ?? Category.FOOD,
    isActive: Boolean(isActive),
    image: String(raw.image ?? ''),
  };
}

function normalizeProductList(list: unknown[]): Product[] {
  return list.map((item) => normalizeProduct(item as Record<string, unknown>));
}

/**
 * Lấy danh sách tất cả sản phẩm
 */
export const getProducts = async (): Promise<Product[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products`, {
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
    
    // Backend có thể trả về:
    // 1) { success: true, data: Product[], message: string }
    // 2) { success: true, data: { items: Product[], meta: ... }, message: string }
    // 3) hoặc trả về trực tiếp mảng Product[]
    const dataField: unknown = (json as ApiResponse<unknown>)?.data ?? json;
    const productsList: unknown =
      Array.isArray(dataField)
        ? dataField
        : (dataField as any)?.items ?? dataField;

    if (Array.isArray(productsList)) {
      return normalizeProductList(productsList);
    }

    console.error('Unexpected products response shape:', json);
    throw new Error('Unexpected products response shape: response is not an array');
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

/**
 * Lấy chi tiết sản phẩm theo ID
 */
export const getProductById = async (id: number): Promise<Product> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
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
    
    // Backend có thể trả về: { success: true, data: Product, message: string }
    // hoặc trả về trực tiếp Product
    const product: unknown = (json as ApiResponse<Product>)?.data ?? json;
    
    if (product && typeof product === 'object' && 'id' in product) {
      return normalizeProduct(product as Record<string, unknown>);
    } else {
      throw new Error('Unexpected product response shape: response is not a valid product');
    }
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    throw error;
  }
};

export interface GetProductsParams {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

/**
 * Lấy danh sách sản phẩm với các tham số tùy chọn (filter theo giá, phân trang)
 */
export const getProductsWithParams = async (params: GetProductsParams = {}): Promise<Product[]> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.q) {
      queryParams.append('q', params.q);
    }
    if (params.category) {
      queryParams.append('category', params.category);
    }
    if (params.minPrice !== undefined) {
      queryParams.append('minPrice', params.minPrice.toString());
    }
    if (params.maxPrice !== undefined) {
      queryParams.append('maxPrice', params.maxPrice.toString());
    }
    if (params.page !== undefined) {
      queryParams.append('page', params.page.toString());
    }
    if (params.limit !== undefined) {
      queryParams.append('limit', params.limit.toString());
    }
    
    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/products${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
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
    
    // Backend có thể trả về:
    // 1) { success: true, data: Product[], message: string }
    // 2) { success: true, data: { items: Product[], meta: ... }, message: string }
    // 3) hoặc trả về trực tiếp mảng Product[]
    const dataField: unknown = (json as ApiResponse<unknown>)?.data ?? json;
    const productsList: unknown =
      Array.isArray(dataField)
        ? dataField
        : (dataField as any)?.items ?? dataField;

    if (Array.isArray(productsList)) {
      return normalizeProductList(productsList);
    }

    console.error('Unexpected products response shape:', json);
    throw new Error('Unexpected products response shape: response is not an array');
  } catch (error) {
    console.error('Error fetching products with params:', error);
    throw error;
  }
};

/**
 * Lấy danh sách sản phẩm theo khoảng giá
 */
export const getProductsByPriceRange = async (minPrice: number, maxPrice: number): Promise<Product[]> => {
  return getProductsWithParams({ minPrice, maxPrice });
};

/**
 * Lấy danh sách sản phẩm có phân trang
 */
export const getProductsPaginated = async (page: number, limit: number): Promise<Product[]> => {
  return getProductsWithParams({ page, limit });
};