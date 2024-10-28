import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
// import {useAuth} from '../context/authentication/AuthContext';
// import {storeData, StorageKeys} from '../utils/storage';
import * as Yup from 'yup';
import {Formik} from 'formik';
import ScrollableScreen from '../components/ScrollableScreen';
import {useAuth} from '../context/authentication';
import {firestore} from '../config/firebase';
import {COLLECTIONS} from '../constants/collections';
import {serverTimestamp} from '@react-native-firebase/firestore';
import {useUser} from '../context/user';
import {LoadingScreen} from '../../App';
import {getSizeByX} from '../utils/styles/sizes';
import {getSizeByY} from '../utils/styles/sizes';

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  currentPassword: Yup.string().min(
    6,
    'Password must be at least 6 characters',
  ),
  newPassword: Yup.string().min(6, 'Password must be at least 6 characters'),
  confirmNewPassword: Yup.string().oneOf(
    [Yup.ref('newPassword')],
    'Passwords must match',
  ),
});

const ProfileScreen = () => {
  // const {user, setUser, logout} = useAuth();
  const {user, signOut, updatePassword} = useAuth();
  const {
    user: userProfile,
    error,
    isLoading: profileLoading,
    updateUser,
  } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ],
      {cancelable: true},
    );
  };

  // const handleUpdateProfile = async (values: any) => {
  //   try {
  //     if (values.currentPassword && values.currentPassword !== user?.password) {
  //       Alert.alert('Error', 'Current password is incorrect');
  //       return;
  //     }

  //     const updatedUser = {
  //       ...user,
  //       name: values.name,
  //       email: values.email,
  //       password: values.newPassword ? values.newPassword : user?.password,
  //     };

  //     await storeData(StorageKeys.USER, updatedUser);
  //     setUser(updatedUser);
  //     setIsEditing(false);
  //     Alert.alert('Success', 'Profile updated successfully!');
  //   } catch (error) {
  //     Alert.alert('Error', 'Failed to update profile. Please try again.');
  //   }
  // };

  const handleUpdateProfile = async (values: any) => {
    setIsLoading(true);
    try {
      if (values.newPassword) {
        await updatePassword(values.newPassword);
      }

      await updateUser({
        name: values.name,
        email: values.email,
      });

      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error: any) {
      console.error('Profile update error:', error);

      // Handle specific Firebase errors
      switch (error.code) {
        case 'auth/requires-recent-login':
          Alert.alert(
            'Error',
            'This operation is sensitive and requires recent authentication. Please log in again.',
          );
          break;
        case 'auth/email-already-in-use':
          Alert.alert(
            'Error',
            'This email is already in use by another account.',
          );
          break;
        case 'auth/invalid-email':
          Alert.alert('Error', 'The email address is invalid.');
          break;
        default:
          Alert.alert('Error', 'Failed to update profile. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!userProfile || profileLoading) {
    return <LoadingScreen />;
  }

  return (
    <ScrollableScreen>
      <View style={styles.screenContainer}>
        <View style={styles.formContainer}>
          <Formik
            initialValues={{
              name: userProfile.name || '',
              email: userProfile.email || '',
              currentPassword: '',
              newPassword: '',
              confirmNewPassword: '',
            }}
            validationSchema={validationSchema}
            onSubmit={handleUpdateProfile}>
            {({handleChange, handleSubmit, values, errors, touched}) => (
              <View style={styles.formContent}>
                <View style={styles.inputsContainer}>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>Name</Text>
                    <TextInput
                      style={[styles.input, !isEditing && styles.inputDisabled]}
                      value={values.name}
                      onChangeText={handleChange('name')}
                      editable={isEditing}
                    />
                    {touched.name && errors.name && (
                      <Text style={styles.validationError}>{errors.name}</Text>
                    )}
                  </View>

                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>Email</Text>
                    <TextInput
                      style={[styles.input, !isEditing && styles.inputDisabled]}
                      value={values.email}
                      onChangeText={handleChange('email')}
                      editable={isEditing}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                    {touched.email && errors.email && (
                      <Text style={styles.validationError}>{errors.email}</Text>
                    )}
                  </View>

                  {isEditing && (
                    <>
                      <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>Current Password</Text>
                        <TextInput
                          style={styles.input}
                          value={values.currentPassword}
                          onChangeText={handleChange('currentPassword')}
                          secureTextEntry
                        />
                        {touched.currentPassword && errors.currentPassword && (
                          <Text style={styles.validationError}>
                            {errors.currentPassword}
                          </Text>
                        )}
                      </View>

                      <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>New Password</Text>
                        <TextInput
                          style={styles.input}
                          value={values.newPassword}
                          onChangeText={handleChange('newPassword')}
                          secureTextEntry
                        />
                        {touched.newPassword && errors.newPassword && (
                          <Text style={styles.validationError}>
                            {errors.newPassword}
                          </Text>
                        )}
                      </View>

                      <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>
                          Confirm New Password
                        </Text>
                        <TextInput
                          style={styles.input}
                          value={values.confirmNewPassword}
                          onChangeText={handleChange('confirmNewPassword')}
                          secureTextEntry
                        />
                        {touched.confirmNewPassword &&
                          errors.confirmNewPassword && (
                            <Text style={styles.validationError}>
                              {errors.confirmNewPassword}
                            </Text>
                          )}
                      </View>
                    </>
                  )}
                </View>

                <View style={styles.buttonContainer}>
                  {isEditing ? (
                    <>
                      <TouchableOpacity
                        style={[
                          styles.actionButton,
                          styles.saveButton,
                          isLoading && styles.buttonDisabled,
                        ]}
                        onPress={() => handleSubmit()}
                        disabled={isLoading}>
                        {isLoading ? (
                          <ActivityIndicator color="white" size="small" />
                        ) : (
                          <Text style={styles.buttonText}>Save Changes</Text>
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.actionButton, styles.cancelButton]}
                        onPress={() => setIsEditing(false)}
                        disabled={isLoading}>
                        <Text style={styles.buttonText}>Cancel</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.editButton]}
                      onPress={() => setIsEditing(true)}>
                      <Text style={styles.buttonText}>Edit Profile</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </Formik>
          {!isEditing && (
            <TouchableOpacity
              style={[styles.actionButton, styles.logoutButton]}
              onPress={handleLogout}>
              <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollableScreen>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: getSizeByX(16),
  },
  formContent: {
    gap: getSizeByY(24),
    paddingVertical: getSizeByY(16),
  },
  inputsContainer: {
    gap: getSizeByY(16),
  },
  inputWrapper: {
    gap: getSizeByY(8),
  },
  inputLabel: {
    fontSize: getSizeByY(16),
    color: '#333',
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: getSizeByX(8),
    paddingHorizontal: getSizeByX(16),
    paddingVertical: getSizeByY(12),
    fontSize: getSizeByY(16),
  },
  inputDisabled: {
    backgroundColor: '#f5f5f5',
  },
  validationError: {
    color: '#FF3B30',
    fontSize: getSizeByY(12),
  },
  buttonContainer: {
    gap: getSizeByY(12),
    marginTop: getSizeByY(24),
  },
  actionButton: {
    paddingVertical: getSizeByY(16),
    borderRadius: getSizeByX(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    backgroundColor: '#007AFF',
  },
  saveButton: {
    backgroundColor: '#4CD964',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontSize: getSizeByY(16),
    fontWeight: '500',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});

export default ProfileScreen;
