import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {
  Text,
  FAB,
  Appbar,
  Card,
  Button,
  Surface,
  Divider,
} from 'react-native-paper';
import { auth, db } from '../firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';

const HomeScreen = ({ navigation }) => {
  const [flashcards, setFlashcards] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, 'flashcards'),
        where('userId', '==', user.uid)
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const flashcardsData = [];
        querySnapshot.forEach((doc) => {
          flashcardsData.push({ id: doc.id, ...doc.data() });
        });
        setFlashcards(flashcardsData);
      });

      return () => unsubscribe();
    }
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const markAsComplete = async (flashcardId) => {
    try {
      const flashcardRef = doc(db, 'flashcards', flashcardId);
      await updateDoc(flashcardRef, {
        status: 'completed',
        completedAt: new Date(),
      });
    } catch (error) {
      console.error('Error marking as complete:', error);
    }
  };

  const deleteFlashcard = async (flashcardId) => {
    try {
      await deleteDoc(doc(db, 'flashcards', flashcardId));
    } catch (error) {
      console.error('Error deleting flashcard:', error);
    }
  };

  const incompleteFlashcards = flashcards.filter(
    (card) => card.status !== 'completed'
  );
  const completedFlashcards = flashcards.filter(
    (card) => card.status === 'completed'
  );

  const getColorStyle = (color) => {
    const colors = {
      red: '#ffebee',
      blue: '#e3f2fd',
      green: '#e8f5e8',
      yellow: '#fffde7',
      purple: '#f3e5f5',
    };
    return { backgroundColor: colors[color] || '#ffffff' };
  };

  const FlashcardItem = ({ item, isCompleted }) => (
    <Card style={[styles.flashcard, getColorStyle(item.color)]}>
      <Card.Content>
        <View style={styles.flashcardHeader}>
          <Text style={styles.flashcardTitle}>{item.title}</Text>
          {item.dueDate && (
            <Text style={styles.dueDate}>
              Due: {new Date(item.dueDate.seconds * 1000).toLocaleDateString()}
            </Text>
          )}
        </View>
        
        <Text style={styles.tasks}>{item.tasks}</Text>
        
        <View style={styles.flashcardActions}>
          {!isCompleted && (
            <>
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('AddEditFlashcard', { flashcard: item })}
                style={styles.actionButton}
              >
                Edit
              </Button>
              <Button
                mode="contained"
                onPress={() => markAsComplete(item.id)}
                style={styles.actionButton}
              >
                Complete
              </Button>
              <Button
                mode="outlined"
                onPress={() => deleteFlashcard(item.id)}
                style={[styles.actionButton, styles.deleteButton]}
                textColor="#f44336"
              >
                Delete
              </Button>
            </>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.Content title="Flashcard Master" />
        <Appbar.Action
          icon="account"
          onPress={() => navigation.navigate('Profile')}
        />
      </Appbar.Header>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Surface style={styles.greeting}>
          <Text style={styles.greetingText}>
            Hello {user?.displayName || 'User'}!
          </Text>
          <Text style={styles.subtitle}>
            Manage your flashcards and stay organized
          </Text>
        </Surface>

        {/* Incomplete Flashcards */}
        <Surface style={styles.section} elevation={2}>
          <Text style={styles.sectionTitle}>Incomplete ({incompleteFlashcards.length})</Text>
          <Divider style={styles.divider} />
          {incompleteFlashcards.length === 0 ? (
            <Text style={styles.emptyText}>No incomplete flashcards</Text>
          ) : (
            incompleteFlashcards.map((item) => (
              <FlashcardItem key={item.id} item={item} isCompleted={false} />
            ))
          )}
        </Surface>

        {/* Completed Flashcards */}
        <Surface style={styles.section} elevation={2}>
          <Text style={styles.sectionTitle}>Completed ({completedFlashcards.length})</Text>
          <Divider style={styles.divider} />
          {completedFlashcards.length === 0 ? (
            <Text style={styles.emptyText}>No completed flashcards</Text>
          ) : (
            completedFlashcards.map((item) => (
              <FlashcardItem key={item.id} item={item} isCompleted={true} />
            ))
          )}
        </Surface>
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('AddEditFlashcard')}
        color="white"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2196F3',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  greeting: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: 'white',
  },
  greetingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: 'white',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  divider: {
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    padding: 20,
  },
  flashcard: {
    marginBottom: 12,
    borderRadius: 8,
  },
  flashcardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  flashcardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    color: '#333',
  },
  dueDate: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  tasks: {
    fontSize: 14,
    color: '#555',
    marginBottom: 12,
  },
  flashcardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
  },
  actionButton: {
    marginLeft: 8,
    marginBottom: 4,
  },
  deleteButton: {
    borderColor: '#f44336',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2196F3',
  },
});

export default HomeScreen;