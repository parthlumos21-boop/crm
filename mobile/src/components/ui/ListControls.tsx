import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

export type ListControlsProps = {
  searchPlaceholder?: string;
  onSearch?: (text: string) => void;
  onFilterPress?: () => void;
  onSortPress?: () => void;
  filterLabel?: string;
  sortLabel?: string;
};

export const ListControls: React.FC<ListControlsProps> = ({
  searchPlaceholder = 'Search...',
  onSearch,
  onFilterPress,
  onSortPress,
  filterLabel = 'All',
  sortLabel = 'Recent'
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Feather name="search" size={18} color="#a0aec0" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={searchPlaceholder}
          placeholderTextColor="#a0aec0"
          onChangeText={onSearch}
        />
      </View>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={onFilterPress}>
          <Text style={styles.actionLabel}>Filter: </Text>
          <Text style={styles.actionValue}>{filterLabel}</Text>
          <Feather name="chevron-down" size={16} color="#718096" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={onSortPress}>
          <Text style={styles.actionLabel}>Sort: </Text>
          <Text style={styles.actionValue}>{sortLabel}</Text>
          <Feather name="chevron-down" size={16} color="#718096" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: '#2d3748',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingVertical: 8,
    marginHorizontal: 4,
  },
  actionLabel: {
    fontSize: 13,
    color: '#718096',
  },
  actionValue: {
    fontSize: 13,
    color: '#2d3748',
    fontWeight: '600',
    marginRight: 4,
  }
});
