![image](https://github.com/user-attachments/assets/4bebe3d2-9299-4edd-98b3-122fd42152dd)
![image](https://github.com/user-attachments/assets/0c9dd9fb-2ad3-4724-b3d7-10d3dc1bf9eb)

THIS IS HOW OUR WEB PAGE LOOK

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- Javascript
- React
- shadcn-ui
- Tailwind CSS


# PCB Auto-Router

A modern, interactive multi-group PCB routing visualizer built with React, JavaScript, Tailwind CSS, and shadcn-ui.

## Features

- Visualize and auto-route multiple PCB nets with colored paths
- Add, remove, and manage nets and pins
- Interactive canvas with grid and snapping
- Responsive dark-themed UI
- Built with Vite for fast development

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

Clone the repository:

```sh
git clone <YOUR_GIT_URL>
cd <project name>
```

Install dependencies:

```sh
npm install
# or
yarn install
```

### Running the Development Server

```sh
npm run dev
# or
yarn dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to view the app.

## Project Structure

- `src/` - Main application source code
  - `components/` - React components (NetManager, RoutingControls, PCBCanvas, etc.)
  - `pages/` - Page components
  - `utils/` - Utility functions (e.g., routing algorithms)
- `public/` - Static assets
- `index.html` - Main HTML file

## Technologies Used

- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn-ui](https://ui.shadcn.com/)
- [Vite](https://vitejs.dev/)

## Deployment

You can deploy this project to any static hosting provider (Vercel, Netlify, GitHub Pages, etc.):

```sh
npm run build
# or
yarn build
```

The production-ready files will be in the `dist/` folder.

## License

This project is licensed under the MIT License.

---

**Made with ❤️ for PCB enthusiasts.**
