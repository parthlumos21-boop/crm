import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing, radii, shadows } from '../theme/spacing';
import { typography } from '../theme/typography';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: keyof typeof Feather.glyphMap;
  onPress?: () => void;
}

export function StatCard({ title, value, icon, onPress }: StatCardProps) {
  return (
    <Pressable 
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed
      ]}
      onPress={onPress}
    >
      <View style={styles.iconContainer}>
        <Feather name={icon} size={20} color={colors.primary} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.title}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '46%',
    backgroundColor: colors.card,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    marginHorizontal: '2%',
    marginBottom: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: radii.round,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  value: {
    ...typography.h3,
    color: colors.primaryDark,
    marginBottom: 2,
    textAlign: 'center',
  },
  title: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
    textAlign: 'center',
  },
});
