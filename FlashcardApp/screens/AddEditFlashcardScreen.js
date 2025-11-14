import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Appbar,
  Surface,
  RadioButton,
  Title,
} from 'react-native-paper';
import { auth, db } from '../firebase';
import { doc, addDoc, updateDoc, collection } from 'firebase/firestore';

const AddEditFlashcardScreen = ({ navigation, route }) => {
  const { flashcard } = route.params || {};
  const isEditing = !!flashcard;

  const [title, setTitle] = useState(flashcard?.title || '');
  const [tasks, setTasks] = useState(flashcard?.tasks || '');
  const [color, setColor] = useState(flashcard?.color || 'blue');
  const [dueDate, setDueDate] = useState(flashcard?.dueDate || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    navigation.setOptions({
      headerTitle: isEditing ? 'Edit Flashcard' : 'Add Flashcard',
    });
  }, [navigation, isEditing]);

  const validateForm = () => {
    if (!title.trim() || !tasks.trim()) {
      setError('Title and tasks are required');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const flashcardData = {
        title: title.trim(),
        tasks: tasks.trim(),
        color,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: flashcard?.status || 'incomplete',
        userId: auth.currentUser.uid,
        updatedAt: new Date(),
      };

      if (isEditing) {
        await updateDoc(doc(db, 'flashcards', flashcard.id), flashcardData);
      } else {
        flashcardData.createdAt = new Date();
        await addDoc(collection(db, 'flashcards'), flashcardData);
      }

      navigation.goBack();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const colorOptions = [
    { value: 'blue', label: 'Blue', color: '#2196F3' },
    { value: 'green', label: 'Green', color: '#4CAF50' },
    { value: 'red', label: 'Red', color: '#f44336' },
    { value: 'yellow', label: 'Yellow', color: '#FFEB3B' },
    { value: 'purple', label: 'Purple', color: '#9C27B0' },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={isEditing ? 'Edit Flashcard' : 'Add Flashcard'} />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        <Surface style={styles.form} elevation={2}>
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TextInput
            label="Title"
            value={title}
            onChangeText={setTitle}
            mode="outlined"
            style={styles.input}
            placeholder="Enter flashcard title"
          />

          <TextInput
            label="Tasks"
            value={tasks}
            onChangeText={setTasks}
            mode="outlined"
            style={[styles.input, styles.tasksInput]}
            multiline
            numberOfLines={4}
            placeholder="Enter tasks or description"
          />

          <View style={styles.section}>
            <Title style={styles.sectionTitle}>Color</Title>
            <View style={styles.colorOptions}>
              {colorOptions.map((option) => (
                <View key={option.value} style={styles.colorOption}>
                  <RadioButton.Android
                    value={option.value}
                    status={color === option.value ? 'checked' : 'unchecked'}
                    onPress={() => setColor(option.value)}
                    color={option.color}
                  />
                  <View
                    style={[
                      styles.colorPreview,
                      { backgroundColor: option.color },
                    ]}
                  />
                  <Text>{option.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Title style={styles.sectionTitle}>Due Date</Title>
            <TextInput
              label="Due Date"
              value={dueDate}
              onChangeText={setDueDate}
              mode="outlined"
              style={styles.input}
              placeholder="YYYY-MM-DD"
            />
            <Text style={styles.helperText}>
              Optional: Set a due date for your flashcard
            </Text>
          </View>

          <Button
            mode="contained"
            onPress={handleSave}
            loading={loading}
            disabled={loading}
            style={styles.saveButton}
            labelStyle={styles.saveButtonLabel}
          >
            {isEditing ? 'Update Flashcard' : 'Create Flashcard'}
          </Button>
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
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
  form: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  input: {
    marginBottom: 16,
  },
  tasksInput: {
    minHeight: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
    color: '#333',
  },
  colorOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  colorOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flexBasis: '48%',
  },
  colorPreview: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginHorizontal: 8,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  saveButton: {
    marginTop: 8,
    paddingVertical: 8,
    backgroundColor: '#2196F3',
  },
  saveButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 16,
  },
});

export default AddEditFlashcardScreen;