import 'dart:io';
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:image_picker/image_picker.dart';
import '../../../../core/di/injection.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../generated/locale_keys.g.dart';
import '../../../../shared/widgets/app_button.dart';
import '../../../../shared/widgets/app_network_image.dart';
import '../../../../shared/widgets/app_text_field.dart';
import '../../../auth/domain/models/user_model.dart';
import '../../../auth/presentation/cubits/auth_cubit.dart';
import '../../../auth/presentation/states/auth_state.dart';
import '../cubits/profile_cubit.dart';
import '../states/profile_state.dart';

class EditProfileScreen extends StatelessWidget {
  const EditProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => sl<ProfileCubit>(),
      child: const _EditProfileView(),
    );
  }
}

class _EditProfileView extends StatefulWidget {
  const _EditProfileView();

  @override
  State<_EditProfileView> createState() => _EditProfileViewState();
}

class _EditProfileViewState extends State<_EditProfileView> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  bool _prefilled = false;
  String? _newImagePath;
  final _picker = ImagePicker();

  @override
  void dispose() {
    _nameCtrl.dispose();
    super.dispose();
  }

  void _prefill(UserModel user) {
    if (!_prefilled) {
      _nameCtrl.text = user.name;
      _prefilled = true;
    }
  }

  Future<void> _pickImage() async {
    final file = await _picker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 85,
    );
    if (file != null && mounted) {
      setState(() => _newImagePath = file.path);
      // Upload image immediately
      if (mounted) {
        context.read<ProfileCubit>().uploadProfileImage(file.path);
      }
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    context.read<ProfileCubit>().updateProfile(name: _nameCtrl.text.trim());
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Scaffold(
      appBar: AppBar(
          title: Text(LocaleKeys.edit_profile.tr()), centerTitle: true),
      body: BlocConsumer<ProfileCubit, ProfileState>(
        listener: (context, state) {
          if (state is ProfileUpdateSuccess) {
            context.read<AuthCubit>().updateUser(state.user);
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text(LocaleKeys.profile_updated.tr())),
            );
            Navigator.of(context).pop();
          } else if (state is ProfileError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.message),
                backgroundColor: scheme.error,
              ),
            );
          }
        },
        builder: (context, profileState) {
          return BlocBuilder<AuthCubit, AuthState>(
            builder: (context, authState) {
              if (authState is! AuthAuthenticated) {
                return const Center(child: CircularProgressIndicator());
              }
              final user = authState.user;
              _prefill(user);
              return SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      const SizedBox(height: 8),
                      Stack(
                        children: [
                          CircleAvatar(
                            radius: 52,
                            backgroundColor: scheme.primaryContainer,
                            child: _newImagePath != null
                                ? ClipOval(
                                    child: Image.file(
                                      File(_newImagePath!),
                                      width: 104,
                                      height: 104,
                                      fit: BoxFit.cover,
                                    ),
                                  )
                                : user.profileImageUrl != null
                                    ? ClipOval(
                                        child: AppNetworkImage(
                                          url: user.profileImageUrl,
                                          width: 104,
                                          height: 104,
                                        ),
                                      )
                                    : Text(
                                        user.name.isNotEmpty
                                            ? user.name[0].toUpperCase()
                                            : 'U',
                                        style: AppTextStyles.display.copyWith(
                                          color: scheme.onPrimaryContainer,
                                        ),
                                      ),
                          ),
                          Positioned(
                            bottom: 0,
                            right: 0,
                            child: GestureDetector(
                              onTap: _pickImage,
                              child: Container(
                                width: 32,
                                height: 32,
                                decoration: BoxDecoration(
                                  color: scheme.primary,
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                    color: scheme.surface,
                                    width: 2,
                                  ),
                                ),
                                child: profileState is ProfileLoading
                                    ? const Padding(
                                        padding: EdgeInsets.all(6),
                                        child: CircularProgressIndicator(
                                          strokeWidth: 2,
                                          color: Colors.white,
                                        ),
                                      )
                                    : const Icon(
                                        Icons.camera_alt,
                                        size: 16,
                                        color: Colors.white,
                                      ),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        LocaleKeys.tap_to_change_photo.tr(),
                        style: AppTextStyles.bodySm.copyWith(
                          color: scheme.onSurfaceVariant,
                          fontSize: 12,
                        ),
                      ),
                      const SizedBox(height: 32),
                      AppTextField(
                        controller: _nameCtrl,
                        label: LocaleKeys.full_name.tr(),
                        prefixIcon: const Icon(Icons.person_outline),
                        validator: (v) {
                          if (v == null || v.trim().isEmpty) {
                            return LocaleKeys.name_required.tr();
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 14),
                      TextField(
                        enabled: false,
                        decoration: InputDecoration(
                          labelText: LocaleKeys.email_address.tr(),
                          hintText: user.email,
                          prefixIcon: const Icon(Icons.email_outlined),
                          helperText: LocaleKeys.email_cannot_be_changed.tr(),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                        controller: TextEditingController(text: user.email),
                      ),
                      const SizedBox(height: 28),
                      AppButton(
                        label: LocaleKeys.save_changes.tr(),
                        isLoading: profileState is ProfileLoading,
                        onPressed: _submit,
                      ),
                    ],
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
