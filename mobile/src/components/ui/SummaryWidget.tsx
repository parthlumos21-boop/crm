import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export type SummaryWidgetProps = {
  title: string;
  totalCount: number;
  metrics: { label: string; value: number }[];
};

export const SummaryWidget: React.FC<SummaryWidgetProps> = ({ title, totalCount, metrics }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      
      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total {title}</Text>
        <Text style={styles.totalValue}>{totalCount.toLocaleString()}</Text>
      </View>
      
      {metrics && metrics.length > 0 && (
        <View style={styles.metricsContainer}>
          {metrics.map((metric, index) => (
            <View key={index} style={styles.metricItem}>
              <Text style={styles.metricLabel}>{metric.label}</Text>
              <Text style={styles.metricValue}>{metric.value.toLocaleString()}</Text>
              {index < metrics.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    marginHorizontal: 16,
    marginTop: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 8,
  },
  totalContainer: {
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 2,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#C62828',
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderTopWidth: 1,
    borderTopColor: '#edf2f7',
    paddingTop: 10,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 6,
  },
  metricLabel: {
    fontSize: 12,
    color: '#4a5568',
    marginRight: 6,
  },
  metricValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2d3748',
  },
  divider: {
    height: 10,
    width: 1,
    backgroundColor: '#cbd5e0',
    marginLeft: 10,
  }
});
