import { 
  Pill, 
  Tablets,
  Syringe, 
  Droplet, 
  Heart, 
  Sun, 
  Moon, 
  Leaf, 
  Zap, 
  Shield, 
  Activity, 
  Thermometer,
  type LucideIcon
} from 'lucide-react';
import type { MedicationIcon as IconType } from '@shared/schema';

const iconMap: Record<IconType, LucideIcon> = {
  pill: Pill,
  capsule: Tablets,
  syringe: Syringe,
  droplet: Droplet,
  heart: Heart,
  sun: Sun,
  moon: Moon,
  leaf: Leaf,
  zap: Zap,
  shield: Shield,
  activity: Activity,
  thermometer: Thermometer,
};

interface MedicationIconProps {
  icon: IconType;
  className?: string;
  size?: number;
}

export function MedicationIconComponent({ icon, className, size = 24 }: MedicationIconProps) {
  const IconComponent = iconMap[icon] || Pill;
  return <IconComponent className={className} size={size} />;
}

export const AVAILABLE_ICONS: { value: IconType; label: string }[] = [
  { value: 'pill', label: '药片' },
  { value: 'capsule', label: '胶囊' },
  { value: 'syringe', label: '注射' },
  { value: 'droplet', label: '滴剂' },
  { value: 'heart', label: '心脏' },
  { value: 'sun', label: '日间' },
  { value: 'moon', label: '夜间' },
  { value: 'leaf', label: '草本' },
  { value: 'zap', label: '能量' },
  { value: 'shield', label: '防护' },
  { value: 'activity', label: '活力' },
  { value: 'thermometer', label: '体温' },
];
