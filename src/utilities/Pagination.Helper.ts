import AppError from "./ErrorHandler";

async function paginateModel(
  model: any,
  query: any = {},
  page = 1,
  limit = 10,
  sort: any = { createdAt: -1 },
  exclude: string = ""
) {
  try {
    const totalDocuments = await model.countDocuments(query);

    const skip = (page - 1) * limit;

    const documents = await model
      .find(query)
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .select(exclude)
      .exec();

    return {
      data: documents,
      currentPage: page,
      totalPages: Math.ceil(totalDocuments / limit),
      totalDocuments,
    };
  } catch (error: any) {
    throw new AppError(500, error.message);
  }
}

async function paginateModelWithPopulate(
  model: any,
  query: any = {},
  page = 1,
  limit = 10,
  sort: any = { createdAt: -1 },
  populate: any,
  exclude: string = ""
) {
  try {
    const totalDocuments = await model.countDocuments(query);
    const skip = (page - 1) * limit;

    const documents = await model
      .find(query)
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .populate(populate)
      .select(exclude)
      .exec();

    return {
      data: documents,
      currentPage: page,
      totalPages: Math.ceil(totalDocuments / limit),
      totalDocuments,
    };
  } catch (error: any) {
    throw new AppError(500, error.message);
  }
}

async function paginateModelWithMultiplePopulates(
  model: any,
  query: any = {},
  page = 1,
  limit = 10,
  populate: any,
  sort: any = { createdAt: -1 },
  exclude: string = ""
) {
  const totalDocuments = await model.countDocuments(query);
  const skip = (page - 1) * limit;

  if (populate.length == 2) {
    let documents = await model
      .find(query)
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .select(exclude)
      .populate(populate[0])
      .populate(populate[1])
      .exec();

    return {
      data: documents,
      currentPage: page,
      totalPages: Math.ceil(totalDocuments / limit),
      totalDocuments,
    };
  } else if (populate.length == 3) {
    let documents = await model
      .find(query)
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .select(exclude)
      .populate(populate[0])
      .populate(populate[1])
      .populate(populate[2])
      .exec();

    return {
      data: documents,
      currentPage: page,
      totalPages: Math.ceil(totalDocuments / limit),
      totalDocuments,
    };
  }
}

export {
  paginateModel,
  paginateModelWithPopulate,
  paginateModelWithMultiplePopulates,
};
