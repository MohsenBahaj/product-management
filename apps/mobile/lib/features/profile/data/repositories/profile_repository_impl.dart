import '../../../auth/domain/models/user_model.dart';
import '../../domain/repositories/profile_repository.dart';
import '../datasources/profile_remote_data_source.dart';

class ProfileRepositoryImpl implements ProfileRepository {
  const ProfileRepositoryImpl({required this.remoteDataSource});

  final ProfileRemoteDataSource remoteDataSource;

  @override
  Future<UserModel> getProfile() async {
    final dto = await remoteDataSource.getProfile();
    return dto.toModel();
  }

  @override
  Future<UserModel> updateProfile({String? name}) async {
    final dto = await remoteDataSource.updateProfile(name: name);
    return dto.toModel();
  }

  @override
  Future<UserModel> uploadProfileImage(String imagePath) async {
    final dto = await remoteDataSource.uploadProfileImage(imagePath);
    return dto.toModel();
  }
}
