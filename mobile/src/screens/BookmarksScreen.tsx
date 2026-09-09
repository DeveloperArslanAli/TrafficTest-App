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
import { QuestionRepository } from '../repositories/QuestionRepository';
import type { Question } from '../types';

const KEY_BOOKMARKS = 'bookmarked_question_ids';

interface BookmarkedQuestion extends Question {
  bookmarkIndex: number;
}

function getCategoryColor(category: string): string {
  switch (category) {
    case 'WARNING': return '#F59E0B';
    case 'REGULATORY': return '#EF4444';
    case 'SIGNAL': return '#10B981';
    case 'GENERAL': return '#6366F1';
    default: return '#64748B';
  }
}

export default function BookmarksScreen() {
  const [bookmarks, setBookmarks] = useState<BookmarkedQuestion[]>([]);

  const loadBookmarks = useCallback(() => {
    try {
      const idsRaw = storage.getString(KEY_BOOKMARKS);

      if (!idsRaw) {
        setBookmarks([]);
        return;
      }

      const ids: string[] = JSON.parse(idsRaw);
      const bank: Question[] = QuestionRepository.getAll();

      const result: BookmarkedQuestion[] = ids
        .map((id, index) => {
          const q = bank.find((item) => item.id === id);
          if (!q) return null;
          return { ...q, bookmarkIndex: index } as BookmarkedQuestion;
        })
        .filter((item): item is BookmarkedQuestion => item !== null);

      setBookmarks(result);
    } catch {
      setBookmarks([]);
    }
  }, []);

  // Reload bookmarks every time this tab comes into focus
  useFocusEffect(loadBookmarks);

  const removeBookmark = (questionId: string) => {
    Alert.alert(
      'Remove Bookmark',
      'Remove this question from your bookmarks?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            try {
              const idsRaw = storage.getString(KEY_BOOKMARKS);
              const ids: string[] = idsRaw ? JSON.parse(idsRaw) : [];
              const updated = ids.filter((id) => id !== questionId);
              storage.set(KEY_BOOKMARKS, JSON.stringify(updated));
              loadBookmarks();
            } catch {
              // ignore
            }
          },
        },
      ],
    );
  };

  const clearAll = () => {
    Alert.alert(
      'Clear All Bookmarks',
      'Are you sure you want to remove all bookmarks?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            storage.set(KEY_BOOKMARKS, JSON.stringify([]));
            setBookmarks([]);
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Bookmarks 🔖</Text>
          <Text style={styles.headerSubtitle}>{bookmarks.length} saved question{bookmarks.length !== 1 ? 's' : ''}</Text>
        </View>
        {bookmarks.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={clearAll}>
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {bookmarks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🔖</Text>
          <Text style={styles.emptyTitle}>No Bookmarks Yet</Text>
          <Text style={styles.emptyText}>
            While taking a quiz, bookmark questions you want to revisit later. They'll appear here.
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {bookmarks.map((item) => (
            <View key={item.id} style={styles.bookmarkCard}>
              <View style={styles.bookmarkHeader}>
                <View style={[styles.categoryTag, { backgroundColor: getCategoryColor(item.category) }]}>
                  <Text style={styles.categoryTagText}>{item.category}</Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => removeBookmark(item.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.deleteIcon}>🗑️</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.questionText}>{item.text}</Text>

              <View style={styles.divider} />

              <Text style={styles.correctAnswerLabel}>Correct answer:</Text>
              <Text style={styles.correctAnswerText}>
                {item.options[item.correctIndex]}
              </Text>
            </View>
          ))}
          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },

  header: {
    backgroundColor: '#1A3C5E',
    paddingTop: Platform.OS === 'android' ? 48 : 56,
    paddingBottom: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFF' },
  headerSubtitle: { fontSize: 12, color: '#93C5FD', marginTop: 2, fontWeight: '500' },
  clearButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  clearButtonText: { color: '#FFF', fontSize: 13, fontWeight: '600' },

  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#1E293B', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22 },

  scrollView: { flex: 1 },
  scrollContent: { padding: 16 },

  bookmarkCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  bookmarkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryTagText: { fontSize: 11, fontWeight: '700', color: '#FFF' },
  deleteButton: { padding: 2 },
  deleteIcon: { fontSize: 18 },

  questionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    lineHeight: 21,
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 8,
  },
  correctAnswerLabel: { fontSize: 11, color: '#64748B', fontWeight: '600', marginBottom: 3 },
  correctAnswerText: { fontSize: 13, fontWeight: '700', color: '#059669' },
});
