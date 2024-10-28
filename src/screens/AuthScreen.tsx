import React, {useState} from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Yup from 'yup';
// import {getData, StorageKeys} from '../utils/storage';
import ReactNativeBiometrics from 'react-native-biometrics';
// import {User} from '../types';
import {Formik} from 'formik';
import {useAuth} from '../context/authentication';
import ScrollableScreen from '../components/ScrollableScreen';
import {getSizeByX, getSizeByY} from '../utils/styles/sizes';
// import {useAuth} from '../context/authentication/AuthContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const validationSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().min(6, 'Too Short!').required('Required'),
});

const AuthScreen = ({navigation}: any) => {
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  // const {setUser} = useAuth();
  const auth = useAuth();

  // const handleLogin = async (values: User) => {
  //   try {
  //     const storedUser = await getData(StorageKeys.USER);
  //     if (
  //       storedUser?.email === values.email &&
  //       storedUser?.password === values.password
  //     ) {
  //       const rnBiometrics = new ReactNativeBiometrics();
  //       const {available, biometryType} =
  //         await rnBiometrics.isSensorAvailable();

  //       if (available && biometryType) {
  //         const {success} = await rnBiometrics.simplePrompt({
  //           promptMessage: 'Confirm fingerprint',
  //         });

  //         if (success) {
  //           setUser(storedUser);
  //           navigation.replace('Main');
  //           return;
  //         }
  //       } else {
  //         setUser(storedUser);
  //         navigation.replace('Main');
  //       }
  //     } else {
  //       setError('Invalid credentials');
  //     }
  //   } catch (error) {
  //     setError('Login failed');
  //   }
  // };

  const handleLogin = async (values: {email: string; password: string}) => {
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      await auth.signInWithEmailAndPassword(values.email, values.password);

      const rnBiometrics = new ReactNativeBiometrics();
      const {available, biometryType} = await rnBiometrics.isSensorAvailable();

      if (available && biometryType) {
        try {
          const {success} = await rnBiometrics.simplePrompt({
            promptMessage: 'Confirm fingerprint',
          });

          if (success) {
            navigation.replace('Main');
          } else {
            await auth.signOut();
            setError('Biometric authentication failed');
          }
        } catch (biometricError) {
          console.warn('Biometric error:', biometricError);
          navigation.replace('Main');
        }
      } else {
        navigation.replace('Main');
      }
    } catch (error: any) {
      console.error('Login error:', error);

      switch (error.code) {
        case 'auth/user-not-found':
          setError('No account found with this email');
          break;
        case 'auth/wrong-password':
          setError('Invalid password');
          break;
        case 'auth/too-many-requests':
          setError('Too many attempts. Please try again later');
          break;
        case 'auth/invalid-email':
          setError('Invalid email address');
          break;
        default:
          setError('Login failed. Please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (email: string) => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address first');
      return;
    }

    try {
      await auth.sendPasswordResetEmail(email);
      Alert.alert(
        'Password Reset',
        'Check your email for instructions to reset your password',
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to send password reset email');
    }
  };

  // return (
  //   <View style={styles.container}>
  //     <Formik
  //       initialValues={{email: '', password: ''}}
  //       validationSchema={validationSchema}
  //       onSubmit={handleLogin}>
  //       {({handleChange, handleSubmit, values, errors, touched}) => (
  //         <>
  //           <TextInput
  //             style={styles.input}
  //             placeholder="Email"
  //             value={values.email}
  //             onChangeText={handleChange('email')}
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

  //           <TouchableOpacity
  //             style={styles.button}
  //             onPress={() => handleSubmit()}>
  //             <Text style={styles.buttonText}>Login</Text>
  //           </TouchableOpacity>

  //           <TouchableOpacity onPress={() => navigation.navigate('Register')}>
  //             <Text>Don't have an account? Register</Text>
  //           </TouchableOpacity>

  //           {error ? <Text style={styles.error}>{error}</Text> : null}
  //         </>
  //       )}
  //     </Formik>
  //   </View>
  // );

  return (
    <ScrollableScreen>
      <View style={styles.screenContainer}>
        <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder}>
            <Icon name="calendar-clock" size={getSizeByX(64)} color="white" />
          </View>
          <Text style={styles.appTitle}>Welcome Back</Text>
          <Text style={styles.appSubtitle}>Sign in to continue</Text>
        </View>

        <Formik
          initialValues={{email: '', password: ''}}
          validationSchema={validationSchema}
          onSubmit={handleLogin}>
          {({handleChange, handleSubmit, values, errors, touched}) => (
            <View style={styles.formContainer}>
              <View style={styles.inputsContainer}>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
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
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    value={values.password}
                    onChangeText={handleChange('password')}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                  {touched.password && errors.password && (
                    <Text style={styles.validationError}>
                      {errors.password}
                    </Text>
                  )}
                </View>
              </View>

              <View style={styles.actionContainer}>
                {error ? (
                  <Text style={styles.errorMessage}>{error}</Text>
                ) : null}

                <TouchableOpacity
                  style={[
                    styles.loginButton,
                    loading && styles.loginButtonDisabled,
                  ]}
                  onPress={() => handleSubmit()}
                  disabled={loading}>
                  <Text style={styles.loginButtonText}>
                    {loading ? 'Signing in...' : 'Login'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.forgotPasswordContainer}
                  onPress={() => handleForgotPassword(values.email)}>
                  <Text style={styles.forgotPasswordText}>
                    Forgot Password?
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.registerContainer}
                  onPress={() => navigation.navigate('Register')}>
                  <Text style={styles.registerText}>
                    Don't have an account?{' '}
                    <Text style={styles.registerLink}>Register</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Formik>
      </View>
    </ScrollableScreen>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    paddingHorizontal: getSizeByX(20),
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: getSizeByY(60),
    marginBottom: getSizeByY(40),
    gap: getSizeByY(16),
  },
  logoPlaceholder: {
    width: getSizeByX(100),
    height: getSizeByX(100),
    borderRadius: getSizeByX(50),
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: 'white',
    fontSize: getSizeByY(24),
    fontWeight: 'bold',
  },
  appTitle: {
    fontSize: getSizeByY(24),
    fontWeight: 'bold',
    color: '#000',
  },
  appSubtitle: {
    fontSize: getSizeByY(16),
    color: '#666',
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
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: getSizeByX(10),
    paddingHorizontal: getSizeByX(16),
    paddingVertical: getSizeByY(12),
    backgroundColor: '#fff',
    fontSize: getSizeByY(16),
  },
  validationError: {
    color: '#FF3B30',
    fontSize: getSizeByY(12),
    marginLeft: getSizeByX(4),
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
  loginButton: {
    backgroundColor: '#007AFF',
    borderRadius: getSizeByX(8),
    paddingVertical: getSizeByY(16),
  },
  loginButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: getSizeByY(16),
    fontWeight: '600',
  },
  forgotPasswordContainer: {
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: '#007AFF',
    fontSize: getSizeByY(14),
  },
  registerContainer: {
    alignItems: 'center',
  },
  registerText: {
    fontSize: getSizeByY(14),
    color: '#666',
  },
  registerLink: {
    color: '#007AFF',
    fontWeight: '500',
  },
  loginButtonDisabled: {
    backgroundColor: '#99c4f9',
    opacity: 0.7,
  },
});

export default AuthScreen;
