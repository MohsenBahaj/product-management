import '../../domain/repositories/search_history_repository.dart';
import '../datasources/search_history_remote_data_source.dart';

class SearchHistoryRepositoryImpl implements SearchHistoryRepository {
  const SearchHistoryRepositoryImpl({required this.remoteDataSource});

  final SearchHistoryRemoteDataSource remoteDataSource;

  @override
  Future<List<String>> getHistory({int? limit}) =>
      remoteDataSource.getHistory(limit: limit);

  @override
  Future<void> clearAll() => remoteDataSource.clearAll();
}
