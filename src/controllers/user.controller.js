import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';

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

  if (fullName === ""){
    throw new ApiError(400, "Full name is required");
  }

});

export {registerUser};