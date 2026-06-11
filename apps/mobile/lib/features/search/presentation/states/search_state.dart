import 'package:equatable/equatable.dart';
import '../../../products/domain/models/product_model.dart';

sealed class SearchState extends Equatable {
  const SearchState();
}

class SearchInitial extends SearchState {
  const SearchInitial({required this.recentSearches});
  final List<String> recentSearches;
  @override
  List<Object?> get props => [recentSearches];
}

class SearchLoading extends SearchState {
  const SearchLoading();
  @override
  List<Object?> get props => const [];
}

class SearchLoaded extends SearchState {
  const SearchLoaded({required this.results, required this.query});
  final List<ProductModel> results;
  final String query;
  @override
  List<Object?> get props => [results, query];
}

class SearchError extends SearchState {
  const SearchError(this.message);
  final String message;
  @override
  List<Object?> get props => [message];
}
