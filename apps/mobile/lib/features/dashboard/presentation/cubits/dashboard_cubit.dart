import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../categories/domain/repositories/category_repository.dart';
import '../../../products/domain/models/product_model.dart';
import '../../../products/domain/models/product_query_params.dart';
import '../../../products/domain/repositories/product_repository.dart';
import '../../domain/models/dashboard_stats.dart';
import '../states/dashboard_state.dart';

class DashboardCubit extends Cubit<DashboardState> {
  DashboardCubit({
    required CategoryRepository categoryRepository,
    required ProductRepository productRepository,
  })  : _categoryRepository = categoryRepository,
        _productRepository = productRepository,
        super(const DashboardInitial());

  final CategoryRepository _categoryRepository;
  final ProductRepository _productRepository;

  Future<void> load() async {
    emit(const DashboardLoading());
    try {
      final categories = await _categoryRepository.getCategories();
      final productResult = await _productRepository.getProducts(
        const ProductQueryParams(limit: 100),
      );
      final allProducts = productResult.products;

      final countPerCategory = <String, int>{};
      for (final p in allProducts) {
        if (p.categoryId != null) {
          countPerCategory[p.categoryId!] = (countPerCategory[p.categoryId!] ?? 0) + 1;
        }
      }

      final featured = allProducts.where((p) => p.isFeatured).toList();
      final recent = List<ProductModel>.from(allProducts)
        ..sort((a, b) => b.createdAt.compareTo(a.createdAt));

      final totalInventory = allProducts.fold<int>(0, (sum, p) => sum + p.quantity);

      emit(DashboardLoaded(
        stats: DashboardStats(
          totalProducts: allProducts.length,
          totalCategories: categories.length,
          featuredProducts: featured.length,
          totalInventory: totalInventory,
        ),
        categories: categories,
        featuredProducts: featured,
        recentProducts: recent.take(5).toList(),
        productCountPerCategory: countPerCategory,
      ));
    } catch (e) {
      emit(DashboardError(e.toString()));
    }
  }
}
