import 'package:flutter/material.dart';
import '../../../../core/theme/app_text_styles.dart';

class SearchHistoryTile extends StatelessWidget {
  const SearchHistoryTile({
    super.key,
    required this.term,
    required this.onTap,
    this.onRemove,
  });

  final String term;
  final VoidCallback onTap;
  final VoidCallback? onRemove;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Row(
          children: [
            Icon(Icons.history_outlined, size: 20, color: scheme.onSurfaceVariant),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                term,
                style: AppTextStyles.bodySm.copyWith(color: scheme.onSurface),
              ),
            ),
            if (onRemove != null)
              GestureDetector(
                onTap: onRemove,
                child: Icon(
                  Icons.close,
                  size: 16,
                  color: scheme.onSurfaceVariant,
                ),
              ),
          ],
        ),
      ),
    );
  }
}
