import { db } from './firebase';
import { collection, addDoc, getDocs, doc, updateDoc, query, where, getDoc } from 'firebase/firestore';

const STORAGE_KEY = 'huzur_family_data';

// Check if Firebase is initialized (db might be undefined if keys are missing)
const isFirebaseAvailable = () => !!db;

export const familyService = {
    // --- Profiles ---
    
    async getProfiles() {
        if (isFirebaseAvailable()) {
            try {
                // In a real app, you'd filter by user ID or device ID
                // For now, we'll just fetch from a local collection or simulate
                // Since we don't have auth implemented fully, we might stick to local storage for profiles
                // unless we want to sync them. Let's assume profiles are local-first for now
                // but groups are remote.
                const saved = localStorage.getItem(STORAGE_KEY);
                return saved ? JSON.parse(saved) : { profiles: [], activeProfileId: null };
            } catch (e) {
                console.error("Error fetching profiles:", e);
                return { profiles: [], activeProfileId: null };
            }
        } else {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : { profiles: [], activeProfileId: null };
        }
    },

    async saveProfiles(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        // If we had auth, we would sync this to Firestore users collection
    },

    // --- Groups (Remote) ---

    async createGroup(name, creatorProfile) {
        if (!isFirebaseAvailable()) {
            console.warn("Firebase not available, using mock group");
            return { 
                id: 'mock-group-' + Date.now(), 
                name, 
                code: Math.floor(100000 + Math.random() * 900000).toString(), 
                members: [{ ...creatorProfile, isAdmin: true }],
                pendingMembers: []
            };
        }

        try {
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            const groupRef = await addDoc(collection(db, "groups"), {
                name,
                code,
                createdAt: new Date(),
                members: [{ ...creatorProfile, isAdmin: true }],
                pendingMembers: []
            });
            return { id: groupRef.id, name, code, members: [{ ...creatorProfile, isAdmin: true }], pendingMembers: [] };
        } catch (e) {
            console.error("Error creating group:", e);
            throw e;
        }
    },

    // Request to join - adds to pendingMembers instead of members
    async requestJoinGroup(code, profile) {
        if (!isFirebaseAvailable()) {
            // Mock implementation
            if (code.length === 6) {
                return { 
                    status: 'pending',
                    message: 'Katılım isteğiniz gönderildi. Yönetici onayı bekleniyor.'
                };
            }
            throw new Error("Geçersiz kod");
        }

        try {
            const q = query(collection(db, "groups"), where("code", "==", code));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                throw new Error("Grup bulunamadı");
            }

            const groupDoc = querySnapshot.docs[0];
            const groupData = groupDoc.data();
            
            // Check if already member
            if (groupData.members.some(m => m.id === profile.id)) {
                throw new Error("Zaten bu grubun üyesisiniz");
            }

            // Check if already pending
            const pendingMembers = groupData.pendingMembers || [];
            if (pendingMembers.some(m => m.id === profile.id)) {
                throw new Error("Zaten katılım isteğiniz var");
            }

            // Add to pending members
            const newPendingMembers = [...pendingMembers, { ...profile, requestedAt: new Date() }];
            await updateDoc(doc(db, "groups", groupDoc.id), {
                pendingMembers: newPendingMembers
            });

            return { 
                status: 'pending',
                message: 'Katılım isteğiniz gönderildi. Yönetici onayı bekleniyor.'
            };
        } catch (e) {
            console.error("Error requesting to join group:", e);
            throw e;
        }
    },

    // Approve a pending member (admin only)
    async approveJoinRequest(groupId, pendingProfileId) {
        if (!isFirebaseAvailable()) {
            // Mock implementation
            return { success: true };
        }

        try {
            const docRef = doc(db, "groups", groupId);
            const docSnap = await getDoc(docRef);
            
            if (!docSnap.exists()) {
                throw new Error("Grup bulunamadı");
            }

            const groupData = docSnap.data();
            const pendingMembers = groupData.pendingMembers || [];
            const members = groupData.members || [];

            const approvedMember = pendingMembers.find(m => m.id === pendingProfileId);
            if (!approvedMember) {
                throw new Error("Bekleyen üye bulunamadı");
            }

            // Move from pending to members
            const newPendingMembers = pendingMembers.filter(m => m.id !== pendingProfileId);
            const newMembers = [...members, { ...approvedMember, isAdmin: false }];

            await updateDoc(docRef, {
                members: newMembers,
                pendingMembers: newPendingMembers
            });

            return { success: true, members: newMembers, pendingMembers: newPendingMembers };
        } catch (e) {
            console.error("Error approving join request:", e);
            throw e;
        }
    },

    // Reject a pending member (admin only)
    async rejectJoinRequest(groupId, pendingProfileId) {
        if (!isFirebaseAvailable()) {
            // Mock implementation
            return { success: true };
        }

        try {
            const docRef = doc(db, "groups", groupId);
            const docSnap = await getDoc(docRef);
            
            if (!docSnap.exists()) {
                throw new Error("Grup bulunamadı");
            }

            const groupData = docSnap.data();
            const pendingMembers = groupData.pendingMembers || [];

            // Remove from pending
            const newPendingMembers = pendingMembers.filter(m => m.id !== pendingProfileId);

            await updateDoc(docRef, {
                pendingMembers: newPendingMembers
            });

            return { success: true, pendingMembers: newPendingMembers };
        } catch (e) {
            console.error("Error rejecting join request:", e);
            throw e;
        }
    },

    async getGroup(groupId) {
        if (!isFirebaseAvailable()) return null;
        try {
            const docRef = doc(db, "groups", groupId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
            }
            return null;
        } catch (e) {
            console.error("Error getting group:", e);
            return null;
        }
    }
};
