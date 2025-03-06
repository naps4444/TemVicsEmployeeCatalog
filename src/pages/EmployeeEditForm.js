"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import useEmployeeStore from "@/store/employeeStore"; // Import Zustand store

const EmployeeEditForm = ({ user, onUpdate, onCancel }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { setUser } = useEmployeeStore(); // Zustand function to update the user state
  const [previewImage, setPreviewImage] = useState(user?.image || "");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      age: user?.age || "",
      education: user?.education || "",
      state: user?.state || "",
      religion: user?.religion || "",
      department: user?.department || "",
      role: user?.role || "",
      image: user?.image || "",
    },
  });

  useEffect(() => {
    if (user) {
      Object.keys(user).forEach((key) => setValue(key, user[key] || ""));
    }
  }, [user, setValue]);

  // Ensure session is fully loaded before accessing user data
  if (status === "loading") {
    return <p>Loading session...</p>;
  }

  if (!session?.user) {
    return <p className="text-red-500">Session data not available. Please log in.</p>;
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    if (!file.type.startsWith("image/")) {
      if (typeof window !== "undefined") {
        alert("Please upload a valid image file.");
      }
      return;
    }
  
    const maxSizeInBytes = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSizeInBytes) {
      if (typeof window !== "undefined") {
        alert("File size exceeds the 2MB limit.");
      }
      return;
    }
  
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
      setValue("image", reader.result, { shouldValidate: true });
  
      // ✅ Immediately update Zustand store with the new image
      setUser((prevUser) => ({ ...prevUser, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };
  

  const onSubmit = async (data) => {
    const updatedUser = { ...user, ...data };

    await onUpdate(updatedUser);

    // ✅ Update Zustand store to reflect changes immediately in Navbar
    setUser(updatedUser);

    // ✅ Re-authenticate to refresh session (but do not reload the page)
    await signIn("credentials", { 
      redirect: false,
      email: updatedUser.email, 
      password: user.password,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 w-full space-y-4">
      <div>
        <label className="block font-medium text-gray-700">Profile Image</label>
        {previewImage && <img src={previewImage} alt="Profile Preview" className="w-32 h-32 rounded-full object-cover mb-2" />}
        <input type="file" accept="image/*" onChange={handleImageChange} className="w-full p-2 border rounded" />
        {errors.image && <p className="text-red-500">{errors.image.message}</p>}
      </div>

      {[
        { name: "age", label: "Age", type: "number", min: 18, max: 65 },
        { name: "education", label: "Education", type: "text" },
        { name: "state", label: "State", type: "text" },
        { name: "religion", label: "Religion", type: "text" },
        { name: "department", label: "Department", type: "text" },
      ].map(({ name, label, type, min, max }) => (
        <div key={name}>
          <label className="block font-medium text-gray-700">{label}</label>
          <input
            type={type}
            {...register(name, {
              required: `${label} is required`,
              ...(min !== undefined ? { min: { value: min, message: `Minimum ${label.toLowerCase()} is ${min}` } } : {}),
              ...(max !== undefined ? { max: { value: max, message: `Maximum ${label.toLowerCase()} is ${max}` } } : {}),
            })}
            className="w-full p-2 border rounded"
          />
          {errors[name] && <p className="text-red-500">{errors[name].message}</p>}
        </div>
      ))}

      <button type="submit" className="bg-green-500 text-white px-5 py-2 rounded-md w-full">
        Save Changes
      </button>
      <button type="button" onClick={onCancel} className="bg-gray-500 text-white px-5 py-2 rounded-md w-full">
        Cancel
      </button>
    </form>
  );
};

export default EmployeeEditForm;
