import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import apiClient from '../../src/api/client';
import { AppHeader } from '../../src/components/ui/AppHeader';
import { ResponsiveList } from '../../src/components/ui/ResponsiveList';
import { SummaryWidget } from '../../src/components/ui/SummaryWidget';
import { ListControls } from '../../src/components/ui/ListControls';
import { LoadingSkeleton } from '../../src/components/ui/LoadingSkeleton';
import { colors } from '../../src/theme/colors';
import { CalendarButton } from '../../src/components/reminders/CalendarButton';
import { CalendarModal } from '../../src/components/calendar/CalendarModal';
import { isSameDay } from 'date-fns';

export default function TasksScreen() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/reminders');
      if (res.data?.success) {
        setData(res.data.data || []);
      }
    } catch (error) {
      console.log('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    { id: 'title', header: 'Title', accessor: (item: any) => item.title || item.taskName || 'Unknown', width: 180 },
    { id: 'priority', header: 'Priority', accessor: (item: any) => item.priority || '-', width: 100 },
    { id: 'status', header: 'Status', accessor: (item: any) => item.status || '-', width: 100 },
    { id: 'dueDate', header: 'Due Date', accessor: (item: any) => item.dueDate ? new Date(item.dueDate).toLocaleDateString() : '-', width: 100 }
  ];

  const pendingCount = data.filter(d => (d.status || '').toLowerCase() === 'pending').length;
  const progressCount = data.filter(d => (d.status || '').toLowerCase() === 'in progress').length;
  const completedCount = data.filter(d => (d.status || '').toLowerCase() === 'completed').length;

  const summaryMetrics = [
    { label: 'Pending', value: pendingCount },
    { label: 'In Progress', value: progressCount },
    { label: 'Completed', value: completedCount }
  ];

  const filteredData = data.filter(item => {
    const searchString = `${item.title} ${item.taskName}`.toLowerCase();
    const matchesSearch = searchString.includes(searchQuery.toLowerCase());
    
    let matchesDate = true;
    if (selectedDate && selectedDate.getTime() !== 0) { // Using 0 timestamp for "All" filter
      if (item.dueDate) {
        matchesDate = isSameDay(new Date(item.dueDate), selectedDate);
      } else {
        matchesDate = false;
      }
    }
    
    return matchesSearch && matchesDate;
  });

  const renderMobileCard = (item: any) => {
    const title = item.title || item.taskName || 'Unknown';
    const priority = item.priority || '-';
    const status = item.status || '-';
    const dueDate = item.dueDate ? new Date(item.dueDate).toLocaleDateString() : '-';
    
    let statusColor = '#4a5568';
    let statusBg = '#edf2f7';
    const s = status.toLowerCase();
    if (s === 'completed') { statusColor = '#38a169'; statusBg = '#f0fff4'; }
    else if (s === 'pending') { statusColor = '#dd6b20'; statusBg = '#feebc8'; }
    else if (s === 'in progress') { statusColor = colors.primary; statusBg = colors.primaryLight; }

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>{status}</Text>
          </View>
        </View>
        
        <View style={styles.cardGrid}>
          <View style={styles.cardGridItem}>
            <Text style={styles.cardLabel}>Priority</Text>
            <Text style={styles.cardValue}>{priority}</Text>
          </View>
          <View style={styles.cardGridItem}>
            <Text style={styles.cardLabel}>Due Date</Text>
            <Text style={styles.cardValue}>{dueDate}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.viewDetailsBtn}
          onPress={() => router.push(`/reminder-details/${item._id || item.id}`)}
        >
          <Text style={styles.viewDetailsText}>View Reminder</Text>
          <Feather name="chevron-right" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader 
        title="Reminders" 
        onSearch={() => {}} 
        onFilter={() => {}} 
        rightContent={<CalendarButton onPress={() => setIsCalendarVisible(true)} />}
      />
      
      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <>
          {selectedDate && selectedDate.getTime() !== 0 ? (
            <View style={styles.selectedDateHeader}>
              <Text style={styles.selectedDateText}>
                Reminders for {selectedDate.toLocaleDateString()}
              </Text>
            </View>
          ) : (
            <SummaryWidget 
              title="Reminders" 
              totalCount={data.length} 
              metrics={summaryMetrics} 
            />
          )}
          <ListControls 
            searchPlaceholder="Search reminders..." 
            onSearch={setSearchQuery} 
          />
          <ResponsiveList
            data={filteredData}
            columns={columns}
            keyExtractor={(item: any) => item._id || item.id}
            onRowPress={(item: any) => router.push(`/reminder-details/${item._id || item.id}`)}
            renderMobileCard={renderMobileCard}
            hideEmptyState={true}
          />
          {filteredData.length === 0 && (
            <View style={styles.emptyStateContainer}>
              <Feather name="calendar" size={48} color="#9CA3AF" />
              <Text style={styles.emptyStateText}>
                {selectedDate && selectedDate.getTime() !== 0 
                  ? 'No reminders for this date' 
                  : 'No reminders found'}
              </Text>
            </View>
          )}
        </>
      )}

      <CalendarModal
        visible={isCalendarVisible}
        onClose={() => setIsCalendarVisible(false)}
        selectedDate={selectedDate}
        onSelectDate={(date) => {
          setSelectedDate(date);
          setIsCalendarVisible(false); // Close calendar on date selection for Option A
        }}
        reminders={data}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fafc',
  },
  selectedDateHeader: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  selectedDateText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3748',
    flex: 1,
    marginRight: 8,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderTopWidth: 1,
    borderTopColor: '#edf2f7',
    paddingTop: 12,
  },
  cardGridItem: {
    width: '50%',
    marginBottom: 4,
  },
  cardLabel: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 2,
  },
  cardValue: {
    fontSize: 13,
    color: '#2d3748',
    fontWeight: '500',
  },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  viewDetailsText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  }
});
