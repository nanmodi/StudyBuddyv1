import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import googleCalendarPlugin from "@fullcalendar/google-calendar";

const CalendarSection = () => {
  const [isGapiLoaded, setIsGapiLoaded] = useState(false);

  // Load the Google API client library
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/api.js";
    script.onload = () => {
      window.gapi.load("client", () => {
        window.gapi.client
          .init({
            apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
            discoveryDocs: [
              "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
            ],
          })
          .then(() => {
            setIsGapiLoaded(true);
          })
          .catch((error) => {
            console.error("Error initializing gapi client:", error);
          });
      });
    };
    document.body.appendChild(script);
  }, []);

  return (
    <div className="dashboard-card">
      <h2 className="card-title">Upcoming Events</h2>
      {isGapiLoaded ? (
        <FullCalendar
          plugins={[dayGridPlugin, googleCalendarPlugin]}
          initialView="dayGridMonth"
          googleCalendarApiKey={import.meta.env.VITE_GOOGLE_API_KEY}
          events={{
            googleCalendarId: import.meta.env.VITE_GOOGLE_CALENDAR_ID,
          }}
          height="400px"
          eventClick={(info) => {
            info.jsEvent.preventDefault(); // Prevent default browser behavior
            window.open(info.event.url, "_blank"); // Open event in a new tab
          }}
        />
      ) : (
        <p>Loading calendar...</p>
      )}
    </div>
  );
};

export default CalendarSection;
