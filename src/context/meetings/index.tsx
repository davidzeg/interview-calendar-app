import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import {meetingsReducer, initialState} from './reducer';
import {MeetingsState, MeetingsActionType} from './types';
import {Meeting} from '../../types';
import {useAuth} from '../authentication';
import {collectionRef} from '../../firebase-config/firestoreApi';
import {COLLECTIONS} from '../../constants/collections';
import {serverTimestamp} from '@react-native-firebase/firestore';

interface MeetingsContextType extends MeetingsState {
  createMeeting: (meeting: Omit<Meeting, 'id'>) => Promise<void>;
  updateMeeting: (id: string, meeting: Partial<Meeting>) => Promise<void>;
  deleteMeeting: (id: string) => Promise<void>;
}

const MeetingsContext = createContext<MeetingsContextType | undefined>(
  undefined,
);

export const MeetingsProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(meetingsReducer, initialState);
  const {user} = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    dispatch({type: MeetingsActionType.SET_LOADING, payload: true});

    const meetingsRef = collectionRef(COLLECTIONS.MEETINGS);
    const query = meetingsRef.where('createdBy', '==', user.id);

    const unsubscribe = query.onSnapshot(
      snapshot => {
        const meetings = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Meeting[];

        dispatch({type: MeetingsActionType.SET_MEETINGS, payload: meetings});
        dispatch({type: MeetingsActionType.SET_LOADING, payload: false});
      },
      error => {
        console.error('Meetings subscription error:', error);
        dispatch({
          type: MeetingsActionType.SET_ERROR,
          payload: 'Failed to load meetings',
        });
      },
    );

    return () => unsubscribe();
  }, [user?.id]);

  const createMeeting = useCallback(async (meeting: Omit<Meeting, 'id'>) => {
    try {
      await collectionRef(COLLECTIONS.MEETINGS).add({
        ...meeting,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Create meeting error:', error);
      throw error;
    }
  }, []);

  const updateMeeting = useCallback(
    async (id: string, meeting: Partial<Meeting>) => {
      try {
        await collectionRef(COLLECTIONS.MEETINGS)
          .doc(id)
          .update({
            ...meeting,
            updatedAt: serverTimestamp(),
          });
      } catch (error) {
        console.error('Update meeting error:', error);
        throw error;
      }
    },
    [],
  );

  const deleteMeeting = useCallback(async (id: string) => {
    try {
      await collectionRef(COLLECTIONS.MEETINGS).doc(id).delete();
    } catch (error) {
      console.error('Delete meeting error:', error);
      throw error;
    }
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      createMeeting,
      updateMeeting,
      deleteMeeting,
    }),
    [state, createMeeting, updateMeeting, deleteMeeting],
  );

  return (
    <MeetingsContext.Provider value={value}>
      {children}
    </MeetingsContext.Provider>
  );
};

export const useMeetings = () => {
  const context = useContext(MeetingsContext);
  if (context === undefined) {
    throw new Error('useMeetings must be used within a MeetingsProvider');
  }
  return context;
};
