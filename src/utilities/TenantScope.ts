import AppError from "./ErrorHandler";

/**
 * Injects businessId into a MongoDB query object, ensuring all tenanted
 * queries are always scoped to the correct business.
 *
 * Usage:
 *   const query = tenantScope({ isDeleted: false }, req.staff.businessId);
 *   const riders = await paginateModel(Rider, query, page, limit);
 */
export function tenantScope(
  query: Record<string, any>,
  businessId: string
): Record<string, any> {
  if (!businessId) {
    throw new AppError(400, "Tenant context missing");
  }
  return { ...query, businessId };
}
