import 'dart:io';
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import '../../../../core/di/injection.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../generated/locale_keys.g.dart';
import '../../../../shared/widgets/app_button.dart';
import '../../../../shared/widgets/app_loading.dart';
import '../../../../shared/widgets/app_network_image.dart';
import '../../../../shared/widgets/app_text_field.dart';
import '../cubits/category_cubit.dart';
import '../states/category_state.dart';

class EditCategoryScreen extends StatelessWidget {
  const EditCategoryScreen({super.key, required this.categoryId});

  final String categoryId;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => sl<CategoryCubit>()..loadCategories(),
      child: _EditCategoryView(categoryId: categoryId),
    );
  }
}

class _EditCategoryView extends StatefulWidget {
  const _EditCategoryView({required this.categoryId});
  final String categoryId;

  @override
  State<_EditCategoryView> createState() => _EditCategoryViewState();
}

class _EditCategoryViewState extends State<_EditCategoryView> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  bool _prefilled = false;
  String? _existingImageUrl;
  String? _newImagePath;
  final _picker = ImagePicker();

  Future<void> _pickImage() async {
    final file = await _picker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 85,
    );
    if (file != null && mounted) {
      setState(() => _newImagePath = file.path);
    }
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _descCtrl.dispose();
    super.dispose();
  }

  void _submit() {
    if (!_formKey.currentState!.validate()) return;
    context.read<CategoryCubit>().updateCategory(
          id: widget.categoryId,
          name: _nameCtrl.text.trim(),
          description:
              _descCtrl.text.trim().isEmpty ? null : _descCtrl.text.trim(),
          imagePath: _newImagePath,
        );
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Scaffold(
      appBar: AppBar(
          title: Text(LocaleKeys.edit_category.tr()), centerTitle: true),
      body: BlocConsumer<CategoryCubit, CategoryState>(
        listener: (context, state) {
          if (state is CategoryOperationSuccess) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text(LocaleKeys.category_updated.tr())),
            );
            context.pop(true);
          } else if (state is CategoryError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                  content: Text(state.message),
                  backgroundColor: scheme.error),
            );
          }
        },
        builder: (context, state) {
          if (state is CategoryLoaded && !_prefilled) {
            final cat = state.categories
                .where((c) => c.id == widget.categoryId)
                .firstOrNull;
            if (cat != null) {
              _nameCtrl.text = cat.name;
              _descCtrl.text = cat.description ?? '';
              _existingImageUrl = cat.imageUrl;
              _prefilled = true;
            }
          }
          if (!_prefilled) return const AppLoading();
          return SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  GestureDetector(
                    onTap: _pickImage,
                    child: Container(
                      height: 120,
                      decoration: BoxDecoration(
                        color: scheme.surfaceContainerHighest,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                            color: scheme.outline.withValues(alpha: 0.4)),
                      ),
                      clipBehavior: Clip.antiAlias,
                      child: _newImagePath != null
                          ? Image.file(
                              File(_newImagePath!),
                              fit: BoxFit.cover,
                              width: double.infinity,
                            )
                          : _existingImageUrl != null
                              ? AppNetworkImage(
                                  url: _existingImageUrl,
                                  fit: BoxFit.cover,
                                  width: double.infinity,
                                  height: 120,
                                )
                              : Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(Icons.add_photo_alternate_outlined,
                                        size: 36,
                                        color: scheme.onSurfaceVariant),
                                    const SizedBox(height: 8),
                                    Text(
                                      LocaleKeys.tap_to_change_image.tr(),
                                      style: AppTextStyles.bodySm.copyWith(
                                          color: scheme.onSurfaceVariant),
                                    ),
                                  ],
                                ),
                    ),
                  ),
                  if (_existingImageUrl != null || _newImagePath != null)
                    Padding(
                      padding: const EdgeInsets.only(top: 6),
                      child: Text(
                        LocaleKeys.tap_to_change_image.tr(),
                        textAlign: TextAlign.center,
                        style: AppTextStyles.bodySm.copyWith(
                          color: scheme.onSurfaceVariant,
                          fontSize: 12,
                        ),
                      ),
                    ),
                  const SizedBox(height: 24),
                  AppTextField(
                    controller: _nameCtrl,
                    label: LocaleKeys.category_name.tr(),
                    prefixIcon: const Icon(Icons.label_outline),
                    validator: (v) {
                      if (v == null || v.trim().isEmpty) {
                        return LocaleKeys.name_required.tr();
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),
                  AppTextField(
                    controller: _descCtrl,
                    label: LocaleKeys.description_optional.tr(),
                    prefixIcon: const Icon(Icons.description_outlined),
                    maxLines: 3,
                  ),
                  const SizedBox(height: 28),
                  AppButton(
                    label: LocaleKeys.save_changes.tr(),
                    isLoading: state is CategoryLoading,
                    onPressed: _submit,
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
