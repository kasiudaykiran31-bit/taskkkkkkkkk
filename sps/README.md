# Student Program System (React + Vite)

Modules: **Admin**, **Student (User)**, **Parent**. Login and Signup use `localStorage`.

## Run locally
```
npm install
npm run dev        # http://localhost:5173
npm run build      # production build -> dist/
```

## Logins
- Admin: `admin@studentprogram.com` / `Mna6HCpD4d@97#` (change in `src/store.js` or Admin > Settings)
- Student / Parent: use **Create account** on the login page (a parent links to a registered student's email).

## Push to GitHub
```
git init
git add .
git commit -m "Student Program System - React + Vite"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

## Deploy to Vercel (CLI)
```
npm install -g vercel
vercel login          # login with GitHub
vercel                # set up and deploy? yes | link existing project? no
                      # project name: student-program-system | directory: press Enter
                      # modify settings? no   (Vite is auto-detected)
vercel --prod         # final production link
```
`vercel.json` already contains the rewrite so refreshing /admin, /student, /parent works.

## Review checklist
1. React + Vite  - done (this project)
2. Modules       - Admin, Student, Parent with separate dashboards
3. Login/Signup  - localStorage (users, reports, notices, session)
4. Vercel        - run the steps above; put the link in your GitHub repo description

Note: data is stored per browser (localStorage), and passwords are plain text - fine for a prototype.
