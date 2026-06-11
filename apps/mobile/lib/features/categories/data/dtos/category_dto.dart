import '../../domain/models/category_model.dart';

class CategoryDto {
  const CategoryDto({
    required this.id,
    required this.userId,
    required this.name,
    this.description,
    this.imageUrl,
    required this.isActive,
    required this.createdAt,
    required this.updatedAt,
  });

  final String id;
  final String userId;
  final String name;
  final String? description;
  final String? imageUrl;
  final bool isActive;
  final DateTime createdAt;
  final DateTime updatedAt;

  factory CategoryDto.fromJson(Map<String, dynamic> json) => CategoryDto(
        id: json['id'] as String,
        userId: json['user_id'] as String,
        name: json['name'] as String,
        description: json['description'] as String?,
        imageUrl: json['image_url'] as String?,
        isActive: json['is_active'] as bool? ?? true,
        createdAt: DateTime.parse(json['created_at'] as String),
        updatedAt: DateTime.parse(json['updated_at'] as String),
      );

  CategoryModel toModel() => CategoryModel(
        id: id,
        userId: userId,
        name: name,
        description: description,
        imageUrl: imageUrl,
        isActive: isActive,
        createdAt: createdAt,
        updatedAt: updatedAt,
      );
}
