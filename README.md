# Live Deployment
[Click](https://arduino-simulator-react.vercel.app/) (or go to https://arduino-simulator-react.vercel.app/) to see the latest version of the application in live deployment.

## How to install
1) First of all, download and install the LTS Node.js version.
2) Clone the Git repository or download and extract the source code.
3) Open the terminal or command prompt in the project directory.
4) Run `npm i` to install all packages.

---
## How to deploy
If you want to start the development server, run the `npm run dev` command, if you want to run the production server,
first compile the code with the `npm run build` command and then run the `npm run start` command. At the end of both
options, the server will start running at http://localhost:3000. (Default port is `3000`)

---
## How to change port
If you want to change the port of the application, add `-p <port>` to the end of the `dev` and `start` commands in the
`package.json` file

---
###### &copy; Copyright 2023 | Fatih EGE