// RideCo Main JavaScript File

// Sample data for demonstration
// Use backend API instead of sample rides
const API_URL = "http://localhost:4000/api/rides";
let rides = []; // will be fetched from backend

// Fetch rides from backend
async function fetchRides() {
  const response = await fetch(API_URL);
  rides = await response.json();
  populateRideFeed();
}


// Global variables
let currentFilter = 'all';
let activeNav = 'home';
let particleSystem;

// Initialize the application
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        initializeApp();
    });
}

function initializeApp() {
    // Initialize typewriter effect
    initTypewriter();
    
    // Initialize text splitting animations
    initTextSplitting();
    
    // Initialize particle system
    initParticles();
    
    // Populate ride feed
    populateRideFeed();
    
    // Initialize animations
    initAnimations();
    
    // Setup event listeners
    setupEventListeners();
}

function initTypewriter() {
    const typed = new Typed('#typed-text', {
        strings: [
            'RideCo',
            'Your Community Ride',
            'Safe Motorcycle Rides',
            'Iloilo\'s Trusted Ride'
        ],
        typeSpeed: 80,
        backSpeed: 50,
        backDelay: 2000,
        loop: true,
        showCursor: true,
        cursorChar: '|'
    });
}

function initTextSplitting() {
    Splitting({
        target: '[data-splitting]',
        by: 'chars'
    });

    // Animate split text
    anime({
        targets: '[data-splitting] .char',
        translateY: [100, 0],
        opacity: [0, 1],
        easing: 'easeOutExpo',
        duration: 1400,
        delay: anime.stagger(30)
    });
}

function initParticles() {
    // P5.js particle system for hero background
    new p5(function(p) {
        let particles = [];
        
        p.setup = function() {
            const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
            canvas.parent('particles-canvas');
            
            // Create particles
            for (let i = 0; i < 50; i++) {
                particles.push({
                    x: p.random(p.width),
                    y: p.random(p.height),
                    vx: p.random(-0.5, 0.5),
                    vy: p.random(-0.5, 0.5),
                    size: p.random(2, 6),
                    alpha: p.random(0.1, 0.3)
                });
            }
        };
        
        p.draw = function() {
            p.clear();
            
            // Update and draw particles
            particles.forEach(particle => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                
                // Wrap around edges
                if (particle.x < 0) particle.x = p.width;
                if (particle.x > p.width) particle.x = 0;
                if (particle.y < 0) particle.y = p.height;
                if (particle.y > p.height) particle.y = 0;
                
                // Draw particle
                p.fill(0, 168, 107, particle.alpha * 255);
                p.noStroke();
                p.ellipse(particle.x, particle.y, particle.size);
            });
        };
        
        p.windowResized = function() {
            p.resizeCanvas(p.windowWidth, p.windowHeight);
        };
    });
}

function populateRideFeed() {
    const rideList = document.getElementById('ride-list');
    if (!rideList) return;
    
    rideList.innerHTML = '';
    
    const filteredRides = getFilteredRides(rides, currentFilter);
    
    filteredRides.forEach((ride, index) => {
        const rideCard = createRideCard(ride);
        rideList.appendChild(rideCard);
        
        // Animate card entrance
        anime({
            targets: rideCard,
            translateY: [50, 0],
            opacity: [0, 1],
            easing: 'easeOutExpo',
            duration: 800,
            delay: index * 100
        });
    });
}

function getFilteredRides(rides, filter) {
    switch (filter) {
        case 'nearby':
            return rides.filter(ride => parseFloat(ride.distance) <= 3.0);
        case 'recent':
            return rides.slice(0, 4);
        default:
            return rides;
    }
}

function createRideCard(ride) {
    const card = document.createElement('div');
    card.className = 'ride-card p-6 rounded-2xl shadow-lg border border-gray-100 card-hover cursor-pointer';
    card.onclick = () => selectRide(ride);
    
    card.innerHTML = `
        <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
                    ${ride.avatar}
                </div>
                <div>
                    <h3 class="font-semibold text-gray-900">${ride.passenger}</h3>
                    <p class="text-sm text-gray-500">${ride.time}</p>
                </div>
            </div>
            <div class="text-right">
                <div class="text-lg font-bold accent-green">₱${ride.fare}</div>
                <div class="text-sm text-gray-500">${ride.distance}</div>
            </div>
        </div>
        
        <div class="space-y-3">
            <div class="flex items-center gap-3">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <span class="text-gray-700">${ride.pickup}</span>
            </div>
            <div class="flex items-center gap-3">
                <div class="w-2 h-2 bg-red-500 rounded-full"></div>
                <span class="text-gray-700">${ride.destination}</span>
            </div>
        </div>
        
        <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span class="text-sm text-gray-500">ETA: ${ride.eta}</span>
            </div>
            <button onclick="event.stopPropagation(); offerRide(${ride.id})" 
                    class="bg-accent-green text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-green-600 transition-colors">
                Offer Ride
            </button>
        </div>
    `;
    
    return card;
}

function filterRides(filter) {
    currentFilter = filter;
    
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active', 'bg-accent-green', 'text-white');
        btn.classList.add('text-gray-600');
    });
    
    event.target.classList.add('active', 'bg-accent-green', 'text-white');
    event.target.classList.remove('text-gray-600');
    
    // Repopulate feed with filter
    populateRideFeed();
}

function selectRide(ride) {
    // Animate selection
    anime({
        targets: event.currentTarget,
        scale: [1, 0.98, 1],
        duration: 200,
        easing: 'easeInOutQuad'
    });
    
    // Show ride details (placeholder)
    showNotification(`Selected ride from ${ride.pickup} to ${ride.destination}`, 'info');
}

