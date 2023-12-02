import React, { useState, useEffect } from "react";
import axios from "axios";
import "./style.css"; // Make sure to include your stylesheet for additional styling

const DataLoader = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState(""); // New state for input value
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [editMode, setEditMode] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json"
        );
        const sortedData = response.data.sort(
          (a, b) => parseInt(a.id) - parseInt(b.id)
        );
        setData(sortedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const selectedRowClass = "selected-row";

  const toggleEditMode = (id) => {
    setEditMode((prevEditMode) => ({
      ...prevEditMode,
      [id]: !prevEditMode[id],
    }));
  };

  const handleEditField = (id, field, value) => {
    setData((prevData) =>
      prevData.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleDeleteSelected = () => {
    setData((prevData) =>
      prevData.filter((item) => !selectedRowIds.includes(item.id))
    );
    setSelectedRowIds([]);
    setEditMode({});
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const filteredData = data.filter((item) =>
    Object.values(item).some((value) =>
      value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleEdit = (id) => {
    toggleEditMode(id);
  };

  const handleDelete = (id) => {
    setData((prevData) => prevData.filter((item) => item.id !== id));
    setSelectedRowIds((prevSelectedRowIds) =>
      prevSelectedRowIds.filter((selectedId) => selectedId !== id)
    );
    setEditMode((prevEditMode) => {
      const { [id]: deletedItem, ...rest } = prevEditMode;
      return rest;
    });
  };

  const handleCheckboxChange = (id) => {
    let pusharr = [];
    if (selectedRowIds.includes(id)) {
      for (let i = 0; i < selectedRowIds.length; i++) {
        if (selectedRowIds[i] !== id) {
          pusharr.push(selectedRowIds[i]);
        }
      }
    } else {
      for (let i = 0; i < selectedRowIds.length; i++) {
        pusharr.push(selectedRowIds[i]);
      }
      pusharr.push(id);
    }
    setSelectedRowIds(pusharr);
  };

  const handleSearch = () => {
    setSearchTerm(searchInput);
    setCurrentPage(1);
    // Add additional logic if needed based on the search input
  };

  useEffect(() => {
    setSelectedRowIds(selectedRowIds);
  }, [selectedRowIds, currentPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <div>
      <div className="upper-outer">
        <div>
          <input
            type="text"
            placeholder="Search..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="search-icon"
          />
          <button className="search-icon" onClick={handleSearch}>
            <i className="fas fa-search"></i>
          </button>
        </div>
        <div>
          <button onClick={handleDeleteSelected}>
            <i className="fas fa-trash-alt"></i>
          </button>
        </div>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={
                    currentItems.every((item) =>
                      selectedRowIds.includes(item.id)
                    ) && selectedRowIds.length > 0
                  }
                  onChange={() => {
                    if (
                      currentItems.every((item) =>
                        selectedRowIds.includes(item.id)
                      )
                    ) {
                      let pusharr = [];
                      let curr = [];
                      for (let i = 0; i < currentItems.length; i++) {
                        curr.push(currentItems[i].id);
                      }
                      for (let i = 0; i < selectedRowIds.length; i++) {
                        if (curr.includes(selectedRowIds[i]) === false) {
                          pusharr.push(selectedRowIds[i]);
                        }
                      }
                      setSelectedRowIds(pusharr);
                    } else {
                      let pusharr = [];
                      let curr = [];
                      for (let i = 0; i < currentItems.length; i++) {
                        curr.push(currentItems[i].id);
                      }
                      for (let i = 0; i < curr.length; i++) {
                        if (selectedRowIds.includes(curr[i]) === false) {
                          pusharr.push(curr[i]);
                        }
                      }
                      for (let i = 0; i < selectedRowIds.length; i++) {
                        pusharr.push(selectedRowIds[i]);
                      }
                      setSelectedRowIds(pusharr);
                    }
                  }}
                />
              </th>
              <th className="header-title">Name</th>
              <th className="header-title">Email</th>
              <th className="header-title">Role</th>
              <th className="header-title">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item) => (
              <tr
                key={item.id}
                className={
                  selectedRowIds.includes(item.id) ? selectedRowClass : ""
                }
              >
                <td>
                  <input
                    type="checkbox"
                    checked={selectedRowIds.includes(item.id)}
                    onChange={() => handleCheckboxChange(item.id)}
                  />
                </td>
                <td>
                  {editMode[item.id] ? (
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) =>
                        handleEditField(item.id, "name", e.target.value)
                      }
                    />
                  ) : (
                    item.name
                  )}
                </td>
                <td>
                  {editMode[item.id] ? (
                    <input
                      type="text"
                      value={item.email}
                      onChange={(e) =>
                        handleEditField(item.id, "email", e.target.value)
                      }
                    />
                  ) : (
                    item.email
                  )}
                </td>
                <td>
                  {editMode[item.id] ? (
                    <input
                      type="text"
                      value={item.role}
                      onChange={(e) =>
                        handleEditField(item.id, "role", e.target.value)
                      }
                    />
                  ) : (
                    item.role
                  )}
                </td>
                <td>
                  <button className="edit" onClick={() => handleEdit(item.id)}>
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    className="delete"
                    onClick={() => handleDelete(item.id)}
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="lower-outer">
        <div style={{ display: "flex", alignItems: "center" }}>
          <button className="delete-selected" onClick={handleDeleteSelected}>
            Delete Selected
          </button>
          <div>
            {selectedRowIds.length} of {data.length} rows selected
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div>
            {currentPage} out of {totalPages} pages
          </div>
          <div>
            <button
              className="first-page"
              onClick={() => paginate(1)}
              disabled={currentPage === 1}
            >
              <i className="fas fa-angle-double-left"></i>
            </button>
            <button
              className="previous-page"
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <i className="fas fa-angle-left"></i>
            </button>
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                onClick={() => paginate(index + 1)}
                className={currentPage === index + 1 ? "active-page" : ""}
              >
                {index + 1}
              </button>
            ))}
            <button
              className="next-page"
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <i className="fas fa-angle-right"></i>
            </button>
            <button
              className="last-page"
              onClick={() => paginate(totalPages)}
              disabled={currentPage === totalPages}
            >
              <i className="fas fa-angle-double-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataLoader;
