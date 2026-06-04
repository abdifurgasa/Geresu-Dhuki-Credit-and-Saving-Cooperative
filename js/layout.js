// js/layout.js
import { auth, signOut, onAuthStateChanged, db, doc, getDoc } from './firebase.js';
import { t, getCurrentLanguage, initI18n, setLanguage } from './i18n.js';

// Get sidebar HTML
export function getSidebarHTML() {
    return `
        <div class="logo">
            <img src="assets/logo.png" alt="SACCO Logo" class="logo-img" onerror="this.style.display='none'">
            <h2><i class="fas fa-piggy-bank"></i> <span>SACCO</span></h2>
            <p>Banking System</p>
        </div>
        <ul class="nav-menu">
            <li class="nav-item" data-page="dashboard">
                <a href="dashboard.html">
                    <i class="fas fa-chart-line"></i>
                    <span>Dashboard</span>
                </a>
            </li>
            <li class="nav-item" data-page="members">
                <a href="members.html">
                    <i class="fas fa-users"></i>
                    <span>Members</span>
                </a>
            </li>
            <li class="nav-item" data-page="savings">
                <a href="savings.html">
                    <i class="fas fa-coins"></i>
                    <span>Savings</span>
                </a>
            </li>
            <li class="nav-item" data-page="loans">
                <a href="loans.html">
                    <i class="fas fa-hand-holding-usd"></i>
                    <span>Loans</span>
                </a>
            </li>
            <li class="nav-item" data-page="repayments">
                <a href="repayments.html">
                    <i class="fas fa-undo-alt"></i>
                    <span>Repayments</span>
                </a>
            </li>
            <li class="nav-item" data-page="withdrawals">
                <a href="withdrawals.html">
                    <i class="fas fa-money-bill-wave"></i>
                    <span>Withdrawals</span>
                </a>
            </li>
            <li class="nav-item" data-page="reports">
                <a href="reports.html">
                    <i class="fas fa-file-alt"></i>
                    <span>Reports</span>
                </a>
            </li>
            <li class="nav-item" data-page="users">
                <a href="users.html">
                    <i class="fas fa-user-cog"></i>
                    <span>Users</span>
                </a>
            </li>
            <li class="nav-item" data-page="settings">
                <a href="settings.html">
                    <i class="fas fa-cog"></i>
                    <span>Settings</span>
                </a>
            </li>
        </ul>
        <div class="sidebar-footer">
            <button id="logoutBtn" class="logout-btn">
                <i class="fas fa-sign-out-alt"></i>
                <span>Logout</span>
            </button>
        </div>
    `;
}

// Get header HTML
export function getHeaderHTML() {
    const currentPage = getCurrentPageName();
    return `
        <div class="header-left">
            <button id="sidebarToggle" class="toggle-btn">
                <i class="fas fa-bars"></i>
            </button>
            <h1 id="pageTitle">${getPageTitle(currentPage)}</h1>
        </div>
        <div class="header-right">
            <select id="languageSwitcher" class="language-selector">
                <option value="en">English</option>
                <option value="om">Afaan Oromo</option>
                <option value="am">አማርኛ</option>
            </select>
            <div class="user-info">
                <i class="fas fa-bell"></i>
                <div class="user-avatar" id="userAvatar">A</div>
                <div class="user-details">
                    <span id="userName">Welcome, Admin</span>
                    <small id="userRole">Admin</small>
                </div>
            </div>
        </div>
    `;
}

function getCurrentPageName() {
    const path = window.location.pathname.split('/').pop();
    if (path === 'dashboard.html' || path === '' || path === 'index.html') return 'dashboard';
    return path.replace('.html', '');
}

function getPageTitle(page) {
    const titles = {
        dashboard: 'Dashboard',
        members: 'Member Management',
        savings: 'Savings Management',
        loans: 'Loan Management',
        repayments: 'Repayment Management',
        withdrawals: 'Withdrawal Management',
        reports: 'Financial Reports',
        users: 'User Management',
        settings: 'System Settings'
    };
    return titles[page] || 'SACCO Banking';
}

