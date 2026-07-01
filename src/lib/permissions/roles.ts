import { Role } from "@prisma/client"

export const rolePermissions: Record<Role, string[]> = {
  [Role.SUPER_ADMIN]: ["*"],
  [Role.ADMIN]: ["products:read", "products:write", "orders:read", "orders:write", "customers:read", "inventory:read", "inventory:write", "analytics:read", "cms:write"],
  [Role.CUSTOMER_SERVICE]: ["products:read", "orders:read", "customers:read"],
  [Role.INVENTORY_MANAGER]: ["inventory:read", "inventory:write"],
  [Role.MARKETING_MANAGER]: ["cms:write", "marketing:write"],
  [Role.CUSTOMER]: [],
  [Role.DEVELOPER]: ["*"],
}

export function hasPermission(role: Role, permission: string) {
  const perms = rolePermissions[role] ?? []
  return perms.includes("*") || perms.includes(permission)
}