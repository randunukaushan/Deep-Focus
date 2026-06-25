import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function SessionSetupScreen() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState('Deep Work');
  const [task, setTask] = useState('');

  // ඊළඟ ස්ක්‍රීන් එකට දත්ත ටික අරන් යන ෆන්ක්ෂන් එක
  const handleStartSession = () => {
    if (!task.trim()) {
      alert('කරුණාකර ඔයා අවධානය යොමු කරන වැඩේ (Task) ටයිප් කරන්න!');
      return;
    }
    
    // දත්ත ටික URL එකත් එක්ක focus.tsx එකට යවනවා
    router.push({
      pathname: '/focus',
      params: { taskName: task, focusType: selectedType }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.logoText}>⚡ FocusAI</Text>
        <TouchableOpacity>
          <Ionicons name="person-circle" size={32} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Main Card with TextInput */}
        <View style={styles.mainCard}>
          <Text style={styles.cardSubtitle}>Ready to lock in?</Text>
          <TextInput
            style={styles.taskInput}
            placeholder="What are you focusing on?"
            placeholderTextColor="#A2BCCF"
            value={task}
            onChangeText={setTask}
          />
        </View>

        {/* Focus Type Selector */}
        <View style={styles.selectorContainer}>
          {['Deep Work', 'Study', 'Creative'].map((type) => (
            <TouchableOpacity 
              key={type}
              style={[styles.typeButton, selectedType === type && styles.activeTypeButton]}
              onPress={() => setSelectedType(type)}
            >
              <Text style={[styles.typeButtonText, selectedType === type && styles.activeTypeButtonText]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Settings Sheet */}
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>Session Configuration</Text>

          {/* Focus Duration */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="time-outline" size={24} color="#0F2537" />
              <Text style={styles.settingLabel}>Focus Duration</Text>
            </View>
            <Text style={styles.settingValue}>25 Mins</Text>
          </View>

          {/* Distraction Shield */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <MaterialCommunityIcons name="shield-airplane" size={24} color="#0F2537" />
              <Text style={styles.settingLabel}>Distraction Shield</Text>
            </View>
            <Text style={[styles.settingValue, { color: '#2C7A6F', fontWeight: 'bold' }]}>AI STRICT</Text>
          </View>

          {/* Start Button */}
          <TouchableOpacity style={styles.startButton} onPress={handleStartSession}>
            <Text style={styles.startButtonText}>START SESSION</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F2537' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, marginBottom: 20 },
  logoText: { color: 'white', fontSize: 22, fontWeight: 'bold', letterSpacing: 0.5 },
  mainCard: { backgroundColor: '#1B3B54', marginHorizontal: 20, borderRadius: 25, padding: 25, marginBottom: 25 },
  cardSubtitle: { color: '#7FE5B6', fontSize: 14, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 },
  taskInput: { color: 'white', fontSize: 22, fontWeight: 'bold', borderBottomWidth: 1, borderBottomColor: '#7FE5B6', paddingVertical: 5, marginTop: 5 },
  selectorContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 30 },
  typeButton: { flex: 1, backgroundColor: '#1B3B54', paddingVertical: 12, borderRadius: 15, alignItems: 'center', marginHorizontal: 5, borderWidth: 1, borderColor: 'transparent' },
  activeTypeButton: { backgroundColor: '#0F2537', borderColor: '#7FE5B6' },
  typeButtonText: { color: '#A2BCCF', fontSize: 14, fontWeight: '500' },
  activeTypeButtonText: { color: '#7FE5B6', fontWeight: 'bold' },
  sheet: { backgroundColor: '#CBEFDF', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 20, paddingTop: 30, paddingBottom: 50, minHeight: 400 },
  sheetTitle: { color: '#0F2537', fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  settingRow: { backgroundColor: 'white', borderRadius: 20, padding: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, elevation: 2 },
  settingInfo: { flexDirection: 'row', alignItems: 'center' },
  settingLabel: { color: '#0F2537', fontSize: 16, fontWeight: '600', marginLeft: 12 },
  settingValue: { color: '#666', fontSize: 14 },
  startButton: { backgroundColor: '#0F2537', borderRadius: 20, paddingVertical: 18, alignItems: 'center', marginTop: 25, elevation: 5 },
  startButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
});