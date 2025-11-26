# Mini Social

Mini Social is a small Express + MongoDB app with a minimal frontend. It includes:

- User auth (JWT, bcrypt)
- Create / view posts (text + optional image)
- Comments and likes
- Follow / unfollow users

Run locally:

1. Install dependencies: `npm install`
2. Copy example env: create a file named `.env` in the project root and set values from `.env.example`
3. Start the server: `npm start`

Open `http://localhost:5000` in your browser.

To upload this project to GitHub, follow the instructions in the repository section below.

Repository upload (summary):

1. Create a new empty repository on GitHub (via web UI or `gh repo create`).
2. Add the remote and push:
   - `git remote add origin <GIT_URL>`
   - `git branch -M main`
   - `git push -u origin main`
