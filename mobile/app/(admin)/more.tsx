import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { AppHeader } from '../../src/components/ui/AppHeader';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import { useAuth } from '../../src/context/AuthContext';

export default function MoreScreen() {
  const { logout } = useAuth();

  const menuItems = [
    { label: 'Quotations', icon: 'file-text', onPress: () => router.push('/quotations') },
    { label: 'Support Requests', icon: 'help-circle', onPress: () => router.push('/support') },
    { label: 'Tasks', icon: 'check-square', onPress: () => router.push('/tasks') },
  ];

  return (
    <View style={styles.container}>
      <AppHeader title="More" />
      <ScrollView style={styles.content}>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CRM Modules</Text>
          <View style={styles.card}>
            {menuItems.map((item, idx) => (
              <TouchableOpacity 
                key={item.label} 
                style={[styles.menuItem, idx !== menuItems.length - 1 && styles.borderBottom]}
                onPress={item.onPress}
              >
                <Feather name={item.icon as any} size={20} color={colors.primary} />
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Feather name="chevron-right" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.menuItem} onPress={() => {}}>
              <Feather name="settings" size={20} color={colors.textSecondary} />
              <Text style={styles.menuLabel}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.menuItem} onPress={logout}>
              <Feather name="log-out" size={20} color={colors.error} />
              <Text style={[styles.menuLabel, { color: colors.error }]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginLeft: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuLabel: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
    marginLeft: spacing.md,
  },
});
