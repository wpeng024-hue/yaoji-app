import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, ChevronDown, Check } from 'lucide-react';
import { MedicationIconComponent } from './MedicationIcon';
import type { Medication } from '@shared/schema';

interface CalendarFilterProps {
  medications: Medication[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

const colorClasses: Record<Medication['color'], string> = {
  cyan: 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30',
  magenta: 'bg-neon-magenta/20 text-neon-magenta border-neon-magenta/30',
  green: 'bg-neon-green/20 text-neon-green border-neon-green/30',
  orange: 'bg-neon-orange/20 text-neon-orange border-neon-orange/30',
  purple: 'bg-neon-purple/20 text-neon-purple border-neon-purple/30',
  blue: 'bg-neon-blue/20 text-neon-blue border-neon-blue/30',
};

const dotColors: Record<Medication['color'], string> = {
  cyan: 'bg-neon-cyan',
  magenta: 'bg-neon-magenta',
  green: 'bg-neon-green',
  orange: 'bg-neon-orange',
  purple: 'bg-neon-purple',
  blue: 'bg-neon-blue',
};

export function CalendarFilter({
  medications,
  selectedIds,
  onSelectionChange,
}: CalendarFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const allSelected = selectedIds.length === medications.length;
  const noneSelected = selectedIds.length === 0;

  const toggleMedication = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((i) => i !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const selectAll = () => {
    onSelectionChange(medications.map((m) => m.id));
  };

  const selectedMeds = medications.filter((m) => selectedIds.includes(m.id));

  return (
    <div className="mb-4">
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-xl transition-all
          ${isExpanded ? 'bg-muted/50' : 'bg-muted/30 hover:bg-muted/50'}
        `}
        data-testid="button-toggle-filter"
      >
        <Filter className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          {allSelected ? '全部药物' : noneSelected ? '未选择' : `已选 ${selectedIds.length} 种`}
        </span>
        {!isExpanded && selectedMeds.length > 0 && selectedMeds.length < medications.length && (
          <div className="flex items-center gap-1 ml-1">
            {selectedMeds.slice(0, 3).map((med) => (
              <div
                key={med.id}
                className={`w-2.5 h-2.5 rounded-full ${dotColors[med.color]}`}
              />
            ))}
            {selectedMeds.length > 3 && (
              <span className="text-xs text-muted-foreground">+{selectedMeds.length - 3}</span>
            )}
          </div>
        )}
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-3 space-y-2">
              <button
                onClick={selectAll}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left
                  ${allSelected ? 'bg-neon-orange/10 border border-neon-orange/30' : 'bg-muted/30 hover:bg-muted/50 border border-transparent'}
                `}
                data-testid="button-select-all"
              >
                <div className={`
                  w-5 h-5 rounded-md flex items-center justify-center border transition-all
                  ${allSelected ? 'bg-neon-orange border-neon-orange' : 'border-muted-foreground/50'}
                `}>
                  {allSelected && <Check className="w-3.5 h-3.5 text-background" />}
                </div>
                <span className={`text-sm font-medium ${allSelected ? 'text-neon-orange' : 'text-foreground'}`}>
                  全选
                </span>
              </button>

              <div className="flex flex-wrap gap-2">
                {medications.map((med) => {
                  const isSelected = selectedIds.includes(med.id);
                  return (
                    <motion.button
                      key={med.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleMedication(med.id)}
                      className={`
                        flex items-center gap-2 px-3 py-2 rounded-xl transition-all border
                        ${isSelected ? colorClasses[med.color] : 'bg-muted/30 border-transparent text-muted-foreground hover:bg-muted/50'}
                      `}
                      data-testid={`button-filter-${med.id}`}
                    >
                      <div className={`
                        w-5 h-5 rounded-md flex items-center justify-center transition-all
                        ${isSelected ? `${dotColors[med.color]}` : 'bg-muted/50'}
                      `}>
                        {isSelected ? (
                          <Check className="w-3.5 h-3.5 text-background" />
                        ) : (
                          <MedicationIconComponent icon={med.icon} size={12} className="text-muted-foreground" />
                        )}
                      </div>
                      <span className="text-sm font-medium">{med.name}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
