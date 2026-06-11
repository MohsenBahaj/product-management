abstract class SearchHistoryRepository {
  Future<List<String>> getHistory({int? limit});
  Future<void> clearAll();
}
