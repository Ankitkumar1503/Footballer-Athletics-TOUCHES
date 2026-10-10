import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Image } from 'react-native';
import { User, ShieldCheck } from 'lucide-react-native';
import { useActiveSession } from '../../hooks/useActiveSession';
import { useCumulativeStats } from '../../hooks/useCumulativeStats';
import { SectionActionBar } from '../ui/SectionActionBar';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function PlayerPassport() {
  const { session, updateSession } = useActiveSession();
  const cumulativeStats = useCumulativeStats();

  const [formData, setFormData] = useState({
    fullName: '',
    club: '',
    position: '',
    team: '',
    activeFooter: 'RIGHT',
    dateOfBirth: '',
    placeOfBirth: '',
    country: '',
    favoriteTeam: '',
    favoritePlayer: '',
    instagram: '',
    level: '',
    division: '',
  });

  useEffect(() => {
    async function loadData() {
      try {
        const saved = await AsyncStorage.getItem('playerProfile');
        if (saved) {
          const parsed = JSON.parse(saved);
          setFormData((prev) => ({ ...prev, ...parsed }));
        }
      } catch (e) {
        console.error('Error loading passport data:', e);
      }
    }
    loadData();
  }, []);

  const handleChange = async (id, value) => {
    const updated = { ...formData, [id]: value };
    setFormData(updated);
    try {
      await AsyncStorage.setItem('playerProfile', JSON.stringify(updated));
      if (session?.id) {
        updateSession({
          playerName: updated.fullName,
          club: updated.club,
          team: updated.team,
          position: updated.position,
          activeFooter: updated.activeFooter,
        });
      }
    } catch (e) {
      console.error('Error saving passport data:', e);
    }
  };

  const playerName = formData.fullName || session?.playerName || 'PLAYER';
  const playerClub = formData.club || 'Club Unassigned';
  const playerPosition = formData.position ? `#${formData.position}` : 'Position';

  const activeFoot = (formData.activeFooter || session?.activeFooter || 'RIGHT').toUpperCase();
  const isRightFoot = activeFoot === 'RIGHT';

  const lifetimeTouches = cumulativeStats.totalTouches || 0;
  const totalGoals = cumulativeStats.totalGoals || 0;
  const totalGames = cumulativeStats.totalGames || 0;

  const playerAge = formData.age || session?.age;
  const isUnder13 = playerAge && parseInt(playerAge, 10) < 13;

  const passportFields = [
    ...(!isUnder13 ? [{ id: 'dateOfBirth', label: 'DATE OF BIRTH', placeholder: 'YYYY-MM-DD' }] : []),
    { id: 'placeOfBirth', label: 'PLACE OF BIRTH', placeholder: 'City, Country' },
    { id: 'country', label: 'COUNTRY', placeholder: 'Nation' },
    { id: 'club', label: 'CLUB', placeholder: 'Current Club' },
    { id: 'team', label: 'TEAM', placeholder: 'Current Team' },
    { id: 'position', label: 'POSITION', placeholder: 'e.g. ST, CAM, CB' },
    { id: 'favoriteTeam', label: 'FAVOURITE TEAM', placeholder: 'Favorite Team' },
    { id: 'favoritePlayer', label: 'FAVOURITE PLAYER', placeholder: 'Favorite Player' },
    ...(!isUnder13 ? [{ id: 'instagram', label: 'INSTAGRAM', placeholder: '@username' }] : []),
    { id: 'level', label: 'LEVEL', placeholder: 'Academy / Semi-Pro / Pro' },
    { id: 'division', label: 'DIVISION', placeholder: 'U-18 / Tier 1' },
  ];

  return (
    <View className="space-y-3.5 pb-6">
      {/* ── Title Header ── */}
      <View className="flex-row items-center justify-between py-1">
        <Text className="text-xl font-black uppercase text-white tracking-wider">
          PLAYER PASSPORT
        </Text>
        <View className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
          <ShieldCheck size={12} color="#34D399" />
          <Text className="text-emerald-400 text-[8.5px] font-black uppercase">
            PLAYER ID
          </Text>
        </View>
      </View>

      {/* ── PASSPORT CARD CONTAINER ── */}
      <View className="rounded-2xl overflow-hidden border border-white/15 bg-[#0F121A] shadow-xl">
        {/* Passport Card Header (Orange/Red) */}
        <View className="p-4 bg-[#E8470A] flex-row items-center justify-between">
          <View className="flex-row items-center gap-3 flex-1 pr-2">
            <View className="w-11 h-11 rounded-full bg-white/20 border border-white/40 items-center justify-center shadow-inner">
              <User size={20} color="white" />
            </View>

            <View className="flex-1">
              <Text className="text-[7.5px] font-black uppercase tracking-widest text-white/80">
                TOUCHES™ · FOOTBALLER ATHLETICS™
              </Text>
              <Text
                className="text-xl font-black uppercase text-white tracking-tight"
                numberOfLines={1}
              >
                {playerName}
              </Text>
              <Text className="text-[10px] font-semibold text-white/90">
                {playerClub} · {playerPosition}
              </Text>
              <Text className="text-[8.5px] font-black uppercase tracking-wider text-white/95 mt-0.5">
                👟 {isRightFoot ? 'RIGHT FOOTER' : 'LEFT FOOTER'}
              </Text>
            </View>
          </View>

          <View className="w-12 h-12 items-center justify-center">
            <Image
              source={
                isRightFoot
                  ? require('../../../assets/right_foot.png')
                  : require('../../../assets/left_foot.png')
              }
              className="w-12 h-12"
              style={{ tintColor: '#FFFFFF' }}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Passport Data Rows */}
        <View className="px-3 py-1">
          {passportFields.map((field) => (
            <View
              key={field.id}
              className="py-2 flex-row items-center justify-between border-b border-white/5"
            >
              <Text className="font-black uppercase tracking-wider text-white/60 text-[9px] w-28">
                {field.label}
              </Text>
              <TextInput
                value={formData[field.id] || ''}
                onChangeText={(val) => handleChange(field.id, val)}
                placeholder={field.placeholder}
                placeholderTextColor="rgba(255,255,255,0.2)"
                className="flex-1 bg-black/40 text-white font-semibold text-xs text-right py-1 px-2.5 rounded-lg border border-white/10"
              />
            </View>
          ))}
        </View>

        {/* Passport Footer Bar */}
        <View className="p-2.5 bg-black/50 border-t border-white/10 flex-row items-center justify-between">
          <Text className="text-[8px] font-black uppercase tracking-widest text-white/40">
            TOUCHES™ PLAYER PASSPORT
          </Text>
          <Text className="text-[8px] font-black uppercase tracking-widest text-white/40">
            FA-2026-P-001
          </Text>
        </View>
      </View>

      {/* ── 3 BOTTOM STAT CARDS ── */}
      <View className="flex-row gap-2 pt-1">
        <View className="flex-1 p-2.5 rounded-xl border border-white/10 bg-[#12151D] items-center space-y-0.5">
          <Text className="text-xl font-black text-[#FF4422]">{lifetimeTouches}</Text>
          <Text className="text-[7.5px] font-black uppercase tracking-widest text-white/50">
            LIFETIME TOUCHES
          </Text>
        </View>

        <View className="flex-1 p-2.5 rounded-xl border border-white/10 bg-[#12151D] items-center space-y-0.5">
          <Text className="text-xl font-black text-[#10B981]">{totalGoals}</Text>
          <Text className="text-[7.5px] font-black uppercase tracking-widest text-white/50">
            GOALS
          </Text>
        </View>

        <View className="flex-1 p-2.5 rounded-xl border border-white/10 bg-[#12151D] items-center space-y-0.5">
          <Text className="text-xl font-black text-[#00AEEF]">{totalGames}</Text>
          <Text className="text-[7.5px] font-black uppercase tracking-widest text-white/50">
            GAMES
          </Text>
        </View>
      </View>

      {/* Action Bar */}
      <SectionActionBar sectionKey="passport" data={formData} />
    </View>
  );
}

export default PlayerPassport;
