import { createBrowserRouter } from 'react-router-dom';
import { MainLayout, AuthLayout } from '../layouts';
import { HomePage, LoginPage, RegisterPage, TourListPage, TourDetailPage, BookingPage, OrderHistoryPage, ChatbotPage } from '../pages';

const routes = [
  {
    element: <MainLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/tours', element: <TourListPage /> },
      { path: '/tour/:id', element: <TourDetailPage /> },
      { path: '/booking', element: <BookingPage /> },
      { path: '/orders/history', element: <OrderHistoryPage /> },
      { path: '/chatbot', element: <ChatbotPage /> },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
  {
    path: '*',
    element: (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f9fb]">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-[#003974] mb-4">404</h1>
          <h2 className="text-2xl font-bold text-[#191c1e] mb-2">Trang Không Tìm Thấy</h2>
          <p className="text-[#424751] mb-6">Xin lỗi, trang bạn đang tìm kiếm không tồn tại.</p>
          <a href="/" className="px-6 py-3 btn-gradient rounded-full text-white font-semibold inline-block">Quay Về Trang Chủ</a>
        </div>
      </div>
    ),
  },
];

const router = createBrowserRouter(routes);
export default router;
