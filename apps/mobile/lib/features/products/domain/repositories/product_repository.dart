import '../models/product_image_model.dart';
import '../models/product_list_result.dart';
import '../models/product_model.dart';
import '../models/product_query_params.dart';

abstract class ProductRepository {
  Future<ProductListResult> getProducts(ProductQueryParams params);
  Future<ProductModel> getProductById(String id);
  Future<ProductModel> createProduct({
    required String name,
    String? description,
    required double price,
    int quantity,
    String? categoryId,
    bool isFeatured,
    required String thumbnailImagePath,
    List<String> galleryImagePaths,
  });
  Future<ProductModel> updateProduct({
    required String id,
    String? name,
    String? description,
    double? price,
    int? quantity,
    String? categoryId,
    bool? isFeatured,
    String? thumbnailImagePath,
  });
  Future<void> deleteProduct(String id);

  Future<List<ProductImageModel>> getProductImages(String productId);
  Future<List<ProductImageModel>> addProductImages({
    required String productId,
    required List<String> imagePaths,
  });
  Future<void> deleteProductImage({
    required String productId,
    required String imageId,
  });
  Future<List<ProductImageModel>> reorderProductImages({
    required String productId,
    required List<({String id, int displayOrder})> orders,
  });
}
