import React from 'react';
import {createContext, useContext, useEffect, useState} from 'react';
import {User} from '../../types';
import {useAuth} from '../authentication';
import {firestore} from '../../config/firebase';
import {COLLECTIONS} from '../../constants/collections';
import {serverTimestamp} from '@react-native-firebase/firestore';

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  updateUser: (data: Partial<User>) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const {user} = useAuth();
  const [userFirestore, setUserFirestore] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe = () => {};

    if (user?.id) {
      unsubscribe = firestore
        .collection(COLLECTIONS.USERS)
        .doc(user.id)
        .onSnapshot(
          doc => {
            if (doc.exists) {
              setUserFirestore({
                id: doc.id,
                ...doc.data(),
              } as User);
            } else {
              const newUser: Partial<User> = {
                id: user.id,
                email: user.email,
                createdAt: serverTimestamp(),
              };

              firestore
                .collection(COLLECTIONS.USERS)
                .doc(user.id)
                .set(newUser)
                .then(() => {
                  setUserFirestore(newUser as User);
                })
                .catch(err => {
                  console.error('Error creating user profile:', err);
                  setError('Failed to create user profile');
                });
            }
            setIsLoading(false);
          },
          err => {
            console.error('Error fetching user profile:', err);
            setError('Failed to fetch user profile');
            setIsLoading(false);
          },
        );
    } else {
      setUserFirestore(null);
      setIsLoading(false);
    }

    return () => unsubscribe();
  }, [user?.id]);

  const updateUser = async (data: Partial<User>) => {
    if (!user?.id) throw new Error('No authenticated user');

    try {
      await firestore
        .collection(COLLECTIONS.USERS)
        .doc(user.id)
        .update({
          ...data,
          updatedAt: serverTimestamp(),
        });
    } catch (err) {
      console.error('Error updating profile:', err);
      throw err;
    }
  };

  return (
    <UserContext.Provider
      value={{
        user: userFirestore,
        isLoading,
        error,
        updateUser,
      }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
