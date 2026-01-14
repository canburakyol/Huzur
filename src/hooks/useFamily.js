import { useState, useEffect } from 'react';
import { familyService } from '../services/familyService';

const INITIAL_STATE = {
    profiles: [], // { id, name, avatar, points, badges: [], role: 'parent'|'child' }
    activeProfileId: null,
    currentGroup: null
};

export const useFamily = () => {
    const [state, setState] = useState(INITIAL_STATE);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await familyService.getProfiles();
                setState(prev => ({ ...prev, ...data }));
            } catch (error) {
                console.error("Failed to load family data", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const saveState = (newState) => {
        setState(newState);
        familyService.saveProfiles({
            profiles: newState.profiles,
            activeProfileId: newState.activeProfileId,
            currentGroup: newState.currentGroup
        });
    };

    const addProfile = (name, role = 'child', avatar = '👤') => {
        const newProfile = {
            id: Date.now().toString(),
            name,
            role,
            avatar,
            points: 0,
            badges: [],
            streak: 0,
            lastActivity: null
        };
        
        const newState = {
            ...state,
            profiles: [...state.profiles, newProfile],
            activeProfileId: state.activeProfileId || newProfile.id
        };
        saveState(newState);
        return newProfile;
    };

    const switchProfile = (profileId) => {
        saveState({ ...state, activeProfileId: profileId });
    };

    const addPoints = (amount) => {
        if (!state.activeProfileId) return;

        const updatedProfiles = state.profiles.map(p => {
            if (p.id === state.activeProfileId) {
                return { ...p, points: p.points + amount };
            }
            return p;
        });

        saveState({ ...state, profiles: updatedProfiles });
    };

    const activeProfile = state.profiles.find(p => p.id === state.activeProfileId);

    const createGroup = async (name) => {
        if (!activeProfile) return;
        try {
            const group = await familyService.createGroup(name, activeProfile);
            saveState({ ...state, currentGroup: group });
            return group;
        } catch (error) {
            console.error("Create group error:", error);
            throw error;
        }
    };

    const requestJoinGroup = async (code) => {
        if (!activeProfile) return;
        try {
            const result = await familyService.requestJoinGroup(code, activeProfile);
            return result;
        } catch (error) {
            console.error("Request join group error:", error);
            throw error;
        }
    };

    const approveJoinRequest = async (pendingProfileId) => {
        if (!state.currentGroup) return;
        try {
            const result = await familyService.approveJoinRequest(state.currentGroup.id, pendingProfileId);
            if (result.success) {
                // Update local state with new members and pending
                const updatedGroup = {
                    ...state.currentGroup,
                    members: result.members || state.currentGroup.members,
                    pendingMembers: result.pendingMembers || []
                };
                saveState({ ...state, currentGroup: updatedGroup });
            }
            return result;
        } catch (error) {
            console.error("Approve request error:", error);
            throw error;
        }
    };

    const rejectJoinRequest = async (pendingProfileId) => {
        if (!state.currentGroup) return;
        try {
            const result = await familyService.rejectJoinRequest(state.currentGroup.id, pendingProfileId);
            if (result.success) {
                // Update local state
                const updatedGroup = {
                    ...state.currentGroup,
                    pendingMembers: result.pendingMembers || []
                };
                saveState({ ...state, currentGroup: updatedGroup });
            }
            return result;
        } catch (error) {
            console.error("Reject request error:", error);
            throw error;
        }
    };

    // Check if current profile is admin of the group
    const isGroupAdmin = state.currentGroup?.members?.some(
        m => m.id === activeProfile?.id && m.isAdmin
    ) || false;

    return {
        profiles: state.profiles,
        activeProfile,
        currentGroup: state.currentGroup,
        loading,
        isGroupAdmin,
        addProfile,
        switchProfile,
        addPoints,
        createGroup,
        requestJoinGroup,
        approveJoinRequest,
        rejectJoinRequest
    };
};
