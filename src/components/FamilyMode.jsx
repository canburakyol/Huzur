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
    
    const TABS = [
        { id: 'overview', icon: <Activity size={18} /> },
        { id: 'leaderboard', icon: <Trophy size={18} /> },
        { id: 'activities', icon: <Clock size={18} /> },
        { id: 'groups', icon: <Users size={18} /> }
    ];
    
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
        <div className="settings-card reveal-stagger" style={{ 
            padding: '6px', 
            display: 'flex', 
            gap: '6px', 
            marginBottom: '24px',
            background: 'var(--nav-hover)',
            borderRadius: '16px'
        }}>
            {TABS.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                        flex: 1, 
                        padding: '12px 8px', 
                        borderRadius: '12px', 
                        border: 'none',
                        background: activeTab === tab.id ? 'var(--nav-accent)' : 'transparent',
                        color: activeTab === tab.id ? 'white' : 'var(--nav-text-muted)',
                        fontSize: '0.85rem', 
                        fontWeight: '800', 
                        cursor: 'pointer',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px'
                    }}
                >
                    <div style={{ opacity: activeTab === tab.id ? 1 : 0.7 }}>
                        {tab.icon}
                    </div>
                    <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {t(`family.tabs.${tab.id}`)}
                    </span>
                </button>
            ))}
        </div>
    );

    const renderOverview = () => (
        <div className="reveal-stagger">
            {/* Active Profile Banner */}
            {activeProfile && (
                <div className="reveal-stagger" style={{ 
                    background: 'linear-gradient(135deg, var(--nav-accent) 0%, var(--accent-gold-light) 100%)',
                    color: 'white', 
                    padding: '32px 24px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '20px',
                    borderRadius: '28px',
                    boxShadow: '0 15px 35px rgba(var(--nav-accent-rgb, 245, 158, 11), 0.25)',
                    position: 'relative',
                    overflow: 'hidden',
                    marginBottom: '24px'
                }}>
                    {/* Decorative element */}
                    <div style={{
                        position: 'absolute',
                        top: '-20px',
                        right: '-20px',
                        fontSize: '100px',
                        opacity: 0.1,
                        transform: 'rotate(15deg)'
                    }}>
                        {activeProfile.avatar}
                    </div>

                    <div style={{ 
                        fontSize: '48px', 
                        background: 'rgba(255,255,255,0.2)', 
                        backdropFilter: 'blur(10px)',
                        width: '84px', 
                        height: '84px', 
                        borderRadius: '24px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                        border: '1px solid rgba(255,255,255,0.3)'
                    }}>
                        {activeProfile.avatar}
                    </div>
                    <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                        <div style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '2px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {t('family.welcomeBack')}
                        </div>
                        <div style={{ fontSize: '1.75rem', fontWeight: '950', marginBottom: '8px', letterSpacing: '-0.5px' }}>
                            {activeProfile.name}
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '6px', 
                                background: 'rgba(255,255,255,0.2)', 
                                padding: '6px 12px', 
                                borderRadius: '12px',
                                backdropFilter: 'blur(5px)'
                            }}>
                                <Star size={14} fill="white" color="white" />
                                <span style={{ fontWeight: '800', fontSize: '0.9rem' }}>{activeProfile.points}</span>
                            </div>
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '6px', 
                                background: 'rgba(0,0,0,0.15)', 
                                padding: '6px 12px', 
                                borderRadius: '12px' 
                            }}>
                                <Trophy size={14} color="white" />
                                <span style={{ fontWeight: '800', fontSize: '0.9rem' }}>
                                    #{profiles.sort((a,b) => b.points - a.points).findIndex(p => p.id === activeProfile.id) + 1}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Shared Goals Section */}
            <div style={{ marginTop: '24px' }}>
                <h3 style={{ 
                    fontSize: '1rem', 
                    marginBottom: '16px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px', 
                    color: 'var(--nav-text)',
                    fontWeight: '900',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                }}>
                    <Target size={20} color="var(--nav-accent)" /> {t('family.sharedGoals')}
                </h3>
                <div className="settings-card reveal-stagger" style={{ 
                    padding: '24px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '20px',
                    flexDirection: 'row'
                }}>
                    <div className="settings-icon-box" style={{ 
                        width: '56px', height: '56px', 
                        background: 'rgba(15, 118, 110, 0.12)', 
                        borderRadius: '16px', 
                        color: 'var(--bg-emerald-light)' 
                    }}>
                        <Heart size={28} fill="var(--bg-emerald-light)" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '900', marginBottom: '4px', color: 'var(--nav-text)', fontSize: '1.05rem' }}>
                            {t('family.goals.familyHatim')}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--nav-text-muted)', marginBottom: '12px', fontWeight: '600' }}>
                            {t('family.goals.desc')}
                        </div>
                        <div style={{ 
                            height: '8px', 
                            background: 'var(--nav-hover)', 
                            borderRadius: '10px', 
                            overflow: 'hidden',
                            border: '1px solid var(--nav-border)'
                        }}>
                            <div style={{ 
                                width: '45%', 
                                height: '100%', 
                                background: 'linear-gradient(90deg, var(--bg-emerald-light), var(--bg-emerald-light))',
                                borderRadius: '10px'
                            }} />
                        </div>
                        <div style={{ marginTop: '8px', fontSize: '0.75rem', fontWeight: '800', color: 'var(--bg-emerald-light)' }}>
                            %45 Tamamlandı
                        </div>
                    </div>
                    <button className="velocity-target-btn" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                        {t('common.view')}
                    </button>
                </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '24px' }}>
                <button className="settings-card reveal-stagger" style={{ 
                    padding: '24px 16px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    gap: '12px', 
                    border: 'none', 
                    cursor: 'pointer',
                    '--delay': '0.1s'
                }}>
                    <div className="settings-icon-box" style={{ 
                        width: '48px', height: '48px', 
                        background: 'rgba(6, 95, 70, 0.12)', 
                        borderRadius: '14px', 
                        color: 'var(--bg-emerald-med)' 
                    }}>
                        <MessageCircle size={24} />
                    </div>
                    <span style={{ fontSize: '0.9rem', fontWeight: '900', color: 'var(--nav-text)' }}>
                        {t('family.chat')}
                    </span>
                </button>
                <button 
                    className="settings-card reveal-stagger" 
                    onClick={handleShareInvite} 
                    style={{ 
                        padding: '24px 16px', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        gap: '12px', 
                        border: 'none', 
                        cursor: 'pointer',
                        '--delay': '0.15s'
                    }}
                >
                    <div className="settings-icon-box" style={{ 
                        width: '48px', height: '48px', 
                        background: 'rgba(var(--nav-accent-rgb, 245, 158, 11), 0.1)', 
                        borderRadius: '14px', 
                        color: 'var(--nav-accent)' 
                    }}>
                        <Share2 size={24} />
                    </div>
                    <span style={{ fontSize: '0.9rem', fontWeight: '900', color: 'var(--nav-text)' }}>
                        {t('family.invite')}
                    </span>
                </button>
            </div>
        </div>
    );

    const renderLeaderboard = () => (
        <div className="reveal-stagger">
            <div className="settings-card" style={{ padding: '0', flexDirection: 'column', alignItems: 'stretch' }}>
                <div style={{ 
                    padding: '24px', 
                    borderBottom: '1px solid var(--nav-border)', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    background: 'var(--nav-hover)',
                    borderTopLeftRadius: '24px',
                    borderTopRightRadius: '24px'
                }}>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--nav-text)', fontWeight: '900' }}>
                        <Trophy size={20} color="var(--accent-gold-light)" /> {t('family.leaderboard')}
                    </h3>
                    <button onClick={() => setView('create')} className="velocity-target-btn" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                        <UserPlus size={16} /> {t('common.add')}
                    </button>
                </div>
                
                <div style={{ padding: '12px' }}>
                    {profiles.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--nav-text-muted)', fontWeight: '600' }}>
                            {t('family.noProfiles')}
                        </div>
                    ) : (
                        profiles
                            .sort((a, b) => b.points - a.points)
                            .map((profile, index) => (
                                <div 
                                    key={profile.id}
                                    className="reveal-stagger"
                                    onClick={() => switchProfile(profile.id)}
                                    style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '16px', 
                                        padding: '16px', 
                                        borderRadius: '16px',
                                        background: activeProfile?.id === profile.id ? 'var(--nav-hover)' : 'transparent',
                                        cursor: 'pointer', 
                                        marginBottom: '4px',
                                        border: activeProfile?.id === profile.id ? '1px solid var(--nav-accent)' : '1px solid transparent',
                                        transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                        '--delay': `${index * 0.05}s`
                                    }}
                                >
                                    <div style={{ 
                                        width: '32px', 
                                        textAlign: 'center', 
                                        fontWeight: '950', 
                                        color: index < 3 ? 'var(--accent-gold-light)' : 'var(--nav-text-muted)',
                                        fontSize: index < 3 ? '1.2rem' : '1rem'
                                    }}>
                                        {index === 0 ? <Crown size={24} color="var(--accent-gold-light)" fill="var(--accent-gold-light)" /> : index + 1}
                                    </div>
                                    <div className="settings-icon-box" style={{ 
                                        width: '48px', 
                                        height: '48px', 
                                        fontSize: '1.5rem',
                                        background: activeProfile?.id === profile.id ? 'var(--nav-accent)' : 'var(--nav-hover)',
                                        color: activeProfile?.id === profile.id ? 'white' : 'inherit',
                                        borderRadius: '14px'
                                    }}>
                                        {profile.avatar}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '900', color: 'var(--nav-text)', fontSize: '1rem' }}>{profile.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--nav-text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
                                            {profile.role === 'child' ? t('family.child') : t('family.parent')}
                                        </div>
                                    </div>
                                    <div style={{ fontWeight: '950', color: 'var(--nav-accent)', fontSize: '1.1rem' }}>
                                        {profile.points}<span style={{ fontSize: '0.7rem', opacity: 0.7, marginLeft: '2px' }}>p</span>
                                    </div>
                                </div>
                            ))
                    )}
                </div>
            </div>
        </div>
    );

    const renderActivities = () => (
        <div className="reveal-stagger">
            <div className="settings-card" style={{ padding: '24px', flexDirection: 'column', alignItems: 'stretch' }}>
                <h3 style={{ marginTop: 0, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--nav-text)', fontWeight: '950' }}>
                    <Activity size={20} color="var(--bg-emerald-med)" /> {t('family.recentActivity')}
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Mock Activities */}
                    {[1, 2, 3].map((i, index) => (
                        <div key={i} className="reveal-stagger" style={{ display: 'flex', gap: '16px', '--delay': `${index * 0.05}s` }}>
                            <div className="settings-icon-box" style={{ 
                                width: '44px', height: '44px', borderRadius: '12px', background: 'var(--nav-hover)', 
                                fontSize: '1.25rem' 
                            }}>
                                {['👨‍👩‍👧', '👶', '👵'][i-1]}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.95rem', color: 'var(--nav-text)', lineHeight: '1.4' }}>
                                    <span style={{ fontWeight: '900' }}>{['Ahmet', 'Zeynep', 'Fatma'][i-1]}</span>
                                    {' '}{t(`family.activities.action${i}`)}
                                </div>
                                <div style={{ 
                                    fontSize: '0.75rem', 
                                    color: 'var(--nav-text-muted)', 
                                    marginTop: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontWeight: '700'
                                }}>
                                    <Clock size={12} />
                                    {i * 15} {t('family.minutesAgo')}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderGroups = () => (
        <div className="reveal-stagger">
            {currentGroup ? (
                <div className="settings-card" style={{ padding: '32px 24px', textAlign: 'center', flexDirection: 'column', alignItems: 'stretch' }}>
                    <div className="settings-icon-box" style={{ 
                        width: '84px', height: '84px', 
                        background: 'rgba(6, 78, 59, 0.12)', 
                        borderRadius: '24px', 
                        margin: '0 auto 16px', 
                        color: 'var(--bg-emerald-deep)' 
                    }}>
                        <Users size={40} />
                    </div>
                    <h2 style={{ margin: '0 0 8px', color: 'var(--nav-text)', fontWeight: '950', fontSize: '1.5rem' }}>{currentGroup.name}</h2>
                    <div style={{ 
                        background: 'var(--nav-hover)', 
                        padding: '10px 20px', 
                        borderRadius: '16px', 
                        display: 'inline-block', 
                        marginBottom: '32px',
                        border: '1px solid var(--nav-border)'
                    }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--nav-text-muted)', marginRight: '10px', fontWeight: '800', textTransform: 'uppercase' }}>
                            {t('family.groups.code')}:
                        </span>
                        <span style={{ fontWeight: '950', fontSize: '1.25rem', letterSpacing: '3px', color: 'var(--nav-accent)' }}>{currentGroup.code}</span>
                    </div>
                    
                    <div style={{ textAlign: 'left', marginTop: '16px' }}>
                        <h4 style={{ 
                            marginBottom: '16px', 
                            color: 'var(--nav-text)', 
                            fontWeight: '900',
                            fontSize: '1rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <span>{t('family.groups.members')}</span>
                            <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>{currentGroup.members.length} Üye</span>
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {currentGroup.members.map((member, idx) => (
                                <div key={idx} style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '14px', 
                                    padding: '12px', 
                                    borderRadius: '12px',
                                    background: 'var(--nav-hover)'
                                }}>
                                    <div style={{ fontSize: '1.5rem' }}>{member.avatar}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '800', color: 'var(--nav-text)', fontSize: '0.95rem' }}>{member.name}</div>
                                        <div style={{ 
                                            fontSize: '0.7rem', 
                                            color: 'var(--nav-text-muted)', 
                                            fontWeight: '700',
                                            textTransform: 'uppercase',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}>
                                            {member.role === 'child' ? '👶' : '👨‍👩‍👧'}
                                            {member.role === 'child' ? t('family.child') : t('family.parent')}
                                        </div>
                                    </div>
                                    {member.isOwner && (
                                        <div style={{ background: 'var(--nav-accent)', color: 'white', padding: '4px 8px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: '900' }}>
                                            ADMIN
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pending Members Section - Admin Only */}
                    {isGroupAdmin && currentGroup.pendingMembers && currentGroup.pendingMembers.length > 0 && (
                        <div style={{ textAlign: 'left', marginTop: '32px', paddingTop: '24px', borderTop: '2px dashed var(--nav-border)' }}>
                            <h4 style={{ marginBottom: '16px', color: 'var(--nav-text)', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '900' }}>
                                <Clock size={18} color="var(--accent-gold-light)" /> {t('family.groups.pendingRequests')}
                                <span style={{ background: 'var(--accent-gold-light)', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '0.7rem' }}>
                                    {currentGroup.pendingMembers.length}
                                </span>
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {currentGroup.pendingMembers.map((member, idx) => (
                                    <div key={idx} style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '14px', 
                                        padding: '16px', 
                                        background: 'rgba(var(--nav-accent-rgb, 245, 158, 11), 0.08)', 
                                        borderRadius: '16px',
                                        border: '1px solid rgba(var(--nav-accent-rgb, 245, 158, 11), 0.24)'
                                    }}>
                                        <div style={{ fontSize: '1.5rem' }}>{member.avatar}</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: '800', color: 'var(--nav-text)' }}>{member.name}</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--nav-text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
                                                {member.role === 'child' ? t('family.child') : t('family.parent')}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button 
                                                onClick={() => handleApprove(member.id)} 
                                                className="settings-icon-box"
                                                style={{ background: 'var(--bg-emerald-light)', color: 'white', width: '36px', height: '36px', borderRadius: '10px', cursor: 'pointer', border: 'none' }}
                                            >
                                                <Check size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleReject(member.id)} 
                                                className="settings-icon-box"
                                                style={{ background: 'var(--error-color)', color: 'white', width: '36px', height: '36px', borderRadius: '10px', cursor: 'pointer', border: 'none' }}
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="settings-card" style={{ padding: '24px', flexDirection: 'column', alignItems: 'stretch' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--nav-text)', fontWeight: '950' }}>
                            <UserPlus size={20} color="var(--bg-emerald-light)" /> {t('family.groups.create')}
                        </h3>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input 
                                type="text" 
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                placeholder={t('family.namePlaceholder')}
                                style={{ 
                                    flex: 1, 
                                    padding: '14px 18px', 
                                    borderRadius: '14px', 
                                    background: 'var(--nav-hover)',
                                    border: '1px solid var(--nav-border)',
                                    color: 'var(--nav-text)',
                                    fontWeight: '600',
                                    outline: 'none'
                                }}
                            />
                            <button onClick={handleCreateGroup} className="velocity-target-btn" style={{ padding: '0 24px' }}>
                                {t('family.groups.createBtn')}
                            </button>
                        </div>
                    </div>

                    <div className="settings-card" style={{ padding: '24px', flexDirection: 'column', alignItems: 'stretch' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--nav-text)', fontWeight: '950' }}>
                            <Users size={20} color="var(--nav-accent)" /> {t('family.groups.join')}
                        </h3>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input 
                                type="text" 
                                value={groupCode}
                                onChange={(e) => setGroupCode(e.target.value)}
                                placeholder={t('family.groups.enterCode')}
                                style={{ 
                                    flex: 1, 
                                    padding: '14px 18px', 
                                    borderRadius: '14px', 
                                    background: 'var(--nav-hover)',
                                    border: '1px solid var(--nav-border)',
                                    color: 'var(--nav-text)',
                                    fontWeight: '600',
                                    outline: 'none'
                                }}
                            />
                            <button onClick={handleRequestJoinGroup} className="velocity-target-btn" style={{ padding: '0 24px' }}>
                                {t('family.groups.joinBtn')}
                            </button>
                        </div>
                    </div>
                    
                    {groupSuccess && (
                        <div className="settings-card pulse" style={{ 
                            color: 'var(--bg-emerald-light)', 
                            padding: '16px', 
                            background: 'rgba(15, 118, 110, 0.08)', 
                            border: '1px solid rgba(15, 118, 110, 0.24)',
                            borderRadius: '16px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            gap: '10px',
                            fontWeight: '800',
                            fontSize: '0.9rem'
                        }}>
                            <Clock size={16} /> {groupSuccess}
                        </div>
                    )}
                    
                    {groupError && (
                        <div className="settings-card" style={{ 
                            color: 'var(--error-color)', 
                            padding: '16px', 
                            background: 'rgba(239, 68, 68, 0.05)', 
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            borderRadius: '16px',
                            justifyContent: 'center',
                            fontWeight: '800',
                            fontSize: '0.9rem'
                        }}>
                            {groupError}
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    const renderCreate = () => (
        <div className="settings-card reveal-stagger" style={{ padding: '32px 24px', flexDirection: 'column', alignItems: 'stretch' }}>
            <h3 style={{ marginTop: 0, marginBottom: '24px', color: 'var(--nav-text)', fontWeight: '950', fontSize: '1.25rem' }}>
                {t('family.createProfile')}
            </h3>
            <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--nav-text-muted)', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>
                    {t('family.nameLabel', 'Profil İsmi')}
                </label>
                <input 
                    type="text" 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder={t('family.namePlaceholder')}
                    style={{ 
                        width: '100%', 
                        padding: '14px 18px', 
                        borderRadius: '14px', 
                        background: 'var(--nav-hover)',
                        border: '1px solid var(--nav-border)',
                        color: 'var(--nav-text)',
                        fontWeight: '600',
                        fontSize: '1rem',
                        outline: 'none'
                    }}
                />
            </div>
            
            <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--nav-text-muted)', marginBottom: '12px', display: 'block', textTransform: 'uppercase' }}>
                {t('family.roleLabel', 'Rol Seçimi')}
            </label>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
                <button 
                    onClick={() => setNewRole('child')}
                    className="settings-card"
                    style={{ 
                        flex: 1, 
                        background: newRole === 'child' ? 'var(--nav-accent)' : 'var(--nav-hover)',
                        color: newRole === 'child' ? 'white' : 'var(--nav-text)',
                        padding: '16px',
                        justifyContent: 'center',
                        fontSize: '0.9rem',
                        fontWeight: '800',
                        border: newRole === 'child' ? '1px solid var(--nav-accent)' : '1px solid var(--nav-border)',
                        transition: 'all 0.2s'
                    }}
                >
                    👶 {t('family.child')}
                </button>
                <button 
                    onClick={() => setNewRole('parent')}
                    className="settings-card"
                    style={{ 
                        flex: 1, 
                        background: newRole === 'parent' ? 'var(--nav-accent)' : 'var(--nav-hover)',
                        color: newRole === 'parent' ? 'white' : 'var(--nav-text)',
                        padding: '16px',
                        justifyContent: 'center',
                        fontSize: '0.9rem',
                        fontWeight: '800',
                        border: newRole === 'parent' ? '1px solid var(--nav-accent)' : '1px solid var(--nav-border)',
                        transition: 'all 0.2s'
                    }}
                >
                    👨‍👩‍👧 {t('family.parent')}
                </button>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                    onClick={() => setView('list')} 
                    className="settings-card"
                    style={{ 
                        flex: 1, 
                        justifyContent: 'center', 
                        padding: '16px', 
                        fontWeight: '800',
                        color: 'var(--nav-text-muted)'
                    }}
                >
                    {t('common.cancel')}
                </button>
                <button 
                    onClick={handleCreate} 
                    className="velocity-target-btn" 
                    style={{ flex: 1, padding: '16px' }}
                >
                    {t('common.save')}
                </button>
            </div>
        </div>
    );

    return (
        <div className="settings-container reveal-stagger" style={{ paddingBottom: '120px' }}>
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px', 
                padding: '12px 4px',
                marginBottom: '24px' 
            }}>
                <IslamicBackButton onClick={onClose} size="medium" />
                <h2 style={{ 
                    margin: 0, 
                    fontSize: '1.75rem', 
                    color: 'var(--nav-text)',
                    fontWeight: '950',
                    letterSpacing: '-0.5px'
                }}>
                    {t('family.title')}
                </h2>
            </div>

            <div className="reveal-stagger">
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

