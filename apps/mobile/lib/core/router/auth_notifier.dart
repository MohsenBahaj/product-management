import 'package:flutter/material.dart';

class AuthNotifier extends ChangeNotifier {
  bool _isAuthenticated = false;
  bool _isLoading = true;

  bool get isAuthenticated => _isAuthenticated;
  bool get isLoading => _isLoading;

  void setAuthenticated(bool value) {
    _isAuthenticated = value;
    _isLoading = false;
    notifyListeners();
  }
}
