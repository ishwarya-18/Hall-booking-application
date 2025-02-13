import React, { useState, useEffect } from "react";
import './Admin.css';
import Sidebar from "../../components/Sidebar/Sidebar"; // Import Sidebar component
import axios from "axios"; // Axios for API calls

const AdminPage = () => {
    const [users, setUsers] = useState([]);

    // Fetch users from the backend API
    useEffect(() => {
        axios
            .get("http://localhost:5000/admin/users") // Ensure the correct endpoint
            .then((response) => {
                setUsers(response.data); // Set users from the response
            })
            .catch((error) => {
                console.error("There was an error fetching the users!", error);
            });
    }, []);

    // Handle deleting a user
    const handleDelete = (id) => {
        axios
            .delete(`http://localhost:5000/admin/users/${id}`) // Call the backend delete API
            .then(() => {
                setUsers(users.filter(user => user.id !== id)); // Update state to remove deleted user
            })
            .catch((error) => {
                console.error("There was an error deleting the user!", error);
            });
    };

    return (
        <div className="admin-container">
            <Sidebar />
            <div className="admin-header">
                <h1 className="admin-title">Admin Dashboard</h1>
            </div>

            <div className="admin-hall-booking">
                <div className="admin-booking-details">
                    <div className="admin-user-table-container">
                        <table className="admin-user-table">
                            <thead>
                                <tr>
                                    <th>User ID</th>
                                    <th>Name</th>
                                    <th>Email ID</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id}>
                                        <td>{user.id}</td>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>
                                            <button className="admin-delete" onClick={() => handleDelete(user.id)}>
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
