import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/network/interceptors/error_interceptor.dart';
import '../../domain/repositories/profile_repository.dart';
import '../states/profile_state.dart';

class ProfileCubit extends Cubit<ProfileState> {
  ProfileCubit({required ProfileRepository repository})
      : _repository = repository,
        super(const ProfileInitial());

  final ProfileRepository _repository;

  Future<void> updateProfile({String? name}) async {
    emit(const ProfileLoading());
    try {
      final user = await _repository.updateProfile(name: name);
      emit(ProfileUpdateSuccess(user));
    } on AppException catch (e) {
      emit(ProfileError(e.message));
    } catch (_) {
      emit(const ProfileError('Failed to update profile.'));
    }
  }

  Future<void> uploadProfileImage(String imagePath) async {
    emit(const ProfileLoading());
    try {
      final user = await _repository.uploadProfileImage(imagePath);
      emit(ProfileUpdateSuccess(user));
    } on AppException catch (e) {
      emit(ProfileError(e.message));
    } catch (_) {
      emit(const ProfileError('Failed to upload profile image.'));
    }
  }
}
