import 'package:equatable/equatable.dart';

class DashboardStats extends Equatable {
  const DashboardStats({
    required this.totalProducts,
    required this.totalCategories,
    required this.featuredProducts,
    required this.totalInventory,
  });

  final int totalProducts;
  final int totalCategories;
  final int featuredProducts;
  final int totalInventory;

  @override
  List<Object?> get props =>
      [totalProducts, totalCategories, featuredProducts, totalInventory];
}
