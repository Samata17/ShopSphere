const pool = require("../config/db");

const PHONE_REGEX = /^[6-9]\d{9}$/;
const PINCODE_REGEX = /^\d{6}$/;

const validateAddressInput = (body) => {
  const { fullName, phone, addressLine, city, state, pincode } = body;

  if (!fullName || !phone || !addressLine || !city || !state || !pincode) {
    return "All address fields are required";
  }

  if (body.addressType && !["Home", "Work", "Other"].includes(body.addressType)) {
    return "Invalid address type";
  }

  if (!PHONE_REGEX.test(phone)) {
    return "Enter a valid 10-digit phone number";
  }

  if (!PINCODE_REGEX.test(pincode)) {
    return "Enter a valid 6-digit pincode";
  }

  return null;
};

// ==========================================
// GET ADDRESSES
// ==========================================
const getAddresses = async (req, res) => {
  try {
    const [addresses] = await pool.query(
      `SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC`,
      [req.user.id]
    );

    return res.status(200).json({ success: true, addresses });
  } catch (error) {
    console.error("Get addresses error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching addresses",
    });
  }
};

// ==========================================
// ADD ADDRESS
// ==========================================
const addAddress = async (req, res) => {
  try {
    const validationError = validateAddressInput(req.body);
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const {
      fullName,
      phone,
      addressLine,
      city,
      state,
      pincode,
      addressType,
      isDefault,
    } = req.body;

    const [existing] = await pool.query(
      `SELECT COUNT(*) AS count FROM addresses WHERE user_id = ?`,
      [req.user.id]
    );

    const shouldBeDefault = existing[0].count === 0 || Boolean(isDefault);

    if (shouldBeDefault) {
      await pool.query(`UPDATE addresses SET is_default = 0 WHERE user_id = ?`, [
        req.user.id,
      ]);
    }

    const [result] = await pool.query(
      `INSERT INTO addresses
       (user_id, full_name, phone, address_line, city, state, pincode, address_type, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        fullName.trim(),
        phone.trim(),
        addressLine.trim(),
        city.trim(),
        state.trim(),
        pincode.trim(),
        addressType || "Home",
        shouldBeDefault ? 1 : 0,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Address added",
      address: {
        id: result.insertId,
        user_id: req.user.id,
        full_name: fullName.trim(),
        phone: phone.trim(),
        address_line: addressLine.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        address_type: addressType || "Home",
        is_default: shouldBeDefault ? 1 : 0,
      },
    });
  } catch (error) {
    console.error("Add address error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while adding address",
    });
  }
};

// ==========================================
// UPDATE ADDRESS
// ==========================================
const updateAddress = async (req, res) => {
  try {
    const addressId = req.params.id;

    const [addresses] = await pool.query(
      `SELECT * FROM addresses WHERE id = ? AND user_id = ?`,
      [addressId, req.user.id]
    );

    if (addresses.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    const validationError = validateAddressInput(req.body);
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const {
      fullName,
      phone,
      addressLine,
      city,
      state,
      pincode,
      addressType,
      isDefault,
    } = req.body;

    if (isDefault) {
      await pool.query(`UPDATE addresses SET is_default = 0 WHERE user_id = ?`, [
        req.user.id,
      ]);
    }

    await pool.query(
      `UPDATE addresses
       SET full_name = ?, phone = ?, address_line = ?, city = ?, state = ?, pincode = ?, address_type = ?, is_default = ?
       WHERE id = ? AND user_id = ?`,
      [
        fullName.trim(),
        phone.trim(),
        addressLine.trim(),
        city.trim(),
        state.trim(),
        pincode.trim(),
        addressType || addresses[0].address_type,
        isDefault ? 1 : addresses[0].is_default,
        addressId,
        req.user.id,
      ]
    );

    return res.status(200).json({
      success: true,
      message: "Address updated",
    });
  } catch (error) {
    console.error("Update address error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating address",
    });
  }
};

// ==========================================
// DELETE ADDRESS
// ==========================================
const deleteAddress = async (req, res) => {
  try {
    const addressId = req.params.id;

    const [addresses] = await pool.query(
      `SELECT * FROM addresses WHERE id = ? AND user_id = ?`,
      [addressId, req.user.id]
    );

    if (addresses.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    await pool.query(`DELETE FROM addresses WHERE id = ? AND user_id = ?`, [
      addressId,
      req.user.id,
    ]);

    if (addresses[0].is_default) {
      const [remaining] = await pool.query(
        `SELECT id FROM addresses WHERE user_id = ? ORDER BY created_at ASC LIMIT 1`,
        [req.user.id]
      );

      if (remaining.length > 0) {
        await pool.query(`UPDATE addresses SET is_default = 1 WHERE id = ?`, [
          remaining[0].id,
        ]);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Address deleted",
    });
  } catch (error) {
    console.error("Delete address error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting address",
    });
  }
};

// ==========================================
// SET DEFAULT ADDRESS
// ==========================================
const setDefaultAddress = async (req, res) => {
  try {
    const addressId = req.params.id;

    const [addresses] = await pool.query(
      `SELECT id FROM addresses WHERE id = ? AND user_id = ?`,
      [addressId, req.user.id]
    );

    if (addresses.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    await pool.query(`UPDATE addresses SET is_default = 0 WHERE user_id = ?`, [
      req.user.id,
    ]);

    await pool.query(`UPDATE addresses SET is_default = 1 WHERE id = ?`, [
      addressId,
    ]);

    return res.status(200).json({
      success: true,
      message: "Default address updated",
    });
  } catch (error) {
    console.error("Set default address error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while setting default address",
    });
  }
};

module.exports = {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
