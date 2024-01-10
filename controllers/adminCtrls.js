import bcryptjs from "bcryptjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { upload } from "../middlewares/multer.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import { unLinkFile } from "../utils/unLinkFile.js";

import UserModel from "../models/UserModel.js";
import HelperModel from "../models/HelperModel.js";
import CuttingMasterModel from "../models/CuttingMasterModel.js";
import ClothingModel from "../models/ClothingModel.js";
import TailorModel from "../models/TailorModel.js";
import MeasurementModel from "../models/MeasurementModel.js";
import CustomerModel from "../models/CustomerModel.js";
import MeasurementHistoryModel from "../models/MeasurementHistoryModel.js";
import SoldBillModel from "../models/SoldBillModel.js";
import StitchBillModel from "../models/StitchBillModel.js";

// Steps to create Customer & Employee
// 1. Extract the values from the body
// 2. Check the fields if they are empty then throw error
// 3. Check if the user is already registered if yes then throw error
// 4. Hash the password
// 5. Upload the avatar on the cloudinary
// 6. Remove the avatar image from public/temp folder
// 7. Create a new User if all above thing goes well
// 8. Checking the user is created or not
// 8.1 - Creating a employee based on role
// 8.2 - Checking the employee is created or not if not then throw error
// 8.3 - Saving the new employee
// 9. Select the fields for sending the data to the frontend
// 10. Saving the new user
// 11. Sending the response to the frontend

// Add || POST
const addAdmin = asyncHandler(async (req, res) => {
  // Step 1
  const { name, phoneNumber } = req.body;

  // Step 2
  if (name.trim() === "") {
    throw new ApiError(400, "Name is Required");
  } else if (phoneNumber === undefined) {
    throw new ApiError(400, "Phone number is Required");
  }

  // Step 3
  const existedUser = await UserModel.findOne({
    $or: [{ phoneNumber }, { name }],
  });
  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }
  // Step 4
  const salt = await bcryptjs.genSalt(10);
  const hashedPassword = await bcryptjs.hash(phoneNumber, salt);

  // Step 5
  const localpath = req.files?.avatar[0]?.path;
  if (!localpath) throw new ApiError(400, "Avatar is required");
  const avatar = await uploadOnCloudinary(localpath);
  if (!avatar) throw new ApiError(400, "Avatar is required");

  /// Step 6
  const unlinked = unLinkFile(localpath);
  if (unlinked) {
    console.log("File deleted successfully");
  } else {
    throw new ApiError(400, "Error in deleting the file");
  }

  // Step 7
  const newUser = await UserModel.create({
    name,
    password: hashedPassword,
    phoneNumber,
    avatar: avatar.url,
    role: "ADMIN",
  });

  // Step 8
  if (!newUser)
    throw new ApiError(500, "Something went wrong while creating the user");

  // Step 9
  const createdUser = await UserModel.findById(newUser._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while creating the user");
  }
  // Step 10
  await newUser.save();

  // Step 11
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

const addHelper = asyncHandler(async (req, res) => {
  // Step 1
  const { name, phoneNumber, monthly } = req.body;
  console.log(req.body);

  // Step 2
  if (name.trim() === "") {
    throw new ApiError(400, "Name is Required");
  } else if (phoneNumber === undefined) {
    throw new ApiError(400, "Phone number is Required");
  } else if (monthly === undefined) {
    throw new ApiError(400, "Phone number is Required");
  }

  // Step 3
  const existedUser = await UserModel.findOne({
    $or: [{ phoneNumber }, { name }],
  });
  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }

  // Step 4
  const salt = await bcryptjs.genSalt(10);
  const hashedPassword = await bcryptjs.hash(phoneNumber, salt);

  // Step 5
  const localpath = req.files.avatar[0]?.path;
  if (!localpath) throw new ApiError(400, "Avatar is required in local path");
  const avatar = await uploadOnCloudinary(localpath);
  if (!avatar) throw new ApiError(400, "Avatar is required in cloudinary url");

  // Step 6
  const unlinked = unLinkFile(localpath);
  if (unlinked) {
    console.log("File deleted successfully");
  } else {
    throw new ApiError(400, "Error in deleting the file");
  }

  // Step 7
  const newUser = await UserModel.create({
    name,
    password: hashedPassword,
    phoneNumber,
    avatar: avatar.url,
    role: "HELPER",
  });
  // Step 8
  if (!newUser)
    throw new ApiError(500, "Something went wrong while creating the user");

  // Step 8.1
  const newHelper = HelperModel.create({
    name,
    phoneNumber,
    monthly,
    userDocument: newUser._id,
  });

  // Step 8.2
  if (!newHelper)
    throw new ApiError(500, "Something went wrong while creating the user");

  // Step 8.3
  (await newHelper).save();

  // Step 9
  const createdHelper = await UserModel.findById(newUser._id).select(
    "-password -refreshToken"
  );
  if (!createdHelper) {
    throw new ApiError(500, "Something went wrong while creating the user");
  }

  // Step 10
  await newUser.save();

  // Step 11
  return res
    .status(201)
    .json(new ApiResponse(200, createdHelper, "User registered successfully"));
});

