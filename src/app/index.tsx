import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.content}>
        {/* Top */}
        <View style={styles.header}>
          <View>
            <Text style={styles.smallText}>WELCOME BACK</Text>
            <Text style={styles.title}>Deep Focus</Text>
          </View>

          <TouchableOpacity style={styles.profileButton}>
            <Ionicons name="person-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Main Card */}
        <View style={styles.focusCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="flash-outline" size={28} color="#7FE5B6" />
          </View>

          <Text style={styles.cardTitle}>Ready to focus?</Text>

          <Text style={styles.cardDescription}>
            Start a focused session and make progress on what matters.
          </Text>

          <TouchableOpacity
                 style={styles.startButton}
                    onPress={() => router.push('/home/session-setup' as any)}>

            <Text style={styles.startButtonText}>Start Focus Session</Text>

            <Ionicons
              name="arrow-forward"
              size={20}
              color="#0F2537"
            />
          </TouchableOpacity>
        </View>

        {/* Bottom stats */}
        <Text style={styles.sectionTitle}>TODAY</Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>0m</Text>
            <Text style={styles.statLabel}>Focus Time</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F2537',
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 30,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 45,
  },

  smallText: {
    color: '#7FE5B6',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 5,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '700',
  },

  profileButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#1B3B54',
    justifyContent: 'center',
    alignItems: 'center',
  },

  focusCard: {
    backgroundColor: '#17354A',
    borderRadius: 28,
    padding: 25,
    marginBottom: 35,
  },

  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#21465E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
  },

  cardTitle: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '700',
    marginBottom: 10,
  },

  cardDescription: {
    color: '#A2BCCF',
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 28,
  },

  startButton: {
    backgroundColor: '#7FE5B6',
    height: 58,
    borderRadius: 18,
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

  sectionTitle: {
    color: '#A2BCCF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 14,
  },

  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#17354A',
    borderRadius: 20,
    padding: 20,
  },

  statNumber: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '700',
    marginBottom: 5,
  },

  statLabel: {
    color: '#8FAABD',
    fontSize: 13,
  },
});
