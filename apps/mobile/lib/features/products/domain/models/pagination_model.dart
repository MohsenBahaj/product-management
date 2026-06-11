import 'package:equatable/equatable.dart';

class PaginationModel extends Equatable {
  const PaginationModel({
    required this.page,
    required this.limit,
    required this.total,
    required this.pages,
  });

  final int page;
  final int limit;
  final int total;
  final int pages;

  bool get hasNextPage => page < pages;

  @override
  List<Object?> get props => [page, limit, total, pages];
}
