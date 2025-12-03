# API Configuration for Entity Setup App

## Environment Variables

The Entity Setup App requires the following environment variables to be configured:

### Required Environment Variables

1. **REACT_APP_ENTITY_HIERARCHY_API_URL**
   - **Purpose**: Base URL for the Entity Hierarchy API
   - **Default**: `http://localhost:8888`
   - **Example**: `REACT_APP_ENTITY_HIERARCHY_API_URL=http://localhost:8888`

2. **REACT_APP_DATA_API_URL**
   - **Purpose**: Base URL for the Data API (used for entity CRUD operations and countries/currencies saving)
   - **Default**: `http://localhost:8888`
   - **Example**: `REACT_APP_DATA_API_URL=http://localhost:8888`

## API Endpoints

### Entity Hierarchy API
- **Base URL**: `${REACT_APP_ENTITY_HIERARCHY_API_URL}/api/entity-hierarchy`
- **Get All Hierarchies**: `GET /all`
- **Get Hierarchy by ID**: `GET /{entityId}`
- **Get Hierarchy by Name**: `GET /by-name/{legalBusinessName}`

### Data API
- **Base URL**: `${REACT_APP_DATA_API_URL}/api/v1/data/Data/ExecuteSqlQueries`
- **SaveData Endpoint**: `${REACT_APP_DATA_API_URL}/api/v1/data/Data/SaveData`
- **Used for**: Entity CRUD operations, country/state data, countries/currencies saving

## Setup Instructions

1. Create a `.env` file in the root of the entitySetup-app directory
2. Add the required environment variables:
   ```bash
   REACT_APP_ENTITY_HIERARCHY_API_URL=http://localhost:8888
   REACT_APP_DATA_API_URL=http://localhost:8888
   ```
3. Restart your development server
4. The app will now use the configured API endpoints

## Testing the API

To test if the Entity Hierarchy API is working:

1. Ensure your backend service is running on the configured port
2. Open the Entity Setup app
3. Navigate to the Entity List
4. Click "View Structure" on any entity
5. The hierarchy panel should open and display the entity relationships

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your backend allows requests from your frontend origin
2. **Connection Refused**: Verify the backend service is running on the correct port
3. **404 Errors**: Check that the API endpoints are correctly configured in your backend

### Debug Information

The app includes extensive logging for debugging:
- Check browser console for API call details
- Redux DevTools will show the hierarchy data flow
- Network tab shows actual HTTP requests

## Backend Requirements

The Entity Hierarchy API should return data in this format:

```json
[
  {
    "id": 1,
    "legalBusinessName": "Entity Name",
    "entityType": "Entity Type",
    "displayName": "Display Name",
    "parent": [
      {
        "id": 2,
        "legalBusinessName": "Parent Entity",
        "entityType": "Parent Type",
        "displayName": "Parent Display",
        "parent": []
      }
    ]
  }
]
```
