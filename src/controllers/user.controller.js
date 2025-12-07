import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import {User} from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend --> filhaal, seedha postman se get data
  // validation - username/email != empty
  // check if user already exists
  // check for imgs/avatar & upload to cloudinary
  // check multer/cloudinary sabme theek se upload hua or not
  // create entry of user in db
  // remove pass/refresh token from response
  // finally, check if user is created successfully or not
  // if yes, return response!!

  const { fullName, email, username, password } = req.body
  console.log("Email: ", email);

  if (
    [fullName, email, username, password].some((field) =>
       field?.trim() === "")
  ){
    throw new ApiError(400, "Full name is required");
  }

  const existedUser = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (existedUser) {
    throw new ApiError(400, "User already exists");
  }

  // yo, now we already have all data in "req.body" provided by express
  // but we also have "req.files" provided by multer
  const avatarLocalPath = req.files?.avatar[0]?.path
  const coverImageLocalPath = req.files?.coverImage[0]?.path
  if(!avatarLocalPath){ throw new ApiError(400, "Avatar file is required"); }

  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)
  if(!avatar){ throw new ApiError(400, "Avatar is required"); }

  const user = await User.create({
    fullName,
    email,
    username: username.toLowerCase(),
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  }); // now jab we db me jayega, toh mongodb khudse gives me _id datafield to entry entry
  // just use it to check if user is truly created or not
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )
  if(!createdUser){ throw new ApiError(500, "User creation failed"); }

  // finallyyyyy
  return res.status(201).json(
    new ApiResponse(200, createdUser, "User created successfully")
  )

});

export {registerUser};