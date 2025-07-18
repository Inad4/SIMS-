import { Equipment, EquipmentCondition } from "@/types/equipment";

export const getConditionColor = (condition: EquipmentCondition): string => {
    switch (condition) {
        case EquipmentCondition.AVAILABLE:
            return 'bg-green-100 text-green-800';
        case EquipmentCondition.UNDER_REPAIR:
            return 'bg-yellow-100 text-yellow-800';
        case EquipmentCondition.CHECKED_OUT:
            return 'bg-blue-100 text-blue-800';
        case EquipmentCondition.RETIRED:
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

export const getUniqueTypes = (equipment: Equipment[]): string[] => {
    const types = new Set<string>();
    equipment.forEach(item => types.add(item.type));
    return Array.from(types).sort();
};