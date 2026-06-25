import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function FocusScreen() {
  const router = useRouter();
  
  // ටයිමර් එක සඳහා සෙටින්ග්ස් (විනාඩි 25 = තත්පර 1500)
  const [secondsLeft, setSecondsLeft] = useState(1500);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: any = null;

    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((seconds => seconds - 1));
      }, 1000);
    } else if (secondsLeft === 0) {
      setIsActive(false);
      router.push('/summary');
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, secondsLeft]);

  // තත්පර ගණන විනාඩි සහ තත්පර විදිහට හැඩගැස්වීම (Format කිරීම)
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* App Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Focus Zone</Text>
        <View style={{ width: 28 }} /> {/* Balance එක තියාගන්න */}
      </View>

      {/* Main Focus Area */}
      <View style={styles.centerArea}>
        <Text style={styles.taskLabel}>CURRENT TASK</Text>
        <Text style={styles.taskName}>Chemistry P2 - Atomic Structure</Text>

        {/* Big Pomodoro Timer */}
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>{formatTime(secondsLeft)}</Text>
        </View>

        {/* Timer Controls */}
        <TouchableOpacity 
          style={[styles.controlButton, isActive ? styles.pauseButton : styles.playButton]} 
          onPress={() => setIsActive(!isActive)}
        >
          <Ionicons name={isActive ? "pause" : "play"} size={32} color="white" />
        </TouchableOpacity>
      </View>
         <TouchableOpacity 
             style={{ marginTop: 15 }} 
              onPress={() => router.push('/summary')}
          >
           <Text style={{ color: '#E26D5C', fontWeight: 'bold' }}>End Session</Text>
          </TouchableOpacity>
      {/* Bottom AI Status Dashboard */}
      <View style={styles.sheet}>
        <Text style={styles.sheetTitle}>AI Shield & Soundscape</Text>

        {/* Anti-Distraction Shield Widget */}
        <View style={styles.widgetCard}>
          <View style={styles.widgetHeader}>
            <MaterialCommunityIcons name="shield-check" size={24} color="#0F2537" />
            <Text style={styles.widgetTitle}>Anti-Distraction Shield</Text>
            <View style={styles.activeBadge}><Text style={styles.badgeText}>STRICT</Text></View>
          </View>
          <Text style={styles.widgetBody}>Social apps (TikTok, Instagram) are currently blocked.</Text>
        </View>

        {/* AI Soundscape Widget */}
        <View style={styles.widgetCard}>
          <View style={styles.widgetHeader}>
            <Ionicons name="musical-notes" size={24} color="#0F2537" />
            <Text style={styles.widgetTitle}>AI Soundscape</Text>
            <View style={[styles.activeBadge, { backgroundColor: '#2C7A6F' }]}><Text style={styles.badgeText}>PLAYING</Text></View>
          </View>
          <Text style={styles.widgetBody}>Adapting background frequencies to match your focus level.</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  centerArea: {
    alignItems: 'center',
    marginVertical: 30,
  },
  taskLabel: {
    color: '#7FE5B6',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  taskName: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
    marginTop: 5,
  },
  timerContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: '#7FE5B6',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 25,
  },
  timerText: {
    color: 'white',
    fontSize: 48,
    fontWeight: 'bold',
  },
  controlButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  playButton: {
    backgroundColor: '#2C7A6F',
  },
  pauseButton: {
    backgroundColor: '#E26D5C',
  },
  sheet: {
    flex: 1,
    backgroundColor: '#CBEFDF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 25,
  },
  sheetTitle: {
    color: '#0F2537',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  widgetCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
  },
  widgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  widgetTitle: {
    color: '#0F2537',
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 10,
    flex: 1,
  },
  activeBadge: {
    backgroundColor: '#E26D5C',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  widgetBody: {
    color: '#555',
    fontSize: 13,
    marginLeft: 34,
  },
});