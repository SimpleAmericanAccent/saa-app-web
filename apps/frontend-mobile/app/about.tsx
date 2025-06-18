import { Text, View, ScrollView, StyleSheet, Linking } from "react-native";
import { Pressable } from "react-native";

export default function About() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Simple American Accent</Text>

        <View style={styles.section}>
          <Text style={styles.heading}>🎯 Our Focus</Text>
          <Text style={styles.paragraph}>
            Simple American Accent is a specialized program for advanced
            Brazilian English speakers who want to refine their American
            pronunciation. This app is part of our comprehensive approach to
            accent training.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>📚 Our Methodology</Text>
          <Text style={styles.paragraph}>
            We use lexical sets, developed by British phonetician John C. Wells,
            as a powerful tool to help Brazilian speakers master American vowel
            sounds. This systematic approach makes it easier to identify and
            practice the specific sounds that are most challenging for Brazilian
            speakers.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>💡 Why This Works for Brazilians</Text>
          <Text style={styles.paragraph}>
            • Addresses specific Brazilian pronunciation challenges
          </Text>
          <Text style={styles.paragraph}>
            • Focuses on the most important vowel sounds for American English
          </Text>
          <Text style={styles.paragraph}>
            • Provides clear, systematic practice
          </Text>
          <Text style={styles.paragraph}>
            • Complements our personalized coaching
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>🤝 Your Journey</Text>
          <Text style={styles.paragraph}>
            This app is part of your Simple American Accent experience. Use it
            alongside your coaching sessions to reinforce what you learn and
            track your progress.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>📝 About This Version</Text>
          <Text style={styles.paragraph}>
            This is a work in progress (MVP) version of our mobile app.
            We&apos;re continuously improving it based on client feedback and
            learning outcomes. Your experience helps shape future updates.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Simple American Accent - MVP Version
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
    marginBottom: 24,
    marginTop: 24,
  },
  section: {
    marginBottom: 32,
  },
  heading: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
    color: "#374151",
  },
  footer: {
    marginTop: 32,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  footerText: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 14,
  },
});
