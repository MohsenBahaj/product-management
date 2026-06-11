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
import '../../../../shared/widgets/empty_state_widget.dart';
import '../../../categories/domain/models/category_model.dart';
import '../../../categories/domain/repositories/category_repository.dart';
import '../../domain/models/product_model.dart';
import '../../domain/models/product_query_params.dart';
import '../cubits/product_list_cubit.dart';
import '../states/product_list_state.dart';
import '../widgets/product_card.dart';
import '../widgets/product_list_tile.dart';

class ProductsScreen extends StatelessWidget {
  const ProductsScreen({super.key, this.initialCategoryId});

  final String? initialCategoryId;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => sl<ProductListCubit>()
        ..loadProducts(ProductQueryParams(categoryId: initialCategoryId)),
      child: _ProductsView(initialCategoryId: initialCategoryId),
    );
  }
}

class _ProductsView extends StatefulWidget {
  const _ProductsView({this.initialCategoryId});
  final String? initialCategoryId;

  @override
  State<_ProductsView> createState() => _ProductsViewState();
}

class _ProductsViewState extends State<_ProductsView> {
  final _searchCtrl = TextEditingController();
  bool _isGrid = true;
  bool _featuredOnly = false;
  String _sortBy = 'created_at';
  CategoryModel? _filterCategory;

  @override
  void initState() {
    super.initState();
    if (widget.initialCategoryId != null) {
      _loadFilterCategory(widget.initialCategoryId!);
    }
  }