const addCM = asyncHandler(async (req, res) => {
  // Step 1
  const { name, phoneNumber } = req.body;

  // Step 2
  if (name.trim() === "") {
    throw new ApiError(400, "Name is Required");
  } else if (phoneNumber === undefined) {
    throw new ApiError(400, "Phone number is Required");
  }

  // Step 3
  const existedUser = await UserModel.findOne({
    $or: [{ phoneNumber }, { name }],
  });
  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }

  // Step 4
  const salt = await bcryptjs.genSalt(10);
  const hashedPassword = await bcryptjs.hash(phoneNumber, salt);

  // Step 5
  const localpath = req.files?.avatar[0]?.path;
  if (!localpath) throw new ApiError(400, "Avatar is required");
  const avatar = await uploadOnCloudinary(localpath);
  if (!avatar) throw new ApiError(400, "Avatar is required");

  // Step 6
  const unlinked = unLinkFile(localpath);
  if (unlinked) {
    console.log("File deleted successfully");
  } else {
    throw new ApiError(400, "Error in deleting the file");
  }

  // Step 7
  const newUser = await UserModel.create({
    name,
    password: hashedPassword,
    phoneNumber,
    avatar: avatar.url,
    role: "CUTTING MASTER",
  });

  // Step 8
  if (!newUser)
    throw new ApiError(500, "Something went wrong while creating the user");

  // Step 8.1
  const newCuttingMaster = CuttingMasterModel.create({
    name,
    phoneNumber,
    userDocument: newUser._id,
    cuttingAmounts: new Map(),
  });

  // Step 8.2
  if (!newCuttingMaster)
    throw new ApiError(500, "Something went wrong while creating the user");
  const clothingItems = await ClothingModel.find();
  if (clothingItems.length === 0) {
    console.log("Currently No clothing items are there");
  } else {
    for (const clothingItem of clothingItems) {
      newCuttingMaster.cuttingAmounts.set(
        clothingItem.name,
        clothingItem.defaultCuttingAmt
      );
    }
  }
  // Step 8.3
  (await newCuttingMaster).save();

  // Step 9
  const createdCuttingMaster = await UserModel.findById(newUser._id).select(
    "-password -refreshToken"
  );
  if (!createdCuttingMaster) {
    throw new ApiError(500, "Something went wrong while creating the user");
  }

  // Step 10
  await newUser.save();

  // Step 11
  return res
    .status(201)
    .json(
      new ApiResponse(200, createdCuttingMaster, "User registered successfully")
    );
});

