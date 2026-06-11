import 'package:flutter/material.dart';

enum AppButtonVariant { primary, ghost }

class AppButton extends StatelessWidget {
  const AppButton({
    super.key,
    required this.label,
    this.onPressed,
    this.variant = AppButtonVariant.primary,
    this.isLoading = false,
    this.leadingIcon,
  });

  final String label;
  final VoidCallback? onPressed;
  final AppButtonVariant variant;
  final bool isLoading;
  final Widget? leadingIcon;

  @override
  Widget build(BuildContext context) {
    final child = isLoading ? _Spinner(variant: variant) : Text(label);

    return switch (variant) {
      AppButtonVariant.primary => ElevatedButton(
          onPressed: isLoading ? null : onPressed,
          child: _ButtonContent(icon: isLoading ? null : leadingIcon, child: child),
        ),
      AppButtonVariant.ghost => OutlinedButton(
          onPressed: isLoading ? null : onPressed,
          child: _ButtonContent(icon: isLoading ? null : leadingIcon, child: child),
        ),
    };
  }
}

class _ButtonContent extends StatelessWidget {
  const _ButtonContent({required this.child, this.icon});

  final Widget child;
  final Widget? icon;

  @override
  Widget build(BuildContext context) {
    if (icon == null) return child;
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [icon!, const SizedBox(width: 8), child],
    );
  }
}

class _Spinner extends StatelessWidget {
  const _Spinner({required this.variant});

  final AppButtonVariant variant;

  @override
  Widget build(BuildContext context) {
    final color = variant == AppButtonVariant.primary
        ? Theme.of(context).colorScheme.onPrimary
        : Theme.of(context).colorScheme.primary;
    return SizedBox.square(
      dimension: 20,
      child: CircularProgressIndicator(strokeWidth: 2, color: color),
    );
  }
}
