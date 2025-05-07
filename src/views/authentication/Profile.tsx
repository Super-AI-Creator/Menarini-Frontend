import { useState, useEffect,useContext } from "react";
import { Button, Label, TextInput, Alert, Spinner, Avatar, Badge } from "flowbite-react";
import { Link } from "react-router-dom";
import { HiUser, HiShieldCheck, HiClock } from "react-icons/hi";
import { AuthContext } from 'src/context/AuthContext';

interface UserData {
  name: string;
  email: string;
  role: string;
  avatar?: string;
  joinedDate?: string;
}

const Profile = () => {
  // Password state
  const context = useContext(AuthContext);
  if (!context) throw new Error('AuthContext must be used within AuthContextProvider');
  const { user } = context;
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // User data state
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [userDataError, setUserDataError] = useState("");

  // Fetch user data on component mount

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    try {
      const response = await fetch("/api2/auth/change_password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
            "email":user["email"],
          currentPassword,
          newPassword,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Password change failed.");
      }

      setMessage("Password successfully updated!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow rounded-lg">
      <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
      
      {userDataError && (
        <Alert color="failure" className="mb-6">
          {userDataError}
        </Alert>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        {/* User Info Section */}
        <div className="md:col-span-1">
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex flex-col items-center mb-4">
                <Avatar
                  alt="User avatar"
                  rounded
                  size="xl"
                  className="mb-3 bg-gray-200"
                  placeholderInitials={user?.name ? user.name.charAt(0) : "U"}
                  stacked
                />
              <h2 className="text-xl font-semibold">{user?.name || "User"}</h2>
              <Badge color="info" className="mt-2">
                {user?.role || "Member"}
              </Badge>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{user?.email || "Not provided"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Password Change Section */}
        <div className="md:col-span-2">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Change Password</h2>
            <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <TextInput
                  id="currentPassword"
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <TextInput
                  id="newPassword"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <TextInput
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <div className="flex justify-between items-center mt-2">
                <Button type="submit">Update Password</Button>
                <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
            </form>

            {error && (
              <Alert color="failure" className="mt-4">
                {error}
              </Alert>
            )}
            {message && (
              <Alert color="success" className="mt-4">
                {message}
              </Alert>
            )}
          </div>

          
        </div>
      </div>
    </div>
  );
};

export default Profile;