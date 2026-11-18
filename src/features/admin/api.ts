import { resolveProductCategory, type StoreProduct } from "@/lib/store-shared";
import { API_BASE_URL } from "@/lib/api-client";

// TODO(담당 5): 관리자 상품 목록, 수정, 삭제 API를 구현합니다.
type ApiResponse<T> = {
  success: boolean;
  message: string | null;
  data: T | null;
};

export type AdminProductInput = {
  categoryName: string;
  name: string;
  basePrice: number;
  stockQuantity: number;
  thumbnailUrl: string | null;
  description: string | null;
  layout: string | null;
  housingMaterial: string | null;
  supportPins: string | null;
  isWireless: boolean | null;
  switchPin: number | null;
  switchType: string | null;
  keycapMaterial: string | null;
};

export async function getAdminProducts(): Promise<StoreProduct[]> {
  throw new Error("TODO: 관리자 상품 목록 API를 연결하세요.");
}

// 관리자 상품 등록
export async function createAdminProduct(
  input: AdminProductInput,
  image?: File,
): Promise<number> {
  // 스프링부트의 관리자 상품등록 api 호출
  const body = new FormData();
  body.append(
    "product",
    new Blob([JSON.stringify(input)], { type: "application/json" }),
  );
  if (image) body.append("image", image);
  const response = await fetch(`${API_BASE_URL}/api/admin/products`, {
    method: "POST",
    credentials: "include",
    body,
  });

  const result = (await response.json()) as ApiResponse<{ productId: number }>;

  if (!response.ok || !result.success || result.data == null) {
    throw new Error(result.message || "상품을 등록할 수 없습니다");
  }

  return result.data.productId;
}

export async function updateAdminProduct(
  productId: string,
  input: AdminProductInput,
  image?: File,
): Promise<StoreProduct> {
  const body = new FormData();
  body.append(
    "product",
    new Blob([JSON.stringify(input)], { type: "application/json" }),
  );
  if (image) body.append("image", image);
  const response = await fetch(
    `${API_BASE_URL}/api/admin/products/${encodeURIComponent(productId)}/edit`,
    {
      method: "PATCH",
      body,
    },
  );
  const result = (await response.json()) as ApiResponse<{
    productId: number;
    categoryName: string;
    categoryId?: string;
    name: string;
    basePrice: number;
    stockQuantity: number;
    thumbnailUrl: string | null;
    description: string | null;
  }>;
  if (!response.ok || !result.success || !result.data) {
    throw new Error(result.message || "상품을 수정할 수 없습니다");
  }
  const item = result.data;
  return {
    id: item.productId,
    slug: String(item.productId),
    name: item.name,
    basePrice: item.basePrice,
    category: resolveProductCategory(item.categoryId, item.categoryName),
    description: item.description ?? "",
    stockQuantity: item.stockQuantity,
    shippingFee: 0,
    brand: "",
    images: item.thumbnailUrl
      ? [{ id: item.productId, url: item.thumbnailUrl, alt: item.name }]
      : [],
  };
}

export async function deleteAdminProduct(productId: string): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/products/${encodeURIComponent(productId)}`,
    {
      method: "DELETE",
    },
  );
  const result = (await response.json()) as ApiResponse<null>;
  if (!response.ok || !result.success) {
    throw new Error(result.message || "상품을 삭제할 수 없습니다");
  }
}
