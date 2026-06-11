import '../../domain/models/product_model.dart';
import 'product_image_dto.dart';

class ProductDto {
  const ProductDto({
    required this.id,
    required this.userId,
    this.categoryId,
    this.categoryName,
    required this.name,
    this.description,
    this.thumbnailImageUrl,
    required this.price,
    required this.quantity,
    required this.isActive,
    required this.isFeatured,
    required this.createdAt,
    required this.updatedAt,
    this.images = const [],
  });

  final String id;
  final String userId;
  final String? categoryId;
  final String? categoryName;
  final String name;
  final String? description;
  final String? thumbnailImageUrl;
  final double price;
  final int quantity;
  final bool isActive;
  final bool isFeatured;
  final DateTime createdAt;
  final DateTime updatedAt;
  final List<ProductImageDto> images;

  factory ProductDto.fromJson(Map<String, dynamic> json) => ProductDto(
        id: json['id'] as String,
        userId: json['user_id'] as String,
        categoryId: json['category_id'] as String?,
        categoryName: json['category_name'] as String?,
        name: json['name'] as String,
        description: json['description'] as String?,
        thumbnailImageUrl: json['thumbnail_image_url'] as String?,
        price: double.parse(json['price'].toString()),
        quantity: json['quantity'] as int? ?? 0,
        isActive: json['is_active'] as bool? ?? true,
        isFeatured: json['is_featured'] as bool? ?? false,
        createdAt: DateTime.parse(json['created_at'] as String),
        updatedAt: DateTime.parse(json['updated_at'] as String),
        images: (json['images'] as List<dynamic>?)
                ?.cast<Map<String, dynamic>>()
                .map(ProductImageDto.fromJson)
                .toList() ??
            const [],
      );

  ProductModel toModel() => ProductModel(
        id: id,
        userId: userId,
        categoryId: categoryId,
        categoryName: categoryName,
        name: name,
        description: description,
        thumbnailImageUrl: thumbnailImageUrl,
        price: price,
        quantity: quantity,
        isActive: isActive,
        isFeatured: isFeatured,
        createdAt: createdAt,
        updatedAt: updatedAt,
        images: images.map((i) => i.toModel()).toList(),
      );
}
