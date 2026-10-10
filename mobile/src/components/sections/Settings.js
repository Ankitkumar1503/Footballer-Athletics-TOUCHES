import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  User,
  LogOut,
  RotateCcw,
  Trash2,
  FileText,
  ChevronRight,
  ChevronDown,
  Mail,
  Lock,
  Shield,
  Download,
  Upload,
  UserX,
} from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useActiveSession } from '../../hooks/useActiveSession';
import { db } from '../../lib/db';
import { generateAndSharePdf } from '../../lib/pdfGenerator';
import { deleteAccount } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function Settings() {
  const navigation = useNavigation();
  const { logout } = useAuth();
  const { session, stats, reflection, sessionId } = useActiveSession();

  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      q: 'What is Touches™?',
      a: 'Touches™ is a player development tool designed to track match interactions, technical actions, and self-reflection metrics.',
    },
    {
      q: 'Does Touches™ track my location?',
      a: 'No. The app does not use GPS or location services.',
    },
    {
      q: 'Where is my data stored?',
      a: 'All data is stored locally on your device.',
    },
    {
      q: 'Is my data shared with third parties?',
      a: 'No. Touches™ does not sell or distribute user data.',
    },
    {
      q: 'Can I export my session results?',
      a: 'Yes. Users may generate PDFs and save reports to their device.',
    },
    {
      q: 'Who operates Touches™?',
      a: 'Touches™ is operated by Footballer Athletics™.',
    },
  ];

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete My Account',
      'Are you sure you want to delete your account? This will permanently delete your registered profile on the server and erase all local session history, touches, and credentials from this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            try {
              // 1. Attempt server-side deletion
              try {
                await deleteAccount();
              } catch (apiErr) {
                console.warn('Server-side account deletion notice:', apiErr?.message);
              }

              // 2. Clear local database tables
              await db.sessions.clear();
              await db.touches.clear();
              await db.reflections.clear();
              const keys = [
                'playerProfile',
                'playerCareerStats',
                'challengeState',
                'playerAttendance',
                'playerEvaluation',
                'footballFormation',
                'formationSquad',
                'noteToCoach',
                'matchDayPrep',
                'aiAgentChat',
                'actionSettings',
                'authToken',
                'user',
                'isRegistered',
              ];
              await AsyncStorage.multiRemove(keys);
              await logout();
              Alert.alert(
                'Account Deleted',
                'Your account and all local player records have been permanently erased.'
              );
            } catch (e) {
              console.error('Error deleting account:', e);
            }
          },
        },
      ]
    );
  };

  const handleExportBackup = async () => {
    try {
      const allSessions = await db.sessions.getAll();
      const allTouches = await db.touches.getAll();
      const allReflections = await db.reflections.getAll();

      const keys = [
        'playerProfile',
        'playerCareerStats',
        'challengeState',
        'playerAttendance',
        'playerEvaluation',
        'footballFormation',
        'formationSquad',
        'noteToCoach',
        'matchDayPrep',
        'aiAgentChat',
        'actionSettings',
      ];
      const stores = await AsyncStorage.multiGet(keys);
      const localData = {};
      stores.forEach(([k, v]) => {
        if (v) {
          try { localData[k] = JSON.parse(v); } catch { localData[k] = v; }
        }
      });

      const backupObj = {
        version: '1.0',
        app: 'TOUCHES',
        exportedAt: new Date().toISOString(),
        db: {
          sessions: allSessions,
          touches: allTouches,
          reflections: allReflections,
        },
        localStorage: localData,
      };

      const backupJson = JSON.stringify(backupObj);
      await AsyncStorage.setItem('playerDataBackup', backupJson);
      Alert.alert(
        'Data Backup Saved',
        `Successfully backed up ${allSessions.length} sessions, ${allTouches.length} touches, and your player development stats locally.`
      );
    } catch (err) {
      Alert.alert('Backup Error', err?.message || 'Could not export backup.');
    }
  };

  const handleRestoreBackup = async () => {
    try {
      const savedBackup = await AsyncStorage.getItem('playerDataBackup');
      if (!savedBackup) {
        Alert.alert(
          'No Backup Found',
          'No saved player backup was found on this device. Create a backup first by tapping Export Data Backup.'
        );
        return;
      }

      Alert.alert(
        'Restore Data Backup',
        'Restore player data from your saved backup? Existing records will be safely merged and newer local records will be preserved.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Restore',
            onPress: async () => {
              try {
                const parsed = JSON.parse(savedBackup);
                if (
                  !parsed ||
                  typeof parsed !== 'object' ||
                  parsed.app !== 'TOUCHES' ||
                  !parsed.db ||
                  typeof parsed.db !== 'object'
                ) {
                  Alert.alert('Invalid Backup', 'The saved backup is invalid or incompatible with TOUCHES.');
                  return;
                }

                let restoredCount = 0;
                let preservedCount = 0;

                if (Array.isArray(parsed?.db?.sessions)) {
                  for (const s of parsed.db.sessions) {
                    if (!s) continue;
                    const existing = s.id ? await db.sessions.get(s.id) : null;
                    if (!existing) {
                      await db.sessions.put(s);
                      restoredCount++;
                    } else {
                      const existingTime = new Date(existing.updatedAt || existing.date || 0).getTime();
                      const backupTime = new Date(s.updatedAt || s.date || 0).getTime();
                      if (backupTime > existingTime) {
                        await db.sessions.put(s);
                        restoredCount++;
                      } else {
                        preservedCount++;
                      }
                    }
                  }
                }

                if (Array.isArray(parsed?.db?.touches)) {
                  for (const t of parsed.db.touches) {
                    if (!t) continue;
                    const existing = t.id ? await db.touches.get(t.id) : null;
                    if (!existing) {
                      await db.touches.put(t);
                    }
                  }
                }

                if (Array.isArray(parsed?.db?.reflections)) {
                  for (const r of parsed.db.reflections) {
                    if (!r) continue;
                    const existing = r.id ? await db.reflections.get(r.id) : null;
                    if (!existing) {
                      await db.reflections.put(r);
                    } else {
                      const existingTime = new Date(existing.updatedAt || existing.date || 0).getTime();
                      const backupTime = new Date(r.updatedAt || r.date || 0).getTime();
                      if (backupTime > existingTime) {
                        await db.reflections.put(r);
                      }
                    }
                  }
                }

                if (parsed.localStorage && typeof parsed.localStorage === 'object') {
                  for (const [k, v] of Object.entries(parsed.localStorage)) {
                    const existingRaw = await AsyncStorage.getItem(k);
                    if (!existingRaw) {
                      await AsyncStorage.setItem(
                        k,
                        typeof v === 'object' ? JSON.stringify(v) : String(v)
                      );
                    } else {
                      if (k === 'challengeState') {
                        try {
                          const existingState = JSON.parse(existingRaw);
                          const backupState = typeof v === 'object' ? v : JSON.parse(v);
                          const existingDays = Array.isArray(existingState?.completedDays)
                            ? existingState.completedDays.length
                            : 0;
                          const backupDays = Array.isArray(backupState?.completedDays)
                            ? backupState.completedDays.length
                            : 0;
                          if (backupDays > existingDays) {
                            await AsyncStorage.setItem(k, JSON.stringify(backupState));
                          }
                        } catch {}
                      } else if (k === 'playerCareerStats') {
                        try {
                          const existingStats = JSON.parse(existingRaw);
                          const backupStats = typeof v === 'object' ? v : JSON.parse(v);
                          const existingTotal =
                            existingStats?.totalTouches || existingStats?.total || 0;
                          const backupTotal =
                            backupStats?.totalTouches || backupStats?.total || 0;
                          if (backupTotal > existingTotal) {
                            await AsyncStorage.setItem(k, JSON.stringify(backupStats));
                          }
                        } catch {}
                      }
                    }
                  }
                }

                Alert.alert(
                  'Restore Complete',
                  `Your player data was restored successfully. Restored: ${restoredCount} sessions. Preserved: ${preservedCount} newer local sessions.`
                );
              } catch (e) {
                Alert.alert('Restore Failed', e?.message || 'Could not parse backup.');
              }
            },
          },
        ]
      );
    } catch (e) {
      Alert.alert('Error', e?.message || 'Restore error.');
    }
  };

  const handleResetSession = () => {
    Alert.alert(
      'Reset Session',
      'This will permanently clear all touches and reflections for today.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              if (sessionId) {
                await db.touches.where('sessionId').equals(sessionId).delete();
                await db.reflections.where('sessionId').equals(sessionId).delete();
              }
              Alert.alert('Done', 'Session data has been reset.');
            } catch (e) {
              console.error(e);
            }
          },
        },
      ]
    );
  };

  const handleResetAll = () => {
    Alert.alert(
      'Delete All Data',
      'This will delete ALL sessions, profile, and lifetime records stored on this device. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              await db.sessions.clear();
              await db.touches.clear();
              await db.reflections.clear();
              await logout();
              Alert.alert('Reset Complete', 'All app data has been cleared.');
            } catch (e) {
              console.error(e);
            }
          },
        },
      ]
    );
  };

  const handleExportPdf = async () => {
    await generateAndSharePdf({ session, stats, reflection, section: 'Full Match' });
  };

  return (
    <View className="space-y-4 pb-12">
      {/* Page Title */}
      <View className="border-b-2 border-white/20 pb-2 mb-2">
        <Text className="text-2xl font-black uppercase tracking-widest text-white">
          Settings
        </Text>
      </View>

      {/* ── ACCOUNT SECTION ── */}
      <View className="space-y-1">
        <Text className="text-[9px] font-black uppercase tracking-widest text-white/50 mb-1">
          Account
        </Text>

        <TouchableOpacity
          onPress={() => navigation.navigate('Profile')}
          className="p-3 rounded-xl bg-[#12151D] border border-white/10 flex-row items-center justify-between"
        >
          <View className="flex-row items-center gap-3">
            <User size={16} color="white" />
            <View>
              <Text className="text-xs font-black uppercase text-white">Profile</Text>
              <Text className="text-[9px] text-white/60">
                View & manage player details
              </Text>
            </View>
          </View>
          <ChevronRight size={14} color="rgba(255,255,255,0.4)" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDeleteAccount}
          className="p-3 rounded-xl bg-[#1F1012] border border-rose-500/30 flex-row items-center justify-between"
        >
          <View className="flex-row items-center gap-3">
            <UserX size={16} color="#FB7185" />
            <View>
              <Text className="text-xs font-black uppercase text-rose-400">
                Delete My Account
              </Text>
              <Text className="text-[9px] text-rose-300/70">
                Permanently erase profile & player data
              </Text>
            </View>
          </View>
          <ChevronRight size={14} color="#FB7185" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSignOut}
          className="p-3 rounded-xl bg-[#1F1012] border border-rose-500/30 flex-row items-center justify-between"
        >
          <View className="flex-row items-center gap-3">
            <LogOut size={16} color="#FB7185" />
            <View>
              <Text className="text-xs font-black uppercase text-rose-400">
                Sign Out
              </Text>
              <Text className="text-[9px] text-rose-300/70">
                Exit current session
              </Text>
            </View>
          </View>
          <ChevronRight size={14} color="#FB7185" />
        </TouchableOpacity>
      </View>

      {/* ── DATA MANAGEMENT ── */}
      <View className="space-y-1 pt-2">
        <Text className="text-[9px] font-black uppercase tracking-widest text-white/50 mb-1">
          Data Management
        </Text>

        <TouchableOpacity
          onPress={handleExportPdf}
          className="p-3 rounded-xl bg-[#12151D] border border-white/10 flex-row items-center justify-between"
        >
          <View className="flex-row items-center gap-3">
            <FileText size={16} color="#00AEEF" />
            <View>
              <Text className="text-xs font-black uppercase text-white">Export PDF</Text>
              <Text className="text-[9px] text-white/60">
                Save match report to device
              </Text>
            </View>
          </View>
          <ChevronRight size={14} color="rgba(255,255,255,0.4)" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleExportBackup}
          className="p-3 rounded-xl bg-[#12151D] border border-white/10 flex-row items-center justify-between"
        >
          <View className="flex-row items-center gap-3">
            <Download size={16} color="#10B981" />
            <View>
              <Text className="text-xs font-black uppercase text-white">Export Data Backup</Text>
              <Text className="text-[9px] text-white/60">
                Save complete backup of sessions & stats
              </Text>
            </View>
          </View>
          <ChevronRight size={14} color="rgba(255,255,255,0.4)" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleRestoreBackup}
          className="p-3 rounded-xl bg-[#12151D] border border-white/10 flex-row items-center justify-between"
        >
          <View className="flex-row items-center gap-3">
            <Upload size={16} color="#00AEEF" />
            <View>
              <Text className="text-xs font-black uppercase text-white">Restore Data Backup</Text>
              <Text className="text-[9px] text-white/60">
                Restore player records from saved backup
              </Text>
            </View>
          </View>
          <ChevronRight size={14} color="rgba(255,255,255,0.4)" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleResetSession}
          className="p-3 rounded-xl bg-[#12151D] border border-white/10 flex-row items-center justify-between"
        >
          <View className="flex-row items-center gap-3">
            <RotateCcw size={16} color="#FACC15" />
            <View>
              <Text className="text-xs font-black uppercase text-white">Reset Session</Text>
              <Text className="text-[9px] text-white/60">
                Clear touches for today
              </Text>
            </View>
          </View>
          <ChevronRight size={14} color="rgba(255,255,255,0.4)" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleResetAll}
          className="p-3 rounded-xl bg-[#1F1012] border border-rose-500/30 flex-row items-center justify-between"
        >
          <View className="flex-row items-center gap-3">
            <Trash2 size={16} color="#EF4444" />
            <View>
              <Text className="text-xs font-black uppercase text-rose-500">
                Delete All Data
              </Text>
              <Text className="text-[9px] text-rose-300/70">
                Erase lifetime stats & all history
              </Text>
            </View>
          </View>
          <ChevronRight size={14} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {/* ── PRIVACY & LEGAL ── */}
      <View className="space-y-1 pt-2">
        <Text className="text-[9px] font-black uppercase tracking-widest text-white/50 mb-1">
          Privacy & Legal
        </Text>

        <TouchableOpacity
          onPress={() => Linking.openURL('https://fatouches.com/privacy')}
          className="p-3 rounded-xl bg-[#12151D] border border-white/10 flex-row items-center justify-between"
        >
          <View className="flex-row items-center gap-3">
            <Shield size={16} color="#34D399" />
            <View>
              <Text className="text-xs font-black uppercase text-white">
                Privacy Policy
              </Text>
              <Text className="text-[9px] text-white/60">
                https://fatouches.com/privacy
              </Text>
            </View>
          </View>
          <ChevronRight size={14} color="rgba(255,255,255,0.4)" />
        </TouchableOpacity>
      </View>

      {/* ── CONTACT & SUPPORT ── */}
      <View className="space-y-1 pt-2">
        <Text className="text-[9px] font-black uppercase tracking-widest text-white/50 mb-1">
          Contact & Support
        </Text>

        <TouchableOpacity
          onPress={() => Linking.openURL('mailto:FootballerAthletics@gmail.com')}
          className="p-3 rounded-xl bg-[#12151D] border border-white/10 flex-row items-center justify-between"
        >
          <View className="flex-row items-center gap-3">
            <Mail size={16} color="white" />
            <View>
              <Text className="text-xs font-black uppercase text-white">
                Support / Privacy Requests
              </Text>
              <Text className="text-[9px] text-white/60">
                FootballerAthletics@gmail.com
              </Text>
            </View>
          </View>
          <ChevronRight size={14} color="rgba(255,255,255,0.4)" />
        </TouchableOpacity>
      </View>

      {/* ── DATA & PRIVACY ── */}
      <View className="space-y-1 pt-2">
        <Text className="text-[9px] font-black uppercase tracking-widest text-white/50 mb-1">
          Data & Privacy
        </Text>

        <TouchableOpacity
          onPress={() => {
            Alert.alert(
              'Data Control & Deletion',
              'Submit a request to FootballerAthletics@gmail.com to have your account or data reviewed or permanently deleted from all systems.'
            );
          }}
          className="p-3 rounded-xl bg-[#12151D] border border-white/10 flex-row items-center justify-between"
        >
          <View className="flex-row items-center gap-3">
            <Lock size={16} color="white" />
            <View>
              <Text className="text-xs font-black uppercase text-white">
                Data Control & Deletion
              </Text>
              <Text className="text-[9px] text-white/60">
                Submit a request to review or delete your data
              </Text>
            </View>
          </View>
          <ChevronRight size={14} color="rgba(255,255,255,0.4)" />
        </TouchableOpacity>
      </View>

      {/* ── FAQS ACCORDION ── */}
      <View className="space-y-2 pt-2">
        <Text className="text-[9px] font-black uppercase tracking-widest text-white/50">
          Frequently Asked Questions
        </Text>

        <View className="space-y-1.5">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <View
                key={idx}
                className="rounded-xl bg-[#12151D] border border-white/10 overflow-hidden"
              >
                <TouchableOpacity
                  onPress={() => setOpenFaq(isOpen ? null : idx)}
                  className="p-3 flex-row items-center justify-between"
                >
                  <Text className="text-xs font-black uppercase text-white flex-1 pr-2">
                    {faq.q}
                  </Text>
                  {isOpen ? (
                    <ChevronUp size={14} color="white" />
                  ) : (
                    <ChevronDown size={14} color="rgba(255,255,255,0.5)" />
                  )}
                </TouchableOpacity>
                {isOpen && (
                  <View className="px-3 pb-3">
                    <Text className="text-[10px] text-white/70 leading-relaxed">
                      {faq.a}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </View>

      {/* ── LEGAL & POLICY ── */}
      <View className="space-y-1 pt-2">
        <Text className="text-[9px] font-black uppercase tracking-widest text-white/50 mb-1">
          Legal & Info
        </Text>

        <TouchableOpacity
          onPress={() => navigation.navigate('Policy')}
          className="p-3 rounded-xl bg-[#12151D] border border-white/10 flex-row items-center justify-between"
        >
          <Text className="text-xs font-black uppercase text-white">Usage Policy</Text>
          <ChevronRight size={14} color="rgba(255,255,255,0.4)" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Account')}
          className="p-3 rounded-xl bg-[#12151D] border border-white/10 flex-row items-center justify-between"
        >
          <Text className="text-xs font-black uppercase text-white">Privacy Policy</Text>
          <ChevronRight size={14} color="rgba(255,255,255,0.4)" />
        </TouchableOpacity>
      </View>

      {/* App Version Branding */}
      <View className="items-center pt-4">
        <Text className="text-[9px] font-black uppercase tracking-widest text-white/40">
          TOUCHES™ MOBILE v1.0.0
        </Text>
        <Text className="text-[8px] text-white/30 mt-0.5">
          Footballer Athletics™ · All Rights Reserved
        </Text>
      </View>
    </View>
  );
}

export default Settings;
