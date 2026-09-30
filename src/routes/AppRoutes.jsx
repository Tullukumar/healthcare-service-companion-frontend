import { Routes, Route } from "react-router-dom";

// ==========================================
// PUBLIC PAGES
// ==========================================

import Home from "../pages/Home";
import Doctors from "../pages/Doctors";
import DoctorProfile from "../pages/DoctorProfile";
import Hospitals from "../pages/Hospitals";
import HospitalDetails from "../pages/HospitalDetails";
import SevaCare from "../pages/SevaCare";
import Emergency from "../pages/Emergency";
import Login from "../pages/Login";
import Register from "../pages/Register";
import FindDoctors from "../pages/FindDoctors";
import MedicalRecords from "../pages/MedicalRecords";

// ==========================================
// PASSWORD RESET
// ==========================================

import ForgotPassword from "../pages/ForgotPassword";
import VerifyResetOTP from "../pages/VerifyResetOTP";
import ResetPasswordNew from "../pages/ResetPasswordNew";
import ResetPassword from "../pages/ResetPassword";

// ==========================================
// COMMON / PROTECTED
// ==========================================

import Profile from "../pages/Profile";
import Appointments from "../pages/Appointments";
import ProtectedRoute from "../components/ProtectedRoute";
import CustomerSupport from "../components/CustomerSupport";

// ==========================================
// PATIENT
// ==========================================

import PatientDashboard from "../pages/PatientDashboard";
import AIHealthCompanion from "../pages/AIHealthCompanion";

// ==========================================
// DOCTOR
// ==========================================

import DoctorDashboard from "../pages/DoctorDashboard";
import DoctorSetup from "../pages/DoctorSetup";
import DoctorAppointments from "../pages/DoctorAppointments";

// ==========================================
// ADMIN
// ==========================================

import AdminDashboard from "../pages/AdminDashboard";

// ==========================================
// AMBULANCE
// ==========================================

import AmbulanceDashboard from "../pages/AmbulanceDashboard";

function AppRoutes() {
  return (
    <Routes>

      {/* ==========================================
          PUBLIC ROUTES
      ========================================== */}

      {/* Home */}
      <Route
        path="/"
        element={<Home />}
      />

      {/* Doctors */}
      <Route
        path="/doctors"
        element={<Doctors />}
      />

      <Route
        path="/doctors/:id"
        element={<DoctorProfile />}
      />

      {/* Hospitals */}
      <Route
        path="/hospitals"
        element={<Hospitals />}
      />

      <Route
        path="/hospitals/:id"
        element={<HospitalDetails />}
      />

      {/* SevaCare */}
      <Route
        path="/sevacare"
        element={<SevaCare />}
      />

      {/* Emergency */}
      <Route
        path="/emergency"
        element={<Emergency />}
      />

      {/* Find Doctors */}
      <Route
        path="/find-doctors"
        element={<FindDoctors />}
      />

      {/* Authentication */}
      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/medical-records"
        element={<MedicalRecords />}
      />


    
      {/* ==========================================
          PASSWORD RESET ROUTES
      ========================================== */}

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      <Route
        path="/verify-reset-otp"
        element={<VerifyResetOTP />}
      />

      {/* New reset password flow */}
      <Route
        path="/reset-password"
        element={<ResetPasswordNew />}
      />

      {/* Old reset password flow */}
      <Route
        path="/reset-password/:token"
        element={<ResetPassword />}
      />

      {/* ==========================================
          PATIENT PROTECTED ROUTES
      ========================================== */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={["patient"]}
          />
        }
      >

        {/* Patient Dashboard */}
        <Route
          path="/patient-dashboard"
          element={<PatientDashboard />}
        />

        {/* AI Health Companion */}
        <Route
          path="/ai-health-companion"
          element={<AIHealthCompanion />}
        />

        {/* Patient Profile */}
        <Route
          path="/profile"
          element={<Profile />}
        />

        {/* Patient Appointments */}
        <Route
          path="/appointments"
          element={<Appointments />}
        />


<Route
  path="/customer-support"
  element={<CustomerSupport />}
/>

      </Route>

      {/* ==========================================
          DOCTOR PROTECTED ROUTES
      ========================================== */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={["doctor"]}
          />
        }
      >

        {/* Doctor Dashboard */}
        <Route
          path="/doctor-dashboard"
          element={<DoctorDashboard />}
        />

        {/* Doctor Setup */}
        <Route
          path="/doctor-setup"
          element={<DoctorSetup />}
        />

        {/* Doctor Appointments */}
        <Route
          path="/doctor-appointments"
          element={<DoctorAppointments />}
        />

      </Route>

      {/* ==========================================
          ADMIN PROTECTED ROUTES
      ========================================== */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={["admin"]}
          />
        }
      >

        {/* Admin Dashboard */}
        <Route
          path="/admin-dashboard"
          element={<AdminDashboard />}
        />

      </Route>

      {/* ==========================================
          AMBULANCE DRIVER PROTECTED ROUTES
      ========================================== */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={["ambulance"]}
          />
        }
      >

        {/* Ambulance Dashboard */}
        <Route
          path="/ambulance-dashboard"
          element={<AmbulanceDashboard />}
        />

      </Route>

      {/* ==========================================
          END ROUTES
      ========================================== */}

    </Routes>
  );
}

export default AppRoutes;