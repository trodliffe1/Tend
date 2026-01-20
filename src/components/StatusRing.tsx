import React from 'react';
import { View, StyleSheet } from 'react-native';
import { HealthStatus } from '../types';
import { getHealthColor } from '../utils/helpers';

interface StatusRingProps {
  status: HealthStatus;
  percentage: number;
  size: number;
  strokeWidth?: number;
  children: React.ReactNode;
}

export default function StatusRing({
  status,
  percentage,
  size,
  strokeWidth = 3,
  children,
}: StatusRingProps) {
  const statusColor = getHealthColor(status);
  const ringSize = size + strokeWidth * 2;

  // Calculate the rotation angle for the progress indicator
  // percentage 100 = full circle, 0 = empty
  const progressDegrees = (percentage / 100) * 360;

  // For overdue status, show a pulsing/faded ring
  const ringOpacity = status === 'overdue' ? 0.5 : 1;

  return (
    <View style={[styles.container, { width: ringSize, height: ringSize }]}>
      {/* Background ring (track) */}
      <View
        style={[
          styles.ringBase,
          {
            width: ringSize,
            height: ringSize,
            borderRadius: ringSize / 2,
            borderWidth: strokeWidth,
            borderColor: statusColor + '30',
          },
        ]}
      />

      {/* Progress ring - using quadrant approach for smooth arc */}
      {percentage > 0 && (
        <View
          style={[
            styles.progressContainer,
            { width: ringSize, height: ringSize },
          ]}
        >
          {/* Top-right quadrant (0-90 degrees) */}
          <View style={[styles.quadrant, styles.topRight, { width: ringSize / 2, height: ringSize / 2 }]}>
            <View
              style={[
                styles.quadrantInner,
                {
                  width: ringSize,
                  height: ringSize,
                  borderRadius: ringSize / 2,
                  borderWidth: strokeWidth,
                  borderColor: 'transparent',
                  borderTopColor: progressDegrees >= 0 ? statusColor : 'transparent',
                  borderRightColor: progressDegrees >= 90 ? statusColor : 'transparent',
                  transform: [
                    { rotate: `${Math.min(progressDegrees, 90) - 90}deg` },
                  ],
                  opacity: ringOpacity,
                },
              ]}
            />
          </View>

          {/* Full progress arc using simpler approach */}
          <View
            style={[
              styles.ringProgress,
              {
                width: ringSize,
                height: ringSize,
                borderRadius: ringSize / 2,
                borderWidth: strokeWidth,
                borderColor: statusColor,
                borderRightColor: progressDegrees >= 90 ? statusColor : 'transparent',
                borderBottomColor: progressDegrees >= 180 ? statusColor : 'transparent',
                borderLeftColor: progressDegrees >= 270 ? statusColor : 'transparent',
                borderTopColor: progressDegrees > 0 ? statusColor : 'transparent',
                opacity: ringOpacity,
                transform: [{ rotate: '-90deg' }],
              },
            ]}
          />
        </View>
      )}

      {/* Inner content (avatar) */}
      <View style={[styles.content, { width: size, height: size, borderRadius: size / 2 }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  ringBase: {
    position: 'absolute',
  },
  progressContainer: {
    position: 'absolute',
    overflow: 'hidden',
  },
  quadrant: {
    position: 'absolute',
    overflow: 'hidden',
  },
  topRight: {
    top: 0,
    right: 0,
  },
  quadrantInner: {
    position: 'absolute',
  },
  ringProgress: {
    position: 'absolute',
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
});
