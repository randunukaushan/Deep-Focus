import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function SummaryScreen() {
  const router = useRouter();
  // Focus පිටුවෙන් එවපු දත්ත මෙතනට බාරගන්නවා
  const { completedTask, completedType } = useLocalSearchParams();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Success Icon & Title */}
      <View style={styles.congratsContainer}>
        <View style={styles.iconCircle}>
          <Ionicons name="trophy" size={50} color="#7FE5B6" />
        </View>
        <Text style={styles.mainTitle}>Session Finished!</Text>
        <Text style={styles.subtitle}>Great job staying away from distractions.</Text>
      </View>

      {/* Stats Card */}
      <View style={styles.statsCard}>
        <Text style={styles.cardHeader}>SESSION STATS</Text>
        
        {/* Dynamic Row 1: Task Name */}
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Task Focused</Text>
          <Text style={[styles.statValue, { color: 'white', fontWeight: 'bold' }]}>
            {completedTask || 'General Focus'}
          </Text>
        </View>

        {/* Dynamic Row 2: Focus Type */}
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Focus Type</Text>
          <Text style={styles.statValue}>{completedType || 'Deep Work'}</Text>
        </View>

        {/* Stat Row 3 */}
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Time Spent</Text>
          <Text style={styles.statValue}>25 Mins</Text>
        </View>

        {/* Stat Row 4 */}
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>AI Shield Status</Text>
          <Text style={[styles.statValue, { color: '#7FE5B6', fontWeight: 'bold' }]}>100% SECURE</Text>
        </View>
      </View>

      {/* Bottom Action Button */}
      <TouchableOpacity style={styles.homeButton} onPress={() => router.replace('/')}>
        <Text style={styles.homeButtonText}>START NEW SESSION</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F2537', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 40, paddingHorizontal: 20 },
  congratsContainer: { alignItems: 'center', marginTop: 20 },
  iconCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#1B3B54', justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 2, borderColor: '#7FE5B6' },
  mainTitle: { color: 'white', fontSize: 26, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { color: '#A2BCCF', fontSize: 14, textAlign: 'center', paddingHorizontal: 20, lineHeight: 20 },
  statsCard: { backgroundColor: '#1B3B54', width: '100%', borderRadius: 25, padding: 25, marginVertical: 20 },
  cardHeader: { color: '#7FE5B6', fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: 15 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#244A66' },
  statLabel: { color: 'white', fontSize: 15, fontWeight: '500' },
  statValue: { color: '#A2BCCF', fontSize: 15, textAlign: 'right', flex: 1, marginLeft: 20 },
  homeButton: { backgroundColor: '#7FE5B6', width: '100%', borderRadius: 20, paddingVertical: 18, alignItems: 'center', elevation: 5 },
  homeButtonText: { color: '#0F2537', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
});