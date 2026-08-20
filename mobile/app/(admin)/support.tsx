import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import apiClient from '../../src/api/client';
import { AppHeader } from '../../src/components/ui/AppHeader';
import { ResponsiveList } from '../../src/components/ui/ResponsiveList';
import { SummaryWidget } from '../../src/components/ui/SummaryWidget';
import { ListControls } from '../../src/components/ui/ListControls';
import { LoadingSkeleton } from '../../src/components/ui/LoadingSkeleton';
import { colors } from '../../src/theme/colors';

export default function SupportScreen() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClosedTab, setIsClosedTab] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/support-requests');
      if (res.data?.success) {
        setData(res.data.data || []);
      }
    } catch (error) {
      console.log('Error fetching support requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openColumns = [
    { id: 'srNumber', header: 'SR Number', accessor: (item: any) => item.srNumber || item.ticketNo || item.legacyId || '-', width: 100 },
    { id: 'customer', header: 'Customer Name', accessor: (item: any) => item.customerName || 'Unknown', width: 150 },
    { id: 'serviceType', header: 'Service Type', accessor: (item: any) => item.serviceType || '-', width: 120 },
    { id: 'serviceDate', header: 'Service Date', accessor: (item: any) => item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-', width: 100 },
    { id: 'owner', header: 'Owner', accessor: (item: any) => item.ownerUserId || item.assignedTo || '-', width: 120 },
    { id: 'status', header: 'Status', accessor: (item: any) => item.status || '-', width: 100 },
    { id: 'lastUpdated', header: 'Last Updated', accessor: (item: any) => item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : '-', width: 100 }
  ];

  const closedColumns = [
    { id: 'srNumber', header: 'SR Number', accessor: (item: any) => item.srNumber || item.ticketNo || item.legacyId || '-', width: 100 },
    { id: 'customer', header: 'Customer Name', accessor: (item: any) => item.customerName || 'Unknown', width: 150 },
    { id: 'serviceType', header: 'Service Type', accessor: (item: any) => item.serviceType || '-', width: 120 },
    { id: 'requestDate', header: 'Request Date', accessor: (item: any) => item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-', width: 100 },
    { id: 'owner', header: 'Owner', accessor: (item: any) => item.ownerUserId || item.assignedTo || '-', width: 120 },
    { id: 'closedOn', header: 'Closed On', accessor: (item: any) => item.closedAt || item.updatedAt ? new Date(item.closedAt || item.updatedAt).toLocaleDateString() : '-', width: 100 },
    { id: 'closedBy', header: 'Closed By', accessor: (item: any) => item.closedBy || item.updatedBy || '-', width: 120 },
    { id: 'lastUpdated', header: 'Last Updated', accessor: (item: any) => item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : '-', width: 100 }
  ];

  // Dynamic Metrics (Open Requests Dashboard)
  const openCount = data.filter(d => {
    const s = (d.status || '').toLowerCase();
    return s === 'open' || s === 'new';
  }).length;
  
  const inProgressCount = data.filter(d => {
    const s = (d.status || '').toLowerCase();
    return s === 'in progress' || s === 'working';
  }).length;
  
  const waitingCount = data.filter(d => {
    const s = (d.status || '').toLowerCase();
    return s === 'waiting' || s === 'pending';
  }).length;
  
  const escalatedCount = data.filter(d => {
    const s = (d.status || '').toLowerCase();
    return s === 'escalated';
  }).length;

  const summaryMetrics = [
    { label: 'Open', value: openCount },
    { label: 'In Progress', value: inProgressCount },
    { label: 'Waiting', value: waitingCount },
    { label: 'Escalated', value: escalatedCount }
  ];

  const filteredData = data.filter(item => {
    const status = (item.status || '').toLowerCase();
    const isClosedStatus = status === 'closed' || status === 'resolved';
    
    // Check Tab logic
    if (isClosedTab && !isClosedStatus) return false;
    if (!isClosedTab && isClosedStatus) return false;
    
    // Check Search logic
    const searchString = `${item.customerName} ${item.srNumber} ${item.ticketNo}`.toLowerCase();
    return searchString.includes(searchQuery.toLowerCase());
  });

  const renderMobileCard = (item: any) => {
    const srNo = item.srNumber || item.ticketNo || item.legacyId || '-';
    const custName = item.customerName || 'Unknown';
    const status = item.status || '-';
    const serviceType = item.serviceType || '-';
    const owner = item.ownerUserId || item.assignedTo || '-';
    
    // Dates
    const serviceDate = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-';
    const lastUpdated = item.updatedAt ? new Date(item.updatedAt).toLocaleString() : '-';
    const closedOn = item.closedAt || item.updatedAt ? new Date(item.closedAt || item.updatedAt).toLocaleDateString() : '-';
    const closedBy = item.closedBy || item.updatedBy || '-';

    // Status color
    let statusColor = '#dd6b20'; // orange for Open
    let statusBg = '#feebc8';
    const s = status.toLowerCase();
    if (s === 'closed' || s === 'resolved') { statusColor = '#38a169'; statusBg = '#f0fff4'; }
    else if (s === 'in progress') { statusColor = '#C62828'; statusBg = '#FDECEC'; }
    else if (s === 'escalated') { statusColor = '#e53e3e'; statusBg = '#fff5f5'; }

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardId}>Ex: {srNo}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>{status}</Text>
          </View>
        </View>
        
        <Text style={styles.cardTitle}>{custName}</Text>
        
        <View style={styles.cardDivider} />
        
        <View style={styles.cardGrid}>
          <View style={styles.cardGridItem}>
            <Text style={styles.cardLabel}>Service Type</Text>
            <Text style={styles.cardValue}>{serviceType}</Text>
          </View>
          <View style={styles.cardGridItem}>
            <Text style={styles.cardLabel}>Owner</Text>
            <Text style={styles.cardValue}>{owner}</Text>
          </View>
          {!isClosedTab ? (
            <View style={styles.cardGridItem}>
              <Text style={styles.cardLabel}>Service Date</Text>
              <Text style={styles.cardValue}>{serviceDate}</Text>
            </View>
          ) : (
            <>
              <View style={styles.cardGridItem}>
                <Text style={styles.cardLabel}>Closed On</Text>
                <Text style={styles.cardValue}>{closedOn}</Text>
              </View>
              <View style={styles.cardGridItem}>
                <Text style={styles.cardLabel}>Closed By</Text>
                <Text style={styles.cardValue}>{closedBy}</Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.updateInfo}>
          <Text style={styles.updateLabel}>Last Updated</Text>
          <Text style={styles.updateValue}>{lastUpdated}</Text>
        </View>
        
        <TouchableOpacity style={styles.viewDetailsBtn} onPress={() => router.push(`/support-details/${item._id || item.id}`)}>
          <Text style={styles.viewDetailsText}>View Request</Text>
          <Feather name="chevron-right" size={16} color="#C62828" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Support Requests" onSearch={() => {}} onFilter={() => {}} />
      
      <View style={styles.segmentContainer}>
        <TouchableOpacity 
          style={[styles.segmentButton, !isClosedTab && styles.segmentActive]} 
          onPress={() => setIsClosedTab(false)}
        >
          <Text style={[styles.segmentText, !isClosedTab && styles.segmentTextActive]}>Open</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.segmentButton, isClosedTab && styles.segmentActive]} 
          onPress={() => setIsClosedTab(true)}
        >
          <Text style={[styles.segmentText, isClosedTab && styles.segmentTextActive]}>Closed</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <>
          {!isClosedTab && (
            <SummaryWidget 
              title="Open Requests" 
              totalCount={data.filter(d => {
                const s = (d.status || '').toLowerCase();
                return s !== 'closed' && s !== 'resolved';
              }).length} 
              metrics={summaryMetrics} 
            />
          )}
          <ListControls 
            searchPlaceholder="Search requests..." 
            onSearch={setSearchQuery} 
          />
          <ResponsiveList
            data={filteredData}
            columns={isClosedTab ? closedColumns : openColumns}
            keyExtractor={(item: any) => item._id || item.id}
            onRowPress={(item: any) => router.push(`/support-details/${item._id || item.id}`)}
            renderMobileCard={renderMobileCard}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fafc',
  },
  segmentContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#edf2f7',
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
    backgroundColor: '#f7fafc',
    marginHorizontal: 4,
  },
  segmentActive: {
    backgroundColor: '#FDECEC',
    borderWidth: 1,
    borderColor: '#C62828',
  },
  segmentText: {
    fontSize: 14,
    color: '#4a5568',
    fontWeight: '500',
  },
  segmentTextActive: {
    color: '#2b6cb0',
    fontWeight: '600',
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
    marginBottom: 8,
  },
  cardId: {
    fontSize: 14,
    color: '#718096',
    fontWeight: '500',
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
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#edf2f7',
    marginVertical: 12,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cardGridItem: {
    width: '50%',
    marginBottom: 8,
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
  updateInfo: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#edf2f7',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  updateLabel: {
    fontSize: 12,
    color: '#718096',
  },
  updateValue: {
    fontSize: 12,
    color: '#4a5568',
    fontWeight: '500',
  },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  viewDetailsText: {
    color: '#C62828',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  }
});
