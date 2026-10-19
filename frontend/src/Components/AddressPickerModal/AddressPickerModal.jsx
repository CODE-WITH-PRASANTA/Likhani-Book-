import React, { useState } from "react";
import {
  FiX,
  FiMapPin,
  FiPlus,
  FiCheck,
  FiHome,
  FiBriefcase,
  FiEdit2,
  FiNavigation,
} from "react-icons/fi";
import { addUserAddress } from "../../api/addressService";
import { getCurrentLocationAddress } from "../../utils/locationService";
import "./AddressPickerModal.css";

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

const AddressPickerModal = ({
  isOpen,
  onClose,
  addresses = [],
  selectedAddressId = null,
  onSelectAddress = () => {},
  onAddressListUpdated = () => {},
}) => {
  const [currentSelectedId, setCurrentSelectedId] = useState(
    selectedAddressId || addresses.find((a) => a.isDefault)?._id || addresses[0]?._id
  );
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [locationFeedback, setLocationFeedback] = useState("");

  const handleFetchCurrentLocation = async () => {
    try {
      setFetchingLocation(true);
      setLocationFeedback("");
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
        return next;
      });
      setLocationFeedback("Location detected & filled!");
      setTimeout(() => setLocationFeedback(""), 3500);
    } catch (err) {
      console.warn("AddressPickerModal location fetch error:", err);
      setLocationFeedback(err.message || "Could not detect location.");
      setTimeout(() => setLocationFeedback(""), 4000);
    } finally {
      setFetchingLocation(false);
    }
  };

  if (!isOpen) return null;

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
    const errs = {};
    if (!formData.name.trim()) errs.name = "Name is required";
    if (!formData.phone.trim()) {
      errs.phone = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.phone.trim().replace(/\D/g, ""))) {
      errs.phone = "Valid 10-digit mobile number required";
    }
    if (!formData.pincode.trim() || !/^\d{6}$/.test(formData.pincode.trim())) {
      errs.pincode = "6-digit PIN code required";
    }
    if (!formData.street.trim()) errs.street = "Address/Street is required";
    if (!formData.city.trim()) errs.city = "City is required";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveNewAddress = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const updatedList = await addUserAddress(formData);
      onAddressListUpdated(updatedList);
      const newlyAdded = updatedList[updatedList.length - 1];
      if (newlyAdded) {
        setCurrentSelectedId(newlyAdded._id);
        onSelectAddress(newlyAdded);
      }
      setIsAddingNew(false);
      setFormData(emptyForm);
    } catch (err) {
      console.error("Failed to add address:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmSelection = () => {
    const chosen = addresses.find((a) => a._id === currentSelectedId);
    if (chosen) {
      onSelectAddress(chosen);
    }
    onClose();
  };

  return (
    <div className="AddressPickerModal__backdrop" onClick={onClose}>
      <div
        className="AddressPickerModal__container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="AddressPickerModal__header">
          <div className="AddressPickerModal__headerLeft">
            <FiMapPin className="AddressPickerModal__pinIcon" />
            <h3>Select Delivery Address</h3>
          </div>
          <button
            type="button"
            className="AddressPickerModal__closeBtn"
            onClick={onClose}
          >
            <FiX />
          </button>
        </div>

        <div className="AddressPickerModal__body">
          {/* "+ Add New Address" Trigger */}
          {!isAddingNew && (
            <button
              type="button"
              className="AddressPickerModal__addNewBtn"
              onClick={() => setIsAddingNew(true)}
            >
              <FiPlus />
              <span>ADD A NEW ADDRESS</span>
            </button>
          )}

          {/* Inline Add Address Form */}
          {isAddingNew && (
            <form
              className="AddressPickerModal__form"
              onSubmit={handleSaveNewAddress}
            >
              <div className="AddressPickerModal__formTopRow">
                <h4 className="AddressPickerModal__formTitle">Add New Delivery Address</h4>
                <button
                  type="button"
                  className="AddressPickerModal__useLocationBtn"
                  onClick={handleFetchCurrentLocation}
                  disabled={fetchingLocation}
                  title="Automatically detect and fill your current location"
                >
                  {fetchingLocation ? (
                    <>
                      <span className="AddressPickerModal__locationSpinner" />
                      <span>Detecting...</span>
                    </>
                  ) : (
                    <>
                      <FiNavigation />
                      <span>Use Current Location</span>
                    </>
                  )}
                </button>
              </div>

              {locationFeedback && (
                <div
                  className={`AddressPickerModal__locNotice ${
                    locationFeedback.includes("!") ? "AddressPickerModal__locNotice--success" : "AddressPickerModal__locNotice--warn"
                  }`}
                >
                  {locationFeedback}
                </div>
              )}

              <div className="AddressPickerModal__typeSelector">
                <label
                  className={`AddressPickerModal__typeOption ${
                    formData.addressType === "Home"
                      ? "AddressPickerModal__typeOption--active"
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="addressType"
                    value="Home"
                    checked={formData.addressType === "Home"}
                    onChange={handleInputChange}
                  />
                  <FiHome /> Home
                </label>
                <label
                  className={`AddressPickerModal__typeOption ${
                    formData.addressType === "Work"
                      ? "AddressPickerModal__typeOption--active"
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="addressType"
                    value="Work"
                    checked={formData.addressType === "Work"}
                    onChange={handleInputChange}
                  />
                  <FiBriefcase /> Work
                </label>
              </div>

              <div className="AddressPickerModal__formRow">
                <div className="AddressPickerModal__formCol">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Name *"
                  />
                  {errors.name && <span>{errors.name}</span>}
                </div>
                <div className="AddressPickerModal__formCol">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="10-digit mobile number *"
                    maxLength="10"
                  />
                  {errors.phone && <span>{errors.phone}</span>}
                </div>
              </div>

              <div className="AddressPickerModal__formRow">
                <div className="AddressPickerModal__formCol">
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="Pincode (6 digits) *"
                    maxLength="6"
                  />
                  {errors.pincode && <span>{errors.pincode}</span>}
                </div>
                <div className="AddressPickerModal__formCol">
                  <input
                    type="text"
                    name="locality"
                    value={formData.locality}
                    onChange={handleInputChange}
                    placeholder="Locality"
                  />
                </div>
              </div>

              <div className="AddressPickerModal__formCol">
                <textarea
                  name="street"
                  rows="2"
                  value={formData.street}
                  onChange={handleInputChange}
                  placeholder="Address (Area and Street) *"
                ></textarea>
                {errors.street && <span>{errors.street}</span>}
              </div>

              <div className="AddressPickerModal__formRow">
                <div className="AddressPickerModal__formCol">
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="City/District/Town *"
                  />
                  {errors.city && <span>{errors.city}</span>}
                </div>
                <div className="AddressPickerModal__formCol">
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="State"
                  />
                </div>
              </div>

              <div className="AddressPickerModal__formActions">
                <button
                  type="submit"
                  className="AddressPickerModal__saveBtn"
                  disabled={submitting}
                >
                  {submitting ? "SAVING..." : "SAVE & DELIVER HERE"}
                </button>
                <button
                  type="button"
                  className="AddressPickerModal__cancelBtn"
                  onClick={() => setIsAddingNew(false)}
                >
                  CANCEL
                </button>
              </div>
            </form>
          )}

          {/* List of Saved Addresses */}
          <div className="AddressPickerModal__list">
            {addresses.map((addr) => {
              const isSelected = currentSelectedId === addr._id;

              return (
                <div
                  key={addr._id}
                  className={`AddressPickerModal__card ${
                    isSelected ? "AddressPickerModal__card--selected" : ""
                  }`}
                  onClick={() => setCurrentSelectedId(addr._id)}
                >
                  <div className="AddressPickerModal__radioCol">
                    <input
                      type="radio"
                      name="selectedCartAddress"
                      checked={isSelected}
                      onChange={() => setCurrentSelectedId(addr._id)}
                    />
                  </div>

                  <div className="AddressPickerModal__cardContent">
                    <div className="AddressPickerModal__cardTags">
                      <strong>{addr.name}</strong>
                      <span
                        className={`AddressPickerModal__badge AddressPickerModal__badge--${
                          addr.addressType?.toLowerCase() || "home"
                        }`}
                      >
                        {addr.addressType?.toUpperCase() || "HOME"}
                      </span>
                      {addr.isDefault && (
                        <span className="AddressPickerModal__badgeDefault">
                          DEFAULT
                        </span>
                      )}
                      <span className="AddressPickerModal__cardPhone">
                        {addr.phone}
                      </span>
                    </div>

                    <p className="AddressPickerModal__addressText">
                      {addr.street}
                      {addr.locality ? `, ${addr.locality}` : ""}, {addr.city},{" "}
                      {addr.state} - <strong>{addr.pincode}</strong>
                    </p>

                    {isSelected && (
                      <button
                        type="button"
                        className="AddressPickerModal__deliverBtn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAddress(addr);
                          onClose();
                        }}
                      >
                        DELIVER HERE
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="AddressPickerModal__footer">
          <button
            type="button"
            className="AddressPickerModal__confirmBtn"
            onClick={handleConfirmSelection}
          >
            CONFIRM SELECTION
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddressPickerModal;
