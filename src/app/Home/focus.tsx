import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function FocusScreen() {
  const params = useLocalSearchParams<{
    taskName?: string;
    duration?: string;
  }>();

  const durationMinutes = Number(params.duration) || 50;
  const taskName = params.taskName || 'Focus Session';

  const totalSeconds = durationMinutes * 60;

  const [remainingSeconds, setRemainingSeconds] = useState(totalSeconds);
  const [isPaused, setIsPaused] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const endTimeRef = useRef(0);
  const pausedRemainingRef = useRef(totalSeconds);

  useEffect(() => {
    if (isPaused || isCompleted) {
      return;
    }

    if (endTimeRef.current === 0) {
      endTimeRef.current = Date.now() + totalSeconds * 1000;
    }

    const updateTimer = () => {
      const remaining = Math.max(
        0,
        Math.ceil((endTimeRef.current - Date.now()) / 1000)
      );

      setRemainingSeconds(remaining);

      if (remaining <= 0) {
        setIsCompleted(true);
      }
    };

    updateTimer();

    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [isPaused, isCompleted, totalSeconds]);

  const handlePauseResume = () => {
    if (isPaused) {
      endTimeRef.current =
        Date.now() + pausedRemainingRef.current * 1000;

      setIsPaused(false);
      return;
    }

    const remaining = Math.max(
      0,
      Math.ceil((endTimeRef.current - Date.now()) / 1000)
    );

    pausedRemainingRef.current = remaining;
    setRemainingSeconds(remaining);
    setIsPaused(true);
  };

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  const formattedTime =
    `${minutes.toString().padStart(2, '0')}:` +
    `${seconds.toString().padStart(2, '0')}`;

  if (isCompleted) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />

        <View style={styles.completedContainer}>
          <View style={styles.completedIcon}>
            <Ionicons
              name="checkmark"
              size={34}
              color="#0F2537"
            />
          </View>

          <Text style={styles.completedTitle}>
            Focus complete
          </Text>

          <Text style={styles.completedDescription}>
            Nice work. You completed your {durationMinutes}-minute focus
            session.
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.replace('/')}
          >
            <Text style={styles.primaryButtonText}>
              Back to Home
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.content}>
        <View style={styles.top}>
          <Text style={styles.eyebrow}>
            {isPaused ? 'SESSION PAUSED' : 'DEEP FOCUS'}
          </Text>

          <Text style={styles.taskName}>
            {taskName}
          </Text>
        </View>

        <View style={styles.timerArea}>
          <View style={styles.timerOuterCircle}>
            <View style={styles.timerInnerCircle}>
              <Text style={styles.timer}>
                {formattedTime}
              </Text>

              <Text style={styles.timerLabel}>
                {isPaused ? 'Paused' : 'Remaining'}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.message}>
          {isPaused
            ? 'Take a moment, then continue when you are ready.'
            : 'Stay with one thing. Everything else can wait.'}
        </Text>

        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.pauseButton}
            onPress={handlePauseResume}
            accessibilityRole="button"
            accessibilityLabel={
              isPaused ? 'Resume focus session' : 'Pause focus session'
            }
          >
            <Ionicons
              name={isPaused ? 'play' : 'pause'}
              size={24}
              color="#0F2537"
            />

            <Text style={styles.pauseButtonText}>
              {isPaused ? 'Resume' : 'Pause'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.endButton}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="End focus session"
          >
            <Ionicons
              name="stop-outline"
              size={22}
              color="#EF8B8B"
            />

            <Text style={styles.endButtonText}>
              End Session
            </Text>
          </TouchableOpacity>
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
    paddingTop: 34,
    paddingBottom: 36,
  },

  top: {
    alignItems: 'center',
  },

  eyebrow: {
    color: '#7FE5B6',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 10,
  },

  taskName: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '600',
    textAlign: 'center',
  },

  timerArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  timerOuterCircle: {
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 3,
    borderColor: '#21465E',
    justifyContent: 'center',
    alignItems: 'center',
  },

  timerInnerCircle: {
    width: 238,
    height: 238,
    borderRadius: 119,
    backgroundColor: '#17354A',
    justifyContent: 'center',
    alignItems: 'center',
  },

  timer: {
    color: '#FFFFFF',
    fontSize: 56,
    fontWeight: '700',
    letterSpacing: 1,
  },

  timerLabel: {
    color: '#8FAABD',
    fontSize: 13,
    marginTop: 10,
  },

  message: {
    color: '#A2BCCF',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: 25,
    marginBottom: 34,
  },

  controls: {
    gap: 12,
  },

  pauseButton: {
    height: 60,
    borderRadius: 18,
    backgroundColor: '#7FE5B6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },

  pauseButtonText: {
    color: '#0F2537',
    fontSize: 16,
    fontWeight: '700',
  },

  endButton: {
    height: 56,
    borderRadius: 18,
    backgroundColor: '#17354A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },

  endButtonText: {
    color: '#EF8B8B',
    fontSize: 15,
    fontWeight: '600',
  },

  completedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  completedIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#7FE5B6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 26,
  },

  completedTitle: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 12,
  },

  completedDescription: {
    color: '#A2BCCF',
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
    marginBottom: 34,
  },

  primaryButton: {
    width: '100%',
    height: 60,
    borderRadius: 18,
    backgroundColor: '#7FE5B6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  primaryButtonText: {
    color: '#0F2537',
    fontSize: 16,
    fontWeight: '700',
  },
});
