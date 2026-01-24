import React from 'react';
import Svg, { Path, Rect, Circle, Line, Polygon, G } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  style?: object;
}

const DEFAULT_COLOR = '#22CC22';
const DEFAULT_SIZE = 24;

// Navigation Icons

export function SatelliteIcon({ size = DEFAULT_SIZE, color = DEFAULT_COLOR, style }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      {/* Satellite body */}
      <Rect x="9" y="9" width="6" height="6" stroke={color} strokeWidth="2" />
      {/* Solar panels */}
      <Rect x="2" y="10" width="5" height="4" stroke={color} strokeWidth="2" />
      <Rect x="17" y="10" width="5" height="4" stroke={color} strokeWidth="2" />
      {/* Signal arcs */}
      <Path d="M4 4 L6 6" stroke={color} strokeWidth="2" />
      <Path d="M2 7 L4 7" stroke={color} strokeWidth="2" />
      <Path d="M7 2 L7 4" stroke={color} strokeWidth="2" />
    </Svg>
  );
}

export function HeartsIcon({ size = DEFAULT_SIZE, color = DEFAULT_COLOR, style }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      {/* First heart (back) */}
      <Path
        d="M7 5 L4 8 L7 11 L10 8 L7 5"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="miter"
      />
      <Path
        d="M10 5 L7 8"
        stroke={color}
        strokeWidth="2"
      />
      {/* Second heart (front) */}
      <Path
        d="M14 9 L11 12 L14 19 L17 12 L20 15 L17 12 L14 9"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="miter"
      />
      <Path
        d="M14 9 L11 12 L14 19 L17 12 L20 9 L17 12"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="miter"
      />
    </Svg>
  );
}

export function GearIcon({ size = DEFAULT_SIZE, color = DEFAULT_COLOR, style }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      {/* Hexagonal gear */}
      <Path
        d="M12 2 L14 4 L14 6 L16 7 L18 6 L20 8 L19 10 L20 12 L19 14 L20 16 L18 18 L16 17 L14 18 L14 20 L12 22 L10 20 L10 18 L8 17 L6 18 L4 16 L5 14 L4 12 L5 10 L4 8 L6 6 L8 7 L10 6 L10 4 Z"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="miter"
      />
      {/* Inner circle */}
      <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" />
    </Svg>
  );
}

// Interaction Type Icons

export function ChatIcon({ size = DEFAULT_SIZE, color = DEFAULT_COLOR, style }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      {/* Angular speech bubble */}
      <Path
        d="M4 4 L20 4 L20 14 L12 14 L8 18 L8 14 L4 14 Z"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="miter"
      />
      {/* Message lines */}
      <Line x1="7" y1="8" x2="17" y2="8" stroke={color} strokeWidth="2" />
      <Line x1="7" y1="11" x2="14" y2="11" stroke={color} strokeWidth="2" />
    </Svg>
  );
}

export function PhoneIcon({ size = DEFAULT_SIZE, color = DEFAULT_COLOR, style }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      {/* Angular phone handset */}
      <Path
        d="M5 3 L9 3 L10 7 L7 10 L7 14 L10 17 L14 17 L17 14 L21 15 L21 19 L19 21 L5 21 L3 19 L3 5 Z"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="miter"
      />
      <Path
        d="M14 3 L14 10 L21 10"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="miter"
      />
    </Svg>
  );
}

export function HandshakeIcon({ size = DEFAULT_SIZE, color = DEFAULT_COLOR, style }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      {/* Two hands meeting */}
      <Path
        d="M2 11 L6 7 L10 11 L12 9"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="miter"
      />
      <Path
        d="M22 11 L18 7 L14 11 L12 9"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="miter"
      />
      <Path
        d="M6 15 L10 11"
        stroke={color}
        strokeWidth="2"
      />
      <Path
        d="M18 15 L14 11"
        stroke={color}
        strokeWidth="2"
      />
      {/* Arms */}
      <Line x1="2" y1="11" x2="2" y2="17" stroke={color} strokeWidth="2" />
      <Line x1="22" y1="11" x2="22" y2="17" stroke={color} strokeWidth="2" />
    </Svg>
  );
}

export function CoupleIcon({ size = DEFAULT_SIZE, color = DEFAULT_COLOR, style }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      {/* First person */}
      <Circle cx="7" cy="5" r="2" stroke={color} strokeWidth="2" />
      <Line x1="7" y1="7" x2="7" y2="14" stroke={color} strokeWidth="2" />
      <Line x1="4" y1="10" x2="10" y2="10" stroke={color} strokeWidth="2" />
      <Path d="M7 14 L4 20" stroke={color} strokeWidth="2" />
      <Path d="M7 14 L10 20" stroke={color} strokeWidth="2" />
      {/* Second person */}
      <Circle cx="17" cy="5" r="2" stroke={color} strokeWidth="2" />
      <Line x1="17" y1="7" x2="17" y2="14" stroke={color} strokeWidth="2" />
      <Line x1="14" y1="10" x2="20" y2="10" stroke={color} strokeWidth="2" />
      <Path d="M17 14 L14 20" stroke={color} strokeWidth="2" />
      <Path d="M17 14 L20 20" stroke={color} strokeWidth="2" />
    </Svg>
  );
}

