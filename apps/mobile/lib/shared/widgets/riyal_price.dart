import 'package:flutter/material.dart';

class RiyalPrice extends StatelessWidget {
  const RiyalPrice({
    super.key,
    required this.price,
    this.style,
    this.iconSize = 14.0,
  });

  final double price;
  final TextStyle? style;
  final double iconSize;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Image.asset(
          'assets/icons/riyal_icon.jpg',
          width: iconSize,
          height: iconSize,
          fit: BoxFit.contain,
        ),
        const SizedBox(width: 3),
        Text(price.toStringAsFixed(2), style: style),
      ],
    );
  }
}