const addTailor = asyncHandler(async (req, res) => {
  // Step 1
  const { name, phoneNumber } = req.body;

  // Step 2
  if (name.trim() === "") {
    throw new ApiError(400, "Name is Required");
  } else if (phoneNumber === undefined) {
    throw new ApiError(400, "Phone number is Required");
  }

  // Step 3
  const existedUser = await UserModel.findOne({
    $or: [{ phoneNumber }, { name }],
  });
  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }

  // Step 4
  const salt = await bcryptjs.genSalt(10);
  const hashedPassword = await bcryptjs.hash(phoneNumber, salt);

  // Step 5
  const localpath = req.files?.avatar[0]?.path;
  if (!localpath) throw new ApiError(400, "Avatar is required");
  const avatar = await uploadOnCloudinary(localpath);
  if (!avatar) throw new ApiError(400, "Avatar is required");

  // Step 6
  const unlinked = unLinkFile(localpath);
  if (unlinked) {
    console.log("File deleted successfully");
  } else {
    throw new ApiError(400, "Error in deleting the file");
  }

  // Step 7
  const newUser = await UserModel.create({
    name,
    password: hashedPassword,
    phoneNumber,
    avatar: avatar.url,
    role: "CUTTING MASTER",
  });

  // Step 8
  if (!newUser)
    throw new ApiError(500, "Something went wrong while creating the user");

  // Step 8.1
  const newTailor = TailorModel.create({
    name,
    phoneNumber,
    userDocument: newUser._id,
  });

  // Step 8.2
  if (!newTailor)
    throw new ApiError(500, "Something went wrong while creating the user");
  const clothingItems = await ClothingModel.find();
  if (clothingItems.length === 0) {
    console.log("Currently No clothing items are there");
  } else {
    for (const clothingItem of clothingItems) {
      (await newTailor).stitchingAmounts.set(
        clothingItem.name,
        clothingItem.defaultStitchingAmt
      );
    }
  }
  // Step 8.3
  (await newCuttingMaster).save();

  // Step 9
  const createdCuttingMaster = await UserModel.findById(newUser._id).select(
    "-password -refreshToken"
  );
  if (!createdCuttingMaster) {
    throw new ApiError(500, "Something went wrong while creating the user");
  }

  // Step 10
  await newUser.save();

  // Step 11
  return res
    .status(201)
    .json(
      new ApiResponse(200, createdCuttingMaster, "User registered successfully")
    );
});

const addCustomer = asyncHandler(async (req, res) => {
  // Step 1
  const { name, phoneNumber } = req.body;

  // Step 2
  if (name.trim() === "") {
    throw new ApiError(400, "Name is Required");
  } else if (phoneNumber === undefined) {
    throw new ApiError(400, "Phone number is Required");
  }

  // Step 3
  const existedUser = await UserModel.findOne({
    $or: [{ phoneNumber }, { name }],
  });
  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }

  // Step 4
  const salt = await bcryptjs.genSalt(10);
  const hashedPassword = await bcryptjs.hash(phoneNumber, salt);

  // Step 5
  const localpath = req.files?.avatar[0]?.path;
  if (!localpath) throw new ApiError(400, "Avatar is required");
  const avatar = await uploadOnCloudinary(localpath);
  if (!avatar) throw new ApiError(400, "Avatar is required");

  // Step 6
  const unlinked = unLinkFile(localpath);
  if (unlinked) {
    console.log("File deleted successfully");
  } else {
    throw new ApiError(400, "Error in deleting the file");
  }

  // Step 7
  const newUser = await UserModel.create({
    name,
    password: hashedPassword,
    phoneNumber,
    avatar: avatar.url,
    role: "CUSTOMER",
  });

  // Step 8
  if (!newUser)
    throw new ApiError(500, "Something went wrong while creating the user");

  // Step 8.1
  const newCustomer = CustomerModel.create({
    name,
    user_id: newUser._id,
  });

  // Step 8.2
  if (!newCustomer)
    throw new ApiError(500, "Something went wrong while creating the user");

  // Step 8.3
  (await newCustomer).save();

  // Step 9
  const createdUser = await UserModel.findById(newUser._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while creating the user");
  }

  // Step 10
  await newUser.save();

  // Step 11
  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

const addClothingItem = asyncHandler(async (req, res) => {
  const { name, stitching, defaultStitchingAmt, defaultCuttingAmt } = req.body;
  if (name.trim() === "") {
    throw new ApiError(400, "Name is Required");
  } else if (stitching === undefined) {
    throw new ApiError(400, "Stitching is Required");
  } else if (defaultStitchingAmt === undefined) {
    throw new ApiError(400, "Default Stitching Amount is Required");
  } else if (defaultCuttingAmt === undefined) {
    throw new ApiError(400, "Default Cutting Amount is Required");
  }
  const existedClothingItem = await ClothingModel.findOne({
    name,
  });
  if (existedClothingItem) {
    throw new ApiError(409, "Clothing Item already exists");
  }
  const newClothingItem = await ClothingModel.create({
    name,
    stitching,
    defaultStitchingAmt,
    defaultCuttingAmt,
  });
  if (!newClothingItem)
    throw new ApiError(500, "Something went wrong while creating the user");
  await newClothingItem.save();
  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        newClothingItem,
        "Clothing Item created successfully"
      )
    );
});

