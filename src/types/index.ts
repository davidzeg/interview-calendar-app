import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

export interface User {
  id: string;
  email: string;
  password: string;
  name?: string;
  createdAt?: FirebaseFirestoreTypes.Timestamp;
  updatedAt?: FirebaseFirestoreTypes.Timestamp;
}

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  createdBy: string;
}