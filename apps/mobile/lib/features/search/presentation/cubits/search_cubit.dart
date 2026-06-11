import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../products/domain/models/product_query_params.dart';
import '../../../products/domain/repositories/product_repository.dart';
import '../../domain/repositories/search_history_repository.dart';
import '../states/search_state.dart';

class SearchCubit extends Cubit<SearchState> {
  SearchCubit({
    required ProductRepository productRepository,
    required SearchHistoryRepository searchHistoryRepository,
  })  : _productRepository = productRepository,
        _searchHistoryRepository = searchHistoryRepository,
        super(const SearchInitial(recentSearches: []));

  final ProductRepository _productRepository;
  final SearchHistoryRepository _searchHistoryRepository;
  List<String> _recentSearches = [];

  Future<void> loadHistory() async {
    try {
      _recentSearches = await _searchHistoryRepository.getHistory(limit: 20);
      if (state is SearchInitial) {
        emit(SearchInitial(recentSearches: List.unmodifiable(_recentSearches)));
      }
    } catch (_) {
      // Non-critical — show empty history on error
    }
  }

  Future<void> search(String query) async {
    if (query.trim().isEmpty) {
      emit(SearchInitial(recentSearches: List.unmodifiable(_recentSearches)));
      return;
    }
    emit(const SearchLoading());
    try {
      final result = await _productRepository.getProducts(
        ProductQueryParams(search: query, limit: 50),
      );
      // Backend auto-saves search term; reload history in background
      _refreshHistoryBackground();
      emit(SearchLoaded(results: result.products, query: query));
    } catch (e) {
      emit(SearchError(e.toString()));
    }
  }

  Future<void> _refreshHistoryBackground() async {
    try {
      _recentSearches = await _searchHistoryRepository.getHistory(limit: 20);
    } catch (_) {}
  }

  void clearSearch() {
    emit(SearchInitial(recentSearches: List.unmodifiable(_recentSearches)));
  }

  void removeHistory(String term) {
    _recentSearches = List.of(_recentSearches)..remove(term);
    if (state is SearchInitial) {
      emit(SearchInitial(recentSearches: List.unmodifiable(_recentSearches)));
    }
  }

  Future<void> clearHistory() async {
    try {
      await _searchHistoryRepository.clearAll();
      _recentSearches = [];
      if (state is SearchInitial) {
        emit(const SearchInitial(recentSearches: []));
      }
    } catch (_) {}
  }
}
