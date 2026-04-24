import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { Paths, File, Directory } from 'expo-file-system';
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

const photosDir = new Directory(Paths.document, 'photos/');

const ensurePhotosDir = () => {
  if (!photosDir.exists) {
    photosDir.create({ intermediates: true });
  }
};

const savePhotoToStorage = (sourceUri: string): string => {
  ensurePhotosDir();
  const extension = sourceUri.split('.').pop()?.split('?')[0] || 'jpg';
  const filename = `${generateId()}.${extension}`;
  const sourceFile = new File(sourceUri);
  const destFile = new File(photosDir, filename);
  sourceFile.copy(destFile);
  return destFile.uri;
};

const deletePhotoFromStorage = (uri: string) => {
  try {
    const file = new File(uri);
    if (file.exists) {
      file.delete();
    }
  } catch (error) {
    console.warn('Failed to delete photo:', uri, error);
  }
};

type RootStackParamList = {
  MainTabs: undefined;
  PersonDetail: { personId: string };
  AddEditPerson: { personId?: string };
};

type AddEditPersonRouteProp = RouteProp<RootStackParamList, 'AddEditPerson'>;

export default function AddEditPersonScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<AddEditPersonRouteProp>();
  const { persons, addPerson, addPersonsBatch, updatePerson } = useApp();

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
  const [showFrequencyPicker, setShowFrequencyPicker] = useState(false);
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [deviceContacts, setDeviceContacts] = useState<Contacts.ExistingContact[]>([]);
  const [selectedContactIds, setSelectedContactIds] = useState<Set<string>>(new Set());
  const [contactSearch, setContactSearch] = useState('');
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [importingContacts, setImportingContacts] = useState(false);

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
      try {
        const persistentUri = savePhotoToStorage(result.assets[0].uri);
        if (photo) {
          deletePhotoFromStorage(photo);
        }
        setPhoto(persistentUri);
      } catch {
        Alert.alert('Error', 'Failed to save photo. Please try again.');
      }
    }
  };

  const openContactPicker = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Please allow access to contacts to import.');
      return;
    }

    setLoadingContacts(true);
    setShowContactPicker(true);
    setSelectedContactIds(new Set());
    setContactSearch('');

    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.Name, Contacts.Fields.Image],
      sort: Contacts.SortTypes.FirstName,
    });

    setDeviceContacts(data.filter(c => c.name));
    setLoadingContacts(false);
  };

  const filteredContacts = useMemo(() => {
    if (!contactSearch.trim()) return deviceContacts;
    const query = contactSearch.toLowerCase();
    return deviceContacts.filter(c => c.name?.toLowerCase().includes(query));
  }, [deviceContacts, contactSearch]);

  const toggleContactSelected = (id: string) => {
    setSelectedContactIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleBulkImport = async () => {
    const selected = deviceContacts.filter(c => c.id && selectedContactIds.has(c.id));
    if (selected.length === 0) return;

    setImportingContacts(true);
    try {
      const personsToAdd = selected.map(contact => {
        let contactPhoto: string | undefined;
        if (contact.image?.uri) {
          try {
            contactPhoto = savePhotoToStorage(contact.image.uri);
          } catch {
            // Skip photo if it fails
          }
        }

        return {
          name: contact.name || 'Unknown',
          photo: contactPhoto,
          relationshipType: 'friend' as const,
          frequency: 'weekly' as const,
          lastContactDate: null,
          birthday: undefined,
          anniversary: undefined,
          spouse: undefined,
          kids: [],
        };
      });

      await addPersonsBatch(personsToAdd);

      setShowContactPicker(false);
      navigation.goBack();
      // Small delay so the home screen is visible before the alert
      setTimeout(() => {
        Alert.alert(
          'Contacts Imported',
          `${selected.length} ${selected.length === 1 ? 'contact' : 'contacts'} added to your orbit. Tap each one to add details like frequency, birthday, etc.`
        );
      }, 300);
    } catch (error) {
      Alert.alert('Error', 'Failed to import some contacts. Please try again.');
    } finally {
      setImportingContacts(false);
    }
  };

  const importSingleContact = (contact: Contacts.ExistingContact) => {
    setName(contact.name || '');
    if (contact.image?.uri) {
      try {
        const persistentUri = savePhotoToStorage(contact.image.uri);
        if (photo) {
          deletePhotoFromStorage(photo);
        }
        setPhoto(persistentUri);
      } catch {
        // Silently fail for contact photo import
      }
    }
    setShowContactPicker(false);
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
        {/* Top Cancel Button */}
        <View style={styles.topHeader}>
          <TouchableOpacity
            style={styles.topCancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.topCancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>

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
            <TouchableOpacity style={styles.importButton} onPress={openContactPicker}>
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
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowFrequencyPicker(true)}
          >
            <Text style={styles.dropdownButtonText}>
              {FREQUENCY_LABELS[frequency]}
            </Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </TouchableOpacity>
        </View>

        {/* Frequency Picker Modal */}
        <Modal
          visible={showFrequencyPicker}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowFrequencyPicker(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowFrequencyPicker(false)}
          >
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>SELECT FREQUENCY</Text>
              {frequencyOptions.map(option => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.modalOption,
                    frequency === option && styles.modalOptionSelected,
                  ]}
                  onPress={() => {
                    setFrequency(option);
                    setShowFrequencyPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      frequency === option && styles.modalOptionTextSelected,
                    ]}
                  >
                    {FREQUENCY_LABELS[option]}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowFrequencyPicker(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

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

      {/* Contact Picker Modal */}
      <Modal
        visible={showContactPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowContactPicker(false)}
      >
        <SafeAreaView style={styles.contactPickerContainer} edges={['top', 'bottom']}>
          {/* Header */}
          <View style={styles.contactPickerHeader}>
            <TouchableOpacity onPress={() => setShowContactPicker(false)}>
              <Text style={styles.contactPickerCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.contactPickerTitle}>Import Contacts</Text>
            <View style={{ width: 60 }} />
          </View>

          {/* Search */}
          <View style={styles.contactSearchContainer}>
            <TextInput
              style={styles.contactSearchInput}
              placeholder="Search contacts..."
              placeholderTextColor={colors.textLight}
              value={contactSearch}
              onChangeText={setContactSearch}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Selection info & actions */}
          {selectedContactIds.size > 0 && (
            <View style={styles.contactSelectionBar}>
              <Text style={styles.contactSelectionText}>
                {selectedContactIds.size} selected
              </Text>
              <TouchableOpacity onPress={() => setSelectedContactIds(new Set())}>
                <Text style={styles.contactClearText}>Clear</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Contact List */}
          {loadingContacts ? (
            <View style={styles.contactLoadingContainer}>
              <ActivityIndicator color={colors.primary} size="large" />
              <Text style={styles.contactLoadingText}>Loading contacts...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredContacts}
              keyExtractor={(item) => item.id || item.name || ''}
              renderItem={({ item }) => {
                const isSelected = item.id ? selectedContactIds.has(item.id) : false;
                return (
                  <TouchableOpacity
                    style={[styles.contactRow, isSelected && styles.contactRowSelected]}
                    onPress={() => item.id && toggleContactSelected(item.id)}
                    onLongPress={() => importSingleContact(item)}
                  >
                    <View style={styles.contactCheckbox}>
                      {isSelected && <View style={styles.contactCheckboxFill} />}
                    </View>
                    {item.image?.uri ? (
                      <Image source={{ uri: item.image.uri }} style={styles.contactAvatar} />
                    ) : (
                      <View style={styles.contactAvatarPlaceholder}>
                        <Text style={styles.contactAvatarText}>
                          {item.name?.charAt(0)?.toUpperCase() || '?'}
                        </Text>
                      </View>
                    )}
                    <Text style={styles.contactName} numberOfLines={1}>{item.name}</Text>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <Text style={styles.contactEmptyText}>
                  {contactSearch ? 'No contacts match your search' : 'No contacts found'}
                </Text>
              }
              contentContainerStyle={styles.contactListContent}
            />
          )}

          {/* Import Button */}
          {selectedContactIds.size > 0 && (
            <View style={styles.contactImportBar}>
              <TouchableOpacity
                style={styles.contactImportButton}
                onPress={handleBulkImport}
                disabled={importingContacts}
              >
                {importingContacts ? (
                  <ActivityIndicator color={colors.background} size="small" />
                ) : (
                  <Text style={styles.contactImportButtonText}>
                    Import {selectedContactIds.size} {selectedContactIds.size === 1 ? 'Contact' : 'Contacts'}
                  </Text>
                )}
              </TouchableOpacity>
              <Text style={styles.contactImportHint}>
                Added as friends with weekly frequency. Edit details later.
              </Text>
            </View>
          )}
        </SafeAreaView>
      </Modal>
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
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  topCancelButton: {
    padding: spacing.sm,
  },
  topCancelText: {
    fontSize: 16,
    color: colors.secondary,
    fontWeight: '500',
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
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  dropdownArrow: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: colors.background,
    padding: spacing.lg,
    width: '85%',
    maxWidth: 340,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.lg,
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  modalOption: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  modalOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '20',
  },
  modalOptionText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
    textAlign: 'center',
  },
  modalOptionTextSelected: {
    color: colors.primary,
  },
  modalCancelButton: {
    marginTop: spacing.sm,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  modalCancelText: {
    fontSize: 14,
    color: colors.secondary,
    fontWeight: '500',
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
    color: colors.secondary,
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
  // Contact Picker styles
  contactPickerContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contactPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  contactPickerCancel: {
    fontSize: 16,
    color: colors.secondary,
    fontWeight: '500',
  },
  contactPickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  contactSearchContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  contactSearchInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  contactSelectionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  contactSelectionText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  contactClearText: {
    fontSize: 14,
    color: colors.secondary,
    fontWeight: '500',
  },
  contactLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  contactLoadingText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  contactListContent: {
    paddingHorizontal: spacing.lg,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '40',
    gap: spacing.md,
  },
  contactRowSelected: {
    backgroundColor: colors.primary + '15',
  },
  contactCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactCheckboxFill: {
    width: 12,
    height: 12,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  contactAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  contactAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactAvatarText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  contactName: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  contactEmptyText: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  contactImportBar: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
    gap: spacing.xs,
  },
  contactImportButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    width: '100%',
    alignItems: 'center',
  },
  contactImportButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background,
  },
  contactImportHint: {
    fontSize: 12,
    color: colors.textLight,
  },
});
