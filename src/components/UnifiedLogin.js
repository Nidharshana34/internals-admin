import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import { styled } from "@mui/material/styles";

const C = {
  olive: "#3b5d3a",
  textLight: "#ffffff",
};

const OliveButton = styled("button")(({ disabled }) => ({
  width: "100%",
  padding: "12px 16px",
  borderRadius: 10,
  border: "none",
  backgroundColor: disabled ? "#9bb38f" : C.olive,
  color: C.textLight,
  cursor: disabled ? "not-allowed" : "pointer",
  fontWeight: 600,
  fontSize: 16,
  transition: "background-color 0.2s ease",
}));

export default function UnifiedLogin() {
  const navigate = useNavigate();
  const [role, setRole] = useState("SUPER_ADMIN");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    try {
      if (role === "SUPER_ADMIN") {
        const q = query(collection(db, "users"), where("email", "==", email));
        const snap = await getDocs(q);
        if (snap.empty) throw new Error("No super admin found");
        const data = snap.docs[0].data();
        if (data.role !== "SUPER_ADMIN") throw new Error("Not a super admin account");
        if (data.password !== password) throw new Error("Invalid password");
        localStorage.setItem("superadmin", JSON.stringify({ id: snap.docs[0].id, ...data }));
        navigate("/dashboard");
      }

      if (role === "DEPARTMENT_HEAD") {
        const q = query(collection(db, "departments"), where("email", "==", email));
        const snap = await getDocs(q);
        if (snap.empty) throw new Error("No department found");
        const dept = snap.docs[0].data();
        if (dept.password !== password) throw new Error("Invalid password");
        localStorage.setItem("department", JSON.stringify({ id: snap.docs[0].id, ...dept }));
        navigate("/dept-dashboard");
      }

      if (role === "STAFF") {
        const q = query(collection(db, "users"), where("email", "==", email));
        const snap = await getDocs(q);
        if (snap.empty) throw new Error("No staff found");
        const data = snap.docs[0].data();
        if ((data.role || "STAFF") !== "STAFF") throw new Error("Not a staff account");
        if (data.password !== password) throw new Error("Invalid password");
        localStorage.setItem("staff", JSON.stringify({ id: snap.docs[0].id, ...data }));
        navigate("/staff-dashboard");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: C.olive,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Paper elevation={4} sx={{ width: { xs: "100%", sm: 420 }, p: 3, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 2, color: C.olive }}>
          Unified Login
        </Typography>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Role</InputLabel>
          <Select value={role} label="Role" onChange={(e) => setRole(e.target.value)}>
            <MenuItem value="SUPER_ADMIN">Super Admin</MenuItem>
            <MenuItem value="DEPARTMENT_HEAD">Department Head</MenuItem>
            <MenuItem value="STAFF">Staff</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ mb: 2 }}
        />

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <OliveButton onClick={handleLogin}>Login</OliveButton>
      </Paper>
    </Box>
  );
}
