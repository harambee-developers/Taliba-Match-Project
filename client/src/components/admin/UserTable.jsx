import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableFooter,
  TablePagination,
  Paper,
  TextField,
  CircularProgress,
  useMediaQuery,
} from "@mui/material";

const UserTable = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [sortField, setSortField] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const isSmallScreen = useMediaQuery("(max-width: 768px)");

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-UK', {
      day: '2-digit',
      month: 'short', // 'short' for 3-letter month abbreviation (e.g., Jan, Feb)
      year: 'numeric', // 'numeric' for full year (e.g., 2026)
    }).replace(',', '-'); // Remove the comma between the month and year
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}api/user/users`
        );
        setData(response.data);
        setFilteredData(response.data);
      } catch (err) {
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const lowerCaseSearch = search.toLowerCase();
    const filtered = data.filter((user) =>
      (user.userName?.toLowerCase().includes(lowerCaseSearch) || "") ||
      (user.email?.toLowerCase().includes(lowerCaseSearch) || "") ||
      (user.occupation?.toLowerCase().includes(lowerCaseSearch) || "")
    );
    setFilteredData(filtered);
    setPage(0);
  }, [search, data]);

  const handleSort = (field) => {
    const isAscending = sortDirection === "asc";
    const sorted = [...filteredData].sort((a, b) => {
      if (a[field] < b[field]) return isAscending ? -1 : 1;
      if (a[field] > b[field]) return isAscending ? 1 : -1;
      return 0;
    });
    setFilteredData(sorted);
    setSortDirection(isAscending ? "desc" : "asc");
    setSortField(field);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <CircularProgress />
        <p>Loading users...</p>
      </div>
    );
  }

  if (error) {
    return <p style={{ textAlign: "center", color: "red" }}>{error}</p>;
  }

  return (
    <div>
      {/* Search Bar */}
      <TextField
        label="Search Users"
        variant="outlined"
        fullWidth
        margin="normal"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: "20px" }}
      />

      {/* Table Container */}
      <TableContainer component={Paper} style={{ overflowX: "auto" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell
                onClick={() => handleSort("userName")}
                style={{ cursor: "pointer" }}
              >
                Kunya {sortField === "userName" ? (sortDirection === "asc" ? "↑" : "↓") : ""}
              </TableCell>
              <TableCell
                onClick={() => handleSort("firstName")}
                style={{ cursor: "pointer" }}
              >
                First Name {sortField === "firstName" ? (sortDirection === "asc" ? "↑" : "↓") : ""}
              </TableCell>
              <TableCell
                onClick={() => handleSort("lastName")}
                style={{ cursor: "pointer" }}
              >
                Last Name {sortField === "lastName" ? (sortDirection === "asc" ? "↑" : "↓") : ""}
              </TableCell>
              <TableCell
                onClick={() => handleSort("email")}
                style={{ cursor: "pointer" }}
              >
                Email {sortField === "email" ? (sortDirection === "asc" ? "↑" : "↓") : ""}
              </TableCell>
              <TableCell
                onClick={() => handleSort("occupation")}
                style={{ cursor: "pointer" }}
              >
                Occupation {sortField === "occupation" ? (sortDirection === "asc" ? "↑" : "↓") : ""}
              </TableCell>
              <TableCell>Date of Birth</TableCell>
              {!isSmallScreen && <TableCell>Sect</TableCell>}
              {!isSmallScreen && <TableCell>Gender</TableCell>}
              {!isSmallScreen && <TableCell>Marital Status</TableCell>}
              {!isSmallScreen && <TableCell>Phone</TableCell>}
              {!isSmallScreen && <TableCell>Location</TableCell>}
              {!isSmallScreen && <TableCell>Nationality</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.userName}</TableCell>
                  <TableCell>{user.firstName}</TableCell>
                  <TableCell>{user.lastName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.occupation}</TableCell>
                  <TableCell>{formatDate(user.dob)}</TableCell>
                  {!isSmallScreen && <TableCell>{user.sect}</TableCell>}
                  {!isSmallScreen && <TableCell>{user.gender}</TableCell>}
                  {!isSmallScreen && <TableCell>{user.maritalStatus}</TableCell>}
                  {!isSmallScreen && <TableCell>{user.phone}</TableCell>}
                  {!isSmallScreen && <TableCell>{user.location}</TableCell>}
                  {!isSmallScreen && <TableCell>{user.nationality}</TableCell>}
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TableFooter>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        </TableFooter>
      </TableContainer>
    </div>
  );
};

export default UserTable;
