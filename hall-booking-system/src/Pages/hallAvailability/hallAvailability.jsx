import React, { useState, useEffect ,useMemo } from "react";
import "./hallAvailability.css";
import logo from "../../assets/college-logo.png";
import Sidebar from "../../components/Sidebar/Sidebar"; 

const HallAvailability = () => {
  const [selectedDate, setSelectedDate] = useState(""); // Start with no date selected
  const [bookedSlots, setBookedSlots] = useState([]); // Stores booked slots for each hall

  const halls = useMemo(() => [
    { name: "Main Auditorium Hall" },
    { name: "Vedhanayagam Hall" },
    { name: "ECE Seminar Hall" },
    { name: "SF Seminar Hall" },
  ], []);
  

  const slots = [
    "8:30 - 9:00", "9:00 - 9:30", "9:30 - 10:00", "10:00 - 10:30", "10:30 - 11:00", "11:00 - 11:30", 
    "11:30 - 12:00", "12:00 - 12:30", "1:00 - 1:30", "1:30 - 2:00", "2:00 - 2:30", "2:30 - 3:00", 
    "3:00 - 3:30", "3:30 - 4:00", "4:00 - 4:30", "After 4:30",
  ];

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!selectedDate) return; // Only fetch when a date is selected
      
      try {
        // Create an array to hold the availability for each hall
        const availabilityPromises = halls.map(async (hall) => {
          const response = await fetch(`http://localhost:5000/api/availability?hall=${hall.name}&date=${selectedDate}`, {
            headers: {
              "Authorization": `Bearer ${localStorage.getItem("token")}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            return {
              hall: hall.name,
              availableSlots: data.availableSlots,
            };
          } else {
            console.error("Failed to fetch availability for hall:", hall.name);
            return { hall: hall.name, availableSlots: [] };
          }
        });

        // Wait for all the fetch requests to resolve
        const availabilityData = await Promise.all(availabilityPromises);
        setBookedSlots(availabilityData); // Store the availability data for each hall
      } catch (error) {
        console.error("Error fetching availability:", error);
      }
    };

    fetchAvailability();
  }, [selectedDate,halls]); // Re-fetch whenever the date changes

  // Check if the slot is booked for a specific hall
  const isBooked = (hallName, slot) => {
    const hallData = bookedSlots.find(hall => hall.hall === hallName);
    return hallData?.availableSlots.some(b => b.slot === slot && b.status === "red");
  };

  return (
    <div className="hallAvailability">
      <Sidebar />
      <header className="header">
        <img src={logo} alt="College Logo" className="logo" />
        <span className="bit-text">BIT</span>
        <h1 className="title">Hall Availability</h1>
        <div className="date-picker">
          <label htmlFor="date">Select Date:</label>
          <input
            type="date"
            id="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)} // Set selected date
          />
        </div>
      </header>
      <main>
        <table className="availability-table">
          <thead>
            <tr>
              <th className="hall-header">Hall</th>
              <th className="slot-header">Slot</th>
            </tr>
          </thead>
          <tbody>
            {halls.map((hall, index) => (
              <React.Fragment key={index}>
                <tr>
                  <td className="hall-name">{hall.name}</td>
                  <td>
                    <div className="slot-container">
                      {slots.map((slot, idx) => {
                        const isSlotBooked = isBooked(hall.name, slot); // Check if the slot is booked for this hall
                        return (
                          <button
                            key={idx}
                            className={`slot ${isSlotBooked ? "red" : "green"}`}
                            disabled={isSlotBooked} // Disable booked slots
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
};

export default HallAvailability;
