# BarCamp Pledge Application

A React-based pledge form application for BarCamp events with Firebase backend and admin dashboard to access all the submitted pledges.

## Setup Steps

#### Prerequisites:

- Node.js (v16 or higher)
- npm
- Firebase project

#### Step 1: Clone and Install

1. git clone [this-repository-url]
2. cd pledge-form-test
3. npm install

#### Step 2: Environment Setup

1. Copy environment file:
   cp .env.example .env

2. Edit .env with your Firebase config:
   VITE_FIREBASE_API_KEY=your_firebase_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   VITE_ADMIN_EMAIL=your_admin_email

#### Step 3: Firebase Setup

###### FOLLOW THIS IF YOU ARE SETTING THIS FOR YOUR OWN PROJECT

1. Go to Firebase Console: https://console.firebase.google.com/
2. Create new project or use existing one
3. Enable Authentication (Email/Password)
4. Enable Firestore Database
5. Create admin user in Authentication with your email
6. Copy Firebase config values to .env file

###### FOR BARCAMP MEMBERS:

1. Head to firebase console and copy the config values to the .env file
2. Make sure that the .env file is in .gitignore so that it does not get pushed to the repository

#### Step 3: Live testing

When working on the website run this command to view your changes in real time.

- npm run dev

#### Step 4: Build and Deploy

- npm run build
- firebase login
- firebase init hosting
- firebase deploy
