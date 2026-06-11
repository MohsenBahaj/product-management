import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/network/interceptors/error_interceptor.dart';
import '../../domain/repositories/category_repository.dart';
import '../states/category_state.dart';

class CategoryCubit extends Cubit<CategoryState> {
  CategoryCubit({required CategoryRepository repository})
      : _repository = repository,
        super(const CategoryInitial());

  final CategoryRepository _repository;

  Future<void> loadCategories() async {
    emit(const CategoryLoading());
    try {
      final categories = await _repository.getCategories();
      emit(CategoryLoaded(categories));
    } on AppException catch (e) {
      emit(CategoryError(e.message));
    } catch (_) {
      emit(const CategoryError('Failed to load categories.'));
    }
  }

  Future<void> createCategory({
    required String name,
    String? description,
    String? imagePath,
  }) async {
    emit(const CategoryLoading());
    try {
      await _repository.createCategory(
        name: name,
        description: description,
        imagePath: imagePath,
      );
      final categories = await _repository.getCategories();
      emit(CategoryOperationSuccess(categories));
    } on AppException catch (e) {
      emit(CategoryError(e.message));
    } catch (_) {
      emit(const CategoryError('Failed to create category.'));
    }
  }

  Future<void> updateCategory({
    required String id,
    String? name,
    String? description,
    String? imagePath,
  }) async {
    emit(const CategoryLoading());
    try {
      await _repository.updateCategory(
        id: id,
        name: name,
        description: description,
        imagePath: imagePath,
      );
      final categories = await _repository.getCategories();
      emit(CategoryOperationSuccess(categories));
    } on AppException catch (e) {
      emit(CategoryError(e.message));
    } catch (_) {
      emit(const CategoryError('Failed to update category.'));
    }
  }

  Future<void> deleteCategory(String id) async {
    emit(const CategoryLoading());
    try {
      await _repository.deleteCategory(id);
      final categories = await _repository.getCategories();
      emit(CategoryOperationSuccess(categories));
    } on AppException catch (e) {
      emit(CategoryError(e.message));
    } catch (_) {
      emit(const CategoryError('Failed to delete category.'));
    }
  }
}
