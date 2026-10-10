import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Rect, Line, Circle } from 'react-native-svg';
import {
  Pointer,
  BarChart3,
  Brain,
  Star,
  LayoutGrid,
  Users,
  User,
  MessageSquare,
  ChevronRight,
  Zap,
  Activity,
  Trophy,
  Flame,
  Bot,
  Calendar,
} from 'lucide-react-native';
import { useActiveSession } from '../../hooks/useActiveSession';
import { useCumulativeStats } from '../../hooks/useCumulativeStats';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/db';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function PlayerDashboard() {
  const navigation = useNavigation();
  const { session, updateSession } = useActiveSession();
  const { user } = useAuth();
  const cumulativeStats = useCumulativeStats();

  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const [, setForceUpdate] = useState(0);

  const handleSelectSide = async (foot) => {
    try {
      const profileJson = await AsyncStorage.getItem('playerProfile');
      const savedProfile = profileJson ? JSON.parse(profileJson) : {};
      savedProfile.activeFooter = foot;
      await AsyncStorage.setItem('playerProfile', JSON.stringify(savedProfile));
    } catch (e) {}

    if (session?.id && updateSession) {
      await updateSession({ activeFooter: foot });
    }
    setForceUpdate((prev) => prev + 1);
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options = {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      };
      setCurrentTimeStr(now.toLocaleString('en-US', options));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const playerName =
    user?.name ||
    user?.fullName ||
    user?.playerName ||
    session?.playerName ||
    'Player';

  const activeFoot = (
    session?.activeFooter ||
    user?.footer ||
    user?.activeFooter ||
    'RIGHT'
  ).toUpperCase();
  const isRightFoot = activeFoot === 'RIGHT';

  const totalTouches = cumulativeStats.totalTouches || 0;
  const totalSessions = cumulativeStats.totalSessions || 0;
  const totalGoals = cumulativeStats.totalGoals || 0;
  const totalHoursTrained = cumulativeStats.totalHoursTrained || 0;

  return (
    <View className="space-y-3 pb-6">
      {/* ── GREEN STADIUM HERO BANNER ── */}
      <View className="relative rounded-2xl p-4 shadow-2xl overflow-hidden border border-emerald-500/30 bg-[#0F3E22]">
        {/* Pitch Lines Vector Background */}
        <View className="absolute inset-0 opacity-15 items-center justify-center">
          <Svg width="100%" height="100%" viewBox="0 0 300 360" fill="none">
            <Rect x="15" y="15" width="270" height="330" rx="6" stroke="#FFFFFF" strokeWidth="1.5" />
            <Line x1="15" y1="180" x2="285" y2="180" stroke="#FFFFFF" strokeWidth="1.5" />
            <Circle cx="150" cy="180" r="45" stroke="#FFFFFF" strokeWidth="1.5" />
            <Circle cx="150" cy="180" r="2" fill="#FFFFFF" />
            <Rect x="75" y="15" width="150" height="60" stroke="#FFFFFF" strokeWidth="1.5" />
            <Rect x="75" y="285" width="150" height="60" stroke="#FFFFFF" strokeWidth="1.5" />
          </Svg>
        </View>

        {/* Welcome Text + Stick Figure Icon */}
        <View className="flex-row items-start justify-between relative z-10 mb-3">
          <View className="space-y-0.5 flex-1 pr-2">
            <Text className="text-[11px] font-semibold text-emerald-300">
              Welcome back, player
            </Text>
            <Text
              className="text-2xl font-black uppercase text-white tracking-tight"
              numberOfLines={1}
            >
              {playerName}
            </Text>

            {/* Live Date Badge */}
            <View className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 border border-white/10 mt-1.5 self-start">
              <View className="w-2 h-2 rounded-full bg-red-500" />
              <Text className="text-[9px] font-medium text-emerald-300">
                {currentTimeStr || 'Live Training Session'}
              </Text>
            </View>
          </View>

          <View className="w-14 h-14 items-center justify-center">
            <Image
              source={
                isRightFoot
                  ? require('../../../assets/right_foot.png')
                  : require('../../../assets/left_foot.png')
              }
              className="w-14 h-14"
              style={{ tintColor: '#FFFFFF' }}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* 3 Top Stat Boxes */}
        <View className="flex-row gap-2 mb-3 relative z-10">
          <View className="flex-1 bg-black/45 border border-white/15 rounded-xl p-2.5 items-center">
            <Text className="text-xl font-black text-white">{totalTouches}</Text>
            <Text className="text-[8px] font-black uppercase tracking-widest text-emerald-400 mt-0.5">
              TOUCHES
            </Text>
          </View>

          <View className="flex-1 bg-black/45 border border-white/15 rounded-xl p-2.5 items-center">
            <Text className="text-xl font-black text-white">{totalSessions}</Text>
            <Text className="text-[8px] font-black uppercase tracking-widest text-emerald-400 mt-0.5">
              SESSIONS
            </Text>
          </View>

          <View className="flex-1 bg-black/45 border border-white/15 rounded-xl p-2.5 items-center">
            <Text className="text-xl font-black text-white">{totalGoals}</Text>
            <Text className="text-[8px] font-black uppercase tracking-widest text-emerald-400 mt-0.5">
              GOALS
            </Text>
          </View>
        </View>

        {/* Pick Your Side Card (Client Requested) */}
        <View className="relative z-10 bg-black/45 border border-white/15 rounded-xl p-3 space-y-2.5 shadow-lg">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-1.5">
              <View className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <Text className="text-[8.5px] font-black uppercase tracking-widest text-emerald-400">
                FOOTBALLER ATHLETICS CLUB • REGISTRY
              </Text>
            </View>
            <View className="px-2 py-0.5 rounded-full bg-white/10">
              <Text className="text-[7.5px] font-black uppercase text-white/80">
                {isRightFoot ? 'Right Foot Dominant' : 'Left Foot Dominant'}
              </Text>
            </View>
          </View>

          <View>
            <Text className="text-base font-black uppercase text-white tracking-wide">
              Pick Your Side
            </Text>
            <Text className="text-[9.5px] text-white/70 font-semibold pt-0.5">
              Are you a Left or Right Footer? Choose your dominant foot for training & match tracking.
            </Text>
          </View>

          {/* Interactive Foot Buttons */}
          <View className="flex-row gap-2 pt-0.5">
            <TouchableOpacity
              onPress={() => handleSelectSide('LEFT')}
              activeOpacity={0.8}
              className={`flex-1 py-2 px-3 rounded-xl flex-row items-center justify-center gap-2 border ${
                activeFoot === 'LEFT'
                  ? 'bg-[#FF4422] border-[#FF4422]'
                  : 'bg-black/40 border-white/15'
              }`}
            >
              <View className="w-4 h-4 rounded-full border border-white items-center justify-center p-0.5">
                <Image
                  source={require('../../../assets/left_foot.png')}
                  className="w-3 h-3"
                  resizeMode="contain"
                  style={{ tintColor: '#FFFFFF' }}
                />
              </View>
              <Text className="text-white text-xs font-black uppercase tracking-wider">
                LEFT FOOTER
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleSelectSide('RIGHT')}
              activeOpacity={0.8}
              className={`flex-1 py-2 px-3 rounded-xl flex-row items-center justify-center gap-2 border ${
                activeFoot === 'RIGHT'
                  ? 'bg-[#00AEEF] border-[#00AEEF]'
                  : 'bg-black/40 border-white/15'
              }`}
            >
              <View className="w-4 h-4 rounded-full border border-white items-center justify-center p-0.5">
                <Image
                  source={require('../../../assets/right_foot.png')}
                  className="w-3 h-3"
                  resizeMode="contain"
                  style={{ tintColor: '#FFFFFF' }}
                />
              </View>
              <Text className="text-white text-xs font-black uppercase tracking-wider">
                RIGHT FOOTER
              </Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center gap-1 pt-1 border-t border-white/10">
            <Zap size={11} color="#FACC15" />
            <Text className="text-[8px] font-bold text-white/60">
              Active Selection:{' '}
              <Text style={{ color: isRightFoot ? '#00AEEF' : '#FF4422', fontWeight: '900' }}>
                {isRightFoot ? 'RIGHT FOOTER' : 'LEFT FOOTER'}
              </Text>
            </Text>
          </View>
        </View>
      </View>

      {/* ── YOUR TOOLS NAVIGATION SECTION ── */}
      <View className="space-y-2.5 pt-1">
        <Text
          style={{ letterSpacing: 2 }}
          className="text-[11px] font-black uppercase text-white/70 px-0.5"
        >
          YOUR TOOLS
        </Text>

        {/* 2-Column Tools Grid using Row Pairs with flex: 1 */}
        {[
          [
            {
              name: 'Touch Counter',
              subtitle: 'Track every action live',
              route: 'TouchCounter',
              icon: Pointer,
              color: '#FF4422',
              borderHighlight: true,
            },
            {
              name: 'Player Stats',
              subtitle: 'Lifetime totals',
              route: 'Stats',
              icon: BarChart3,
              color: '#00AEEF',
            },
          ],
          [
            {
              name: 'Player Passport',
              subtitle: 'Your player ID',
              route: 'Passport',
              icon: User,
              color: '#E8470A',
            },
            {
              name: '30-Day Challenge',
              subtitle: 'Daily skills & drills',
              route: 'Challenge',
              icon: Flame,
              color: '#10B981',
            },
          ],
          [
            {
              name: 'Reflection',
              subtitle: 'Post-match review',
              route: 'Reflection',
              icon: Brain,
              color: '#10B981',
            },
            {
              name: 'Evaluation',
              subtitle: 'Grade your game',
              route: 'Evaluation',
              icon: Star,
              color: '#F59E0B',
            },
          ],
          [
            {
              name: 'Lineup',
              subtitle: 'Team sheet',
              route: 'Lineup',
              icon: LayoutGrid,
              color: '#3B82F6',
            },
            {
              name: 'Roster',
              subtitle: 'Grade all players',
              route: 'Grade',
              icon: Users,
              color: '#8B5CF6',
            },
          ],
          [
            {
              name: 'AI Player Agent',
              subtitle: 'Personal mentor',
              route: 'AiAgent',
              icon: Bot,
              color: '#FF4422',
              textColor: '#FACC15',
              borderStyle: 'border-yellow-500/40',
            },
            {
              name: 'Match Day Prep',
              subtitle: 'Fixture & checklist',
              route: 'MatchPrep',
              icon: Calendar,
              color: '#FACC15',
              textColor: '#FACC15',
              borderStyle: 'border-yellow-500/40',
            },
          ],
        ].map((pair, rowIndex) => (
          <View key={rowIndex} style={{ flexDirection: 'row', gap: 10 }}>
            {pair.map((item) => {
              const IconComp = item.icon;
              return (
                <TouchableOpacity
                  key={item.name}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate(item.route)}
                  style={{ flex: 1 }}
                  className={`p-3 rounded-xl ${
                    item.borderHighlight
                      ? 'border-2 border-[#FF4422]/60 bg-[#12151D]'
                      : item.borderStyle
                      ? `border ${item.borderStyle} bg-[#12151D]`
                      : 'border border-white/10 bg-[#12151D]'
                  } space-y-1.5`}
                >
                  <View
                    className="w-8 h-8 rounded-lg items-center justify-center"
                    style={{ backgroundColor: `${item.color}20` }}
                  >
                    <IconComp size={16} color={item.color} />
                  </View>
                  <View>
                    <Text
                      numberOfLines={1}
                      className={`text-xs font-black uppercase tracking-wider ${
                        item.textColor ? 'text-yellow-400' : 'text-white'
                      }`}
                    >
                      {item.name}
                    </Text>
                    <Text
                      numberOfLines={1}
                      className="text-[8.5px] text-white/60 font-medium"
                    >
                      {item.subtitle}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        {/* Note to Coach (Full Width) */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('NoteToCoach')}
          className="w-full p-3 rounded-xl border border-white/10 bg-[#12151D] flex-row items-center justify-between"
        >
          <View className="flex-row items-center gap-2.5">
            <View className="w-8 h-8 rounded-lg bg-[#10B981]/20 items-center justify-center">
              <MessageSquare size={16} color="#10B981" />
            </View>
            <View>
              <Text className="text-xs font-black uppercase tracking-wider text-white">
                Note to Coach
              </Text>
              <Text className="text-[8.5px] text-white/60 font-medium">
                Feedback & requests — direct
              </Text>
            </View>
          </View>
          <ChevronRight size={16} color="rgba(255,255,255,0.4)" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default PlayerDashboard;
