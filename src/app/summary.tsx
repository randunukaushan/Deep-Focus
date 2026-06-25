import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function SummaryScreen() {
  const router = useRouter();

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
        
        {/* Stat Row 1 */}
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Time Focused</Text>
          <Text style={styles.statValue}>25 Mins</Text>
        </View>

        {/* Stat Row 2 */}
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>AI Shield Status</Text>
          <Text style={[styles.statValue, { color: '#7FE5B6', fontWeight: 'bold' }]}>100% SECURE</Text>
        </View>
      </View>

      {/* Bottom Action Button */}
      <TouchableOpacity 
        style={styles.homeButton} 
        onPress={() => router.replace('/')} // ආපහු මුල් පිටුවටම ලස්සනට රැගෙන යනවා
      >
        <Text style={styles.homeButtonText}>START NEW SESSION</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F2537',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  congratsContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1B3B54',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    borderWidth: 2,
    borderColor: '#7FE5B6',
  },
  mainTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    color: '#A2BCCF',
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  statsCard: {
    backgroundColor: '#1B3B54',
    width: '100%',
    borderRadius: 25,
    padding: 25,
    marginVertical: 30,
  },
  cardHeader: {
    color: '#7FE5B6',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 20,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#244A66',
  },
  statLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  statValue: {
    color: '#A2BCCF',
    fontSize: 16,
  },
  homeButton: {
    backgroundColor: '#7FE5B6', // කැපී පේන ලස්සන මින්ට් ග්‍රීන් බටන් එකක්
    width: '100%',
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#7FE5B6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  homeButtonText: {
    color: '#0F2537',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});