function offerRide(rideId) {
    const ride = rides.find(r => r.id === rideId);
    if (ride) {
        showNotification(`Offer sent to ${ride.passenger}!`, 'success');
        
        // Animate button
        const button = event.target;
        button.innerHTML = 'Offer Sent!';
        button.classList.remove('bg-accent-green');
        button.classList.add('bg-gray-400');
        button.disabled = true;
    }
}

function setActiveNav(nav) {
    activeNav = nav;
    
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active', 'text-accent-green');
        item.classList.add('text-gray-500');
    });
    
    event.currentTarget.classList.add('active', 'text-accent-green');
    event.currentTarget.classList.remove('text-gray-500');
    
    // Handle navigation
    switch (nav) {
        case 'post':
            window.location.href = 'post-ride.html';
            break;
        case 'rides':
            window.location.href = 'ride-track.html';
            break;
        case 'profile':
            window.location.href = 'profile.html';
            break;
    }
}

function showPostRide() {
    // Animate button click
    anime({
        targets: event.currentTarget,
        scale: [1, 0.95, 1],
        duration: 200,
        complete: () => {
            window.location.href = 'post-ride.html';
        }
    });
}

function scrollToFeed() {
    const feedSection = document.getElementById('ride-feed');
    if (feedSection) {
        feedSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

function showCommunity() {
    showNotification('Community features coming soon!', 'info');
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transform translate-x-full transition-transform duration-300`;
    
    switch (type) {
        case 'success':
            notification.classList.add('bg-green-500', 'text-white');
            break;
        case 'error':
            notification.classList.add('bg-red-500', 'text-white');
            break;
        default:
            notification.classList.add('bg-blue-500', 'text-white');
    }
    
    notification.innerHTML = `
        <div class="flex items-center gap-3">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-auto text-white hover:text-gray-200">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

function initAnimations() {
    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                
                if (element.classList.contains('card-hover')) {
                    anime({
                        targets: element,
                        translateY: [50, 0],
                        opacity: [0, 1],
                        easing: 'easeOutExpo',
                        duration: 800
                    });
                }
            }
        });
    }, observerOptions);
    
    // Observe all cards
    document.querySelectorAll('.card-hover').forEach(card => {
        observer.observe(card);
    });
}

function setupEventListeners() {
    // Add smooth scrolling to all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add hover effects to buttons
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('mouseenter', function() {
            if (!this.classList.contains('nav-item') && !this.classList.contains('filter-btn')) {
                anime({
                    targets: this,
                    scale: 1.05,
                    duration: 200,
                    easing: 'easeOutQuad'
                });
            }
        });
        
        button.addEventListener('mouseleave', function() {
            if (!this.classList.contains('nav-item') && !this.classList.contains('filter-btn')) {
                anime({
                    targets: this,
                    scale: 1,
                    duration: 200,
                    easing: 'easeOutQuad'
                });
            }
        });
    });
}

// Utility functions
function formatTime(minutes) {
    if (minutes < 60) {
        return `${minutes} min`;
    } else {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    }
}

function formatDistance(km) {
    if (km < 1) {
        return `${Math.round(km * 1000)}m`;
    } else {
        return `${km.toFixed(1)} km`;
    }
}

function calculateETA(distance, averageSpeed = 25) {
    // Average motorcycle speed in km/h
    const timeInHours = distance / averageSpeed;
    const timeInMinutes = timeInHours * 60;
    return Math.round(timeInMinutes);
}

// Export functions for global access
if (typeof window !== 'undefined') {
    window.filterRides = filterRides;
    window.selectRide = selectRide;
    window.offerRide = offerRide;
    window.setActiveNav = setActiveNav;
    window.showPostRide = showPostRide;
    window.scrollToFeed = scrollToFeed;
    window.showCommunity = showCommunity;
}

// Load rides from backend into the homepage feed
if (typeof document !== 'undefined') {
    document.addEventListener("DOMContentLoaded", () => {
        const rideList = document.getElementById("ride-list");
        if (rideList) {
            loadRides();
        }
    });
}

async function fetchRidesData() {
    const res = await fetch(API_URL);
    if (!res.ok) {
        throw new Error('Failed to fetch rides');
    }
    return await res.json();
}

async function loadRides() {
    const rideList = document.getElementById("ride-list");
    rideList.innerHTML = "<p class='text-gray-500'>Loading rides...</p>";

    try {
        const ridesData = await fetchRidesData();

        if (ridesData.length === 0) {
            rideList.innerHTML = "<p class='text-gray-500'>No rides posted yet. Be the first!</p>";
            return;
        }

        rideList.innerHTML = "";
        ridesData.forEach((ride, index) => {
            // Reformat backend ride to fit card style
            const rideObj = {
                id: ride.id || Date.now(),
                passenger: ride.passenger || "Anonymous",
                pickup: ride.pickup,
                destination: ride.destination,
                fare: ride.fare,
                time: "Just now",
                distance: ride.distance || "N/A",
                eta: ride.departureTime === "now" ? "Now" : "Scheduled",
                status: "active",
                avatar: "👤"
            };

            const rideCard = createRideCard(rideObj);
            rideList.appendChild(rideCard);

            // Animate cards in
            anime({
                targets: rideCard,
                translateY: [50, 0],
                opacity: [0, 1],
                easing: "easeOutExpo",
                duration: 800,
                delay: index * 100
            });
        });
    } catch (err) {
        console.error(err);
        rideList.innerHTML = "<p class='text-red-500'>Error loading rides. Is the server running?</p>";
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatTime,
        formatDistance,
        calculateETA,
        getFilteredRides,
        createRideCard,
        fetchRidesData,
    };
}
