import 'package:flutter/material.dart';

class AppNetworkImage extends StatelessWidget {
  const AppNetworkImage({
    super.key,
    required this.url,
    this.fit = BoxFit.cover,
    this.width,
    this.height,
    this.placeholder,
    this.borderRadius,
  });

  final String? url;
  final BoxFit fit;
  final double? width;
  final double? height;
  final Widget? placeholder;
  final BorderRadius? borderRadius;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final fallback = placeholder ??
        Container(
          color: scheme.surfaceContainerHighest,
          child: Icon(Icons.image_outlined, color: scheme.onSurfaceVariant, size: 32),
        );

    Widget image;
    if (url == null || url!.isEmpty) {
      image = fallback;
    } else {
      image = Image.network(
        url!,
        fit: fit,
        width: width,
        height: height,
        loadingBuilder: (_, child, progress) {
          if (progress == null) return child;
          return Container(
            color: scheme.surfaceContainerHighest,
            child: const Center(child: CircularProgressIndicator(strokeWidth: 2)),
          );
        },
        errorBuilder: (_, __, ___) => fallback,
      );
    }

    if (borderRadius != null) {
      return ClipRRect(borderRadius: borderRadius!, child: image);
    }
    return image;
  }
}
