# The Horizon Editorial — Tour Booking Frontend

> Dự án React frontend cho website đặt tour du lịch cao cấp, sử dụng Vite + React 18 + Tailwind CSS.

---

## 📁 Cấu Trúc Thư Mục

```
fe-tour/
├── index.html              # HTML entry template
├── package.json            # Dependencies & scripts
├── vite.config.js          # Cấu hình Vite
├── tailwind.config.js      # Cấu hình Tailwind CSS
├── postcss.config.js       # Cấu hình PostCSS
├── eslint.config.js        # Cấu hình ESLint
├── public/                 # Tài nguyên tĩnh (favicon, hình ảnh public...)
└── src/
    ├── main.jsx            # React DOM entry point
    ├── App.jsx             # Root component (Provider tree)
    │
    ├── assets/
    │   └── index.css       # CSS toàn cục, design tokens, animations
    │
    ├── components/        # 🧩 Các component UI có thể tái sử dụng
    │   ├── index.js        # Barrel export
    │   ├── Button.jsx
    │   ├── Input.jsx
    │   ├── Navbar.jsx
    │   ├── Footer.jsx
    │   ├── TourCard.jsx
    │   ├── DestinationCard.jsx
    │   ├── SearchForm.jsx
    │   ├── Modal.jsx
    │   ├── Toast.jsx
    │   └── LoadingSpinner.jsx
    │
    ├── layouts/           # 🎬 Wrapper layout cho các nhóm page
    │   ├── index.js
    │   ├── MainLayout.jsx  # Public pages: Navbar + Outlet + Footer
    │   └── AuthLayout.jsx  # Auth pages: split-screen branding + form
    │
    ├── pages/             # 📄 Các page tương ứng route
    │   ├── index.js
    │   ├── HomePage.jsx
    │   ├── TourListPage.jsx
    │   ├── TourDetailPage.jsx
    │   ├── BookingPage.jsx
    │   ├── LoginPage.jsx
    │   └── RegisterPage.jsx
    │
    ├── routes/
    │   └── index.jsx      # Định nghĩa tất cả routes (react-router-dom v6)
    │
    ├── store/             # 🗄️ Redux Toolkit state management
    │   ├── index.js       # CombineReducers
    │   ├── authSlice.js
    │   └── tourSlice.js
    │
    ├── services/          # 🔌 Gọi API (axios)
    │   ├── apiClient.js   # Axios instance cấu hình interceptors
    │   ├── authService.js
    │   └── tourService.js
    │
    ├── context/           # ⚛️ React Context providers
    │   ├── index.js
    │   ├── AuthContext.jsx
    │   └── ThemeContext.jsx
    │
    ├── hooks/            # 🪝 Custom React hooks
    │   ├── index.js
    │   ├── useAuth.js
    │   ├── useDebounce.js
    │   └── useWindowSize.js
    │
    └── utils/            # 🛠️ Utility functions
        └── index.js
```

---

## 🗂️ Quy Tắc Tổ Chức Thư Mục

### 1. `src/` — Thư mục gốc
Tất cả source code nằm trong `src/`. Không viết logic ở ngoài `src/`.

### 2. `src/components/` — Component UI

> **Quy tắc:** Mỗi component = 1 file `.jsx`. Đặt tên theo PascalCase.

| Nguyên tắc | Ví dụ |
|---|---|
| Tên file = tên component | `TourCard.jsx` → component `TourCard` |
| Export default | `export default TourCard;` |
| Props interface / comment docstring ở đầu file | Mô tả purpose, props |
| Side effects (fetch, event listeners) → dùng hooks bên trong component | Không gọi API trực tiếp trong component |
| Giao diện thuần presentational → component | Business logic → hooks/services |

**Phân loại:**

- **Presentational components** — Chỉ nhận props, render UI. Ví dụ: `Button`, `Input`, `TourCard`, `DestinationCard`.
- **Container components** — Có state/logic riêng. Ví dụ: `Navbar`, `SearchForm`, `Modal`.
- **Provider components** — Bọc context/wrap children. Ví dụ: `Toast` (có `ToastProvider`).

### 3. `src/pages/` — Pages

> **Quy tắc:** Mỗi page = 1 file `.jsx` tương ứng 1 route. Đặt tên theo PascalCase + hậu tố `Page`.

| Tên page | Route | Ghi chú |
|---|---|---|
| `HomePage` | `/` | Trang chủ |
| `TourListPage` | `/tours` | Danh sách tour |
| `TourDetailPage` | `/tour/:id` | Chi tiết tour |
| `BookingPage` | `/booking` | Đặt tour |
| `LoginPage` | `/login` | Đăng nhập |
| `RegisterPage` | `/register` | Đăng ký |

Page **KHÔNG** chứa logic nghiệp vụ trực tiếp. Luôn tách thành:
```
pages/XxxPage.jsx    ← render UI, gọi hook
hooks/useXxx.js      ← xử lý logic
services/xxxService.js ← gọi API
```

