import { Outlet } from 'react-router-dom';
import { Navbar, Footer } from '../components';

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#f7f9fb]">
      <Navbar />
      <main className="flex-1 pt-16 md:pt-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
