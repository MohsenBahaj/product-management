import 'package:equatable/equatable.dart';
import '../../../auth/domain/models/user_model.dart';

sealed class ProfileState extends Equatable {
  const ProfileState();
}

class ProfileInitial extends ProfileState {
  const ProfileInitial();
  @override
  List<Object?> get props => const [];
}

class ProfileLoading extends ProfileState {
  const ProfileLoading();
  @override
  List<Object?> get props => const [];
}

class ProfileUpdateSuccess extends ProfileState {
  const ProfileUpdateSuccess(this.user);
  final UserModel user;
  @override
  List<Object?> get props => [user];
}

class ProfileError extends ProfileState {
  const ProfileError(this.message);
  final String message;
  @override
  List<Object?> get props => [message];
}
