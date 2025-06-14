import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {useNavigate} from 'react-router-dom'

const AuthToggle = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  // Define the toggleForm function
  const toggleForm = () => {
    setIsLogin((prev) => !prev);
    reset(); // Optionally reset the form when toggling
  };

  // ...existing code...

const onSubmit = async (data) => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/token/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: data.email,  // Django's default User model uses username
            password: data.password,
          }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Authentication failed');
      }

      const response = await res.json();
      
      if (response.access) {
        // Store tokens properly
        localStorage.setItem("token", response.access);
        localStorage.setItem("refresh_token", response.refresh);
        localStorage.setItem("user", JSON.stringify({
          email: data.email,
          username: data.email  // Store username as email for consistency
        }));
        
        toast.success("Successfully logged in!");
        navigate("/tasks");
      } else {
        throw new Error('No access token received');
      }
    } catch (error) {
      toast.error(error.message);
      console.error("Error:", error);
    }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold">
            {isLogin ? "Login" : "Sign Up"}
          </h2>
          <p className="mt-2 text-gray-600">
            {isLogin ? "Welcome back!" : "Create your account"}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                {...register("username", {
                  required: !isLogin && "Username is required",
                  minLength: {
                    value: 3,
                    message: "Username must be at least 3 characters",
                  },
                })}
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.username.message}
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              type="email"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
              type="password"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isLogin ? "Sign In" : "Sign Up"}
            </button>
          </div>
        </form>

        <div className="text-center">
          <button
            onClick={toggleForm}
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthToggle;