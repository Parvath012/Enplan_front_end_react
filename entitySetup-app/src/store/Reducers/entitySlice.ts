import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchEntitiesFromApi, fetchEntityHierarchyFromApi, EntityModel, EntityHierarchyModel } from '../../services/entitySetupService';

export interface EntityState {
  items: EntityModel[];
  hierarchy: EntityHierarchyModel[];
  loading: boolean;
  hierarchyLoading: boolean;
  error: string | null;
  hierarchyError: string | null;
}

const initialState: EntityState = {
  items: [],
  hierarchy: [],
  loading: false,
  hierarchyLoading: false,
  error: null,
  hierarchyError: null,
};

export const fetchEntities = createAsyncThunk<EntityModel[]>(
  'entities/fetchAll',
  async () => {
    const entities = await fetchEntitiesFromApi();
    return entities;
  }
);

export const fetchEntityHierarchy = createAsyncThunk<EntityHierarchyModel[]>(
  'entities/fetchHierarchy',
  async () => {
    console.log('Redux: fetchEntityHierarchy thunk started');
    try {
      const hierarchy = await fetchEntityHierarchyFromApi();
      console.log('Redux: fetchEntityHierarchy thunk completed successfully:', hierarchy);
      return hierarchy;
    } catch (error) {
      console.error('Redux: fetchEntityHierarchy thunk failed:', error);
      throw error;
    }
  }
);

const entitySlice = createSlice({
  name: 'entities',
  initialState,
  reducers: {
    clearEntities(state) {
      state.items = [];
      state.error = null;
      state.loading = false;
    },
    updateEntityIsEnabled(state, action: PayloadAction<{ id: string; isEnabled: boolean }>) {
      const entity = state.items.find(item => item.id === action.payload.id);
      if (entity) {
        entity.isEnabled = action.payload.isEnabled;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEntities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEntities.fulfilled, (state, action: PayloadAction<EntityModel[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchEntities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to fetch entities';
      })
      .addCase(fetchEntityHierarchy.pending, (state) => {
        console.log('Redux: fetchEntityHierarchy.pending - setting loading to true');
        state.hierarchyLoading = true;
        state.hierarchyError = null;
      })
      .addCase(fetchEntityHierarchy.fulfilled, (state, action: PayloadAction<EntityHierarchyModel[]>) => {
        console.log('Redux: fetchEntityHierarchy.fulfilled - setting hierarchy data:', action.payload);
        console.log('Redux: fetchEntityHierarchy.fulfilled - payload length:', action.payload?.length);
        console.log('Redux: fetchEntityHierarchy.fulfilled - payload type:', typeof action.payload);
        console.log('Redux: fetchEntityHierarchy.fulfilled - is array:', Array.isArray(action.payload));
        console.log('Redux: fetchEntityHierarchy.fulfilled - full payload:', JSON.stringify(action.payload, null, 2));
        state.hierarchyLoading = false;
        state.hierarchy = action.payload;
      })
      .addCase(fetchEntityHierarchy.rejected, (state, action) => {
        console.error('Redux: fetchEntityHierarchy.rejected - error:', action.error.message);
        state.hierarchyLoading = false;
        state.hierarchyError = action.error.message ?? 'Failed to fetch entity hierarchy';
      });
  },
});

export const { clearEntities, updateEntityIsEnabled } = entitySlice.actions;
export default entitySlice.reducer;


