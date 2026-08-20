import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface CalendarDayProps {
  date: Date | null; // null for padding days
  isToday: boolean;
  isSelected: boolean;
  remindersCount: number;
  onPress: (date: Date) => void;
}

export const CalendarDay: React.FC<CalendarDayProps> = ({
  date,
  isToday,
  isSelected,
  remindersCount,
  onPress,
}) => {
  if (!date) {
    return <View style={styles.dayContainer} />;
  }

  const handlePress = () => {
    onPress(date);
  };

  const getDots = () => {
    if (remindersCount === 0) return null;
    const dots = Math.min(remindersCount, 3);
    return (
      <View style={styles.dotsContainer}>
        {Array.from({ length: dots }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              isSelected ? styles.selectedDot : null,
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={[
        styles.dayContainer,
        isToday && !isSelected ? styles.todayContainer : null,
        isSelected ? styles.selectedContainer : null,
      ]}
      onPress={handlePress}
    >
      <Text
        style={[
          styles.dayText,
          isToday && !isSelected ? styles.todayText : null,
          isSelected ? styles.selectedText : null,
        ]}
      >
        {date.getDate()}
      </Text>
      {getDots()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  dayContainer: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
    borderRadius: 8,
  },
  todayContainer: {
    borderWidth: 1,
    borderColor: '#E8B5B5',
  },
  selectedContainer: {
    backgroundColor: '#FFF3F3',
    borderWidth: 1,
    borderColor: '#E8B5B5',
  },
  dayText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  todayText: {
    color: '#A00000',
    fontWeight: '700',
  },
  selectedText: {
    color: '#A00000',
    fontWeight: '700',
  },
  dotsContainer: {
    flexDirection: 'row',
    marginTop: 2,
    height: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#DC2626',
    marginHorizontal: 1,
  },
  selectedDot: {
    backgroundColor: '#FCA5A5', // Lighter dots when selected
  },
});
