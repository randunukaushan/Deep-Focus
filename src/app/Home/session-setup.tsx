import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const durations = [25, 50, 75, 90];

export default function SessionSetupScreen() {
  const [taskName, setTaskName] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(50);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text style={styles.eyebrow}>FOCUS SESSION</Text>
            <Text style={styles.title}>Set up your session</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>WHAT ARE YOU WORKING ON?</Text>

          <TextInput
            value={taskName}
            onChangeText={setTaskName}
            placeholder="e.g. Study mathematics"
            placeholderTextColor="#6F899C"
            style={styles.input}
            maxLength={80}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>FOCUS DURATION</Text>

          <Text style={styles.durationValue}>
            {selectedDuration}
            <Text style={styles.durationUnit}> min</Text>
          </Text>

          <View style={styles.durationGrid}>
            {durations.map((duration) => {
              const selected = selectedDuration === duration;

              return (
                <TouchableOpacity
                  key={duration}
                  style={[
                    styles.durationButton,
                    selected && styles.durationButtonSelected,
                  ]}
                  onPress={() => setSelectedDuration(duration)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`${duration} minutes`}
                >
                  <Text
                    style={[
                      styles.durationButtonText,
                      selected && styles.durationButtonTextSelected,
                    ]}
                  >
                    {duration}m
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons name="moon-outline" size={21} color="#7FE5B6" />
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Deep Focus Mode</Text>
            <Text style={styles.infoDescription}>
              Keep this session calm and distraction-free. You can pause or end
              the session when needed.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.startButton}
          accessibilityRole="button"
          accessibilityLabel="Start focus session"
          onPress={() => {
            console.log({
              taskName,
              selectedDuration,
            });
          }}
        >
          <Text style={styles.startButtonText}>Start Focus Session</Text>

          <Ionicons
            name="arrow-forward"
            size={20}
            color="#0F2537"
          />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F2537',
  },

  content: {
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 40,
  },

  header: {
    marginBottom: 32,
  },

  backButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#1B3B54',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },

  headerTextContainer: {
    gap: 6,
  },

  eyebrow: {
    color: '#7FE5B6',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 38,
  },

  card: {
    backgroundColor: '#17354A',
    borderRadius: 24,
    padding: 22,
    marginBottom: 18,
  },

  label: {
    color: '#A2BCCF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 16,
  },

  input: {
    height: 58,
    borderRadius: 16,
    backgroundColor: '#102C40',
    borderWidth: 1,
    borderColor: '#244A66',
    paddingHorizontal: 18,
    color: '#FFFFFF',
    fontSize: 16,
  },

  durationValue: {
    color: '#FFFFFF',
    fontSize: 44,
    fontWeight: '700',
    marginBottom: 22,
  },

  durationUnit: {
    color: '#8FAABD',
    fontSize: 17,
    fontWeight: '500',
  },

  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  durationButton: {
    width: '47%',
    height: 52,
    borderRadius: 15,
    backgroundColor: '#1B3B54',
    borderWidth: 1,
    borderColor: '#244A66',
    justifyContent: 'center',
    alignItems: 'center',
  },

  durationButtonSelected: {
    backgroundColor: '#7FE5B6',
    borderColor: '#7FE5B6',
  },

  durationButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  durationButtonTextSelected: {
    color: '#0F2537',
  },

  infoCard: {
    backgroundColor: '#132F43',
    borderRadius: 22,
    padding: 20,
    flexDirection: 'row',
    marginBottom: 28,
  },

  infoIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#21465E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 5,
  },

  infoDescription: {
    color: '#8FAABD',
    fontSize: 13,
    lineHeight: 20,
  },

  startButton: {
    height: 60,
    borderRadius: 18,
    backgroundColor: '#7FE5B6',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },

  startButtonText: {
    color: '#0F2537',
    fontSize: 16,
    fontWeight: '700',
  },
});