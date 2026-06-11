import 'package:flutter/material.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../shared/widgets/app_network_image.dart';
import '../../../auth/domain/models/user_model.dart';

class ProfileHeader extends StatelessWidget {
  const ProfileHeader({super.key, required this.user});

  final UserModel user;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 32),
      child: Column(
        children: [
          CircleAvatar(
            radius: 48,
            backgroundColor: scheme.primaryContainer,
            child: user.profileImageUrl != null
                ? ClipOval(
                    child: AppNetworkImage(
                      url: user.profileImageUrl,
                      width: 96,
                      height: 96,
                    ),
                  )
                : Text(
                    user.name.isNotEmpty ? user.name[0].toUpperCase() : 'U',
                    style: AppTextStyles.display.copyWith(
                      color: scheme.onPrimaryContainer,
                    ),
                  ),
          ),
          const SizedBox(height: 16),
          Text(
            user.name,
            style: AppTextStyles.headlineLgMobile.copyWith(color: scheme.onSurface),
          ),
          const SizedBox(height: 4),
          Text(
            user.email,
            style: AppTextStyles.bodySm.copyWith(color: scheme.onSurfaceVariant),
          ),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            decoration: BoxDecoration(
              color: const Color(0xFF27AE60).withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              user.isActive ? 'Active' : 'Inactive',
              style: AppTextStyles.bodySm.copyWith(
                color: const Color(0xFF27AE60),
                fontWeight: FontWeight.w600,
                fontSize: 12,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
