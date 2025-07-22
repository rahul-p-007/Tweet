import { useState } from "react";
import { FaEye, FaUser } from "react-icons/fa";
import {
  MdDriveFileRenameOutline,
  MdOutlineMail,
  MdPassword,
} from "react-icons/md";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

function FormModel({ formData, handleInputChange, isPending }) {
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  const [passwordVisible, setPasswordVisible] = useState(false);

  const handlePasswordChange = (e) => {
    handleInputChange(e);
    const password = e.target.value;

    setPasswordChecks({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[\W_]/.test(password),
    });
  };

  const renderCheck = (condition, label) => (
    <li className="flex items-center gap-2 text-sm">
      {condition ? (
        <FaCheckCircle className="text-green-500" />
      ) : (
        <FaTimesCircle className="text-red-500" />
      )}
      {label}
    </li>
  );

  return (
    <div>
      <div
        className="btn rounded-full bg-white text-black btn-outline w-full"
        onClick={() => document.getElementById("my_modal_3").showModal()}
      >
        Create an Account
      </div>

      <dialog id="my_modal_3" className="modal">
        <div className="modal-box">
          <div method="dialog">
            {/* Email */}
            <label className="input input-bordered rounded flex items-center gap-2 mb-4">
              <MdOutlineMail />
              <input
                type="email"
                //   className="grow"
                className="grow bg-transparent text-white placeholder:text-gray-400 focus:outline-none"
                placeholder="Email"
                name="email"
                onChange={handleInputChange}
                value={formData.email}
              />
            </label>

            {/* Username and Full Name */}
            <div className="flex gap-4 flex-wrap">
              <label className="input input-bordered rounded flex items-center gap-2 flex-1 mb-4">
                <FaUser />
                <input
                  type="text"
                  className="grow bg-transparent text-white placeholder:text-gray-400 focus:outline-none"
                  placeholder="Username"
                  name="username"
                  onChange={handleInputChange}
                  value={formData.username}
                />
              </label>
              <label className="input input-bordered rounded flex items-center gap-2 flex-1 mb-4">
                <MdDriveFileRenameOutline />
                <input
                  type="text"
                  className="grow bg-transparent text-white placeholder:text-gray-400 focus:outline-none"
                  placeholder="Full Name"
                  name="fullName"
                  onChange={handleInputChange}
                  value={formData.fullName}
                />
              </label>
            </div>

            {/* Password */}
            <label className="input input-bordered rounded flex items-center gap-2 mb-2">
              <MdPassword />
              <input
                type={`${passwordVisible ? "text" : "password"}`}
                className="grow bg-transparent text-white placeholder:text-gray-400 focus:outline-none"
                placeholder="Password"
                name="password"
                onChange={handlePasswordChange}
                value={formData.password}
              />
              <span>
                <FaEye
                  className="text-white"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                />
              </span>
            </label>

            {/* Password Checklist */}
            {formData.password && (
              <ul className="mb-4 ml-1 space-y-1">
                {renderCheck(passwordChecks.length, "At least 8 characters")}
                {renderCheck(
                  passwordChecks.uppercase,
                  "At least one uppercase letter"
                )}
                {renderCheck(
                  passwordChecks.lowercase,
                  "At least one lowercase letter"
                )}
                {renderCheck(passwordChecks.number, "At least one number")}
                {renderCheck(
                  passwordChecks.special,
                  "At least one special character"
                )}
              </ul>
            )}
          </div>

          <button className="btn w-full btn-primary text-white">
            {isPending ? "Loading........." : "Submit"}
          </button>
        </div>
      </dialog>
    </div>
  );
}

export default FormModel;
