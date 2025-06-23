# BarCamp Pledge Application

A React-based pledge form application for BarCamp events with Firebase backend and admin dashboard to access all the submitted pledges.

## Setup Steps

#### Prerequisites:

- Node.js (v16 or higher)
- git
- npm
- Install firebase: `npm install firebase`
- Install firebase tools: `npm install -g firebase-tools`

#### Step 1: Clone and Install

1. Create a folder for the project
2. Enter the following in the terminal:

```
git init
git clone https://github.com/xprotonium/barcamp-pledge
cd pledge-form-test
npm install
```

#### Step 2: Environment Setup

1. The `.env` file values will be sent to you
2. Make sure that the `.env` file is in .gitignore so that it does not get pushed to the repository

#### Step 4: Live testing

When working on the website run this command to view your changes in real time.

- `npm run dev`

#### Step 5: Build and Deploy

When you wish to deploy the changes to the firebase server, type the following in the terminal:

```
npm run build
firebase login
firebase init hosting
firebase deploy
```

#### IMPORTANT NOTES:

- The .env file contains sensitive data - never commit it to git
- Update firestore.rules with your actual admin email before deploying
- Admin dashboard won't work without updating firestore rules
- Firebase API key is safe to share (it's public)
- Admin email in .env controls who can access admin features
