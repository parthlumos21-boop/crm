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

export default function LeadsScreen() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/leads');
      if (res.data?.success) {
        setData(res.data.data || []);
      }
    } catch (error) {
      console.log('Error fetching accounts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    { id: 'accountNo', header: 'Account No.', accessor: (item: any) => item.accountNo || item.leadNo || item.id || '-', width: 100 },
    { id: 'accountName', header: 'Account Name', accessor: (item: any) => item.accountName || item.name || item.companyName || '-', width: 150 },
    { id: 'projectName', header: 'Project Name', accessor: (item: any) => item.projectName || item.project || '-', width: 150 },
    { id: 'accountOwner', header: 'Account Owner', accessor: (item: any) => item.accountOwner || item.ownerUserId || '-', width: 120 },
    { id: 'accountDate', header: 'Account Date', accessor: (item: any) => item.accountDate || item.createdAt ? new Date(item.accountDate || item.createdAt).toLocaleDateString() : '-', width: 100 },
    { id: 'accountCategory', header: 'Account Category', accessor: (item: any) => item.accountCategory || item.category || '-', width: 120 },
    { id: 'accountStatus', header: 'Account Status', accessor: (item: any) => item.accountStatus || item.status || '-', width: 100 },
    { id: 'accountState', header: 'Account State', accessor: (item: any) => item.accountState || item.state || '-', width: 100 },
    { id: 'phone', header: 'Phone', accessor: (item: any) => item.phone || '-', width: 120 },
    { id: 'email', header: 'Email', accessor: (item: any) => item.email || '-', width: 180 },
    { id: 'contactPerson', header: 'Contact Person', accessor: (item: any) => item.contactPerson || item.contactName || '-', width: 120 },
    { id: 'poValue', header: 'PO Value', accessor: (item: any) => item.poValue ? `₹${item.poValue.toLocaleString()}` : '-', width: 100 },
    { id: 'jobNo', header: 'Job No', accessor: (item: any) => item.jobNo || '-', width: 100 }
  ];

  const activeCount = data.filter(d => (d.status || d.accountStatus || '').toLowerCase() === 'active').length;
  const pendingCount = data.filter(d => (d.status || d.accountStatus || '').toLowerCase() === 'pending').length;
  const draftCount = data.filter(d => (d.status || d.accountStatus || '').toLowerCase() === 'draft').length;

  const summaryMetrics = [
    { label: 'Active', value: activeCount },
    { label: 'Pending', value: pendingCount },
    { label: 'Draft', value: draftCount }
  ];

  const filteredData = data.filter(item => {
    const searchString = `${item.accountName} ${item.name} ${item.companyName} ${item.accountNo}`.toLowerCase();
    return searchString.includes(searchQuery.toLowerCase());
  });

  const renderMobileCard = (item: any) => {
    const accNo = item.accountNo || item.leadNo || item.id || '-';
    const name = item.accountName || item.name || item.companyName || '-';
    const status = item.accountStatus || item.status || '-';
    const project = item.projectName || item.project || '-';
    const owner = item.accountOwner || item.ownerUserId || '-';
    const category = item.accountCategory || item.category || '-';
    const state = item.accountState || item.state || '-';
    const val = item.poValue ? `₹${item.poValue.toLocaleString()}` : '-';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardId}>Ex: {accNo}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{status}</Text>
          </View>
        </View>
        
        <Text style={styles.cardTitle}>{name}</Text>
        <Text style={styles.cardSubtitle}>{project}</Text>
        
        <View style={styles.cardDivider} />
        
        <View style={styles.cardGrid}>
          <View style={styles.cardGridItem}>
            <Text style={styles.cardLabel}>Account Owner</Text>
            <Text style={styles.cardValue}>{owner}</Text>
          </View>
          <View style={styles.cardGridItem}>
            <Text style={styles.cardLabel}>Category</Text>
            <Text style={styles.cardValue}>{category}</Text>
          </View>
          <View style={styles.cardGridItem}>
            <Text style={styles.cardLabel}>State</Text>
            <Text style={styles.cardValue}>{state}</Text>
          </View>
          <View style={styles.cardGridItem}>
            <Text style={styles.cardLabel}>PO Value</Text>
            <Text style={styles.cardValue}>{val}</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.viewDetailsBtn} onPress={() => router.push(`/lead-details/${item._id || item.id}`)}>
          <Text style={styles.viewDetailsText}>View details</Text>
          <Feather name="chevron-right" size={16} color="#C62828" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Accounts" onSearch={() => {}} onFilter={() => {}} />
      
      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <>
          <SummaryWidget 
            title="Accounts" 
            totalCount={data.length} 
            metrics={summaryMetrics} 
          />
          <ListControls 
            searchPlaceholder="Search accounts..." 
            onSearch={setSearchQuery} 
          />
          <ResponsiveList
            data={filteredData}
            columns={columns}
            keyExtractor={(item: any) => item._id || item.id}
            onRowPress={(item: any) => router.push(`/lead-details/${item._id || item.id}`)}
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
    backgroundColor: '#FDECEC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#C62828',
    fontSize: 12,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#4a5568',
    marginBottom: 12,
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
    marginBottom: 12,
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
    color: '#C62828',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  }
});
