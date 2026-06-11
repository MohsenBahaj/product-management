import '../models/category_model.dart';

abstract class CategoryRepository {
  Future<List<CategoryModel>> getCategories();
  Future<CategoryModel> getCategoryById(String id);
  Future<CategoryModel> createCategory({
    required String name,
    String? description,
    String? imagePath,
  });
  Future<CategoryModel> updateCategory({
    required String id,
    String? name,
    String? description,
    String? imagePath,
  });
  Future<void> deleteCategory(String id);
}
