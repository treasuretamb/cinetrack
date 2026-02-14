// Storage keys
const KEYS = {
    WATCHLIST: 'cinetrack_watchlist',
    FAVORITES: 'cinetrack_favorites',
    WATCHED: 'cinetrack_watched'
};

// Helper to check localStorage availability
function isStorageAvailable() {
    try {
        const test = '__storage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
}

// Get items from storage
function getItems(key) {
    if (!isStorageAvailable()) return [];
    
    try {
        const items = localStorage.getItem(key);
        return items ? JSON.parse(items) : [];
    } catch (error) {
        console.error('Error reading from storage:', error);
        return [];
    }
}

// Save items to storage
function saveItems(key, items) {
    if (!isStorageAvailable()) {
        console.warn('localStorage not available');
        return false;
    }
    
    try {
        localStorage.setItem(key, JSON.stringify(items));
        return true;
    } catch (error) {
        console.error('Error saving to storage:', error);
        return false;
    }
}

// Watchlist functions
export function getWatchlist() {
    return getItems(KEYS.WATCHLIST);
}

export function addToWatchlist(item) {
    const watchlist = getWatchlist();
    
    // Check if already in watchlist
    if (watchlist.find(i => i.id === item.id && i.media_type === item.media_type)) {
        return false;
    }
    
    watchlist.push({
        id: item.id,
        title: item.title || item.name,
        poster_path: item.poster_path,
        media_type: item.media_type,
        vote_average: item.vote_average,
        added_date: new Date().toISOString()
    });
    
    return saveItems(KEYS.WATCHLIST, watchlist);
}

export function removeFromWatchlist(id, mediaType) {
    const watchlist = getWatchlist();
    const filtered = watchlist.filter(item => !(item.id === id && item.media_type === mediaType));
    return saveItems(KEYS.WATCHLIST, filtered);
}

export function isInWatchlist(id, mediaType) {
    const watchlist = getWatchlist();
    return watchlist.some(item => item.id === id && item.media_type === mediaType);
}

// Favorites functions
export function getFavorites() {
    return getItems(KEYS.FAVORITES);
}

export function addToFavorites(item) {
    const favorites = getFavorites();
    
    if (favorites.find(i => i.id === item.id && i.media_type === item.media_type)) {
        return false;
    }
    
    favorites.push({
        id: item.id,
        title: item.title || item.name,
        poster_path: item.poster_path,
        media_type: item.media_type,
        vote_average: item.vote_average,
        added_date: new Date().toISOString()
    });
    
    return saveItems(KEYS.FAVORITES, favorites);
}

export function removeFromFavorites(id, mediaType) {
    const favorites = getFavorites();
    const filtered = favorites.filter(item => !(item.id === id && item.media_type === mediaType));
    return saveItems(KEYS.FAVORITES, filtered);
}

export function isInFavorites(id, mediaType) {
    const favorites = getFavorites();
    return favorites.some(item => item.id === id && item.media_type === mediaType);
}

// Watched functions
export function getWatched() {
    return getItems(KEYS.WATCHED);
}

export function addToWatched(item) {
    const watched = getWatched();
    
    if (watched.find(i => i.id === item.id && i.media_type === item.media_type)) {
        return false;
    }
    
    watched.push({
        id: item.id,
        title: item.title || item.name,
        media_type: item.media_type,
        watched_date: new Date().toISOString()
    });
    
    return saveItems(KEYS.WATCHED, watched);
}

export function isWatched(id, mediaType) {
    const watched = getWatched();
    return watched.some(item => item.id === id && item.media_type === mediaType);
}