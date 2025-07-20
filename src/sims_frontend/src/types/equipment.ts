export enum EquipmentCondition {
    AVAILABLE = "AVAILABLE",
    UNDER_REPAIR = "UNDER_REPAIR",
    CHECKED_OUT = "CHECKED_OUT",
    RETIRED = "RETIRED",
}

export interface Equipment {
    id: number;
    name: string;
    room: number;
    pathToPhoto: string;
    condition: EquipmentCondition;
    type: string;
    serialNumber: string;
    updatedAt?: string; // Using string for Date objects from JSON
    createdAt?: string; // Using string for Date objects from JSON
}