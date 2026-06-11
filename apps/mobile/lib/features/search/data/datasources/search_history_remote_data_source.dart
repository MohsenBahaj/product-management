import 'package:dio/dio.dart';
import '../../../../core/network/interceptors/error_interceptor.dart';

abstract class SearchHistoryRemoteDataSource {
  Future<List<String>> getHistory({int? limit});
  Future<void> clearAll();
}

class SearchHistoryRemoteDataSourceImpl implements SearchHistoryRemoteDataSource {
  const SearchHistoryRemoteDataSourceImpl(this._dio);

  final Dio _dio;

  @override
  Future<List<String>> getHistory({int? limit}) async {
    try {
      final res = await _dio.get<Map<String, dynamic>>(
        '/search-history',
        queryParameters: limit != null ? {'limit': limit} : null,
      );
      final data = res.data!['data'] as Map<String, dynamic>;
      return (data['history'] as List<dynamic>)
          .cast<Map<String, dynamic>>()
          .map((item) => item['search_term'] as String)
          .toList();
    } on DioException catch (e) {
      throw _toAppException(e);
    }
  }

  @override
  Future<void> clearAll() async {
    try {
      await _dio.delete<void>('/search-history');
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
