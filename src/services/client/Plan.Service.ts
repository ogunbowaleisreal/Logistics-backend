import { Plans } from "../../models/Plan.Model";
import AppError from "../../utilities/ErrorHandler";

export class PlanService {
  public async getPlans(filter: any) {
    const { planID, search } = filter;
    if (planID) {
      const plan = await Plans.findOne({
        _id: planID,
        status: "active",
        isDeleted: false,
      });
      if (!plan) {
        throw new AppError(404, "Plan not found");
      }
      return plan;
    }
    let query: any = { status: "active", isDeleted: false };
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
    const plans = await Plans.find(query);
    return plans;
  }

  public async validatePlan(planID: string) {
    const plan = await Plans.findOne({
      _id: planID,
      status: "active",
      isDeleted: false,
    });
    if (!plan) {
      throw new AppError(404, "Plan not found");
    }
    return plan;
  }
}