// Initialize sidebar toggle
export function initSidebarToggle() {
    const toggleBtn = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (toggleBtn && sidebar && mainContent) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('expanded');
            localStorage.setItem('sidebar_collapsed', sidebar.classList.contains('collapsed'));
        });
        
        const isCollapsed = localStorage.getItem('sidebar_collapsed') === 'true';
        if (isCollapsed) {
            sidebar.classList.add('collapsed');
            mainContent.classList.add('expanded');
        }
    }
}

// Set active menu item
export function setActiveMenuItem() {
    const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
    const menuItems = document.querySelectorAll('.nav-item');
    
    menuItems.forEach(item => {
        const link = item.querySelector('a');
        if (link) {
            const href = link.getAttribute('href');
            if (href === currentPage) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        }
    });
}

// Logout function
export async function logout() {
    const confirmed = confirm('Are you sure you want to logout?');
    if (confirmed) {
        try {
            await signOut(auth);
            localStorage.removeItem('sacco_user');
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Logout error:', error);
            alert('Error logging out: ' + error.message);
        }
    }
}

// Load user info
async function loadUserInfo(user) {
    const userNameSpan = document.getElementById('userName');
    const userAvatar = document.getElementById('userAvatar');
    const userRoleSpan = document.getElementById('userRole');
    
    if (userNameSpan) {
        const displayName = user.displayName || user.email.split('@')[0];
        userNameSpan.textContent = `Welcome, ${displayName}`;
    }
    
    if (userAvatar) {
        const initial = (user.displayName || user.email || 'A')[0].toUpperCase();
        userAvatar.textContent = initial;
    }
    
    // Try to get user role from Firestore
    try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userRoleSpan) {
            const userData = userDoc.data();
            userRoleSpan.textContent = userData.role || 'User';
        } else if (userRoleSpan) {
            userRoleSpan.textContent = 'Admin';
        }
    } catch (error) {
        console.error("Error loading user role:", error);
    }
}

// Initialize auth protection
export function initAuthProtection() {
    const publicPages = ['login.html', 'index.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (!publicPages.includes(currentPage)) {
        onAuthStateChanged(auth, async (user) => {
            if (!user) {
                window.location.href = 'login.html';
                return;
            }
            localStorage.setItem('sacco_user', JSON.stringify({
                uid: user.uid,
                email: user.email,
                name: user.displayName
            }));
            await loadUserInfo(user);
        });
    }
    
    if (currentPage === 'login.html' || currentPage === 'index.html') {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                window.location.href = 'dashboard.html';
            }
        });
    }
}

// Initialize language switcher
export function initLanguageSwitcher() {
    const switcher = document.getElementById('languageSwitcher');
    if (switcher) {
        const savedLang = localStorage.getItem('sacco_language') || 'en';
        switcher.value = savedLang;
        
        switcher.addEventListener('change', (e) => {
            const newLang = e.target.value;
            setLanguage(newLang);
            // Reload page to apply translations
            window.location.reload();
        });
    }
}

// Main layout initialization
export function initLayout() {
    // Inject sidebar if container exists
    const sidebarContainer = document.querySelector('.sidebar');
    if (sidebarContainer && sidebarContainer.innerHTML.trim() === '') {
        sidebarContainer.innerHTML = getSidebarHTML();
    }
    
    // Inject header if container exists
    const headerContainer = document.querySelector('.header');
    if (headerContainer && headerContainer.innerHTML.trim() === '') {
        headerContainer.innerHTML = getHeaderHTML();
    }
    
    // Initialize all components
    initSidebarToggle();
    setActiveMenuItem();
    initAuthProtection();
    initLanguageSwitcher();
    
    // Setup logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
}
