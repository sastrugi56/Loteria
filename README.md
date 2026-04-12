# Lotería Extended Display App

An inclusive, digitally mediated version of the traditional Mexican Lotería game, designed specifically for senior citizens and non-Spanish speakers.

## 🌟 Core Objective
The app handles pacing, bilingual audio, and visual history tracking to reduce cognitive load for players, allowing them to focus on their traditional physical boards (*tablas*) and beans (*frijoles*).

## 🚀 Key Features
- **Dual-Screen Architecture**: Use a dedicated **Operator Console** and a high-visibility **TV Display**.
- **Real-Time Sync**: Uses the **Broadcast Channel API** for zero-latency communication between windows.
- **Inclusive Design**: 
  - Large-print, high-contrast visuals.
  - Bilingual audio (Spanish/English) for riddles and card names.
  - Phonetic pronunciation guides for the operator.
- **Two Game Modes**:
  - **Classic**: Automated flow with dramatic pauses.
  - **Trivia**: Interactive guessing game where the card stays hidden until revealed.
- **Board Registry**: Generate and print 100% unique, non-repeating Lotería boards.
- **Win Validator**: Quickly verify if a player has actually won by checking their Board ID.

## 🛠️ Technology Stack
- **Frontend**: Vue 3 (Composition API) + Vite
- **State Management**: Pinia
- **Styling**: Tailwind CSS 4
- **Animations**: GSAP (GreenSock)
- **Audio**: Howler.js
- **Icons**: Lucide Vue Next

## 💻 Local Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Open App**:
   Navigate to the local URL provided by Vite. 
   - Open the **Operator Console** (default view).
   - Click **"Launch TV Display"** to open the secondary window.

## 🌐 GitHub Pages Deployment
This app is optimized for static hosting on GitHub Pages.

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy**:
   Push the contents of the `dist/` folder to the `gh-pages` branch. 
   *Note: The app is configured with relative paths (`base: './'`) to support subfolder hosting.*

## 📁 Project Structure
- `src/components/`: Core UI components (OperatorConsole, TVDisplay, BoardDesigner).
- `src/stores/`: Pinia store for centralized game state.
- `src/services/`: Audio management and Broadcast Channel communication.
- `public/assets/`: JSON data for cards and boards, plus all media files.

---
*Designed for Inclusive Play*
