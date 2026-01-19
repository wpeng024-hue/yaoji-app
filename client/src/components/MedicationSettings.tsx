import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, Bell, BellOff, Sun, Sunset, Moon } from 'lucide-react';
import { MedicationIconComponent, AVAILABLE_ICONS } from './MedicationIcon';
import { UnitSelector } from './UnitSelector';
import { NumberPicker } from './NumberPicker';
import type { Medication } from '@shared/schema';

type MedicationIcon = 'pill' | 'capsule' | 'syringe' | 'droplet' | 'heart' | 'sun' | 'moon' | 'leaf' | 'zap' | 'shield' | 'activity' | 'thermometer';

const REMINDER_PERIODS = [
  { id: 'morning', label: '早', time: '08:00', icon: Sun },
  { id: 'noon', label: '午', time: '12:00', icon: Sunset },
  { id: 'evening', label: '晚', time: '20:00', icon: Moon },
] as const;

interface MedicationSettingsProps {
  medications: Medication[];
  onAdd: (medication: Omit<Medication, 'id' | 'createdAt' | 'order'>) => void;
  onUpdate: (id: string, updates: Partial<Medication>) => void;
  onDelete: (id: string) => void;
  startInAddMode?: boolean;
}

const COLORS: string[] = ['cyan', 'magenta', 'green', 'orange', 'purple', 'blue', 'yellow', 'red'];

const colorNames: Record<string, string> = {
  cyan: '青',
  magenta: '粉',
  green: '绿',
  orange: '橙',
  purple: '紫',
  blue: '蓝',
  yellow: '黄',
  red: '红',
};

const colorClasses: Record<string, string> = {
  cyan: 'bg-neon-cyan',
  magenta: 'bg-neon-magenta',
  green: 'bg-neon-green',
  orange: 'bg-neon-orange',
  purple: 'bg-neon-purple',
  blue: 'bg-neon-blue',
  yellow: 'bg-neon-yellow',
  red: 'bg-neon-red',
};

const colorIconBg: Record<string, string> = {
  cyan: 'bg-neon-cyan/20 text-neon-cyan',
  magenta: 'bg-neon-magenta/20 text-neon-magenta',
  green: 'bg-neon-green/20 text-neon-green',
  orange: 'bg-neon-orange/20 text-neon-orange',
  purple: 'bg-neon-purple/20 text-neon-purple',
  blue: 'bg-neon-blue/20 text-neon-blue',
  yellow: 'bg-neon-yellow/20 text-neon-yellow',
  red: 'bg-neon-red/20 text-neon-red',
};

function parseDosage(dosage: string): { amount: string; unit: string } {
  const match = dosage.match(/^([\d.]+)\s*(.*)$/);
  if (match) {
    return { amount: match[1], unit: match[2] || '片' };
  }
  return { amount: '', unit: '片' };
}

function formatFrequency(times: number, days: number): string {
  if (days === 1) {
    return `每日${times}次`;
  }
  return `${times}次/${days}天`;
}

