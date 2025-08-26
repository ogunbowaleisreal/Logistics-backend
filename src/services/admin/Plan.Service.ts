import { Plans } from "../../models/Plan.Model";
import AppError from "../../utilities/ErrorHandler";
import { paginateModelWithPopulate } from "../../utilities/Pagination.Helper";

export class PlanService {
  public async createPlan(payload: any) {
    const { name } = payload;
    const existingPlan = await this.validatePlanExistence(name);
    if (existingPlan) {
      throw new AppError(409, "Plan already exists");
    }
    const plan = await Plans.create(payload);
    return plan;
  }

  public async getPlans(filter: any) {
    const { planID, search } = filter;
    if (planID) {
      const plan = await Plans.findOne({ _id: planID, isDeleted: false });
      if (!plan) {
        throw new AppError(404, "Plan not found");
      }
      return plan;
    }
    let query: any = { isDeleted: false };
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
    const plans = await Plans.find(query);
    return plans;
  }

  public async updatePlan(payload: any) {
    const { planID, name, status, pricePerUnit, minimumUnit } = payload;

    const plan = await Plans.findOne({ _id: planID, isDeleted: false });
    if (!plan) {
      throw new AppError(404, "Plan not found");
    }

    if (name) {
      const { name: currentName } = plan;
      if (name !== currentName) {
        const existingPlan = await this.validatePlanExistence(name);
        if (existingPlan) {
          throw new AppError(409, "Plan already exists");
        }
      }
      plan.name = name;
    }
    if (status) plan.status = status;
    if (pricePerUnit) plan.pricePerUnit = pricePerUnit;
    if (minimumUnit) plan.minimumUnit = minimumUnit;

    return await plan.save();
  }

  public async deletePlan(planID: string) {
    const plan = await Plans.findOneAndUpdate(
      { _id: planID, isDeleted: false },
      { isDeleted: true }
    );
    if (!plan) {
      throw new AppError(404, "Plan not found");
    }

    // await PlanBouquets.deleteMany({ plan: planID });
    return;
  }

  private async validatePlanExistence(name: string) {
    const plan = await Plans.findOne({
      name: new RegExp(`^${name}$`, "i"),
      isDeleted: false,
    });
    if (!plan) {
      return;
    }
    return plan;
  }

  public async getPlanByID(planID: string) {
    const plan = await Plans.findOne({ _id: planID, isDeleted: false });
    if (!plan) {
      return;
    }
    return plan;
  }
}