const addMeasurement = asyncHandler(async (req, res) => {
  const { id } = req.params; // customer id
  const { measurements, customerRequirements, drawing } = req.body;
  if (measurements === undefined) {
    throw new ApiError(400, "Measurements are Required");
  } else if (id === undefined) {
    throw new ApiError(400, "Customer Id is Required");
  }
  let newMeasurement;
  if (customerRequirements) {
    newMeasurement = await MeasurementModel.create({
      customer_id: id,
      measurements,
      customerRequirements,
    });
    if (!newMeasurement)
      throw new ApiError(500, "Something went wrong while creating the user");
    await newMeasurement.save();
  }
  if (drawing) {
    upload.fields([
      {
        name: "drawing",
        maxCount: 1,
      },
    ]);
    const localpath = req.files?.drawing[0]?.path;
    if (!localpath) throw new ApiError(400, "Drawing is required");
    const drawingOnCloudinary = await uploadOnCloudinary(localpath);
    if (!drawingOnCloudinary) throw new ApiError(400, "Drawing is required");

    let splittedFileName;
    if (localpath.includes("\\")) {
      console.log("Windows");
      splittedFileName = localpath.split("\\");
    } else {
      console.log("Linux");
      splittedFileName = localpath.split("/");
    }
    const fileNameToBeDeleted = splittedFileName[splittedFileName.length - 1];
    console.log("fileNameToBeDeleted : ", fileNameToBeDeleted);
    const filePath = path.join(
      __dirname,
      `../public/temp/${fileNameToBeDeleted}`
    );
    console.log("filePath : ", filePath);
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(err);
        return;
      }
    });
    newMeasurement = await MeasurementModel.create({
      customer_id: id,
      measurements,
      drawing,
    });
    if (!newMeasurement)
      throw new ApiError(500, "Something went wrong while creating the user");
    await newMeasurement.save();
  }
  if (customerRequirements && drawing) {
    upload.fields([
      {
        name: "drawing",
        maxCount: 1,
      },
    ]);
    const localpath = req.files?.drawing[0]?.path;
    if (!localpath) throw new ApiError(400, "Drawing is required");
    const drawingOnCloudinary = await uploadOnCloudinary(localpath);
    if (!drawingOnCloudinary) throw new ApiError(400, "Drawing is required");

    let splittedFileName;
    if (localpath.includes("\\")) {
      console.log("Windows");
      splittedFileName = localpath.split("\\");
    } else {
      console.log("Linux");
      splittedFileName = localpath.split("/");
    }
    const fileNameToBeDeleted = splittedFileName[splittedFileName.length - 1];
    console.log("fileNameToBeDeleted : ", fileNameToBeDeleted);
    const filePath = path.join(
      __dirname,
      `../public/temp/${fileNameToBeDeleted}`
    );
    console.log("filePath : ", filePath);
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(err);
        return;
      }
    });
    newMeasurement = await MeasurementModel.create({
      customer_id: id,
      measurements,
      customerRequirements,
      drawing,
    });
    if (!newMeasurement)
      throw new ApiError(500, "Something went wrong while creating the user");
    await newMeasurement.save();
  }
  const customer = await CustomerModel.findById(id);
  customer.measurements.push(newMeasurement._id);
  if (!customer) throw new ApiError(404, "Customer not found");
  const measurementHistory = await MeasurementHistoryModel.create({
    measurement_id: newMeasurement._id,
    customer_id: id,
  });
  if (!measurementHistory)
    throw new ApiError(500, "Cannot add history of measurement");
  await customer.save();
  await measurementHistory.save();
  return res
    .status(201)
    .json(new ApiResponse(201, "Add Measurement for customer successfully"));
});

