import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import {
  Text,
  Appbar,
  Surface,
  Button,
  Title,
  Divider,
} from 'react-native-paper';
import { auth, db } from '../firebase';
import { signOut, deleteUser } from 'firebase/auth';
import { doc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';

const ProfileScreen = ({ navigation }) => {
  const user = auth.currentUser;
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: deleteUserAccount,
        },
      ]
    );
  };

  const deleteUserAccount = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      
      if (user) {
        // Delete all user's flashcards
        const flashcardsQuery = query(
          collection(db, 'flashcards'),
          where('userId', '==', user.uid)
        );
        
        const flashcardSnapshot = await getDocs(flashcardsQuery);
        const deletePromises = flashcardSnapshot.docs.map((doc) =>
          deleteDoc(doc.ref)
        );
        
        await Promise.all(deletePromises);
        
        // Delete user document
        await deleteDoc(doc(db, 'users', user.uid));
        
        // Delete user account
        await deleteUser(user);
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      Alert.alert('Error', 'Failed to delete account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Profile" />
      </Appbar.Header>

      <View style={styles.content}>
        <Surface style={styles.profileCard} elevation={4}>
          <Title style={styles.title}>Profile Information</Title>
          <Divider style={styles.divider} />
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{user?.displayName || 'Not set'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{user?.email}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>User ID:</Text>
            <Text style={[styles.value, styles.userId]} numberOfLines={1}>
              {user?.uid}
            </Text>
          </View>
        </Surface>

        <View style={styles.actions}>
          <Button
            mode="outlined"
            onPress={handleSignOut}
            loading={loading}
            disabled={loading}
            style={styles.button}
            icon="logout"
          >
            Sign Out
          </Button>

          <Button
            mode="contained"
            onPress={handleDeleteAccount}
            loading={loading}
            disabled={loading}
            style={[styles.button, styles.deleteButton]}
            textColor="white"
            icon="delete"
          >
            Delete Account
          </Button>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  profileCard: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: 'white',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2196F3',
    textAlign: 'center',
  },
  divider: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  value: {
    fontSize: 16,
    color: '#666',
    flex: 2,
    textAlign: 'right',
  },
  userId: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  actions: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  button: {
    marginBottom: 12,
    paddingVertical: 8,
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
});

export default ProfileScreen;