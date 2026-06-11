import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/network/interceptors/error_interceptor.dart';
import '../../domain/repositories/product_repository.dart';
import '../states/product_detail_state.dart';

class ProductDetailCubit extends Cubit<ProductDetailState> {
  ProductDetailCubit({required ProductRepository repository})
      : _repository = repository,
        super(const ProductDetailInitial());

  final ProductRepository _repository;

  Future<void> createProduct({
    required String name,
    String? description,
    required double price,
    required int quantity,
    String? categoryId,
    bool isFeatured = false,
    required String thumbnailImagePath,
    List<String> galleryImagePaths = const [],
  }) async {
    emit(const ProductDetailLoading());
    try {
      final product = await _repository.createProduct(
        name: name,
        description: description,
        price: price,
        quantity: quantity,
        categoryId: categoryId,
        isFeatured: isFeatured,
        thumbnailImagePath: thumbnailImagePath,
        galleryImagePaths: galleryImagePaths,
      );
      emit(ProductDetailOperationSuccess(product));
    } on AppException catch (e) {
      emit(ProductDetailError(e.message));
    } catch (_) {
      emit(const ProductDetailError('Failed to create product.'));
    }
  }

  Future<void> loadProduct(String id) async {
    emit(const ProductDetailLoading());
    try {
      final product = await _repository.getProductById(id);
      emit(ProductDetailLoaded(product));
    } on AppException catch (e) {
      emit(ProductDetailError(e.message));
    } catch (_) {
      emit(const ProductDetailError('Failed to load product.'));
    }
  }

  Future<void> updateProduct({
    required String id,
    String? name,
    String? description,
    double? price,
    int? quantity,
    String? categoryId,
    bool? isFeatured,
    String? thumbnailImagePath,
  }) async {
    emit(const ProductDetailLoading());
    try {
      final product = await _repository.updateProduct(
        id: id,
        name: name,
        description: description,
        price: price,
        quantity: quantity,
        categoryId: categoryId,
        isFeatured: isFeatured,
        thumbnailImagePath: thumbnailImagePath,
      );
      emit(ProductDetailOperationSuccess(product));
    } on AppException catch (e) {
      emit(ProductDetailError(e.message));
    } catch (_) {
      emit(const ProductDetailError('Failed to update product.'));
    }
  }

  Future<void> deleteProduct(String id) async {
    emit(const ProductDetailLoading());
    try {
      await _repository.deleteProduct(id);
      emit(const ProductDetailDeleted());
    } on AppException catch (e) {
      emit(ProductDetailError(e.message));
    } catch (_) {
      emit(const ProductDetailError('Failed to delete product.'));
    }
  }

  Future<void> addImages({
    required String productId,
    required List<String> imagePaths,
  }) async {
    final current = state;
    if (current is! ProductDetailLoaded) return;
    emit(const ProductDetailLoading());
    try {
      await _repository.addProductImages(
        productId: productId,
        imagePaths: imagePaths,
      );
      final product = await _repository.getProductById(productId);
      emit(ProductDetailOperationSuccess(product));
    } on AppException catch (e) {
      emit(ProductDetailError(e.message));
    } catch (_) {
      emit(const ProductDetailError('Failed to add images.'));
    }
  }

  Future<void> deleteImage({
    required String productId,
    required String imageId,
  }) async {
    emit(const ProductDetailLoading());
    try {
      await _repository.deleteProductImage(
        productId: productId,
        imageId: imageId,
      );
      final product = await _repository.getProductById(productId);
      emit(ProductDetailOperationSuccess(product));
    } on AppException catch (e) {
      emit(ProductDetailError(e.message));
    } catch (_) {
      emit(const ProductDetailError('Failed to delete image.'));
    }
  }

  Future<void> reorderImages({
    required String productId,
    required List<({String id, int displayOrder})> orders,
  }) async {
    emit(const ProductDetailLoading());
    try {
      await _repository.reorderProductImages(
        productId: productId,
        orders: orders,
      );
      final product = await _repository.getProductById(productId);
      emit(ProductDetailOperationSuccess(product));
    } on AppException catch (e) {
      emit(ProductDetailError(e.message));
    } catch (_) {
      emit(const ProductDetailError('Failed to reorder images.'));
    }
  }
}
