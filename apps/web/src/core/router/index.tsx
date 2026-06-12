import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '@/features/auth/context/AuthContext';
import AppLayout from '@/shared/layouts/AppLayout';
import AuthLayout from '@/shared/layouts/AuthLayout';
import LoginPage from '@/features/auth/pages/LoginPage';
import RegisterPage from '@/features/auth/pages/RegisterPage';
import DashboardPage from '@/features/dashboard/pages/DashboardPage';
import ProductsPage from '@/features/products/pages/ProductsPage';
import ProductDetailPage from '@/features/products/pages/ProductDetailPage';
import CreateProductPage from '@/features/products/pages/CreateProductPage';
import EditProductPage from '@/features/products/pages/EditProductPage';
import CategoriesPage from '@/features/categories/pages/CategoriesPage';
import CreateCategoryPage from '@/features/categories/pages/CreateCategoryPage';
import EditCategoryPage from '@/features/categories/pages/EditCategoryPage';
import ProfilePage from '@/features/profile/pages/ProfilePage';
import EditProfilePage from '@/features/profile/pages/EditProfilePage';
import SearchPage from '@/features/search/pages/SearchPage';

function ProtectedOutlet() {
  const { isAuthenticated } = useAuthContext();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function GuestOutlet() {
  const { isAuthenticated } = useAuthContext();
  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
}

const router = createBrowserRouter([
  {
    element: <GuestOutlet />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedOutlet />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: '/products', element: <ProductsPage /> },
          { path: '/products/create', element: <CreateProductPage /> },
          { path: '/products/:id', element: <ProductDetailPage /> },
          { path: '/products/:id/edit', element: <EditProductPage /> },
          { path: '/categories', element: <CategoriesPage /> },
          { path: '/categories/create', element: <CreateCategoryPage /> },
          { path: '/categories/:id/edit', element: <EditCategoryPage /> },
          { path: '/search', element: <SearchPage /> },
          { path: '/profile', element: <ProfilePage /> },
          { path: '/profile/edit', element: <EditProfilePage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
