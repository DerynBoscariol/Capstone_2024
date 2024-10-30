# 🎶 🎸 Stage Pass 🎤 🎟️
---
Created by Deryn Boscariol  
To view the deployed site, visit [Live Demo](https://capstone-2024-32sn.onrender.com/).

## Description

Stage Pass is a small venue concert ticketing app created using a MERN stack. My goal when creating Stage Pass was to create a platform to promote small local talents and where music lovers can discover new artists in their area.

## Features
- User authentication and authorization
- Browse and filter for local concerts
- Reserve tickets for events
- Add and manage concerts
- User profiles to track reserved tickets and concerts organized

## Technologies Used
- **Frontend**: React, Bootstrap, Vite
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Others**: JWT for authentication, Multer for file uploads

## API Endpoints
- **POST** `/api/register` - Registers a new user.
- **POST** `/api/login` - Authenticates a user and returns a JWT.
- **PUT** `/api/user/Settings` - Updates user settings (currently not working).
- **GET** `/api/AllConcerts` - Returns all concerts.
- **GET** `/api/FutureConcerts` - Returns upcoming concerts, filtered by genre and venue.
- **GET** `/api/Genres` - Returns all unique concert genres.
- **POST** `/api/NewConcert` - Creates a new concert (requires organizer privileges).
- **GET** `/api/venues` - Returns all venues.
- **GET** `/api/concertsByVenue/:venueId` - Returns concerts for a specific venue.
- **GET** `/api/ConcertDetails/:id` - Returns details of a specific concert by ID.
- **POST** `/api/AddVenue` - Adds a new venue (requires organizer privileges).
- **DELETE** `/api/concertDetails/:id` - Deletes a concert created by the authenticated organizer.
- **PUT** `/api/ConcertDetails/:id` - Updates the details of a concert created by the authenticated organizer.
- **GET** `/api/YourConcerts` - Retrieves all concerts created by the authenticated organizer.
- **POST** `/api/reserveTickets` - Reserves tickets for a specified concert for the authenticated user.
- **GET** `/api/user/tickets` - Retrieves all ticket reservations made by the authenticated user.
- **DELETE** `/api/reserveTickets/:id` - Deletes a ticket reservation made by the authenticated user.

## Contact
- Creator: Deryn Boscariol
- Email: derynb@rogers.com
- GitHub: [DerynBoscariol](https://github.com/DerynBoscariol)