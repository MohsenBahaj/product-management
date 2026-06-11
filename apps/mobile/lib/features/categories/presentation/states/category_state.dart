import 'package:equatable/equatable.dart';
import '../../domain/models/category_model.dart';

sealed class CategoryState extends Equatable {
  const CategoryState();
}

class CategoryInitial extends CategoryState {
  const CategoryInitial();
  @override
  List<Object?> get props => const [];
}

class CategoryLoading extends CategoryState {
  const CategoryLoading();
  @override
  List<Object?> get props => const [];
}

class CategoryLoaded extends CategoryState {
  const CategoryLoaded(this.categories);
  final List<CategoryModel> categories;
  @override
  List<Object?> get props => [categories];
}

class CategoryOperationSuccess extends CategoryState {
  const CategoryOperationSuccess(this.categories);
  final List<CategoryModel> categories;
  @override
  List<Object?> get props => [categories];
}

class CategoryError extends CategoryState {
  const CategoryError(this.message);
  final String message;
  @override
  List<Object?> get props => [message];
}
