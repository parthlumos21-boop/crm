import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View, ScrollView } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

interface SelectFieldProps {
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
  required?: boolean;
  error?: string;
}

export function SelectField({
  label,
  value,
  options,
  onChange,
  required,
  error,
}: SelectFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>

        <Pressable
          style={[styles.input, error ? styles.inputError : null]}
          onPress={() => setVisible(true)}
        >
          <Text style={[styles.value, !value && styles.placeholder]}>
            {value || 'Select'}
          </Text>
        </Pressable>
        {!!error && <Text style={styles.errorText}>{error}</Text>}
      </View>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => setVisible(false)}
        >
          <View style={styles.modal}>
            <ScrollView showsVerticalScrollIndicator={true}>
              <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                <View style={{ minWidth: '100%' }}>
                  {options.map((option) => (
                    <Pressable
                      key={option}
                      style={styles.option}
                      onPress={() => {
                        onChange(option);
                        setVisible(false);
                      }}
                    >
                      <Text style={styles.optionText}>{option}</Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  required: {
    color: colors.primary,
  },
  input: {
    height: 38,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputError: {
    borderColor: colors.error,
  },
  value: {
    ...typography.body,
    color: colors.textPrimary,
  },
  placeholder: {
    color: colors.textMuted,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: 4,
    fontSize: 11,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    padding: 24,
  },
  modal: {
    backgroundColor: colors.white,
    borderRadius: 8,
    overflow: 'hidden',
    maxHeight: '80%',
  },
  option: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionText: {
    ...typography.body,
    color: colors.textPrimary,
  },
});
