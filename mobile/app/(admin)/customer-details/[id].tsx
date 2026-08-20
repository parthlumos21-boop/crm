import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import apiClient from '../../../src/api/client';
import { AppHeader } from '../../../src/components/ui/AppHeader';
import { colors } from '../../../src/theme/colors';

export default function CustomerDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await apiClient.get(`/customers/${id}`);
        if (res.data?.success) {
          setData(res.data.data);
        }
      } catch (error) {
        console.log('Error fetching customer details:', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchDetails();
  }, [id]);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <AppHeader title="Customer Details" showBack onBack={() => router.push('/(admin)/customers')} />
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.centerContainer}>
        <AppHeader title="Customer Details" showBack onBack={() => router.push('/(admin)/customers')} />
        <View style={styles.loaderContainer}>
          <Text style={styles.errorText}>Customer not found.</Text>
        </View>
      </View>
    );
  }

  // Fields: Customer Number, Customer Name, Added Date, Email, Phone, Customer Category, Customer Owner, Customer Status
  const fields = [
    { label: 'Customer Number', value: data.customerNo || data.id || '-' },
    { label: 'Customer Name', value: data.customerName || data.name || '-' },
    { label: 'Added Date', value: data.createdAt ? new Date(data.createdAt).toLocaleDateString() : '-' },
    { label: 'Email', value: data.email || '-' },
    { label: 'Phone', value: data.phone || '-' },
    { label: 'Customer Category', value: data.customerCategory || data.category || '-' },
    { label: 'Customer Owner', value: data.customerOwner || data.ownerUserId || '-' },
    { label: 'Customer Status', value: data.customerStatus || data.status || '-' }
  ];

  return (
    <View style={styles.container}>
      <AppHeader title={data.customerName || data.name || "Customer Details"} showBack onBack={() => router.push('/(admin)/customers')} />
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
