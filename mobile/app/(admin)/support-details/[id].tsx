import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import apiClient from '../../../src/api/client';
import { AppHeader } from '../../../src/components/ui/AppHeader';
import { colors } from '../../../src/theme/colors';

export default function SupportDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await apiClient.get(`/support-requests/${id}`);
        if (res.data?.success) {
          setData(res.data.data);
        }
      } catch (error) {
        console.log('Error fetching support details:', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchDetails();
  }, [id]);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <AppHeader title="Support Request" showBack onBack={() => router.push('/(admin)/support')} />
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.centerContainer}>
        <AppHeader title="Support Request" showBack onBack={() => router.push('/(admin)/support')} />
        <View style={styles.loaderContainer}>
          <Text style={styles.errorText}>Request not found.</Text>
        </View>
      </View>
    );
  }

  // Fields: SR Number, Customer Name, Service Type, Date, Owner, Status, Closed On, Closed By, Last Updated
  const fields = [
    { label: 'SR Number', value: data.srNumber || data.ticketNo || data.legacyId || '-' },
    { label: 'Customer Name', value: data.customerName || 'Unknown' },
    { label: 'Service Type', value: data.serviceType || '-' },
    { label: 'Service/Request Date', value: data.createdAt ? new Date(data.createdAt).toLocaleDateString() : '-' },
    { label: 'Owner', value: data.ownerUserId || data.assignedTo || '-' },
    { label: 'Status', value: data.status || '-' },
    { label: 'Closed On', value: data.closedAt || (data.status?.toLowerCase() === 'closed' && data.updatedAt) ? new Date(data.closedAt || data.updatedAt).toLocaleDateString() : '-' },
    { label: 'Closed By', value: data.closedBy || (data.status?.toLowerCase() === 'closed' ? (data.updatedBy || '-') : '-') },
    { label: 'Last Updated', value: data.updatedAt ? new Date(data.updatedAt).toLocaleDateString() : '-' }
  ];

  return (
    <View style={styles.container}>
      <AppHeader title={`SR #${data.srNumber || data.ticketNo || data.id || ''}`} showBack onBack={() => router.push('/(admin)/support')} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Information</Text>
          <View style={styles.divider} />
          
          {fields.map((field, idx) => (
            <View key={idx} style={styles.row}>
              <Text style={styles.label}>{field.label}</Text>
              <Text style={styles.value}>{field.value}</Text>
            </View>
          ))}
          
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fafc',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#f7fafc',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#718096',
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#edf2f7',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f7fafc',
  },
  label: {
    flex: 1,
    fontSize: 14,
    color: '#718096',
    fontWeight: '500',
  },
  value: {
    flex: 1.5,
    fontSize: 14,
    color: '#2d3748',
    fontWeight: '600',
  }
});
