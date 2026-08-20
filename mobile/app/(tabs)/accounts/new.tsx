import React from 'react';
import { AccountWizard } from '../../../src/components/accounts/AccountWizard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, View } from 'react-native';
import { colors } from '../../../src/theme/colors';
import { AppHeader } from '../../../src/components/ui/AppHeader';

export default function NewAccountScreen() {
  return (
    <View style={styles.container}>
      <AppHeader title="Add Account" showBack />
      <AccountWizard />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
