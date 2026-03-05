# Deploy FE lên Vercel

Backend đã chạy tại: **https://tet-demo-be-production.up.railway.app/**

## 1. Chuẩn bị repo

- Đảm bảo code đã push lên GitHub (hoặc GitLab/Bitbucket).
- FE dùng biến môi trường **`VITE_API_BASE_URL`** = URL API của BE (có `/api` ở cuối).

## 2. Deploy trên Vercel

### Bước 1: Đăng nhập Vercel

- Vào [vercel.com](https://vercel.com) → Sign in (GitHub/GitLab/Email).

### Bước 2: Import project

1. Dashboard → **Add New** → **Project**.
2. Chọn repo chứa code FE (coffee-shop-fe).
3. **Framework Preset**: Vite (Vercel thường tự nhận).
4. **Root Directory**: để trống nếu FE nằm ở root repo; nếu FE nằm trong thư mục con thì chọn đúng thư mục (ví dụ `coffee-shop-fe`).
5. **Build Command**: `npm run build` (mặc định).
6. **Output Directory**: `dist` (mặc định của Vite).

### Bước 3: Cấu hình Environment Variables

Trước khi bấm Deploy, mở **Environment Variables** và thêm:

| Name                 | Value                                                    | Environment  |
|----------------------|----------------------------------------------------------|--------------|
| `VITE_API_BASE_URL`  | `https://tet-demo-be-production.up.railway.app/api`     | Production   |

- **Production**: bắt buộc để FE production gọi đúng BE.
- **Preview** (tùy chọn): có thể set cùng giá trị nếu preview cũng dùng BE production.

Lưu ý: không thêm dấu `/` thừa ở cuối (đã có `/api` rồi).

### Bước 4: Deploy

- Bấm **Deploy**.
- Đợi build xong, Vercel sẽ cho link dạng:  
  `https://<tên-project>-xxx.vercel.app`.

## 3. Sau khi deploy

- Mở link Vercel: đăng nhập, xem sản phẩm, đơn hàng, thanh toán… đều sẽ gọi BE tại  
  `https://tet-demo-be-production.up.railway.app/api`.
- Nếu BE có CORS: cần cho phép origin của Vercel (ví dụ `https://<tên-project>.vercel.app`). Nếu vẫn lỗi CORS, kiểm tra cấu hình CORS trên Railway/BE.

## 4. Cập nhật sau này

- Mỗi lần push lên branch đã kết nối (thường là `main`), Vercel tự build và deploy lại.
- Đổi URL BE: vào Project → **Settings** → **Environment Variables** → sửa `VITE_API_BASE_URL` → **Redeploy** (Deployments → ... → Redeploy).

## 5. Chạy build local trước khi deploy (kiểm tra)

```bash
# Cài dependency
npm install

# Build với env production (dùng .env.production nếu có, hoặc set tạm)
VITE_API_BASE_URL=https://tet-demo-be-production.up.railway.app/api npm run build

# Xem thử bản build
npx vite preview
```

Mở http://localhost:4173 và thử flow đăng nhập, đơn hàng, thanh toán để chắc FE gọi đúng BE.
