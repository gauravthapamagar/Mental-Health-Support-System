const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export async function getTherapistProfile(token: string) {
  const res = await fetch(`${API_BASE}/therapist/profile/me/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
}

export async function updateTherapistProfile(token: string, data: any) {
  const res = await fetch(`${API_BASE}/therapist/profile/update/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to update profile");
  return res.json();
}
