import React, { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, Image, Modal, TouchableOpacity, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import apiClient from '../../src/api/client';
import { useAuth } from '../../src/context/AuthContext';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import { StatCard } from '../../src/components/StatCard';
import { ActivityItem } from '../../src/components/ActivityItem';
import { QuickAction } from '../../src/components/QuickAction';
import { SearchBar } from '../../src/components/SearchBar';

interface DashboardMetrics {
  leads: number | string;
  deals: number | string;
  tasks: number | string;
  customers: number | string;
  supportRequests: number | string;
  quotations: number | string;
  openTasks: number | string;
  reminders: number | string;
}

export default function DashboardScreen() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileDropdownVisible, setProfileDropdownVisible] = useState(false);
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await apiClient.get('/dashboard/stats');
      if (res.data?.success) {
        setMetrics(res.data.data);
        console.log('[DashboardScreen] Dashboard data fetched successfully');
      }
    } catch (error: any) {
      console.log('[DashboardScreen] Error fetching dashboard data:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    console.log('[DashboardScreen] Manual refresh triggered');
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
    console.log('[DashboardScreen] Manual refresh completed');
  };

  const getMetric = (key: keyof DashboardMetrics) => {
    if (isLoading || !metrics) return '-';
    const val = metrics[key];
    return val !== undefined && val !== null ? val.toString() : '0';
  };

  if (isLoading && !metrics) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { paddingTop: insets.top }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      {/* 1. Top Header */}
      <View style={styles.header}>
        <View style={
          user?.email?.toLowerCase().includes('@lumossolution.com') || user?.email?.toLowerCase().includes('@gmail.com')
            ? styles.lumosLogoContainer
            : styles.logoContainer
        }>
          <Image 
            source={
              user?.email?.toLowerCase().includes('@lumossolution.com') || user?.email?.toLowerCase().includes('@gmail.com')
                ? require('../../assets/images/lumos-logo.png')
                : require('../../assets/images/logo.png')
            } 
            style={
              user?.email?.toLowerCase().includes('@lumossolution.com') || user?.email?.toLowerCase().includes('@gmail.com')
                ? styles.lumosLogo
                : styles.logo
            } 
          />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.name}>{user?.name || 'System Admin'}</Text>
          <Text style={styles.roleSmall}>{user?.role === 'admin' ? 'Admin' : 'User'}</Text>
        </View>
        <View style={styles.headerIconsRow}>
          <View style={styles.headerIcon}>
            <Feather name="bell" size={20} color={colors.textPrimary} />
          </View>
          <Pressable 
            style={[styles.headerIcon, { marginLeft: spacing.sm }]}
            onPress={() => setProfileDropdownVisible(true)}
          >
            <Feather name="user" size={20} color={colors.textPrimary} />
          </Pressable>
        </View>
      </View>

      {/* 2. Search Area */}
      <View style={styles.searchSection}>
        <View style={{ flex: 1 }}>
          <SearchBar 
            placeholder="Search" 
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              if (text.length % 3 === 0 && text.length > 0) {
                console.log('[DashboardScreen] Search query updated:', text);
              }
            }}
          />
        </View>
      </View>

      {/* 3. Quick Actions Section */}
      <View style={styles.section}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll} contentContainerStyle={{ paddingRight: 40 }}>
          <QuickAction title="Add Account" icon="user-plus" variant="primary" onPress={() => router.push('/accounts/new')} />
          <QuickAction title="Add Customer" icon="user" variant="secondary" onPress={() => console.log('[DashboardScreen] QuickAction clicked: Add Customer')} />
          <QuickAction title="Create Deal" icon="briefcase" variant="secondary" onPress={() => console.log('[DashboardScreen] QuickAction clicked: Create Deal')} />
          <QuickAction title="Create Reminder" icon="check-square" variant="secondary" onPress={() => console.log('[DashboardScreen] QuickAction clicked: Create Reminder')} />
        </ScrollView>
      </View>

      {/* 4. Unified Grid Section */}
      <View style={[styles.section, styles.lastSection]}>
        <View style={styles.grid}>
          <StatCard title="Accounts" value={getMetric('leads')} icon="user" onPress={() => router.push('/leads')} />
          <StatCard title="Deals" value={getMetric('deals')} icon="briefcase" onPress={() => router.push('/deals')} />
          <StatCard title="Reminders" value={getMetric('reminders')} icon="check-square" onPress={() => router.push('/reminders')} />
          <StatCard title="Customers" value={getMetric('customers')} icon="users" onPress={() => router.push('/customers')} />
          <StatCard title="Support Requests" value={getMetric('supportRequests')} icon="headphones" onPress={() => router.push('/support')} />
          <StatCard title="Quotations" value={getMetric('quotations')} icon="file-text" onPress={() => router.push('/quotations')} />
        </View>
      </View>

      {/* Profile Dropdown Modal */}
      <Modal
        visible={profileDropdownVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setProfileDropdownVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setProfileDropdownVisible(false)}
        >
          <View style={styles.dropdownMenu}>
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownName}>{user?.name || 'System Admin'}</Text>
              <Text style={styles.dropdownEmail}>{user?.email || 'admin@system.com'}</Text>
            </View>
            <View style={styles.dropdownDivider} />
            <TouchableOpacity 
              style={styles.dropdownItem}
              onPress={() => {
                setProfileDropdownVisible(false);
                logout();
              }}
            >
              <Feather name="log-out" size={18} color={colors.primary} />
              <Text style={styles.dropdownItemText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lumosLogoContainer: {
    width: 72,
    height: 48,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    resizeMode: 'contain',
    backgroundColor: 'transparent',
  },
  lumosLogo: {
    width: 72,
    height: 40,
    resizeMode: 'contain',
    backgroundColor: 'transparent',
  },
  headerText: {
    flex: 1,
  },
  greeting: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '400',
  },
  name: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  roleSmall: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: 'normal',
  },
  subtitle: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  headerIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchSection: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    alignItems: 'center',
  },
  quickAddButton: {
    width: 36,
    height: 36,
    backgroundColor: colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  lastSection: {
    marginBottom: spacing.xxl * 2,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: '-2%',
  },
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: '-2%',
  },
  horizontalScroll: {
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  dropdownMenu: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginTop: 80,
    marginRight: spacing.lg,
    width: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  dropdownHeader: {
    padding: spacing.md,
    backgroundColor: colors.background,
  },
  dropdownName: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  dropdownEmail: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  dropdownItemText: {
    ...typography.body,
    color: colors.primary,
    marginLeft: spacing.sm,
    fontWeight: '500',
  },
});
