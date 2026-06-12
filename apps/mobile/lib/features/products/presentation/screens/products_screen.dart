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
        ..loadProducts(ProductQueryParams(
          categoryId: initialCategoryId,
          sortBy: 'price',
          order: 'desc',
        )),
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
  bool _priceAscending = false; // false = high to low
  String? _selectedCategoryId;
  List<CategoryModel> _categories = [];
  CategoryModel? _filterCategory; // for the banner when navigating from dashboard

  @override
  void initState() {
    super.initState();
    _selectedCategoryId = widget.initialCategoryId;
    if (widget.initialCategoryId != null) {
      _loadFilterCategory(widget.initialCategoryId!);
    } else {
      _loadCategories();
    }
  }

  Future<void> _loadFilterCategory(String id) async {
    try {
      final cat = await sl<CategoryRepository>().getCategoryById(id);
      if (mounted) setState(() => _filterCategory = cat);
    } catch (_) {}
  }

  Future<void> _loadCategories() async {
    try {
      final cats = await sl<CategoryRepository>().getCategories();
      if (mounted) setState(() => _categories = cats);
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
            categoryId: _selectedCategoryId,
            featured: _featuredOnly ? true : null,
            sortBy: 'price',
            order: _priceAscending ? 'asc' : 'desc',
          ),
        );
  }

  void _applyFilters() {
    context.read<ProductListCubit>().loadProducts(
          ProductQueryParams(
            search: _searchCtrl.text,
            categoryId: _selectedCategoryId,
            featured: _featuredOnly ? true : null,
            sortBy: 'price',
            order: _priceAscending ? 'asc' : 'desc',
          ),
        );
  }

  String _priceSortLabel() => _priceAscending
      ? LocaleKeys.price_low_to_high.tr()
      : LocaleKeys.price_high_to_low.tr();

  String _categoryLabel() {
    if (_selectedCategoryId == null) return LocaleKeys.all_categories.tr();
    final match =
        _categories.where((c) => c.id == _selectedCategoryId).firstOrNull;
    return match?.name ?? LocaleKeys.all_categories.tr();
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
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
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
                  PopupMenuButton<bool>(
                    initialValue: _priceAscending,
                    onSelected: (v) {
                      setState(() => _priceAscending = v);
                      _applyFilters();
                    },
                    child: Chip(
                      avatar: const Icon(Icons.sort, size: 16),
                      label: Text(
                        _priceSortLabel(),
                        style: AppTextStyles.bodySm,
                      ),
                    ),
                    itemBuilder: (_) => [
                      PopupMenuItem(
                        value: false,
                        child: Text(LocaleKeys.price_high_to_low.tr()),
                      ),
                      PopupMenuItem(
                        value: true,
                        child: Text(LocaleKeys.price_low_to_high.tr()),
                      ),
                    ],
                  ),
                  if (widget.initialCategoryId == null) ...[
                    const SizedBox(width: 8),
                    PopupMenuButton<String?>(
                      initialValue: _selectedCategoryId,
                      onSelected: (v) {
                        setState(() => _selectedCategoryId = v);
                        _applyFilters();
                      },
                      child: Chip(
                        avatar: const Icon(Icons.category_outlined, size: 16),
                        label: Text(
                          _categoryLabel(),
                          style: AppTextStyles.bodySm,
                        ),
                      ),
                      itemBuilder: (_) => [
                        PopupMenuItem<String?>(
                          value: null,
                          child: Text(LocaleKeys.all_categories.tr()),
                        ),
                        ..._categories.map(
                          (cat) => PopupMenuItem<String?>(
                            value: cat.id,
                            child: Text(cat.name),
                          ),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
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
