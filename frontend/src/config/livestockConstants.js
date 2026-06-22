// Livestock management constants and configurations

export const LIVESTOCK_CONSTANTS = {
  BATCH_STATUS: {
    ACTIVE: 'Active',
    COMPLETED: 'Completed',
    SUSPENDED: 'Suspended',
    ARCHIVED: 'Archived',
  },

  HEALTH_STATUS: {
    HEALTHY: 'Healthy',
    SICK: 'Sick',
    TREATED: 'Treated',
    INJURED: 'Injured',
    PREGNANT: 'Pregnant',
    LACTATING: 'Lactating',
    DECEASED: 'Deceased',
  },

  ANIMAL_STATUS: {
    ACTIVE: 'Active',
    SOLD: 'Sold',
    TRANSFERRED: 'Transferred',
    DECEASED: 'Deceased',
    CULLED: 'Culled',
  },

  LIVESTOCK_CATEGORIES: {
    POULTRY: 'Poultry',
    APIARY: 'Apiary',
    LIVESTOCK: 'Livestock',
    AQUACULTURE: 'Aquaculture',
    OTHER: 'Other',
  },

  PRODUCTION_TYPES: {
    EGGS: 'Eggs',
    MILK: 'Milk',
    MEAT: 'Meat',
    HONEY: 'Honey',
    WOOL: 'Wool',
    SKIN: 'Skin',
    OTHER: 'Other',
  },

  UNITS: {
    KG: 'Kg',
    LITERS: 'Liters',
    UNITS: 'Units',
    GRAMS: 'Grams',
  },

  QUALITY_GRADES: {
    GRADE_A: 'Grade A',
    GRADE_B: 'Grade B',
    GRADE_C: 'Grade C',
    REJECT: 'Reject',
  },

  GENDER: {
    MALE: 'Male',
    FEMALE: 'Female',
  },

  BATCH_PURPOSE: {
    PRODUCTION: 'Production',
    BREEDING: 'Breeding',
    FATTENING: 'Fattening',
    SALES: 'Sales',
  },

  RECORD_TYPES: {
    ILLNESS: 'Illness',
    VACCINATION: 'Vaccination',
    TREATMENT: 'Treatment',
    ROUTINE_CHECK: 'Routine Check',
    INJURY: 'Injury',
    MORTALITY: 'Mortality',
  },

  SEVERITY_LEVELS: {
    MILD: 'Mild',
    MODERATE: 'Moderate',
    SEVERE: 'Severe',
    CRITICAL: 'Critical',
  },

  OUTCOMES: {
    RECOVERED: 'Recovered',
    ONGOING: 'Ongoing',
    DECEASED: 'Deceased',
    CULLED: 'Culled',
    TRANSFERRED: 'Transferred',
  },

  FEED_QUALITY: {
    EXCELLENT: 'Excellent',
    GOOD: 'Good',
    FAIR: 'Fair',
    POOR: 'Poor',
  },

  ANIMAL_CONDITION: {
    EAGERLY_CONSUMED: 'Eagerly consumed',
    NORMAL_CONSUMPTION: 'Normal consumption',
    LOW_CONSUMPTION: 'Low consumption',
    REFUSED: 'Refused',
  },
};

// Get array of values from a constant object
export const getConstantValues = (obj) => {
  return Object.values(obj);
};

// Get options for select dropdowns
export const getSelectOptions = (constantObj) => {
  return getConstantValues(constantObj).map(value => ({
    value,
    label: value,
  }));
};

export default LIVESTOCK_CONSTANTS;
