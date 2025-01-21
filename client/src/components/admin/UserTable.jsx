import React, { useState, useEffect } from "react";
import ExcelJS from "exceljs"; // Import exceljs
import { saveAs } from "file-saver"; // For downloading
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
  Button,
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

  // Function to export data using exceljs
  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Users");

    // Define columns
    worksheet.columns = [
      { header: "Kunya", key: "userName" },
      { header: "First Name", key: "firstName" },
      { header: "Last Name", key: "lastName" },
      { header: "Email", key: "email" },
      { header: "Gender", key: "gender" },
      { header: "Sect", key: "sect" },
      { header: "Occupation", key: "occupation" },
      { header: "Date of Birth", key: "dob" },
      { header: "Location", key: "location" },
      { header: "Nationality", key: "nationality" },
      { header: "Phone No", key: "phone" },
      { header: "Revert", key: "revert" },
      { header: "Salah Pattern", key: "salahPattern" },
      { header: "Islamic Ambition", key: "islamicAmbitions" },
      { header: "Islamic Books", key: "islamicBooks" },
      { header: "Open to Hijrah", key: "openToHijrah" },
      { header: "Hijrah Destination", key: "hijrahDestination" },
      { header: "Deal Breakers?", key: "dealBreakers" },
      { header: "Children?", key: "children" },
      { header: "Dressing Style", key: "dressingStyle" },
      { header: "Quran Memorization", key: "quranMemorization" },
    ];

    // Add user data
    filteredData.forEach((user) => {
      worksheet.addRow({
        userName: user.userName,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        gender: user.gender || "N/A",
        sect: user.sect || "N/A",
        occupation: user.occupation || "N/A",
        dob: user.dob ? new Date(user.dob).toLocaleDateString("en-UK") : "N/A",
        location: user.location || "N/A",
        nationality: user.nationality || "N/A",
        phone: user.phone || "N/A",
        // 🟢 Fields from `profile`
        revert: user.profile?.revert ?? "N/A",
        salahPattern: user.profile?.salahPattern ?? "N/A",
        islamicAmbitions: user.profile?.islamicAmbitions ?? "N/A",
        islamicBooks: user.profile?.islamicBooks ?? "N/A",
        openToHijrah: user.profile?.openToHijrah ?? "N/A",
        hijrahDestination: user.profile?.hijrahDestination ?? "N/A",
        quranMemorization: user.profile?.quranMemorization ?? "N/A",
        children: user.profile?.children ?? "N/A",
        dealBreakers: user.profile?.dealBreakers ?? "N/A",
        dressingStyle: user.profile?.dressingStyle ?? "N/A",
        // 🟠 Arrays (convert to string so Excel can display them)
        hobbies: user.profile?.hobbies?.length ? user.profile.hobbies.join(", ") : "N/A",
        languages: user.profile?.languages?.length ? user.profile.languages.join(", ") : "N/A",
      });
    });

    // Auto-adjust column width based on the longest text in each column
    worksheet.columns.forEach((column) => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const cellValue = cell.value ? cell.value.toString() : "";
        maxLength = Math.max(maxLength, cellValue.length);
      });
      column.width = maxLength + 2; // Adding some padding
    });

    // Create a Blob and trigger download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(blob, "UserData.xlsx");
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
      <Button
        variant="contained"
        color="primary"
        onClick={exportToExcel}
        style={{ marginBottom: "20px" }}
      >
        Download as Excel
      </Button>
      {isSmallScreen ? (
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
        <TableContainer component={Paper} style={{ overflowX: "auto" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell onClick={() => handleSort("userName")} style={{ cursor: "pointer" }}>
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
