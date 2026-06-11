import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:get_it/get_it.dart';
import '../network/dio_client.dart';
import '../network/interceptors/auth_interceptor.dart';
import '../network/interceptors/error_interceptor.dart';
import '../network/interceptors/logging_interceptor.dart';
import '../router/app_router.dart';
import '../router/auth_notifier.dart';
import '../storage/secure_storage.dart';
import '../../features/auth/data/datasources/auth_remote_data_source.dart';
import '../../features/auth/data/repositories/auth_repository_impl.dart';
import '../../features/auth/domain/repositories/auth_repository.dart';
import '../../features/auth/presentation/cubits/auth_cubit.dart';
import '../../features/categories/data/datasources/category_remote_data_source.dart';
import '../../features/categories/data/repositories/category_repository_impl.dart';
import '../../features/categories/domain/repositories/category_repository.dart';
import '../../features/categories/presentation/cubits/category_cubit.dart';
import '../../features/dashboard/presentation/cubits/dashboard_cubit.dart';
import '../../features/products/data/datasources/product_remote_data_source.dart';
import '../../features/products/data/repositories/product_repository_impl.dart';
import '../../features/products/domain/repositories/product_repository.dart';
import '../../features/products/presentation/cubits/product_detail_cubit.dart';
import '../../features/products/presentation/cubits/product_list_cubit.dart';
import '../../features/profile/data/datasources/profile_remote_data_source.dart';
import '../../features/profile/data/repositories/profile_repository_impl.dart';
import '../../features/profile/domain/repositories/profile_repository.dart';
import '../../features/profile/presentation/cubits/profile_cubit.dart';
import '../../features/search/data/datasources/search_history_remote_data_source.dart';
import '../../features/search/data/repositories/search_history_repository_impl.dart';
import '../../features/search/domain/repositories/search_history_repository.dart';
import '../../features/search/presentation/cubits/search_cubit.dart';

final sl = GetIt.instance;

Future<void> configureDependencies() async {
  // ── Storage ──────────────────────────────────────────────
  sl.registerLazySingleton<FlutterSecureStorage>(
    () => const FlutterSecureStorage(),
  );
  sl.registerLazySingleton<SecureStorage>(() => SecureStorage(sl()));

  // ── Network ───────────────────────────────────────────────
  sl.registerLazySingleton(() => AuthInterceptor(sl()));
  sl.registerLazySingleton(() => ErrorInterceptor());
  sl.registerLazySingleton(() => LoggingInterceptor());
  sl.registerLazySingleton<DioClient>(
    () => DioClient(
      baseUrl: const String.fromEnvironment(
        'API_BASE_URL',
        defaultValue: 'http://192.168.0.2:3001/api',
      ),
      authInterceptor: sl(),
      errorInterceptor: sl(),
      loggingInterceptor: sl(),
    ),
  );

  // ── Router ───────────────────────────────────────────────
  sl.registerLazySingleton<AuthNotifier>(() => AuthNotifier());
  sl.registerLazySingleton<AppRouter>(() => AppRouter(authNotifier: sl()));

  // ── Auth ─────────────────────────────────────────────────
  sl.registerLazySingleton<AuthRemoteDataSource>(
    () => AuthRemoteDataSourceImpl(sl<DioClient>().instance),
  );
  sl.registerLazySingleton<AuthRepository>(
    () => AuthRepositoryImpl(remoteDataSource: sl(), secureStorage: sl()),
  );
  sl.registerLazySingleton<AuthCubit>(
    () => AuthCubit(repository: sl(), secureStorage: sl()),
  );

  // ── Categories ───────────────────────────────────────────
  sl.registerLazySingleton<CategoryRemoteDataSource>(
    () => CategoryRemoteDataSourceImpl(sl<DioClient>().instance),
  );
  sl.registerLazySingleton<CategoryRepository>(
    () => CategoryRepositoryImpl(remoteDataSource: sl()),
  );
  sl.registerFactory<CategoryCubit>(() => CategoryCubit(repository: sl()));

  // ── Products ─────────────────────────────────────────────
  sl.registerLazySingleton<ProductRemoteDataSource>(
    () => ProductRemoteDataSourceImpl(sl<DioClient>().instance),
  );
  sl.registerLazySingleton<ProductRepository>(
    () => ProductRepositoryImpl(remoteDataSource: sl()),
  );
  sl.registerFactory<ProductListCubit>(
    () => ProductListCubit(repository: sl()),
  );
  sl.registerFactory<ProductDetailCubit>(
    () => ProductDetailCubit(repository: sl()),
  );

  // ── Profile ──────────────────────────────────────────────
  sl.registerLazySingleton<ProfileRemoteDataSource>(
    () => ProfileRemoteDataSourceImpl(sl<DioClient>().instance),
  );
  sl.registerLazySingleton<ProfileRepository>(
    () => ProfileRepositoryImpl(remoteDataSource: sl()),
  );
  sl.registerFactory<ProfileCubit>(() => ProfileCubit(repository: sl()));

  // ── Search History ───────────────────────────────────────
  sl.registerLazySingleton<SearchHistoryRemoteDataSource>(
    () => SearchHistoryRemoteDataSourceImpl(sl<DioClient>().instance),
  );
  sl.registerLazySingleton<SearchHistoryRepository>(
    () => SearchHistoryRepositoryImpl(remoteDataSource: sl()),
  );

  // ── Dashboard ────────────────────────────────────────────
  sl.registerFactory<DashboardCubit>(
    () => DashboardCubit(categoryRepository: sl(), productRepository: sl()),
  );

  // ── Search ───────────────────────────────────────────────
  sl.registerFactory<SearchCubit>(
    () => SearchCubit(productRepository: sl(), searchHistoryRepository: sl()),
  );
}
