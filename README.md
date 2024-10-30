# :star: :musical_note: Stage Pass :ticket: :star:
Created by Deryn Boscariol
To view the deployed site, visit [Live Demo](https://capstone-2024-32sn.onrender.com/).

## Table of Contents
- [Description](#description)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [API Endpoints](#api-endpoints)
- [Contact](#contact)

## Description

Stage Pass is a small venue concert ticketing app made with mern. My goals when creating Stage Pass were to create a platform to promotoe small local talents and where music lovers can discover new artists in their area.

## Features
- User authentication and authorization
- Browse and filter for local concerts
- Reserve tickets for events
- Add and manage concerts
- User profiles to track reserved tickets and organized concerts

## Technologies Used
- **Frontend**: React, Bootstrap, Vite
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Others**: JWT for authentication, Multer for file uploads

## API Endpoints
- `POST /api/register` - Registers a new user
- **POST** `/api/login` - Authenticates a user and returns a JWT
- **PUT** `/api/user/Settings` - Updates user settings (Not currently working)
- **GET** `/api/AllConcerts` - Returns all concerts
- **GET** `/api/FutureConcerts` - Returns upcoming concerts, filtered by genre and venue
- **GET** `/api/Genres` - Returns all unique concert genres
- **POST** `/api/NewConcert` - Creates a new concert (requires organizer privileges)
- **GET** `/api/venues` - Returns all venues
- **GET** `/api/concertsByVenue/:venueId` - Returns concerts for a specific venue
- **GET** `/api/ConcertDetails/:id` - Returns details of a specific concert by ID
- **POST** `/api/AddVenue` - Adds a new venue (requires organizer privileges)
- **DELETE** `/api/concertDetails/:id` - Deletes a selected concert created by the authenticated organizer
- **PUT** `/api/ConcertDetails/:id` - Updates the details of a concert created by the authenticated organizer
- **GET** `/api/YourConcerts` - Retrieves all concerts, and their information, created by the authenticated organizer
- **POST** `/api/reserveTickets` - Reserves tickets for a specified concert for the authenticated user
- **GET** `/api/user/tickets` - Retrieves all ticket reservations made by the authenticated user
- **DELETE** `/api/reserveTickets/:id` - Deletes a ticket reservation made by the authenticated user

## Contact
- Creator: Deryn Boscariol
- Email: derynb@rogers.com
- GitHub: [DerynBoscariol](https://github.com/DerynBoscariol)