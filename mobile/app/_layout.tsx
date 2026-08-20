import { Slot } from 'expo-router';
import { AuthProvider } from '../src/context/AuthContext';
import { PaperProvider, MD3LightTheme as DefaultTheme } from 'react-native-paper';

export default function RootLayout() {
  return (
    <PaperProvider theme={DefaultTheme}>
      <AuthProvider>
        <Slot />
      </AuthProvider>
    </PaperProvider>
  );
}
