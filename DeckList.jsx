/**
 * DECK LIST PAGE - The Main Page That Shows All Your Decks
 * 
 * This is like the "home page" of the application. When you first open the app,
 * this is what you see. It displays all your saved decks in a nice grid layout.
 * 
 * What this page does:
 * - Shows all your decks as clickable cards
 * - Lets you import new decks by pasting a decklist
 * - Lets you delete decks you don't want anymore
 * - When you click a deck, it takes you to the detail page
 */

// Import React and its tools for managing data that changes over time
import React, { useState, useEffect } from 'react';
// Import navigation tool so we can send users to other pages
import { useNavigate } from 'react-router-dom';

function DeckList() {
    /**
     * STATE VARIABLES - These are like memory boxes that remember information
     * 
     * Think of these like sticky notes that remember things:
     * - decks: The list of all your saved decks
     * - showImportModal: Whether the "import deck" popup window is open or closed
     * - decklistText: The text you paste when importing a deck
     * - deckName: The name you give your deck when importing
     * - commanderName: The name of your commander (optional)
     * - importing: Whether we're currently in the process of importing (so we can show "Importing..." message)
     */
    const [decks, setDecks] = useState([]);              // Start with empty list of decks
    const [showImportModal, setShowImportModal] = useState(false);  // Import popup starts closed
    const [decklistText, setDecklistText] = useState('');           // No text pasted yet
    const [deckName, setDeckName] = useState('');                  // No deck name entered yet
    const [commanderName, setCommanderName] = useState('');          // No commander name entered yet
    const [importing, setImporting] = useState(false);              // Not currently importing
    
    // Get the navigation function so we can send users to other pages
    const navigate = useNavigate();

    /**
     * LOAD SAVED DECKS WHEN PAGE OPENS
     * 
     * This runs once when the page first loads. It's like opening a filing cabinet
     * and pulling out all your saved decks. The decks are stored in the browser's
     * localStorage, which is like a permanent storage box that stays on your computer.
     */
    useEffect(() => {
        // Go to the browser's storage and look for saved decks
        const savedDecks = localStorage.getItem('mtgDecks');
        
        // If we found saved decks, convert them from text format back to data and display them
        if (savedDecks) {
            setDecks(JSON.parse(savedDecks));
        }
    }, []); // The empty array [] means "only run this once when the page loads"

    /**
     * SAVE DECKS TO STORAGE
     * 
     * This function saves your decks to the browser's permanent storage.
     * Think of it like putting your decks back in the filing cabinet.
     * 
     * @param {Array} newDecks - The updated list of all your decks
     */
    const saveDecks = (newDecks) => {
        // Update what we're showing on screen
        setDecks(newDecks);
        // Save to permanent storage (convert to text format first)
        localStorage.setItem('mtgDecks', JSON.stringify(newDecks));
    };

    /**
     * FETCH CARD DATA FROM SCRYFALL
     * 
     * This function asks Scryfall (a free Magic: The Gathering card database)
     * for information about a specific card. It's like looking up a card in a
     * giant encyclopedia of Magic cards.
     * 
     * What we get back:
     * - Card image
     * - Mana cost
     * - Card type (Creature, Instant, etc.)
     * - Rarity
     * - And more!
     * 
     * @param {string} cardName - The name of the card to look up
     * @returns {Object|null} - The card data, or null if not found
     */
    const fetchScryfallCard = async (cardName) => {
        try {
            // First, try to find the card with an exact name match
            // encodeURIComponent makes sure special characters in card names work properly
            let response = await fetch(`https://api.scryfall.com/cards/named?exact=${encodeURIComponent(cardName)}`);
            
            // If exact match didn't work, try a fuzzy search (finds similar names)
            if (!response.ok) {
                response = await fetch(`https://api.scryfall.com/cards/search?q=${encodeURIComponent(cardName)}`);
                if (!response.ok) {
                    // Still didn't work, give up
                    return null;
                }
                // We got search results, take the first one (most likely match)
                const searchData = await response.json();
                if (searchData.data && searchData.data.length > 0) {
                    return searchData.data[0];
                }
                return null;
            }
            
            // Exact match worked! Return the card data
            const data = await response.json();
            return data;
        } catch (error) {
            // Something went wrong (maybe internet connection issue)
            console.error('Error fetching Scryfall card:', error);
            return null;
        }
    };

    /**
     * PARSE DECKLIST TEXT
     * 
     * This function reads the text you paste and figures out which cards are in your deck.
     * It's like a smart reader that understands different ways people write decklists.
     * 
     * It can understand formats like:
     * - "1 Sol Ring"
     * - "1x Sol Ring"
     * - "1 - Sol Ring"
     * 
     * It also skips:
     * - Empty lines
     * - Comments (lines starting with // or #)
     * - Section headers (like "Commander:" or "Sideboard:")
     * 
     * @param {string} text - The pasted decklist text
     * @returns {Array} - List of cards with their quantities
     */
    const parseDecklist = (text) => {
        // Split the text into individual lines, remove extra spaces, and remove empty lines
        const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        const cards = []; // This will hold our list of cards
        
        // Look at each line one by one
        for (const line of lines) {
            // Skip lines that are comments or section headers
            if (line.startsWith('//') || line.startsWith('#') || 
                line.toLowerCase().includes('commander') || 
                line.toLowerCase().includes('sideboard')) {
                continue; // Skip this line and move to the next one
            }
            
            // Try to match patterns like "1 Card Name", "1x Card Name", "1 - Card Name"
            // This is a "regular expression" - a pattern matcher
            const match = line.match(/^(\d+)\s*x?\s*-?\s*(.+)$/);
            
            if (match) {
                // We found a card! Extract the quantity (number) and name
                const quantity = parseInt(match[1]);  // The number (like "1" or "2")
                const cardName = match[2].trim();     // The card name (like "Sol Ring")
                
                // Make sure we have a valid card name and quantity
                if (cardName && quantity > 0) {
                    cards.push({ name: cardName, quantity });
                }
            }
        }
        
        return cards; // Give back the list of cards we found
    };

    /**
     * HANDLE DECK IMPORT - The Main Import Function
     * 
     * This is the big function that runs when you click "Import". It:
     * 1. Checks that you entered a deck name and pasted a decklist
     * 2. Reads the decklist and figures out which cards are in it
     * 3. For each card, asks Scryfall for the card image and information
     * 4. Creates a new deck object with all this information
     * 5. Saves it and takes you to the deck detail page
     * 
     * This process can take a minute because it fetches images for every card!
     */
    const handleImport = async () => {
        // Make sure the user pasted a decklist
        if (!decklistText.trim()) {
            alert('Please paste a decklist');
            return; // Stop here if they didn't
        }
        
        // Make sure the user entered a deck name
        if (!deckName.trim()) {
            alert('Please enter a deck name');
            return; // Stop here if they didn't
        }

        // Turn on the "importing" flag so we can show "Importing..." message
        setImporting(true);
        
        try {
            // Step 1: Read the pasted text and figure out which cards are in the deck
            const parsedCards = parseDecklist(decklistText);
            
            // Make sure we found at least one card
            if (parsedCards.length === 0) {
                alert('No valid cards found in decklist. Please check the format (e.g., "1 Card Name" or "1x Card Name")');
                setImporting(false);
                return;
            }

            // Step 2: For each card, get its image and information from Scryfall
            const decklist = []; // This will hold all our cards with their images
            let commanderData = null; // We'll store commander info here
            
            // Figure out which card is the commander (use provided name or first card)
            const commanderToFind = commanderName.trim() || parsedCards[0]?.name;
            
            // Go through each card one by one
            for (const card of parsedCards) {
                // Ask Scryfall for information about this card
                const scryfallData = await fetchScryfallCard(card.name);
                
                // If this card is the commander, remember its data
                if (card.name.toLowerCase() === commanderToFind.toLowerCase() && !commanderData) {
                    commanderData = scryfallData;
                }
                
                // Save all the card information we got
                decklist.push({
                    name: card.name,                    // The card's name
                    quantity: card.quantity,             // How many copies (usually 1)
                    // Get the card image (some cards have two faces, so check both)
                    imageUrl: scryfallData?.image_uris?.normal || scryfallData?.card_faces?.[0]?.image_uris?.normal || null,
                    manaCost: scryfallData?.mana_cost || '',  // The mana cost (like "{1}{R}")
                    // CMC = Converted Mana Cost (total mana value)
                    cmc: scryfallData?.cmc ?? (scryfallData?.card_faces?.[0]?.cmc ?? null),
                    type: scryfallData?.type_line || '',     // Card type (like "Creature — Human Wizard")
                    rarity: scryfallData?.rarity || ''        // Rarity (Common, Uncommon, Rare, Mythic)
                });
                
                // Wait 100 milliseconds before asking for the next card
                // This is polite to Scryfall's servers - we don't want to overwhelm them!
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            // Step 3: If commander name was provided but we didn't find it in the decklist,
            // try to look it up separately
            if (commanderName.trim() && !commanderData) {
                commanderData = await fetchScryfallCard(commanderName.trim());
            }

            // Step 4: Create a new deck object with all the information
            const newDeck = {
                id: Date.now().toString(),  // Give it a unique ID (current timestamp)
                name: deckName.trim(),       // The deck name you entered
                // Commander information (if we found it)
                commander: commanderData ? {
                    name: commanderName.trim() || parsedCards[0]?.name,
                    imageUrl: commanderData?.image_uris?.normal || commanderData?.card_faces?.[0]?.image_uris?.normal || null
                } : (commanderName.trim() ? {
                    // Commander name provided but image not found
                    name: commanderName.trim(),
                    imageUrl: null
                } : null),
                decklist: decklist,  // All the cards with their images
                // Start with empty statistics
                stats: {
                    wins: 0,
                    losses: 0,
                    mulligans: 0,
                    totalGames: 0
                },
                notes: '',  // No notes yet
                createdAt: new Date().toISOString()  // When this deck was created
            };

            // Step 5: Add the new deck to our list and save everything
            const updatedDecks = [...decks, newDeck];  // Add new deck to existing list
            saveDecks(updatedDecks);
            
            // Step 6: Close the import popup and clear the form
            setShowImportModal(false);
            setDecklistText('');
            setDeckName('');
            setCommanderName('');
            
            // Step 7: Take the user to the new deck's detail page
            navigate(`/deck/${newDeck.id}`);
        } catch (error) {
            // If something went wrong, show an error message
            alert('Failed to import deck. Please check the decklist format and try again.');
            console.error('Import error:', error);
        } finally {
            // Always turn off the "importing" flag, even if something went wrong
            setImporting(false);
        }
    };

    /**
     * DELETE A DECK
     * 
     * This function removes a deck from your collection. It asks for confirmation
     * first so you don't accidentally delete a deck you want to keep.
     * 
     * @param {string} deckId - The unique ID of the deck to delete
     */
    const handleDeleteDeck = (deckId) => {
        // Show a confirmation popup - "Are you sure?"
        if (window.confirm('Are you sure you want to delete this deck?')) {
            // User said yes, so remove this deck from the list
            // filter() creates a new list with only decks that DON'T have this ID
            const updatedDecks = decks.filter(deck => deck.id !== deckId);
            // Save the updated list (without the deleted deck)
            saveDecks(updatedDecks);
        }
        // If user said no, nothing happens and the deck stays
    };

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2em', fontFamily: 'sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2em' }}>
                <h1 style={{ margin: 0 }}>My Commander Decks</h1>
                <button
                    onClick={() => setShowImportModal(true)}
                    style={{
                        padding: '0.75em 1.5em',
                        fontSize: '16px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    + Import Decklist
                </button>
            </div>

            {decks.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '4em',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '8px',
                    color: '#666'
                }}>
                    <p style={{ fontSize: '18px', marginBottom: '1em' }}>No decks yet!</p>
                    <p>Click "Import Decklist" to add your first deck.</p>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '1.5em'
                }}>
                    {decks.map(deck => (
                        <div
                            key={deck.id}
                            onClick={() => navigate(`/deck/${deck.id}`)}
                            style={{
                                backgroundColor: 'white',
                                border: '2px solid #ddd',
                                borderRadius: '8px',
                                padding: '1.5em',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#2196F3';
                                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#ddd';
                                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                            }}
                        >
                            {deck.commander && (
                                <div style={{ textAlign: 'center', marginBottom: '1em' }}>
                                    {deck.commander.imageUrl && (
                                        <img
                                            src={deck.commander.imageUrl}
                                            alt={deck.commander.name}
                                            style={{
                                                width: '100%',
                                                maxWidth: '200px',
                                                borderRadius: '8px',
                                                marginBottom: '0.5em'
                                            }}
                                        />
                                    )}
                                    <div style={{ fontSize: '14px', color: '#666' }}>Commander</div>
                                    <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{deck.commander.name}</div>
                                </div>
                            )}
                            <h3 style={{ marginTop: 0, marginBottom: '0.5em' }}>{deck.name}</h3>
                            <div style={{ fontSize: '14px', color: '#666', marginBottom: '1em' }}>
                                <div>Cards: {deck.decklist?.length || 0}</div>
                                <div>Wins: {deck.stats?.wins || 0} | Losses: {deck.stats?.losses || 0}</div>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteDeck(deck.id);
                                }}
                                style={{
                                    padding: '0.5em 1em',
                                    fontSize: '14px',
                                    backgroundColor: '#f44336',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    width: '100%'
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {showImportModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '2em',
                        borderRadius: '8px',
                        maxWidth: '600px',
                        width: '90%',
                        maxHeight: '90vh',
                        overflow: 'auto'
                    }}>
                        <h2 style={{ marginTop: 0 }}>Import Decklist</h2>
                        <p style={{ color: '#666', marginBottom: '1em', fontSize: '14px' }}>
                            Paste your decklist below. Format: "1 Card Name" or "1x Card Name" (one per line)
                        </p>
                        
                        <div style={{ marginBottom: '1em' }}>
                            <label style={{ display: 'block', marginBottom: '0.5em', fontWeight: 'bold' }}>
                                Deck Name: *
                            </label>
                            <input
                                type="text"
                                value={deckName}
                                onChange={(e) => setDeckName(e.target.value)}
                                placeholder="My Commander Deck"
                                style={{
                                    width: '100%',
                                    padding: '0.75em',
                                    fontSize: '16px',
                                    border: '2px solid #ddd',
                                    borderRadius: '4px',
                                    boxSizing: 'border-box'
                                }}
                                disabled={importing}
                            />
                        </div>

                        <div style={{ marginBottom: '1em' }}>
                            <label style={{ display: 'block', marginBottom: '0.5em', fontWeight: 'bold' }}>
                                Commander Name (optional):
                            </label>
                            <input
                                type="text"
                                value={commanderName}
                                onChange={(e) => setCommanderName(e.target.value)}
                                placeholder="Commander Name"
                                style={{
                                    width: '100%',
                                    padding: '0.75em',
                                    fontSize: '16px',
                                    border: '2px solid #ddd',
                                    borderRadius: '4px',
                                    boxSizing: 'border-box'
                                }}
                                disabled={importing}
                            />
                        </div>

                        <div style={{ marginBottom: '1em' }}>
                            <label style={{ display: 'block', marginBottom: '0.5em', fontWeight: 'bold' }}>
                                Decklist: *
                            </label>
                            <textarea
                                value={decklistText}
                                onChange={(e) => setDecklistText(e.target.value)}
                                placeholder={`1 Sol Ring
1 Arcane Signet
1 Command Tower
...`}
                                style={{
                                    width: '100%',
                                    minHeight: '300px',
                                    padding: '0.75em',
                                    fontSize: '14px',
                                    fontFamily: 'monospace',
                                    border: '2px solid #ddd',
                                    borderRadius: '4px',
                                    boxSizing: 'border-box',
                                    resize: 'vertical'
                                }}
                                disabled={importing}
                            />
                        </div>

                        <div style={{ 
                            backgroundColor: '#f0f0f0', 
                            padding: '1em', 
                            borderRadius: '4px', 
                            marginBottom: '1em',
                            fontSize: '12px',
                            color: '#666'
                        }}>
                            <strong>Tip:</strong> You can paste decklists from Moxfield, TappedOut, or any text format. 
                            The first card will be used as commander if no commander name is specified.
                        </div>

                        <div style={{ display: 'flex', gap: '1em', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => {
                                    setShowImportModal(false);
                                    setDecklistText('');
                                    setDeckName('');
                                    setCommanderName('');
                                }}
                                disabled={importing}
                                style={{
                                    padding: '0.75em 1.5em',
                                    fontSize: '16px',
                                    backgroundColor: '#ccc',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: importing ? 'not-allowed' : 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleImport}
                                disabled={importing || !decklistText.trim() || !deckName.trim()}
                                style={{
                                    padding: '0.75em 1.5em',
                                    fontSize: '16px',
                                    backgroundColor: importing ? '#ccc' : '#4CAF50',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: importing ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {importing ? 'Importing...' : 'Import'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DeckList;
