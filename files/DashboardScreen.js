// src/screens/dashboard/DashboardScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import CustomerService from '../../services/customerService';
import LoanService from '../../services/loanService';
import PaymentService from '../../services/paymentService';

const DashboardScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    customers: {},
    loans: {},
    payments: {},
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [customerStats, loanStats, paymentStats] = await Promise.all([
        CustomerService.getCustomerStats(),
        LoanService.getLoanStats(),
        PaymentService.getPaymentStats(),
      ]);

      setStats({
        customers: customerStats.success ? customerStats.stats : {},
        loans: loanStats.success ? loanStats.stats : {},
        payments: paymentStats.success ? paymentStats.stats : {},
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchDashboardData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const StatCard = ({ title, value, subtitle, color, onPress }) => (
    <TouchableOpacity
      style={[styles.statCard, { borderTopColor: color }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#1e3a8a" />
          <Text style={styles.loaderText}>Loading Dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSubtitle}>Finance Management System</Text>
        </View>

        {/* Customer Stats Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Overview</Text>
          <View style={styles.cardsGrid}>
            <StatCard
              title="Total Customers"
              value={stats.customers.totalCustomers || 0}
              subtitle="Registered"
              color="#0ea5e9"
              onPress={() => navigation.navigate('Customers')}
            />
            <StatCard
              title="Active Customers"
              value={stats.customers.activeCustomers || 0}
              subtitle="Currently Active"
              color="#10b981"
              onPress={() => navigation.navigate('Customers')}
            />
            <StatCard
              title="KYC Verified"
              value={stats.customers.kycVerified || 0}
              subtitle="Documents Verified"
              color="#8b5cf6"
              onPress={() => navigation.navigate('Customers')}
            />
            <StatCard
              title="Blocked Customers"
              value={stats.customers.blockedCustomers || 0}
              subtitle="Account Blocked"
              color="#ef4444"
              onPress={() => navigation.navigate('Customers')}
            />
          </View>
        </View>

        {/* Loan Stats Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Loan Management</Text>
          <View style={styles.cardsGrid}>
            <StatCard
              title="Total Loans"
              value={stats.loans.totalLoans || 0}
              subtitle="All Loans"
              color="#0ea5e9"
              onPress={() => navigation.navigate('Loans')}
            />
            <StatCard
              title="Approved"
              value={stats.loans.approvedLoans || 0}
              subtitle="Awaiting Disbursement"
              color="#10b981"
              onPress={() => navigation.navigate('Loans')}
            />
            <StatCard
              title="Active Loans"
              value={stats.loans.activeLoans || 0}
              subtitle="Currently Active"
              color="#8b5cf6"
              onPress={() => navigation.navigate('Loans')}
            />
            <StatCard
              title="Closed Loans"
              value={stats.loans.closedLoans || 0}
              subtitle="Repaid"
              color="#10b981"
              onPress={() => navigation.navigate('Loans')}
            />
          </View>
        </View>

        {/* Financial Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial Summary</Text>
          <View style={styles.summaryCards}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Total Disbursed</Text>
              <Text style={styles.summaryValue}>
                ₹{(stats.loans.totalDisbursed || 0).toLocaleString('en-IN')}
              </Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Total Repaid</Text>
              <Text style={[styles.summaryValue, { color: '#10b981' }]}>
                ₹{(stats.loans.totalRepaid || 0).toLocaleString('en-IN')}
              </Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Pending Amount</Text>
              <Text style={[styles.summaryValue, { color: '#f59e0b' }]}>
                ₹{(stats.loans.pendingAmount || 0).toLocaleString('en-IN')}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Statistics</Text>
          <View style={styles.cardsGrid}>
            <StatCard
              title="Total Payments"
              value={stats.payments.totalPayments || 0}
              subtitle="Recorded"
              color="#0ea5e9"
              onPress={() => navigation.navigate('Payments')}
            />
            <StatCard
              title="Completed"
              value={stats.payments.completedPayments || 0}
              subtitle="Successful"
              color="#10b981"
              onPress={() => navigation.navigate('Payments')}
            />
            <StatCard
              title="Total Amount"
              value={`₹${(stats.payments.totalAmount || 0).toLocaleString('en-IN')}`}
              subtitle="Received"
              color="#8b5cf6"
              onPress={() => navigation.navigate('Payments')}
            />
            <StatCard
              title="Avg Payment"
              value={`₹${(stats.payments.avgPaymentAmount || 0).toLocaleString('en-IN')}`}
              subtitle="Per Transaction"
              color="#f59e0b"
              onPress={() => navigation.navigate('Payments')}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('AddCustomer')}
            >
              <Text style={styles.actionButtonText}>+ Add Customer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('AddLoan')}
            >
              <Text style={styles.actionButtonText}>+ New Loan</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('RecordPayment')}
            >
              <Text style={styles.actionButtonText}>+ Record Payment</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Loans')}
            >
              <Text style={styles.actionButtonText}>⚠️ Pending Approvals</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  scrollView: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#1e3a8a',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#cbd5e1',
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  cardsGrid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderTopWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  statTitle: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 8,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 11,
    color: '#94a3b8',
  },
  summaryCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 14,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#1e3a8a',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default DashboardScreen;
