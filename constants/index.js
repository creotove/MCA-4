export const pipeline = [
  {
    $lookup: {
      from: "users", // Assuming "users" is the collection name for users
      localField: "user_id",
      foreignField: "_id",
      as: "customer",
    },
  },
  {
    $unwind: "$customer", // If there is a one-to-one relationship, otherwise use $unwind only if needed
  },
  {
    $project: {
      customer_id: 1,
      name: "$customer.name",
      phoneNumber: "$customer.phoneNumber",
      avatar: "$customer.avatar",
    },
  },
];
export const analyticsHelper = Object.freeze({
  UPDATE: "UPDATE",
  ADD: "ADD",
  DELETE: "DELETE",
});

export const customerType = Object.freeze({
  NEW: "NEW",
  OLD: "OLD", // No need, but just for the sake of completeness
});

export const billType = Object.freeze({
  STITCHED: "STITCHED",
  SOLD: "SOLD",
});
