import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import * as Contacts from 'expo-contacts';
import { useApp } from '../context/AppContext';
import Button from '../components/Button';
import { colors, spacing, borderRadius } from '../constants/theme';
import {
  RelationshipType,
  ContactFrequency,
  RELATIONSHIP_LABELS,
  FREQUENCY_LABELS,
} from '../types';

type RootStackParamList = {
  MainTabs: undefined;
  PersonDetail: { personId: string };
  AddEditPerson: { personId?: string };
};

type AddEditPersonRouteProp = RouteProp<RootStackParamList, 'AddEditPerson'>;

export default function AddEditPersonScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<AddEditPersonRouteProp>();
  const { persons, addPerson, updatePerson } = useApp();

  const isEditing = !!route.params?.personId;
  const existingPerson = isEditing
    ? persons.find(p => p.id === route.params.personId)
    : null;

  const [name, setName] = useState(existingPerson?.name || '');
  const [photo, setPhoto] = useState<string | undefined>(existingPerson?.photo);
  const [relationshipType, setRelationshipType] = useState<RelationshipType>(
    existingPerson?.relationshipType || 'friend'
  );
  const [frequency, setFrequency] = useState<ContactFrequency>(
    existingPerson?.frequency || 'weekly'
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      title: isEditing ? 'Edit Person' : 'Add Person',
    });
  }, [isEditing, navigation]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0]) {
      setPhoto(result.assets[0].uri);
    }
  };

  const importFromContacts = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Please allow access to contacts to import.');
      return;
    }

    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.Name, Contacts.Fields.Image],
    });

    if (data.length > 0) {
      // Show a simple picker with first 20 contacts
      const contactOptions = data.slice(0, 20).map(contact => ({
        text: contact.name || 'Unknown',
        onPress: () => {
          setName(contact.name || '');
          if (contact.image?.uri) {
            setPhoto(contact.image.uri);
          }
        },
      }));

      Alert.alert('Select Contact', 'Choose a contact to import', [
        ...contactOptions.slice(0, 5),
        { text: 'Cancel', style: 'cancel' },
      ]);
    } else {
      Alert.alert('No Contacts', 'No contacts found on this device.');
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Name Required', 'Please enter a name for this person.');
      return;
    }

    setSaving(true);
    try {
      if (isEditing && existingPerson) {
        await updatePerson({
          id: existingPerson.id,
          name: name.trim(),
          photo,
          relationshipType,
          frequency,
        });
      } else {
        await addPerson({
          name: name.trim(),
          photo,
          relationshipType,
          frequency,
          lastContactDate: null,
        });
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const relationshipOptions: RelationshipType[] = ['friend', 'family', 'partner', 'other'];
  const frequencyOptions: ContactFrequency[] = ['daily', 'weekly', 'fortnightly', 'monthly', 'quarterly'];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Photo Section */}
        <View style={styles.photoSection}>
          <TouchableOpacity onPress={pickImage} style={styles.photoContainer}>
            {photo ? (
              <Image source={{ uri: photo }} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoPlaceholderText}>+</Text>
                <Text style={styles.photoLabel}>Add Photo</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Name Input */}
        <View style={styles.section}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
          {!isEditing && (
            <TouchableOpacity style={styles.importButton} onPress={importFromContacts}>
              <Text style={styles.importButtonText}>Import from Contacts</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Relationship Type */}
        <View style={styles.section}>
          <Text style={styles.label}>Relationship</Text>
          <View style={styles.optionsContainer}>
            {relationshipOptions.map(option => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionButton,
                  relationshipType === option && styles.optionButtonSelected,
                ]}
                onPress={() => setRelationshipType(option)}
              >
                <Text
                  style={[
                    styles.optionText,
                    relationshipType === option && styles.optionTextSelected,
                  ]}
                >
                  {RELATIONSHIP_LABELS[option]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Frequency */}
        <View style={styles.section}>
          <Text style={styles.label}>How often do you want to connect?</Text>
          <View style={styles.frequencyContainer}>
            {frequencyOptions.map(option => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.frequencyButton,
                  frequency === option && styles.frequencyButtonSelected,
                ]}
                onPress={() => setFrequency(option)}
              >
                <Text
                  style={[
                    styles.frequencyText,
                    frequency === option && styles.frequencyTextSelected,
                  ]}
                >
                  {FREQUENCY_LABELS[option]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Save Button */}
        <View style={styles.buttonSection}>
          <Button
            title={isEditing ? 'Save Changes' : 'Add to Garden'}
            onPress={handleSave}
            loading={saving}
            disabled={!name.trim()}
            size="large"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  photoSection: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  photoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderText: {
    fontSize: 32,
    color: colors.textLight,
  },
  photoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
  },
  importButton: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    alignItems: 'center',
  },
  importButtonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  optionButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  optionButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: colors.surface,
  },
  frequencyContainer: {
    gap: spacing.sm,
  },
  frequencyButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  frequencyButtonSelected: {
    backgroundColor: colors.primary + '15',
    borderColor: colors.primary,
  },
  frequencyText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  frequencyTextSelected: {
    color: colors.primary,
  },
  buttonSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
});
