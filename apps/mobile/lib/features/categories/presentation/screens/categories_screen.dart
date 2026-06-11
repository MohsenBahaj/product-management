import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/di/injection.dart';
import '../../../../core/router/route_names.dart';
import '../../../../generated/locale_keys.g.dart';
import '../../../../shared/widgets/app_error_widget.dart';
import '../../../../shared/widgets/app_loading.dart';
import '../../../../shared/widgets/empty_state_widget.dart';
import '../../domain/models/category_model.dart';
import '../cubits/category_cubit.dart';
import '../states/category_state.dart';
import '../widgets/category_card.dart';

class CategoriesScreen extends StatelessWidget {
  const CategoriesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => sl<CategoryCubit>()..loadCategories(),
      child: const _CategoriesView(),
    );
  }
}

class _CategoriesView extends StatelessWidget {
  const _CategoriesView();

  Future<void> _goToAdd(BuildContext context) async {
    final cubit = context.read<CategoryCubit>();
    final result = await context.push<bool>(RouteNames.addCategory);
    if (result == true) cubit.loadCategories();
  }

  Future<void> _goToEdit(BuildContext context, CategoryModel cat) async {
    final cubit = context.read<CategoryCubit>();
    final result =
        await context.push<bool>(RouteNames.editCategoryPath(cat.id));
    if (result == true) cubit.loadCategories();
  }

  void _confirmDelete(BuildContext context, CategoryModel cat) {
    final cubit = context.read<CategoryCubit>();
    showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(LocaleKeys.delete_category.tr()),
        content: Text(LocaleKeys.delete_category_confirm
            .tr(namedArgs: {'name': cat.name})),
        actions: [
          TextButton(
              onPressed: () => ctx.pop(false),
              child: Text(LocaleKeys.cancel.tr())),
          FilledButton(
            style: FilledButton.styleFrom(
              backgroundColor: Theme.of(ctx).colorScheme.error,
            ),
            onPressed: () {
              cubit.deleteCategory(cat.id);
              ctx.pop(true);
            },
            child: Text(LocaleKeys.delete.tr()),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(LocaleKeys.categories.tr()),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () => _goToAdd(context),
          ),
        ],
      ),
      body: BlocBuilder<CategoryCubit, CategoryState>(
        builder: (context, state) {
          return switch (state) {
            CategoryInitial() || CategoryLoading() => const AppLoading(),
            CategoryError(:final message) => AppErrorWidget(
                message: message,
                onRetry: context.read<CategoryCubit>().loadCategories,
              ),
            CategoryLoaded(:final categories) ||
            CategoryOperationSuccess(:final categories) =>
              categories.isEmpty
                  ? EmptyStateWidget(
                      title: LocaleKeys.no_categories_yet.tr(),
                      message: LocaleKeys.create_first_category.tr(),
                      icon: Icons.category_outlined,
                      actionLabel: LocaleKeys.add_category.tr(),
                      onAction: () => _goToAdd(context),
                    )
                  : ListView.separated(
                      padding: const EdgeInsets.all(16),
                      itemCount: categories.length,
                      separatorBuilder: (_, __) =>
                          const SizedBox(height: 8),
                      itemBuilder: (context, i) {
                        final cat = categories[i];
                        return CategoryCard(
                          category: cat,
                          onTap: () {},
                          onEdit: () => _goToEdit(context, cat),
                          onDelete: () => _confirmDelete(context, cat),
                        );
                      },
                    ),
          };
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _goToAdd(context),
        icon: const Icon(Icons.add),
        label: Text(LocaleKeys.add_category.tr()),
      ),
    );
  }
}
