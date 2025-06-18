import { Text, View, ScrollView, StyleSheet } from "react-native";

export default function Index() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Simple American Accent</Text>

        <Text style={styles.subtitle}>
          American accent training specifically for Brazilians who are already
          advanced in English
        </Text>

        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>
            🎯 For Advanced Brazilian Speakers
          </Text>
          <Text style={styles.featureText}>
            • Perfect for Brazilians who want to sound more American
          </Text>
          <Text style={styles.featureText}>
            • Focus on the most challenging vowel sounds
          </Text>
          <Text style={styles.featureText}>
            • Systematic approach to accent improvement
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>📚 How to Use This App</Text>
          <Text style={styles.featureText}>
            1. Learn about lexical sets in the Learn tab
          </Text>
          <Text style={styles.featureText}>
            2. Practice with interactive quizzes
          </Text>
          <Text style={styles.featureText}>
            3. Use alongside your coaching sessions
          </Text>
        </View>

        <View style={styles.note}>
          <Text style={styles.noteText}>
            This app is part of your Simple American Accent coaching program.
            Use it regularly to reinforce what you learn in your sessions.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
    marginTop: 24,
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginBottom: 32,
  },
  featureCard: {
    backgroundColor: "#F8FAFC",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  featureText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  quote: {
    backgroundColor: "#F3F4F6",
    padding: 20,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 20,
  },
  quoteText: {
    fontSize: 16,
    fontStyle: "italic",
    lineHeight: 24,
    color: "#4B5563",
  },
  note: {
    backgroundColor: "#EFF6FF",
    padding: 20,
    borderRadius: 12,
    marginBottom: 32,
  },
  noteText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#1E40AF",
  },
});
