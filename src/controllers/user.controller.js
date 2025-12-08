import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import {User} from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';


const generateAccessAndRefreshTokens = async (userId) => {
  try{
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({validateBeforeSave: false})

    return { accessToken, refreshToken };
  } 
  catch(err){ throw new ApiError(500, "Token generation failed"); }
}

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

const loginUser = asyncHandler(async (req, res) => {
  // req.body --> get data
  // username or email se do login
  // find the user
  // check password
  // access and refresh token generate
  // send cookie

  const { email, username, password } = req.body
  if (!email && !username) { throw new ApiError(400, "username or email is required"); }

  const user = await User.findOne({
    $or: [{ email }, { username: username.toLowerCase()}],
  }); // does this user has tokens ka knowledge?
  // no, cause they were assigned later neeche..

  if (!user) { throw new ApiError(404, "User not found"); }

  const isPasswordValid = await user.isPasswordCorrect(password)
  if (!isPasswordValid) { throw new ApiError(401, "Invalid user credentials"); }

  const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id)
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
  // just upar wala line was an optional step but okok

  const options = { // block your cookie unless you are using HTTPS
    httpOnly: true,
    secure: true
  }
  return res
  .status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json( 
    new ApiResponse (
      200,{user: loggedInUser,accessToken,refreshToken},
      "User logged in successfully"
    ) 
  )

});

const logoutUser = asyncHandler(async (req, res) => {
  // so, yaha toh (for logout) lagega data, which we dont have
  // therefore, we'll use khud ka middleware to track the user
  // ...
  // now after adding ROUTE, MIDDLEWARE we finally have "req.user" available here
  await User.findByIdAndUpdate(
    req.user._id, 
    {$set:{ refreshToken: undefined }},
    {new: true}
  )

  const options = {
    httpOnly: true,
    secure: true
  }
  return res
  .status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json( new ApiResponse(200, {}, "User logged out!!") )

});

// Okay now, there should also be an option to refresh the Access token
// so that user doesn't have to login again and again....
const refreshAcessToken = asyncHandler(async (req, res) => {
  // get apna token and verify first with the one in the db
  // if okok, generate new access and refresh tokens.. haha
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
  if(!incomingRefreshToken) { throw new ApiError(401, "Refresh token not found"); }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    )
  
    const user = await User.findById(decodedToken?._id)
    if(!user) { throw new ApiError(401, "User not found"); }
  
    if(user?.refreshToken !== incomingRefreshToken){
      throw new ApiError(401, "Refresh token mismatch");
    }
  
    const options = {
      httpOnly: true,
      secure: true
    }
    
    const {accessToken,newRefreshToken} = await generateAccessAndRefreshTokens(user._id) 
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json( 
      new ApiResponse(200, 
      {accessToken, refreshToken: newRefreshToken}, 
      "Access token refreshed successfully")
    )
  } catch (error) { throw new ApiError(401, error?.message || "Invalid refresh token"); }

});

export { registerUser, loginUser, logoutUser, refreshAcessToken };
