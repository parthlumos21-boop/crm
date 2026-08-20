import React from 'react';
import { useWindowDimensions, View, StyleSheet, FlatList } from 'react-native';
import { DataTable } from './DataTable';
import { EmptyState } from './EmptyState';
import { Pagination } from './Pagination';

export type ResponsiveListProps<T> = {
  data: T[];
  columns: any[];
  keyExtractor: (item: T) => string;
  onRowPress: (item: T) => void;
  renderMobileCard: (item: T) => React.ReactNode;
  emptyTitle?: string;
  emptyMessage?: string;
  hideEmptyState?: boolean;
};

export function ResponsiveList<T>({
  data,
  columns,
  keyExtractor,
  onRowPress,
  renderMobileCard,
  emptyTitle = 'No Records Found',
  emptyMessage = 'There are currently no records matching your criteria.',
  hideEmptyState = false,
}: ResponsiveListProps<T>) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768; // standard tablet/desktop breakpoint

  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 3;
  
  // Reset pagination when data changes significantly
  React.useEffect(() => {
    setCurrentPage(1);
  }, [data.length]);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  
  // Only paginate on mobile
  const paginatedData = isDesktop 
    ? data 
    : data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const flatListRef = React.useRef<FlatList>(null);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  if (data.length === 0) {
    if (hideEmptyState) return null;
    return (
      <EmptyState 
        title={emptyTitle} 
        message={emptyMessage}
        actionLabel="Clear Filters"
        onAction={() => {}}
      />
    );
  }

  if (isDesktop) {
    return (
      <View style={styles.desktopContainer}>
        <DataTable 
          data={data}
          columns={columns}
          keyExtractor={keyExtractor}
          onRowPress={onRowPress}
        />
      </View>
    );
  }

  return (
    <FlatList
      ref={flatListRef}
      data={paginatedData}
      keyExtractor={keyExtractor}
      renderItem={({ item }) => <>{renderMobileCard(item)}</>}
      contentContainerStyle={styles.mobileListContent}
      showsVerticalScrollIndicator={false}
      ListFooterComponent={
        totalPages > 1 ? (
          <View style={styles.paginationWrapper}>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </View>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  desktopContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  mobileListContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  paginationWrapper: {
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: 'transparent',
  }
});
