import '../../domain/models/product_image_model.dart';

class ProductImageDto {
  const ProductImageDto({
    required this.id,
    required this.productId,
    required this.imageUrl,
    required this.displayOrder,
    required this.createdAt,
  });

  final String id;
  final String productId;
  final String imageUrl;
  final int displayOrder;
  final DateTime createdAt;

  factory ProductImageDto.fromJson(Map<String, dynamic> json) =>
      ProductImageDto(
        id: json['id'] as String,
        productId: json['product_id'] as String,
        imageUrl: json['image_url'] as String,
        displayOrder: json['display_order'] as int? ?? 0,
        createdAt: DateTime.parse(json['created_at'] as String),
      );

  ProductImageModel toModel() => ProductImageModel(
        id: id,
        productId: productId,
        imageUrl: imageUrl,
        displayOrder: displayOrder,
        createdAt: createdAt,
      );
}
