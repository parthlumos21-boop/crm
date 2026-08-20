import React from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing, radii, shadows } from '../theme/spacing';
import { typography } from '../theme/typography';

interface QuickActionProps {
  title: string;
  icon: keyof typeof Feather.glyphMap;
  variant?: 'primary' | 'secondary';
  onPress?: () => void;
}

export function QuickAction({ title, icon, variant = 'secondary', onPress }: QuickActionProps) {
  const isPrimary = variant === 'primary';
  
  return (
    <Pressable 
      style={({ pressed }) => [
        styles.button,
        isPrimary ? styles.primaryButton : styles.secondaryButton,
        pressed && styles.pressed
      ]}
      onPress={onPress}
    >
      <Feather 
        name={icon} 
        size={16} 
        color={isPrimary ? colors.white : colors.primary} 
        style={styles.icon}
      />
      <Text style={[
        styles.text,
        isPrimary ? styles.primaryText : styles.secondaryText
      ]}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.round,
    marginRight: spacing.sm,
    ...shadows.card,
    elevation: 1,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.9,
  },
  icon: {
    marginRight: 4,
  },
  text: {
    ...typography.caption,
    fontWeight: '600',
    fontSize: 11,
  },
  primaryText: {
    color: colors.white,
  },
  secondaryText: {
    color: colors.textPrimary,
  },
});
