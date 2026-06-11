import 'package:equatable/equatable.dart';
import '../../domain/models/product_model.dart';

sealed class ProductDetailState extends Equatable {
  const ProductDetailState();
}

class ProductDetailInitial extends ProductDetailState {
  const ProductDetailInitial();
  @override
  List<Object?> get props => const [];
}

class ProductDetailLoading extends ProductDetailState {
  const ProductDetailLoading();
  @override
  List<Object?> get props => const [];
}

class ProductDetailLoaded extends ProductDetailState {
  const ProductDetailLoaded(this.product);
  final ProductModel product;
  @override
  List<Object?> get props => [product];
}

class ProductDetailOperationSuccess extends ProductDetailState {
  const ProductDetailOperationSuccess(this.product);
  final ProductModel product;
  @override
  List<Object?> get props => [product];
}

class ProductDetailDeleted extends ProductDetailState {
  const ProductDetailDeleted();
  @override
  List<Object?> get props => const [];
}

class ProductDetailError extends ProductDetailState {
  const ProductDetailError(this.message);
  final String message;
  @override
  List<Object?> get props => [message];
}
