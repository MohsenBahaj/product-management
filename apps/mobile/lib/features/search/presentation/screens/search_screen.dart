import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/di/injection.dart';
import '../../../../core/router/route_names.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../generated/locale_keys.g.dart';
import '../../../../shared/widgets/app_loading.dart';
import '../../../../shared/widgets/empty_state_widget.dart';
import '../../../products/domain/models/product_model.dart';
import '../../../products/presentation/widgets/product_list_tile.dart';
import '../cubits/search_cubit.dart';
import '../states/search_state.dart';
import '../widgets/search_history_tile.dart';

class SearchScreen extends StatelessWidget {
  const SearchScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => sl<SearchCubit>()..loadHistory(),
      child: const _SearchView(),
    );
  }
}

class _SearchView extends StatefulWidget {
  const _SearchView();

  @override
  State<_SearchView> createState() => _SearchViewState();
}

class _SearchViewState extends State<_SearchView> {
  final _searchCtrl = TextEditingController();
  final _focusNode = FocusNode();

  @override
  void dispose() {
    _searchCtrl.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  void _onSearchChanged(String query) {
    context.read<SearchCubit>().search(query);
  }

  void _applyHistory(String term) {
    _searchCtrl.text = term;
    _searchCtrl.selection = TextSelection.fromPosition(
      TextPosition(offset: term.length),
    );
    context.read<SearchCubit>().search(term);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        title: TextField(
          controller: _searchCtrl,
          focusNode: _focusNode,
          onChanged: _onSearchChanged,
          autofocus: false,
          decoration: InputDecoration(
            hintText: LocaleKeys.search_hint.tr(),
            prefixIcon: const Icon(Icons.search),
            suffixIcon: _searchCtrl.text.isNotEmpty
                ? IconButton(
                    icon: const Icon(Icons.clear),
                    onPressed: () {
                      _searchCtrl.clear();
                      context.read<SearchCubit>().clearSearch();
                    },
                  )
                : null,
            isDense: true,
            contentPadding: const EdgeInsets.symmetric(vertical: 10),
            border:
                OutlineInputBorder(borderRadius: BorderRadius.circular(24)),
          ),
        ),
      ),
      body: BlocBuilder<SearchCubit, SearchState>(
        builder: (context, state) {
          return switch (state) {
            SearchInitial(:final recentSearches) => _SearchHistoryView(
                history: recentSearches, onTap: _applyHistory),
            SearchLoading() => const AppLoading(),
            SearchError(:final message) => EmptyStateWidget(
                title: LocaleKeys.search_failed.tr(),
                message: message,
                icon: Icons.search_off_outlined,
              ),
            SearchLoaded(:final results, :final query) => results.isEmpty
                ? EmptyStateWidget(
                    title: LocaleKeys.no_results_found.tr(),
                    message: LocaleKeys.try_different_keyword.tr(),
                    icon: Icons.search_off_outlined,
                  )
                : _SearchResultsView(results: results, query: query),
          };
        },
      ),
    );
  }
}

class _SearchHistoryView extends StatelessWidget {
  const _SearchHistoryView({required this.history, required this.onTap});

  final List<String> history;
  final ValueChanged<String> onTap;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    if (history.isEmpty) {
      return EmptyStateWidget(
        title: LocaleKeys.start_searching.tr(),
        message: LocaleKeys.find_products_hint.tr(),
        icon: Icons.search,
      );
    }
    return ListView(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 8, 8),
          child: Row(
            children: [
              Expanded(
                child: Text(
                  LocaleKeys.recent_searches.tr(),
                  style: AppTextStyles.bodySm.copyWith(
                    color: scheme.onSurfaceVariant,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              TextButton(
                onPressed: () =>
                    context.read<SearchCubit>().clearHistory(),
                child: Text(
                  LocaleKeys.clear_all.tr(),
                  style: AppTextStyles.bodySm.copyWith(color: scheme.primary),
                ),
              ),
            ],
          ),
        ),
        ...history.map(
          (term) => SearchHistoryTile(
            term: term,
            onTap: () => onTap(term),
            onRemove: () =>
                context.read<SearchCubit>().removeHistory(term),
          ),
        ),
      ],
    );
  }
}

class _SearchResultsView extends StatelessWidget {
  const _SearchResultsView({required this.results, required this.query});

  final List<ProductModel> results;
  final String query;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return ListView.builder(
      padding: const EdgeInsets.all(12),
      itemCount: results.length + 1,
      itemBuilder: (context, i) {
        if (i == 0) {
          return Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Text(
              LocaleKeys.search_results_for.tr(namedArgs: {
                'count': results.length.toString(),
                'query': query,
              }),
              style: AppTextStyles.bodySm
                  .copyWith(color: scheme.onSurfaceVariant),
            ),
          );
        }
        final p = results[i - 1];
        return ProductListTile(
          product: p,
          onTap: () => context.push(RouteNames.productDetailsPath(p.id)),
        );
      },
    );
  }
}
