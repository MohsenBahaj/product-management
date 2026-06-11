import '../../domain/models/category_model.dart';
import '../../domain/repositories/category_repository.dart';
import '../datasources/category_remote_data_source.dart';

class CategoryRepositoryImpl implements CategoryRepository {
  const CategoryRepositoryImpl({required this.remoteDataSource});

  final CategoryRemoteDataSource remoteDataSource;

  @override
  Future<List<CategoryModel>> getCategories() async {
    final dtos = await remoteDataSource.getCategories();
    return dtos.map((d) => d.toModel()).toList();
  }

  @override
  Future<CategoryModel> getCategoryById(String id) async {
    final dto = await remoteDataSource.getCategoryById(id);
    return dto.toModel();
  }

  @override
  Future<CategoryModel> createCategory({
    required String name,
    String? description,
    String? imagePath,
  }) async {
    final dto = await remoteDataSource.createCategory(
      name: name,
      description: description,
      imagePath: imagePath,
    );
    return dto.toModel();
  }

  @override
  Future<CategoryModel> updateCategory({
    required String id,
    String? name,
    String? description,
    String? imagePath,
  }) async {
    final dto = await remoteDataSource.updateCategory(
      id: id,
      name: name,
      description: description,
      imagePath: imagePath,
    );
    return dto.toModel();
  }

  @override
  Future<void> deleteCategory(String id) =>
      remoteDataSource.deleteCategory(id);
}
