import { View, Text, ScrollView, Pressable } from "react-native";
import { StyleSheet } from "react-native";

export default function LexSets() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.heading}>🎯 What are Lexical Sets?</Text>
        <Text style={styles.paragraph}>
          Lexical sets are groups of words that share the same vowel sound,
          regardless of their spelling. This is crucial for mastering American
          English pronunciation.
        </Text>

        <Text style={styles.subheading}>Why Spelling Can Be Misleading:</Text>
        <Text style={styles.paragraph}>
          • "Bear" and "beard" have different vowel sounds, even though they
          share the same letters.
        </Text>
        <Text style={styles.paragraph}>
          • "Steak" and "bread" each have other vowel sounds entirely.
        </Text>

        <Text style={styles.subheading}>Same Sound, Different Letters:</Text>
        <Text style={styles.paragraph}>• "Sick" has the vowel letter i.</Text>
        <Text style={styles.paragraph}>• "Women" has o and e.</Text>
        <Text style={styles.paragraph}>
          • But they share the same vowel sound.
        </Text>

        <View style={styles.quote}>
          <Text style={styles.quoteText}>
            👉 We use keywords like "KIT" and "FLEECE" because they sound
            completely different from each other, making them easier to
            distinguish when learning.
          </Text>
        </View>

        <Text style={styles.heading}>🎯 Key Benefits</Text>
        <Text style={styles.paragraph}>1. Focus on sounds, not spelling</Text>
        <Text style={styles.paragraph}>
          2. Consistent way to learn vowel sounds
        </Text>
        <Text style={styles.paragraph}>
          3. Better for mastering American accent
        </Text>

        <Text style={styles.heading}>📚 Example Sets</Text>
        <Text style={styles.paragraph}>
          KIT set: sick, women, it, did, if, this, myth, business, fish
        </Text>
        <Text style={styles.paragraph}>
          FLEECE set: beak, geek, leak, meek, peak, peek, reek, seek, week
        </Text>

        <Text style={styles.heading}>💡 Learning Tip</Text>
        <Text style={styles.paragraph}>
          Try to "forget" the spelling and focus on the sounds. Learning to
          identify vowels by sound is a key skill in mastering an American
          accent.
        </Text>
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
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    marginTop: 24,
  },
  subheading: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    marginTop: 16,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  quote: {
    backgroundColor: "#F3F4F6",
    padding: 16,
    borderRadius: 8,
    marginVertical: 16,
  },
  quoteText: {
    fontSize: 16,
    lineHeight: 24,
    fontStyle: "italic",
  },
});
