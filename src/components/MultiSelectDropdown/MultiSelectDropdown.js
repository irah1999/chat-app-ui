import React, { useEffect, useState } from "react";
import Select from "react-select";
import { axios } from "../../lib/axios";

export default function MultiSelectDropdown({ handleAddUser }) {
  const [allUsers, setAllUsers] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      axios.post("get-users").then(res => {
        if (!res.data.success) {
          console.log("Error Users Fetch records:");
        } else {
          setAllUsers(res.data.data);
        }
      }).catch((error) => console.log("Failed to load users:", error));

    };
    fetchUsers();
  }, []);

  const handleChange = (selected) => {
    setSelectedOptions(selected);
    handleAddUser(selected.map((user) => user.value)); // only send user ids
  };

  const customStyles = {
    control: (base) => ({
      ...base,
      borderRadius: '0.375rem',
      borderColor: '#d1d5db',
      padding: '2px',
    }),
    option: (base, state) => ({
      ...base,
      display: "flex",
      alignItems: "center",
      backgroundColor: state.isFocused ? "#f3f4f6" : "#fff",
      color: "#111827",
      padding: "6px 12px",
    }),
    multiValueLabel: (base) => ({
      ...base,
      display: "flex",
      alignItems: "center",
      gap: "0.5rem"
    }),
  };

  const formatOptionLabel = ({ label, image }) => (
    <div className="flex items-center gap-2">
      <img src={image} alt={label} className="w-6 h-6 rounded-full" />
      <span>{label}</span>
    </div>
  );

  const options = allUsers.map((user) => ({
    value: user.id,
    label: user.name,
    image: user?.image ? process.env.REACT_APP_BACKEND_IMAGE_URL + user.image : "/images/avatar.svg",
  }));

  return (
    <Select
      isMulti
      value={selectedOptions}
      onChange={handleChange}
      options={options}
      styles={customStyles}
      formatOptionLabel={formatOptionLabel}
      placeholder="Search and select users"
      className="text-sm"
    />
  );
}
