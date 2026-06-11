import 'package:equatable/equatable.dart';

class ProductImageModel extends Equatable {
  const ProductImageModel({
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

  @override
  List<Object?> get props => [id, productId, imageUrl, displayOrder, createdAt];
}