// Date/Milestone Icons

export function CakeIcon({ size = DEFAULT_SIZE, color = DEFAULT_COLOR, style }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      {/* Cake tiers */}
      <Rect x="3" y="14" width="18" height="6" stroke={color} strokeWidth="2" />
      <Rect x="5" y="10" width="14" height="4" stroke={color} strokeWidth="2" />
      {/* Candle */}
      <Line x1="12" y1="6" x2="12" y2="10" stroke={color} strokeWidth="2" />
      {/* Flame */}
      <Path d="M12 3 L10 6 L12 5 L14 6 Z" stroke={color} strokeWidth="1.5" fill="none" />
    </Svg>
  );
}

export function RingIcon({ size = DEFAULT_SIZE, color = DEFAULT_COLOR, style }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      {/* Diamond */}
      <Path
        d="M12 3 L8 8 L12 13 L16 8 Z"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="miter"
      />
      {/* Band */}
      <Path
        d="M6 12 Q6 20 12 20 Q18 20 18 12"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />
      <Line x1="6" y1="12" x2="8" y2="8" stroke={color} strokeWidth="2" />
      <Line x1="18" y1="12" x2="16" y2="8" stroke={color} strokeWidth="2" />
    </Svg>
  );
}

// Date Night Category Icons

export function DiceIcon({ size = DEFAULT_SIZE, color = DEFAULT_COLOR, style }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      {/* Isometric cube */}
      <Path
        d="M12 2 L22 7 L22 17 L12 22 L2 17 L2 7 Z"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="miter"
      />
      <Line x1="12" y1="2" x2="12" y2="22" stroke={color} strokeWidth="2" />
      <Line x1="2" y1="7" x2="12" y2="12" stroke={color} strokeWidth="2" />
      <Line x1="22" y1="7" x2="12" y2="12" stroke={color} strokeWidth="2" />
      {/* Dots */}
      <Circle cx="7" cy="14" r="1" fill={color} />
      <Circle cx="17" cy="14" r="1" fill={color} />
      <Circle cx="12" cy="7" r="1" fill={color} />
    </Svg>
  );
}

export function HouseIcon({ size = DEFAULT_SIZE, color = DEFAULT_COLOR, style }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      {/* Roof */}
      <Path
        d="M3 11 L12 4 L21 11"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="miter"
      />
      {/* Walls */}
      <Path
        d="M5 10 L5 20 L19 20 L19 10"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="miter"
      />
      {/* Door */}
      <Rect x="10" y="14" width="4" height="6" stroke={color} strokeWidth="2" />
    </Svg>
  );
}

export function CityIcon({ size = DEFAULT_SIZE, color = DEFAULT_COLOR, style }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      {/* Buildings */}
      <Rect x="3" y="10" width="5" height="10" stroke={color} strokeWidth="2" />
      <Rect x="10" y="4" width="5" height="16" stroke={color} strokeWidth="2" />
      <Rect x="17" y="8" width="4" height="12" stroke={color} strokeWidth="2" />
      {/* Windows */}
      <Line x1="5" y1="13" x2="6" y2="13" stroke={color} strokeWidth="2" />
      <Line x1="5" y1="17" x2="6" y2="17" stroke={color} strokeWidth="2" />
      <Line x1="12" y1="7" x2="13" y2="7" stroke={color} strokeWidth="2" />
      <Line x1="12" y1="11" x2="13" y2="11" stroke={color} strokeWidth="2" />
      <Line x1="12" y1="15" x2="13" y2="15" stroke={color} strokeWidth="2" />
    </Svg>
  );
}

export function MountainIcon({ size = DEFAULT_SIZE, color = DEFAULT_COLOR, style }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      {/* Two peaks */}
      <Path
        d="M2 20 L8 8 L11 12 L15 4 L22 20 Z"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="miter"
      />
      {/* Snow cap */}
      <Path
        d="M15 4 L13 8 L15 7 L17 8 Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="miter"
      />
    </Svg>
  );
}

export function LightningIcon({ size = DEFAULT_SIZE, color = DEFAULT_COLOR, style }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      {/* Zigzag bolt */}
      <Path
        d="M13 2 L6 12 L11 12 L10 22 L18 10 L13 10 Z"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="miter"
      />
    </Svg>
  );
}

// Feature Icons

export function SignalIcon({ size = DEFAULT_SIZE, color = DEFAULT_COLOR, style }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      {/* Signal point */}
      <Circle cx="4" cy="20" r="2" stroke={color} strokeWidth="2" />
      {/* Concentric arcs */}
      <Path d="M8 16 Q12 16 12 20" stroke={color} strokeWidth="2" fill="none" />
      <Path d="M12 12 Q18 12 18 20" stroke={color} strokeWidth="2" fill="none" />
      <Path d="M16 8 Q24 8 24 20" stroke={color} strokeWidth="2" fill="none" />
    </Svg>
  );
}