const addSoldBill = asyncHandler(async (req, res) => {
  const {
    name,
    user_id,
    customer_id,
    billNumber,
    phoneNumber,
    clothAmt,
    // clothes,
    totalAmt,
  } = req.body;
  if (name.trim() === "") {
    throw new ApiError(400, "Name is Required");
  } else if (user_id === undefined) {
    throw new ApiError(400, "User Id is Required");
  } else if (customer_id === undefined) {
    throw new ApiError(400, "Customer Id is Required");
  } else if (billNumber === undefined) {
    throw new ApiError(400, "Bill Number is Required");
  } else if (phoneNumber === undefined) {
    throw new ApiError(400, "Phone Number is Required");
  } else if (clothAmt === undefined) {
    throw new ApiError(400, "Cloth Amount is Required");
  } else if (clothes === undefined) {
    throw new ApiError(400, "Clothes is Required");
  } else if (totalAmt === undefined) {
    throw new ApiError(400, "Total Amount is Required");
  }
  const newSoldBill = await SoldBillModel.create({
    name,
    user_id,
    customer_id,
    billNumber,
    phoneNumber,
    clothAmt,
    // clothes,
    totalAmt,
  });
  if (!newSoldBill)
    throw new ApiError(500, "Something went wrong while creating the user");
  await newSoldBill.save();
  return res
    .status(201)
    .json(new ApiResponse(201, "Add Sold Bill for customer successfully"));
});

const addStitchBill = asyncHandler(async (req, res) => {
  const {
    name,
    user_id,
    customer_id,
    billNumber,
    phoneNumber,
    deliveryDate,
    clothAmt,
    clothes,
    subTotal,
    advanceAmt,
    totalAmt,
  } = req.body;
  if (name.trim() === "") {
    throw new ApiError(400, "Name is Required");
  } else if (user_id === undefined) {
    throw new ApiError(400, "User Id is Required");
  } else if (customer_id === undefined) {
    throw new ApiError(400, "Customer Id is Required");
  } else if (billNumber === undefined) {
    throw new ApiError(400, "Bill Number is Required");
  } else if (phoneNumber === undefined) {
    throw new ApiError(400, "Phone Number is Required");
  } else if (deliveryDate === undefined) {
    throw new ApiError(400, "Delivery Date is Required");
  } else if (clothAmt === undefined) {
    throw new ApiError(400, "Cloth Amount is Required");
  } else if (clothes === undefined) {
    throw new ApiError(400, "Clothes is Required");
  } else if (subTotal === undefined) {
    throw new ApiError(400, "Sub Total is Required");
  } else if (advanceAmt === undefined) {
    throw new ApiError(400, "Advance Amount is Required");
  } else if (totalAmt === undefined) {
    throw new ApiError(400, "Total Amount is Required");
  }
  const newStitchBill = await StitchBillModel.create({
    name,
    user_id,
    customer_id,
    billNumber,
    phoneNumber,
    deliveryDate,
    clothAmt,
    clothes,
    subTotal,
    advanceAmt,
    totalAmt,
  });
  if (!newStitchBill)
    throw new ApiError(500, "Something went wrong while creating the user");
  const customer = await CustomerModel.findById(customer_id);
  customer.stitchedBill.push(newStitchBill._id);
  if (!customer) throw new ApiError(404, "Customer not found");
  await customer.save();
  await newStitchBill.save();
  return res
    .status(201)
    .json(new ApiResponse(201, "Add Stitch Bill for customer successfully"));
});

