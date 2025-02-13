import React, { useState, useEffect } from "react";
import "./hallBooking.css";
import logo from "../../assets/college-logo.png";
import Sidebar from "../../components/Sidebar/Sidebar";

const HallBooking = () => {
  const [selectedHall, setSelectedHall] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [purpose, setPurpose] = useState("");
  const [selectedSlots, setSelectedSlots] = useState([]); // Allow multiple slots
  const [bookings, setBookings] = useState([]);

  const halls = [
    { name: "Main Auditorium Hall" },
    { name: "Vedhanayagam Hall" },
    { name: "ECE Seminar Hall" },
    { name: "SF Seminar Hall" },
  ];

  const slots = [
    "8:30 - 9:00",
    "9:00 - 9:30",
    "9:30 - 10:00",
    "10:00 - 10:30",
    "10:30 - 11:00",
    "11:00 - 11:30",
    "11:30 - 12:00",
    "12:00 - 12:30",
    "1:00 - 1:30",
    "1:30 - 2:00",
    "2:00 - 2:30",
    "2:30 - 3:00",
    "3:00 - 3:30",
    "3:30 - 4:00",
    "4:00 - 4:30",
    "After 4:30",
  ];

  const today = new Date().toLocaleDateString("en-GB"); // Format today's date as dd-mm-yyyy

  // Helper function to format the date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB"); // Formats date as dd/mm/yyyy
  };

  // Fetch existing bookings on component load
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/bookings", {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setBookings(data);
        }
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };
    fetchBookings();
  }, []);

  const token = localStorage.getItem("token");
  const userId = token ? JSON.parse(atob(token.split('.')[1])).userId : null;


  const handleSlotClick = (slot) => {
    if (selectedSlots.includes(slot)) {
      setSelectedSlots(selectedSlots.filter((s) => s !== slot));
    } else {
      setSelectedSlots([...selectedSlots, slot]);
    }
  };

  const handleBookNow = async () => {
    if (!selectedHall || !selectedDate || !purpose || selectedSlots.length === 0) {
      alert("Please select a hall, date, and purpose, and choose at least one slot.");
      return;
    }
  
    const conflictSlots = selectedSlots.filter((slot) =>
      bookings.some(
        (booking) =>
          booking.slot === slot &&
          booking.hall === selectedHall &&
          booking.date === selectedDate
      )
    );
  
    if (conflictSlots.length > 0) {
      alert(
        `The following slots are already booked: ${conflictSlots.join(", ")}. Please choose different slots.`
      );
      return;
    }
   
    if (!userId) {
      alert("User not logged in.");
      return;
    }
    try {
      const response = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          hall: selectedHall,
          date: selectedDate,
          slots: selectedSlots, // Sending multiple slots
          purpose,
          user_id: userId, // Using the extracted user ID from the token
        }),
      });
  
      const data = await response.json(); // Capture the response body
  
      if (response.ok) {
        setBookings((prevBookings) => [...prevBookings, ...data]);
      } else {
        console.error("Error response:", data);
        alert("Booking failed. " + (data.message || "Please try again."));
      }
    } catch (error) {
      console.error("Error occurred during booking:", error);
      alert("Error occurred. Please try again.");
    }
  
    setPurpose("");
    setSelectedSlots([]);
    setSelectedHall("");
    setSelectedDate("");
  };
  

  const handleDeleteBooking = async (bookingId, index) => {
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        setBookings((prevBookings) => prevBookings.filter((_, i) => i !== index));
      } else {
        const data = await response.json();
        alert(data.message || "Failed to delete booking.");
      }
    } catch (error) {
      console.error("Error deleting booking:", error);
      alert("Error occurred while deleting the booking.");
    }
  };

  return (
    <div className="hall-booking">
      <Sidebar />
      <header className="booking-header">
        <img src={logo} alt="College Logo" className="booking-logo" />
        <span className="booking-bit-text">BIT</span>
        <h1 className="booking-title">Hall Booking System</h1>
      </header>
      <main>
        <div className="booking-form">
          <div className="booking-form-group">
            <label htmlFor="hall">Select Hall:</label>
            <select
              id="hall"
              value={selectedHall}
              onChange={(e) => setSelectedHall(e.target.value)}
            >
              <option value="" disabled>Select a Hall</option>
              {halls.map((hall, index) => (
                <option key={index} value={hall.name}>
                  {hall.name}
                </option>
              ))}
            </select>
          </div>
          <div className="booking-form-group">
            <label htmlFor="date">Select Date:</label>
            <input
              type="date"
              id="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={today}
            />
          </div>
          <div className="booking-form-group">
            <label htmlFor="purpose">Purpose:</label>
            <input
              type="text"
              id="purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Enter the Purpose"
            />
          </div>
        </div>
        <div className="booking-slots">
          <div className="booking-slot-section">
            <h3>Forenoon:</h3>
            <div className="booking-slot-container">
              {slots.slice(0, 8).map((slot, index) => (
                <button
                  key={index}
                  className={`slot ${
                    selectedSlots.includes(slot) ? "blue" : "green"
                  } ${
                    bookings.some(
                      (booking) =>
                        booking.slot === slot &&
                        booking.hall === selectedHall &&
                        booking.date === selectedDate
                    )
                      ? "disabled"
                      : ""
                  }`}
                  onClick={() =>
                    bookings.some(
                      (booking) =>
                        booking.slot === slot &&
                        booking.hall === selectedHall &&
                        booking.date === selectedDate
                    )
                      ? null
                      : handleSlotClick(slot)
                  }
                  disabled={bookings.some(
                    (booking) =>
                      booking.slot === slot &&
                      booking.hall === selectedHall &&
                      booking.date === selectedDate
                  )}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
          <div className="booking-slot-section">
            <h3>Afternoon:</h3>
            <div className="booking-slot-container">
              {slots.slice(8).map((slot, index) => (
                <button
                key={index}
                className={`slot ${selectedSlots.includes(slot) ? "blue" : "green"} ${
                  bookings.some(
                    (booking) =>
                      booking.slot === slot &&
                      booking.hall === selectedHall &&
                      booking.date === selectedDate
                  )
                    ? "disabled"
                    : ""
                }`}
                onClick={() =>
                  bookings.some(
                    (booking) =>
                      booking.slot === slot &&
                      booking.hall === selectedHall &&
                      booking.date === selectedDate
                  )
                    ? null
                    : handleSlotClick(slot)
                }
                disabled={bookings.some(
                  (booking) =>
                    booking.slot === slot &&
                    booking.hall === selectedHall &&
                    booking.date === selectedDate
                )}
              >
                {slot}
              </button>
              
              
              ))}
            </div>
          </div>
        </div>
        <button className="book-now" onClick={handleBookNow}>
          Book Now
        </button>
        <div className={`booking-details ${bookings.length > 0 ? "active" : ""}`}>
          <h3>Booking Details:</h3>
          <div>
            <table>
              <thead>
                <tr>
                  <th>Slot</th>
                  <th>Hall</th>
                  <th>Date</th>
                  <th>Purpose</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking, index) => (
                  <tr key={booking.id}>
                    <td>{booking.slot}</td>
                    <td>{booking.hall}</td>
                    <td>{formatDate(booking.date)}</td> {/* Format the date here */}
                    <td>{booking.purpose}</td>
                    <td>
                    {booking.user_id === userId && ( // Check if the booking belongs to the logged-in user
                      <button
                        className="booking-delete"
                        onClick={() => handleDeleteBooking(booking.id, index)}
                      >
                        Delete
                      </button>
                    )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HallBooking;
