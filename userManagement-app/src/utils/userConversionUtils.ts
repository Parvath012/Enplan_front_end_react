/**
 * Shared utility for converting UserModel to User format
 * Eliminates duplication between roleSlice.ts and userSlice.ts
 */

import type { User } from '../services/userService';
import type { UserModel } from '../services/userFetchService';

/**
 * Convert UserModel to User format for compatibility
 * @param user - UserModel from API
 * @returns User object
 */
export const convertUserModelToUser = (user: UserModel): User => {
  return {
    id: parseInt(user.id) ?? 0,
    firstname: user.firstname,
    lastname: user.lastname,
    phonenumber: user.phonenumber ?? '',
    role: user.role,
    department: user.department ?? '',
    emailid: user.emailid,
    reportingmanager: user.reportingmanager ?? '',
    dottedorprojectmanager: user.dottedorprojectmanager ?? '',
    selfreporting: (() => {
      // Handle various possible formats: boolean true/false, string 'true'/'false', number 1/0
      const value = user.selfreporting;
      
      // Check for explicit true values
      if (value === true || String(value) === 'true' || String(value) === '1' || String(value) === 'True' || String(value) === 'TRUE') {
        return 'true';
      } else if (value === false || String(value) === 'false' || String(value) === '0' || String(value) === 'False' || String(value) === 'FALSE') {
        return 'false';
      } else {
        // For null, undefined, empty string, or any other value, default to false
        return 'false';
      }
    })(),
    status: user.status,
    isenabled: user.isenabled,
    createdat: user.createdat,
    lastupdatedat: user.lastupdatedat ?? '',
    createdby: user.createdby ?? '',
    lastupdatedby: user.lastupdatedby ?? '',
    transferedby: user.transferedby ?? '',
    transferedto: user.transferedto ?? '',
    transfereddate: user.transfereddate ?? '',
    regions: user.regions ?? null,
    countries: user.countries ?? null,
    divisions: user.divisions ?? null,
    groups: user.groups ?? null,
    departments: user.departments ?? null,
    class: user.class ?? null,
    subClass: user.subClass ?? null,
    permissions: user.permissions ?? null,
  };
};

/**
 * Convert array of UserModel to array of User
 * @param users - Array of UserModel from API
 * @returns Array of User objects
 */
export const convertUserModelsToUsers = (users: UserModel[]): User[] => {
  return users.map(convertUserModelToUser);
};



