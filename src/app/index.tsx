import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function SessionSetupScreen() {
  const router = useRouter();
  const [taskName, setTaskName] = useState('');
  const [selectedType, setSelectedType] = useState('Deep Work');

  const startSession = () => {
    // Focus පිටුවට දත්තත් එක්කම මාරු වෙනවා
    router.push({
      pathname: '/focus',
      params: { taskName: taskName, focusType: selectedType }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerSubtitle}>WELCOME TO</Text>
          <Text style={styles.headerTitle}>FocusAI</Text>
        </View>

        {/* Input Section */}
        <View style={styles.inputSection}>
          <Text style={styles.sectionLabel}>WHAT ARE YOU WORKING ON?</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g., Biology Revision, Chemistry Essay..."
            placeholderTextColor="#5C7A92"
            value={taskName}
            onChangeText={setTaskName}
          />
        </View>

        {/* Focus Type Selector */}
        <View style={styles.selectorContainer}>
          <Text style={styles.sectionLabel}>CHOOSE FOCUS TYPE</Text>
          
          <TouchableOpacity
            style={[styles.typeButton, selectedType === 'Deep Work' && styles.activeTypeButton]}
            onPress={() => setSelectedType('Deep Work')}
          >
            <Ionicons name="brain" size={20} color={selectedType === 'Deep Work' ? '#0F2537' : '#7FE5B6'} style={{ marginRight: 10 }} />
            <Text style={[styles.typeButtonText, selectedType === 'Deep Work' && styles.activeTypeButtonText]}>Deep Work</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.typeButton, selectedType === 'Study' && styles.activeTypeButton]}
            onPress={() => setSelectedType('Study')}
          >
            <Ionicons name="book" size={20} color={selectedType === 'Study' ? '#0F2537' : '#7FE5B6'} style={{ marginRight: 10 }} />
            <Text style={[styles.typeButtonText, selectedType === 'Study' && styles.activeTypeButtonText]}>Study</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.typeButton, selectedType === 'Creative' && styles.activeTypeButton]}
            onPress={() => setSelectedType('Creative')}
          >
            <Ionicons name="color-palette" size={20} color={selectedType === 'Creative' ? '#0F2537' : '#7FE5B6'} style={{ marginRight: 10 }} />
            <Text style={[styles.typeButtonText, selectedType === 'Creative' && styles.activeTypeButtonText]}>Creative</Text>
          </TouchableOpacity>
        </View>

        {/* Start Button */}
        <TouchableOpacity style={styles.startButton} onPress={startSession}>
          <Text style={styles.startButtonText}>START SESSION</Text>
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
  scrollContainer: {
    paddingHorizontal: 25,
    paddingVertical: 40,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
    marginTop: 20,
  },
  headerSubtitle: {
    color: '#7FE5B6',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  headerTitle: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
  },
  inputSection: {
    marginBottom: 35,
  },
  sectionLabel: {
    color: '#A2BCCF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: '#1B3B54',
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 16,
    color: 'white',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#244A66',
  },
  selectorContainer: {
    marginBottom: 40,
  },
  typeButton: {
    flexDirection: 'row',
    backgroundColor: '#1B3B54',
    borderRadius: 15,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#244A66',
  },
  activeTypeButton: {
    backgroundColor: '#7FE5B6',
    borderColor: '#7FE5B6',
  },
  typeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  activeTypeButtonText: {
    color: '#0F2537',
    fontWeight: '700',
  },
  startButton: {
    backgroundColor: '#7FE5B6',
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#7FE5B6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    marginTop: 10,
  },
  startButtonText: {
    color: '#0F2537',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});