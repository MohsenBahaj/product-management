abstract final class RouteNames {
  // Public
  static const splash = '/';

  // Auth (unauthenticated only)
  static const login = '/login';
  static const register = '/register';

  // Shell tabs
  static const dashboard = '/dashboard';
  static const products = '/products';
  static const search = '/search';
  static const profile = '/profile';

  // Full-screen protected (no bottom nav)
  static const addProduct = '/products/add';
  static const editProfile = '/profile/edit';
  static const categories = '/categories';
  static const addCategory = '/categories/add';

  // Path builders
  static String productDetailsPath(String id) => '/products/$id';
  static String editProductPath(String id) => '/products/$id/edit';
  static String editCategoryPath(String id) => '/categories/$id/edit';
}
