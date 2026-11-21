import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

import { toast } from "react-toastify";

import api from "../api/client";
import { useAuth } from "./AuthContext";

const AddressContext = createContext();

const addressErrorMessage = (error) =>
  error.response?.data?.message ||
  "Unable to connect to the server. Please try again.";

const mapBackendAddress = (row) => ({
  id: row.id,
  fullName: row.full_name,
  phone: row.phone,
  address: row.address_line,
  city: row.city,
  state: row.state,
  pincode: row.pincode,
  addressType: row.address_type,
  isDefault: Boolean(row.is_default),
});

export function AddressProvider({ children }) {
  const { isAuthenticated } = useAuth();

  const [addresses, setAddresses] = useState([]);

  const fetchAddresses = useCallback(async () => {
    const { data } = await api.get("/addresses");
    setAddresses(data.addresses.map(mapBackendAddress));
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAddresses();
    } else {
      setAddresses([]);
    }
  }, [isAuthenticated, fetchAddresses]);

  const addAddress = async (addressData) => {
    try {
      const { data } = await api.post("/addresses", {
        fullName: addressData.fullName,
        phone: addressData.phone,
        addressLine: addressData.address,
        city: addressData.city,
        state: addressData.state,
        pincode: addressData.pincode,
        addressType: addressData.addressType,
        isDefault: addressData.isDefault,
      });

      await fetchAddresses();
      toast.success("Address saved");
      return mapBackendAddress(data.address);
    } catch (error) {
      toast.error(addressErrorMessage(error));
      throw error;
    }
  };

  const updateAddress = async (addressId, addressData) => {
    try {
      await api.put(`/addresses/${addressId}`, {
        fullName: addressData.fullName,
        phone: addressData.phone,
        addressLine: addressData.address,
        city: addressData.city,
        state: addressData.state,
        pincode: addressData.pincode,
        addressType: addressData.addressType,
        isDefault: addressData.isDefault,
      });

      await fetchAddresses();
      toast.success("Address updated");
    } catch (error) {
      toast.error(addressErrorMessage(error));
      throw error;
    }
  };

  const deleteAddress = async (addressId) => {
    try {
      await api.delete(`/addresses/${addressId}`);
      await fetchAddresses();
      toast.success("Address deleted");
    } catch (error) {
      toast.error(addressErrorMessage(error));
      throw error;
    }
  };

  const setDefaultAddress = async (addressId) => {
    try {
      await api.patch(`/addresses/${addressId}/default`);
      await fetchAddresses();
      toast.success("Default address updated");
    } catch (error) {
      toast.error(addressErrorMessage(error));
      throw error;
    }
  };

  const defaultAddress = addresses.find((address) => address.isDefault) || null;

  return (
    <AddressContext.Provider
      value={{
        addresses,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        defaultAddress,
        refreshAddresses: fetchAddresses,
      }}
    >
      {children}
    </AddressContext.Provider>
  );
}

export function useAddresses() {
  const context = useContext(AddressContext);

  if (!context) {
    throw new Error("useAddresses must be used inside AddressProvider");
  }

  return context;
}
