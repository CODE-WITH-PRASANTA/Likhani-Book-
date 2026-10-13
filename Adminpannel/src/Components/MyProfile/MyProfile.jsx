
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  LuUserRound,
  LuMail,
  LuShieldCheck,
  LuCamera,
  LuSave,
  LuPlus,
  LuPencil,
  LuTrash2,
  LuSearch,
  LuRefreshCw,
  LuUsers,
  LuBookOpen,
  LuMapPin,
  LuX,
  LuCheck,
  LuChevronLeft,
  LuChevronRight,
  LuLoaderCircle,
  LuCircleAlert,
} from "react-icons/lu";
import "./MyProfile.css";

const BACKEND_BASE_URL =
  import.meta.env.VITE_BASE_URL || "http://localhost:5000";

const API_BASE_URL = `${BACKEND_BASE_URL}/api/profiles`;

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80";

const INITIAL_FORM = {
  fullName: "",
  email: "",
  role: "Administrator",
  homeLocation: "",
  bio: "",
};

const getAvatarUrl = (path) => {
  if (!path) return DEFAULT_AVATAR;

  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("blob:")
  ) {
    return path;
  }

  return `${BACKEND_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

const normalizeProfile = (profile) => ({
  ...profile,
  _id: profile._id,
  name: profile.name || "",
  email: profile.email || "",
  travelerType: profile.travelerType || "Administrator",
  homeLocation: profile.homeLocation || "",
  bio: profile.bio || "",
  avatar: profile.avatar || "",
  status: profile.status || "Active",
});

const MyProfile = () => {
  const [profiles, setProfiles] = useState([]);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);
  const [avatarFile, setAvatarFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const fileInputRef = useRef(null);
  const previewUrlRef = useRef(null);

  const ITEMS_PER_PAGE = 5;

  const releasePreview = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => releasePreview();
  }, [releasePreview]);

  const fetchProfiles = useCallback(async () => {
    setFetching(true);
    setError("");

    try {
      const response = await fetch(API_BASE_URL);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load profiles.");
      }

      setProfiles(
        Array.isArray(result.data)
          ? result.data.map(normalizeProfile)
          : []
      );
    } catch (err) {
      setError(
        err.message ||
          "Unable to connect to the server. Check your backend connection."
      );
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const resetForm = () => {
    releasePreview();
    setEditingId(null);
    setFormData(INITIAL_FORM);
    setAvatar(DEFAULT_AVATAR);
    setAvatarFile(null);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Please choose a JPG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Your profile image must be smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    releasePreview();

    const preview = URL.createObjectURL(file);
    previewUrlRef.current = preview;

    setAvatarFile(file);
    setAvatar(preview);
    setError("");
  };

  const handleEdit = (profile) => {
    releasePreview();

    setEditingId(profile._id);
    setFormData({
      fullName: profile.name,
      email: profile.email,
      role: profile.travelerType || "Administrator",
      homeLocation: profile.homeLocation || "",
      bio: profile.bio || "",
    });

    setAvatar(getAvatarUrl(profile.avatar));
    setAvatarFile(null);
    setError("");
    setNotice("");

    if (fileInputRef.current) fileInputRef.current.value = "";

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!formData.fullName.trim() || !formData.email.trim()) {
      setError("Admin name and email address are required.");
      return;
    }

    setLoading(true);

    const payload = new FormData();
    payload.append("name", formData.fullName.trim());
    payload.append("email", formData.email.trim());
    payload.append("travelerType", formData.role);
    payload.append("homeLocation", formData.homeLocation.trim());
    payload.append("bio", formData.bio.trim());

    if (avatarFile) {
      payload.append("avatarFile", avatarFile);
    } else if (editingId && avatar) {
      const existingProfile = profiles.find(
        (profile) => profile._id === editingId
      );

      if (existingProfile?.avatar) {
        payload.append("avatar", existingProfile.avatar);
      }
    }

    try {
      const url = editingId
        ? `${API_BASE_URL}/${editingId}`
        : API_BASE_URL;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        body: payload,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to save the profile.");
      }

      const savedProfile = normalizeProfile(result.data);

      if (editingId) {
        setProfiles((previous) =>
          previous.map((profile) =>
            profile._id === editingId ? savedProfile : profile
          )
        );
        setNotice("Profile updated successfully.");
      } else {
        setProfiles((previous) => [savedProfile, ...previous]);
        setCurrentPage(1);
        setNotice("New profile created successfully.");
      }

      releasePreview();
      setEditingId(savedProfile._id);
      setAvatar(getAvatarUrl(savedProfile.avatar));
      setAvatarFile(null);

      setFormData({
        fullName: savedProfile.name,
        email: savedProfile.email,
        role: savedProfile.travelerType || "Administrator",
        homeLocation: savedProfile.homeLocation || "",
        bio: savedProfile.bio || "",
      });

      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setError(
        err.message ||
          "Unable to save your profile. Check the backend server."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (profile) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the profile for ${profile.name}?`
    );

    if (!confirmed) return;

    setError("");
    setNotice("");

    try {
      const response = await fetch(`${API_BASE_URL}/${profile._id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to delete the profile.");
      }

      setProfiles((previous) =>
        previous.filter((item) => item._id !== profile._id)
      );

      if (editingId === profile._id) resetForm();

      setNotice("Profile deleted successfully.");
    } catch (err) {
      setError(err.message || "Unable to delete the profile.");
    }
  };

  const filteredProfiles = profiles.filter((profile) => {
    const query = searchTerm.trim().toLowerCase();

    return (
      profile.name.toLowerCase().includes(query) ||
      profile.email.toLowerCase().includes(query) ||
      profile.travelerType.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProfiles.length / ITEMS_PER_PAGE)
  );

  const safePage = Math.min(currentPage, totalPages);

  const currentProfiles = filteredProfiles.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  const activeProfile = profiles.find(
    (profile) => profile._id === editingId
  );

  return (
    <main className="myprofile-page-wrapper">
      <section className="myprofile-banner">
        <div className="myprofile-banner-content">
          <div className="myprofile-breadcrumb">
            <LuBookOpen />
            <span>Admin Panel</span>
            <span className="myprofile-breadcrumb-separator">/</span>
            <span>My Profile</span>
          </div>

          <div className="myprofile-banner-heading">
            <div>
              <span className="myprofile-eyebrow">
                ACCOUNT MANAGEMENT
              </span>
              <h1>My Profile</h1>
              <p>
                Manage your bookstore administrator details and profile
                information.
              </p>
            </div>

            <div className="myprofile-banner-icon">
              <LuUserRound />
            </div>
          </div>
        </div>
      </section>

      <div className="myprofile-content-container">
        {error && (
          <div className="myprofile-alert myprofile-alert-error" role="alert">
            <LuCircleAlert />
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
            >
              <LuX />
            </button>
          </div>
        )}

        {notice && (
          <div className="myprofile-alert myprofile-alert-success" role="status">
            <LuCheck />
            <span>{notice}</span>
            <button
              type="button"
              onClick={() => setNotice("")}
              aria-label="Dismiss message"
            >
              <LuX />
            </button>
          </div>
        )}

        <section className="myprofile-card">
          <div className="myprofile-card-topline">
            <div className="myprofile-section-icon">
              <LuUserRound />
            </div>
            <div>
              <h2>Personal Information</h2>
              <p>Update your administrator profile details.</p>
            </div>

            <span className="myprofile-secure-badge">
              <LuShieldCheck />
              Secure profile
            </span>
          </div>

          <div className="myprofile-profile-summary">
            <div className="myprofile-avatar-wrapper">
              <img
                src={avatar}
                alt="Administrator profile"
                className="myprofile-avatar-img"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = DEFAULT_AVATAR;
                }}
              />

              <button
                type="button"
                className="myprofile-edit-badge-btn"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Upload profile image"
                title="Change profile image"
              >
                <LuCamera />
              </button>

              <input
                ref={fileInputRef}
                className="myprofile-file-input"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageUpload}
              />
            </div>

            <div className="myprofile-heading-group">
              <h3>{formData.fullName || "Bookstore Administrator"}</h3>
              <p>{formData.email || "Add your email address"}</p>
              <span className="myprofile-role-badge">
                <LuShieldCheck />
                {formData.role || "Administrator"}
              </span>
            </div>

            <span className="myprofile-avatar-hint">
              JPG, PNG or WebP · Max 5 MB
            </span>
          </div>

          <form onSubmit={handleSubmit} className="myprofile-form">
            <div className="myprofile-form-heading">
              <h3>Account Details</h3>
              <p>Fields marked with * are required.</p>
            </div>

            <div className="myprofile-form-grid">
              <div className="myprofile-form-group">
                <label htmlFor="fullName" className="myprofile-label">
                  Admin Name <span>*</span>
                </label>
                <div className="myprofile-input-wrap">
                  <LuUserRound />
                  <input
                    id="fullName"
                    className="myprofile-input"
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter administrator name"
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

              <div className="myprofile-form-group">
                <label htmlFor="email" className="myprofile-label">
                  Email Address <span>*</span>
                </label>
                <div className="myprofile-input-wrap">
                  <LuMail />
                  <input
                    id="email"
                    className="myprofile-input"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="admin@likhanibooks.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="myprofile-form-group">
                <label htmlFor="role" className="myprofile-label">
                  Administrator Role
                </label>
                <div className="myprofile-input-wrap">
                  <LuShieldCheck />
                  <select
                    id="role"
                    className="myprofile-input"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                  >
                    <option value="Administrator">Administrator</option>
                    <option value="Store Manager">Store Manager</option>
                    <option value="Content Manager">Content Manager</option>
                    <option value="Editor">Editor</option>
                  </select>
                </div>
              </div>

              <div className="myprofile-form-group">
                <label htmlFor="homeLocation" className="myprofile-label">
                  Location
                </label>
                <div className="myprofile-input-wrap">
                  <LuMapPin />
                  <input
                    id="homeLocation"
                    className="myprofile-input"
                    type="text"
                    name="homeLocation"
                    value={formData.homeLocation}
                    onChange={handleInputChange}
                    placeholder="City, State"
                    autoComplete="address-level2"
                  />
                </div>
              </div>

              <div className="myprofile-form-group myprofile-form-group-full">
                <label htmlFor="bio" className="myprofile-label">
                  About the Administrator
                </label>
                <textarea
                  id="bio"
                  className="myprofile-textarea"
                  name="bio"
                  rows="4"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Write a short introduction about your role at Likhani Books..."
                />
              </div>
            </div>

            <div className="myprofile-form-action-row">
              {editingId && (
                <button
                  type="button"
                  className="myprofile-cancel-btn"
                  onClick={resetForm}
                  disabled={loading}
                >
                  <LuPlus />
                  New Profile
                </button>
              )}

              <button
                type="button"
                className="myprofile-cancel-btn"
                onClick={() => {
                  if (activeProfile) handleEdit(activeProfile);
                  else resetForm();
                }}
                disabled={loading}
              >
                <LuRefreshCw />
                Reset
              </button>

              <button
                type="submit"
                className="myprofile-update-btn"
                disabled={loading}
              >
                {loading ? (
                  <LuLoaderCircle className="myprofile-spinner" />
                ) : editingId ? (
                  <LuSave />
                ) : (
                  <LuPlus />
                )}
                {loading
                  ? "Saving..."
                  : editingId
                    ? "Save Changes"
                    : "Create Profile"}
              </button>
            </div>
          </form>
        </section>

        <section className="myprofile-table-card">
          <div className="myprofile-table-header-row">
            <div className="myprofile-table-title-wrap">
              <div className="myprofile-section-icon">
                <LuUsers />
              </div>
              <div>
                <h2 className="myprofile-table-title-text">
                  Administrator Profiles
                </h2>
                <p>View and manage saved profiles.</p>
              </div>
            </div>

            <button
              type="button"
              className="myprofile-add-new-btn"
              onClick={resetForm}
            >
              <LuPlus />
              Add New
            </button>
          </div>

          <div className="myprofile-table-toolbar">
            <div className="myprofile-search-wrap">
              <LuSearch />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search name, email or role..."
                aria-label="Search profiles"
              />
            </div>

            <button
              type="button"
              className="myprofile-refresh-btn"
              onClick={fetchProfiles}
              disabled={fetching}
            >
              <LuRefreshCw className={fetching ? "myprofile-spinner" : ""} />
              Refresh
            </button>
          </div>

          <div className="myprofile-table-wrapper">
            <table className="myprofile-table">
              <thead className="myprofile-thead">
                <tr>
                  <th className="myprofile-th">#</th>
                  <th className="myprofile-th">Administrator</th>
                  <th className="myprofile-th">Email Address</th>
                  <th className="myprofile-th">Role</th>
                  <th className="myprofile-th">Location</th>
                  <th className="myprofile-th">Status</th>
                  <th className="myprofile-th myprofile-th-center">Actions</th>
                </tr>
              </thead>

              <tbody className="myprofile-tbody">
                {fetching ? (
                  <tr>
                    <td colSpan="7" className="myprofile-empty-row">
                      <LuLoaderCircle className="myprofile-spinner" />
                      Loading profiles...
                    </td>
                  </tr>
                ) : currentProfiles.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="myprofile-empty-row">
                      <LuUsers />
                      <strong>No profiles found</strong>
                      <span>
                        {searchTerm
                          ? "Try another search term."
                          : "Create a profile using the form above."}
                      </span>
                    </td>
                  </tr>
                ) : (
                  currentProfiles.map((profile, index) => (
                    <tr
                      key={profile._id}
                      className={
                        editingId === profile._id
                          ? "myprofile-tr myprofile-tr-active"
                          : "myprofile-tr"
                      }
                    >
                      <td className="myprofile-td">
                        {(safePage - 1) * ITEMS_PER_PAGE + index + 1}
                      </td>

                      <td className="myprofile-td">
                        <div className="myprofile-table-user-cell">
                          <img
                            src={getAvatarUrl(profile.avatar)}
                            alt=""
                            className="myprofile-table-avatar"
                            onError={(event) => {
                              event.currentTarget.onerror = null;
                              event.currentTarget.src = DEFAULT_AVATAR;
                            }}
                          />
                          <div className="myprofile-table-user-info">
                            <span className="myprofile-table-username">
                              {profile.name}
                            </span>
                            <small>Bookstore Admin</small>
                          </div>
                        </div>
                      </td>

                      <td className="myprofile-td">{profile.email}</td>
                      <td className="myprofile-td">
                        <span className="myprofile-role-table-badge">
                          {profile.travelerType || "Administrator"}
                        </span>
                      </td>
                      <td className="myprofile-td">
                        {profile.homeLocation || "—"}
                      </td>

                      <td className="myprofile-td">
                        <span className="myprofile-status-badge">
                          <span />
                          {profile.status || "Active"}
                        </span>
                      </td>

                      <td className="myprofile-td">
                        <div className="myprofile-action-buttons-group">
                          <button
                            type="button"
                            className="myprofile-action-icon-btn myprofile-action-edit"
                            title="Edit profile"
                            aria-label={`Edit ${profile.name}`}
                            onClick={() => handleEdit(profile)}
                          >
                            <LuPencil />
                          </button>

                          <button
                            type="button"
                            className="myprofile-action-icon-btn myprofile-action-delete"
                            title="Delete profile"
                            aria-label={`Delete ${profile.name}`}
                            onClick={() => handleDelete(profile)}
                          >
                            <LuTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="myprofile-table-footer">
            <span className="myprofile-entries-count">
              Showing{" "}
              {filteredProfiles.length === 0
                ? 0
                : (safePage - 1) * ITEMS_PER_PAGE + 1}
              {" "}to{" "}
              {Math.min(safePage * ITEMS_PER_PAGE, filteredProfiles.length)}
              {" "}of {filteredProfiles.length} profiles
            </span>

            <div className="myprofile-pagination">
              <button
                type="button"
                className="myprofile-page-nav-btn"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={safePage === 1}
                aria-label="Previous page"
              >
                <LuChevronLeft />
              </button>

              <span className="myprofile-page-indicator">
                {safePage} / {totalPages}
              </span>

              <button
                type="button"
                className="myprofile-page-nav-btn"
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                disabled={safePage === totalPages}
                aria-label="Next page"
              >
                <LuChevronRight />
              </button>
            </div>
          </div>
        </section>

        <footer className="myprofile-page-footer">
          <LuBookOpen />
          <span>Likhani Books Admin Panel</span>
          <span className="myprofile-footer-dot">•</span>
          <span>Profile Management</span>
        </footer>
      </div>
    </main>
  );
};

export default MyProfile;