// PATCH || Employee Details || AVATAR middleware needed
// *work and their amounts are not updated here
const updateEmployee = asyncHandler(async (req, res) => {
  const { id } = req.params; // user id
  const {
    name,
    phoneNumber,
    avatar,
    role,
    password,
    advance,
    earned,
    monthly,
  } = req.body;
  if (role === "HELPER") {
    const helper = await HelperModel.findOne({ user_id: id });
    if (!helper) throw new ApiError(404, "Helper not found");
    if (name) helper.name = name;
    if (phoneNumber) helper.phoneNumber = phoneNumber;
    if (avatar) {
      const localpath = req.files?.avatar[0]?.path;
      if (!localpath) throw new ApiError(400, "Avatar is required");
      const newAvatar = await uploadOnCloudinary(localpath);
      if (!newAvatar) throw new ApiError(400, "Avatar is required");
      helper.avatar = newAvatar;
      const unlinked = unLinkFile(localpath);
      if (unlinked) {
        console.log("File deleted successfully");
      } else {
        throw new ApiError(400, "Error in deleting the file");
      }
    }
    if (password) helper.password = password;
    if (advance) helper.advance = advance;
    if (earned) helper.earned = earned;
    if (monthly) helper.monthly = monthly;
   
    await helper.save();
    return res
      .status(200)
      .json(new ApiResponse(200, helper, "Helper Updated Successfully"));
  }
  if (role === "CUTTING MASTER") {
    const cuttingMaster = await CuttingMasterModel.findOne({ user_id: id });
    if (!cuttingMaster) throw new ApiError(404, "Cutting Master not found");
    if (name) cuttingMaster.name = name;
    if (phoneNumber) cuttingMaster.phoneNumber = phoneNumber;
    if (avatar) {
      const localpath = req.files?.avatar[0]?.path;
      if (!localpath) throw new ApiError(400, "Avatar is required");
      const newAvatar = await uploadOnCloudinary(localpath);
      if (!newAvatar) throw new ApiError(400, "Avatar is required");
      cuttingMaster.avatar = newAvatar;
      const unlinked = unLinkFile(localpath);
      if (unlinked) {
        console.log("File deleted successfully");
      } else {
        throw new ApiError(400, "Error in deleting the file");
      }
    }
    if (password) cuttingMaster.password = password;
    if (advance) cuttingMaster.advance = advance;
    if (earned) cuttingMaster.earned = earned;
    if (monthly) cuttingMaster.monthly = monthly;
    await cuttingMaster.save();
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          cuttingMaster,
          "Cutting Master Updated Successfully"
        )
      );
  }
  if (role === "TAILOR") {
    const tailor = await TailorModel.findOne({ user_id: id });
    if (!tailor) throw new ApiError(404, "Tailor not found");
    if (name) tailor.name = name;
    if (phoneNumber) tailor.phoneNumber = phoneNumber;
    if (avatar) {
      const localpath = req.files?.avatar[0]?.path;
      if (!localpath) throw new ApiError(400, "Avatar is required");
      const newAvatar = await uploadOnCloudinary(localpath);
      if (!newAvatar) throw new ApiError(400, "Avatar is required");
      tailor.avatar = newAvatar;
      const unlinked = unLinkFile(localpath);
      if (unlinked) {
        console.log("File deleted successfully");
      } else {
        throw new ApiError(400, "Error in deleting the file");
      }
    }
    if (password) tailor.password = password;
    if (advance) tailor.advance = advance;
    if (earned) tailor.earned = earned;
    if (monthly) tailor.monthly = monthly;
    await tailor.save();
    return res
      .status(200)
      .json(new ApiResponse(200, tailor, "Tailor Updated Successfully"));
  }
});

export {
  addAdmin,
  addHelper,
  addCM,
  addTailor,
  addCustomer,
  addClothingItem,
  addMeasurement,
  addSoldBill,
  addStitchBill,
  updateEmployee,
};
