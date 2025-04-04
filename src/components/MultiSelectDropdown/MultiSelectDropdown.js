import React, { useState, useEffect, useRef } from 'react';
import { axios } from '../../lib/axios';
import Select from "react-select";

const MultiSelectDropdown = ({ handleAddUser }) => {
  const [users, setUsers] = useState([]);
  const [hasMore, setHasMore] = useState(true); // Check if there are more messages to load

    // useRef to track if effect has already run
      const hasFetched = useRef(false);

  const fetchUsers = async (page) => {
      if (!hasMore) return;  // Don't fetch if there are no more messages to load

    //   setLoading(true);
      try {
          const response = await axios.post("get-users", {
          });
          const data = response.data.data;
          setUsers(data);
          setHasMore(data.length > 0); // Check if there are more messages
      } catch (err) {
      } finally {
      }
  };
  // Fetch users from API
  useEffect(() => {
      // Check if the effect has already run
      if (hasFetched.current) return;  // Prevent subsequent calls after first
      hasFetched.current = true;  // Mark effect as run
      fetchUsers();
  }, []);

  return (
    <div className="container mx-auto mt-5">
      <Select
        isMulti
        options={users}
        className="w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-950"
        classNamePrefix="select"
        onChange={(selectedOptions) => handleAddUser(selectedOptions)}
      />
    </div>
  );
};

export default MultiSelectDropdown;
