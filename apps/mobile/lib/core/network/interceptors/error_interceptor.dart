import 'package:dio/dio.dart';

class AppException implements Exception {
  const AppException({required this.message, this.statusCode});

  final String message;
  final int? statusCode;

  @override
  String toString() => message;
}

class ErrorInterceptor extends Interceptor {
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    final message = switch (err.type) {
      DioExceptionType.connectionTimeout ||
      DioExceptionType.sendTimeout ||
      DioExceptionType.receiveTimeout =>
        'Connection timed out. Please try again.',
      DioExceptionType.connectionError => 'No internet connection.',
      DioExceptionType.badResponse => _messageFromResponse(err.response),
      _ => 'An unexpected error occurred.',
    };

    handler.reject(
      DioException(
        requestOptions: err.requestOptions,
        error: AppException(
          message: message,
          statusCode: err.response?.statusCode,
        ),
        response: err.response,
        type: err.type,
      ),
    );
  }

  String _messageFromResponse(Response? response) {
    if (response == null) return 'Server error.';
    final data = response.data;
    if (data is Map<String, dynamic>) {
      return (data['message'] ?? data['error'] ?? 'Server error.').toString();
    }
    return 'Server error (${response.statusCode}).';
  }
}
