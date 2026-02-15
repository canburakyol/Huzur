import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
    Users, UserPlus, Trophy, Star, Crown, Activity, 
    MessageCircle, Share2, Target, Heart, Check, X, Clock 
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { useFamily } from '../hooks/useFamily';
import IslamicBackButton from './shared/IslamicBackButton';

const FamilyMode = ({ onClose }) => {
    const { t } = useTranslation();
    const { 
        profiles, activeProfile, addProfile, switchProfile, 
        createGroup, requestJoinGroup, approveJoinRequest, rejectJoinRequest, 
        currentGroup, isGroupAdmin 
    } = useFamily();
    const [activeTab, setActiveTab] = useState('overview'); // overview, leaderboard, activities, groups
    const [view, setView] = useState('list'); // list, create
    const [newName, setNewName] = useState('');
    const [newRole, setNewRole] = useState('child');
    
    // Group State
    const [groupName, setGroupName] = useState('');
    const [groupCode, setGroupCode] = useState('');
    const [groupError, setGroupError] = useState('');
    const [groupSuccess, setGroupSuccess] = useState('');
    
    const handleShareInvite = async () => {
        const text = t('family.inviteText', {
            code: currentGroup?.code || '',
            appName: t('app.name')
        });
        
        try {
            if (Capacitor.isNativePlatform()) {
                await Share.share({
                    title: t('family.inviteTitle', 'Aileye Davet Et'),
                    text,
                    dialogTitle: t('family.inviteDialog', 'Davet Et')
                });
                return;
            }

            if (navigator.share) {
                await navigator.share({ title: t('family.inviteTitle'), text });
            } else {
                await navigator.clipboard.writeText(text);
                alert(t('common.copied', 'Davet kodu kopyalandı!'));
            }
        } catch (err) {
            console.error('Share error:', err);
        }
    };

    const handleCreate = () => {
        if (!newName.trim()) return;
        addProfile(newName, newRole);
        setNewName('');
        setView('list');
    };

    const handleCreateGroup = async () => {
        if (!groupName.trim()) return;
        try {
            setGroupError('');
            setGroupSuccess('');
            await createGroup(groupName);
            setGroupName('');
        } catch (error) {
            console.error(error);
            setGroupError(t('family.groups.errorCreating'));
        }
    };

    const handleRequestJoinGroup = async () => {
        if (!groupCode.trim()) return;
        try {
            setGroupError('');
            setGroupSuccess('');
            const result = await requestJoinGroup(groupCode);
            setGroupCode('');
            if (result.status === 'pending') {
                setGroupSuccess(t('family.groups.requestSent'));
            }
        } catch (error) {
            console.error(error);
            setGroupError(error.message || t('family.groups.errorJoining'));
        }
    };

    const handleApprove = async (profileId) => {
        try {
            await approveJoinRequest(profileId);
        } catch (error) {
            console.error(error);
        }
    };

    const handleReject = async (profileId) => {
        try {
            await rejectJoinRequest(profileId);
        } catch (error) {
            console.error(error);
        }
    };

    const renderTabs = () => (
        <div className="glass-card" style={{ padding: '5px', display: 'flex', gap: '5px', marginBottom: '20px' }}>
            {['overview', 'leaderboard', 'activities', 'groups'].map(tab => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                        flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                        background: activeTab === tab ? 'var(--primary-color)' : 'transparent',
                        color: activeTab === tab ? 'white' : 'var(--text-color)',
                        fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    {t(`family.tabs.${tab}`)}
                </button>
            ))}
        </div>
    );

    const renderOverview = () => (
        <div className="animate-fade-in">
            {/* Active Profile Banner */}
            {activeProfile && (
                <div className="glass-card" style={{ 
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    color: 'white', padding: '25px', display: 'flex', alignItems: 'center', gap: '20px',
                    boxShadow: '0 10px 25px rgba(37, 99, 235, 0.3)'
                }}>
                    <div style={{ fontSize: '48px', background: 'rgba(255,255,255,0.2)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {activeProfile.avatar}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '5px' }}>{t('family.welcomeBack')}</div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '5px' }}>{activeProfile.name}</div>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(0,0,0,0.2)', padding: '4px 10px', borderRadius: '12px' }}>
                                <Star size={14} fill="gold" color="gold" />
                                <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{activeProfile.points}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(0,0,0,0.2)', padding: '4px 10px', borderRadius: '12px' }}>
                                <Trophy size={14} color="#fbbf24" />
                                <span style={{ fontWeight: 'bold', fontSize: '14px' }}>#{profiles.sort((a,b) => b.points - a.points).findIndex(p => p.id === activeProfile.id) + 1}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Shared Goals Section */}
            <div style={{ marginTop: '20px' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-color)' }}>
                    <Target size={20} color="var(--primary-color)" /> {t('family.sharedGoals')}
                </h3>
                <div className="glass-card" style={{ padding: '15px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '50px', height: '50px', background: '#ecfdf5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                        <Heart size={24} fill="#10b981" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', marginBottom: '4px', color: 'var(--text-color)' }}>{t('family.goals.familyHatim')}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-color-muted)', marginBottom: '8px' }}>{t('family.goals.desc')}</div>
                        <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: '45%', height: '100%', background: '#10b981' }} />
                        </div>
                    </div>
                    <button className="btn btn-sm btn-primary">{t('common.view')}</button>
                </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' }}>
                <button className="glass-card" style={{ padding: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', border: 'none', cursor: 'pointer' }}>
                    <div style={{ width: '40px', height: '40px', background: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                        <MessageCircle size={20} />
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-color)' }}>{t('family.chat')}</span>
                </button>
                <button className="glass-card" onClick={handleShareInvite} style={{ padding: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', border: 'none', cursor: 'pointer' }}>
                    <div style={{ width: '40px', height: '40px', background: '#fef3c7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
                        <Share2 size={20} />
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-color)' }}>{t('family.invite')}</span>
                </button>
            </div>
        </div>
    );

    const renderLeaderboard = () => (
        <div className="animate-fade-in">
            <div className="glass-card" style={{ padding: '0' }}>
                <div style={{ padding: '15px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-color)' }}>
                        <Trophy size={20} color="#f59e0b" /> {t('family.leaderboard')}
                    </h3>
                    <button onClick={() => setView('create')} className="btn btn-sm" style={{ padding: '6px 12px', fontSize: '12px' }}>
                        <UserPlus size={14} style={{ marginRight: '4px' }} /> {t('common.add')}
                    </button>
                </div>
                
                <div style={{ padding: '10px' }}>
                    {profiles.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-color-muted)' }}>
                            {t('family.noProfiles')}
                        </div>
                    ) : (
                        profiles
                            .sort((a, b) => b.points - a.points)
                            .map((profile, index) => (
                                <div 
                                    key={profile.id}
                                    onClick={() => switchProfile(profile.id)}
                                    style={{ 
                                        display: 'flex', alignItems: 'center', gap: '12px', 
                                        padding: '12px', borderRadius: '12px',
                                        background: activeProfile?.id === profile.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                        cursor: 'pointer', marginBottom: '5px',
                                        border: activeProfile?.id === profile.id ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent'
                                    }}
                                >
                                    <div style={{ width: '24px', textAlign: 'center', fontWeight: 'bold', color: index < 3 ? '#f59e0b' : 'var(--text-color-muted)' }}>
                                        {index === 0 ? <Crown size={20} color="#f59e0b" fill="#f59e0b" /> : index + 1}
                                    </div>
                                    <div style={{ fontSize: '24px' }}>{profile.avatar}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '600', color: 'var(--text-color)' }}>{profile.name}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-color-muted)' }}>{profile.role === 'child' ? t('family.child') : t('family.parent')}</div>
                                    </div>
                                    <div style={{ fontWeight: 'bold', color: '#3b82f6' }}>{profile.points}p</div>
                                </div>
                            ))
                    )}
                </div>
            </div>
        </div>
    );

    const renderActivities = () => (
        <div className="animate-fade-in">
            <div className="glass-card" style={{ padding: '20px' }}>
                <h3 style={{ marginTop: 0, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-color)' }}>
                    <Activity size={20} color="#8b5cf6" /> {t('family.recentActivity')}
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Mock Activities */}
                    {[1, 2, 3].map((i) => (
                        <div key={i} style={{ display: 'flex', gap: '15px' }}>
                            <div style={{ 
                                width: '36px', height: '36px', borderRadius: '50%', background: '#f3f4f6', 
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' 
                            }}>
                                {['👨‍👩‍👧', '👶', '👵'][i-1]}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '14px', color: 'var(--text-color)' }}>
                                    <span style={{ fontWeight: '600' }}>{['Ahmet', 'Zeynep', 'Fatma'][i-1]}</span>
                                    {' '}{t(`family.activities.action${i}`)}
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--text-color-muted)', marginTop: '4px' }}>{i * 15} {t('family.minutesAgo')}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderGroups = () => (
        <div className="animate-fade-in">
            {currentGroup ? (
                <div className="glass-card" style={{ padding: '25px', textAlign: 'center' }}>
                    <div style={{ width: '80px', height: '80px', background: '#e0e7ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px', color: '#4f46e5' }}>
                        <Users size={40} />
                    </div>
                    <h2 style={{ margin: '0 0 5px', color: 'var(--text-color)' }}>{currentGroup.name}</h2>
                    <div style={{ background: '#f3f4f6', padding: '8px 16px', borderRadius: '20px', display: 'inline-block', marginBottom: '20px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-color-muted)', marginRight: '8px' }}>{t('family.groups.code')}:</span>
                        <span style={{ fontWeight: 'bold', fontSize: '16px', letterSpacing: '2px', color: 'var(--text-color)' }}>{currentGroup.code}</span>
                    </div>
                    
                    <div style={{ textAlign: 'left', marginTop: '20px' }}>
                        <h4 style={{ marginBottom: '15px', color: 'var(--text-color)' }}>{t('family.groups.members')} ({currentGroup.members.length})</h4>
                        {currentGroup.members.map((member, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', borderBottom: '1px solid #f1f5f9' }}>
                                <div style={{ fontSize: '24px' }}>{member.avatar}</div>
                                <div>
                                    <div style={{ fontWeight: '600', color: 'var(--text-color)' }}>{member.name}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-color-muted)' }}>{member.role === 'child' ? t('family.child') : t('family.parent')}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pending Members Section - Admin Only */}
                    {isGroupAdmin && currentGroup.pendingMembers && currentGroup.pendingMembers.length > 0 && (
                        <div style={{ textAlign: 'left', marginTop: '25px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
                            <h4 style={{ marginBottom: '15px', color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Clock size={16} color="#f59e0b" /> {t('family.groups.pendingRequests')} ({currentGroup.pendingMembers.length})
                            </h4>
                            {currentGroup.pendingMembers.map((member, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: '#fef3c7', borderRadius: '8px', marginBottom: '8px' }}>
                                    <div style={{ fontSize: '24px' }}>{member.avatar}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '600', color: 'var(--text-color)' }}>{member.name}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-color-muted)' }}>{member.role === 'child' ? t('family.child') : t('family.parent')}</div>
                                    </div>
                                    <button 
                                        onClick={() => handleApprove(member.id)} 
                                        style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}
                                    >
                                        <Check size={18} />
                                    </button>
                                    <button 
                                        onClick={() => handleReject(member.id)} 
                                        style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="glass-card" style={{ padding: '25px' }}>
                        <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-color)' }}>
                            <UserPlus size={20} color="#10b981" /> {t('family.groups.create')}
                        </h3>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input 
                                type="text" 
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                placeholder={t('family.namePlaceholder')}
                                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                            />
                            <button onClick={handleCreateGroup} className="btn btn-primary">
                                {t('family.groups.createBtn')}
                            </button>
                        </div>
                    </div>

                    <div className="glass-card" style={{ padding: '25px' }}>
                        <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-color)' }}>
                            <Users size={20} color="#3b82f6" /> {t('family.groups.join')}
                        </h3>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input 
                                type="text" 
                                value={groupCode}
                                onChange={(e) => setGroupCode(e.target.value)}
                                placeholder={t('family.groups.enterCode')}
                                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                            />
                            <button onClick={handleRequestJoinGroup} className="btn btn-primary">
                                {t('family.groups.joinBtn')}
                            </button>
                        </div>
                    </div>
                    
                    {groupSuccess && (
                        <div style={{ color: '#10b981', textAlign: 'center', padding: '10px', background: '#ecfdf5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <Clock size={16} /> {groupSuccess}
                        </div>
                    )}
                    
                    {groupError && (
                        <div style={{ color: '#ef4444', textAlign: 'center', padding: '10px', background: '#fee2e2', borderRadius: '8px' }}>
                            {groupError}
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    const renderCreate = () => (
        <div className="glass-card" style={{ padding: '20px' }}>
            <h3 style={{ marginTop: 0 }}>{t('family.createProfile')}</h3>
            <input 
                type="text" 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={t('family.namePlaceholder')}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '10px' }}
            />
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button 
                    onClick={() => setNewRole('child')}
                    className={`btn ${newRole === 'child' ? 'btn-primary' : ''}`}
                    style={{ flex: 1, opacity: newRole === 'child' ? 1 : 0.6 }}
                >
                    👶 {t('family.child')}
                </button>
                <button 
                    onClick={() => setNewRole('parent')}
                    className={`btn ${newRole === 'parent' ? 'btn-primary' : ''}`}
                    style={{ flex: 1, opacity: newRole === 'parent' ? 1 : 0.6 }}
                >
                    👨‍👩‍👧 {t('family.parent')}
                </button>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setView('list')} className="btn" style={{ flex: 1 }}>{t('common.cancel')}</button>
                <button onClick={handleCreate} className="btn btn-primary" style={{ flex: 1 }}>{t('common.save')}</button>
            </div>
        </div>
    );

    return (
        <div className="app-container" style={{ paddingBottom: '100px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '20px' }}>
                <IslamicBackButton onClick={onClose} size="medium" />
                <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--text-color)' }}>{t('family.title')}</h2>
            </div>

            <div style={{ padding: '0 20px' }}>
                {view === 'create' ? renderCreate() : (
                    <>
                        {renderTabs()}
                        {activeTab === 'overview' && renderOverview()}
                        {activeTab === 'leaderboard' && renderLeaderboard()}
                        {activeTab === 'activities' && renderActivities()}
                        {activeTab === 'groups' && renderGroups()}
                    </>
                )}
            </div>
        </div>
    );
};

export default FamilyMode;
