import { CONFIG } from './config.js';

// Fetch trending content
export async function fetchTrending(mediaType = 'all', timeWindow = 'week') {
    try {
        const url = `${CONFIG.BASE_URL}/trending/${mediaType}/${timeWindow}?api_key=${CONFIG.API_KEY}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error fetching trending:', error);
        return [];
    }
}

// Search for movies or TV shows
export async function searchContent(query, mediaType = 'multi') {
    try {
        const url = `${CONFIG.BASE_URL}/search/${mediaType}?api_key=${CONFIG.API_KEY}&query=${encodeURIComponent(query)}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error searching:', error);
        return [];
    }
}

// Get details for a specific movie or TV show
export async function fetchDetails(id, mediaType) {
    try {
        const url = `${CONFIG.BASE_URL}/${mediaType}/${id}?api_key=${CONFIG.API_KEY}&append_to_response=credits,similar`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching details:', error);
        return null;
    }
}

// Discover content by genre
export async function discoverByGenre(genreId, mediaType = 'movie') {
    try {
        const url = `${CONFIG.BASE_URL}/discover/${mediaType}?api_key=${CONFIG.API_KEY}&with_genres=${genreId}&sort_by=popularity.desc`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error discovering by genre:', error);
        return [];
    }
}

// Get movie/TV genres
export async function fetchGenres(mediaType = 'movie') {
    try {
        const url = `${CONFIG.BASE_URL}/genre/${mediaType}/list?api_key=${CONFIG.API_KEY}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        return data.genres;
    } catch (error) {
        console.error('Error fetching genres:', error);
        return [];
    }
}

// Helper to build image URL
export function getImageUrl(path, size = 'w500') {
    if (!path) return 'https://via.placeholder.com/500x750?text=No+Image';
    return `${CONFIG.IMAGE_BASE_URL}/${size}${path}`;
}