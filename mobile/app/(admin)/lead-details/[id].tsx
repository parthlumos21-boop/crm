import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import apiClient from '../../../src/api/client';
import { AppHeader } from '../../../src/components/ui/AppHeader';
import { colors } from '../../../src/theme/colors';

export default function LeadDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await apiClient.get(`/leads/${id}`);
        if (res.data?.success) {
          setData(res.data.data);
        }
      } catch (error: any) {
        console.log(`[API Error] GET /leads/${id} - Status: ${error?.response?.status}`);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchDetails();
  }, [id]);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <AppHeader title="Account Details" showBack onBack={() => router.push('/(admin)/leads')} />
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.centerContainer}>
        <AppHeader title="Account Details" showBack onBack={() => router.push('/(admin)/leads')} />
        <View style={styles.loaderContainer}>
          <Text style={styles.errorText}>Account not found.</Text>
        </View>
      </View>
    );
  }

  // Fields: Account No., Account Name, Project Name, Account Owner, Account Date, Account Category, Account Status, Account State, Phone, Email, Contact Person, PO Value, Job No
  const fields = [
    { label: 'Account No.', value: data.accountNo || data.leadNo || data.id || '-' },
    { label: 'Account Name', value: data.accountName || data.name || data.companyName || '-' },
    { label: 'Project Name', value: data.projectName || data.project || '-' },
    { label: 'Account Owner', value: data.accountOwner || data.ownerUserId || '-' },
    { label: 'Account Date', value: data.accountDate || data.createdAt ? new Date(data.accountDate || data.createdAt).toLocaleDateString() : '-' },
    { label: 'Account Category', value: data.accountCategory || data.category || '-' },
    { label: 'Account Status', value: data.accountStatus || data.status || '-' },
    { label: 'Account State', value: data.accountState || data.state || '-' },
    { label: 'Phone', value: data.phone || '-' },
    { label: 'Email', value: data.email || '-' },
    { label: 'Contact Person', value: data.contactPerson || data.contactName || '-' },
    { label: 'PO Value', value: data.poValue ? `₹${data.poValue.toLocaleString()}` : '-' },
    { label: 'Job No', value: data.jobNo || '-' }
  ];

  return (
    <View style={styles.container}>
      <AppHeader title={data.accountName || data.name || "Account Details"} showBack onBack={() => router.push('/(admin)/leads')} />
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
