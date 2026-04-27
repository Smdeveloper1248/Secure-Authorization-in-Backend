# Authorization Security for Developers

This repository contains a **step-by-step Express.js backend server** demonstrating secure authorization concepts, including JWT authentication, role-based access control (RBAC), horizontal vs vertical access control, and other secure authorization practices for developers.

Each feature is developed in a **separate branch** for tutorial purposes.

---

## Table of Contents

- [Technology Used](#Technolog-used)
- [Installation](#installation)
- [Setup](#Setup)
- [Running the Server](#running-the-server)
- [APIS list](#Api-list)
- [Branches](#branches)

---

## Technolog-used

- Express.js
- Sqlite
- Bcrypt
- jsonwebtoken

## Installation

1. Clone the repository (using SSH):

git clone git@github.com:Smdeveloper1248/Secure-Authorization-in-Backend.git

---

## Setup

Navigate to the folder

cd Secure-Authorization-in-Backend

Install all the Dependencies

npm install

## Running the server

After that you can start the server using

npm run dev

---

Test your api routes using Postman or browser

GET http://localhost:3000/

## Api-list

List of APIS you can call

Endpoint, Method, Action, Authorization Level

/api/auth/register, POST, Creates a new user
account (role: student) Public
/api/auth/login, POST, Authenticates a user and
returns a JWT Public

/api/users, GET, Read All Users in the system Admin Only

/api/users/me, GET, Read the logged-in user's
own profile Authenticated

/api/users/me, PUT, Update the logged-in user's
own profile Authenticated

/api/users/:id, DELETE, Delete specific user record Admin Only

/api/courses, GET, Read All courses Authenticated

/api/courses, POST, Create a new course, Admin Only

/api/courses/:id, PUT, Update an existing course Admin Only

/api/courses/:id DELETE Delete an existing course Admin Only

/api/enrollments, GET, Read All enrollment records., Admin Only

/api/enrollments/me, GET, Read all courses the logged-in
student is enrolled in Authenticated

/api/enrollments/enroll, POST, Enroll the logged-in user
in a course., Authenticated

/api/enrollments/:id, GET, Read a single enrollment record. Authenticated

/api/enrollments/:id, PUT, Update a grade for an enrollment record Admin Only

/api/enrollments/:id, DELETE, Delete an enrollment record Admin Only

```

```
