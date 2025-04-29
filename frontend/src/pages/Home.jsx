import React, { useState, useEffect, useContext, useCallback } from "react";
import Hero from "../components/Hero";
import Biography from "../components/Biography";
import MessageForm from "../components/MessageForm";
import Departments from "../components/Departments";
import { Context } from "../main";
import axios from "axios";

const Home = () => {
  const { isAuthenticated, user } = useContext(Context);
  const [appointments, setAppointments] = useState([]);

  // ✅ Memoize the function to fix the ESLint warning
  const fetchAppointments = useCallback(async () => {
    console.clear();
    console.log("Fetching appointments...");

    try {
      const response = await axios.get(
        "http://localhost:4000/api/v1/appointment/getall",
        { withCredentials: true }
      );

      console.log("API Response:", response.data);

      if (Array.isArray(response.data.appointments)) {
        const filteredAppointments = response.data.appointments.filter((appointment) => {
          const appointmentEmail = appointment.email?.toLowerCase() || "";
          const userEmail = user?.email?.toLowerCase() || "";

          console.log(`Comparing ${appointmentEmail} with ${userEmail}`);
          return appointmentEmail && appointmentEmail === userEmail;
        });

        console.log("Filtered Appointments:", filteredAppointments);

        const formattedAppointments = filteredAppointments.map((appointment) => ({
          ...appointment,
          formattedDate: new Date(appointment.appointment_date).toLocaleDateString(),
        }));

        setAppointments(formattedAppointments);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  }, [user]);

  useEffect(() => {
    console.log("isAuthenticated:", isAuthenticated);
    console.log("User email:", user?.email || "No user info");

    if (isAuthenticated && user?.email) {
      fetchAppointments();
    } else {
      console.log("User not authenticated or user.email is missing");
    }
  }, [isAuthenticated, user, fetchAppointments]);

  return (
    <>
      <Hero
        title="Welcome to LifeCare Medical Institute | Your Trusted Healthcare Provider"
        imageUrl="/hero.png"
      />
      <Biography imageUrl="/about.png" />
      <Departments />
      <MessageForm />

      {/* Appointment Status Display */}
     
<div className="appointments-container">
  <h3 className="appointments-heading">Your Appointments</h3>
  {appointments.length > 0 ? (
    appointments.map((appointment, index) => (
      <div key={index} className="appointment-card">
        <p><strong>Doctor:</strong> {appointment.doctor?.firstName} {appointment.doctor?.lastName}</p>
        <p><strong>Status:</strong> {appointment.status}</p>
        <p><strong>Date:</strong> {appointment.formattedDate}</p>
      </div>
    ))
  ) : (
    <p className="no-appointments">No appointments found for your account.</p>
  )}
</div>

    </>
  );
};

export default Home;
