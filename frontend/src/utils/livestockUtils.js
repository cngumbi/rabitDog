// Livestock utility functions for formatting, validation, and calculations

export const livestockUtils = {
  // Format date to readable string
  formatDate: (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  },

  // Format currency
  formatCurrency: (amount) => {
    if (typeof amount !== 'number') return '$0.00';
    return `$${amount.toFixed(2)}`;
  },

  // Format number with decimals
  formatNumber: (num, decimals = 2) => {
    if (typeof num !== 'number') return '0.00';
    return num.toFixed(decimals);
  },

  // Get status badge color
  getStatusColor: (status) => {
    const statusMap = {
      'Active': 'active',
      'Completed': 'completed',
      'Suspended': 'suspended',
      'Archived': 'archived',
      'Healthy': 'healthy',
      'Sick': 'sick',
      'Treated': 'treated',
      'Injured': 'injured',
      'Pregnant': 'pregnant',
      'Lactating': 'lactating',
      'Deceased': 'deceased',
    };
    return statusMap[status] || 'default';
  },

  // Get health status color
  getHealthColor: (health) => {
    return this.getStatusColor(health);
  },

  // Calculate age in days from birth date
  calculateAge: (birthDate) => {
    if (!birthDate) return 0;
    const birth = new Date(birthDate);
    const now = new Date();
    const ageDays = Math.floor((now - birth) / (1000 * 60 * 60 * 24));
    return ageDays > 0 ? ageDays : 0;
  },

  // Calculate profit
  calculateProfit: (totalValue, salePrice, quantity) => {
    const revenue = quantity * salePrice;
    return revenue - totalValue;
  },

  // Validate batch form data
  validateBatchForm: (formData) => {
    const errors = [];
    
    if (!formData.batchName || !formData.batchName.trim()) {
      errors.push('Batch name is required');
    }
    
    if (!formData.livestockType) {
      errors.push('Livestock type is required');
    }
    
    if (!formData.quantity || formData.quantity <= 0) {
      errors.push('Quantity must be greater than 0');
    }
    
    if (!formData.unitCost || formData.unitCost < 0) {
      errors.push('Unit cost must be 0 or greater');
    }
    
    if (!formData.location || !formData.location.trim()) {
      errors.push('Location is required');
    }
    
    if (!formData.purpose) {
      errors.push('Purpose is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Validate animal form data
  validateAnimalForm: (formData) => {
    const errors = [];
    
    if (!formData.identificationNumber || !formData.identificationNumber.trim()) {
      errors.push('Identification number is required');
    }
    
    if (!formData.gender) {
      errors.push('Gender is required');
    }
    
    if (formData.weight === undefined || formData.weight < 0) {
      errors.push('Weight must be 0 or greater');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Group production records by type
  groupProductionByType: (records) => {
    return records.reduce((acc, record) => {
      const type = record.productionType || 'Other';
      if (!acc[type]) {
        acc[type] = {
          type,
          quantity: 0,
          value: 0,
          records: [],
        };
      }
      acc[type].quantity += record.quantity || 0;
      acc[type].value += record.totalValue || 0;
      acc[type].records.push(record);
      return acc;
    }, {});
  },

  // Calculate batch feeding summary
  calculateFeedingSummary: (feedingRecords) => {
    if (!Array.isArray(feedingRecords) || feedingRecords.length === 0) {
      return {
        totalQuantityFed: 0,
        totalQuantityAllocated: 0,
        totalCost: 0,
        recordCount: 0,
        lastFeedingDate: null,
      };
    }

    const summary = feedingRecords.reduce(
      (acc, record) => {
        acc.totalQuantityFed += record.quantityFed || 0;
        acc.totalQuantityAllocated += record.quantityAllocated || 0;
        acc.totalCost += record.totalCost || 0;
        acc.recordCount += 1;
        
        const recordDate = new Date(record.feedingDate);
        if (!acc.lastFeedingDate || recordDate > new Date(acc.lastFeedingDate)) {
          acc.lastFeedingDate = record.feedingDate;
        }
        
        return acc;
      },
      {
        totalQuantityFed: 0,
        totalQuantityAllocated: 0,
        totalCost: 0,
        recordCount: 0,
        lastFeedingDate: null,
      }
    );

    return summary;
  },

  // Calculate batch production summary
  calculateProductionSummary: (productionRecords) => {
    if (!Array.isArray(productionRecords) || productionRecords.length === 0) {
      return {
        totalQuantityProduced: 0,
        totalValue: 0,
        totalRevenue: 0,
        totalProfit: 0,
        recordCount: 0,
        productionByType: {},
      };
    }

    const summary = productionRecords.reduce(
      (acc, record) => {
        acc.totalQuantityProduced += record.quantity || 0;
        acc.totalValue += record.totalValue || 0;
        acc.totalRevenue += (record.quantity * record.salePrice) || 0;
        acc.totalProfit += record.profit || 0;
        acc.recordCount += 1;

        const type = record.productionType || 'Other';
        if (!acc.productionByType[type]) {
          acc.productionByType[type] = {
            quantity: 0,
            value: 0,
            revenue: 0,
            profit: 0,
            count: 0,
          };
        }
        acc.productionByType[type].quantity += record.quantity || 0;
        acc.productionByType[type].value += record.totalValue || 0;
        acc.productionByType[type].revenue += (record.quantity * record.salePrice) || 0;
        acc.productionByType[type].profit += record.profit || 0;
        acc.productionByType[type].count += 1;

        return acc;
      },
      {
        totalQuantityProduced: 0,
        totalValue: 0,
        totalRevenue: 0,
        totalProfit: 0,
        recordCount: 0,
        productionByType: {},
      }
    );

    return summary;
  },

  // Get health status label with icon
  getHealthLabel: (health) => {
    const labelMap = {
      'Healthy': '✓ Healthy',
      'Sick': '⚠ Sick',
      'Treated': '✓ Treated',
      'Injured': '✕ Injured',
      'Pregnant': '◯ Pregnant',
      'Lactating': '◆ Lactating',
      'Deceased': '✕ Deceased',
    };
    return labelMap[health] || health;
  },

  // Get status label with icon
  getStatusLabel: (status) => {
    const labelMap = {
      'Active': '● Active',
      'Completed': '✓ Completed',
      'Suspended': '⊙ Suspended',
      'Archived': '◇ Archived',
      'Sold': '✓ Sold',
      'Transferred': '→ Transferred',
      'Culled': '✕ Culled',
    };
    return labelMap[status] || status;
  },

  // Parse API error
  parseError: (error) => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  },
};

export default livestockUtils;