### 4. `src/layouts/` — Layout

> **Quy tắc:** Layout = wrapper chung quanh nhóm page. Dùng `<Outlet />` của react-router-dom.

- **`MainLayout`** — Trang public: Navbar cố định phía trên, Footer phía dưới, `<Outlet />` ở giữa.
- **`AuthLayout`** — Trang auth: chia đôi màn hình ( trái: ảnh branding, phải: form).

### 5. `src/routes/` — Định nghĩa Routes

> **Quy tắc:** Tất cả routes khai báo ở `routes/index.jsx`, dùng `createBrowserRouter`.

```jsx
// Đúng
<Route path="/tours" element={<MainLayout><TourListPage /></MainLayout>} />

// Sai — KHÔNG đặt component trực tiếp trong Route file
<Route path="/tours" element={<div>...</div>} />
```

### 6. `src/store/` — Redux

> **Quy tắc:** Mỗi domain = 1 file `slice`. Tên slice = danh từ số ít.

| File | Quản lý |
|---|---|
| `authSlice.js` | `user`, `isAuthenticated`, `loading`, `error` |
| `tourSlice.js` | `list`, `currentTour`, `filteredList`, `filters`, `pagination` |

**Cấu trúc slice:**
```js
// slice = initialState + reducers + asyncThunks
// KHÔNG đặt business logic (gọi API) trong slice → dùng service
```

### 7. `src/services/` — API Calls

> **Quy tắc:** Mỗi domain = 1 file service. KHÔNG gọi API trực tiếp trong component/page.

| File | Mô tả |
|---|---|
| `apiClient.js` | Axios instance, base URL, interceptors (token, 401 redirect) |
| `authService.js` | login, register, logout, getCurrentUser |
| `tourService.js` | getTours, getTourById, searchTours, getFeaturedTours |

### 8. `src/context/` — React Context

> **Quy tắc:** Chỉ dùng Context khi cần share state qua nhiều component tree levels. Ưu tiên Redux cho global state.

- **`AuthContext`** — User auth state (dùng song song với Redux `authSlice`, cần lưu ý đồng bộ).
- **`ThemeContext`** — Light/dark mode toggle.

### 9. `src/hooks/` — Custom Hooks

> **Quy tắc:** Prefix tên hook bằng `use`. Mỗi hook = 1 file.

```js
useAuth       → Redux auth actions + authService
useDebounce   → Debounce giá trị input
useWindowSize → Responsive breakpoints
```

### 10. `src/utils/` — Utility Functions

> **Quy tắc:** Pure functions, không có side effects, không gọi API.

```js
formatPrice(price)          // Format VND
formatDate(date)            // Format DD/MM/YYYY
validateEmail(email)        // Regex validation
generateStarRating(rating) // ['full', 'half', 'empty']
```

### 11. `src/assets/index.css` — Global Styles

> **Quy tắc:** Design tokens (CSS variables) đặt ở đây. Không hardcode màu/size trong component.

```css
/* Ví dụ design token */
:root {
  --color-primary: #003974;
  --color-secondary: #fe9400;
  --font-headline: 'Plus Jakarta Sans', sans-serif;
  --font-body: 'Manrope', sans-serif;
}
```

### 12. `src/assets/` — Assets

> **Quy tắc:**
- Hình ảnh có thể import → đặt trong `assets/`, import vào component.
- Hình ảnh public (favicon, logo lớn) → đặt trong `public/`.

---

## ⚙️ Chạy Dự Án

```bash
# Cài dependencies (nếu chưa có node_modules)
npm install

# Khởi động dev server (http://localhost:3000)
npm run dev

# Build production
npm run build

# Xem bản production đã build
npm run preview
```

---

## 🧱 Stack Công Nghệ

| Công nghệ | Phiên bản |
|---|---|
| Bundler | Vite 5 |
| Framework | React 18 |
| Routing | react-router-dom v6 |
| State | Redux Toolkit 2.2 + react-redux 9.1 |
| API | Axios 1.6 |
| Styling | Tailwind CSS 3.4 + PostCSS |
| Icons | Material Symbols Outlined |

---

## ⚠️ Lưu Ý Kiến Trúc

1. **Dual Auth System** — Hiện tại app có 2 hệ thống auth chạy song song:
   - `AuthContext` → dùng bởi `Navbar`, `AuthLayout`
   - Redux `authSlice` → dùng bởi `useAuth` hook
   - Hai hệ thống **chưa đồng bộ** → cần fix khi integrate API thật.

2. **Mock-Only Backend** — Tất cả `authService` và `tourService` trả về dữ liệu hardcoded. Chưa có API thật.

3. **Barrel Exports** — Mỗi folder (`components/`, `pages/`, `hooks/`...) có file `index.js` barrel export → import gọn, tránh duplicate.
