import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../../theme/colors'; // Assume this exists and has primary

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) {
    return null; // Don't show pagination if only 1 page
  }

  // Calculate pages to show
  const pages = useMemo(() => {
    const list: number[] = [];
    
    if (currentPage === totalPages && totalPages > 1) {
      list.push(totalPages - 1);
      list.push(totalPages);
    } else {
      list.push(currentPage);
      if (currentPage + 1 <= totalPages) {
        list.push(currentPage + 1);
      }
    }

    return list;
  }, [currentPage, totalPages]);

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        style={[styles.button, styles.navButton, currentPage === 1 && styles.disabledButton]}
        onPress={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        accessibilityLabel="Previous Page"
      >
        <Feather name="chevron-left" size={16} color={currentPage === 1 ? '#9CA3AF' : '#C62828'} />
      </TouchableOpacity>

      <View style={styles.pagesContainer}>
        {pages.map((pageNum) => {
          const isActive = pageNum === currentPage;

          return (
            <TouchableOpacity
              key={`page-${pageNum}`}
              style={[styles.button, styles.pageButton, isActive && styles.activePageButton]}
              onPress={() => onPageChange(pageNum)}
              accessibilityLabel={`Page ${pageNum}`}
            >
              <Text style={[styles.pageText, isActive && styles.activePageText]}>
                {pageNum}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Next Button */}
      <TouchableOpacity
        style={[styles.button, styles.navButton, currentPage === totalPages && styles.disabledButton]}
        onPress={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        accessibilityLabel="Next Page"
      >
        <Feather name="chevron-right" size={16} color={currentPage === totalPages ? '#9CA3AF' : '#C62828'} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    width: '100%',
  },
  pagesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    height: 36,
    minWidth: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  navButton: {
    backgroundColor: '#FFEBEE',
  },
  pageButton: {
    backgroundColor: '#F3F4F6',
    marginHorizontal: 4,
  },
  activePageButton: {
    backgroundColor: '#C62828',
  },
  navText: {
    color: '#C62828',
    fontSize: 14,
    fontWeight: '600',
    marginHorizontal: 4,
  },
  pageText: {
    color: '#4B5563',
    fontSize: 14,
    fontWeight: '600',
  },
  activePageText: {
    color: '#FFFFFF',
  },
  disabledButton: {
    backgroundColor: '#F3F4F6',
  },
  disabledText: {
    color: '#9CA3AF',
  },
  ellipsisContainer: {
    height: 36,
    minWidth: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  ellipsisText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
});
