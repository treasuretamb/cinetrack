// ui.js - Enhanced UI rendering functions
import { getImageUrl } from './api.js';
import { isInWatchlist, isInFavorites, isWatched } from './storage.js';

/**
 * Create a movie/TV card element with enhanced features
 * @param {Object} item - Movie or TV show data
 * @returns {HTMLElement} Card element
 */
export function createCard(item) {
    const card = document.createElement('div');
    card.className = 'content-card';
    card.dataset.id = item.id;
    card.dataset.mediaType = item.media_type || 'movie';
    
    const title = item.title || item.name || 'Unknown Title';
    const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
    const posterPath = item.poster_path || item.posterPath;
    const posterUrl = getImageUrl(posterPath);
    
    const inWatchlist = isInWatchlist(item.id, item.media_type);
    const inFavorites = isInFavorites(item.id, item.media_type);
    const watched = isWatched(item.id, item.media_type);
    
    // Determine rating color
    let ratingClass = '';
    if (item.vote_average >= 7.5) ratingClass = 'rating-high';
    else if (item.vote_average >= 6.0) ratingClass = 'rating-medium';
    else ratingClass = 'rating-low';
    
    card.innerHTML = `
        <div class="card-image">
            <img 
                src="${posterUrl}" 
                alt="${title}" 
                loading="lazy"
                data-poster="${posterPath}"
                onerror="this.src='https://via.placeholder.com/500x750/221F1F/E50914?text=No+Image'"
            >
            ${watched ? '<div class="watched-badge">✓ Watched</div>' : ''}
        </div>
        <div class="card-content">
            <h3 class="card-title" title="${title}">${title}</h3>
            <div class="card-rating ${ratingClass}">
                <span class="star">⭐</span>
                <span>${rating}</span>
            </div>
            <div class="card-actions">
                <button 
                    class="btn-icon ${inWatchlist ? 'active' : ''}" 
                    data-action="watchlist" 
                    title="${inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}"
                    aria-label="${inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}"
                >
                    ${inWatchlist ? '📋' : '📋'}
                </button>
                <button 
                    class="btn-icon ${inFavorites ? 'active' : ''}" 
                    data-action="favorite" 
                    title="${inFavorites ? 'Remove from Favorites' : 'Add to Favorites'}"
                    aria-label="${inFavorites ? 'Remove from Favorites' : 'Add to Favorites'}"
                >
                    ${inFavorites ? '❤️' : '🤍'}
                </button>
                <button 
                    class="btn-primary btn-small" 
                    data-action="details"
                    aria-label="View details for ${title}"
                >
                    Details
                </button>
            </div>
        </div>
    `;
    
    // Add fade-in animation
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    
    requestAnimationFrame(() => {
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
    });
    
    return card;
}

/**
 * Render multiple cards in a grid
 * @param {Array} items - Array of movies/shows
 * @param {HTMLElement} container - Container element
 */
export function renderCards(items, container) {
    if (!container) {
        console.error('Container element not found');
        return;
    }
    
    container.innerHTML = '';
    
    if (!items || items.length === 0) {
        showEmptyState();
        return;
    }
    
    hideEmptyState();
    
    // Add staggered animation delay
    items.forEach((item, index) => {
        const card = createCard(item);
        card.style.animationDelay = `${index * 0.05}s`;
        container.appendChild(card);
    });
}

/**
 * Show loading spinner
 */
export function showLoading() {
    const spinner = document.getElementById('loadingSpinner');
    const grid = document.getElementById('contentGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (spinner) {
        spinner.style.display = 'flex';
        spinner.setAttribute('aria-live', 'polite');
        spinner.setAttribute('aria-busy', 'true');
    }
    if (grid) grid.style.display = 'none';
    if (emptyState) emptyState.style.display = 'none';
}

/**
 * Hide loading spinner
 */
export function hideLoading() {
    const spinner = document.getElementById('loadingSpinner');
    const grid = document.getElementById('contentGrid');
    
    if (spinner) {
        spinner.style.display = 'none';
        spinner.setAttribute('aria-busy', 'false');
    }
    if (grid) grid.style.display = 'grid';
}

/**
 * Show empty state message
 */
export function showEmptyState() {
    const emptyState = document.getElementById('emptyState');
    const grid = document.getElementById('contentGrid');
    
    if (emptyState) {
        emptyState.style.display = 'block';
        emptyState.setAttribute('role', 'status');
        emptyState.setAttribute('aria-live', 'polite');
    }
    if (grid) grid.style.display = 'none';
}

