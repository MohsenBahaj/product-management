import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/presentation/screens/login_screen.dart';
import '../../features/auth/presentation/screens/register_screen.dart';
import '../../features/auth/presentation/screens/splash_screen.dart';
import '../../features/categories/presentation/screens/categories_screen.dart';
import '../../features/categories/presentation/screens/create_category_screen.dart';
import '../../features/categories/presentation/screens/edit_category_screen.dart';
import '../../features/dashboard/presentation/screens/dashboard_screen.dart';
import '../../features/products/presentation/screens/create_product_screen.dart';
import '../../features/products/presentation/screens/edit_product_screen.dart';
import '../../features/products/presentation/screens/product_details_screen.dart';
import '../../features/products/presentation/screens/products_screen.dart';
import '../../features/profile/presentation/screens/edit_profile_screen.dart';
import '../../features/profile/presentation/screens/profile_screen.dart';
import '../../features/search/presentation/screens/search_screen.dart';
import '../../shared/widgets/main_shell.dart';
import 'auth_notifier.dart';
import 'route_names.dart';

class AppRouter {
  AppRouter({required AuthNotifier authNotifier}) : _authNotifier = authNotifier;

  final AuthNotifier _authNotifier;

  final _rootNavKey = GlobalKey<NavigatorState>(debugLabel: 'root');
  final _dashboardNavKey = GlobalKey<NavigatorState>(debugLabel: 'dashboard');
  final _productsNavKey = GlobalKey<NavigatorState>(debugLabel: 'products');
  final _searchNavKey = GlobalKey<NavigatorState>(debugLabel: 'search');
  final _profileNavKey = GlobalKey<NavigatorState>(debugLabel: 'profile');

  late final router = GoRouter(
    navigatorKey: _rootNavKey,
    initialLocation: RouteNames.splash,
    refreshListenable: _authNotifier,
    redirect: _guard,
    routes: [
      // ── Public ────────────────────────────────────────────
      GoRoute(
        path: RouteNames.splash,
        builder: (_, __) => const SplashScreen(),
      ),
      GoRoute(
        path: RouteNames.login,
        builder: (_, __) => const LoginScreen(),
      ),
      GoRoute(
        path: RouteNames.register,
        builder: (_, __) => const RegisterScreen(),
      ),

      // ── Full-screen protected (escape shell) ──────────────
      GoRoute(
        path: RouteNames.editProfile,
        parentNavigatorKey: _rootNavKey,
        builder: (_, __) => const EditProfileScreen(),
      ),
      GoRoute(
        path: RouteNames.categories,
        parentNavigatorKey: _rootNavKey,
        builder: (_, __) => const CategoriesScreen(),
      ),
      GoRoute(
        path: RouteNames.addCategory,
        parentNavigatorKey: _rootNavKey,
        builder: (_, __) => const CreateCategoryScreen(),
      ),
      GoRoute(
        path: '/categories/:id/edit',
        parentNavigatorKey: _rootNavKey,
        builder: (_, state) =>
            EditCategoryScreen(categoryId: state.pathParameters['id']!),
      ),

      // ── Shell (bottom nav) ────────────────────────────────
      StatefulShellRoute.indexedStack(
        builder: (_, __, shell) => MainShell(navigationShell: shell),
        branches: [
          StatefulShellBranch(
            navigatorKey: _dashboardNavKey,
            routes: [
              GoRoute(
                path: RouteNames.dashboard,
                builder: (_, __) => const DashboardScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            navigatorKey: _productsNavKey,
            routes: [
              GoRoute(
                path: RouteNames.products,
                builder: (_, state) => ProductsScreen(
                  initialCategoryId: state.uri.queryParameters['categoryId'],
                ),
                routes: [
                  GoRoute(
                    path: 'add',
                    parentNavigatorKey: _rootNavKey,
                    builder: (_, __) => const CreateProductScreen(),
                  ),
                  GoRoute(
                    path: ':id',
                    parentNavigatorKey: _rootNavKey,
                    builder: (_, state) =>
                        ProductDetailsScreen(productId: state.pathParameters['id']!),
                    routes: [
                      GoRoute(
                        path: 'edit',
                        parentNavigatorKey: _rootNavKey,
                        builder: (_, state) =>
                            EditProductScreen(productId: state.pathParameters['id']!),
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
          StatefulShellBranch(
            navigatorKey: _searchNavKey,
            routes: [
              GoRoute(
                path: RouteNames.search,
                builder: (_, __) => const SearchScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            navigatorKey: _profileNavKey,
            routes: [
              GoRoute(
                path: RouteNames.profile,
                builder: (_, __) => const ProfileScreen(),
              ),
            ],
          ),
        ],
      ),
    ],
  );

  String? _guard(BuildContext context, GoRouterState state) {
    if (_authNotifier.isLoading) return null;

    final location = state.matchedLocation;
    final isAuthenticated = _authNotifier.isAuthenticated;

    if (location == RouteNames.splash) {
      return isAuthenticated ? RouteNames.dashboard : RouteNames.login;
    }

    final isAuthRoute = location == RouteNames.login || location == RouteNames.register;

    if (!isAuthenticated && !isAuthRoute) return RouteNames.login;
    if (isAuthenticated && isAuthRoute) return RouteNames.dashboard;
    return null;
  }
}
