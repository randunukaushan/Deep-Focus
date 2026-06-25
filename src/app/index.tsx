import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
const router = useRouter();
export default function SessionSetupScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* App Bar / Header */}
      <View style={[styles.header, { justifyContent: 'space-between' }]}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.avatar}>
          <Ionicons name="person" size={20} color="#0F2537" />
        </TouchableOpacity>
      </View>

      {/* Main Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.mainTitle}>NEW FOCUS{"\n"}SESSION</Text>
      </View>

      {/* Main Mint Green Card */}
      <View style={styles.sheet}>
        <ScrollView showsVerticalScrollIndicator={false}>
          
          {/* 1. Focus Type Section */}
          <Text style={styles.sectionTitle}>Focus Type</Text>
          <View style={styles.row}>
            {/* Deep Work Button */}
            <TouchableOpacity style={[styles.typeButton, styles.activeButton]}>
              <MaterialCommunityIcons name="brain" size={24} color="white" />
              <Text style={[styles.buttonText, styles.activeButtonText]}>Deep Work</Text>
            </TouchableOpacity>

            {/* Study Button */}
            <TouchableOpacity style={styles.typeButton}>
              <Ionicons name="school" size={24} color="#0F2537" />
              <Text style={styles.buttonText}>Study</Text>
            </TouchableOpacity>

            {/* Creative Button */}
            <TouchableOpacity style={styles.typeButton}>
              <Ionicons name="brush" size={24} color="#0F2537" />
              <Text style={styles.buttonText}>Creative</Text>
            </TouchableOpacity>
          </View>

          {/* 2. Current Task Section */}
          <Text style={styles.sectionTitle}>Current Task</Text>
          <View style={styles.taskCard}>
            <Text style={styles.taskText}>Chemistry P2 - Atomic Structure</Text>
          </View>

          {/* 3. AI Energy Section */}
          <Text style={styles.sectionTitle}>AI Energy</Text>
          <View style={styles.energyCard}>
            <View style={styles.energyInfo}>
              <Ionicons name="trending-up" size={32} color="#0F2537" />
              <View style={styles.energyTextContainer}>
                <Text style={styles.energyPercentage}>85%</Text>
                <Text style={styles.energyStatus}>Optimal for Deep Work</Text>
              </View>
            </View>
          </View>

          {/* 4. Start Session Button */}
          <TouchableOpacity
           style={styles.startButton} 
           onPress={() => router.push('/focus')}
          >                 
          <Text style={styles.startButtonText}>START SESSION</Text>
          </TouchableOpacity>
          
          
          

        </ScrollView>
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#CBEFDF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    paddingHorizontal: 20,
    marginVertical: 15,
  },
  mainTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  sheet: {
    flex: 1,
    backgroundColor: '#CBEFDF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 25,
  },
  sectionTitle: {
    color: '#0F2537',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  typeButton: {
    width: '30%',
    backgroundColor: 'white',
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#0F2537',
  },
  buttonText: {
    color: '#0F2537',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 5,
  },
  activeButtonText: {
    color: 'white',
  },
  taskCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 18,
    marginBottom: 15,
  },
  taskText: {
    color: '#333',
    fontSize: 15,
  },
  energyCard: {
    backgroundColor: '#B5EAD1',
    borderRadius: 15,
    padding: 15,
    marginBottom: 30,
  },
  energyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  energyTextContainer: {
    marginLeft: 15,
  },
  energyPercentage: {
    color: '#0F2537',
    fontSize: 24,
    fontWeight: 'bold',
  },
  energyStatus: {
    color: '#0F2537',
    fontSize: 14,
  },
  startButton: {
    backgroundColor: '#2C7A6F',
    borderRadius: 15,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});