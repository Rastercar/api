/**
 * Permissions for client users, used to limit actions on its tracked dashboard
 */
export enum PERMISSION {
  CREATE_VEHICLE = 'CREATE_VEHICLE',
  UPDATE_VEHICLE = 'UPDATE_VEHICLE',
  DELETE_VEHICLE = 'DELETE_VEHICLE',
  EDIT_OTHER_USERS = 'EDIT_OTHER_USERS'
}

/**
 * Permissions for tracker users, used to limit actions on the main dashboard
 */
export enum MASTER_PERMISSION {
  EDIT_OTHER_USERS = 'EDIT_OTHER_USERS'
}
