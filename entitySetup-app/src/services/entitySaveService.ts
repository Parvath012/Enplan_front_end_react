import axios from 'axios';

export type OperationType = 'n' | 'u' | 'd'; // new, update, delete

export interface EntityFormData {
	legalBusinessName: string;
	displayName: string;
	entityType: string;
	assignedEntity?: unknown;
	addressLine1?: string;
	addressLine2?: string;
	country?: string;
	state?: string;
	city?: string;
	pinZipCode?: string;
	entityLogo?: File | null; // not sent, used only for preview in UI
	logo?: string; // base64 data URL string to persist in DB
	setAsDefault?: boolean;
	// extra fields we may add later
	countries?: unknown;
	currencies?: unknown;
	modules?: string; // JSON string of active modules
	progressPercentage?: string; // Progress percentage as varchar
	id?: string; // for updates/deletes
	softDeleted?: boolean;
	isConfigured?: boolean;
	isEnabled?: boolean;
	isDeleted?: boolean;
	createdAt?: string;
	lastUpdatedAt?: string;
}

const API_PATH = '/api/v1/data/Data/SaveData';
const SAVE_ENDPOINT = `${process.env.REACT_APP_DATA_API_URL ?? ''}${API_PATH}`;

function escapeSingleQuotes(value: string): string {
	return value.replace(/'/g, "''");
}

function quoteString(value?: string): string {
	if (value == null || value === '') return "''";
	return `'${escapeSingleQuotes(value)}'`;
}

function quoteJson(value: unknown): string {
	if (value == null) return "''";
	try {
		const json = JSON.stringify(value);
		// wrap JSON as a single-quoted string with double quotes preserved
		return `'${json.replace(/'/g, "''")}'`;
	} catch {
		return "''";
	}
}

function formatBoolean(value: unknown, fallback = false): string {
	const b = typeof value === 'boolean' ? value : fallback;
	return b ? 'true' : 'false';
}

function formatTimestamp(ts?: string): string {
	const date = ts ? new Date(ts) : new Date();
	const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
	const yyyy = date.getFullYear();
	const MM = pad(date.getMonth() + 1);
	const dd = pad(date.getDate());
	const HH = pad(date.getHours());
	const mm = pad(date.getMinutes());
	const ss = pad(date.getSeconds());
	return `'${yyyy}-${MM}-${dd} ${HH}:${mm}:${ss}'`;
}


// Helper function to create modules JSON from active modules
export function createModulesJson(activeModules: string[]): string {
	return JSON.stringify(activeModules);
}

// Helper function to parse modules JSON to active modules array
export function parseModulesJson(modulesJson: string): string[] {
	try {
		return modulesJson ? JSON.parse(modulesJson) : [];
	} catch (error) {
		console.error('Error parsing modules JSON:', error);
		return [];
	}
}

// Helper functions to reduce cognitive complexity
const hasString = (v?: string) => v != null && v !== '';

const hasJson = (v: unknown) => {
	if (v == null) return false;
	if (Array.isArray(v)) return v.length > 0;
	if (typeof v === 'object') return Object.keys(v as Record<string, unknown>).length > 0;
	if (typeof v === 'string') return v.trim().length > 0;
	return true;
};

const addIdColumn = (columns: Array<{ name: string; include: boolean; value: string }>, op: OperationType, form: EntityFormData) => {
	if (op === 'u' || op === 'd') {
		if (!hasString(form.id)) {
			throw new Error('id is required for update/delete operations');
		}
		columns.push({ name: 'id', include: true, value: form.id as string });
	} else {
		columns.push({ name: 'id', include: true, value: '' });
	}
};

const addStringField = (columns: Array<{ name: string; include: boolean; value: string }>, name: string, value?: string) => {
	if (hasString(value)) {
		columns.push({ name, include: true, value: quoteString(value) });
	}
};

const addStringFieldForUpdate = (columns: Array<{ name: string; include: boolean; value: string }>, name: string, value: string | undefined, op: OperationType) => {
	if (op === 'u' || hasString(value)) {
		columns.push({ name, include: true, value: quoteString(value) });
	}
};

const addJsonField = (columns: Array<{ name: string; include: boolean; value: string }>, name: string, value: unknown, op: OperationType) => {
	if (op === 'u' || hasJson(value)) {
		columns.push({ name, include: true, value: quoteJson(value) });
	}
};

const addTimestampField = (columns: Array<{ name: string; include: boolean; value: string }>, fieldName: string, timestamp?: string) => {
	const value = timestamp ? quoteString(timestamp) : formatTimestamp();
	columns.push({ name: fieldName, include: true, value });
};

const addBooleanField = (columns: Array<{ name: string; include: boolean; value: string }>, fieldName: string, value?: boolean, defaultValue: boolean = false) => {
	const finalValue = value ?? defaultValue;
	columns.push({ name: fieldName, include: true, value: formatBoolean(finalValue) });
};

const addNonDeleteFields = (columns: Array<{ name: string; include: boolean; value: string }>, form: EntityFormData, op: OperationType) => {
	addStringField(columns, 'LegalBusinessName', form.legalBusinessName);
	addStringField(columns, 'DisplayName', form.displayName);
	addStringField(columns, 'EntityType', form.entityType);
	addJsonField(columns, 'AssignedEntity', form.assignedEntity, op);
	addStringField(columns, 'AddressLine1', form.addressLine1);
	addStringFieldForUpdate(columns, 'AddressLine2', form.addressLine2, op);
	addStringField(columns, 'Country', form.country);
	addStringField(columns, 'State', form.state);
	addStringField(columns, 'City', form.city);
	addStringField(columns, 'PinZipCode', form.pinZipCode);
	addStringField(columns, 'Logo', form.logo);
	
	addBooleanField(columns, 'SetAsDefault', form.setAsDefault, false);
	addJsonField(columns, 'Countries', form.countries, 'n');
	addJsonField(columns, 'Currencies', form.currencies, 'n');
	addStringField(columns, 'Modules', form.modules);
	addStringField(columns, 'ProgressPercentage', form.progressPercentage);
	
	addTimestampField(columns, 'CreatedAt', form.createdAt);
	addTimestampField(columns, 'LastUpdatedAt', form.lastUpdatedAt);
	
	addBooleanField(columns, 'IsConfigured', form.isConfigured, false);
	addBooleanField(columns, 'IsEnabled', form.isEnabled, true);
	addBooleanField(columns, 'IsDeleted', form.isDeleted, false);
};

export function buildEntityCsv(form: EntityFormData, op: OperationType): { headers: string; row: string } {
	const isDeleteOperation = op === 'u' && form.softDeleted === true;
	
	const columns: Array<{ name: string; include: boolean; value: string }> = [
		{ name: '_ops', include: true, value: op },
	];

	addIdColumn(columns, op, form);

	if (!isDeleteOperation) {
		addNonDeleteFields(columns, form, op);
	} else {
		addTimestampField(columns, 'LastUpdatedAt', form.lastUpdatedAt);
	}

	addBooleanField(columns, 'SoftDeleted', form.softDeleted, false);

	const headers = columns.filter(c => c.include).map(c => c.name).join('|');
	const row = columns.filter(c => c.include).map(c => c.value).join('|');

	return { headers, row };
}

export async function saveEntity(form: EntityFormData, op: OperationType = 'n') {
	const { headers, row } = buildEntityCsv(form, op);
	const body = {
		tableName: 'entity',
		csvData: [headers, row],
		hasHeaders: true,
		uniqueColumn: 'id',
	};


	const response = await axios.post(SAVE_ENDPOINT, body);
	const responseData = response.data;
	
	// Check if the response indicates an error even with 200 status
	if (responseData.status === 'Error') {
		throw new Error(responseData.message || 'Failed to save entity');
	}
	
	return responseData;
}

export function buildPartialUpdateCsv(form: EntityFormData, op: OperationType = 'u'): { headers: string; row: string } {
	// Always include operation column
	const columns: Array<{ name: string; include: boolean; value: string } > = [
		{ name: '_ops', include: true, value: op },
	];

	// id column: always include for updates
	if (!form.id) {
		throw new Error('id is required for update operations');
	}
	columns.push({ name: 'id', include: true, value: form.id });

	// Helper function to add timestamp field
	const addTimestampField = (fieldName: string, timestamp?: string) => {
		const value = timestamp ? quoteString(timestamp) : formatTimestamp();
		columns.push({ name: fieldName, include: true, value });
	};

	// Helper function to add boolean field with default
	const addBooleanField = (fieldName: string, value?: boolean, defaultValue: boolean = false) => {
		const finalValue = value ?? defaultValue;
		columns.push({ name: fieldName, include: true, value: formatBoolean(finalValue) });
	};

	// Only include fields that are actually being updated
	// For toggle operations, we only need these fields:
	
	// Add timestamp field for lastUpdatedAt
	addTimestampField('LastUpdatedAt', form.lastUpdatedAt);
	
	// Add boolean field for isEnabled if it's being updated
	if (form.isEnabled !== undefined) {
		addBooleanField('IsEnabled', form.isEnabled, true);
	}
	
	// Add boolean field for isConfigured if it's being updated
	if (form.isConfigured !== undefined) {
		addBooleanField('IsConfigured', form.isConfigured, false);
	}
	
	// Add modules JSON field if it's being updated
	if (form.modules !== undefined) {
		const modulesValue = form.modules ? quoteString(form.modules) : quoteString('');
		columns.push({ name: 'Modules', include: true, value: modulesValue });
	}
	
	// Add progress percentage field if it's being updated
	if (form.progressPercentage !== undefined) {
		const progressValue = form.progressPercentage ? quoteString(form.progressPercentage) : quoteString('0');
		columns.push({ name: 'ProgressPercentage', include: true, value: progressValue });
	}

	// Build header and row from included columns
	const headers = columns.filter(c => c.include).map(c => c.name).join('|');
	const row = columns.filter(c => c.include).map(c => c.value).join('|');

	return { headers, row };
}

export async function saveEntityPartialUpdate(form: EntityFormData, op: OperationType = 'u') {
	const { headers, row } = buildPartialUpdateCsv(form, op);
	const body = {
		tableName: 'entity',
		csvData: [headers, row],
		hasHeaders: true,
		uniqueColumn: 'id',
	};


	const response = await axios.post(SAVE_ENDPOINT, body);
	const responseData = response.data;
	
	// Check if the response indicates an error even with 200 status
	if (responseData.status === 'Error') {
		throw new Error(responseData.message || 'Failed to update entity');
	}
	
	return responseData;
}

// Save modules configuration to entity table
export async function saveEntityModules(entityId: string, activeModules: string[]): Promise<any> {
	try {
		const modulesJson = createModulesJson(activeModules);
		
		// Calculate progress based on modules - can reduce if modules are removed
		const progressPercentage = activeModules.length > 0 ? '100' : '66.6';
		
		const formData: EntityFormData = {
			id: entityId,
			modules: modulesJson,
			progressPercentage: progressPercentage,
			lastUpdatedAt: new Date().toISOString(),
			// Required fields with defaults
			legalBusinessName: '',
			displayName: '',
			entityType: '',
		};


		// Use partial update to only update modules and lastUpdatedAt
		const response = await saveEntityPartialUpdate(formData, 'u');
		return response;
	} catch (error: any) {
		console.error('saveEntityModules: API call failed:', error);
		throw error;
	}
}
