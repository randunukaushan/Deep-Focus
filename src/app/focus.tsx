import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function FocusScreen() {
  const router = useRouter();
  const { taskName, focusType } = useLocalSearchParams();

  const [secondsLeft, setSecondsLeft] = useState(1500); // 25 Mins
  const [isActive, setIsActive] = useState(true);

  // Summary එකට දත්ත අරන් යන පොදු ෆන්ක්ෂන් එකක් හැදුවා
  const navigateToSummary = () => {
    router.push({
      pathname: '/summary',
      params: { completedTask: taskName, completedType: focusType }
    });
  };

  useEffect(() => {
    let interval: any = null;

    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((seconds => seconds - 1));
      }, 1000);
    } else if (secondsLeft === 0) {
      clearInterval(interval);
      navigateToSummary(); // ඉවර වුණාම දත්ත එක්ක යනවා
    }

    return () => clearInterval(interval);
  }, [isActive, secondsLeft]);

  const formatTime = () => {
    const mins = Math.floor(secondsLeft / 60);
    const secs = secondsLeft % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{focusType || 'Focus Zone'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.taskContainer}>
        <Text style={styles.taskSubtitle}>CURRENT TASK</Text>
        <Text style={styles.taskTitle}>{taskName || 'No Task Named'}</Text>
      </View>

      <View style={styles.timerCircle}>
        <Text style={styles.timerText}>{formatTime()}</Text>
        <Text style={styles.statusText}>{isActive ? 'STAY FOCUSED' : 'PAUSED'}</Text>
      </View>

      <View style={styles.controlsContainer}>
        <TouchableOpacity 
          style={[styles.controlButton, isActive ? styles.pauseButton : styles.playButton]} 
          onPress={() => setIsActive(!isActive)}
        >
          <Ionicons name={isActive ? "pause" : "play"} size={28} color="white" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.quitButton} onPress={navigateToSummary}>
          <Text style={styles.quitButtonText}>GIVE UP</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F2537', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingHorizontal: 20, paddingTop: 20 },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  taskContainer: { alignItems: 'center', marginTop: 40, paddingHorizontal: 20 },
  taskSubtitle: { color: '#7FE5B6', fontSize: 12, fontWeight: '700', letterSpacing: 2, marginBottom: 5 },
  taskTitle: { color: 'white', fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  timerCircle: { width: 280, height: 280, borderRadius: 140, borderWidth: 6, borderColor: '#7FE5B6', justifyContent: 'center', alignItems: 'center', backgroundColor: '#1B3B54', shadowColor: '#7FE5B6', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: 15, elevation: 10 },
  timerText: { color: 'white', fontSize: 64, fontWeight: 'bold', fontFamily: 'Courier' },
  statusText: { color: '#A2BCCF', fontSize: 12, fontWeight: '600', letterSpacing: 3, marginTop: 10 },
  controlsContainer: { alignItems: 'center', width: '100%', paddingHorizontal: 40 },
  controlButton: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 25, elevation: 5 },
  pauseButton: { backgroundColor: '#E06D6D' },
  playButton: { backgroundColor: '#7FE5B6' },
  quitButton: { paddingVertical: 10 },
  quitButtonText: { color: '#A2BCCF', fontSize: 14, fontWeight: 'bold', letterSpacing: 1 },
});