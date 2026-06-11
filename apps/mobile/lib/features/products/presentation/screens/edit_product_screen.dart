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
import '../../../categories/domain/repositories/category_repository.dart';
import '../cubits/product_detail_cubit.dart';
import '../states/product_detail_state.dart';

class EditProductScreen extends StatelessWidget {
  const EditProductScreen({super.key, required this.productId});

  final String productId;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => sl<ProductDetailCubit>()..loadProduct(productId),
      child: _EditProductView(productId: productId),
    );
  }
}

class _EditProductView extends StatefulWidget {
  const _EditProductView({required this.productId});
  final String productId;

  @override
  State<_EditProductView> createState() => _EditProductViewState();
}

class _EditProductViewState extends State<_EditProductView> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  final _priceCtrl = TextEditingController();
  final _qtyCtrl = TextEditingController();
  String? _selectedCategoryId;
  bool _isFeatured = false;
  bool _prefilled = false;
  String? _existingThumbnailUrl;
  String? _newThumbnailPath;
  List<Map<String, String>> _categories = [];
  final _picker = ImagePicker();

  @override
  void initState() {
    super.initState();
    _loadCategories();
  }

  Future<void> _loadCategories() async {
    final cats = await sl<CategoryRepository>().getCategories();
    if (mounted) {
      setState(() {
        _categories = cats.map((c) => {'id': c.id, 'name': c.name}).toList();
      });
    }
  }

  Future<void> _pickThumbnail() async {
    final file = await _picker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 85,
    );
    if (file != null && mounted) {
      setState(() => _newThumbnailPath = file.path);
    }
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _descCtrl.dispose();
    _priceCtrl.dispose();
    _qtyCtrl.dispose();
    super.dispose();
  }

  void _submit() {
    if (!_formKey.currentState!.validate()) return;
    context.read<ProductDetailCubit>().updateProduct(
          id: widget.productId,
          name: _nameCtrl.text.trim(),
          description:
              _descCtrl.text.trim().isEmpty ? null : _descCtrl.text.trim(),
          price: double.tryParse(_priceCtrl.text),
          quantity: int.tryParse(_qtyCtrl.text),
          categoryId: _selectedCategoryId,
          isFeatured: _isFeatured,
          thumbnailImagePath: _newThumbnailPath,
        );
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Scaffold(
      appBar: AppBar(
          title: Text(LocaleKeys.edit_product.tr()), centerTitle: true),
      body: BlocConsumer<ProductDetailCubit, ProductDetailState>(
        listener: (context, state) {
          if (state is ProductDetailOperationSuccess) {
            ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text(LocaleKeys.product_updated.tr())));
            context.pop(true);
          } else if (state is ProductDetailError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                  content: Text(state.message),
                  backgroundColor: scheme.error),
            );
          }
        },
        builder: (context, state) {
          if (state is ProductDetailLoaded && !_prefilled) {
            final p = state.product;
            _nameCtrl.text = p.name;
            _descCtrl.text = p.description ?? '';
            _priceCtrl.text = p.price.toString();
            _qtyCtrl.text = p.quantity.toString();
            _selectedCategoryId = p.categoryId;
            _isFeatured = p.isFeatured;
            _existingThumbnailUrl = p.thumbnailImageUrl;
            _prefilled = true;
          }
          if (state is ProductDetailInitial ||
              (state is ProductDetailLoading && !_prefilled)) {
            return const AppLoading();
          }
          return SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  GestureDetector(
                    onTap: _pickThumbnail,
                    child: Container(
                      height: 140,
                      decoration: BoxDecoration(
                        color: scheme.surfaceContainerHighest,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                            color: scheme.outline.withValues(alpha: 0.4)),
                      ),
                      clipBehavior: Clip.antiAlias,
                      child: _newThumbnailPath != null
                          ? Image.file(
                              File(_newThumbnailPath!),
                              fit: BoxFit.cover,
                              width: double.infinity,
                            )
                          : _existingThumbnailUrl != null
                              ? AppNetworkImage(
                                  url: _existingThumbnailUrl,
                                  fit: BoxFit.cover,
                                  width: double.infinity,
                                  height: 140,
                                )
                              : Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(Icons.add_photo_alternate_outlined,
                                        size: 40,
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
                  if (_existingThumbnailUrl != null || _newThumbnailPath != null)
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
                  const SizedBox(height: 20),
                  AppTextField(
                    controller: _nameCtrl,
                    label: LocaleKeys.product_name.tr(),
                    prefixIcon: const Icon(Icons.inventory_2_outlined),
                    validator: (v) {
                      if (v == null || v.trim().isEmpty) {
                        return LocaleKeys.name_required.tr();
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 14),
                  AppTextField(
                    controller: _descCtrl,
                    label: LocaleKeys.description_optional.tr(),
                    prefixIcon: const Icon(Icons.description_outlined),
                    maxLines: 3,
                  ),
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      Expanded(
                        child: AppTextField(
                          controller: _priceCtrl,
                          label: LocaleKeys.price_label.tr(),
                          keyboardType: TextInputType.number,
                          prefixIcon: Padding(
                            padding: const EdgeInsets.all(12),
                            child: Image.asset(
                              'assets/icons/riyal_icon.jpg',
                              width: 20,
                              height: 20,
                            ),
                          ),
                          validator: (v) {
                            if (v == null || v.trim().isEmpty) {
                              return LocaleKeys.field_required.tr();
                            }
                            if (double.tryParse(v) == null) {
                              return LocaleKeys.invalid_value.tr();
                            }
                            return null;
                          },
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: AppTextField(
                          controller: _qtyCtrl,
                          label: LocaleKeys.quantity_label.tr(),
                          keyboardType: TextInputType.number,
                          prefixIcon: const Icon(Icons.numbers),
                          validator: (v) {
                            if (v == null || v.trim().isEmpty) {
                              return LocaleKeys.field_required.tr();
                            }
                            if (int.tryParse(v) == null) {
                              return LocaleKeys.invalid_value.tr();
                            }
                            return null;
                          },
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  DropdownButtonFormField<String>(
                    value: _selectedCategoryId,
                    decoration: InputDecoration(
                      labelText: LocaleKeys.category_optional.tr(),
                      prefixIcon: const Icon(Icons.category_outlined),
                      border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8)),
                    ),
                    items: [
                      DropdownMenuItem(
                          value: null,
                          child: Text(LocaleKeys.no_category.tr())),
                      ..._categories.map(
                        (c) => DropdownMenuItem(
                            value: c['id'], child: Text(c['name']!)),
                      ),
                    ],
                    onChanged: (v) =>
                        setState(() => _selectedCategoryId = v),
                  ),
                  const SizedBox(height: 12),
                  SwitchListTile(
                    title: Text(LocaleKeys.mark_as_featured.tr()),
                    value: _isFeatured,
                    onChanged: (v) => setState(() => _isFeatured = v),
                    contentPadding: EdgeInsets.zero,
                  ),
                  const SizedBox(height: 20),
                  AppButton(
                    label: LocaleKeys.save_changes.tr(),
                    isLoading: state is ProductDetailLoading,
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
