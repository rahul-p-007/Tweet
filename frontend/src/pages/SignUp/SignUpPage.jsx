import { Link } from "react-router-dom";
import { useState } from "react";

import { MdOutlineMail } from "react-icons/md";
import { FaApple, FaGoogle, FaUser } from "react-icons/fa";
import { MdPassword } from "react-icons/md";
import { MdDriveFileRenameOutline } from "react-icons/md";
import XSvg from "../../components/svg/XSvg";
import FormModel from "./FormModel";

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    fullName: "",
    password: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormData({
      email: "",
      username: "",
      fullName: "",
      password: "",
    });
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isError = false;

  return (
    <div className="max-w-screen-xl mx-auto flex h-screen px-10">
      <div className="flex-1 hidden lg:flex items-center  justify-center">
        <XSvg className=" lg:w-2/3 fill-white" />
      </div>
      <div className="flex-1 flex flex-col justify-center items-center">
        <form
          className="lg:w-2/3  mx-auto md:mx-20 flex gap-4 flex-col"
          onSubmit={handleSubmit}
        >
          <XSvg className="w-24 lg:hidden fill-white" />
          <h1 className="text-4xl font-extrabold text-white">Create Account</h1>
          <div className="btn rounded-full bg-white text-black btn-outline w-full">
            <FaGoogle className="" size={20} /> Sign with Google
          </div>
          <div className="btn rounded-full bg-white text-black btn-outline w-full">
            {" "}
            <FaApple size={20} /> Sign with Apple
          </div>
          <div className="divider">OR</div>

          <FormModel
            handleSubmit={handleSubmit}
            handleInputChange={handleInputChange}
            formData={formData}
          />
          <p>
            By signing up, you agree to the Terms of Service and Privacy Policy,
            including{" "}
            <span className="link link-hover text-blue-500">Cookie Use.</span>
          </p>
          <br />
          {isError && <p className="text-red-500">Something went wrong</p>}
        </form>
        <div className="flex flex-col lg:w-2/3 gap-2 mt-4">
          <p className="text-white text-lg text-center">
            Already have an account?
          </p>
          <Link to="/login">
            <button className="btn rounded-full btn-primary text-white btn-outline w-full">
              Sign in
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};
export default SignUpPage;
