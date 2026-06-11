import 'package:equatable/equatable.dart';
import 'pagination_model.dart';
import 'product_model.dart';

class ProductListResult extends Equatable {
  const ProductListResult({
    required this.products,
    required this.pagination,
  });

  final List<ProductModel> products;
  final PaginationModel pagination;

  @override
  List<Object?> get props => [products, pagination];
}
