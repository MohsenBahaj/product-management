import 'package:equatable/equatable.dart';

class ProductQueryParams extends Equatable {
  const ProductQueryParams({
    this.page = 1,
    this.limit = 20,
    this.search,
    this.categoryId,
    this.minPrice,
    this.maxPrice,
    this.featured,
    this.sortBy = 'created_at',
    this.order = 'desc',
  });

  final int page;
  final int limit;
  final String? search;
  final String? categoryId;
  final double? minPrice;
  final double? maxPrice;
  final bool? featured;
  final String sortBy;
  final String order;

  ProductQueryParams copyWith({
    int? page,
    int? limit,
    String? search,
    String? categoryId,
    double? minPrice,
    double? maxPrice,
    bool? featured,
    String? sortBy,
    String? order,
  }) =>
      ProductQueryParams(
        page: page ?? this.page,
        limit: limit ?? this.limit,
        search: search ?? this.search,
        categoryId: categoryId ?? this.categoryId,
        minPrice: minPrice ?? this.minPrice,
        maxPrice: maxPrice ?? this.maxPrice,
        featured: featured ?? this.featured,
        sortBy: sortBy ?? this.sortBy,
        order: order ?? this.order,
      );

  ProductQueryParams nextPage() => copyWith(page: page + 1);
  ProductQueryParams resetPage() => copyWith(page: 1);

  Map<String, dynamic> toQueryMap() => {
        'page': page,
        'limit': limit,
        if (search != null && search!.isNotEmpty) 'search': search,
        if (categoryId != null) 'categoryId': categoryId,
        if (minPrice != null) 'minPrice': minPrice,
        if (maxPrice != null) 'maxPrice': maxPrice,
        if (featured == true) 'featured': 'true',
        'sortBy': sortBy,
        'order': order,
      };

  @override
  List<Object?> get props => [
        page,
        limit,
        search,
        categoryId,
        minPrice,
        maxPrice,
        featured,
        sortBy,
        order,
      ];
}
