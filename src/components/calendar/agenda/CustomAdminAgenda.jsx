import React from "react";
import moment from "moment";
import './CustomAdminAgenda.css';

const CustomAdminAgenda = ({ events, getEventStyle }) => {
  // Group events by date
  const groupedEvents = events.reduce((acc, event) => {
    const date = moment(event.start).format("YYYY-MM-DD");
    if (!acc[date]) acc[date] = [];
    acc[date].push(event);
    return acc;
  }, {});

  return (
    <div className="agenda-view">
      {Object.keys(groupedEvents).map((date) => {
        const eventsForDay = groupedEvents[date];

        // Ensure there are exactly two events for each day, the first being the type, the second the details
        let eventType = eventsForDay[0] ? eventsForDay[0].title : '';
        let eventDetails = eventsForDay[1] ? eventsForDay[1].title : '';

        return (
          <div key={date} className="agenda-day">
            <div className="agenda-date">
              <strong>{moment(date).format("MMMM Do YYYY")}</strong>
            </div>
            <ul className="agenda-events">
              <li className="agenda-event">
                {/* Combine event type and details */}
                <div className="agenda-event-title">
                  {eventType}: {eventDetails}
                </div>
              </li>
            </ul>
          </div>
        );
      })}
    </div>
  );
};

// Add a title method to be used in the toolbar
CustomAdminAgenda.title = (date) => {
  return `Agenda: ${moment(date).format("MMMM YYYY")}`;
};

// Add the required navigate method
CustomAdminAgenda.navigate = (date, action) => {
  switch (action) {
    case 'PREV':
      return moment(date).subtract(1, 'month').toDate();
    case 'NEXT':
      return moment(date).add(1, 'month').toDate();
    default:
      return date;
  }
};

export default CustomAdminAgenda;
