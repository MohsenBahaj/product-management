import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/router/route_names.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../generated/locale_keys.g.dart';
import '../../../auth/presentation/cubits/auth_cubit.dart';
import '../../../auth/presentation/states/auth_state.dart';
import '../widgets/profile_header.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const _ProfileView();
  }
}

class _ProfileView extends StatelessWidget {
  const _ProfileView();

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Scaffold(
      appBar: AppBar(title: Text(LocaleKeys.profile.tr()), centerTitle: true),
      body: BlocBuilder<AuthCubit, AuthState>(
        builder: (context, state) {
          if (state is! AuthAuthenticated) {
            return const Center(child: CircularProgressIndicator());
          }
          final user = state.user;
          return ListView(
            children: [
              ProfileHeader(user: user),
              const Divider(height: 1),
              _ProfileTile(
                icon: Icons.edit_outlined,
                title: LocaleKeys.edit_profile.tr(),
                onTap: () => context.push(RouteNames.editProfile),
              ),
              _ProfileTile(
                icon: Icons.category_outlined,
                title: LocaleKeys.manage_categories.tr(),
                onTap: () => context.push(RouteNames.categories),
              ),
              _ProfileTile(
                icon: Icons.inventory_2_outlined,
                title: LocaleKeys.my_products.tr(),
                onTap: () => context.go(RouteNames.products),
              ),
              _ProfileTile(
                icon: Icons.language_outlined,
                title: LocaleKeys.language.tr(),
                onTap: () => _showLanguagePicker(context),
              ),
              const Divider(height: 1),
              // const SizedBox(height: 8),
              // _ProfileTile(
              //   icon: Icons.info_outline,
              //   title: LocaleKeys.about_stockflow.tr(),
              //   onTap: () {
              //     showAboutDialog(
              //       context: context,
              //       applicationName: 'Products Management',
              //       applicationVersion: '1.0.0',
              //       applicationLegalese: '© 2024 Products Management',
              //     );
              //   },
              // ),
              _ProfileTile(
                icon: Icons.logout,
                title: LocaleKeys.sign_out.tr(),
                titleColor: scheme.error,
                iconColor: scheme.error,
                onTap: () => _confirmLogout(context),
              ),
              const SizedBox(height: 32),
            ],
          );
        },
      ),
    );
  }

  void _showLanguagePicker(BuildContext context) {
    showModalBottomSheet<void>(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (ctx) {
        return SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const SizedBox(height: 8),
              Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Theme.of(ctx).colorScheme.outlineVariant,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                child: Text(
                  LocaleKeys.select_language.tr(),
                  style: AppTextStyles.titleMd,
                ),
              ),
              ListTile(
                // leading: const Text('🇺🇸', style: TextStyle(fontSize: 24)),
                leading: const SizedBox(width: 5),
                title: const Text('English'),
                onTap: () {
                  ctx.setLocale(const Locale('en'));
                  Navigator.of(ctx).pop();
                },
              ),
              ListTile(
                // leading: const Text('🇸🇦', style: TextStyle(fontSize: 24)),
                leading: const SizedBox(width: 5),

                title: const Text('العربية'),
                onTap: () {
                  ctx.setLocale(const Locale('ar'));
                  Navigator.of(ctx).pop();
                },
              ),
              const SizedBox(height: 8),
            ],
          ),
        );
      },
    );
  }

  void _confirmLogout(BuildContext context) {
    showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(LocaleKeys.sign_out.tr()),
        content: Text(LocaleKeys.sign_out_confirm.tr()),
        actions: [
          TextButton(
            onPressed: () => ctx.pop(false),
            child: Text(LocaleKeys.cancel.tr()),
          ),
          FilledButton(
            style: FilledButton.styleFrom(
              backgroundColor: Theme.of(ctx).colorScheme.error,
            ),
            onPressed: () {
              ctx.pop(true);
              context.read<AuthCubit>().logout();
            },
            child: Text(LocaleKeys.sign_out_action.tr()),
          ),
        ],
      ),
    );
  }
}

class _ProfileTile extends StatelessWidget {
  const _ProfileTile({
    required this.icon,
    required this.title,
    required this.onTap,
    this.titleColor,
    this.iconColor,
  });

  final IconData icon;
  final String title;
  final VoidCallback onTap;
  final Color? titleColor;
  final Color? iconColor;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return ListTile(
      leading: Icon(icon, color: iconColor ?? scheme.onSurfaceVariant),
      title: Text(
        title,
        style: AppTextStyles.bodySm.copyWith(
          color: titleColor ?? scheme.onSurface,
        ),
      ),
      trailing: const Icon(Icons.chevron_right),
      onTap: onTap,
    );
  }
}
