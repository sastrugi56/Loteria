# **System Design Document: Inclusive Lotería App**

## **1\. Project Overview**

**Name:** Lotería Extended Display App

**Target Audience:** Senior citizens and non-Spanish speakers.

**Core Objective:** Digitally mediate a traditional game of Lotería using a dual-screen architecture. The app handles pacing, bilingual audio, and visual history tracking to reduce cognitive load for players while allowing them to use traditional physical boards (*tablas*) and beans (*frijoles*).

## **2\. System Architecture**

* **Application Type:** Single Page Application (SPA) designed to run locally.  
* **Communication:** Utilizes the **Broadcast Channel API** for real-time, serverless, zero-latency communication between two browser windows (Operator Window and TV Window).  
* **State Management:** A centralized store synchronizes the deck, history, and current game mode across both windows.

## **3\. Technology Stack**

* **Framework:** Vue 3 (Composition API) \+ Vite  
* **State Management:** Pinia  
* **Styling:** Tailwind CSS \+ shadcn/vue (for dashboard components)  
* **Animation Engine:** GSAP (GreenSock) for high-performance layout transitions.  
* **Audio Manager:** Howler.js for sequenced, gapless audio playback.  
* **Data Layer:** Local JSON files (cards.json and boards.json).

## **4\. Data Models**

The application relies on two static JSON arrays loaded at runtime.

### **4.1 cards.json**

Contains all 54 cards.

JSON

{  
  "card\_id": 1,  
  "image\_path": "/assets/cards/01\_gallo.png",  
  "name\_spanish": "El Gallo",  
  "name\_english": "The Rooster",  
  "phonetic\_guide": "el GAH-yo",  
  "riddle\_spanish": "El que le canta a San Pedro...",  
  "riddle\_english": "He who sings to Saint Peter...",  
  "audio\_riddle": "/assets/audio/riddles/01\_riddle.mp3",  
  "audio\_answer": "/assets/audio/answers/01\_answer.mp3",  
  "audio\_rescue": "/assets/audio/rescue/01\_rescue.mp3"  
}

### **4.2 boards.json (For Win Validation)**

Maps physical printed board numbers to their 16 card IDs.

JSON

{  
  "board\_id": 12,  
  "cards": \[1, 5, 12, 34, 45, 2, 8, 9, 11, 23, 50, 51, 19, 22, 33, 40\]  
}

## **5\. Game Modes & Audio Sequencing**

The app supports two distinct pacing flows, controlled by the Operator.

### **Mode A: Classic Flow (Automated)**

* **Action:** Operator clicks "Draw Next Card".  
* **Sequence:**  
  1. Play chime.mp3  
  2. TV updates with new card immediately.  
  3. Play audio\_riddle  
  4. Javascript setTimeout for 3000ms (dramatic pause).  
  5. Play audio\_answer.

### **Mode B: Trivia Flow (Interactive)**

* **Action 1:** Operator clicks "Play Riddle".  
* **Sequence 1:**  
  1. Play chime.mp3 \+ audio\_riddle.  
  2. TV displays a "Question Mark" placeholder card with the English riddle text.  
* **Action 2:** Operator clicks "Reveal Card" (Button unlocks after Step 1).  
* **Sequence 2:**  
  1. TV triggers flip animation to reveal card image.  
  2. Play audio\_answer.

## **6\. UI/UX Specifications**

### **6.1 The Operator Console (Main Window)**

* **Layout:** 2-Column Dashboard.  
* **Header:** Game Mode Toggle (Classic vs. Trivia), "Launch TV Display" popup button.  
* **Left Column (Teleprompter \- 60%):**  
  * Displays current card image, Spanish/English names, and phonetic spelling.  
  * Contains the "Rescue" button (plays audio\_rescue for hard pronunciations).  
  * Contains the massive primary Action Buttons ("Draw Next" or "Play Riddle" / "Reveal").  
* **Right Column (Management \- 40%):**  
  * Visual history of called cards (List view).  
  * "Undo Last Draw" button (pops last card off history, puts back in deck).  
  * **Board Validator Input:** A text field where the operator types a Board ID (e.g., "12"). App checks boards.json against called\_cards. Flashes Green if all 16 match, Red with missing items if false.

### **6.2 The TV Display (Secondary Window)**

* **Layout:** Clean, high-contrast digital billboard. Light background.  
* **Left Zone (Main Stage \- 70%):** \* Massive display of the current active card.  
  * High-visibility card number badge.  
  * Clear bilingual titles and riddle text below the image.  
* **Right Zone (History Sidebar \- 30%):**  
  * Vertical list of the last 4-5 called cards (smaller thumbnails \+ names).

## **7\. Animation Logic (GSAP)**

The "Shrink and Move" animation is a critical cognitive aid for senior players to track game state.

* **Trigger:** When "Draw Next Card" (or "Reveal" in Trivia mode) is clicked.  
* **Choreography:**  
  1. Existing card on the Main Stage shrinks by \~65%.  
  2. Card translates (moves X/Y) into the top slot of the History Sidebar.  
  3. Existing items in the History Sidebar shift down by one slot.  
  4. The oldest item in the History Sidebar fades out (opacity: 0).  
  5. The new card fades and scales up slightly into the center of the Main Stage.

## **8\. Initialization Requirements**

* Ensure all assets (/assets/images, /assets/audio) are pre-loaded or served statically to prevent latency during gameplay.  
* The available\_deck array \[1...54\] must undergo a cryptographically secure shuffle (Fisher-Yates) on "Start New Game".

---

### **Next Steps**

If this looks accurate, save this as Loteria\_Design\_Doc.md. You can then pass this to your CLI with a prompt like:

*"Read this design document and generate the Vite/Vue project setup instructions, the Pinia store for State Management, and the BroadcastChannel service class to connect the two windows."*

