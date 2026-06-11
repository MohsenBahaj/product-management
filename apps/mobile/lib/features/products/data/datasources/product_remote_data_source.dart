import 'dart:io';
import 'package:dio/dio.dart';
import '../../../../core/network/interceptors/error_interceptor.dart';
import '../../domain/models/product_query_params.dart';
import '../dtos/product_dto.dart';
import '../dtos/product_image_dto.dart';

abstract class ProductRemoteDataSource {
  Future<({List<ProductDto> products, Map<String, dynamic> pagination})>
      getProducts(ProductQueryParams params);
  Future<ProductDto> getProductById(String id);
  Future<ProductDto> createProduct({
    required String name,
    String? description,
    required double price,
    required int quantity,
    String? categoryId,
    required bool isFeatured,
    required String thumbnailImagePath,
    required List<String> galleryImagePaths,
  });
  Future<ProductDto> updateProduct({
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
  Future<List<ProductImageDto>> getProductImages(String productId);
  Future<List<ProductImageDto>> addProductImages({
    required String productId,
    required List<String> imagePaths,
  });
  Future<void> deleteProductImage({
    required String productId,
    required String imageId,
  });
  Future<List<ProductImageDto>> reorderProductImages({
    required String productId,
    required List<Map<String, dynamic>> orders,
  });
}

class ProductRemoteDataSourceImpl implements ProductRemoteDataSource {
  const ProductRemoteDataSourceImpl(this._dio);

  final Dio _dio;

  @override
  Future<({List<ProductDto> products, Map<String, dynamic> pagination})>
      getProducts(ProductQueryParams params) async {
    try {
      final res = await _dio.get<Map<String, dynamic>>(
        '/products',
        queryParameters: params.toQueryMap(),
      );
      // Response shape: { success, data: { data: [...], pagination: {...} } }
      final outer = res.data!['data'] as Map<String, dynamic>;
      final products = (outer['data'] as List<dynamic>)
          .cast<Map<String, dynamic>>()
          .map(ProductDto.fromJson)
          .toList();
      final pagination = outer['pagination'] as Map<String, dynamic>;
      return (products: products, pagination: pagination);
    } on DioException catch (e) {
      throw _toAppException(e);
    }
  }

  @override
  Future<ProductDto> getProductById(String id) async {
    try {
      final res = await _dio.get<Map<String, dynamic>>('/products/$id');
      final data = res.data!['data'] as Map<String, dynamic>;
      return ProductDto.fromJson(data['product'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw _toAppException(e);
    }
  }

  @override
  Future<ProductDto> createProduct({
    required String name,
    String? description,
    required double price,
    required int quantity,
    String? categoryId,
    required bool isFeatured,
    required String thumbnailImagePath,
    required List<String> galleryImagePaths,
  }) async {
    try {
      final fields = <String, dynamic>{
        'name': name,
        'price': price.toString(),
        'quantity': quantity.toString(),
        'is_featured': isFeatured.toString(),
        'thumbnail_image': await MultipartFile.fromFile(
          thumbnailImagePath,
          filename: File(thumbnailImagePath).uri.pathSegments.last,
        ),
      };
      if (description != null) fields['description'] = description;
      if (categoryId != null) fields['categoryId'] = categoryId;

      final formData = FormData.fromMap(fields);
      for (final path in galleryImagePaths) {
        formData.files.add(MapEntry(
          'images',
          await MultipartFile.fromFile(
            path,
            filename: File(path).uri.pathSegments.last,
          ),
        ));
      }

      final res = await _dio.post<Map<String, dynamic>>(
        '/products',
        data: formData,
      );
      final data = res.data!['data'] as Map<String, dynamic>;
      return ProductDto.fromJson(data['product'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw _toAppException(e);
    }
  }

  @override
  Future<ProductDto> updateProduct({
    required String id,
    String? name,
    String? description,
    double? price,
    int? quantity,
    String? categoryId,
    bool? isFeatured,
    String? thumbnailImagePath,
  }) async {
    try {
      final fields = <String, dynamic>{};
      if (name != null) fields['name'] = name;
      if (description != null) fields['description'] = description;
      if (price != null) fields['price'] = price.toString();
      if (quantity != null) fields['quantity'] = quantity.toString();
      if (categoryId != null) fields['categoryId'] = categoryId;
      if (isFeatured != null) fields['is_featured'] = isFeatured.toString();
      if (thumbnailImagePath != null) {
        fields['thumbnail_image'] = await MultipartFile.fromFile(
          thumbnailImagePath,
          filename: File(thumbnailImagePath).uri.pathSegments.last,
        );
      }

      final res = await _dio.patch<Map<String, dynamic>>(
        '/products/$id',
        data: FormData.fromMap(fields),
      );
      final data = res.data!['data'] as Map<String, dynamic>;
      return ProductDto.fromJson(data['product'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw _toAppException(e);
    }
  }

  @override
  Future<void> deleteProduct(String id) async {
    try {
      await _dio.delete<void>('/products/$id');
    } on DioException catch (e) {
      throw _toAppException(e);
    }
  }

  @override
  Future<List<ProductImageDto>> getProductImages(String productId) async {
    try {
      final res =
          await _dio.get<Map<String, dynamic>>('/products/$productId/images');
      // Response: { success, data: [...images] }
      return (res.data!['data'] as List<dynamic>)
          .cast<Map<String, dynamic>>()
          .map(ProductImageDto.fromJson)
          .toList();
    } on DioException catch (e) {
      throw _toAppException(e);
    }
  }

  @override
  Future<List<ProductImageDto>> addProductImages({
    required String productId,
    required List<String> imagePaths,
  }) async {
    try {
      final formData = FormData();
      for (final path in imagePaths) {
        formData.files.add(MapEntry(
          'images',
          await MultipartFile.fromFile(
            path,
            filename: File(path).uri.pathSegments.last,
          ),
        ));
      }
      final res = await _dio.post<Map<String, dynamic>>(
        '/products/$productId/images',
        data: formData,
      );
      return (res.data!['data'] as List<dynamic>)
          .cast<Map<String, dynamic>>()
          .map(ProductImageDto.fromJson)
          .toList();
    } on DioException catch (e) {
      throw _toAppException(e);
    }
  }

  @override
  Future<void> deleteProductImage({
    required String productId,
    required String imageId,
  }) async {
    try {
      await _dio.delete<void>('/products/$productId/images/$imageId');
    } on DioException catch (e) {
      throw _toAppException(e);
    }
  }

  @override
  Future<List<ProductImageDto>> reorderProductImages({
    required String productId,
    required List<Map<String, dynamic>> orders,
  }) async {
    try {
      final res = await _dio.patch<Map<String, dynamic>>(
        '/products/$productId/images/reorder',
        data: {'orders': orders},
      );
      return (res.data!['data'] as List<dynamic>)
          .cast<Map<String, dynamic>>()
          .map(ProductImageDto.fromJson)
          .toList();
    } on DioException catch (e) {
      throw _toAppException(e);
    }
  }

  AppException _toAppException(DioException e) {
    final err = e.error;
    return err is AppException
        ? err
        : AppException(
            message: e.message ?? 'Network error',
            statusCode: e.response?.statusCode,
          );
  }
}
