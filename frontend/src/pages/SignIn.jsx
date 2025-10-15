import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaGoogle,
  FaUser,
} from "react-icons/fa";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
} from "firebase/auth";
import { auth } from "../components/Firebase";




const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showSignUp, setShowSignUp] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError("");
  };

  const handleEmailPasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (showSignUp) {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );

        await updateProfile(userCredential.user, {
          displayName: formData.name,
        });

        console.log("User created successfully:", userCredential.user);
        // Redirect to homepage after successful sign up
        navigate("/", { replace: true });
      } else {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
        console.log("User signed in successfully:", userCredential.user);
        // Redirect to homepage after successful sign in
        navigate("/", { replace: true });
      }
    } catch (error) {
      console.error("Authentication error:", error);
      setError(getErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");

    try {
      const provider = new GoogleAuthProvider();
      provider.addScope("profile");
      provider.addScope("email");

      provider.setCustomParameters({
        prompt: "select_account",
      });

      const result = await signInWithPopup(auth, provider);
      console.log("Google sign in successful:", result.user);
      // Redirect to homepage after successful Google sign-in
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Google sign in error:", error);
      setError(getErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case "auth/email-already-in-use":
        return "This email is already registered. Please sign in instead.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/weak-password":
        return "Password should be at least 6 characters.";
      case "auth/user-not-found":
        return "No account found with this email.";
      case "auth/wrong-password":
        return "Incorrect password. Please try again.";
      case "auth/too-many-requests":
        return "Too many attempts. Please try again later.";
      case "auth/popup-closed-by-user":
        return "Google sign in was cancelled.";
      case "auth/account-exists-with-different-credential":
        return "An account already exists with the same email address but different sign-in credentials.";
      case "auth/popup-blocked":
        return "Popup was blocked by browser. Please allow popups for this site.";
      case "auth/unauthorized-domain":
        return "This domain is not authorized for OAuth operations.";
      default:
        return errorCode || "An error occurred. Please try again.";
    }
  };

  return (
    <div className="bg-gradient-to-b from-blue-100 to-blue-50 flex items-center justify-center min-h-screen">
      <div className="flex w-[850px] h-[550px] bg-white rounded-2xl shadow-lg overflow-hidden">
        {showSignUp ? (
          <>
            <div className="bg-gradient-to-r from-blue-500 to-blue-700 flex flex-col items-center justify-center w-1/2 p-10 text-white">
              <h2 className="mb-4 text-2xl font-bold">Welcome !</h2>
              <p className="mb-6 text-center">
                Enter your personal details and start your journey with us
              </p>
              <button
                onClick={() => {
                  setShowSignUp(false);
                  setError("");
                }}
                className="hover:bg-white hover:text-blue-600 px-8 py-2 transition border-2 border-white rounded-full"
              >
                SIGN IN
              </button>
              <p className="mt-4 text-sm text-white text-center">
                Already have an account? Click Sign In to log in.
              </p>
            </div>

            <div className="flex flex-col items-center justify-center w-1/2 p-10">
              <h2 className="mb-6 text-2xl font-bold text-gray-900">
                Create Account
              </h2>

              {error && (
                <div className="w-full p-3 mb-4 text-sm text-red-700 bg-red-100 border border-red-300 rounded-md">
                  {error}
                </div>
              )}

              <form onSubmit={handleEmailPasswordSubmit} className="w-full">
                <div className="focus-within:ring-2 focus-within:ring-blue-500 flex items-center w-full px-3 py-2 mb-4 border border-gray-300 rounded-md">
                  <FaUser className="mr-2 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={formData.name}
                    onChange={handleChange}
                    className="flex-1 outline-none"
                    required
                  />
                </div>

                <div className="focus-within:ring-2 focus-within:ring-blue-500 flex items-center w-full px-3 py-2 mb-4 border border-gray-300 rounded-md">
                  <FaEnvelope className="mr-2 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    className="flex-1 outline-none"
                    required
                  />
                </div>

                <div className="focus-within:ring-2 focus-within:ring-blue-500 flex items-center w-full px-3 py-2 mb-2 border border-gray-300 rounded-md">
                  <FaLock className="mr-2 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className="flex-1 outline-none"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="focus:outline-none"
                  >
                    {showPassword ? (
                      <FaEyeSlash className="text-gray-500" />
                    ) : (
                      <FaEye className="text-gray-500" />
                    )}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full px-8 py-2 mb-6 text-white transition rounded-full shadow-md ${
                    loading
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {loading ? "CREATING ACCOUNT..." : "SIGN UP"}
                </button>
              </form>

              <div className="flex items-center w-full my-2">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="mx-2 text-sm text-gray-500">
                  or sign up with
                </span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>

              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className={`flex items-center justify-center w-full gap-2 px-6 py-2 transition border border-gray-300 rounded-full ${
                  loading
                    ? "cursor-not-allowed opacity-50"
                    : "hover:bg-gray-100"
                }`}
              >
                <FaGoogle className="text-blue-600" />
                Continue with Google
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center justify-center w-1/2 p-10">
              <h2 className="mb-6 text-2xl font-bold text-gray-900">Sign In</h2>

              {error && (
                <div className="w-full p-3 mb-4 text-sm text-red-700 bg-red-100 border border-red-300 rounded-md">
                  {error}
                </div>
              )}

              <form onSubmit={handleEmailPasswordSubmit} className="w-full">
                <div className="focus-within:ring-2 focus-within:ring-blue-500 flex items-center w-full px-3 py-2 mb-4 border border-gray-300 rounded-md">
                  <FaEnvelope className="mr-2 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    className="flex-1 outline-none"
                    required
                  />
                </div>

                <div className="focus-within:ring-2 focus-within:ring-blue-500 flex items-center w-full px-3 py-2 mb-2 border border-gray-300 rounded-md">
                  <FaLock className="mr-2 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className="flex-1 outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="focus:outline-none"
                  >
                    {showPassword ? (
                      <FaEyeSlash className="text-gray-500" />
                    ) : (
                      <FaEye className="text-gray-500" />
                    )}
                  </button>
                </div>

                <a
                  href="#"
                  className="hover:underline self-start mb-10 text-sm text-blue-600"
                >
                  Forgot your password?
                </a>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full px-8 py-2 mb-4 text-white transition rounded-full shadow-md ${
                    loading
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {loading ? "SIGNING IN..." : "SIGN IN"}
                </button>
              </form>

              <div className="flex items-center w-full my-2">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="mx-2 text-sm text-gray-500">
                  or continue with
                </span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>

              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className={`flex items-center justify-center w-full gap-2 px-6 py-2 transition border border-gray-300 rounded-full ${
                  loading
                    ? "cursor-not-allowed opacity-50"
                    : "hover:bg-gray-100"
                }`}
              >
                <FaGoogle className="text-blue-600" />
                Continue with Google
              </button>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-blue-700 flex flex-col items-center justify-center w-1/2 p-10 text-white">
              <h2 className="mb-4 text-2xl font-bold">Welcome Back!</h2>
              <p className="mb-6 text-center">
                Enter your personal details and start your journey with us
              </p>
              <button
                onClick={() => {
                  setShowSignUp(true);
                  setError("");
                }}
                className="hover:bg-white hover:text-blue-600 px-8 py-2 transition border-2 border-white rounded-full"
              >
                SIGN UP
              </button>
              <p className="mt-4 text-sm text-white text-center">
                New here? Click Sign Up to create an account.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SignIn;
