import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { storage } from '../utils/storage';
import { clearAuthToken } from '../services/api';
import Constants from 'expo-constants';

interface Stats {
  totalAttempts: number;
  totalScore: number;
  averageScore: number;
  email: string;
  name: string;
}

function loadStats(): Stats {
  const totalAttempts = storage.getNumber('total_attempts') ?? 0;
  const totalScore = storage.getNumber('total_score') ?? 0;
  const totalQuestions = storage.getNumber('total_questions_attempted') ?? (totalAttempts > 0 ? Math.max(totalScore, totalAttempts * 20) : 0);
  const averagePct = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;
  const email = storage.getString('user_email') ?? 'Guest User';
  const name = storage.getString('user_name') ?? 'Driver';
  return { totalAttempts, totalScore, averageScore: averagePct, email, name };
}

export default function ProfileScreen() {
  const [stats, setStats] = useState<Stats>(loadStats);

  useFocusEffect(
    useCallback(() => {
      setStats(loadStats());
    }, []),
  );

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out? Your local question bank will be kept.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => {
            // Clear auth credentials from MMKV
            storage.delete('auth_token');
            storage.delete('user_email');
            storage.delete('user_name');
            // Clear bearer token from API
            clearAuthToken();
            setStats(loadStats());
            Alert.alert('Logged Out', 'You have been logged out successfully.');
          },
        },
      ],
    );
  };

  const handleResetStats = () => {
    Alert.alert(
      'Reset Statistics',
      'This will permanently reset all your quiz statistics. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            storage.set('total_attempts', 0);
            storage.set('total_score', 0);
            storage.set('total_questions_attempted', 0);
            setStats(loadStats());
          },
        },
      ],
    );
  };

  const appVersion = Constants.expoConfig?.version ?? '4.0.0';
  const averagePct = stats.averageScore;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarEmoji}>👤</Text>
        </View>
        <Text style={styles.userName}>{stats.name}</Text>
        <Text style={styles.userEmail}>{stats.email}</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats cards */}
        <Text style={styles.sectionTitle}>Your Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🎯</Text>
            <Text style={styles.statValue}>{stats.totalAttempts}</Text>
            <Text style={styles.statLabel}>Total Attempts</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>⭐</Text>
            <Text style={styles.statValue}>{stats.totalScore}</Text>
            <Text style={styles.statLabel}>Total Score</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>📊</Text>
            <Text style={styles.statValue}>{averagePct}%</Text>
            <Text style={styles.statLabel}>Avg Score</Text>
          </View>
        </View>

        {/* Performance bar */}
        <View style={styles.performanceCard}>
          <View style={styles.performanceHeader}>
            <Text style={styles.performanceTitle}>Overall Performance</Text>
            <Text style={[styles.performancePct, { color: averagePct >= 80 ? '#10B981' : '#F59E0B' }]}>
              {averagePct}%
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(averagePct, 100)}%`,
                  backgroundColor: averagePct >= 80 ? '#10B981' : '#F59E0B',
                },
              ]}
            />
          </View>
          <Text style={styles.performanceNote}>
            {averagePct >= 80 ? '✅ You are pass-ready!' : '📚 Keep practicing to reach 80%'}
          </Text>
        </View>

        {/* App info */}
        <Text style={styles.sectionTitle}>App Info</Text>
        <View style={styles.infoCard}>
          <InfoRow icon="📱" label="App Name" value="TrafficTest" />
          <InfoRow icon="🔢" label="Version" value={appVersion} />
          <InfoRow icon="🌐" label="Platform" value={Platform.OS === 'android' ? 'Android' : 'iOS'} />
        </View>

        {/* Actions */}
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.actionsCard}>
          <TouchableOpacity style={styles.actionRow} onPress={handleResetStats}>
            <Text style={styles.actionIcon}>🔄</Text>
            <Text style={styles.actionLabel}>Reset Statistics</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity style={[styles.actionRow, styles.actionRowDanger]} onPress={handleLogout}>
            <Text style={styles.actionIcon}>🚪</Text>
            <Text style={[styles.actionLabel, styles.actionLabelDanger]}>Log Out</Text>
            <Text style={[styles.actionArrow, styles.actionLabelDanger]}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },

  header: {
    backgroundColor: '#1A3C5E',
    paddingTop: Platform.OS === 'android' ? 48 : 56,
    paddingBottom: 28,
    alignItems: 'center',
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarEmoji: { fontSize: 40 },
  userName: { fontSize: 20, fontWeight: '800', color: '#FFF', marginBottom: 4 },
  userEmail: { fontSize: 13, color: '#93C5FD', fontWeight: '500' },

  scrollView: { flex: 1 },
  scrollContent: { padding: 16 },

  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 16,
  },

  statsGrid: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  statEmoji: { fontSize: 22, marginBottom: 6 },
  statValue: { fontSize: 22, fontWeight: '800', color: '#1E293B' },
  statLabel: { fontSize: 10, color: '#64748B', fontWeight: '600', textAlign: 'center', marginTop: 2 },

  performanceCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  performanceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  performanceTitle: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  performancePct: { fontSize: 16, fontWeight: '800' },
  progressTrack: { height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: 8, borderRadius: 4 },
  performanceNote: { fontSize: 12, color: '#64748B', fontWeight: '500' },

  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  infoIcon: { fontSize: 18, marginRight: 12 },
  infoLabel: { flex: 1, fontSize: 14, color: '#374151', fontWeight: '500' },
  infoValue: { fontSize: 14, color: '#64748B', fontWeight: '600' },

  actionsCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  actionRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  actionRowDanger: {},
  actionIcon: { fontSize: 20, marginRight: 12 },
  actionLabel: { flex: 1, fontSize: 15, color: '#1E293B', fontWeight: '500' },
  actionLabelDanger: { color: '#DC2626' },
  actionArrow: { fontSize: 20, color: '#94A3B8' },
  separator: { height: 1, backgroundColor: '#F1F5F9', marginLeft: 50 },
});
