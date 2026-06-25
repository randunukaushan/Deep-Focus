import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function SummaryScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* App Bar */}
      <View style={styles.header}>
        <View style={{ width: 24 }} />
        <Text style={styles.headerTitle}>Session Summary</Text>
        <TouchableOpacity onPress={() => router.replace('/')}>
          <Ionicons name="home" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Success Badge & Points Section */}
        <View style={styles.successCard}>
          <MaterialCommunityIcons name="trophy-award" size={80} color="#7FE5B6" />
          <Text style={styles.congratstext}>SESSION COMPLETE!</Text>
          <Text style={styles.pointsText}>+150 XP Earned</Text>
          <Text style={styles.streakText}>🔥 5 Day Streak!</Text>
        </View>

        {/* Analytics Dashboard Sheet */}
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>Deep Work Analytics</Text>

          {/* Stat 1: Focus Duration */}
          <View style={styles.statCard}>
            <Ionicons name="time" size={24} color="#0F2537" />
            <View style={styles.statTextContainer}>
              <Text style={styles.statLabel}>Total Focus Time</Text>
              <Text style={styles.statValue}>25 Minutes</Text>
            </View>
          </View>

          {/* Stat 2: Distraction Shield Insights */}
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="shield-airplane" size={24} color="#0F2537" />
            <View style={styles.statTextContainer}>
              <Text style={styles.statLabel}>Distractions Blocked</Text>
              <Text style={styles.statValue}>12 Attempts (TikTok/Insta)</Text>
            </View>
          </View>

          {/* Simple Chart Simulation (AI Focus Graph) */}
          <Text style={styles.chartTitle}>Weekly Focus Pattern</Text>
          <View style={styles.chartContainer}>
            <View style={[styles.bar, { height: 40 }]}><Text style={styles.barLabel}>M</Text></View>
            <View style={[styles.bar, { height: 70 }]}><Text style={styles.barLabel}>T</Text></View>
            <View style={[styles.bar, { height: 110, backgroundColor: '#2C7A6F' }]}><Text style={styles.barLabel}>W</Text></View>
            <View style={[styles.bar, { height: 50 }]}><Text style={styles.barLabel}>T</Text></View>
            <View style={[styles.bar, { height: 90 }]}><Text style={styles.barLabel}>F</Text></View>
          </View>
          <Text style={styles.aiInsightText}>💡 AI Insight: Your focus peaks on Wednesdays at 9:00 AM.</Text>

          {/* Done Button */}
          <TouchableOpacity style={styles.doneButton} onPress={() => router.replace('/')}>
            <Text style={styles.doneButtonText}>BACK TO DASHBOARD</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F2537',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 10,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  successCard: {
    alignItems: 'center',
    marginVertical: 20,
  },
  congratstext: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 15,
    letterSpacing: 1,
  },
  pointsText: {
    color: '#7FE5B6',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 5,
  },
  streakText: {
    color: 'white',
    fontSize: 14,
    marginTop: 5,
    opacity: 0.8,
  },
  sheet: {
    backgroundColor: '#CBEFDF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 40,
  },
  sheetTitle: {
    color: '#0F2537',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statTextContainer: {
    marginLeft: 15,
  },
  statLabel: {
    color: '#555',
    fontSize: 12,
  },
  statValue: {
    color: '#0F2537',
    fontSize: 16,
    fontWeight: 'bold',
  },
  chartTitle: {
    color: '#0F2537',
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    height: 160,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },
  bar: {
    width: 25,
    backgroundColor: '#0F2537',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barLabel: {
    color: 'white',
    fontSize: 10,
    marginBottom: -18,
  },
  aiInsightText: {
    color: '#2C7A6F',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 25,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  doneButton: {
    backgroundColor: '#0F2537',
    borderRadius: 15,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 30,
  },
  doneButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});