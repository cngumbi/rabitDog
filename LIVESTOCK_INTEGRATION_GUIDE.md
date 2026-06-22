# Livestock Management System - Integration & Setup Guide

## System Overview
The livestock management system is fully integrated across backend and frontend with proper authentication, API connections, and error handling.

## Files Created/Updated

### New API Client
**File**: `frontend/src/connection/livestockAPI.js`
- Authenticated axios client with token refresh interceptors
- Comprehensive API methods for all livestock operations
- Methods: Types, Batches, Records, Health, Feeding, Production
- Includes error handling and automatic token refresh

### Utility Functions
**File**: `frontend/src/utils/livestockUtils.js`
- Date formatting: `formatDate(date)`
- Currency formatting: `formatCurrency(amount)`
- Number formatting: `formatNumber(num, decimals)`
- Status color mapping: `getStatusColor(status)`
- Form validation: `validateBatchForm()`, `validateAnimalForm()`
- Aggregation functions for feeding & production summaries
- Error parsing: `parseError(error)`

### Constants Configuration
**File**: `frontend/src/config/livestockConstants.js`
- Batch statuses: Active, Completed, Suspended, Archived
- Health statuses: Healthy, Sick, Treated, Injured, Pregnant, Lactating, Deceased
- Animal statuses: Active, Sold, Transferred, Deceased, Culled
- Production types: Eggs, Milk, Meat, Honey, Wool, Skin, Other
- Categories, units, quality grades, and more
- Helper function: `getSelectOptions()` for dropdown menus

### Main Component
**File**: `frontend/src/components/LivestockManagement.js`
- Updated to use `livestockAPI` for all backend calls
- Integrated with `livestockUtils` for formatting and validation
- Full CRUD operations on all livestock entities
- Five main views: Batches, Animals, Health, Feeding, Production
- Real-time statistics calculated from batch data
- Proper error messages and loading states

## Architecture

### Frontend to Backend Flow

```
LivestockManagement.js (Component)
    ↓
livestockAPI.js (Authenticated API Client)
    ↓
/api/livestock/* (Backend Routes)
    ↓
Mongoose Models
    ↓
MongoDB Database
```

### Authentication Flow
1. User logs in → token stored in localStorage
2. Each API request includes: `Authorization: Bearer {token}`
3. On 401 response → automatic token refresh attempt
4. On refresh failure → redirect to `/refresh-failed`

### Data Flow for Batches
1. `fetchBatches()` → calls `livestockAPI.getAllBatches(filter)`
2. API returns all batches filtered by user (owner)
3. Component calls `calculateBatchStats()` to update stats
4. `updateView()` re-renders with formatted data

## Backend Routes (API Endpoints)

### Batches
- `GET /api/livestock/batches` - List all batches (filtered by owner)
- `GET /api/livestock/batches/:id` - Get batch details
- `POST /api/livestock/batches` - Create new batch
- `PUT /api/livestock/batches/:id` - Update batch
- `PATCH /api/livestock/batches/:id/status` - Update batch status
- `PATCH /api/livestock/batches/:id/quantity` - Update current quantity
- `DELETE /api/livestock/batches/:id` - Delete batch

### Records (Animals)
- `GET /api/livestock/records` - List animals
- `GET /api/livestock/records/:id` - Get animal details
- `POST /api/livestock/records` - Create animal
- `PUT /api/livestock/records/:id` - Update animal
- `PATCH /api/livestock/records/:id/health` - Update health status
- `PATCH /api/livestock/records/:id/production` - Record production
- `DELETE /api/livestock/records/:id` - Delete animal

### Health Records
- `GET /api/livestock/health` - List health records
- `POST /api/livestock/health` - Create health record
- `PUT /api/livestock/health/:id` - Update health record
- `DELETE /api/livestock/health/:id` - Delete health record

### Feeding Records
- `GET /api/livestock/feeding` - List feeding records
- `GET /api/livestock/feeding/batch/:batchId/summary` - Batch feeding summary
- `POST /api/livestock/feeding` - Create feeding record
- `PUT /api/livestock/feeding/:id` - Update feeding record
- `DELETE /api/livestock/feeding/:id` - Delete feeding record

