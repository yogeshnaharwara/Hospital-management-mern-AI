// AppointmentStatus.jsx
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Context } from "../main";
import { toast } from "react-toastify";

const AppointmentStatus = () => {
  const { isAuthenticated } = useContext(Context);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:4000/api/v1/appointment/status",
          { withCredentials: true }
        );
        setAppointments(data.appointments);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch status");
      }
    };

    if (isAuthenticated) fetchStatus();
  }, [isAuthenticated]);

  return (
    <div className="container">
      <h2>Your Appointments</h2>
      {appointments.length === 0 ? (
        <p>No appointments found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Doctor</th>
              <th>Department</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appt, i) => (
              <tr key={i}>
                <td>{appt.doctor_firstName} {appt.doctor_lastName}</td>
                <td>{appt.department}</td>
                <td>{new Date(appt.appointment_date).toLocaleDateString()}</td>
                <td>{appt.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AppointmentStatus;
