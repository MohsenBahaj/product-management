import 'package:equatable/equatable.dart';
import 'product_image_model.dart';

class ProductModel extends Equatable {
  const ProductModel({
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
  final List<ProductImageModel> images;

  @override
  List<Object?> get props => [
        id,
        userId,
        categoryId,
        categoryName,
        name,
        description,
        thumbnailImageUrl,
        price,
        quantity,
        isActive,
        isFeatured,
        createdAt,
        updatedAt,
        images,
      ];
}
