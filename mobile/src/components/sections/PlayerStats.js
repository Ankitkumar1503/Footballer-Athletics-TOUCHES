import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Image, Alert } from 'react-native';
import Svg, { Rect, Line, Circle } from 'react-native-svg';
import { ShieldCheck, Edit2 } from 'lucide-react-native';
import { useActiveSession } from '../../hooks/useActiveSession';
import { useCumulativeStats } from '../../hooks/useCumulativeStats';
import { SectionActionBar } from '../ui/SectionActionBar';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function PlayerStats() {
  const { session, updateSession } = useActiveSession();
  const cumulativeStats = useCumulativeStats();

  const [formData, setFormData] = useState({
    fullName: '',
    totalTouches: '',
    totalYearsPlaying: '',
    totalHoursTrained: '',
    totalSessions: '',
    totalGames: '',
    totalGoals: '',
    totalPenalties: '',
    totalCornerKicks: '',
    totalThrowIns: '',
    shotsOnTarget: '',
    tacklesMade: '',
    headers: '',
    yellowCards: '',
    redCards: '',
    subIn: '',
    subOut: '',
    injured: '',
    missedGames: '',
    freeKicks: '',
    recoveryDays: '',
    keepUpFeet: '',
    keepUpHead: '',
    activeFooter: 'RIGHT',
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const savedProfileJson = await AsyncStorage.getItem('playerProfile');
        const savedCareerJson = await AsyncStorage.getItem('playerCareerStats');
        let data = {};
        if (savedProfileJson) data = { ...data, ...JSON.parse(savedProfileJson) };
        if (savedCareerJson) data = { ...data, ...JSON.parse(savedCareerJson) };

        setFormData((prev) => ({ ...prev, ...data }));
      } catch (e) {
        console.error('Error loading career stats:', e);
      }
    }
    loadStats();
  }, []);

  const careerKeys = [
    'totalTouches',
    'totalYearsPlaying',
    'totalHoursTrained',
    'totalSessions',
    'totalGames',
    'totalGoals',
    'totalPenalties',
    'totalCornerKicks',
    'totalThrowIns',
    'shotsOnTarget',
    'tacklesMade',
    'headers',
    'yellowCards',
    'redCards',
    'subIn',
    'subOut',
    'injured',
    'missedGames',
    'freeKicks',
    'recoveryDays',
    'keepUpFeet',
    'keepUpHead',
  ];

  const handleChange = async (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);

    try {
      const careerData = {};
      careerKeys.forEach((k) => {
        if (updated[k] !== undefined) careerData[k] = updated[k];
      });
      await AsyncStorage.setItem('playerCareerStats', JSON.stringify(careerData));

      if (field === 'activeFooter' || field === 'fullName') {
        const profileJson = await AsyncStorage.getItem('playerProfile');
        const profileData = profileJson ? JSON.parse(profileJson) : {};
        profileData.activeFooter = updated.activeFooter;
        if (updated.fullName) profileData.fullName = updated.fullName;
        await AsyncStorage.setItem('playerProfile', JSON.stringify(profileData));
        updateSession({ activeFooter: updated.activeFooter, playerName: updated.fullName });
      }
    } catch (e) {
      console.error('Error saving career stats:', e);
    }
  };

  const handleSave = async () => {
    try {
      const careerData = {};
      careerKeys.forEach((k) => {
        if (formData[k] !== undefined) careerData[k] = formData[k];
      });
      await AsyncStorage.setItem('playerCareerStats', JSON.stringify(careerData));
    } catch (e) {
      console.error('Error saving career stats:', e);
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Player Stats',
      'Are you sure you want to reset all Player Stats? This will clear your custom career and development stats.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('playerCareerStats');
              setFormData((prev) => ({
                ...prev,
                totalTouches: '',
                totalYearsPlaying: '',
                totalHoursTrained: '',
                totalSessions: '',
                totalGames: '',
                totalGoals: '',
                totalPenalties: '',
                totalCornerKicks: '',
                totalThrowIns: '',
                shotsOnTarget: '',
                tacklesMade: '',
                headers: '',
                yellowCards: '',
                redCards: '',
                subIn: '',
                subOut: '',
                injured: '',
                missedGames: '',
                freeKicks: '',
                recoveryDays: '',
                keepUpFeet: '',
                keepUpHead: '',
              }));
            } catch (e) {
              console.error('Error resetting player stats:', e);
            }
          },
        },
      ]
    );
  };

  const handleFootSelect = (foot) => {
    handleChange('activeFooter', foot);
  };

  const resolveValue = (formVal, cumulativeVal, fallback = 0) => {
    if (formVal !== undefined && formVal !== null && formVal !== '') {
      return formVal;
    }
    if (cumulativeVal !== undefined && cumulativeVal !== null && cumulativeVal !== '') {
      return cumulativeVal;
    }
    return fallback;
  };

  const playerName = formData.fullName || session?.playerName || 'PLAYER';
  const activeFoot = (formData.activeFooter || session?.activeFooter || 'RIGHT').toUpperCase();
  const isRightFoot = activeFoot === 'RIGHT';

  const liveTouches = resolveValue(formData.totalTouches, cumulativeStats.totalTouches, 0);
  const liveSessions = resolveValue(formData.totalSessions, cumulativeStats.totalSessions, 0);
  const liveGoals = resolveValue(formData.totalGoals, cumulativeStats.totalGoals, 0);
  const liveHours = resolveValue(formData.totalHoursTrained, cumulativeStats.totalHoursTrained, 0);

  const todayStr = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const StatCard = ({ id, label, displayValue, rawValue, isYellow = false, colorClass = '#FFFFFF' }) => (
    <View
      style={{ flex: 1 }}
      className="p-3 rounded-xl bg-[#12151D] justify-between border border-white/10"
    >
      <Text
        numberOfLines={1}
        className={`text-[8.5px] font-black uppercase tracking-wider mb-1 ${
          isYellow ? 'text-yellow-400' : 'text-white/60'
        }`}
      >
        {label}
      </Text>
      <View className="flex-row items-center justify-between gap-2 pt-1">
        <Text
          numberOfLines={1}
          style={{ color: colorClass }}
          className="text-xl font-black"
        >
          {displayValue !== undefined && displayValue !== null && displayValue !== '' ? displayValue : 0}
        </Text>
        <TextInput
          placeholder="0"
          placeholderTextColor="rgba(255,255,255,0.3)"
          keyboardType="numeric"
          value={rawValue !== undefined && rawValue !== null && rawValue !== '' ? String(rawValue) : ''}
          onChangeText={(val) => handleChange(id, val)}
          className="w-12 bg-black/40 text-xs font-bold text-center py-1 px-1 rounded-lg border border-white/15 text-white"
        />
      </View>
    </View>
  );

  return (
    <View className="space-y-4 pb-6">
      {/* ── Title Header ── */}
      <View className="flex-row items-center justify-between py-1">
        <Text className="text-xl font-black uppercase text-white tracking-wider">
          PLAYER STATS
        </Text>
        <View className="flex-row items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
          <ShieldCheck size={12} color="#34D399" />
          <Text className="text-emerald-400 text-[8.5px] font-black uppercase">
            ON-DEVICE LIFETIME DATA
          </Text>
        </View>
      </View>

      {/* ── GREEN STADIUM CARD ── */}
      <View className="relative rounded-2xl p-4 shadow-2xl overflow-hidden border border-emerald-500/30 bg-[#0F3E22] space-y-3">
        {/* Pitch Lines Vector Background */}
        <View className="absolute inset-0 opacity-15 items-center justify-center pointer-events-none">
          <Svg width="100%" height="100%" viewBox="0 0 300 360" fill="none">
            <Rect x="15" y="15" width="270" height="330" rx="6" stroke="#FFFFFF" strokeWidth="1.5" />
            <Line x1="15" y1="180" x2="285" y2="180" stroke="#FFFFFF" strokeWidth="1.5" />
            <Circle cx="150" cy="180" r="45" stroke="#FFFFFF" strokeWidth="1.5" />
            <Circle cx="150" cy="180" r="2" fill="#FFFFFF" />
            <Rect x="75" y="15" width="150" height="60" stroke="#FFFFFF" strokeWidth="1.5" />
            <Rect x="75" y="285" width="150" height="60" stroke="#FFFFFF" strokeWidth="1.5" />
          </Svg>
        </View>

        {/* Top Header Row */}
        <View className="flex-row items-start justify-between relative z-10">
          <View>
            <Text className="text-[9px] font-bold uppercase tracking-widest text-emerald-300">
              PLAYER
            </Text>
            <Text className="text-2xl font-black uppercase text-white tracking-tight">
              {playerName}
            </Text>
            <Text className="text-[10px] font-medium text-emerald-200 mt-0.5">
              {todayStr}
            </Text>
          </View>

          <View className="w-14 h-14 items-center justify-center">
            <Image
              source={
                isRightFoot
                  ? require('../../../assets/right_foot.png')
                  : require('../../../assets/left_foot.png')
              }
              className="w-14 h-14"
              resizeMode="contain"
              style={{ tintColor: '#FFFFFF' }}
            />
          </View>
        </View>

        {/* 3 Middle Stat Boxes */}
        <View className="flex-row gap-2 relative z-10">
          <View className="flex-1 bg-black/45 border border-white/15 rounded-xl p-2 items-center">
            <Text className="text-xl font-black text-white">{liveTouches}</Text>
            <Text className="text-[8px] font-black uppercase tracking-widest text-emerald-400 mt-0.5">
              TOUCHES
            </Text>
          </View>
          <View className="flex-1 bg-black/45 border border-white/15 rounded-xl p-2 items-center">
            <Text className="text-xl font-black text-white">{liveSessions}</Text>
            <Text className="text-[8px] font-black uppercase tracking-widest text-emerald-400 mt-0.5">
              SESSIONS
            </Text>
          </View>
          <View className="flex-1 bg-black/45 border border-white/15 rounded-xl p-2 items-center">
            <Text className="text-xl font-black text-white">{liveGoals}</Text>
            <Text className="text-[8px] font-black uppercase tracking-widest text-emerald-400 mt-0.5">
              GOALS
            </Text>
          </View>
        </View>

        {/* Foot Preference Selector */}
        <View className="flex-row gap-2.5 pt-1 relative z-10">
          <TouchableOpacity
            onPress={() => handleFootSelect('LEFT')}
            className={`flex-1 py-2 px-3 rounded-xl flex-row items-center justify-center gap-2 border ${
              activeFoot === 'LEFT'
                ? 'bg-white/20 border-white/40 shadow-md'
                : 'bg-black/30 border-white/10'
            }`}
          >
            <View className="w-5 h-5 rounded-full border border-white items-center justify-center p-0.5">
              <Image
                source={require('../../../assets/left_foot.png')}
                className="w-3.5 h-3.5"
                resizeMode="contain"
                style={{ tintColor: '#FFFFFF' }}
              />
            </View>
            <Text className="text-white text-xs font-black uppercase tracking-wider">
              LEFT FOOTER
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleFootSelect('RIGHT')}
            className={`flex-1 py-2 px-3 rounded-xl flex-row items-center justify-center gap-2 border ${
              activeFoot === 'RIGHT'
                ? 'bg-white/20 border-white/40 shadow-md'
                : 'bg-black/30 border-white/10'
            }`}
          >
            <View className="w-5 h-5 rounded-full border border-white items-center justify-center p-0.5">
              <Image
                source={require('../../../assets/right_foot.png')}
                className="w-3.5 h-3.5"
                resizeMode="contain"
                style={{ tintColor: '#FFFFFF' }}
              />
            </View>
            <Text className="text-white text-xs font-black uppercase tracking-wider">
              RIGHT FOOTER
            </Text>
          </TouchableOpacity>
        </View>

        {/* Community Footers Breakdown */}
        <View className="space-y-1.5 pt-1 border-t border-white/10 relative z-10">
          <View className="flex-row justify-between">
            <View>
              <Text className="text-lg font-black text-[#FF4422]">12,847</Text>
              <Text className="text-[7.5px] font-black uppercase tracking-wider text-[#FF4422]">
                LEFT FOOTERS
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-lg font-black text-[#00AEEF]">19,204</Text>
              <Text className="text-[7.5px] font-black uppercase tracking-wider text-[#00AEEF]">
                RIGHT FOOTERS
              </Text>
            </View>
          </View>
          <View className="w-full h-2 bg-black/50 rounded-full overflow-hidden flex-row">
            <View className="h-full bg-[#FF4422] w-[40%]" />
            <View className="h-full bg-[#00AEEF] w-[60%]" />
          </View>
        </View>
      </View>

      {/* ── QUICK STATS SECTION ── */}
      <View className="space-y-2.5 pt-1">
        <Text className="text-xs font-black uppercase tracking-wider text-white px-0.5">
          QUICK STATS
        </Text>

        {[
          [
            {
              label: 'TODAYS TOUCHES',
              value: cumulativeStats.todayTouches || 0,
            },
            {
              label: 'TOUCHES THIS WEEK',
              value: cumulativeStats.weekTouches || 0,
            },
          ],
          [
            {
              label: 'TOUCHES THIS MONTH',
              value: cumulativeStats.monthTouches || 0,
            },
            {
              label: 'TOUCHES THIS SEASON',
              value: liveTouches,
            },
          ],
        ].map((pair, rowIndex) => (
          <View key={rowIndex} style={{ flexDirection: 'row', gap: 10 }}>
            {pair.map((item) => (
              <View
                key={item.label}
                style={{ flex: 1 }}
                className="p-3 rounded-xl border border-white/10 bg-[#12151D] space-y-1"
              >
                <Text
                  numberOfLines={1}
                  className="text-[9px] font-black uppercase tracking-wider text-white/60"
                >
                  {item.label}
                </Text>
                <Text
                  numberOfLines={1}
                  className="text-2xl font-black text-white"
                >
                  {item.value}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </View>

      {/* ── CAREER TOTALS — TAP A NUMBER TO EDIT ── */}
      <View className="space-y-2.5 pt-2">
        <View className="flex-row items-center justify-between px-1">
          <Text
            style={{ letterSpacing: 2 }}
            className="text-[11px] font-black uppercase text-white/70"
          >
            CAREER TOTALS — TAP TO EDIT
          </Text>
          <Edit2 size={12} color="rgba(255,255,255,0.4)" />
        </View>

        {[
          [
            {
              id: 'totalTouches',
              label: 'TOTAL TOUCHES (LIFETIME)',
              displayValue: resolveValue(formData.totalTouches, cumulativeStats.totalTouches ?? liveTouches),
              rawValue: formData.totalTouches,
            },
            {
              id: 'totalGoals',
              label: 'GOALS SCORED',
              displayValue: resolveValue(formData.totalGoals, cumulativeStats.totalGoals),
              rawValue: formData.totalGoals,
            },
          ],
          [
            {
              id: 'totalGames',
              label: 'TOTAL GAMES',
              displayValue: resolveValue(formData.totalGames, cumulativeStats.totalGames),
              rawValue: formData.totalGames,
            },
            {
              id: 'shotsOnTarget',
              label: 'SHOTS ON TARGET',
              displayValue: resolveValue(formData.shotsOnTarget, cumulativeStats.shotsOnTarget),
              rawValue: formData.shotsOnTarget,
            },
          ],
          [
            {
              id: 'tacklesMade',
              label: 'TACKLES MADE',
              displayValue: resolveValue(formData.tacklesMade, cumulativeStats.tacklesMade),
              rawValue: formData.tacklesMade,
            },
            {
              id: 'totalPenalties',
              label: 'PENALTIES TAKEN',
              displayValue: resolveValue(formData.totalPenalties, cumulativeStats.totalPenalties),
              rawValue: formData.totalPenalties,
            },
          ],
          [
            {
              id: 'totalCornerKicks',
              label: 'CORNER KICKS',
              displayValue: resolveValue(formData.totalCornerKicks, cumulativeStats.totalCornerKicks),
              rawValue: formData.totalCornerKicks,
            },
            {
              id: 'totalThrowIns',
              label: 'THROW-INS',
              displayValue: resolveValue(formData.totalThrowIns, cumulativeStats.totalThrowIns),
              rawValue: formData.totalThrowIns,
            },
          ],
          [
            {
              id: 'headers',
              label: 'HEADERS',
              displayValue: resolveValue(formData.headers, cumulativeStats.headers),
              rawValue: formData.headers,
            },
            {
              id: 'freeKicks',
              label: 'FREE KICKS',
              displayValue: resolveValue(formData.freeKicks, cumulativeStats.freeKicks),
              rawValue: formData.freeKicks,
            },
          ],
        ].map((pair, rowIndex) => (
          <View key={rowIndex} style={{ flexDirection: 'row', gap: 10 }}>
            {pair.map((item) => (
              <StatCard
                key={item.id}
                id={item.id}
                label={item.label}
                displayValue={item.displayValue}
                rawValue={item.rawValue}
                isYellow={item.isYellow}
                colorClass={item.colorClass || '#FFFFFF'}
              />
            ))}
          </View>
        ))}
      </View>

      {/* ── DEVELOPMENT SECTION ── */}
      <View className="space-y-2.5 pt-2">
        <Text
          style={{ letterSpacing: 2 }}
          className="text-[11px] font-black uppercase text-white/70 px-1"
        >
          DEVELOPMENT
        </Text>

        {[
          // Row 1: Yellow Card | Red Card
          [
            {
              id: 'yellowCards',
              label: 'YELLOW CARD',
              displayValue: resolveValue(formData.yellowCards, cumulativeStats.yellowCards),
              rawValue: formData.yellowCards,
              colorClass: '#FACC15',
              isYellow: true,
            },
            {
              id: 'redCards',
              label: 'RED CARD',
              displayValue: resolveValue(formData.redCards, cumulativeStats.redCards),
              rawValue: formData.redCards,
              colorClass: '#EF4444',
            },
          ],
          // Row 2: Sub In | Sub Out
          [
            {
              id: 'subIn',
              label: 'SUB IN',
              displayValue: resolveValue(formData.subIn, cumulativeStats.subIn),
              rawValue: formData.subIn,
            },
            {
              id: 'subOut',
              label: 'SUB OUT',
              displayValue: resolveValue(formData.subOut, cumulativeStats.subOut),
              rawValue: formData.subOut,
            },
          ],
          // Row 3: Injured | Missed Game
          [
            {
              id: 'injured',
              label: 'INJURED',
              displayValue: resolveValue(formData.injured, cumulativeStats.injured),
              rawValue: formData.injured,
            },
            {
              id: 'missedGames',
              label: 'MISSED GAME',
              displayValue: resolveValue(formData.missedGames, cumulativeStats.missedGames),
              rawValue: formData.missedGames,
            },
          ],
          // Row 4: Years Playing | Hours Trained
          [
            {
              id: 'totalYearsPlaying',
              label: 'YEARS PLAYING',
              displayValue: resolveValue(formData.totalYearsPlaying, null),
              rawValue: formData.totalYearsPlaying,
            },
            {
              id: 'totalHoursTrained',
              label: 'HOURS TRAINED',
              displayValue: resolveValue(formData.totalHoursTrained, cumulativeStats.totalHoursTrained ?? liveHours),
              rawValue: formData.totalHoursTrained,
            },
          ],
          // Row 5: Keep-Up-Feet | Keep-Up-Head
          [
            {
              id: 'keepUpFeet',
              label: 'KEEP-UP-FEET',
              displayValue: resolveValue(formData.keepUpFeet, cumulativeStats.keepUpFeet),
              rawValue: formData.keepUpFeet,
            },
            {
              id: 'keepUpHead',
              label: 'KEEP-UP-HEAD',
              displayValue: resolveValue(formData.keepUpHead, cumulativeStats.keepUpHead),
              rawValue: formData.keepUpHead,
            },
          ],
          // Row 6: Total Sessions | Recovery Days
          [
            {
              id: 'totalSessions',
              label: 'TOTAL SESSIONS',
              displayValue: resolveValue(formData.totalSessions, cumulativeStats.totalSessions ?? liveSessions),
              rawValue: formData.totalSessions,
            },
            {
              id: 'recoveryDays',
              label: 'RECOVERY DAYS',
              displayValue: resolveValue(formData.recoveryDays, null),
              rawValue: formData.recoveryDays,
            },
          ],
        ].map((pair, rowIndex) => (
          <View key={rowIndex} style={{ flexDirection: 'row', gap: 10 }}>
            {pair.map((item) => (
              <StatCard
                key={item.id}
                id={item.id}
                label={item.label}
                displayValue={item.displayValue}
                rawValue={item.rawValue}
                isYellow={item.isYellow}
                colorClass={item.colorClass || '#FFFFFF'}
              />
            ))}
          </View>
        ))}
      </View>

      {/* Action Bar */}
      <SectionActionBar
        sectionKey="stats"
        data={formData}
        onSave={handleSave}
        onReset={handleReset}
      />
    </View>
  );
}

export default PlayerStats;
