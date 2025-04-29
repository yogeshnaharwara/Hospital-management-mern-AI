import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { User } from "../models/userSchema.js";
import { generateToken } from "../utils/jwtToken.js";
import cloudinary from "cloudinary";


export const patientRegister = catchAsyncErrors(async (req, res, next) => {
    const body = req.body || {}; // ✅ Ensure req.body is never undefined

    // ✅ Even if spelling mistake like "fristName" happens, it will still work
    const firstName = body.firstName || body.fristName;
    const lastName = body.lastName;
    const email = body.email;
    const phone = body.phone;
    const aadhar = body.aadhar;
    const dob = body.dob;
    const gender = body.gender;
    const password = body.password;

    if (!firstName || !lastName || !email || !phone || !aadhar || !dob || !gender || !password) {
        return next(new ErrorHandler("Please Fill Full Form!", 400));
    }

    const isRegistered = await User.findOne({ email });
    if (isRegistered) {
        return next(new ErrorHandler("User already Registered!", 400));
    }

    const user = await User.create({
        firstName,
        lastName,
        email,
        phone,
        aadhar,
        dob,
        gender,
        password,
        role: "Patient",
    });

    generateToken(user, "User Registered!", 200, res);
});

export const login = catchAsyncErrors(async (req, res, next) => {
    const body = req.body || {};

    const email = body.email;
    const password = body.password;
    const confirmPassword = body.confirmPassword;
    const role = body.role;

    if (!email || !password || !confirmPassword || !role) {
        return next(new ErrorHandler("Please Fill Full Form!", 400));
    }
    if (password !== confirmPassword) {
        return next(
            new ErrorHandler("Password & Confirm Password Do Not Match!", 400)
        );
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        return next(new ErrorHandler("Invalid Email Or Password!", 400));
    }

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
        return next(new ErrorHandler("Invalid Email Or Password!", 400));
    }
    if (role !== user.role) {
        return next(new ErrorHandler("User Not Found With This Role!", 400));
    }
    generateToken(user, "Login Successfully!", 200, res);


});
export const addNewAdmin = catchAsyncErrors(async (req, res, next) => {
    const body = req.body || {};
    const firstName = body.firstName || body.fristName;
    const lastName = body.lastName;
    const email = body.email;
    const phone = body.phone;
    const aadhar = body.aadhar;
    const dob = body.dob;
    const gender = body.gender;
    const password = body.password;

    if (
        !firstName ||
        !lastName ||
        !email ||
        !phone ||
        !aadhar ||
        !dob ||
        !gender ||
        !password
    ) {
        return next(new ErrorHandler("Please Fill Full Form!", 400));
    }

    const isRegistered = await User.findOne({ email });
    if (isRegistered) {
        return next(new ErrorHandler(`${isRegistered.role} With This Email Already Exists!`, 400));
    }

    const admin = await User.create({
        firstName,
        lastName,
        email,
        phone,
        aadhar,
        dob,
        gender,
        password,
        role: "Admin",
    });
    res.status(200).json({
        success: true,
        message: "New Admin Registered",
        admin,
    });
});
// yha change kr rha hu
export const addNewDoctor = catchAsyncErrors(async (req, res, next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return next(new ErrorHandler("Doctor Avatar Required!", 400));
    }
    const { docAvatar } = req.files;
    const allowedFormats = ["image/png", "image/jpeg", "image/webp","image/jpg"];
    if (!allowedFormats.includes(docAvatar.mimetype)) {
        return next(new ErrorHandler("File Format Not Supported!", 400));
    }
    const body = req.body || {};
    const firstName = body.firstName || body.fristName;
    const lastName = body.lastName;
    const email = body.email;
    const phone = body.phone;
    const aadhar = body.aadhar;
    const dob = body.dob;
    const gender = body.gender;
    const password = body.password;
    const doctorDepartment = body.doctorDepartment;
    
    if (
        !firstName ||
        !lastName ||
        !email ||
        !phone ||
        !aadhar ||
        !dob ||
        !gender ||
        !password ||
        !doctorDepartment ||
        !docAvatar
    ) {
        return next(new ErrorHandler("Please Fill Full Form!", 400));
    }
    const isRegistered = await User.findOne({ email });
    if (isRegistered) {
        return next(
            new ErrorHandler("Doctor With This Email Already Exists!", 400)
        );
    }
    const cloudinaryResponse = await cloudinary.uploader.upload(
        docAvatar.tempFilePath
    );
    if (!cloudinaryResponse || cloudinaryResponse.error) {
        console.error(
            "Cloudinary Error:",
            cloudinaryResponse.error || "Unknown Cloudinary error"
        );
        return next(
            new ErrorHandler("Failed To Upload Doctor Avatar To Cloudinary", 500)
        );
    }
    const doctor = await User.create({
        firstName,
        lastName,
        email,
        phone,
        aadhar,
        dob,
        gender,
        password,
        role: "Doctor",
        doctorDepartment,
        docAvatar: {
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url,
        },
    });
    res.status(200).json({
        success: true,
        message: "New Doctor Registered",
        doctor,
    });
});


export const getAllDoctors = catchAsyncErrors(async (req, res, next) => {
    const doctors = await User.find({ role: "Doctor" });
    res.status(200).json({
        success: true,
        doctors,
    });
});

export const getUserDetails = catchAsyncErrors(async (req, res, next) => {
    const user = req.user;
    res.status(200).json({
        success: true,
        user,
    });
});
// Logout function for dashboard admin
export const logoutAdmin = catchAsyncErrors(async (req, res, next) => {
    res
        .status(201)
        .cookie("adminToken", "", {
            httpOnly: true,
            expires: new Date(Date.now()),
        })
        .json({
            success: true,
            message: "Admin Logged Out Successfully.",
        });
});

// Logout function for frontend patient
export const logoutPatient = catchAsyncErrors(async (req, res, next) => {
    res
        .status(201)
        .cookie("patientToken", "", {
            httpOnly: true,
            expires: new Date(Date.now()),
        })
        .json({
            success: true,
            message: "Patient Logged Out Successfully.",
        });
});
//appointment k liye 
export const getUserProfile = catchAsyncErrors(async (req, res, next) => {
    const user = req.user;  // Get the user from request (Assuming user is added in request by auth middleware)
    
    if (!user) {
      return next(new ErrorHandler("User Not Found!", 404));
    }
  
    res.status(200).json({
      success: true,
      user,
      appointmentStatus: user.appointmentStatus,  // Send the appointment status along with user info
    });
  });
  