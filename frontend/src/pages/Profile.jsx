
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Profile() {
  const navigate = useNavigate();

  const email = sessionStorage.getItem("userEmail") || "";
  const role = sessionStorage.getItem("userRole") || "";

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    role: "",
  });

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
  });

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const API_URL = "http://127.0.0.1:5000";

  useEffect(() => {
    if (!email) {
      setError("Please log in to view your profile.");
      setLoading(false);
      return;
    }

    fetchProfile();
  }, [email]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/profile/${encodeURIComponent(email)}`
      );

      const user = response.data;

      setProfile(user);

      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
      });
    } catch (err) {
      console.error("PROFILE ERROR:", err);
      setError(
        err.response?.data?.message || "Unable to load profile."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        name === "phone"
          ? value.replace(/\D/g, "").slice(0, 10)
          : value,
    }));
  };

  const handleSave = async () => {
    if (saving) return;

    if (!formData.name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const response = await axios.put(
        `${API_URL}/profile/${encodeURIComponent(email)}`,
        {
          name: formData.name.trim(),
          phone: formData.phone,
          address: formData.address.trim(),
          city: formData.city.trim(),
        }
      );

      const updatedProfile = {
        ...profile,
        ...formData,
        name: formData.name.trim(),
        email,
      };

      setProfile(updatedProfile);

      sessionStorage.setItem("userName", updatedProfile.name);

      setEditing(false);
      setMessage(
        response.data.message || "Profile updated successfully!"
      );
    } catch (err) {
      console.error("PROFILE UPDATE ERROR:", err);
      setError(
        err.response?.data?.message || "Unable to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: profile.name || "",
      phone: profile.phone || "",
      address: profile.address || "",
      city: profile.city || "",
    });

    setEditing(false);
    setError("");
    setMessage("");
  };

  const displayName = profile.name || "FarmConnect User";
  const displayRole = profile.role || role || "User";

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  const dashboardPath =
    displayRole.toLowerCase() === "farmer"
      ? "/farmer-dashboard"
      : "/buyer-dashboard";

  const inputClass =
    "w-full border border-gray-200 rounded-lg p-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100";

  const detail = (icon, label, value) => (
    <div className="profile-detail">
      <div className="profile-detail-icon">{icon}</div>
      <div className="min-w-0">
        <p className="profile-detail-label">{label}</p>
        <p className="profile-detail-value">
          {value || "Not added"}
        </p>
      </div>
    </div>
  );

  return (
    <div className="profile-page">
      <style>{`
        .profile-page {
          min-height: 100vh;
          padding: 36px 20px 48px;
          background: linear-gradient(145deg, #f2f8f1, #f7faf7 55%, #eaf4e9);
          color: #203528;
          font-family: Inter, Arial, sans-serif;
        }

        .profile-container { max-width: 960px; margin: 0 auto; }
        .profile-topbar {
          display: flex; align-items: center; justify-content: space-between;
          gap: 16px; margin-bottom: 28px; flex-wrap: wrap;
        }
        .profile-brand { display: flex; align-items: center; gap: 12px; }
        .profile-brand-icon {
          display: grid; place-items: center; width: 46px; height: 46px;
          border-radius: 14px; background: #176b42; color: white; font-size: 24px;
        }
        .profile-brand h2 { margin: 0; font-size: 19px; font-weight: 800; }
        .profile-brand p { margin: 4px 0 0; color: #718176; font-size: 12px; }
        .profile-btn {
          border: 1px solid #d8e5d9; background: white; color: #28553b;
          padding: 11px 16px; border-radius: 10px; font-weight: 700; cursor: pointer;
          transition: 0.2s ease;
        }
        .profile-btn:hover { transform: translateY(-1px); box-shadow: 0 5px 15px #173b2512; }
        .profile-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .profile-primary-btn { border-color: #176b42; background: #176b42; color: white; }
        .profile-heading { margin-bottom: 22px; }
        .profile-heading h1 { margin: 0; font-size: clamp(27px, 4vw, 35px); letter-spacing: -1px; }
        .profile-heading p { margin: 9px 0 0; color: #708075; font-size: 14px; line-height: 1.6; }
        .profile-card {
          overflow: hidden; background: white; border: 1px solid #e0eae0;
          border-radius: 20px; box-shadow: 0 12px 36px #25462d0a; margin-bottom: 22px;
        }
        .profile-banner {
          height: 112px;
          background:
            radial-gradient(circle at 82% 15%, #ffffff30 0 38px, transparent 39px),
            radial-gradient(circle at 92% 100%, #ffffff20 0 70px, transparent 71px),
            linear-gradient(110deg, #155c39, #2f8956);
        }
        .profile-identity {
          padding: 0 30px 28px; display: flex; align-items: flex-end;
          gap: 20px; flex-wrap: wrap;
        }
        .profile-avatar {
          display: grid; place-items: center; flex-shrink: 0; width: 94px;
          height: 94px; margin-top: -43px; border: 5px solid white;
          border-radius: 24px; background: #e0f1e3; color: #176b42;
          font-size: 29px; font-weight: 800;
        }
        .profile-identity-info { flex: 1; min-width: 180px; padding-top: 15px; }
        .profile-identity-info h2 { margin: 0 0 8px; font-size: 23px; overflow-wrap: anywhere; }
        .profile-identity-info p { margin: 0; color: #7a887e; font-size: 13px; overflow-wrap: anywhere; }
        .profile-role {
          display: inline-flex; align-items: center; gap: 7px; padding: 8px 12px;
          margin-top: 12px; border-radius: 30px; background: #eaf6ec;
          color: #216b3e; font-size: 12px; font-weight: 800;
        }
        .profile-section { padding: 25px 30px; border-top: 1px solid #edf1ed; }
        .profile-section h3 { margin: 0 0 20px; font-size: 16px; }
        .profile-details {
          display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px;
        }
        .profile-detail {
          display: flex; align-items: flex-start; gap: 13px; min-width: 0;
          padding: 17px; border: 1px solid #e8eee8; border-radius: 13px; background: #fcfdfc;
        }
        .profile-detail-icon {
          display: grid; place-items: center; flex-shrink: 0; width: 38px;
          height: 38px; border-radius: 11px; background: #edf6ee; font-size: 17px;
        }
        .profile-detail-label { margin: 1px 0 7px; color: #7a887e; font-size: 12px; }
        .profile-detail-value { margin: 0; font-size: 14px; font-weight: 700; overflow-wrap: anywhere; }
        .profile-security {
          display: flex; gap: 14px; align-items: flex-start; padding: 18px;
          border: 1px solid #dcecdf; border-radius: 14px; background: #f5fbf5;
        }
        .profile-security-icon { font-size: 22px; }
        .profile-security h4 { margin: 0 0 6px; font-size: 14px; }
        .profile-security p { margin: 0; color: #718176; font-size: 13px; line-height: 1.6; }
        .profile-actions {
          display: flex; justify-content: flex-end; gap: 12px;
          flex-wrap: wrap; margin-top: 24px;
        }
        .profile-footer { margin-top: 25px; color: #87948a; font-size: 12px; text-align: center; }
        @media (max-width: 600px) {
          .profile-page { padding: 24px 14px 35px; }
          .profile-identity { padding: 0 20px 23px; gap: 10px; }
          .profile-avatar { width: 76px; height: 76px; border-radius: 20px; }
          .profile-identity-info h2 { font-size: 19px; }
          .profile-section { padding: 22px 18px; }
          .profile-details { grid-template-columns: 1fr; }
          .profile-actions { justify-content: stretch; }
          .profile-actions button { flex: 1; }
        }
      `}</style>

      <div className="profile-container">
        <header className="profile-topbar">
          <div className="profile-brand">
            <div className="profile-brand-icon">🌱</div>
            <div>
              <h2>FarmConnect AI</h2>
              <p>Your smart farming companion</p>
            </div>
          </div>

          <button className="profile-btn" onClick={() => navigate(-1)}>
            ← Go Back
          </button>
        </header>

        <div className="profile-heading">
          <h1>My Profile</h1>
          <p>Manage your account information and contact details.</p>
        </div>

        {message && (
          <div className="mb-5 rounded-lg bg-green-100 p-3 text-green-800">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-lg bg-red-100 p-3 text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="profile-card p-10 text-center text-gray-600">
            Loading your profile...
          </div>
        ) : !error || profile.email ? (
          <>
            <section className="profile-card">
              <div className="profile-banner" />

              <div className="profile-identity">
                <div className="profile-avatar">{initials || "FC"}</div>

                <div className="profile-identity-info">
                  <h2>{displayName}</h2>
                  <p>{profile.email || email}</p>
                  <span className="profile-role">
                    ● {displayRole} Account
                  </span>
                </div>
              </div>

              <div className="profile-section">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                  <h3 className="!mb-0">Account Information</h3>

                  {!editing && (
                    <button
                      className="profile-btn profile-primary-btn"
                      onClick={() => {
                        setMessage("");
                        setError("");
                        setEditing(true);
                      }}
                    >
                      ✏️ Edit Profile
                    </button>
                  )}
                </div>

                {editing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="text-sm font-semibold">
                      Full Name
                      <input
                        className={`${inputClass} mt-2`}
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your name"
                      />
                    </label>

                    <label className="text-sm font-semibold">
                      Email Address
                      <input
                        className={`${inputClass} mt-2 bg-gray-100`}
                        value={email}
                        disabled
                      />
                    </label>

                    <label className="text-sm font-semibold">
                      Phone Number
                      <input
                        className={`${inputClass} mt-2`}
                        name="phone"
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter 10-digit mobile number"
                      />
                    </label>

                    <label className="text-sm font-semibold">
                      City
                      <input
                        className={`${inputClass} mt-2`}
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Enter your city"
                      />
                    </label>

                    <label className="text-sm font-semibold md:col-span-2">
                      Address
                      <textarea
                        className={`${inputClass} mt-2`}
                        name="address"
                        rows={3}
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Enter your address"
                      />
                    </label>
                  </div>
                ) : (
                  <div className="profile-details">
                    {detail("👤", "Full Name", profile.name)}
                    {detail("✉️", "Email Address", profile.email)}
                    {detail("📱", "Phone Number", profile.phone)}
                    {detail("🏙️", "City", profile.city)}
                    {detail("📍", "Address", profile.address)}
                    {detail("🌾", "Account Type", displayRole)}
                  </div>
                )}
              </div>

              <div className="profile-section">
                <h3>Account Security</h3>
                <div className="profile-security">
                  <div className="profile-security-icon">🛡️</div>
                  <div>
                    <h4>Your account details</h4>
                    <p>
                      Your contact information helps other users reach you
                      about orders. Keep your login credentials private.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <div className="profile-actions">
              {editing ? (
                <>
                  <button
                    className="profile-btn"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    className="profile-btn profile-primary-btn"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </>
              ) : (
                <button
                  className="profile-btn profile-primary-btn"
                  onClick={() => navigate(dashboardPath)}
                >
                  Go to Dashboard →
                </button>
              )}
            </div>
          </>
        ) : null}

        <footer className="profile-footer">
          FarmConnect AI · Smart farming, connected communities
        </footer>
      </div>
    </div>
  );
}

export default Profile;
