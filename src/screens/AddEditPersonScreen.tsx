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
  KeyboardAvoidingView,
  Platform,
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
  FamilyMember,
  RELATIONSHIP_LABELS,
  FREQUENCY_LABELS,
} from '../types';
import { generateId } from '../utils/helpers';

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
  const [birthday, setBirthday] = useState(existingPerson?.birthday || '');
  const [anniversary, setAnniversary] = useState(existingPerson?.anniversary || '');
  const [spouse, setSpouse] = useState<FamilyMember | undefined>(existingPerson?.spouse);
  const [kids, setKids] = useState<FamilyMember[]>(existingPerson?.kids || []);
  const [saving, setSaving] = useState(false);

  // Format date input as MM/DD
  const formatDateInput = (text: string): string => {
    // Remove any non-numeric characters except /
    const cleaned = text.replace(/[^\d]/g, '');

    if (cleaned.length === 0) return '';
    if (cleaned.length <= 2) return cleaned;

    // Format as MM/DD
    const month = cleaned.slice(0, 2);
    const day = cleaned.slice(2, 4);

    return `${month}/${day}`;
  };

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

  const addKid = () => {
    setKids([...kids, { id: generateId(), name: '', birthday: '', info: '' }]);
  };

  const updateKid = (index: number, field: keyof FamilyMember, value: string) => {
    const updated = [...kids];
    updated[index] = { ...updated[index], [field]: value };
    setKids(updated);
  };

  const removeKid = (index: number) => {
    setKids(kids.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Name Required', 'Please enter a name for this person.');
      return;
    }

    // Filter out kids with no name
    const validKids = kids.filter(k => k.name.trim());

    setSaving(true);
    try {
      if (isEditing && existingPerson) {
        await updatePerson({
          id: existingPerson.id,
          name: name.trim(),
          photo,
          relationshipType,
          frequency,
          birthday: birthday || undefined,
          anniversary: anniversary || undefined,
          spouse: spouse?.name?.trim() ? spouse : undefined,
          kids: validKids,
        });
      } else {
        await addPerson({
          name: name.trim(),
          photo,
          relationshipType,
          frequency,
          lastContactDate: null,
          birthday: birthday || undefined,
          anniversary: anniversary || undefined,
          spouse: spouse?.name?.trim() ? spouse : undefined,
          kids: validKids,
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
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
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
            placeholderTextColor={colors.textLight}
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

        {/* Important Dates */}
        <View style={styles.section}>
          <Text style={styles.label}>Important Dates</Text>
          <View style={styles.dateRow}>
            <View style={styles.dateField}>
              <Text style={styles.subLabel}>Birthday</Text>
              <TextInput
                style={styles.input}
                placeholder="MM/DD"
                placeholderTextColor={colors.textLight}
                value={birthday}
                onChangeText={(text) => setBirthday(formatDateInput(text))}
                keyboardType="number-pad"
                maxLength={5}
              />
            </View>
            <View style={styles.dateField}>
              <Text style={styles.subLabel}>Anniversary</Text>
              <TextInput
                style={styles.input}
                placeholder="MM/DD"
                placeholderTextColor={colors.textLight}
                value={anniversary}
                onChangeText={(text) => setAnniversary(formatDateInput(text))}
                keyboardType="number-pad"
                maxLength={5}
              />
            </View>
          </View>
        </View>

        {/* Spouse/Partner */}
        <View style={styles.section}>
          <Text style={styles.label}>Spouse / Partner</Text>
          <TextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor={colors.textLight}
            value={spouse?.name || ''}
            onChangeText={(text) => setSpouse({ id: spouse?.id || generateId(), name: text, birthday: spouse?.birthday, info: spouse?.info })}
          />
          <View style={styles.dateRow}>
            <View style={styles.dateField}>
              <TextInput
                style={[styles.input, styles.smallInput]}
                placeholder="Birthday (MM/DD)"
                placeholderTextColor={colors.textLight}
                value={spouse?.birthday || ''}
                onChangeText={(text) => setSpouse({ ...spouse!, birthday: formatDateInput(text) })}
                keyboardType="number-pad"
                maxLength={5}
              />
            </View>
            <View style={styles.dateField}>
              <TextInput
                style={[styles.input, styles.smallInput]}
                placeholder="Notes"
                placeholderTextColor={colors.textLight}
                value={spouse?.info || ''}
                onChangeText={(text) => setSpouse({ ...spouse!, info: text })}
              />
            </View>
          </View>
        </View>

        {/* Kids */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.label}>Kids</Text>
            <TouchableOpacity onPress={addKid}>
              <Text style={styles.addLink}>+ Add</Text>
            </TouchableOpacity>
          </View>
          {kids.map((kid, index) => (
            <View key={kid.id} style={styles.kidCard}>
              <View style={styles.kidHeader}>
                <Text style={styles.kidNumber}>Child {index + 1}</Text>
                <TouchableOpacity onPress={() => removeKid(index)}>
                  <Text style={styles.removeLink}>Remove</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Name"
                placeholderTextColor={colors.textLight}
                value={kid.name}
                onChangeText={(text) => updateKid(index, 'name', text)}
              />
              <View style={styles.dateRow}>
                <View style={styles.dateField}>
                  <TextInput
                    style={[styles.input, styles.smallInput]}
                    placeholder="Birthday (MM/DD)"
                    placeholderTextColor={colors.textLight}
                    value={kid.birthday || ''}
                    onChangeText={(text) => updateKid(index, 'birthday', formatDateInput(text))}
                    keyboardType="number-pad"
                    maxLength={5}
                  />
                </View>
                <View style={styles.dateField}>
                  <TextInput
                    style={[styles.input, styles.smallInput]}
                    placeholder="Notes (age, interests...)"
                    placeholderTextColor={colors.textLight}
                    value={kid.info || ''}
                    onChangeText={(text) => updateKid(index, 'info', text)}
                  />
                </View>
              </View>
            </View>
          ))}
          {kids.length === 0 && (
            <Text style={styles.emptyText}>No kids added</Text>
          )}
        </View>

        {/* Buttons */}
        <View style={styles.buttonSection}>
          <Button
            title={isEditing ? 'Save Changes' : 'Launch into Orbit'}
            onPress={handleSave}
            loading={saving}
            disabled={!name.trim()}
            size="large"
          />
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoid: {
    flex: 1,
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
    borderWidth: 1,
    borderColor: colors.border,
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
  cancelButton: {
    marginTop: spacing.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  dateRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  dateField: {
    flex: 1,
  },
  subLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  smallInput: {
    marginTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  addLink: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  kidCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  kidHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  kidNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  removeLink: {
    fontSize: 13,
    color: colors.error,
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textLight,
    fontStyle: 'italic',
  },
});
