import React, {useState} from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import {Formik} from 'formik';
import * as Yup from 'yup';
import {useAuth} from '../context/authentication';
import ScrollableScreen from '../components/ScrollableScreen';
import {getSizeByX, getSizeByY} from '../utils/styles/sizes';
// import {storeData, StorageKeys} from '../utils/storage';
// import {User} from '../types';

const validationSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Required'),
  name: Yup.string().required('Required'),
});

const RegisterScreen = ({navigation}: any) => {
  // const {setUser} = useAuth();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const auth = useAuth();

  // const handleRegister = async (values: any) => {
  //   try {
  //     const newUser: User = {
  //       email: values.email,
  //       password: values.password,
  //       name: values.name,
  //     };

  //     await storeData(StorageKeys.USER, newUser);
  //     setUser(newUser);
  //     Alert.alert('Success', 'Registration successful!');
  //     navigation.replace('Main');
  //   } catch (error) {
  //     setError('Registration failed');
  //   }
  // };

  const handleRegister = async (values: any) => {
    setLoading(true);
    setError('');

    try {
      const userCredential = await auth.createUserWithEmailAndPassword(
        values.email,
        values.password,
      );

      if (userCredential.user) {
        await auth.addUserToDb(
          userCredential.user.uid,
          values.email,
          values.name,
        );

        Alert.alert('Success', 'Registration successful!', [
          {
            text: 'OK',
          },
        ]);
      }
    } catch (error: any) {
      console.error('Registration error:', error);

      switch (error.code) {
        case 'auth/email-already-in-use':
          setError('An account already exists with this email');
          break;
        case 'auth/invalid-email':
          setError('Invalid email address');
          break;
        case 'auth/operation-not-allowed':
          setError(
            'Email/password accounts are not enabled. Please contact support.',
          );
          break;
        case 'auth/weak-password':
          setError('Password is too weak. Please choose a stronger password.');
          break;
        default:
          setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // return (
  //   <View style={styles.container}>
  //     <Formik
  //       initialValues={{email: '', password: '', confirmPassword: '', name: ''}}
  //       validationSchema={validationSchema}
  //       onSubmit={handleRegister}>
  //       {({handleChange, handleSubmit, values, errors, touched}) => (
  //         <>
  //           <TextInput
  //             style={styles.input}
  //             placeholder="Name"
  //             value={values.name}
  //             onChangeText={handleChange('name')}
  //           />
  //           {touched.name && errors.name && (
  //             <Text style={styles.error}>{errors.name}</Text>
  //           )}

  //           <TextInput
  //             style={styles.input}
  //             placeholder="Email"
  //             value={values.email}
  //             onChangeText={handleChange('email')}
  //             keyboardType="email-address"
  //             autoCapitalize="none"
  //           />
  //           {touched.email && errors.email && (
  //             <Text style={styles.error}>{errors.email}</Text>
  //           )}

  //           <TextInput
  //             style={styles.input}
  //             placeholder="Password"
  //             value={values.password}
  //             onChangeText={handleChange('password')}
  //             secureTextEntry
  //           />
  //           {touched.password && errors.password && (
  //             <Text style={styles.error}>{errors.password}</Text>
  //           )}

  //           <TextInput
  //             style={styles.input}
  //             placeholder="Confirm Password"
  //             value={values.confirmPassword}
  //             onChangeText={handleChange('confirmPassword')}
  //             secureTextEntry
  //           />
  //           {touched.confirmPassword && errors.confirmPassword && (
  //             <Text style={styles.error}>{errors.confirmPassword}</Text>
  //           )}

  //           <TouchableOpacity
  //             style={styles.button}
  //             onPress={() => handleSubmit()}>
  //             <Text style={styles.buttonText}>Register</Text>
  //           </TouchableOpacity>

  //           <TouchableOpacity onPress={() => navigation.navigate('Auth')}>
  //             <Text>Already have an account? Login</Text>
  //           </TouchableOpacity>

  //           {error ? <Text style={styles.error}>{error}</Text> : null}
  //         </>
  //       )}
  //     </Formik>
  //   </View>
  // );

  return (
    <ScrollableScreen contentContainerStyle={styles.screenContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Create Account</Text>
      </View>

      <Formik
        initialValues={{
          email: '',
          password: '',
          confirmPassword: '',
          name: '',
        }}
        validationSchema={validationSchema}
        onSubmit={handleRegister}>
        {({handleChange, handleSubmit, values, errors, touched}) => (
          <View style={styles.formContainer}>
            <View style={styles.inputsContainer}>
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your name"
                  value={values.name}
                  onChangeText={handleChange('name')}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
                {touched.name && errors.name && (
                  <Text style={styles.validationError}>{errors.name}</Text>
                )}
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  value={values.email}
                  onChangeText={handleChange('email')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {touched.email && errors.email && (
                  <Text style={styles.validationError}>{errors.email}</Text>
                )}
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Choose a password"
                  value={values.password}
                  onChangeText={handleChange('password')}
                  secureTextEntry
                  autoCapitalize="none"
                />
                {touched.password && errors.password && (
                  <Text style={styles.validationError}>{errors.password}</Text>
                )}
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Confirm your password"
                  value={values.confirmPassword}
                  onChangeText={handleChange('confirmPassword')}
                  secureTextEntry
                  autoCapitalize="none"
                />
                {touched.confirmPassword && errors.confirmPassword && (
                  <Text style={styles.validationError}>
                    {errors.confirmPassword}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.actionContainer}>
              {error ? <Text style={styles.errorMessage}>{error}</Text> : null}

              <TouchableOpacity
                style={[
                  styles.registerButton,
                  loading && styles.registerButtonDisabled,
                ]}
                onPress={() => handleSubmit()}
                disabled={loading}>
                <Text style={styles.registerButtonText}>
                  {loading ? 'Creating Account...' : 'Register'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.loginLinkContainer}
                onPress={() => navigation.navigate('Auth')}
                disabled={loading}>
                <Text style={styles.loginLinkText}>
                  Already have an account? Login
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Formik>
    </ScrollableScreen>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    paddingHorizontal: getSizeByX(20),
    justifyContent: 'center',
  },
  headerContainer: {
    paddingVertical: getSizeByY(24),
  },
  headerText: {
    fontSize: getSizeByY(24),
    fontWeight: 'bold',
    color: '#000',
  },
  formContainer: {
    flex: 1,
  },
  inputsContainer: {
    gap: getSizeByY(16),
  },
  inputWrapper: {
    gap: getSizeByY(8),
  },
  label: {
    fontSize: getSizeByY(16),
    color: '#333',
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: getSizeByX(10),
    paddingHorizontal: getSizeByX(16),
    paddingVertical: getSizeByY(12),
    backgroundColor: '#fff',
  },
  validationError: {
    color: '#FF3B30',
    fontSize: getSizeByY(12),
  },
  actionContainer: {
    gap: getSizeByY(16),
    marginTop: getSizeByY(32),
  },
  errorMessage: {
    color: '#FF3B30',
    fontSize: getSizeByY(14),
    textAlign: 'center',
  },
  registerButton: {
    backgroundColor: '#007AFF',
    borderRadius: getSizeByX(8),
    paddingVertical: getSizeByY(16),
  },
  registerButtonDisabled: {
    backgroundColor: '#99c4f9',
    opacity: 0.7,
  },
  registerButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: getSizeByY(16),
    fontWeight: '600',
  },
  loginLinkContainer: {
    alignItems: 'center',
  },
  loginLinkText: {
    color: '#007AFF',
    fontSize: getSizeByY(14),
  },
});

export default RegisterScreen;
