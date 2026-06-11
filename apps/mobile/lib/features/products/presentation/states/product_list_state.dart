import 'package:equatable/equatable.dart';
import '../../domain/models/pagination_model.dart';
import '../../domain/models/product_model.dart';
import '../../domain/models/product_query_params.dart';

sealed class ProductListState extends Equatable {
  const ProductListState();
}

class ProductListInitial extends ProductListState {
  const ProductListInitial();
  @override
  List<Object?> get props => const [];
}

class ProductListLoading extends ProductListState {
  const ProductListLoading();
  @override
  List<Object?> get props => const [];
}

class ProductListLoaded extends ProductListState {
  const ProductListLoaded({
    required this.products,
    required this.pagination,
    required this.params,
    this.isLoadingMore = false,
  });

  final List<ProductModel> products;
  final PaginationModel pagination;
  final ProductQueryParams params;
  final bool isLoadingMore;

  ProductListLoaded copyWith({
    List<ProductModel>? products,
    PaginationModel? pagination,
    ProductQueryParams? params,
    bool? isLoadingMore,
  }) =>
      ProductListLoaded(
        products: products ?? this.products,
        pagination: pagination ?? this.pagination,
        params: params ?? this.params,
        isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      );

  @override
  List<Object?> get props => [products, pagination, params, isLoadingMore];
}

class ProductListError extends ProductListState {
  const ProductListError(this.message);
  final String message;
  @override
  List<Object?> get props => [message];
}
