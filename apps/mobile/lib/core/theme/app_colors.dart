import 'package:flutter/material.dart';

abstract final class AppColors {
  // ── Light scheme ──────────────────────────────────────────
  static const primary = Color(0xFF0050CB);
  static const onPrimary = Color(0xFFFFFFFF);
  static const primaryContainer = Color(0xFF0066FF);
  static const onPrimaryContainer = Color(0xFFF8F7FF);

  static const secondary = Color(0xFF505F76);
  static const onSecondary = Color(0xFFFFFFFF);
  static const secondaryContainer = Color(0xFFD0E1FB);
  static const onSecondaryContainer = Color(0xFF54647A);

  static const tertiary = Color(0xFFA33200);
  static const onTertiary = Color(0xFFFFFFFF);
  static const tertiaryContainer = Color(0xFFCC4204);
  static const onTertiaryContainer = Color(0xFFFFF6F4);

  static const error = Color(0xFFBA1A1A);
  static const onError = Color(0xFFFFFFFF);
  static const errorContainer = Color(0xFFFFDAD6);
  static const onErrorContainer = Color(0xFF93000A);

  static const surface = Color(0xFFFAF8FF);
  static const onSurface = Color(0xFF191B24);
  static const surfaceDim = Color(0xFFD8D9E6);
  static const surfaceBright = Color(0xFFFAF8FF);
  static const surfaceContainerLowest = Color(0xFFFFFFFF);
  static const surfaceContainerLow = Color(0xFFF2F3FF);
  static const surfaceContainer = Color(0xFFECEDFA);
  static const surfaceContainerHigh = Color(0xFFE6E7F4);
  static const surfaceContainerHighest = Color(0xFFE1E2EE);
  static const onSurfaceVariant = Color(0xFF424656);
  static const surfaceVariant = Color(0xFFE1E2EE);
  static const surfaceTint = Color(0xFF0054D6);

  static const outline = Color(0xFF727687);
  static const outlineVariant = Color(0xFFC2C6D8);
  static const inverseSurface = Color(0xFF2E303A);
  static const inverseOnSurface = Color(0xFFEFF0FD);
  static const inversePrimary = Color(0xFFB3C5FF);

  // ── Dark scheme ───────────────────────────────────────────
  static const darkBackground = Color(0xFF0B0E14);
  static const darkSurface = Color(0xFF111318);
  static const darkSurfaceContainerLowest = Color(0xFF0D0F15);
  static const darkSurfaceContainerLow = Color(0xFF191C23);
  static const darkSurfaceContainer = Color(0xFF1D2028);
  static const darkSurfaceContainerHigh = Color(0xFF22252D);
  static const darkSurfaceContainerHighest = Color(0xFF2D303A);
  static const darkOnSurface = Color(0xFFE2E2E9);
  static const darkOnSurfaceVariant = Color(0xFFC4C6D0);

  static const darkPrimary = Color(0xFFB3C5FF);
  static const darkOnPrimary = Color(0xFF001849);
  static const darkPrimaryContainer = Color(0xFF003FA4);
  static const darkOnPrimaryContainer = Color(0xFFDAE1FF);

  static const darkSecondary = Color(0xFFB7C8E1);
  static const darkOnSecondary = Color(0xFF213345);
  static const darkSecondaryContainer = Color(0xFF38485D);
  static const darkOnSecondaryContainer = Color(0xFFD3E4FE);

  static const darkTertiary = Color(0xFFFFB59D);
  static const darkOnTertiary = Color(0xFF561A00);
  static const darkTertiaryContainer = Color(0xFF832600);
  static const darkOnTertiaryContainer = Color(0xFFFFDBD0);

  static const darkError = Color(0xFFFFB4AB);
  static const darkOnError = Color(0xFF690005);
  static const darkErrorContainer = Color(0xFF93000A);
  static const darkOnErrorContainer = Color(0xFFFFDAD6);

  static const darkOutline = Color(0xFF8E9099);
  static const darkOutlineVariant = Color(0xFF44464F);
  static const darkInverseSurface = Color(0xFFE2E2E9);
  static const darkInverseOnSurface = Color(0xFF2E3038);
  static const darkInversePrimary = Color(0xFF0050CB);
}