  Future<void> _loadFilterCategory(String id) async {
    try {
      final cat = await sl<CategoryRepository>().getCategoryById(id);
      if (mounted) setState(() => _filterCategory = cat);
    } catch (_) {}
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  void _search(String query) {
    context.read<ProductListCubit>().loadProducts(
          ProductQueryParams(
            search: query,
            categoryId: widget.initialCategoryId,
            featured: _featuredOnly ? true : null,
            sortBy: _sortBy,
          ),
        );
  }

  void _applyFilters() {
    context.read<ProductListCubit>().loadProducts(
          ProductQueryParams(
            search: _searchCtrl.text,
            categoryId: widget.initialCategoryId,
            featured: _featuredOnly ? true : null,
            sortBy: _sortBy,
          ),
        );
  }

  String _sortLabel() {
    if (_sortBy == 'price') return LocaleKeys.sort_price.tr();
    if (_sortBy == 'name') return LocaleKeys.sort_name.tr();
    return LocaleKeys.newest_first.tr();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(LocaleKeys.products.tr()),
        centerTitle: true,
        actions: [
          IconButton(
            icon: Icon(_isGrid ? Icons.view_list : Icons.grid_view),
            onPressed: () => setState(() => _isGrid = !_isGrid),
            tooltip: _isGrid
                ? LocaleKeys.list_view.tr()
                : LocaleKeys.grid_view.tr(),
          ),
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () async {
              final result = await context.push<bool>(RouteNames.addProduct);
              if (result == true && context.mounted) {
                context.read<ProductListCubit>().refresh();
              }
            },
          ),
        ],
      ),
      body: Column(
        children: [
          if (widget.initialCategoryId != null)
            _CategoryFilterBanner(
              category: _filterCategory,
              categoryId: widget.initialCategoryId!,
            ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
            child: TextField(
              controller: _searchCtrl,
              onChanged: _search,
              decoration: InputDecoration(
                hintText: LocaleKeys.search_products.tr(),
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchCtrl.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          _searchCtrl.clear();
                          _search('');
                        },
                      )
                    : null,
                isDense: true,
                contentPadding: const EdgeInsets.symmetric(vertical: 12),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            child: Row(
              children: [
                FilterChip(
                  label: Text(LocaleKeys.featured_filter.tr()),
                  selected: _featuredOnly,
                  onSelected: (v) {
                    setState(() => _featuredOnly = v);
                    _applyFilters();
                  },
                ),
                const SizedBox(width: 8),
                PopupMenuButton<String>(
                  initialValue: _sortBy,
                  onSelected: (v) {
                    setState(() => _sortBy = v);
                    _applyFilters();
                  },
                  child: Chip(
                    avatar: const Icon(Icons.sort, size: 16),
                    label: Text(
                      _sortLabel(),
                      style: AppTextStyles.bodySm,
                    ),
                  ),
                  itemBuilder: (_) => [
                    PopupMenuItem(
                        value: 'created_at',
                        child: Text(LocaleKeys.newest_first_menu.tr())),
                    PopupMenuItem(
                        value: 'price',
                        child: Text(LocaleKeys.sort_price_menu.tr())),
                    PopupMenuItem(
                        value: 'name',
                        child: Text(LocaleKeys.sort_name_menu.tr())),
                  ],
                ),
              ],
            ),
          ),
          Expanded(
            child: BlocBuilder<ProductListCubit, ProductListState>(
              builder: (context, state) {
                return switch (state) {
                  ProductListInitial() ||
                  ProductListLoading() =>
                    const AppLoading(),
                  ProductListError(:final message) => AppErrorWidget(
                      message: message,
                      onRetry: context.read<ProductListCubit>().refresh,
                    ),
                  ProductListLoaded(
                    :final products,
                    :final isLoadingMore
                  ) =>
                    products.isEmpty
                        ? EmptyStateWidget(
                            title: LocaleKeys.no_products_found.tr(),
                            message: LocaleKeys.try_adjusting_search.tr(),
                            icon: Icons.inventory_2_outlined,
                            actionLabel: LocaleKeys.add_product.tr(),
                            onAction: () =>
                                context.push(RouteNames.addProduct),
                          )
                        : RefreshIndicator(
                            onRefresh:
                                context.read<ProductListCubit>().refresh,
                            child: _isGrid
                                ? _ProductGrid(
                                    products: products,
                                    isLoadingMore: isLoadingMore)
                                : _ProductList(
                                    products: products,
                                    isLoadingMore: isLoadingMore),
                          ),
                };
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _CategoryFilterBanner extends StatelessWidget {
  const _CategoryFilterBanner({
    required this.category,
    required this.categoryId,
  });
  final CategoryModel? category;
  final String categoryId;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Container(
      width: double.infinity,
      color: scheme.primaryContainer,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: Row(
        children: [
          Icon(Icons.category_outlined,
              size: 16, color: scheme.onPrimaryContainer),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              category?.name ?? LocaleKeys.loading.tr(),
              style: AppTextStyles.bodySm.copyWith(
                color: scheme.onPrimaryContainer,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          TextButton.icon(
            onPressed: () async {
              final result =
                  await context.push<bool>('/categories/$categoryId/edit');
              if (result == true && context.mounted) {
                context.read<ProductListCubit>().refresh();
              }
            },
            style: TextButton.styleFrom(
              foregroundColor: scheme.onPrimaryContainer,
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            ),
            icon: const Icon(Icons.edit_outlined, size: 14),
            label: Text(
              LocaleKeys.edit_category.tr(),
              style: AppTextStyles.bodySm.copyWith(
                color: scheme.onPrimaryContainer,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ProductGrid extends StatelessWidget {
  const _ProductGrid({required this.products, required this.isLoadingMore});
  final List<ProductModel> products;
  final bool isLoadingMore;

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      padding: const EdgeInsets.all(12),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 10,
        mainAxisSpacing: 10,
        childAspectRatio: 0.72,
      ),
      itemCount: products.length + (isLoadingMore ? 2 : 0),
      itemBuilder: (context, i) {
        if (i >= products.length) {
          return const Card(
            child: Center(
                child: CircularProgressIndicator(strokeWidth: 2)),
          );
        }
        final p = products[i];
        return ProductCard(
          product: p,
          onTap: () => context.push(RouteNames.productDetailsPath(p.id)),
        );
      },
    );
  }
}

class _ProductList extends StatelessWidget {
  const _ProductList({required this.products, required this.isLoadingMore});
  final List<ProductModel> products;
  final bool isLoadingMore;

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      padding: const EdgeInsets.all(12),
      itemCount: products.length + (isLoadingMore ? 1 : 0),
      itemBuilder: (context, i) {
        if (i >= products.length) {
          return const Center(
            child: Padding(
              padding: EdgeInsets.all(16),
              child: CircularProgressIndicator(strokeWidth: 2),
            ),
          );
        }
        final p = products[i];
        return ProductListTile(
          product: p,
          onTap: () => context.push(RouteNames.productDetailsPath(p.id)),
        );
      },
    );
  }
}
