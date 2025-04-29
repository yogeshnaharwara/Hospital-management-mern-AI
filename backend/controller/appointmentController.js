import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { Appointment } from "../models/appointmentSchema.js";
import { User } from "../models/userSchema.js";

export const postAppointment = catchAsyncErrors(async (req, res, next) => {
    const {
        firstName,
        lastName,
        email,
        phone,
        aadhar,
        dob,
        gender,
        appointment_date,
        department,
        doctor_firstName,
        doctor_lastName,
        hasVisited,
        address,
    } = req.body || {};

    if (
        !firstName ||
        !lastName ||
        !email ||
        !phone ||
        !aadhar ||
        !dob ||
        !gender ||
        !appointment_date ||
        !department ||
        !doctor_firstName ||
        !doctor_lastName ||
        !address
    ) {
        return next(new ErrorHandler("Please Fill Full Form!", 400));
    }

    const isConflict = await User.find({
        firstName: doctor_firstName,
        lastName: doctor_lastName,
        role: "Doctor",
        doctorDepartment: department,
    });

    if (isConflict.length === 0) {
        return next(new ErrorHandler("Doctor not found", 404));
    }

    if (isConflict.length > 1) {
        return next(
            new ErrorHandler(
                "Doctors Conflict! Please Contact Through Email Or Phone!",
                400
            )
        );
    }

    const doctorId = isConflict[0]._id;
    const patientId = req.user._id;

    const appointment = await Appointment.create({
        firstName,
        lastName,
        email,
        phone,
        aadhar,
        dob,
        gender,
        appointment_date,
        department,
        doctor: {
            firstName: doctor_firstName,
            lastName: doctor_lastName,
        },
        hasVisited,
        address,
        doctorId,
        patientId,
    });

    res.status(200).json({
        success: true,
        appointment,
        message: "Appointment Send!",
        appointment,
    });
});

export const getAllAppointments = catchAsyncErrors(async (req, res, next) => {
    const appointments = await Appointment.find();
    res.status(200).json({
        success: true,
        appointments,
    });
});

export const updateAppointmentStatus = catchAsyncErrors(
    async (req, res, next) => {
      const { id } = req.params;
      const { status } = req.body;  // status from request body
      
      let appointment = await Appointment.findById(id);
      if (!appointment) {
        return next(new ErrorHandler("Appointment not found!", 404));
      }
      
      // Update the appointment status
      appointment = await Appointment.findByIdAndUpdate(
        id,
        { status },  // update status here
        {
          new: true,
          runValidators: true,
          useFindAndModify: false,
        }
      );
  
      // Find the user who booked this appointment
      const user = await User.findById(appointment.patientId);
      if (!user) {
        return next(new ErrorHandler("User not found!", 404));
      }
  
      // Send the response with updated status to both admin and user
      res.status(200).json({
        success: true,
        message: "Appointment Status Updated!",
        appointment,
        userStatus: appointment.status,  // added user status in response
      });
    }
  );
  
export const deleteAppointment = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return next(new ErrorHandler("Appointment Not Found!", 404));
    }
    await appointment.deleteOne();
    res.status(200).json({
      success: true,
      message: "Appointment Deleted!",
    });
  });
  
