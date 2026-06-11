import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/network/interceptors/error_interceptor.dart';
import '../../domain/models/product_query_params.dart';
import '../../domain/repositories/product_repository.dart';
import '../states/product_list_state.dart';

class ProductListCubit extends Cubit<ProductListState> {
  ProductListCubit({required ProductRepository repository})
      : _repository = repository,
        super(const ProductListInitial());

  final ProductRepository _repository;

  Future<void> loadProducts([ProductQueryParams params = const ProductQueryParams()]) async {
    emit(const ProductListLoading());
    try {
      final result = await _repository.getProducts(params.resetPage());
      emit(ProductListLoaded(
        products: result.products,
        pagination: result.pagination,
        params: params.resetPage(),
      ));
    } on AppException catch (e) {
      emit(ProductListError(e.message));
    } catch (_) {
      emit(const ProductListError('Failed to load products.'));
    }
  }

  Future<void> loadMore() async {
    final current = state;
    if (current is! ProductListLoaded) return;
    if (!current.pagination.hasNextPage || current.isLoadingMore) return;

    emit(current.copyWith(isLoadingMore: true));
    try {
      final nextParams = current.params.nextPage();
      final result = await _repository.getProducts(nextParams);
      emit(current.copyWith(
        products: [...current.products, ...result.products],
        pagination: result.pagination,
        params: nextParams,
        isLoadingMore: false,
      ));
    } on AppException catch (e) {
      emit(current.copyWith(isLoadingMore: false));
      emit(ProductListError(e.message));
    } catch (_) {
      emit(current.copyWith(isLoadingMore: false));
    }
  }

  Future<void> refresh() async {
    final current = state;
    final params = current is ProductListLoaded
        ? current.params.resetPage()
        : const ProductQueryParams();
    await loadProducts(params);
  }

  Future<void> deleteProduct(String id) async {
    try {
      await _repository.deleteProduct(id);
      await refresh();
    } on AppException catch (e) {
      emit(ProductListError(e.message));
    } catch (_) {
      emit(const ProductListError('Failed to delete product.'));
    }
  }
}
