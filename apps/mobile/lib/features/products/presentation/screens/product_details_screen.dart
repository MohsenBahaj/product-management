import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/di/injection.dart';
import '../../../../core/router/route_names.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../generated/locale_keys.g.dart';
import '../../../../shared/widgets/app_error_widget.dart';
import '../../../../shared/widgets/app_loading.dart';
import '../../../../shared/widgets/app_network_image.dart';
import '../../../../shared/widgets/riyal_price.dart';
import '../../domain/models/product_model.dart';
import '../cubits/product_detail_cubit.dart';
import '../states/product_detail_state.dart';

class ProductDetailsScreen extends StatelessWidget {
  const ProductDetailsScreen({super.key, required this.productId});

  final String productId;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => sl<ProductDetailCubit>()..loadProduct(productId),
      child: _ProductDetailsView(productId: productId),
    );
  }
}

class _ProductDetailsView extends StatelessWidget {
  const _ProductDetailsView({required this.productId});
  final String productId;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: BlocConsumer<ProductDetailCubit, ProductDetailState>(
          listener: (context, state) {
            if (state is ProductDetailOperationSuccess) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text(LocaleKeys.product_updated.tr())),
              );
            } else if (state is ProductDetailDeleted) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text(LocaleKeys.product_deleted.tr())),
              );
              context.pop();
            } else if (state is ProductDetailError) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(state.message),
                  backgroundColor: Theme.of(context).colorScheme.error,
                ),
              );
            }
          },
          builder: (context, state) {
            return switch (state) {
              ProductDetailInitial() || ProductDetailLoading() => Scaffold(
                appBar: AppBar(),
                body: const AppLoading(),
              ),
              ProductDetailError(:final message) => Scaffold(
                appBar: AppBar(),
                body: AppErrorWidget(
                  message: message,
                  onRetry: () =>
                      context.read<ProductDetailCubit>().loadProduct(productId),
                ),
              ),
              ProductDetailDeleted() => Scaffold(
                appBar: AppBar(),
                body: const AppLoading(),
              ),
              ProductDetailLoaded(:final product) ||
              ProductDetailOperationSuccess(
                :final product,
              ) => _ProductDetailBody(product: product),
            };
          },
        ),
      ),
    );
  }
}

class _ProductDetailBody extends StatelessWidget {
  const _ProductDetailBody({required this.product});
  final ProductModel product;

  Future<void> _openEdit(BuildContext context) async {
    final result = await context.push<bool>(
      RouteNames.editProductPath(product.id),
    );
    if (result == true && context.mounted) {
      context.read<ProductDetailCubit>().loadProduct(product.id);
    }
  }

  Future<void> _confirmDelete(BuildContext context) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(LocaleKeys.delete_product.tr()),
        content: Text(LocaleKeys.delete_product_confirm.tr()),
        actions: [
          TextButton(
            onPressed: () => ctx.pop(false),
            child: Text(LocaleKeys.cancel.tr()),
          ),
          FilledButton(
            style: FilledButton.styleFrom(
              backgroundColor: Theme.of(ctx).colorScheme.error,
            ),
            onPressed: () => ctx.pop(true),
            child: Text(LocaleKeys.delete.tr()),
          ),
        ],
      ),
    );
    if (confirmed == true && context.mounted) {
      context.read<ProductDetailCubit>().deleteProduct(product.id);
    }
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final images = [
      if (product.thumbnailImageUrl != null) product.thumbnailImageUrl!,
      ...product.images.map((img) => img.imageUrl),
    ];

    return CustomScrollView(
      slivers: [
        SliverAppBar(
          expandedHeight: 280,
          pinned: true,
          // actions: [
          //   IconButton(
          //     icon: const Icon(Icons.edit_outlined),
          //     onPressed: () => _openEdit(context),
          //   ),
          //   IconButton(
          //     icon: Icon(Icons.delete_outline, color: scheme.error),
          //     onPressed: () => _confirmDelete(context),
          //   ),
          // ],
          flexibleSpace: FlexibleSpaceBar(
            background: images.isEmpty
                ? Container(
                    color: scheme.surfaceContainerHighest,
                    child: Icon(
                      Icons.image_outlined,
                      size: 64,
                      color: scheme.onSurfaceVariant,
                    ),
                  )
                : images.length == 1
                ? AppNetworkImage(url: images.first)
                : PageView.builder(
                    itemCount: images.length,
                    itemBuilder: (_, i) => AppNetworkImage(url: images[i]),
                  ),
          ),
        ),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Text(
                        product.name,
                        style: AppTextStyles.headlineLgMobile.copyWith(
                          color: scheme.onSurface,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    if (product.isFeatured)
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: const Color(
                            0xFFF39C12,
                          ).withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(
                              Icons.star,
                              color: Color(0xFFF39C12),
                              size: 14,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              LocaleKeys.featured_badge.tr(),
                              style: const TextStyle(
                                color: Color(0xFFF39C12),
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    RiyalPrice(
                      price: product.price,
                      iconSize: 22,
                      style: AppTextStyles.headlineLg.copyWith(
                        color: scheme.primary,
                        fontSize: 26,
                      ),
                    ),
                    const Spacer(),
                    _InfoChip(
                      icon: Icons.inventory_outlined,
                      label: '${product.quantity} ${LocaleKeys.in_stock.tr()}',
                    ),
                  ],
                ),
                if (product.categoryName != null) ...[
                  const SizedBox(height: 8),
                  _InfoChip(
                    icon: Icons.category_outlined,
                    label: product.categoryName!,
                  ),
                ],
                const SizedBox(height: 20),
                const Divider(),
                const SizedBox(height: 16),
                if (product.description != null &&
                    product.description!.isNotEmpty) ...[
                  Text(
                    LocaleKeys.description.tr(),
                    style: AppTextStyles.titleMd.copyWith(
                      color: scheme.onSurface,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    product.description!,
                    style: AppTextStyles.bodyBase.copyWith(
                      color: scheme.onSurfaceVariant,
                      height: 1.6,
                    ),
                  ),
                  const SizedBox(height: 24),
                ],
                SizedBox(
                  width: double.infinity,
                  child: FilledButton.icon(
                    icon: const Icon(Icons.edit_outlined),
                    label: Text(LocaleKeys.edit_product.tr()),
                    onPressed: () => _openEdit(context),
                  ),
                ),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      foregroundColor: scheme.error,
                      side: BorderSide(color: scheme.error),
                    ),
                    icon: const Icon(Icons.delete_outline),
                    label: Text(LocaleKeys.delete_product.tr()),
                    onPressed: () => _confirmDelete(context),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _InfoChip extends StatelessWidget {
  const _InfoChip({required this.icon, required this.label});
  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: scheme.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: scheme.onSurfaceVariant),
          const SizedBox(width: 4),
          Text(
            label,
            style: AppTextStyles.bodySm.copyWith(
              fontSize: 12,
              color: scheme.onSurfaceVariant,
            ),
          ),
        ],
      ),
    );
  }
}