export function MedicationSettings({
  medications,
  onAdd,
  onUpdate,
  onDelete,
  startInAddMode = false,
}: MedicationSettingsProps) {
  const [isAdding, setIsAdding] = useState(startInAddMode);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    dosageAmount: '1',
    dosageUnit: '片',
    timesPerDay: 1,
    daysInterval: 1,
    color: 'cyan' as Medication['color'],
    icon: 'pill' as MedicationIcon,
    reminderEnabled: false,
    reminderTimes: [] as string[],
  });

  const resetForm = () => {
    setFormData({
      name: '',
      dosageAmount: '1',
      dosageUnit: '片',
      timesPerDay: 1,
      daysInterval: 1,
      color: 'cyan',
      icon: 'pill',
      reminderEnabled: false,
      reminderTimes: [],
    });
  };

  const toggleReminderPeriod = (time: string) => {
    setFormData(prev => {
      const times = prev.reminderTimes.includes(time)
        ? prev.reminderTimes.filter(t => t !== time)
        : [...prev.reminderTimes, time];
      return {
        ...prev,
        reminderTimes: times,
        reminderEnabled: times.length > 0,
      };
    });
  };

  const handleAdd = () => {
    if (formData.name && formData.dosageAmount) {
      onAdd({
        name: formData.name,
        dosage: `${formData.dosageAmount}${formData.dosageUnit}`,
        timesPerDay: formData.timesPerDay,
        daysInterval: formData.daysInterval,
        color: formData.color,
        icon: formData.icon,
        reminderEnabled: formData.reminderEnabled,
        reminderTimes: formData.reminderTimes.length > 0 ? formData.reminderTimes : null,
      });
      resetForm();
      setIsAdding(false);
    }
  };

  const handleEdit = (medication: Medication) => {
    const { amount, unit } = parseDosage(medication.dosage);
    setEditingId(medication.id);
    setFormData({
      name: medication.name,
      dosageAmount: amount,
      dosageUnit: unit || '片',
      timesPerDay: medication.timesPerDay,
      daysInterval: medication.daysInterval || 1,
      color: medication.color,
      icon: medication.icon as MedicationIcon,
      reminderEnabled: medication.reminderEnabled || false,
      reminderTimes: medication.reminderTimes || [],
    });
  };

  const handleUpdate = () => {
    if (editingId && formData.name && formData.dosageAmount) {
      onUpdate(editingId, {
        name: formData.name,
        dosage: `${formData.dosageAmount}${formData.dosageUnit}`,
        timesPerDay: formData.timesPerDay,
        daysInterval: formData.daysInterval,
        color: formData.color,
        icon: formData.icon,
        reminderEnabled: formData.reminderEnabled,
        reminderTimes: formData.reminderTimes.length > 0 ? formData.reminderTimes : null,
      });
      resetForm();
      setEditingId(null);
    }
  };

  const handleCancel = () => {
    resetForm();
    setIsAdding(false);
    setEditingId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        {!isAdding && !editingId && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-neon-orange/10 text-neon-orange font-medium hover:bg-neon-orange/20 transition-colors active:bg-neon-orange/30"
            data-testid="button-add-medication"
          >
            <Plus className="w-5 h-5" />
            添加药物
          </button>
        )}
      </div>

      <AnimatePresence mode="popLayout">
        {(isAdding || editingId) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="glass-card rounded-2xl p-5 overflow-hidden"
          >
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">药物名称</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例如：维生素D"
                  className="w-full px-4 py-3 bg-muted/50 rounded-xl border border-border focus:border-neon-orange focus:outline-none transition-colors"
                  data-testid="input-medication-name"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">默认剂量</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={formData.dosageAmount}
                    onChange={(e) => setFormData({ ...formData, dosageAmount: e.target.value })}
                    placeholder="数量"
                    className="w-24 px-4 py-3 bg-muted/50 rounded-xl border border-border focus:border-neon-orange focus:outline-none transition-colors text-center"
                    data-testid="input-medication-dosage-amount"
                  />
                  <div className="flex-1">
                    <UnitSelector
                      value={formData.dosageUnit}
                      onChange={(unit) => setFormData({ ...formData, dosageUnit: unit })}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-3 block text-center">服用次数</label>
                <div className="glass rounded-2xl p-4">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="font-display text-2xl font-bold text-neon-orange">
                      {formData.timesPerDay}
                    </span>
                    <span className="text-muted-foreground">次</span>
                    <span className="text-muted-foreground mx-1">/</span>
                    <span className="font-display text-2xl font-bold text-neon-cyan">
                      {formData.daysInterval}
                    </span>
                    <span className="text-muted-foreground">天</span>
                  </div>
                  <div className="flex justify-center gap-6">
                    <NumberPicker
                      value={formData.timesPerDay}
                      onChange={(val) => setFormData({ ...formData, timesPerDay: val })}
                      min={1}
                      max={10}
                      label="次数"
                    />
                    <NumberPicker
                      value={formData.daysInterval}
                      onChange={(val) => setFormData({ ...formData, daysInterval: val })}
                      min={1}
                      max={10}
                      label="天数"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">图标</label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_ICONS.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setFormData({ ...formData, icon: value })}
                      className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                        formData.icon === value
                          ? 'bg-neon-orange/20 ring-2 ring-neon-orange text-neon-orange'
                          : 'bg-muted/50 hover:bg-muted text-muted-foreground'
                      }`}
                      title={label}
                      data-testid={`button-icon-${value}`}
                    >
                      <MedicationIconComponent icon={value} size={20} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">颜色</label>
                <div className="grid grid-cols-8 gap-1.5">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setFormData({ ...formData, color })}
                      className={`py-2 rounded-lg flex flex-col items-center gap-1 transition-all ${
                        formData.color === color
                          ? 'bg-muted ring-2 ring-neon-orange'
                          : 'bg-muted/50 hover:bg-muted'
                      }`}
                      data-testid={`button-color-${color}`}
                    >
                      <div className={`w-5 h-5 rounded-full ${colorClasses[color]}`} />
                      <span className="text-xs">{colorNames[color]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm text-muted-foreground flex items-center gap-2">
                    {formData.reminderEnabled ? (
                      <Bell className="w-4 h-4 text-neon-cyan" />
                    ) : (
                      <BellOff className="w-4 h-4" />
                    )}
                    轻提醒
                    <span className="text-xs opacity-60">(可选)</span>
                  </label>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {REMINDER_PERIODS.map(({ id, label, time, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => toggleReminderPeriod(time)}
                      className={`py-3 rounded-xl flex flex-col items-center gap-1.5 transition-all ${
                        formData.reminderTimes.includes(time)
                          ? 'bg-neon-cyan/20 ring-2 ring-neon-cyan text-neon-cyan'
                          : 'bg-muted/50 hover:bg-muted text-muted-foreground'
                      }`}
                      data-testid={`button-reminder-${id}`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{label}</span>
                      <span className="text-xs opacity-70">{time}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onPointerUp={handleCancel}
                  className="flex-1 py-3.5 rounded-xl border border-border text-muted-foreground hover:bg-muted/30 transition-colors active:bg-muted/50 touch-manipulation select-none cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  onPointerUp={editingId ? handleUpdate : handleAdd}
                  className="flex-1 py-3.5 rounded-xl bg-neon-orange text-background font-medium active:opacity-80 touch-manipulation select-none cursor-pointer"
                  data-testid="button-save-medication"
                >
                  {editingId ? '保存' : '添加'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {medications.map((medication) => (
          <motion.div
            key={medication.id}
            layout
            className="glass-card rounded-xl p-4 flex items-center gap-4"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorIconBg[medication.color]}`}>
              <MedicationIconComponent icon={medication.icon} size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-medium truncate">{medication.name}</h4>
                {medication.reminderEnabled && (
                  <Bell className="w-3.5 h-3.5 text-neon-cyan flex-shrink-0" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {medication.dosage} · {formatFrequency(medication.timesPerDay, medication.daysInterval || 1)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleEdit(medication)}
                className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                data-testid={`button-edit-medication-${medication.id}`}
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(medication.id)}
                className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive hover:bg-destructive/20 transition-colors"
                data-testid={`button-delete-medication-${medication.id}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {medications.length === 0 && !isAdding && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="mb-2">还没有添加任何药物</p>
          <p className="text-sm">点击上方按钮添加第一个药物</p>
        </div>
      )}
    </div>
  );
}
