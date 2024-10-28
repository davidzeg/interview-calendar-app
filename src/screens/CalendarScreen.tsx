import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import {Calendar} from 'react-native-calendars';
// import {useAuth} from '../context/authentication/AuthContext';
// import {getData, storeData, StorageKeys} from '../utils/storage';
import MeetingForm from '../components/MeetingForm';
import {Meeting} from '../types';
import {useAuth} from '../context/authentication';
import {useMeetings} from '../context/meetings';
import ScrollableScreen from '../components/ScrollableScreen';
import {getSizeByX} from '../utils/styles/sizes';
import {getSizeByY} from '../utils/styles/sizes';

const CalendarScreen = () => {
  const {user} = useAuth();
  // const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const {
    meetings,
    isLoading,
    error,
    createMeeting,
    updateMeeting,
    deleteMeeting,
  } = useMeetings();

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // useEffect(() => {
  //   loadMeetings();
  // }, []);

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({offset: 0, animated: true});
    }
  }, [selectedDate]);

  // const loadMeetings = async () => {
  //   try {
  //     const storedMeetings = await getData(StorageKeys.MEETINGS);
  //     if (storedMeetings) {
  //       setMeetings(storedMeetings);
  //     }
  //   } catch (error) {
  //     console.error('Error loading meetings:', error);
  //   }
  // };

  // const handleSaveMeeting = async (values: any) => {
  //   try {
  //     const formatTime = (date: Date) => {
  //       return date.toLocaleTimeString([], {
  //         hour: '2-digit',
  //         minute: '2-digit',
  //         hour12: false, // Use 24-hour format for consistency
  //       });
  //     };

  //     const newMeeting: Meeting = {
  //       id: selectedMeeting?.id || Date.now().toString(),
  //       title: values.title,
  //       description: values.description || '',
  //       date: values.date.toISOString().split('T')[0],
  //       startTime: formatTime(values.startTime),
  //       endTime: formatTime(values.endTime),
  //       createdBy: user?.email || '',
  //     };

  //     let updatedMeetings;
  //     if (selectedMeeting) {
  //       updatedMeetings = meetings.map(meeting =>
  //         meeting.id === selectedMeeting.id ? newMeeting : meeting,
  //       );
  //     } else {
  //       updatedMeetings = [...meetings, newMeeting];
  //     }

  //     await storeData(StorageKeys.MEETINGS, updatedMeetings);
  //     setMeetings(updatedMeetings);
  //     setShowMeetingForm(false);
  //     setSelectedMeeting(null);
  //   } catch (error) {
  //     Alert.alert('Error', 'Failed to save meeting');
  //   }
  // };

  // const handleDeleteMeeting = async (meeting: Meeting) => {
  //   Alert.alert(
  //     'Delete Meeting',
  //     'Are you sure you want to delete this meeting?',
  //     [
  //       {
  //         text: 'Cancel',
  //         style: 'cancel',
  //       },
  //       {
  //         text: 'Delete',
  //         style: 'destructive',
  //         onPress: async () => {
  //           try {
  //             const updatedMeetings = meetings.filter(m => m.id !== meeting.id);
  //             await storeData(StorageKeys.MEETINGS, updatedMeetings);
  //             setMeetings(updatedMeetings);
  //           } catch (error) {
  //             Alert.alert('Error', 'Failed to delete meeting');
  //           }
  //         },
  //       },
  //     ],
  //   );
  // };

  const handleSaveMeeting = async (values: any) => {
    setIsSubmitting(true);
    try {
      const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
      };

      const meetingData = {
        title: values.title,
        description: values.description || '',
        date: values.date.toISOString().split('T')[0],
        startTime: formatTime(values.startTime),
        endTime: formatTime(values.endTime),
        createdBy: user?.id || '',
        userEmail: user?.email || '',
      };

      if (selectedMeeting) {
        await updateMeeting(selectedMeeting.id, meetingData);
      } else {
        await createMeeting(meetingData);
      }

      setShowMeetingForm(false);
      setSelectedMeeting(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to save meeting');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMeeting = (meeting: Meeting) => {
    setIsDeleting(meeting.id);
    Alert.alert(
      'Delete Meeting',
      'Are you sure you want to delete this meeting?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMeeting(meeting.id);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete meeting');
            } finally {
              setIsDeleting(null);
            }
          },
        },
      ],
    );
  };

  const getMarkedDates = () => {
    const marked: any = {};
    meetings.forEach(meeting => {
      marked[meeting.date] = {marked: true, dotColor: '#4CD964'};
    });
    marked[selectedDate] = {
      ...marked[selectedDate],
      selected: true,
      selectedColor: '#007AFF',
    };
    return marked;
  };

  const getDailyMeetings = () => {
    return meetings.filter(meeting => meeting.date === selectedDate);
  };

  const renderMeetingItem = ({item}: {item: Meeting}) => (
    <TouchableOpacity
      style={styles.meetingItem}
      onPress={() => {
        setSelectedMeeting(item);
        setShowMeetingForm(true);
      }}>
      <View style={styles.meetingHeader}>
        <Text style={styles.meetingTitle}>{item.title}</Text>
        <TouchableOpacity
          onPress={() => handleDeleteMeeting(item)}
          style={styles.deleteButton}
          disabled={isDeleting === item.id}>
          {isDeleting === item.id ? (
            <ActivityIndicator size="small" color="#FF3B30" />
          ) : (
            <Text style={styles.deleteButtonText}>×</Text>
          )}
        </TouchableOpacity>
      </View>
      <Text style={styles.meetingTime}>
        {item.startTime} - {item.endTime}
      </Text>
      {item.description && (
        <Text style={styles.meetingDescription}>{item.description}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollableScreen>
      <View style={styles.screenContainer}>
        <Calendar
          onDayPress={day => setSelectedDate(day.dateString)}
          markedDates={getMarkedDates()}
          theme={{
            selectedDayBackgroundColor: '#007AFF',
            todayTextColor: '#007AFF',
            arrowColor: '#007AFF',
          }}
        />

        <View style={styles.meetingsContainer}>
          <View style={styles.meetingsHeader}>
            <Text style={styles.meetingsTitle}>
              Meetings for {new Date(selectedDate).toLocaleDateString()}
            </Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                setSelectedMeeting(null);
                setShowMeetingForm(true);
              }}>
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.listContainer}>
            <FlatList
              ref={flatListRef}
              data={getDailyMeetings()}
              renderItem={renderMeetingItem}
              keyExtractor={item => item.id}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No meetings scheduled</Text>
              }
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.meetingsListContent}
              bounces={true}
              scrollEnabled={true}
            />
          </View>
        </View>

        <MeetingForm
          visible={showMeetingForm}
          onClose={() => {
            setShowMeetingForm(false);
            setSelectedMeeting(null);
          }}
          onSubmit={handleSaveMeeting}
          initialValues={selectedMeeting}
          selectedDate={selectedDate}
        />
      </View>
    </ScrollableScreen>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  meetingsContainer: {
    flex: 1,
    padding: getSizeByX(16),
  },
  listContainer: {
    flex: 1,
  },
  meetingsListContent: {
    padding: getSizeByX(16),
    flexGrow: 1,
  },
  meetingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getSizeByY(16),
  },
  meetingsTitle: {
    fontSize: getSizeByY(18),
    fontWeight: 'bold',
  },
  meetingsList: {
    flex: 1,
  },
  meetingsListContent: {
    padding: getSizeByX(16),
    flexGrow: 1,
  },
  addButton: {
    backgroundColor: '#4CD964',
    width: getSizeByX(32),
    height: getSizeByX(32),
    borderRadius: getSizeByX(16),
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: getSizeByY(24),
    fontWeight: 'bold',
    marginTop: getSizeByY(-2),
  },
  meetingItem: {
    backgroundColor: '#f8f8f8',
    padding: getSizeByX(16),
    borderRadius: getSizeByX(8),
    marginBottom: getSizeByY(10),
  },
  meetingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  meetingTitle: {
    fontSize: getSizeByY(16),
    fontWeight: 'bold',
    flex: 1,
  },
  meetingTime: {
    color: '#666',
    marginTop: getSizeByY(5),
  },
  meetingDescription: {
    marginTop: getSizeByY(5),
    color: '#444',
  },
  deleteButton: {
    padding: getSizeByX(5),
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontSize: getSizeByY(20),
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: getSizeByY(20),
  },
});

export default CalendarScreen;
