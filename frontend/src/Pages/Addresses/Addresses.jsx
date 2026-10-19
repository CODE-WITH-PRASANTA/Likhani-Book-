import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiMapPin,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiCheck,
  FiUser,
  FiHeart,
  FiShoppingBag,
  FiLogOut,
  FiCheckCircle,
  FiAlertCircle,
  FiMoreVertical,
  FiHome,
  FiBriefcase,
  FiArrowLeft,
  FiPackage,
  FiNavigation,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import {
  fetchUserAddresses,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  setDefaultUserAddress,
} from "../../api/addressService";
import { getCurrentLocationAddress } from "../../utils/locationService";
import "./Addresses.css";

const emptyForm = {
  name: "",
  phone: "",
  pincode: "",
  locality: "",
  street: "",
  city: "",
  state: "Odisha",
  landmark: "",
  alternatePhone: "",
  addressType: "Home",
  isDefault: false,
};

const Addresses = () => {
  const navigate = useNavigate();
  const { currentUser, logout, isAuthenticated } = useAuth();

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [actionMenuId, setActionMenuId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [fetchingLocation, setFetchingLocation] = useState(false);

  const handleFetchCurrentLocation = async () => {
    try {
      setFetchingLocation(true);
      const loc = await getCurrentLocationAddress();
      setFormData((prev) => ({
        ...prev,
        pincode: loc.pincode || prev.pincode,
        locality: loc.locality || prev.locality,
        street: loc.street
          ? prev.street
            ? `${prev.street}, ${loc.street}`
            : loc.street
          : prev.street,
        city: loc.city || prev.city,
        state: loc.state || prev.state || "Odisha",
      }));
      setErrors((prev) => {
        const next = { ...prev };
        if (loc.pincode) delete next.pincode;
        if (loc.locality) delete next.locality;
        if (loc.street) delete next.street;
        if (loc.city) delete next.city;
        if (loc.state) delete next.state;
        return next;
      });
      showFeedback("Location detected! Address fields have been auto-filled.", "success");
    } catch (err) {
      console.warn("Location fetch error:", err);
      showFeedback(
        err.message || "Could not detect location. Please enter manually.",
        "error"
      );
    } finally {
      setFetchingLocation(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/addresses" } });
      return;
    }

    let active = true;
    fetchUserAddresses().then((data) => {
      if (active) {
        setAddresses(data);
        setLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, [isAuthenticated, navigate]);

  const showFeedback = (text, type = "success") => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleOpenAdd = () => {
    setFormData({
      ...emptyForm,
      name: currentUser?.name || `${currentUser?.firstName || ""} ${currentUser?.lastName || ""}`.trim(),
      phone: currentUser?.phone || "",
    });
    setEditingId(null);
    setErrors({});
    setIsFormOpen(true);
  };

  const handleOpenEdit = (addr) => {
    setFormData({
      name: addr.name || "",
      phone: addr.phone || "",
      pincode: addr.pincode || "",
      locality: addr.locality || "",
      street: addr.street || "",
      city: addr.city || "",
      state: addr.state || "Odisha",
      landmark: addr.landmark || "",
      alternatePhone: addr.alternatePhone || "",
      addressType: addr.addressType || "Home",
      isDefault: !!addr.isDefault,
    });
    setEditingId(addr._id);
    setErrors({});
    setIsFormOpen(true);
    setActionMenuId(null);
  };

  const handleCancelForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData(emptyForm);
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.phone.trim().replace(/\D/g, ""))) {
      newErrors.phone = "Enter a valid 10-digit mobile number";
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
      newErrors.pincode = "Enter a valid 6-digit pincode";
    }

    if (!formData.street.trim()) newErrors.street = "Address (Area and Street) is required";
    if (!formData.city.trim()) newErrors.city = "City/District/Town is required";
    if (!formData.state.trim()) newErrors.state = "State is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      if (editingId) {
        const updated = await updateUserAddress(editingId, formData);
        setAddresses(updated);
        showFeedback("Address updated successfully!");
      } else {
        const updated = await addUserAddress(formData);
        setAddresses(updated);
        showFeedback("New address added successfully!");
      }
      handleCancelForm();
    } catch (err) {
      console.error("Save address error:", err);
      showFeedback(err?.message || "Failed to save address", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    try {
      const updated = await deleteUserAddress(id);
      setAddresses(updated);
      showFeedback("Address deleted successfully!");
    } catch (err) {
      showFeedback(err?.message || "Failed to delete address", "error");
    }
    setActionMenuId(null);
  };

  const handleSetDefault = async (id) => {
    try {
      const updated = await setDefaultUserAddress(id);
      setAddresses(updated);
      showFeedback("Default address updated!");
    } catch (err) {
      showFeedback(err?.message || "Failed to set default address", "error");
    }
    setActionMenuId(null);
  };

  if (!currentUser) return null;

  return (
    <main className="AddressesPage">
      <div className="AddressesPage__container">
        {/* Breadcrumb Navigation */}
        <div className="AddressesPage__breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/profile">My Account</Link>
          <span>/</span>
          <span className="AddressesPage__breadcrumbCurrent">Manage Addresses</span>
        </div>

        {feedback && (
          <div className={`AddressesPage__toast AddressesPage__toast--${feedback.type}`}>
            {feedback.type === "success" ? <FiCheckCircle /> : <FiAlertCircle />}
            <span>{feedback.text}</span>
          </div>
        )}

        <div className="AddressesPage__layout">
          {/* ================= LEFT SIDEBAR (Flipkart Account Style) ================= */}
          <aside className="AddressesPage__sidebar">
            {/* User Greeting Card */}
            <div className="AddressesPage__userCard">
              <div className="AddressesPage__userAvatar">
                {(currentUser.name || currentUser.firstName || "U")[0].toUpperCase()}
              </div>
              <div className="AddressesPage__userMeta">
                <span className="AddressesPage__hello">Hello,</span>
                <strong className="AddressesPage__userName">{currentUser.name || "Reader"}</strong>
              </div>
            </div>

            {/* Nav Menu */}
            <nav className="AddressesPage__nav">
              <div className="AddressesPage__navSection">
                <span className="AddressesPage__navSectionTitle">ACCOUNT SETTINGS</span>
                <Link to="/profile" className="AddressesPage__navLink">
                  <FiUser />
                  <span>Profile Information</span>
                </Link>
                <Link to="/addresses" className="AddressesPage__navLink AddressesPage__navLink--active">
                  <FiMapPin />
                  <span>Manage Addresses</span>
                </Link>
              </div>

              <div className="AddressesPage__navSection">
                <span className="AddressesPage__navSectionTitle">MY STUFF</span>
                <Link to="/orders" className="AddressesPage__navLink">
                  <FiPackage />
                  <span>My Orders</span>
                </Link>
                <Link to="/wishlist" className="AddressesPage__navLink">
                  <FiHeart />
                  <span>My Wishlist</span>
                </Link>
                <Link to="/cart" className="AddressesPage__navLink">
                  <FiShoppingBag />
                  <span>My Cart</span>
                </Link>
              </div>

              <div className="AddressesPage__navSection">
                <button
                  type="button"
                  className="AddressesPage__logoutBtn"
                  onClick={() => {
                    logout();
                    navigate("/login");
                  }}
                >
                  <FiLogOut />
                  <span>Logout</span>
                </button>
              </div>
            </nav>
          </aside>

          {/* ================= RIGHT CONTENT AREA ================= */}
          <section className="AddressesPage__content">
            <div className="AddressesPage__contentHeader">
              <h2>Manage Addresses</h2>
              <div className="AddressesPage__headerActions">
                <Link to="/cart" className="AddressesPage__returnCartLink">
                  <FiArrowLeft /> Return to Cart
                </Link>
              </div>
            </div>

            {/* "+ ADD A NEW ADDRESS" Button / Trigger */}
            {!isFormOpen && (
              <button
                type="button"
                className="AddressesPage__addBtn"
                onClick={handleOpenAdd}
              >
                <FiPlus className="AddressesPage__addIcon" />
                <span>ADD A NEW ADDRESS</span>
              </button>
            )}

            {/* INLINE FLIPKART ADDRESS FORM */}
            {isFormOpen && (
              <form className="AddressesPage__formBox" onSubmit={handleSubmitForm}>
                <div className="AddressesPage__formHeader">
                  <h4>{editingId ? "EDIT ADDRESS" : "ADD A NEW ADDRESS"}</h4>
                  <button
                    type="button"
                    className="AddressesPage__useLocationBtn"
                    onClick={handleFetchCurrentLocation}
                    disabled={fetchingLocation}
                    title="Automatically detect and fill your current GPS location"
                  >
                    {fetchingLocation ? (
                      <>
                        <span className="AddressesPage__locationSpinner" />
                        <span>Detecting Location...</span>
                      </>
                    ) : (
                      <>
                        <FiNavigation className="AddressesPage__useLocationIcon" />
                        <span>Use Current Location</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Address Type Selection (Home vs Work) */}
                <div className="AddressesPage__formField">
                  <label className="AddressesPage__fieldLabel">Address Type</label>
                  <div className="AddressesPage__typeGroup">
                    <label
                      className={`AddressesPage__typeRadio ${
                        formData.addressType === "Home" ? "AddressesPage__typeRadio--selected" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="addressType"
                        value="Home"
                        checked={formData.addressType === "Home"}
                        onChange={handleInputChange}
                      />
                      <FiHome />
                      <span>Home (All day delivery)</span>
                    </label>

                    <label
                      className={`AddressesPage__typeRadio ${
                        formData.addressType === "Work" ? "AddressesPage__typeRadio--selected" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="addressType"
                        value="Work"
                        checked={formData.addressType === "Work"}
                        onChange={handleInputChange}
                      />
                      <FiBriefcase />
                      <span>Work (Delivery between 10 AM - 5 PM)</span>
                    </label>
                  </div>
                </div>

                {/* Row 1: Name & 10-digit mobile */}
                <div className="AddressesPage__formRow">
                  <div className="AddressesPage__formCol">
                    <label>Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Receiver's Name"
                    />
                    {errors.name && <span className="AddressesPage__fieldError">{errors.name}</span>}
                  </div>

                  <div className="AddressesPage__formCol">
                    <label>10-digit mobile number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="10-digit mobile number"
                      maxLength="10"
                    />
                    {errors.phone && <span className="AddressesPage__fieldError">{errors.phone}</span>}
                  </div>
                </div>

                {/* Row 2: Pincode & Locality */}
                <div className="AddressesPage__formRow">
                  <div className="AddressesPage__formCol">
                    <label>Pincode *</label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      placeholder="6-digit PIN code"
                      maxLength="6"
                    />
                    {errors.pincode && <span className="AddressesPage__fieldError">{errors.pincode}</span>}
                  </div>

                  <div className="AddressesPage__formCol">
                    <label>Locality / Area</label>
                    <input
                      type="text"
                      name="locality"
                      value={formData.locality}
                      onChange={handleInputChange}
                      placeholder="e.g. Saheed Nagar, Jaydev Vihar"
                    />
                  </div>
                </div>

                {/* Row 3: Street Address */}
                <div className="AddressesPage__formColFull">
                  <label>Address (Area and Street) *</label>
                  <textarea
                    name="street"
                    rows="3"
                    value={formData.street}
                    onChange={handleInputChange}
                    placeholder="Flat / House No. / Building / Street Name"
                  ></textarea>
                  {errors.street && <span className="AddressesPage__fieldError">{errors.street}</span>}
                </div>

                {/* Row 4: City & State */}
                <div className="AddressesPage__formRow">
                  <div className="AddressesPage__formCol">
                    <label>City/District/Town *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="City or Town"
                    />
                    {errors.city && <span className="AddressesPage__fieldError">{errors.city}</span>}
                  </div>

                  <div className="AddressesPage__formCol">
                    <label>State *</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="State"
                    />
                    {errors.state && <span className="AddressesPage__fieldError">{errors.state}</span>}
                  </div>
                </div>

                {/* Row 5: Landmark & Alternate Phone */}
                <div className="AddressesPage__formRow">
                  <div className="AddressesPage__formCol">
                    <label>Landmark (Optional)</label>
                    <input
                      type="text"
                      name="landmark"
                      value={formData.landmark}
                      onChange={handleInputChange}
                      placeholder="e.g. Near SBI Bank"
                    />
                  </div>

                  <div className="AddressesPage__formCol">
                    <label>Alternate Phone (Optional)</label>
                    <input
                      type="tel"
                      name="alternatePhone"
                      value={formData.alternatePhone}
                      onChange={handleInputChange}
                      placeholder="Alternative mobile number"
                      maxLength="10"
                    />
                  </div>
                </div>

                {/* Default checkbox */}
                <div className="AddressesPage__checkboxGroup">
                  <label>
                    <input
                      type="checkbox"
                      name="isDefault"
                      checked={formData.isDefault}
                      onChange={handleInputChange}
                    />
                    <span>Make this my default delivery address</span>
                  </label>
                </div>

                {/* Actions */}
                <div className="AddressesPage__formActions">
                  <button
                    type="submit"
                    className="AddressesPage__saveBtn"
                    disabled={submitting}
                  >
                    {submitting ? "SAVING..." : "SAVE"}
                  </button>
                  <button
                    type="button"
                    className="AddressesPage__cancelBtn"
                    onClick={handleCancelForm}
                    disabled={submitting}
                  >
                    CANCEL
                  </button>
                </div>
              </form>
            )}

            {/* SAVED ADDRESSES LIST */}
            <div className="AddressesPage__list">
              {loading ? (
                <div className="AddressesPage__skeleton">
                  <p>Loading your saved addresses...</p>
                </div>
              ) : addresses.length === 0 ? (
                <div className="AddressesPage__empty">
                  <div className="AddressesPage__emptyIcon">
                    <FiMapPin />
                  </div>
                  <h3>No Addresses Saved Yet</h3>
                  <p>
                    Add a delivery address so you can checkout quickly and securely with one click!
                  </p>
                  {!isFormOpen && (
                    <button
                      type="button"
                      className="AddressesPage__saveBtn"
                      style={{ margin: "16px auto 0" }}
                      onClick={handleOpenAdd}
                    >
                      + ADD ADDRESS NOW
                    </button>
                  )}
                </div>
              ) : (
                addresses.map((addr) => {
                  const isCurrentDefault = !!addr.isDefault;
                  const isMenuOpen = actionMenuId === addr._id;

                  return (
                    <div
                      key={addr._id}
                      className={`AddressesPage__card ${
                        isCurrentDefault ? "AddressesPage__card--default" : ""
                      }`}
                    >
                      <div className="AddressesPage__cardTop">
                        <div className="AddressesPage__cardTags">
                          <span
                            className={`AddressesPage__typeTag AddressesPage__typeTag--${
                              addr.addressType?.toLowerCase() || "home"
                            }`}
                          >
                            {addr.addressType?.toUpperCase() || "HOME"}
                          </span>
                          {isCurrentDefault && (
                            <span className="AddressesPage__defaultTag">DEFAULT</span>
                          )}
                        </div>

                        {/* Three Dots Menu */}
                        <div className="AddressesPage__menuWrap">
                          <button
                            type="button"
                            className="AddressesPage__menuTrigger"
                            onClick={() =>
                              setActionMenuId(isMenuOpen ? null : addr._id)
                            }
                            aria-label="Actions"
                          >
                            <FiMoreVertical />
                          </button>

                          {isMenuOpen && (
                            <div className="AddressesPage__dropdownMenu">
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(addr)}
                              >
                                <FiEdit2 /> Edit
                              </button>
                              {!isCurrentDefault && (
                                <button
                                  type="button"
                                  onClick={() => handleSetDefault(addr._id)}
                                >
                                  <FiCheck /> Set as Default
                                </button>
                              )}
                              <button
                                type="button"
                                className="AddressesPage__dropdownDelete"
                                onClick={() => handleDelete(addr._id)}
                              >
                                <FiTrash2 /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Name & Phone */}
                      <div className="AddressesPage__cardNameRow">
                        <strong>{addr.name}</strong>
                        <span className="AddressesPage__cardPhone">{addr.phone}</span>
                      </div>

                      {/* Full Address */}
                      <p className="AddressesPage__cardAddress">
                        {addr.street}
                        {addr.locality ? `, ${addr.locality}` : ""}, {addr.city},{" "}
                        {addr.state} - <strong>{addr.pincode}</strong>
                      </p>

                      {addr.landmark && (
                        <p className="AddressesPage__cardExtra">
                          <span>Landmark:</span> {addr.landmark}
                        </p>
                      )}

                      {addr.alternatePhone && (
                        <p className="AddressesPage__cardExtra">
                          <span>Alt Phone:</span> {addr.alternatePhone}
                        </p>
                      )}

                      {/* Footer Actions */}
                      <div className="AddressesPage__cardFooter">
                        <button
                          type="button"
                          className="AddressesPage__actionLink"
                          onClick={() => handleOpenEdit(addr)}
                        >
                          <FiEdit2 /> Edit
                        </button>
                        <span className="AddressesPage__actionSep">|</span>
                        {!isCurrentDefault ? (
                          <button
                            type="button"
                            className="AddressesPage__actionLink"
                            onClick={() => handleSetDefault(addr._id)}
                          >
                            Set as Default
                          </button>
                        ) : (
                          <span className="AddressesPage__defaultNotice">
                            <FiCheck /> Delivery Address
                          </span>
                        )}
                        <span className="AddressesPage__actionSep">|</span>
                        <button
                          type="button"
                          className="AddressesPage__actionLink AddressesPage__actionLink--danger"
                          onClick={() => handleDelete(addr._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default Addresses;
