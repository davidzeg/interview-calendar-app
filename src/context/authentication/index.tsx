import {createContext, useContext, useEffect, useMemo, useReducer} from 'react';
import React from 'react';
import {AuthState, initialState} from './local-state';
import {Action, ActionType} from './local-actions';
import {authenticationStateReducer} from './local-reducer';
import {auth} from '../../config/firebase';
import {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {setDocument} from '../../firebase-config/firestoreApi';
import {COLLECTIONS} from '../../constants/collections';

const AuthContext = createContext<{
  state?: AuthState;
  dispatch?: React.Dispatch<Action>;
}>({});

export const AuthProvider = ({
  children,
  authenticated = false,
  uid = undefined,
}) => {
  const [state, dispatch] = useReducer(authenticationStateReducer, {
    ...initialState,
    isAuthenticated: authenticated,
    user: {id: uid},
  });

  useEffect(() => {
    let unsubscribe;
    unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        dispatch({
          type: ActionType.AUTH_STATE_CHANGE,
          payload: {
            ...state,
            isAuthenticated: true,
            user: {
              id: user.uid,
              email: user.email ?? undefined,
            },
            isInitialized: true,
          },
        });
      } else {
        dispatch({
          type: ActionType.AUTH_STATE_CHANGE,
          payload: {
            isAuthenticated: false,
            user: null,
            isInitialized: true,
          },
        });
      }
    });

    return unsubscribe;
  }, []);

  const contextValue = useMemo(() => {
    return {
      state,
      dispatch,
    };
  }, [state, dispatch]);
  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

const useState = () => {
  const {state} = useContext(AuthContext);
  return state;
};

export const useAuth = function () {
  const state = useState();

  return {
    ...state,
    signInWithEmailAndPassword: (
      email: string,
      password: string,
    ): Promise<FirebaseAuthTypes.UserCredential> => {
      return auth.signInWithEmailAndPassword(email, password);
    },
    createUserWithEmailAndPassword: (
      email: string,
      password: string,
    ): Promise<FirebaseAuthTypes.UserCredential> => {
      return auth.createUserWithEmailAndPassword(email, password);
    },
    addUserToDb: async (id: string, email: string, name: string) => {
      return await setDocument(COLLECTIONS.USERS, id, {
        id,
        email: email,
        name: name,
      });
    },
    updatePassword: (password: string): Promise<void> => {
      if (!auth.currentUser) throw new Error('User not authenticated');
      return auth.currentUser.updatePassword(password);
    },
    sendPasswordResetEmail: (email: string): Promise<void> => {
      return auth.sendPasswordResetEmail(email);
    },
    signOut: () => {
      return auth.signOut();
    },
    getIdToken: () => {
      return auth.currentUser?.getIdToken();
    },
    isLoading: () => {
      return state ? !state.isInitialized : true;
    },
  };
};
