# Magic: The Gathering Commander Deck Database

## What is this application?

This is a web application that helps you organize and track your Magic: The Gathering Commander decks. Think of it like a digital binder where you can:

- Store all your Commander decks in one place
- View beautiful card images for each card in your deck
- Track statistics like wins, losses, and mulligans
- Sort your cards by name, mana value, or type
- Add notes about your decks

## How does it work?

### The Big Picture

When you open this application in a web browser, here's what happens:

1. **The HTML file (index.html)** - This is like the foundation of a house. It creates an empty space where our app will live.

2. **The main.jsx file** - This is like the front door. It's the first thing that runs and tells the browser "Hey, start showing our app here!"

3. **The App.jsx file** - This is like the main hallway of the house. It sets up navigation between different rooms (pages) of the application.

4. **The DeckList.jsx file** - This is like the living room where you see all your decks displayed as cards.

5. **The DeckDetail.jsx file** - This is like a detailed room where you can see everything about one specific deck.

### How Data is Stored

All your decks are saved in your browser's "localStorage". Think of this like a filing cabinet that only you can access on your computer. Your data stays on your computer and doesn't get sent to any server.

**Important:** If you clear your browser data, you will lose all your decks! Consider exporting your data if you have important decks saved.

### How Card Images Work

When you import a decklist, the app:
1. Reads each card name you pasted
2. Sends a request to Scryfall (a free Magic: The Gathering card database)
3. Gets back information about that card, including a picture
4. Displays the card with its image in your deck

This process happens for every card, which is why importing can take a minute or two.

## File Structure Explained

### index.html
- The basic webpage structure
- Creates an empty container where our app will appear
- Links to our main JavaScript file

### main.jsx
- The starting point of the application
- Connects our React app to the webpage
- Runs when the page loads

### App.jsx
- Sets up navigation (how you move between pages)
- Creates the navigation bar at the top
- Defines which page shows when you click different links

### DeckList.jsx
- Shows all your decks in a grid
- Handles importing new decks
- Lets you delete decks
- When you click a deck, it takes you to the detail page

### DeckDetail.jsx
- Shows all information about one specific deck
- Displays the commander card image
- Shows statistics (wins, losses, mulligans)
- Lets you sort cards by name, mana value, or type
- Allows you to edit stats and add notes

### package.json
- Lists all the tools and libraries the app needs to run
- Like a shopping list of ingredients needed to bake a cake
- **Scripts section:** Commands you can run:
  - `npm run dev` - Starts the development server (for testing)
  - `npm run build` - Creates a production-ready version
  - `npm run preview` - Previews the production build
- **Dependencies:** Tools included in the final app:
  - `react` - The main library for building the user interface
  - `react-dom` - Connects React to the webpage
  - `react-router-dom` - Handles navigation between pages
- **DevDependencies:** Tools only needed during development:
  - `vite` - The build tool that packages everything together
  - `@vitejs/plugin-react` - Makes Vite work with React

## How to Use

1. **Start the application:**
   - Open a terminal/command prompt in this folder
   - Type `npm install` (this downloads all the tools needed)
   - Type `npm run dev` (this starts the app)
   - Open your browser to the address shown (usually http://localhost:5173)

2. **Import a deck:**
   - Click the "Import Decklist" button
   - Enter a name for your deck
   - (Optional) Enter your commander's name
   - Paste your decklist (one card per line, like "1 Sol Ring")
   - Click "Import"
   - Wait for the app to fetch card images (this takes a minute)

3. **View a deck:**
   - Click on any deck card from the main page
   - See all the cards with images
   - Use the sort buttons to organize cards

4. **Track statistics:**
   - On a deck's detail page, use the +/- buttons to update wins, losses, or mulligans
   - Or click "Edit Stats" for precise number entry
   - The win rate is automatically calculated

5. **Add notes:**
   - Type notes in the notes box on a deck's detail page
   - Notes are automatically saved when you click away

## Technical Details (For Those Interested)

- **Built with:** React (a JavaScript library for building user interfaces)
- **Routing:** React Router (handles navigation between pages)
- **Data Storage:** Browser localStorage (saves data on your computer)
- **Card Data:** Scryfall API (free Magic: The Gathering card database)
- **Build Tool:** Vite (helps package and run the application)

## Troubleshooting

**Import is slow:**
- This is normal! The app fetches images for each card from Scryfall
- Scryfall limits how fast we can request data to be fair to everyone
- A 100-card deck takes about 10 seconds to import

**Card images don't appear:**
- The card name might not match exactly what's in Scryfall
- Try checking the spelling of the card name
- Some very old or obscure cards might not have images

**Decks disappeared:**
- Check if you cleared your browser data
- localStorage data is stored per browser and per computer
- If you switch browsers or computers, your decks won't be there

## Future Improvements

Possible features that could be added:
- Export/import deck data as files
- Search and filter cards within a deck
- Deck statistics and analytics
- Multiple commander support
- Deck comparison tools
