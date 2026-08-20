import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const CalendarWeekdays: React.FC = () => {
  return (
    <View style={styles.container}>
      {WEEKDAYS.map((day) => (
        <Text key={day} style={styles.dayText}>
          {day}
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dayText: {
    width: 40,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    color: '#9A9A9A',
  },
});
