import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {Formik} from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  description: Yup.string(),
  date: Yup.date().required('Date is required'),
  startTime: Yup.date().required('Start time is required'),
  endTime: Yup.date()
    .required('End time is required')
    .min(Yup.ref('startTime'), 'End time must be after start time'),
});

interface MeetingFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  initialValues?: any;
  selectedDate?: any;
}

const MeetingForm: React.FC<MeetingFormProps> = ({
  visible,
  onClose,
  onSubmit,
  initialValues,
  selectedDate,
}) => {
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  const timeStringToDate = (timeStr: string, baseDate: Date) => {
    if (!timeStr) return new Date();

    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date(baseDate);
    date.setHours(hours);
    date.setMinutes(minutes);
    return date;
  };

  const getFormInitialValues = () => {
    if (initialValues) {
      const baseDate = new Date(initialValues.date);
      return {
        title: initialValues.title,
        description: initialValues.description || '',
        date: baseDate,
        startTime: timeStringToDate(initialValues.startTime, baseDate),
        endTime: timeStringToDate(initialValues.endTime, baseDate),
      };
    }

    const defaultDate = getInitialDate();
    return {
      title: '',
      description: '',
      date: defaultDate,
      startTime: new Date(defaultDate),
      endTime: new Date(defaultDate.getTime() + 3600000), // 1 hour later
    };
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
  };

  const getInitialDate = () => {
    if (selectedDate) {
      const [year, month, day] = selectedDate.split('-').map(Number);
      const date = new Date();
      date.setFullYear(year, month - 1, day);
      return date;
    }
    return new Date();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}>
        <View style={styles.modalWrapper}>
          <ScrollView
            contentContainerStyle={styles.scrollViewContent}
            keyboardShouldPersistTaps="handled">
            <View style={styles.modalContent}>
              <Formik
                initialValues={getFormInitialValues()}
                validationSchema={validationSchema}
                onSubmit={onSubmit}>
                {({
                  handleChange,
                  handleSubmit,
                  values,
                  errors,
                  touched,
                  setFieldValue,
                }) => (
                  <>
                    <Text style={styles.modalTitle}>
                      {initialValues ? 'Edit Meeting' : 'New Meeting'}
                    </Text>

                    <TextInput
                      style={styles.input}
                      placeholder="Title"
                      value={values.title}
                      onChangeText={handleChange('title')}
                    />
                    {touched.title && errors.title && (
                      <Text style={styles.error}>{errors.title}</Text>
                    )}

                    <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder="Description"
                      value={values.description}
                      onChangeText={handleChange('description')}
                      multiline
                      numberOfLines={4}
                    />

                    <Text style={styles.label}>Start Time</Text>
                    <Pressable
                      style={styles.dateTimeButton}
                      onPress={() => {
                        setShowStartTimePicker(true);
                      }}>
                      <Text>{formatTime(values.startTime)}</Text>
                    </Pressable>

                    <Text style={styles.label}>End Time</Text>
                    <Pressable
                      style={styles.dateTimeButton}
                      onPress={() => {
                        setShowEndTimePicker(true);
                      }}>
                      <Text>{formatTime(values.endTime)}</Text>
                    </Pressable>

                    {/* Start Time Picker */}
                    {showStartTimePicker && (
                      <DateTimePicker
                        value={values.startTime}
                        mode="time"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={(event, selectedDate) => {
                          setShowStartTimePicker(Platform.OS === 'ios');
                          if (selectedDate) {
                            const newDate = new Date(selectedDate);
                            // Preserve the selected date while updating only the time
                            newDate.setFullYear(
                              values.date.getFullYear(),
                              values.date.getMonth(),
                              values.date.getDate(),
                            );
                            setFieldValue('startTime', newDate);

                            // Update end time if necessary
                            const newEndTime = new Date(
                              newDate.getTime() + 3600000,
                            );
                            if (values.endTime < newDate) {
                              setFieldValue('endTime', newEndTime);
                            }
                          }
                        }}
                      />
                    )}

                    {/* End Time Picker */}
                    {showEndTimePicker && (
                      <DateTimePicker
                        value={values.endTime}
                        mode="time"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={(event, selectedDate) => {
                          setShowEndTimePicker(Platform.OS === 'ios');
                          if (selectedDate) {
                            const newDate = new Date(selectedDate);
                            // Preserve the selected date while updating only the time
                            newDate.setFullYear(
                              values.date.getFullYear(),
                              values.date.getMonth(),
                              values.date.getDate(),
                            );
                            setFieldValue('endTime', newDate);
                          }
                        }}
                      />
                    )}

                    <View style={styles.buttonContainer}>
                      <TouchableOpacity
                        style={[styles.button, styles.cancelButton]}
                        onPress={onClose}>
                        <Text style={styles.buttonText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.button, styles.saveButton]}
                        onPress={() => handleSubmit()}>
                        <Text style={styles.buttonText}>Save</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </Formik>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  modalWrapper: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 10,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    marginTop: 10,
  },
  dateTimeButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    padding: 15,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
  },
  saveButton: {
    backgroundColor: '#4CD964',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default MeetingForm;
