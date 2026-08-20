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

export default function QuotationsScreen() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/quotations');
      if (res.data?.success) {
        setData(res.data.data || []);
      }
    } catch (error) {
      console.log('Error fetching quotations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    { id: 'quotationNumber', header: 'Quotation Number', accessor: (item: any) => item.quotationNo || item.quotationNumber || item.id || '-', width: 140 },
    { id: 'quotationOwner', header: 'Quotation Owner', accessor: (item: any) => item.quotationOwner || item.ownerUserId || '-', width: 140 },
    { id: 'quotationDate', header: 'Quotation Date', accessor: (item: any) => item.quotationDate || item.createdAt ? new Date(item.quotationDate || item.createdAt).toLocaleDateString() : '-', width: 120 },
    { id: 'companyName', header: 'Company Name', accessor: (item: any) => item.companyName || item.customerName || '-', width: 150 },
    { id: 'amount', header: 'Amount', accessor: (item: any) => item.amount ? `₹${item.amount.toLocaleString()}` : item.total ? `₹${item.total.toLocaleString()}` : '-', width: 120 },
    { id: 'status', header: 'Status', accessor: (item: any) => item.status || '-', width: 100 },
    { id: 'projectName', header: 'Project Name', accessor: (item: any) => item.projectName || item.project || '-', width: 150 }
  ];

  const draftCount = data.filter(d => (d.status || '').toLowerCase() === 'draft').length;
  const sentCount = data.filter(d => (d.status || '').toLowerCase() === 'sent').length;
  const approvedCount = data.filter(d => (d.status || '').toLowerCase() === 'approved').length;
  const rejectedCount = data.filter(d => (d.status || '').toLowerCase() === 'rejected').length;

  const summaryMetrics = [
    { label: 'Draft', value: draftCount },
    { label: 'Sent', value: sentCount },
    { label: 'Approved', value: approvedCount },
    { label: 'Rejected', value: rejectedCount }
  ];

  const filteredData = data.filter(item => {
    const searchString = `${item.quotationNo} ${item.quotationNumber} ${item.companyName} ${item.customerName}`.toLowerCase();
    return searchString.includes(searchQuery.toLowerCase());
  });

  const renderMobileCard = (item: any) => {
    const qtNo = item.quotationNo || item.quotationNumber || item.id || '-';
    const company = item.companyName || item.customerName || '-';
    const project = item.projectName || item.project || '-';
    const owner = item.quotationOwner || item.ownerUserId || '-';
    const date = item.quotationDate || item.createdAt ? new Date(item.quotationDate || item.createdAt).toLocaleDateString() : '-';
    const amt = item.amount ? `₹${item.amount.toLocaleString()}` : item.total ? `₹${item.total.toLocaleString()}` : '-';
    const status = item.status || '-';
    
    // Status color
    let statusColor = '#4a5568';
    let statusBg = '#edf2f7';
    const s = status.toLowerCase();
    if (s === 'approved') { statusColor = '#38a169'; statusBg = '#f0fff4'; }
    else if (s === 'rejected') { statusColor = '#e53e3e'; statusBg = '#fff5f5'; }
    else if (s === 'sent') { statusColor = '#C62828'; statusBg = '#FDECEC'; }

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardId}>Ex: {qtNo}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>{status}</Text>
          </View>
        </View>
        
        <Text style={styles.cardTitle}>{company}</Text>
        <Text style={styles.cardSubtitle}>{project}</Text>
        
        <View style={styles.cardDivider} />
        
        <View style={styles.cardGrid}>
          <View style={styles.cardGridItem}>
            <Text style={styles.cardLabel}>Owner</Text>
            <Text style={styles.cardValue}>{owner}</Text>
          </View>
          <View style={styles.cardGridItem}>
            <Text style={styles.cardLabel}>Date</Text>
            <Text style={styles.cardValue}>{date}</Text>
          </View>
        </View>

        <View style={styles.amountInfo}>
          <Text style={styles.amountLabel}>Amount</Text>
          <Text style={styles.amountValue}>{amt}</Text>
        </View>
        
        <TouchableOpacity style={styles.viewDetailsBtn} onPress={() => router.push(`/quotation-details/${item._id || item.id}`)}>
          <Text style={styles.viewDetailsText}>View Details</Text>
          <Feather name="chevron-right" size={16} color="#C62828" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Quotations" onSearch={() => {}} onFilter={() => {}} />
      
      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <>
          <SummaryWidget 
            title="Quotations" 
            totalCount={data.length} 
            metrics={summaryMetrics} 
          />
          <ListControls 
            searchPlaceholder="Search quotations..." 
            onSearch={setSearchQuery} 
          />
          <ResponsiveList
            data={filteredData}
            columns={columns}
            keyExtractor={(item: any) => item._id || item.id}
            onRowPress={(item: any) => router.push(`/quotation-details/${item._id || item.id}`)}
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
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#4a5568',
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
  amountInfo: {
    marginBottom: 12,
  },
  amountLabel: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 2,
  },
  amountValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  viewDetailsText: {
    color: '#C62828',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  }
});
