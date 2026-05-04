import axiosInstance from "../axios";

// No need to pass 'token' anymore! Axios interceptor handles it.
export async function getTherapistProfile() {
  const res = await axiosInstance.get("/therapist/profile/me/");
  return res.data;
}

export async function updateTherapistProfile(data: any) {
  // Use FormData if you are uploading a profile picture
  const isMultipart = data.profile_picture instanceof File;

  const res = await axiosInstance.patch("/therapist/profile/update/", data, {
    headers: {
      "Content-Type": isMultipart ? "multipart/form-data" : "application/json",
    },
  });
  return res.data;
}
