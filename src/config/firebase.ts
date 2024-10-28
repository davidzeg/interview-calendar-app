import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import '@react-native-firebase/firestore';

const firebaseApp = firebase.app();
const auth = firebaseApp.auth();
const firestore = firebaseApp.firestore();

export {auth, firestore, firebaseApp};
