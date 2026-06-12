import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/di/injection.dart';
import '../../../../core/router/route_names.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../generated/locale_keys.g.dart';
import '../../../../shared/widgets/app_error_widget.dart';
import '../../../../shared/widgets/app_loading.dart';
import '../../../../shared/widgets/app_network_image.dart';
import '../../../../shared/widgets/riyal_price.dart';
import '../../../../shared/widgets/empty_state_widget.dart';
import '../../../../shared/widgets/section_header.dart';
import '../../../auth/presentation/cubits/auth_cubit.dart';
import '../../../auth/presentation/states/auth_state.dart';
import '../../../categories/domain/models/category_model.dart';
import '../../../products/domain/models/product_model.dart';
import '../cubits/dashboard_cubit.dart';
import '../states/dashboard_state.dart';
import '../widgets/dashboard_stat_card.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  @override
  void initState() {
    super.initState();
    sl<DashboardCubit>().load();
  }

  @override
  Widget build(BuildContext context) {
    return BlocProvider.value(
      value: sl<DashboardCubit>(),
      child: const _DashboardView(),
    );
  }
}

class _DashboardView extends StatelessWidget {
  const _DashboardView();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: BlocBuilder<DashboardCubit, DashboardState>(
        builder: (context, state) {
          return switch (state) {
            DashboardInitial() || DashboardLoading() => const AppLoading(),
            DashboardError(:final message) => AppErrorWidget(
              message: message,
              onRetry: () => context.read<DashboardCubit>().load(),
            ),
            DashboardLoaded() => _DashboardContent(state: state),
          };
        },
      ),
    );
  }
}

class _DashboardContent extends StatelessWidget {
  const _DashboardContent({required this.state});

  final DashboardLoaded state;

