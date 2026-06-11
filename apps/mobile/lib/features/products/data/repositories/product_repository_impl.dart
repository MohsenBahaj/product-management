import '../../domain/models/pagination_model.dart';
import '../../domain/models/product_image_model.dart';
import '../../domain/models/product_list_result.dart';
import '../../domain/models/product_model.dart';
import '../../domain/models/product_query_params.dart';
import '../../domain/repositories/product_repository.dart';
import '../datasources/product_remote_data_source.dart';

class ProductRepositoryImpl implements ProductRepository {
  const ProductRepositoryImpl({required this.remoteDataSource});

  final ProductRemoteDataSource remoteDataSource;

  @override
  Future<ProductListResult> getProducts(ProductQueryParams params) async {
    final result = await remoteDataSource.getProducts(params);
    final p = result.pagination;
    return ProductListResult(
      products: result.products.map((d) => d.toModel()).toList(),
      pagination: PaginationModel(
        page: p['page'] as int,
        limit: p['limit'] as int,
        total: p['total'] as int,
        pages: p['pages'] as int,
      ),
    );
  }

  @override
  Future<ProductModel> getProductById(String id) async {
    final dto = await remoteDataSource.getProductById(id);
    return dto.toModel();
  }

  @override
  Future<ProductModel> createProduct({
    required String name,
    String? description,
    required double price,
    int quantity = 0,
    String? categoryId,
    bool isFeatured = false,
    required String thumbnailImagePath,
    List<String> galleryImagePaths = const [],
  }) async {
    final dto = await remoteDataSource.createProduct(
      name: name,
      description: description,
      price: price,
      quantity: quantity,
      categoryId: categoryId,
      isFeatured: isFeatured,
      thumbnailImagePath: thumbnailImagePath,
      galleryImagePaths: galleryImagePaths,
    );
    return dto.toModel();
  }

  @override
  Future<ProductModel> updateProduct({
    required String id,
    String? name,
    String? description,
    double? price,
    int? quantity,
    String? categoryId,
    bool? isFeatured,
    String? thumbnailImagePath,
  }) async {
    final dto = await remoteDataSource.updateProduct(
      id: id,
      name: name,
      description: description,
      price: price,
      quantity: quantity,
      categoryId: categoryId,
      isFeatured: isFeatured,
      thumbnailImagePath: thumbnailImagePath,
    );
    return dto.toModel();
  }

  @override
  Future<void> deleteProduct(String id) =>
      remoteDataSource.deleteProduct(id);

  @override
  Future<List<ProductImageModel>> getProductImages(String productId) async {
    final dtos = await remoteDataSource.getProductImages(productId);
    return dtos.map((d) => d.toModel()).toList();
  }

  @override
  Future<List<ProductImageModel>> addProductImages({
    required String productId,
    required List<String> imagePaths,
  }) async {
    final dtos = await remoteDataSource.addProductImages(
      productId: productId,
      imagePaths: imagePaths,
    );
    return dtos.map((d) => d.toModel()).toList();
  }

  @override
  Future<void> deleteProductImage({
    required String productId,
    required String imageId,
  }) =>
      remoteDataSource.deleteProductImage(
        productId: productId,
        imageId: imageId,
      );

  @override
  Future<List<ProductImageModel>> reorderProductImages({
    required String productId,
    required List<({String id, int displayOrder})> orders,
  }) async {
    final payload = orders
        .map((o) => {'id': o.id, 'display_order': o.displayOrder})
        .toList();
    final dtos = await remoteDataSource.reorderProductImages(
      productId: productId,
      orders: payload,
    );
    return dtos.map((d) => d.toModel()).toList();
  }
}
