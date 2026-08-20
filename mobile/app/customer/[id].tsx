import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import apiClient from '../../src/api/client';

export default function CustomerDetailScreen() {
  const { id } = useLocalSearchParams();
  const [customer, setCustomer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await apiClient.get(`/customers/${id}`);
        if (response.data?.success) {
          setCustomer(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching customer details:', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchCustomer();
  }, [id]);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#C62828" />
      </View>
    );
  }

  if (!customer) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Customer not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{customer.name || customer.company_name || 'Unknown'}</Text>
        
        <View style={styles.row}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{customer.email || 'N/A'}</Text>
        </View>
        
        <View style={styles.row}>
          <Text style={styles.label}>Phone:</Text>
          <Text style={styles.value}>{customer.phone || 'N/A'}</Text>
        </View>
        
        <View style={styles.row}>
          <Text style={styles.label}>Status:</Text>
          <Text style={styles.value}>{customer.status || 'Active'}</Text>
        </View>
        
        <View style={styles.row}>
          <Text style={styles.label}>Address:</Text>
          <Text style={styles.value}>{customer.address || customer.billing_address || 'N/A'}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  label: {
    width: 80,
    fontSize: 16,
    fontWeight: '600',
    color: '#4a5568',
  },
  value: {
    flex: 1,
    fontSize: 16,
    color: '#2d3748',
  },
  errorText: {
    fontSize: 16,
    color: '#e53e3e',
  }
});
