import { Equipment, EquipmentCondition } from "@/types/equipment";
import { RequestStatus } from "@/types/request";

export function getConditionColor(status: EquipmentCondition | RequestStatus): string {
    switch (status) {
        case EquipmentCondition.AVAILABLE:
            return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        case EquipmentCondition.CHECKED_OUT:
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
        case EquipmentCondition.UNDER_REPAIR:
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
        case EquipmentCondition.RETIRED:
            return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
        case RequestStatus.PENDING:
            return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
        case RequestStatus.APPROVED:
            return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300';
        case RequestStatus.REJECTED:
            return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
        case RequestStatus.RETURNED:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
}

export function getUniqueTypes(equipment: Equipment[]): string[] {
    const types = new Set<string>();
    equipment.forEach(item => types.add(item.type));
    return Array.from(types).sort();
}