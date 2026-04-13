# **Digital Lotería: User Manual**

Welcome to the Inclusive Lotería App. This tool is designed to digitally mediate traditional Lotería games with a focus on senior accessibility and bilingual support.

---

## **1. Installation & Execution**

### **Prerequisites**
- **Node.js** (Version 18 or higher) must be installed on your system.
- A modern web browser (Chrome, Edge, or Firefox).

### **First-Time Setup**
1. Open your terminal or command prompt in the project folder.
2. Run the command to install dependencies:
   ```bash
   npm install
   ```

### **Launching the App**
To start the application, run:
```bash
npm run dev
```
Once the server starts, open your browser to: `http://localhost:5173`

---

## **2. Cross-Platform Migration**

The app is built using Node.js and Vite, making it fully portable between operating systems.

### **Moving to a New System (Windows, Linux, or OSX)**
1. **Transfer Files**: Copy the project folder to the new machine. 
   - *Note: You do not need to copy the `node_modules` folder.*
2. **Install Node.js**: Ensure the new system has Node.js installed.
3. **Initialize**: In the new folder, run `npm install`.
4. **Run**: Use `npm run dev` to start the app.

### **Operating System Specifics**
- **Linux**: Note that the file system is case-sensitive. Ensure all file references in `cards.json` match the exact capitalization of your image and audio files.
- **Windows**: No special considerations.
- **OSX**: Ensure you grant "Terminal" or "VS Code" permissions to access files if prompted.

---

## **3. Running the Game (Operator Guide)**

The **Operator Console** is the "brain" of the game.

### **Game Modes**
- **Classic Mode**: Automated flow. Click "Draw Next Card" to play the Chime, the Riddle, and the Answer automatically with a dramatic 3-second pause.
- **Trivia Mode**: Interactive flow.
  1. Click "Play Riddle". The TV will show a Question Mark.
  2. Once players guess, click "Reveal" to show the card and play the answer.

### **Operator Controls**
- **Rescue Button**: Click the lifebuoy icon to play the card's Spanish name clearly for the *current* card.
- **Click-to-Replay**: Any card in the **History Sidebar** (right column) can be clicked at any time. This will replay that specific card's Spanish name without interrupting the game flow. Look for the speaker icon when hovering over a card.
- **Undo Last**: If you make a mistake, click "Undo Last" to put the card back in the deck.
- **Reset Game**: Shuffles the deck and clears the history for a new round.

### **Win Validator**
1. Locate the **Serial Number** on a player's physical board (e.g., #012).
2. Type "12" into the Win Validator box.
3. The box will flash **Green** if the board is complete, or **Red** if cards are still missing.

---

## **4. The TV Display**

The TV Display is designed for players. It should be shown on a large screen or projector.

1. Click **"Launch TV Display"** from the Operator Console.
2. Drag the new window to your second monitor/TV.
3. Press **F11** to make the browser go fullscreen.
4. **Features**:
   - **Main Stage**: Shows the current card in high-contrast.
   - **Shrink and Move**: Cards visibly fly into the sidebar when a new one is called, helping seniors track the history.
   - **Bilingual Riddles**: Displays text in both languages to assist non-fluent speakers.

---

## **5. Creating & Printing Boards**

The **Board Designer** ensures every player has a 100% unique board.

### **Managing the Registry**
1. Access the designer by clicking **"Manage Boards"** in the Operator Header.
2. **Generate**: Enter a number (e.g., 20) and click "Create Batch". The system ensures no duplicates are created.
3. **Saving**: After generating boards, click the **Download (Disk) Icon**. 
   - **CRITICAL**: Move the downloaded `boards.json` into your `public/assets/` folder to sync the Win Validator.

### **Printing for Seniors**
1. Click the **Printer Icon** to enter print-ready mode.
2. **Printer Settings**:
   - Orientation: **Portrait**
   - Paper Size: **Letter (8.5" x 11")**
   - Margins: **None** or **Default**
   - Scale: **100%**
3. **Lamination**: It is recommended to laminate boards for longevity and to allow players to use dry-erase markers.

---

## **6. Troubleshooting**

- **White Screen**: Open the console (F12). Ensure `cards.json` exists in `public/assets/`.
- **TV Not Syncing**: Refresh both windows. The TV window must "Request Sync" from an active Operator window.
- **Audio Not Playing**: Check that your files are in `.mp3` format and located in `public/assets/audio/`.
- **Images Not Showing**: Ensure the `image_path` in `cards.json` matches your file names exactly.

---

## **7. GitHub Pages Deployment (Static Hosting)**

This application is optimized for static hosting on GitHub Pages, which is the easiest way to run the app on any device with internet access.

### **One-Step Deployment**
If you have configured the repository correctly, you can deploy your latest changes with a single command:
```bash
npm run deploy
```

### **What this does:**
1. **Builds** the project into the `dist/` folder.
2. **Creates** a `.nojekyll` file (required for Vue apps on GitHub).
3. **Pushes** the compiled files to the `gh-pages` branch on GitHub.

---

## **8. Production Deployment (Manual Server)**

You can run this app on any machine without revealing your source code (the `.vue` and `.ts` files).

### **Step 1: Create the Build**
On your development machine, run:
```bash
npm run build
```
This creates a new folder called **`dist/`** in your project directory.

### **Step 2: Distribute the `dist` Folder**
- The `dist/` folder is your entire application. 
- You can copy this folder to a USB drive and move it to any other computer.
- **You do not need to copy any other files.**

### **Step 3: Run the Build**
Because browsers have security restrictions, you cannot just double-click `index.html`. You must run it using a tiny "Static Server":

**If Node.js is installed:**
```bash
npx serve -s dist
```

**If Python is installed (Linux/Mac):**
```bash
cd dist
python3 -m http.server 8080
```