/**
 * Hide empty state message
 */
export function hideEmptyState() {
    const emptyState = document.getElementById('emptyState');
    if (emptyState) {
        emptyState.style.display = 'none';
    }
}

/**
 * Show notification toast
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success, error, warning)
 */
export function showNotification(message, type = 'success') {
    // Remove any existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'assertive');
    
    document.body.appendChild(notification);
    
    // Trigger animation
    requestAnimationFrame(() => {
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
    });
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

/**
 * Create a skeleton card for loading states
 * @returns {HTMLElement} Skeleton card element
 */
export function createSkeletonCard() {
    const card = document.createElement('div');
    card.className = 'content-card skeleton-card';
    card.innerHTML = `
        <div class="card-image skeleton-shimmer"></div>
        <div class="card-content">
            <div class="skeleton-text skeleton-shimmer" style="height: 20px; margin-bottom: 10px;"></div>
            <div class="skeleton-text skeleton-shimmer" style="height: 16px; width: 60%;"></div>
        </div>
    `;
    return card;
}

/**
 * Show skeleton cards while loading
 * @param {HTMLElement} container - Container element
 * @param {number} count - Number of skeleton cards
 */
export function showSkeletonCards(container, count = 20) {
    if (!container) return;
    
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
        container.appendChild(createSkeletonCard());
    }
}

/**
 * Create a simple movie card (for watchlist/favorites pages)
 * @param {Object} item - Movie or TV show data
 * @param {Function} onRemove - Callback for remove action
 * @returns {HTMLElement} Card element
 */
export function createSimpleCard(item, onRemove) {
    const card = document.createElement('div');
    card.className = 'content-card';
    card.dataset.id = item.id;
    card.dataset.mediaType = item.media_type;
    
    const title = item.title || 'Unknown';
    const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
    const posterUrl = getImageUrl(item.poster_path);
    
    card.innerHTML = `
        <div class="card-image">
            <img 
                src="${posterUrl}" 
                alt="${title}" 
                loading="lazy"
                onerror="this.src='https://via.placeholder.com/500x750/221F1F/E50914?text=No+Image'"
            >
        </div>
        <div class="card-content">
            <h3 class="card-title" title="${title}">${title}</h3>
            <div class="card-rating">
                <span class="star">⭐</span>
                <span>${rating}</span>
            </div>
            <div class="card-actions">
                <button 
                    class="btn-icon remove-btn" 
                    title="Remove"
                    aria-label="Remove ${title}"
                >
                    ❌
                </button>
                <button 
                    class="btn-primary btn-small view-details-btn"
                    aria-label="View details for ${title}"
                >
                    Details
                </button>
            </div>
        </div>
    `;
    
    // Add event listeners
    const removeBtn = card.querySelector('.remove-btn');
    const detailsBtn = card.querySelector('.view-details-btn');
    
    if (removeBtn && onRemove) {
        removeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove(item.id, item.media_type, card);
        });
    }
    
    if (detailsBtn) {
        detailsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            window.location.href = `details.html?id=${item.id}&type=${item.media_type}`;
        });
    }
    
    return card;
}

/**
 * Smooth scroll to element
 * @param {string} elementId - ID of element to scroll to
 */
export function scrollToElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

/**
 * Update page title
 * @param {string} title - New page title
 */
export function updatePageTitle(title) {
    document.title = title ? `${title} - CineTrack` : 'CineTrack - Discover Movies & TV Shows';
}

/**
 * Format date to readable string
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export function formatDate(dateString) {
    if (!dateString) return 'Unknown';
    
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options);
}

/**
 * Format runtime to hours and minutes
 * @param {number} minutes - Runtime in minutes
 * @returns {string} Formatted runtime
 */
export function formatRuntime(minutes) {
    if (!minutes) return 'N/A';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
}

/**
 * Add CSS for rating colors
 */
const style = document.createElement('style');
style.textContent = `
    .rating-high { color: #46D369 !important; }
    .rating-medium { color: #FFA500 !important; }
    .rating-low { color: #E50914 !important; }
    
    .skeleton-shimmer {
        background: linear-gradient(90deg, 
            rgba(255,255,255,0.05) 0%, 
            rgba(255,255,255,0.1) 50%, 
            rgba(255,255,255,0.05) 100%
        );
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
    }
    
    @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
    }
    
    .skeleton-text {
        border-radius: 4px;
        margin-bottom: 8px;
    }
`;
document.head.appendChild(style);