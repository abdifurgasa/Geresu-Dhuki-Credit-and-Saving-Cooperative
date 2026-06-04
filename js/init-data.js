// js/init-data.js
import { db, collection, addDoc, Timestamp } from './firebase.js';

// Run this once to populate initial data
export async function initializeData() {
    try {
        // Add sample members
        const members = [
            { fullName: "Abebe Kebede", email: "abebe@sacco.com", phone: "0912345678", nid: "12345678", savingsBalance: 50000, active: true, joinDate: Timestamp.now() },
            { fullName: "Tigist Demeke", email: "tigist@sacco.com", phone: "0923456789", nid: "87654321", savingsBalance: 75000, active: true, joinDate: Timestamp.now() },
            { fullName: "Getachew Assefa", email: "getachew@sacco.com", phone: "0934567890", nid: "45678901", savingsBalance: 30000, active: true, joinDate: Timestamp.now() }
        ];
        
        for (const member of members) {
            await addDoc(collection(db, "members"), member);
            console.log("Added member:", member.fullName);
        }
        
        console.log("Initial data loaded successfully!");
    } catch (error) {
        console.error("Error initializing data:", error);
    }
}