export function BellIcon({ size = DEFAULT_SIZE, color = DEFAULT_COLOR, style }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      {/* Bell body */}
      <Path
        d="M6 10 L6 14 L4 17 L20 17 L18 14 L18 10 Q18 4 12 4 Q6 4 6 10"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="miter"
      />
      {/* Clapper */}
      <Path d="M10 17 Q10 21 12 21 Q14 21 14 17" stroke={color} strokeWidth="2" />
      {/* Top */}
      <Line x1="12" y1="2" x2="12" y2="4" stroke={color} strokeWidth="2" />
    </Svg>
  );
}

export function NoteIcon({ size = DEFAULT_SIZE, color = DEFAULT_COLOR, style }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      {/* Paper */}
      <Path
        d="M4 2 L16 2 L20 6 L20 22 L4 22 Z"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="miter"
      />
      {/* Corner fold */}
      <Path d="M16 2 L16 6 L20 6" stroke={color} strokeWidth="2" strokeLinejoin="miter" />
      {/* Lines */}
      <Line x1="7" y1="10" x2="17" y2="10" stroke={color} strokeWidth="2" />
      <Line x1="7" y1="14" x2="17" y2="14" stroke={color} strokeWidth="2" />
      <Line x1="7" y1="18" x2="13" y2="18" stroke={color} strokeWidth="2" />
    </Svg>
  );
}

export function LockIcon({ size = DEFAULT_SIZE, color = DEFAULT_COLOR, style }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      {/* Shackle */}
      <Path
        d="M7 10 L7 7 Q7 3 12 3 Q17 3 17 7 L17 10"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />
      {/* Body */}
      <Rect x="5" y="10" width="14" height="10" stroke={color} strokeWidth="2" />
      {/* Keyhole */}
      <Circle cx="12" cy="15" r="2" stroke={color} strokeWidth="2" />
      <Line x1="12" y1="17" x2="12" y2="18" stroke={color} strokeWidth="2" />
    </Svg>
  );
}

export function BrainIcon({ size = DEFAULT_SIZE, color = DEFAULT_COLOR, style }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      {/* Brain outline */}
      <Path
        d="M12 3 Q6 3 5 8 Q3 9 3 12 Q3 15 5 16 Q5 20 9 21 L12 21 L15 21 Q19 20 19 16 Q21 15 21 12 Q21 9 19 8 Q18 3 12 3"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />
      {/* Center divide */}
      <Line x1="12" y1="3" x2="12" y2="21" stroke={color} strokeWidth="2" />
      {/* Circuit lines */}
      <Path d="M8 8 L10 10 L8 12" stroke={color} strokeWidth="1.5" />
      <Path d="M16 8 L14 10 L16 12" stroke={color} strokeWidth="1.5" />
      <Path d="M8 15 L10 15" stroke={color} strokeWidth="1.5" />
      <Path d="M14 15 L16 15" stroke={color} strokeWidth="1.5" />
    </Svg>
  );
}

export function CalendarIcon({ size = DEFAULT_SIZE, color = DEFAULT_COLOR, style }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      {/* Calendar body */}
      <Rect x="3" y="5" width="18" height="16" stroke={color} strokeWidth="2" />
      {/* Header bar */}
      <Line x1="3" y1="9" x2="21" y2="9" stroke={color} strokeWidth="2" />
      {/* Hooks */}
      <Line x1="7" y1="3" x2="7" y2="7" stroke={color} strokeWidth="2" />
      <Line x1="17" y1="3" x2="17" y2="7" stroke={color} strokeWidth="2" />
      {/* Grid */}
      <Line x1="7" y1="13" x2="9" y2="13" stroke={color} strokeWidth="2" />
      <Line x1="11" y1="13" x2="13" y2="13" stroke={color} strokeWidth="2" />
      <Line x1="15" y1="13" x2="17" y2="13" stroke={color} strokeWidth="2" />
      <Line x1="7" y1="17" x2="9" y2="17" stroke={color} strokeWidth="2" />
      <Line x1="11" y1="17" x2="13" y2="17" stroke={color} strokeWidth="2" />
    </Svg>
  );
}

// Map of icon names to components for easy lookup
export const IconMap = {
  satellite: SatelliteIcon,
  hearts: HeartsIcon,
  gear: GearIcon,
  chat: ChatIcon,
  phone: PhoneIcon,
  handshake: HandshakeIcon,
  couple: CoupleIcon,
  cake: CakeIcon,
  ring: RingIcon,
  dice: DiceIcon,
  house: HouseIcon,
  city: CityIcon,
  mountain: MountainIcon,
  lightning: LightningIcon,
  signal: SignalIcon,
  bell: BellIcon,
  note: NoteIcon,
  lock: LockIcon,
  brain: BrainIcon,
  calendar: CalendarIcon,
};
