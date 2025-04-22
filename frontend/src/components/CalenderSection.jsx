import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import { FaPlus, FaTrash } from "react-icons/fa";

const CalendarSection = ({ onEventAdded }) => {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventTime, setNewEventTime] = useState("");

  // Fetch events from database (assuming a new endpoint for events)
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/events"); // Add this endpoint
        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);
        const eventsData = await response.json();
        setEvents(eventsData);
      } catch (err) {
        console.error("Error fetching events:", err.message);
      }
    };
    fetchEvents();
  }, []);

  // Handle date change from the calendar
  const handleDateChange = (newDate) => {
    setDate(newDate);
  };

  // Add a new event
  const addEvent = async () => {
    if (!newEventTitle.trim() || !newEventTime) {
      alert("Please enter an event title and time.");
      return;
    }

    const eventId = Date.now().toString();
    const eventDateTime = new Date(date);
    const [hours, minutes] = newEventTime.split(":");
    eventDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10));

    const newEvent = {
      id: eventId,
      title: newEventTitle,
      date: eventDateTime,
    };

    try {
      const response = await fetch("http://localhost:5001/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEvent),
      });
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
      const savedEvent = await response.json();
      setEvents((prev) => [...prev, savedEvent]);
      setNewEventTitle("");
      setNewEventTime("");
      if (onEventAdded) onEventAdded(); // Notify parent to update progress
    } catch (err) {
      console.error("Error adding event:", err.message);
    }
  };

  // Delete an event
  const deleteEvent = async (id) => {
    try {
      const response = await fetch(`http://localhost:5001/api/events/${id}`, {
        method: "DELETE",
      });
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
      setEvents((prev) => prev.filter((event) => event.id !== id));
    } catch (err) {
      console.error("Error deleting event:", err.message);
    }
  };

  // Get events for the selected date
  const getEventsForDate = (selectedDate) => {
    return events.filter((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getFullYear() === selectedDate.getFullYear() &&
        eventDate.getMonth() === selectedDate.getMonth() &&
        eventDate.getDate() === selectedDate.getDate()
      );
    });
  };

  // Tile content for calendar (shows event dots)
  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const dayEvents = getEventsForDate(date);
      return dayEvents.length > 0 ? (
        <div className="event-dots">
          {dayEvents.map((event) => (
            <span key={event.id} className="event-dot" />
          ))}
        </div>
      ) : null;
    }
  };

  return (
    <div className="dashboard-card calendar-card" id="calendar-section">
      <h2 className="card-title">Your Calendar</h2>
      <div className="calendar-container">
        {/* Calendar Grid */}
        <Calendar
          onChange={handleDateChange}
          value={date}
          tileContent={tileContent}
          className="custom-calendar"
          calendarType="gregory"
          prevLabel={<span className="calendar-nav">⟵</span>}
          nextLabel={<span className="calendar-nav">⟶</span>}
        />

        {/* Event Input and List */}
        <div className="calendar-events">
          <div className="event-input">
            <input
              type="text"
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              placeholder="Add event title..."
              className="todo-input-field"
              onKeyPress={(e) => e.key === "Enter" && addEvent()}
            />
            <input
              type="time"
              value={newEventTime}
              onChange={(e) => setNewEventTime(e.target.value)}
              className="todo-input-field time-input"
            />
            <button className="add-todo-button" onClick={addEvent}>
              <FaPlus />
            </button>
          </div>

          {/* Events for Selected Date */}
          <div className="events-list">
            <h3 className="events-date">
              {date.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </h3>
            {getEventsForDate(date).length > 0 ? (
              <ul className="event-items">
                {getEventsForDate(date).map((event) => (
                  <li key={event.id} className="event-item">
                    <span className="event-time">
                      {new Date(event.date).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="event-title">{event.title}</span>
                    <button
                      className="delete-button"
                      onClick={() => deleteEvent(event.id)}
                    >
                      <FaTrash />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-events-text">
                No events scheduled for this day.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarSection;
