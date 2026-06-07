import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Bell, Truck, Activity } from 'lucide-react-native';
import api from '../api/api';

const DashboardScreen = () => {
  const { logout, userId } = useContext(AuthContext);
  const [dashboardData, setDashboardData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [dashRes, notifRes] = await Promise.all([
        api.get(`/dashboard?ownerId=${userId}`),
        api.get(`/notifications?ownerId=${userId}`)
      ]);
      setDashboardData(dashRes.data);
      setNotifications(notifRes.data);
    } catch (err) {
      console.log('Error fetching data', err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>SÜRÜCÜ OPS</Text>
          <Text style={styles.headerSubtitle}>Kontrol Paneli</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <LogOut color="#ff4b4b" size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00d4ff" />}
      >
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Truck color="#00d4ff" size={24} />
            <Text style={styles.statValue}>{dashboardData?.totalFleet || 0}</Text>
            <Text style={styles.statLabel}>ARAÇLAR</Text>
          </View>
          <View style={styles.statCard}>
            <Bell color="#00d4ff" size={24} />
            <Text style={styles.statValue}>{dashboardData?.unreadIntel || 0}</Text>
            <Text style={styles.statLabel}>BİLDİRİM</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Activity color="#00d4ff" size={20} />
            <Text style={styles.sectionTitle}>SON BİLDİRİMLER</Text>
          </View>

          {notifications.length > 0 ? (
            notifications.map((notif, index) => (
              <View key={index} style={[styles.notifCard, notif.isRead && styles.notifCardRead]}>
                <Text style={styles.notifDriver}>{notif.driver}</Text>
                <Text style={styles.notifMessage}>{notif.message}</Text>
                <Text style={styles.notifDate}>{notif.date}</Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Henüz bildirim yok.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e17',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#121826',
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  headerTitle: {
    color: '#00d4ff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  headerSubtitle: {
    color: '#a0a0b0',
    fontSize: 12,
  },
  logoutBtn: {
    padding: 8,
    backgroundColor: 'rgba(255, 75, 75, 0.1)',
    borderRadius: 8,
  },
  scrollContent: {
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#121826',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  statValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    color: '#a0a0b0',
    fontSize: 10,
    marginTop: 4,
    letterSpacing: 1,
  },
  section: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    letterSpacing: 1,
  },
  notifCard: {
    backgroundColor: 'rgba(0, 212, 255, 0.05)',
    borderLeftWidth: 3,
    borderLeftColor: '#00d4ff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  notifCardRead: {
    backgroundColor: '#121826',
    borderLeftColor: '#4b5563',
    opacity: 0.7,
  },
  notifDriver: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 4,
  },
  notifMessage: {
    color: '#d1d5db',
    fontSize: 14,
    lineHeight: 20,
  },
  notifDate: {
    color: '#6b7280',
    fontSize: 11,
    marginTop: 8,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#6b7280',
  },
});

export default DashboardScreen;
