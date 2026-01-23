import React from 'react';
import { View, StyleSheet } from 'react-native';
import { HealthStatus } from '../types';
import { getHealthColor } from '../utils/helpers';

interface HealthBarProps {
  status: HealthStatus;
  percentage: number;
  height?: number;
  width?: number;
}

export default function HealthBar({
  status,
  percentage,
  height = 48,
  width = 6,
}: HealthBarProps) {
  const statusColor = getHealthColor(status);
  const fillHeight = Math.max(0, Math.min(100, percentage));

  // For overdue status, show pulsing effect
  const barOpacity = status === 'overdue' ? 0.6 : 1;

  return (
    <View style={[styles.container, { height, width, borderRadius: 0 }]}>
      {/* Background track */}
      <View
        style={[
          styles.track,
          {
            backgroundColor: '#000000',
            borderRadius: 0,
            borderWidth: 2,
            borderColor: statusColor,
          }
        ]}
      />

      {/* Fill bar - grows from bottom */}
      <View
        style={[
          styles.fill,
          {
            backgroundColor: statusColor,
            height: `${fillHeight}%`,
            borderRadius: 0,
            opacity: barOpacity,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  track: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  fill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});
