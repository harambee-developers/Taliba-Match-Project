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
  Card,
  CardContent,
  Typography,
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
    return date.toLocaleDateString("en-UK", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).replace(",", "-");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/user/users`
        );
        setData(response.data);
        setFilteredData(response.data);
      } catch (err) {
        console.error(err);
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
      <TextField
        label="Search Users"
        variant="outlined"
        fullWidth
        margin="normal"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: "20px" }}
      />
      {isSmallScreen ? (
        // Card View for Mobile
        filteredData
          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
          .map((user) => (
            <Card key={user._id} style={{ marginBottom: "15px" }}>
              <CardContent>
                <Typography variant="h6">{user.userName}</Typography>
                <Typography variant="body2">
                  Name: {user.firstName} {user.lastName}
                </Typography>
                <Typography variant="body2">Email: {user.email}</Typography>
                <Typography variant="body2">
                  Occupation: {user.occupation}
                </Typography>
                <Typography variant="body2">
                  DOB: {formatDate(user.dob)}
                </Typography>
                <Typography variant="body2">
                  Sect: {user.sect}
                </Typography>
                <Typography variant="body2">
                  Gender: {user.gender}
                </Typography>
              </CardContent>
            </Card>
          ))
      ) : (
        // Table View for Larger Screens
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
                <TableCell>First Name</TableCell>
                <TableCell>Last Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Gender</TableCell>
                <TableCell>Sect</TableCell>
                <TableCell>Occupation</TableCell>
                <TableCell>Date of Birth</TableCell>
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
                    <TableCell>{user.gender}</TableCell>
                    <TableCell>{user.sect}</TableCell>
                    <TableCell>{user.occupation}</TableCell>
                    <TableCell>{formatDate(user.dob)}</TableCell>
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
      )}
    </div>
  );
};

export default UserTable;
