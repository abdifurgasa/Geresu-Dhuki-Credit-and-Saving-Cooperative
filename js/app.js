// js/app.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, where, Timestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";
import { initI18n, t } from "./i18n.js";

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export function formatCurrency(amount) {
    return new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB', minimumFractionDigits: 0 }).format(amount || 0);
}
export function formatDate(date) {
    if (!date) return 'N/A';
    if (date.toDate) return date.toDate().toLocaleDateString();
    return new Date(date).toLocaleDateString();
}
export function showAlert(message, type='error') {
    const alertDiv = document.getElementById('globalAlert');
    if(alertDiv){
        alertDiv.textContent = message;
        alertDiv.className = `alert alert-${type}`;
        alertDiv.style.display = 'block';
        setTimeout(() => alertDiv.style.display = 'none', 3000);
    } else { alert(message); }
}

export function initLayout() {
    initI18n();
    const sidebar = document.querySelector('.sidebar');
    const header = document.querySelector('.header');
    if(sidebar && sidebar.innerHTML.trim()===''){
        sidebar.innerHTML = `
            <div class="logo"><i class="fas fa-piggy-bank"></i><div><h2>SACCO</h2><p>Banking System</p></div></div>
            <ul class="nav-menu">
                <li class="nav-item"><a href="dashboard.html"><i class="fas fa-chart-line"></i><span data-i18n="nav.dashboard">Dashboard</span></a></li>
                <li class="nav-item"><a href="members.html"><i class="fas fa-users"></i><span data-i18n="nav.members">Members</span></a></li>
                <li class="nav-item"><a href="savings.html"><i class="fas fa-coins"></i><span data-i18n="nav.savings">Savings</span></a></li>
                <li class="nav-item"><a href="loans.html"><i class="fas fa-hand-holding-usd"></i><span data-i18n="nav.loans">Loans</span></a></li>
                <li class="nav-item"><a href="repayments.html"><i class="fas fa-undo-alt"></i><span data-i18n="nav.repayments">Repayments</span></a></li>
                <li class="nav-item"><a href="withdrawals.html"><i class="fas fa-money-bill-wave"></i><span data-i18n="nav.withdrawals">Withdrawals</span></a></li>
                <li class="nav-item"><a href="reports.html"><i class="fas fa-file-alt"></i><span data-i18n="nav.reports">Reports</span></a></li>
                <li class="nav-item"><a href="users.html"><i class="fas fa-user-cog"></i><span data-i18n="nav.users">Users</span></a></li>
                <li class="nav-item"><a href="settings.html"><i class="fas fa-cog"></i><span data-i18n="nav.settings">Settings</span></a></li>
            </ul>
            <div class="sidebar-footer"><button id="logoutBtn" class="logout-btn"><i class="fas fa-sign-out-alt"></i><span data-i18n="common.logout">Logout</span></button></div>
        `;
    }
    if(header && header.innerHTML.trim()===''){
        header.innerHTML = `
            <div class="header-left"><button id="sidebarToggle" class="toggle-btn"><i class="fas fa-bars"></i></button><h1 data-i18n="dashboard.title">Dashboard</h1></div>
            <div class="header-right"><select id="languageSwitcher" class="language-selector"><option value="en">English</option><option value="om">Afaan Oromo</option><option value="am">አማርኛ</option></select>
            <div class="user-info"><i class="fas fa-bell"></i><div class="user-avatar" id="userAvatar">A</div><span id="userName">Welcome</span></div></div>
        `;
    }
    // Toggle sidebar
    document.getElementById('sidebarToggle')?.addEventListener('click',()=>{
        document.querySelector('.sidebar').classList.toggle('collapsed');
        document.querySelector('.main-content').classList.toggle('expanded');
    });
    // Logout
    document.getElementById('logoutBtn')?.addEventListener('click',async()=>{
        await signOut(auth);
        window.location.href='login.html';
    });
    // Auth state
    onAuthStateChanged(auth, (user)=>{
        if(!user && !window.location.pathname.includes('login.html')) window.location.href='login.html';
        else if(user && document.getElementById('userName')){
            document.getElementById('userName').innerHTML = `${t('auth.welcome')}, ${user.email.split('@')[0]}`;
            document.getElementById('userAvatar').textContent = user.email[0].toUpperCase();
        }
    });
}