  String _greeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return LocaleKeys.good_morning.tr();
    if (hour < 17) return LocaleKeys.good_afternoon.tr();
    return LocaleKeys.good_evening.tr();
  }

  @override
  Widget build(BuildContext context) {
    final authState = context.read<AuthCubit>().state;
    final firstName = authState is AuthAuthenticated
        ? authState.user.name.split(' ').first
        : '';

    return RefreshIndicator(
      onRefresh: () => context.read<DashboardCubit>().load(),
      child: CustomScrollView(
        slivers: [
          SliverAppBar(
            pinned: true,
            toolbarHeight: 76,
            scrolledUnderElevation: 1,
            backgroundColor: Theme.of(context).scaffoldBackgroundColor,
            titleSpacing: 20,
            automaticallyImplyLeading: false,
            title: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  '${_greeting()},',
                  style: AppTextStyles.bodySm.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
                ),
                Text(
                  firstName,
                  style: AppTextStyles.headlineLgMobile.copyWith(
                    color: AppColors.primary,
                  ),
                ),
              ],
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  _StatsGrid(state: state),
                  const SizedBox(height: 24),
                  _CategoriesSection(
                    categories: state.categories,
                    countPerCategory: state.productCountPerCategory,
                  ),
                  const SizedBox(height: 24),
                  _FeaturedSection(products: state.featuredProducts),
                  const SizedBox(height: 24),
                  _RecentSection(products: state.recentProducts),
                  const SizedBox(height: 24),
                  const _QuickActions(),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _StatsGrid extends StatelessWidget {
  const _StatsGrid({required this.state});
  final DashboardLoaded state;

  @override
  Widget build(BuildContext context) {
    final s = state.stats;
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      childAspectRatio: 1.5,
      children: [
        DashboardStatCard(
          label: LocaleKeys.total_products.tr(),
          value: s.totalProducts.toString(),
          icon: Icons.inventory_2_outlined,
          color: AppColors.primary,
        ),
        DashboardStatCard(
          label: LocaleKeys.total_categories.tr(),
          value: s.totalCategories.toString(),
          icon: Icons.category_outlined,
          color: const Color(0xFFE67E22),
        ),
        DashboardStatCard(
          label: LocaleKeys.total_featured.tr(),
          value: s.featuredProducts.toString(),
          icon: Icons.star_outline,
          color: const Color(0xFFF39C12),
        ),
        DashboardStatCard(
          label: LocaleKeys.total_inventory.tr(),
          value: s.totalInventory.toString(),
          icon: Icons.warehouse_outlined,
          color: const Color(0xFF27AE60),
        ),
      ],
    );
  }
}

class _CategoriesSection extends StatelessWidget {
  const _CategoriesSection({
    required this.categories,
    required this.countPerCategory,
  });

  final List<CategoryModel> categories;
  final Map<String, int> countPerCategory;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Column(
      children: [
        SectionHeader(
          title: LocaleKeys.categories.tr(),
          actionLabel: LocaleKeys.view_all.tr(),
          onAction: () => context.push(RouteNames.categories),
        ),
        const SizedBox(height: 12),
        if (categories.isEmpty)
          EmptyStateWidget(title: LocaleKeys.no_categories_yet.tr())
        else
          SizedBox(
            height: 100,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: categories.length,
              separatorBuilder: (_, __) => const SizedBox(width: 12),
              itemBuilder: (context, i) {
                final cat = categories[i];
                final count = countPerCategory[cat.id] ?? 0;
                return GestureDetector(
                  onTap: () => context.push(
                    '${RouteNames.products}?categoryId=${cat.id}',
                  ),
                  child: SizedBox(
                    width: 76,
                    child: Column(
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(40),
                          child: AppNetworkImage(
                            url: cat.imageUrl,
                            width: 56,
                            height: 56,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          cat.name,
                          style: AppTextStyles.bodySm.copyWith(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          textAlign: TextAlign.center,
                        ),
                        Text(
                          LocaleKeys.x_items.tr(
                            namedArgs: {'count': count.toString()},
                          ),
                          style: AppTextStyles.bodySm.copyWith(
                            fontSize: 10,
                            color: scheme.onSurfaceVariant,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
      ],
    );
  }
}

class _FeaturedSection extends StatelessWidget {
  const _FeaturedSection({required this.products});
  final List<ProductModel> products;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Column(
      children: [
        SectionHeader(
          title: LocaleKeys.featured_products.tr(),
          actionLabel: LocaleKeys.view_all.tr(),
          onAction: () => context.push('${RouteNames.products}?featured=true'),
        ),
        const SizedBox(height: 12),
        if (products.isEmpty)
          EmptyStateWidget(title: LocaleKeys.no_featured_products.tr())
        else
          SizedBox(
            height: 180,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: products.length,
              separatorBuilder: (_, __) => const SizedBox(width: 12),
              itemBuilder: (context, i) {
                final p = products[i];
                return GestureDetector(
                  onTap: () =>
                      context.push(RouteNames.productDetailsPath(p.id)),
                  child: Container(
                    width: 140,
                    decoration: BoxDecoration(
                      color: scheme.surface,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: scheme.outlineVariant.withValues(alpha: 0.5),
                      ),
                    ),
                    clipBehavior: Clip.antiAlias,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        AppNetworkImage(
                          url: p.thumbnailImageUrl,
                          width: double.infinity,
                          height: 100,
                        ),
                        Padding(
                          padding: const EdgeInsets.all(8),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                p.name,
                                style: AppTextStyles.bodySm.copyWith(
                                  fontWeight: FontWeight.w600,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 2),
                              RiyalPrice(
                                price: p.price,
                                style: AppTextStyles.bodySm.copyWith(
                                  color: scheme.primary,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
      ],
    );
  }
}

class _RecentSection extends StatelessWidget {
  const _RecentSection({required this.products});
  final List<ProductModel> products;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Column(
      children: [
        SectionHeader(
          title: LocaleKeys.recent_products.tr(),
          actionLabel: LocaleKeys.view_all.tr(),
          onAction: () => context.push(RouteNames.products),
        ),
        const SizedBox(height: 12),
        if (products.isEmpty)
          EmptyStateWidget(title: LocaleKeys.no_products_yet.tr())
        else
          ...products.map(
            (p) => GestureDetector(
              onTap: () => context.push(RouteNames.productDetailsPath(p.id)),
              child: Container(
                margin: const EdgeInsets.only(bottom: 10),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: scheme.surface,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: scheme.outlineVariant.withValues(alpha: 0.5),
                  ),
                ),
                child: Row(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: AppNetworkImage(
                        url: p.thumbnailImageUrl,
                        width: 52,
                        height: 52,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            p.name,
                            style: AppTextStyles.bodySm.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          if (p.categoryName != null)
                            Text(
                              p.categoryName!,
                              style: AppTextStyles.bodySm.copyWith(
                                fontSize: 12,
                                color: scheme.onSurfaceVariant,
                              ),
                            ),
                        ],
                      ),
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        RiyalPrice(
                          price: p.price,
                          style: AppTextStyles.bodySm.copyWith(
                            fontWeight: FontWeight.w700,
                            color: scheme.primary,
                          ),
                        ),
                        Text(
                          '${LocaleKeys.qty.tr()}: ${p.quantity}',
                          style: AppTextStyles.bodySm.copyWith(
                            fontSize: 12,
                            color: scheme.onSurfaceVariant,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
      ],
    );
  }
}

class _QuickActions extends StatelessWidget {
  const _QuickActions();

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          LocaleKeys.quick_actions.tr(),
          style: AppTextStyles.titleMd.copyWith(
            color: Theme.of(context).colorScheme.onSurface,
          ),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: FilledButton.icon(
                onPressed: () => context.push(RouteNames.addProduct),
                icon: const Icon(Icons.add),
                label: Text(LocaleKeys.add_product.tr()),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: OutlinedButton.icon(
                onPressed: () => context.push(RouteNames.addCategory),
                icon: const Icon(Icons.category_outlined),
                label: Text(LocaleKeys.add_category.tr()),
              ),
            ),
          ],
        ),
      ],
    );
  }
}
