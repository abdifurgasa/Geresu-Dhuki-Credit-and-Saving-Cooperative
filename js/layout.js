// js/layout.js
import { auth, signOut, onAuthStateChanged, db, doc, getDoc } from './firebase.js';
import { t, getCurrentLanguage, initI18n } from './i18n.js';

// Sidebar Toggle
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
        
        // Restore sidebar state
        const isCollapsed = localStorage.getItem('sidebar_collapsed') === 'true';
        if (isCollapsed) {
            sidebar.classList.add('collapsed');
            mainContent.classList.add('expanded');
        }
    }
}

// Active Menu Highlight
export function initActiveMenu() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const menuItems = document.querySelectorAll('.nav-item a');
    
    menuItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href === currentPath) {
            item.parentElement.classList.add('active');
        } else if (currentPath === 'index.html' && href === 'dashboard.html') {
            item.parentElement.classList.add('active');
        }
    });
}

// Logout Function
export async function logout() {
    const confirmed = confirm(t('common.confirm') + ' ' + t('auth.logout') + '?');
    if (confirmed) {
        try {
            await signOut(auth);
            localStorage.removeItem('sacco_user');
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Logout error:', error);
            alert(t('common.error') + ': ' + error.message);
        }
    }
}

// Auth Protection
export function initAuthProtection() {
    const protectedPages = ['dashboard.html', 'members.html', 'savings.html', 'loans.html', 
                           'repayments.html', 'withdrawals.html', 'reports.html', 'users.html', 'settings.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage)) {
        onAuthStateChanged(auth, async (user) => {
            if (!user) {
                window.location.href = 'login.html';
                return;
            }
            
            // Store user info
            localStorage.setItem('sacco_user', JSON.stringify({
                uid: user.uid,
                email: user.email,
                name: user.displayName
            }));
            
            // Load user info into UI
            await loadUserInfo(user);
            
            // Check user role for permissions
            await checkUserPermissions(user.uid);
        });
    }
    
    // If on login page and already logged in, redirect to dashboard
    if (currentPage === 'login.html') {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                window.location.href = 'dashboard.html';
            }
        });
    }
}

// Load User Info
async function loadUserInfo(user) {
    const userNameElement = document.getElementById('userName');
    const userAvatar = document.getElementById('userAvatar');
    const userEmailElement = document.getElementById('userEmail');
    
    if (userNameElement) {
        userNameElement.textContent = `${t('auth.welcome')}, ${user.displayName || user.email.split('@')[0]}`;
    }
    
    if (userEmailElement) {
        userEmailElement.textContent = user.email;
    }
    
    if (userAvatar) {
        userAvatar.textContent = (user.displayName || user.email)[0].toUpperCase();
    }
    
    // Load user role from Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
        const userData = userDoc.data();
        const userRoleElement = document.getElementById('userRole');
        if (userRoleElement) {
            userRoleElement.textContent = userData.role || 'user';
        }
    }
}

// Check User Permissions
async function checkUserPermissions(uid) {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
        const userData = userDoc.data();
        const role = userData.role;
        
        // Hide/show elements based on role
        if (role === 'viewer') {
            // Hide edit/delete buttons
            document.querySelectorAll('.btn-edit, .btn-danger, .btn-primary').forEach(btn => {
                if (!btn.classList.contains('viewer-allowed')) {
                    btn.style.display = 'none';
                }
            });
        }
    }
}

// Initialize Layout
export function initLayout() {
    initSidebarToggle();
    initActiveMenu();
    initAuthProtection();
    initI18n();
    
    // Setup logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
}

// Create Sidebar HTML (to be included in all pages)
export function createSidebarHTML() {
    return `
        <div class="logo">
            <img src="assets/logo.png" alt="SACCO Logo" class="logo-img">
            <h2><i class="fas fa-piggy-bank"></i> <span data-i18n="nav.dashboard">SACCO</span></h2>
            <p>Banking System</p>
        </div>
        <ul class="nav-menu">
            <li class="nav-item"><a href="dashboard.html"><i class="fas fa-chart-line"></i> <span data-i18n="nav.dashboard">Dashboard</span></a></li>
            <li class="nav-item"><a href="members.html"><i class="fas fa-users"></i> <span data-i18n="nav.members">Members</span></a></li>
            <li class="nav-item"><a href="savings.html"><i class="fas fa-coins"></i> <span data-i18n="nav.savings">Savings</span></a></li>
            <li class="nav-item"><a href="loans.html"><i class="fas fa-hand-holding-usd"></i> <span data-i18n="nav.loans">Loans</span></a></li>
            <li class="nav-item"><a href="repayments.html"><i class="fas fa-undo-alt"></i> <span data-i18n="nav.repayments">Repayments</span></a></li>
            <li class="nav-item"><a href="withdrawals.html"><i class="fas fa-money-bill-wave"></i> <span data-i18n="nav.withdrawals">Withdrawals</span></a></li>
            <li class="nav-item"><a href="reports.html"><i class="fas fa-file-alt"></i> <span data-i18n="nav.reports">Reports</span></a></li>
            <li class="nav-item"><a href="users.html"><i class="fas fa-user-cog"></i> <span data-i18n="nav.users">Users</span></a></li>
            <li class="nav-item"><a href="settings.html"><i class="fas fa-cog"></i> <span data-i18n="nav.settings">Settings</span></a></li>
        </ul>
        <div class="sidebar-footer">
            <button id="logoutBtn" class="logout-btn">
                <i class="fas fa-sign-out-alt"></i> <span data-i18n="auth.logout">Logout</span>
            </button>
        </div>
    `;
}

// Create Header HTML
export function createHeaderHTML() {
    return `
        <div class="header">
            <div class="header-left">
                <button id="sidebarToggle" class="toggle-btn">
                    <i class="fas fa-bars"></i>
                </button>
                <h1 data-i18n="dashboard.title">Financial Dashboard</h1>
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
        </div>
    `;
}
