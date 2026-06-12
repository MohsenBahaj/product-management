import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/router/route_names.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../generated/locale_keys.g.dart';
import '../../../../shared/widgets/app_button.dart';
import '../../../../shared/widgets/app_text_field.dart';
import '../cubits/auth_cubit.dart';
import '../states/auth_state.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _passwordFocus = FocusNode();
  bool _obscurePassword = true;

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    _passwordFocus.dispose();
    super.dispose();
  }

  void _submit() {
    if (!_formKey.currentState!.validate()) return;
    context.read<AuthCubit>().login(_emailCtrl.text.trim(), _passwordCtrl.text);
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Scaffold(
      body: BlocListener<AuthCubit, AuthState>(
        listener: (context, state) {
          if (state is AuthError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.message),
                backgroundColor: scheme.error,
              ),
            );
          }
        },
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const SizedBox(height: 56),
                  Center(
                    child: Container(
                      width: 72,
                      height: 72,
                      decoration: BoxDecoration(
                        color: AppColors.primary,
                        borderRadius: BorderRadius.circular(18),
                      ),
                      child: const Icon(
                        Icons.inventory_2_rounded,
                        size: 36,
                        color: Colors.white,
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  Text(
                    LocaleKeys.welcome_back.tr(),
                    style: AppTextStyles.headlineLg.copyWith(
                      color: scheme.onSurface,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 6),
                  Text(
                    LocaleKeys.sign_in_to_account.tr(),
                    style: AppTextStyles.bodySm.copyWith(
                      color: scheme.onSurfaceVariant,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 40),
                  AppTextField(
                    controller: _emailCtrl,
                    label: LocaleKeys.email_address.tr(),
                    keyboardType: TextInputType.emailAddress,
                    textInputAction: TextInputAction.next,
                    prefixIcon: const Icon(Icons.email_outlined),
                    onSubmitted: (_) => _passwordFocus.requestFocus(),
                    validator: (v) {
                      if (v == null || v.trim().isEmpty) {
                        return LocaleKeys.email_required.tr();
                      }
                      if (!v.contains('@')) {
                        return LocaleKeys.enter_valid_email.tr();
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),
                  AppTextField(
                    controller: _passwordCtrl,
                    focusNode: _passwordFocus,
                    label: LocaleKeys.password.tr(),
                    obscureText: _obscurePassword,
                    textInputAction: TextInputAction.done,
                    prefixIcon: const Icon(Icons.lock_outline),
                    suffixIcon: IconButton(
                      icon: Icon(
                        _obscurePassword
                            ? Icons.visibility_outlined
                            : Icons.visibility_off_outlined,
                      ),
                      onPressed: () =>
                          setState(() => _obscurePassword = !_obscurePassword),
                    ),
                    onSubmitted: (_) => _submit(),
                    validator: (v) {
                      if (v == null || v.isEmpty) {
                        return LocaleKeys.password_required.tr();
                      }
                      if (v.length < 6) {
                        return LocaleKeys.password_min_length.tr();
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 28),
                  BlocBuilder<AuthCubit, AuthState>(
                    builder: (context, state) => AppButton(
                      label: LocaleKeys.sign_in.tr(),
                      isLoading: state is AuthLoading,
                      onPressed: _submit,
                    ),
                  ),
                  const SizedBox(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        LocaleKeys.dont_have_account.tr(),
                        style: AppTextStyles.bodySm.copyWith(
                          color: scheme.onSurfaceVariant,
                        ),
                      ),
                      GestureDetector(
                        onTap: () => context.push(RouteNames.register),
                        child: Text(
                          LocaleKeys.sign_up.tr(),
                          style: AppTextStyles.bodySm.copyWith(
                            color: scheme.primary,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                  // const SizedBox(height: 24),
                  // Container(
                  //   padding: const EdgeInsets.all(12),
                  //   decoration: BoxDecoration(
                  //     color: scheme.surfaceContainerHighest,
                  //     borderRadius: BorderRadius.circular(8),
                  //   ),
                  //   child: Text(
                  //     LocaleKeys.demo_hint.tr(),
                  //     style: AppTextStyles.bodySm
                  //         .copyWith(color: scheme.onSurfaceVariant),
                  //     textAlign: TextAlign.center,
                  //   ),
                  // ),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
