import 'package:flutter/material.dart';

class HomePage extends StatelessWidget {
  HomePage({super.key});



  final List<CardData> cards = [
    CardData(
      color: Colors.blue.shade300,
      title: 'Card 1',
      content: 'Swipe me to see more cards!'
    ),
    CardData(
      color: Colors.green.shade300, 
      title: 'Card 2',
      content: 'Each card has a different color'
    ),
    CardData(
      color: Colors.orange.shade300,
      title: 'Card 3', 
      content: 'Keep swiping to explore'
    ),
    CardData(
      color: Colors.purple.shade300,
      title: 'Card 4',
      content: 'Beautiful cards with smooth animations'
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: cards.asMap().entries.map((entry) {
          return _buildCard(entry.value, entry.key);
        }).toList(),
      ),
    );
  }

  Widget _buildCard(CardData card, int index) {
    return Positioned.fill(
      child: Draggable(
        feedback: Card(
          color: card.color,
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  card.title,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.normal,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  card.content,
                  style: const TextStyle(
                    fontSize: 16,
                    color: Colors.white,
                  ),
                ),
              ],
            ),
          ),
        ),
        childWhenDragging: Container(),
        onDragEnd: (details) {
          // Add animation or transition logic here
        },
        child: Card(
          color: card.color,
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  card.title,
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  card.content,
                  style: const TextStyle(
                    fontSize: 16,
                    color: Colors.white,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class CardData {
  final Color color;
  final String title;
  final String content;

  CardData({
    required this.color,
    required this.title,
    required this.content,
  });
}
