import 'package:equatable/equatable.dart';
import '../../../categories/domain/models/category_model.dart';
import '../../../products/domain/models/product_model.dart';
import '../../domain/models/dashboard_stats.dart';

sealed class DashboardState extends Equatable {
  const DashboardState();
}

class DashboardInitial extends DashboardState {
  const DashboardInitial();
  @override
  List<Object?> get props => const [];
}

class DashboardLoading extends DashboardState {
  const DashboardLoading();
  @override
  List<Object?> get props => const [];
}

class DashboardLoaded extends DashboardState {
  const DashboardLoaded({
    required this.stats,
    required this.categories,
    required this.featuredProducts,
    required this.recentProducts,
    required this.productCountPerCategory,
  });

  final DashboardStats stats;
  final List<CategoryModel> categories;
  final List<ProductModel> featuredProducts;
  final List<ProductModel> recentProducts;
  final Map<String, int> productCountPerCategory;

  @override
  List<Object?> get props =>
      [stats, categories, featuredProducts, recentProducts, productCountPerCategory];
}

class DashboardError extends DashboardState {
  const DashboardError(this.message);
  final String message;
  @override
  List<Object?> get props => [message];
}
