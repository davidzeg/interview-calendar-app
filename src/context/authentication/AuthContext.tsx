// import React, {createContext, useContext, useState, useEffect} from 'react';
// import {getData, StorageKeys} from '../../utils/storage';
// import {User} from '../../types';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// interface AuthContextType {
//   user: User | null;
//   setUser: (user: User | null) => void;
//   isLoading: boolean;
//   logout: () => Promise<void>;
// }

// const AuthContext = createContext<AuthContextType>({
//   user: null,
//   setUser: () => {},
//   isLoading: true,
//   logout: async () => {},
// });

// export const AuthProvider: React.FC<{children: React.ReactNode}> = ({
//   children,
// }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     checkUser();
//   }, []);

//   const checkUser = async () => {
//     try {
//       const storedUser = await getData(StorageKeys.USER);
//       if (storedUser) {
//         setUser(storedUser);
//       }
//     } catch (error) {
//       console.error('Error checking user:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const logout = async () => {
//     try {
//       await AsyncStorage.removeItem(StorageKeys.USER);
//       setUser(null);
//     } catch (error) {
//       console.error('Error during logout:', error);
//       throw error;
//     }
//   };

//   return (
//     <AuthContext.Provider value={{user, setUser, isLoading, logout}}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);
