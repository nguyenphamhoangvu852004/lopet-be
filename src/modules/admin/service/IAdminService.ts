/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IAdminService {
  initAdmin(): Promise<any>
  setRoleToAdmin(): Promise<any>
}
