import React, { useState } from "react";
import {
  School,
  ShieldCheck,
  GraduationCap,
  Mail,
  LockIcon,
  Eye,
  EyeClosed,
  ArrowRight,
  Loader,
  Loader2,
} from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "../config/supabase.js";

export default function Login() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("admin");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  //handle form submit.
  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage("");
    setIsLoading(true);

    //log in user with email and password.
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage("Incorrect email or password");
      setIsLoading(false);
      return;
    }

    //fetch the user profile.
    const { data: profile, error: errorProfile } = await supabase
      .from("profiles")
      .select("role, status")
      .eq("id", data.user.id)
      .single();

    if (errorProfile) {
      setErrorMessage("Your user profile could not be found");
      setIsLoading(false);
      return;
    }

    if (profile.status !== "active") {
      await supabase.auth.signOut();
      setErrorMessage("Your account is not active. Contact the administrator");
      setIsLoading(false);
      return;
    }

    if (profile.role !== selectedRole) {
      setErrorMessage(
        `This account is registered as ${profile.role} not as ${selectedRole}`,
      );
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    //if all successful
    //redirect user to their dashboard
    if (profile.role === "admin") {
      navigate("/admin/dashboard");
    }

    if (profile.role === "teacher") {
      navigate("/teacher/dashboard");
    }
  };
  return (
    <div className="min-h-screen w-full py-8 px-10 bg-background">
      {/* logo -section */}
      <div>
        {/* left side */}
        <div className="flex items-center gap-5">
          {/* icon */}
          <div className="flex items-center justify-center bg-primary h-15 w-15 rounded-xl">
            <School size={40} />
          </div>
          {/* text */}
          <div>
            <h1 className="text-white font-bold text-3xl">SchooLynk</h1>
            <p className="text-text-secondary font-semibold">
              School Management System
            </p>
          </div>
        </div>
      </div>

      {/* actual login form */}
      <div className="h-screen w-full flex items-center justify-center">
        {/* form container */}
        <div className="flex flex-col justify-center bg-card rounded-2xl px-8 py-10 w-[600px] border border-text-secondary/20 shadow-xl">
          {/* heading */}
          <div className="text-center">
            <h1 className="text-4xl text-white font-bold mb-5">
              Sign in to SchooLynk
            </h1>
            <p className="text-text-secondary">
              Primary school desktop administration platform
            </p>
          </div>

          {/* role toggle */}
          <div className="flex w-full mt-10 bg-background p-1 rounded-xl">
            {/* admin button */}
            <button
              type="button"
              onClick={() => setSelectedRole("admin")}
              className={`flex flex-1 gap-3  rounded-xl items-center hover:cursor-pointer hover:border-primary/30 border border-transparent justify-center py-3 ${selectedRole === "admin" ? "bg-card text-white" : "bg-transparent text-text-secondary"} transition-all duration-300`}
            >
              <ShieldCheck className="text-primary" />
              <span>Admin</span>
            </button>
            {/* teacher button */}
            <button
              type="button"
              onClick={() => setSelectedRole("teacher")}
              className={`flex flex-1 gap-3  rounded-xl items-center border border-transparent hover:border-primary/30 hover:cursor-pointer justify-center py-3 ${selectedRole === "teacher" ? "bg-card text-white" : "bg-transparent text-text-secondary"} transition-all duration-300`}
            >
              <GraduationCap className="text-primary" />
              <span className="text-white">Teacher</span>
            </button>
          </div>

          {/* //actual form */}
          <form onSubmit={handleSubmit} className="w-full mt-7">
            {/* email */}
            <label htmlFor="email" className="text-white">
              Email Address
            </label>
            <div className="flex mt-3 mb-5 bg-background rounded-xl py-3 px-4 focus-within:ring-2 focus-within:ring-primary transition-all duration-300">
              <Mail className="text-text-secondary" />
              <input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder={`${selectedRole === "admin" ? "admin@gmail.com" : "s.john@gmail.com"}`}
                className="text-white w-full focus:outline-none ml-5 "
              />
            </div>

            {/* password */}
            <div className="flex justify-between">
              <label htmlFor="password" className="text-white ">
                Password
              </label>

              <p className="text-primary hover:text-text-secondary hover:cursor-pointer">
                Forgot password?
              </p>
            </div>

            <div className="flex mt-3 bg-background rounded-xl py-3 px-4 focus-within:ring-2 focus-within:ring-primary transition-all duration-300">
              <LockIcon className="text-text-secondary" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="text-white w-full focus:outline-none ml-5 "
              />

              {/* eye icon */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {" "}
                {showPassword ? (
                  <Eye className="text-text-secondary" />
                ) : (
                  <EyeClosed className="text-text-secondary" />
                )}
              </button>
            </div>

            {/* remember me */}
            <div className="flex items-center gap-3 mt-5">
              {/* check box */}
              <input
                id="remember"
                type="checkbox"
                className="w-4 h-4 accent-primary cursor-pointer"
              />
              {/* text */}
              <label htmlFor="remember" className="text-text-secondary">
                Remember me
              </label>
            </div>

            {/* submit button */}
            <button
              type="submit"
              className="flex items-center mt-5 py-5 gap-3 justify-center w-full primary-btn"
            >
              <span className="font-bold text-lg">
                {isLoading ? (
                  <Loader2 className="animate-spin" size={32} />
                ) : selectedRole === "admin" ? (
                  "Sign in as Admin"
                ) : (
                  "Sign in as Teacher"
                )}
              </span>
              {!isLoading && <ArrowRight />}
            </button>
          </form>

          {/* error message */}
          <p className="text-primary mt-5">{errorMessage}</p>

          {/* line */}
          <div className="w-full h-0.5 bg-text-secondary/20  mt-8" />

          {selectedRole === "admin" && (
            <p className="mt-5 text-center text-text-secondary">
              {" "}
              Need an account?
              <span className="text-primary ml-1 hover:cursor-pointer hover:text-text-secondary transition-all duration-300">
                Create Account
              </span>
            </p>
          )}
        </div>
      </div>

      <p className="mt-10 text-text-secondary/50 text-center">
        Secure School Management System - SchooLynk v3.2.0 - ISO 27001 Certified
      </p>
    </div>
  );
}
