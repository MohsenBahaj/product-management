import '../../../auth/domain/models/user_model.dart';

abstract class ProfileRepository {
  Future<UserModel> getProfile();
  Future<UserModel> updateProfile({String? name});
  Future<UserModel> uploadProfileImage(String imagePath);
}
