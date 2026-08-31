import React, { useState } from "react";
import {
  School,
  MapPin,
  Clock,
  AlarmClock,
  Mail,
  LockIcon,
  Eye,
  EyeClosed,
  User,
  Loader2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Radio,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

//shared input field container styling - matches the login form.
const inputBox =
  "flex mt-3 bg-background rounded-xl py-3 px-4 focus-within:ring-2 focus-within:ring-primary transition-all duration-300";
const inputField =
  "text-white w-full focus:outline-none bg-transparent ml-3";

//label+icon+input group helper. Defined outside the component so it keeps a
//stable identity and does NOT remount the inputs on every keystroke (which
//would make typed text lose focus).
const Field = ({ icon, label, children }) => (
  <div>
    <label className="text-white">{label}</label>
    <div className={inputBox}>
      <span className="flex items-center text-text-secondary">{icon}</span>
      <div className="flex-1 ml-3">{children}</div>
    </div>
  </div>
);

export default function ConfigureSchool() {
  const navigate = useNavigate();

  //admin account fields.
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  //school configuration fields.
  const [schoolName, setSchoolName] = useState("");
  const [radius, setRadius] = useState(100);
  const [clockInStart, setClockInStart] = useState("06:00");
  const [clockInDeadline, setClockInDeadline] = useState("08:00");

  const [location, setLocation] = useState(null); // {latitude, longitude}
  const [locError, setLocError] = useState("");
  const [isLocating, setIsLocating] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  //grab the school coordinates via the browser's geolocation.
  const captureLocation = () => {
    setLocError("");
    if (!navigator.geolocation) {
      setLocError("Geolocation is not supported by this browser.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        setLocError(""); //clear any previous error once located successfully
        setIsLocating(false);
      },
      (error) => {
        setLocError(`Unable to get location: ${error?.message ?? "denied"}`);
        setIsLocating(false);
      },
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!location) {
      setErrorMessage(
        "Please capture the school location first. It is used for the clock-in geofence.",
      );
      return;
    }

    setIsLoading(true);

    try {
      //use the same API base URL as the rest of the app (the backend),
      //otherwise a relative /api path hits the Vite dev server instead.
      const baseUrl = import.meta.env.VITE_API_URL ?? "";
      const res = await fetch(`${baseUrl}/api/signup-admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          first_name: firstName,
          last_name: lastName,
          school_name: schoolName,
          geo_latitude: location.latitude,
          geo_longitude: location.longitude,
          geo_radius_meters: Number(radius) || 100,
          clock_in_start: `${clockInStart}:00`,
          clock_in_deadline: `${clockInDeadline}:00`,
        }),
      });

      let result = {};
      try {
        result = await res.json();
      } catch (parseError) {
        //backend might return an empty / non-JSON body on failure.
        result = {};
      }

      if (!res.ok) {
        throw new Error(
          result?.message ??
            result?.settingsError?.message ??
            "Sign up failed",
        );
      }

      setSuccessMessage(
        "Account created successfully. Your school has been configured. You can now sign in.",
      );
      setIsLoading(false);

      //redirect back to the login page after a short pause.
      setTimeout(() => navigate("/login"), 2500);
    } catch (error) {
      setErrorMessage(error?.message ?? "Failed to create your account.");
      setIsLoading(false);
    }
  };

  //two-column label+input group helper used inside the grid.
  return (
    <div className="min-h-screen w-full py-8 px-10 bg-background">
      {/* logo section */}
      <div>
        <div className="flex items-center gap-5">
          <div className="flex items-center justify-center bg-primary h-15 w-15 rounded-xl">
            <School size={40} />
          </div>
          <div>
            <h1 className="text-white font-bold text-3xl">SchooLynk</h1>
            <p className="text-text-secondary font-semibold">
              School Management System
            </p>
          </div>
        </div>
      </div>

      {/* form */}
      <div className="w-full flex items-center justify-center py-10">
        <div className="flex flex-col justify-center bg-card rounded-2xl px-8 py-10 w-[720px] border border-text-secondary/20 shadow-xl">
          {/* heading */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <ShieldCheck className="text-primary" size={24} />
              <h1 className="text-3xl text-white font-bold">
                Create Account & Configure Your School
              </h1>
            </div>
            <p className="text-text-secondary">
              Set up your school so clock-in geofencing works from day one.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full mt-7">
            {/* admin name - two columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field
                icon={<User size={18} />}
                label="First Name"
              >
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Olivia"
                  className="text-white w-full focus:outline-none bg-transparent"
                />
              </Field>

              <Field icon={<User size={18} />} label="Last Name">
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Mokoena"
                  className="text-white w-full focus:outline-none bg-transparent"
                />
              </Field>
            </div>

            {/* email + password - two columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
              <Field icon={<Mail size={18} />} label="Email Address">
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="admin@gmail.com"
                  className="text-white w-full focus:outline-none bg-transparent"
                />
              </Field>

              <Field icon={<LockIcon size={18} />} label="Password">
                <div className="flex items-center">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password..."
                    className="text-white w-full focus:outline-none bg-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="ml-2"
                  >
                    {showPassword ? (
                      <EyeClosed className="text-text-secondary" />
                    ) : (
                      <Eye className="text-text-secondary" />
                    )}
                  </button>
                </div>
              </Field>
            </div>

            {/* divider */}
            <div className="flex items-center gap-4 mt-8 mb-2">
              <div className="w-full h-0.5 bg-text-secondary/20" />
              <span className="text-text-secondary text-sm font-semibold whitespace-nowrap">
                School Setup
              </span>
              <div className="w-full h-0.5 bg-text-secondary/20" />
            </div>

            {/* school name */}
            <div className="mt-5">
              <label className="text-white">School Name</label>
              <div className={inputBox}>
                <span className="flex items-center text-text-secondary">
                  <School size={18} />
                </span>
                <input
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="e.g. SchooLynk Academy"
                  className="text-white w-full focus:outline-none bg-transparent ml-3"
                />
              </div>
            </div>

            {/* location capture */}
            <div className="mt-5">
              <label className="text-white">School Location</label>
              <div className={inputBox}>
                <span className="flex items-center text-text-secondary">
                  <MapPin size={18} />
                </span>
                <button
                  type="button"
                  onClick={captureLocation}
                  disabled={isLocating || Boolean(location)}
                  className="w-full text-left text-text-secondary hover:text-primary transition-colors disabled:opacity-70 ml-3 disabled:hover:text-text-secondary font-semibold"
                >
                  {isLocating ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="animate-spin" size={18} /> Locating
                      school...
                    </span>
                  ) : location ? (
                    <span className="text-text-green">
                      School located: {location.latitude.toFixed(5)},{" "}
                      {location.longitude.toFixed(5)}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Radio size={18} /> Click to capture current GPS location
                      of the school
                    </span>
                  )}
                </button>
              </div>
              {locError && <p className="text-red-500 mt-2 text-sm">{locError}</p>}
            </div>

            {/* radius + two clock times - three columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
              <Field
                icon={<MapPin size={18} />}
                label="Geofence Radius (m)"
              >
                <input
                  value={radius}
                  onChange={(e) => setRadius(e.target.value)}
                  type="number"
                  min="1"
                  placeholder="100"
                  className="text-white w-full focus:outline-none bg-transparent"
                />
              </Field>

              <Field icon={<Clock size={18} />} label="Expected Clock-in Start">
                <input
                  value={clockInStart}
                  onChange={(e) => setClockInStart(e.target.value)}
                  type="time"
                  className="text-white w-full focus:outline-none bg-transparent"
                />
              </Field>

              <Field icon={<AlarmClock size={18} />} label="Clock-in Deadline">
                <input
                  value={clockInDeadline}
                  onChange={(e) => setClockInDeadline(e.target.value)}
                  type="time"
                  className="text-white w-full focus:outline-none bg-transparent"
                />
              </Field>
            </div>

            {/* error + success messages */}
            {errorMessage && (
              <p className="text-red-500 mt-5">{errorMessage}</p>
            )}
            {successMessage && (
              <p className="text-text-green mt-5">{successMessage}</p>
            )}

            {/* submit button */}
            <button
              type="submit"
              className="flex items-center mt-5 py-5 gap-3 justify-center w-full primary-btn"
            >
              <span className="font-bold text-lg">
                {isLoading ? (
                  <Loader2 className="animate-spin" size={32} />
                ) : (
                  "Create Account & Configure School"
                )}
              </span>
              {!isLoading && <ArrowRight />}
            </button>
          </form>

          {/* line */}
          <div className="w-full h-0.5 bg-text-secondary/20 mt-8" />

          {/* back to login */}
          <p className="mt-5 text-center text-text-secondary">
            Already have an account?
            <button
              onClick={() => navigate("/login")}
              className="text-primary ml-1 hover:text-text-secondary hover:cursor-pointer transition-all duration-300"
            >
              Sign in
            </button>
          </p>

          {/* back nav */}
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors mt-5 hover:cursor-pointer mx-auto"
          >
            <ArrowLeft size={16} /> Back to login
          </button>
        </div>
      </div>

      <p className="mt-2 text-text-secondary/50 text-center">
        Secure School Management System - SchooLynk v3.2.0 - ISO 27001 Certified
      </p>
    </div>
  );
}
