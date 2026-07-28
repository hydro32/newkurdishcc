export const getUserAvatar = (username: string): string | null => {
  if (!username) return null;
  if (typeof window === "undefined") return null;
  try {
    const savedAvatars = JSON.parse(localStorage.getItem("user_profile_avatars") || "{}");
    return savedAvatars[username] || null;
  } catch (e) {
    return null;
  }
};