### Production Records
- `GET /api/livestock/production` - List production records
- `GET /api/livestock/production/batch/:batchId/summary` - Production summary
- `POST /api/livestock/production` - Create production record
- `PUT /api/livestock/production/:id` - Update production record
- `PATCH /api/livestock/production/:id/sell` - Mark as sold
- `DELETE /api/livestock/production/:id` - Delete production record

### Types
- `GET /api/livestock/types` - List livestock types
- `POST /api/livestock/types` - Create type
- `PUT /api/livestock/types/:id` - Update type
- `DELETE /api/livestock/types/:id` - Delete type

## Component Structure

### Data Object
```javascript
{
  view: 'batches', // Current active view
  batches: [],
  animals: [],
  healthRecords: [],
  feedingRecords: [],
  productionRecords: [],
  livestockTypes: [],
  selectedBatch: null,
  selectedBatchName: null,
  loading: false,
  showForm: false,
  formData: {},
  filter: { status: '', livestockType: '' },
  batchStats: {
    activeBatches: 0,
    totalAnimals: 0,
    completedBatches: 0,
    suspendedBatches: 0
  }
}
```

### Methods
- **Fetch Methods**: fetchBatches, fetchAnimals, fetchHealthRecords, etc.
- **CRUD Methods**: createBatch, updateBatch, deleteBatch, changeBatchStatus
- **Utility Methods**: calculateBatchStats, switchView, updateView
- **Render Methods**: renderBatchesView, renderAnimalsView, etc.

### Views
1. **Batches** - Main view with statistics and batch management
2. **Animals** - Animal records within selected batch
3. **Health** - Health records and treatments
4. **Feeding** - Feed consumption and cost tracking
5. **Production** - Output tracking and profitability

## Error Handling

### API Errors
- Authentication failures → Automatic token refresh or redirect
- Network errors → User-friendly error messages
- Validation errors → Display specific error details

### Form Validation
```javascript
validateBatchForm(formData) // Returns { isValid, errors: [] }
```

### Empty States
- All views show appropriate "No records found" messages
- Loading spinners during async operations
- Error alerts with specific problem descriptions

## Statistics Calculations

### Batch Statistics
- **Active Batches**: Count of batches with `status === 'Active'`
- **Total Animals**: Sum of all `currentQuantity` across batches
- **Completed Batches**: Count of batches with `status === 'Completed'`
- **Suspended Batches**: Count of batches with `status === 'Suspended'`

### Feeding Summary
- Total quantity fed (kg)
- Total quantity allocated (kg)
- Total cost
- Record count
- Last feeding date

### Production Summary
- Total quantity produced
- Total value (cost)
- Total revenue (sale price)
- Total profit (revenue - cost)
- Breakdown by production type

## Testing Endpoints

### Create a Batch
```bash
curl -X POST http://localhost:5800/api/livestock/batches \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "livestockType": "LIVESTOCK_TYPE_ID",
    "batchName": "Chicken Batch 1",
    "quantity": 100,
    "unitCost": 5,
    "location": "Coop A",
    "purpose": "Production"
  }'
```

### Fetch All Batches
```bash
curl -X GET http://localhost:5800/api/livestock/batches \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Filter by Status
```bash
curl -X GET "http://localhost:5800/api/livestock/batches?status=Active" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Troubleshooting

### Issue: API calls not working
**Solution**: Verify token is stored in localStorage and includes Bearer prefix in Authorization header

### Issue: Empty batches list
**Solution**: Check MongoDB connection, verify user has created batches, check owner field in database

### Issue: Form submission fails
**Solution**: Validate form data, check browser console for specific error, verify all required fields

### Issue: Statistics not updating
**Solution**: Call `calculateBatchStats()` after fetching batches, check data structure matches expected format

## Performance Considerations

- Use filters to limit data returned: `?status=Active`
- Implement pagination for large datasets (not yet added)
- Cache livestock types locally to reduce API calls
- Lazy load animal records only when batch selected

## Security

- All mutations require authentication (`isAuth` middleware)
- Owner verification on update/delete operations
- Token-based authentication with automatic refresh
- User data isolation (each user only sees their data)

## Future Enhancements

1. Pagination for large datasets
2. Export to CSV/Excel functionality
3. Advanced filtering and search
4. Batch analytics and reporting
5. Health alert system
6. Predictive analytics for production
7. Mobile app integration
8. Real-time notifications
9. Multi-farm support
10. Historical data tracking and trends
