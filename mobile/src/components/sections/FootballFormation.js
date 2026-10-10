import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, TouchableOpacity } from 'react-native';
import Svg, { Rect, Line, Circle } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useActiveSession } from '../../hooks/useActiveSession';
import { SectionActionBar } from '../ui/SectionActionBar';

export const FORMATIONS_DATA = {
  '4-3-3': {
    name: '4-3-3',
    pitchPositions: [
      { number: 9, label: 'ST', top: 25, left: 50 },
      { number: 11, label: 'LW', top: 32, left: 24 },
      { number: 7, label: 'RW', top: 32, left: 76 },
      { number: 10, label: 'CM', top: 52, left: 30 },
      { number: 6, label: 'DM', top: 54, left: 50 },
      { number: 8, label: 'CM', top: 52, left: 70 },
      { number: 3, label: 'LB', top: 72, left: 21 },
      { number: 5, label: 'CB', top: 74, left: 41 },
      { number: 4, label: 'CB', top: 74, left: 59 },
      { number: 2, label: 'RB', top: 72, left: 79 },
      { number: 1, label: 'GK', top: 86, left: 50 },
    ],
    tacticalGroups: [
      {
        id: 'attack',
        title: '⚽ ATTACK',
        positions: [
          { number: 11, label: 'L WING' },
          { number: 9, label: 'STRIKER' },
          { number: 7, label: 'R WING' },
        ],
      },
      {
        id: 'midfield',
        title: '🎯 MIDFIELD',
        positions: [
          { number: 10, label: 'L MID' },
          { number: 6, label: 'CENTRE' },
          { number: 8, label: 'R MID' },
        ],
      },
      {
        id: 'defence',
        title: '🛡️ DEFENCE',
        positions: [
          { number: 3, label: 'L BACK' },
          { number: 5, label: 'CB' },
          { number: 4, label: 'CB' },
          { number: 2, label: 'R BACK' },
        ],
      },
      {
        id: 'goalkeeper',
        title: '🧤 GOALKEEPER',
        positions: [
          { number: 1, label: 'GOALKEEPER', isGk: true },
        ],
      },
    ],
  },
  '4-4-2': {
    name: '4-4-2',
    pitchPositions: [
      { number: 11, label: 'ST', top: 25, left: 40 },
      { number: 9, label: 'ST', top: 25, left: 60 },
      { number: 10, label: 'LM', top: 50, left: 20 },
      { number: 6, label: 'CM', top: 52, left: 40 },
      { number: 8, label: 'CM', top: 52, left: 60 },
      { number: 7, label: 'RM', top: 50, left: 80 },
      { number: 3, label: 'LB', top: 72, left: 21 },
      { number: 5, label: 'CB', top: 74, left: 41 },
      { number: 4, label: 'CB', top: 74, left: 59 },
      { number: 2, label: 'RB', top: 72, left: 79 },
      { number: 1, label: 'GK', top: 86, left: 50 },
    ],
    tacticalGroups: [
      {
        id: 'attack',
        title: '⚽ ATTACK',
        positions: [
          { number: 11, label: 'STRIKER' },
          { number: 9, label: 'STRIKER' },
        ],
      },
      {
        id: 'midfield',
        title: '🎯 MIDFIELD',
        positions: [
          { number: 10, label: 'L MID' },
          { number: 6, label: 'CM' },
          { number: 8, label: 'CM' },
          { number: 7, label: 'R MID' },
        ],
      },
      {
        id: 'defence',
        title: '🛡️ DEFENCE',
        positions: [
          { number: 3, label: 'L BACK' },
          { number: 5, label: 'CB' },
          { number: 4, label: 'CB' },
          { number: 2, label: 'R BACK' },
        ],
      },
      {
        id: 'goalkeeper',
        title: '🧤 GOALKEEPER',
        positions: [
          { number: 1, label: 'GOALKEEPER', isGk: true },
        ],
      },
    ],
  },
  '4-2-3-1': {
    name: '4-2-3-1',
    pitchPositions: [
      { number: 9, label: 'ST', top: 24, left: 50 },
      { number: 11, label: 'LAM', top: 38, left: 25 },
      { number: 10, label: 'CAM', top: 40, left: 50 },
      { number: 7, label: 'RAM', top: 38, left: 75 },
      { number: 6, label: 'DM', top: 57, left: 38 },
      { number: 8, label: 'DM', top: 57, left: 62 },
      { number: 3, label: 'LB', top: 72, left: 21 },
      { number: 5, label: 'CB', top: 74, left: 41 },
      { number: 4, label: 'CB', top: 74, left: 59 },
      { number: 2, label: 'RB', top: 72, left: 79 },
      { number: 1, label: 'GK', top: 86, left: 50 },
    ],
    tacticalGroups: [
      {
        id: 'attack',
        title: '⚽ ATTACK',
        positions: [
          { number: 9, label: 'STRIKER' },
        ],
      },
      {
        id: 'attacking-mid',
        title: '🎯 ATTACKING MID',
        positions: [
          { number: 11, label: 'LAM' },
          { number: 10, label: 'CAM' },
          { number: 7, label: 'RAM' },
        ],
      },
      {
        id: 'defensive-mid',
        title: '⚡ DEFENSIVE MID',
        positions: [
          { number: 6, label: 'CDM' },
          { number: 8, label: 'CDM' },
        ],
      },
      {
        id: 'defence',
        title: '🛡️ DEFENCE',
        positions: [
          { number: 3, label: 'L BACK' },
          { number: 5, label: 'CB' },
          { number: 4, label: 'CB' },
          { number: 2, label: 'R BACK' },
        ],
      },
      {
        id: 'goalkeeper',
        title: '🧤 GOALKEEPER',
        positions: [
          { number: 1, label: 'GOALKEEPER', isGk: true },
        ],
      },
    ],
  },
  '3-5-2': {
    name: '3-5-2',
    pitchPositions: [
      { number: 11, label: 'ST', top: 25, left: 40 },
      { number: 9, label: 'ST', top: 25, left: 60 },
      { number: 3, label: 'LWB', top: 48, left: 17 },
      { number: 10, label: 'CM', top: 45, left: 36 },
      { number: 6, label: 'DM', top: 57, left: 50 },
      { number: 8, label: 'CM', top: 45, left: 64 },
      { number: 2, label: 'RWB', top: 48, left: 83 },
      { number: 5, label: 'CB', top: 73, left: 30 },
      { number: 4, label: 'CB', top: 75, left: 50 },
      { number: 7, label: 'CB', top: 73, left: 70 },
      { number: 1, label: 'GK', top: 86, left: 50 },
    ],
    tacticalGroups: [
      {
        id: 'attack',
        title: '⚽ ATTACK',
        positions: [
          { number: 11, label: 'STRIKER' },
          { number: 9, label: 'STRIKER' },
        ],
      },
      {
        id: 'midfield',
        title: '🎯 MIDFIELD',
        positions: [
          { number: 3, label: 'LWB' },
          { number: 10, label: 'CM' },
          { number: 6, label: 'CDM' },
          { number: 8, label: 'CM' },
          { number: 2, label: 'RWB' },
        ],
      },
      {
        id: 'defence',
        title: '🛡️ DEFENCE',
        positions: [
          { number: 5, label: 'CB' },
          { number: 4, label: 'CB' },
          { number: 7, label: 'CB' },
        ],
      },
      {
        id: 'goalkeeper',
        title: '🧤 GOALKEEPER',
        positions: [
          { number: 1, label: 'GOALKEEPER', isGk: true },
        ],
      },
    ],
  },
};

function PositionCard({ pos, value, onSlotChange, isGk = false, isCompact = false }) {
  const slots = (value || ',,').split(',');
  const starter = slots[0] || '';
  const sub1 = slots[1] || '';
  const sub2 = slots[2] || '';

  const inputStyle = {
    backgroundColor: '#FFFFFF',
    color: '#000000',
    borderColor: 'rgba(0, 0, 0, 0.35)',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 3,
    paddingVertical: isCompact ? 1.5 : 3.5,
    fontSize: isCompact ? 8 : 9.5,
    fontWeight: '700',
    textAlign: 'center',
    width: '100%',
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        borderColor: isGk ? 'rgba(245, 158, 11, 0.6)' : 'rgba(255, 255, 255, 0.22)',
        borderWidth: 1,
        borderRadius: 12,
        padding: isCompact ? 5 : 7,
        alignItems: 'center',
      }}
    >
      {/* Position Header & Number Badge */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 5 }}>
        <View
          style={{
            width: isCompact ? 17 : 20,
            height: isCompact ? 17 : 20,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: isGk ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)',
            backgroundColor: isGk ? '#F59E0B' : '#000000',
          }}
        >
          <Text
            style={{
              fontSize: isCompact ? 7.5 : 9,
              fontWeight: '900',
              color: isGk ? '#000000' : '#FFFFFF',
            }}
          >
            {pos.number}
          </Text>
        </View>
        <Text
          numberOfLines={1}
          style={{
            fontSize: isCompact ? 7.5 : 8.5,
            fontWeight: '900',
            textTransform: 'uppercase',
            color: '#FFFFFF',
          }}
        >
          {pos.label}
        </Text>
      </View>

      {/* 3 Input Slots */}
      <View style={{ width: '100%', gap: 4 }}>
        <TextInput
          placeholder="Starter"
          placeholderTextColor="rgba(0, 0, 0, 0.45)"
          value={starter}
          onChangeText={(val) => onSlotChange(0, val)}
          style={inputStyle}
        />
        <TextInput
          placeholder="Sub 1"
          placeholderTextColor="rgba(0, 0, 0, 0.45)"
          value={sub1}
          onChangeText={(val) => onSlotChange(1, val)}
          style={{ ...inputStyle, backgroundColor: '#EDEDED' }}
        />
        <TextInput
          placeholder="Sub 2"
          placeholderTextColor="rgba(0, 0, 0, 0.45)"
          value={sub2}
          onChangeText={(val) => onSlotChange(2, val)}
          style={{ ...inputStyle, backgroundColor: '#EDEDED' }}
        />
      </View>
    </View>
  );
}

export function FootballFormation() {
  const { reflection, updateReflection } = useActiveSession();

  const [formData, setFormData] = useState({
    formation: '4-3-3',
    teamName: '',
    ageGroup: 'U16',
    opponent: '',
    date: new Date().toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    players: {
      1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 7: '', 8: '', 9: '', 10: '', 11: '',
    },
  });

  useEffect(() => {
    async function loadData() {
      try {
        const saved = await AsyncStorage.getItem('footballFormation');
        if (saved) {
          const parsed = JSON.parse(saved);
          setFormData({
            formation: parsed.formation || '4-3-3',
            teamName: parsed.teamName || '',
            ageGroup: parsed.ageGroup || 'U16',
            opponent: parsed.opponent || '',
            date: parsed.date || new Date().toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }),
            players: parsed.players || {
              1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 7: '', 8: '', 9: '', 10: '', 11: '',
            },
          });
        } else if (reflection?.formation) {
          setFormData({
            formation: reflection.formation.formation || '4-3-3',
            teamName: reflection.formation.teamName || '',
            ageGroup: reflection.formation.ageGroup || 'U16',
            opponent: reflection.formation.opponent || '',
            date: reflection.formation.date || new Date().toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }),
            players: reflection.formation.players || {
              1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 7: '', 8: '', 9: '', 10: '', 11: '',
            },
          });
        }
      } catch (e) {
        console.error('Error loading formation:', e);
      }
    }
    loadData();
  }, [reflection]);

  const handleMetadataChange = async (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    await AsyncStorage.setItem('footballFormation', JSON.stringify(updated));
    updateReflection({ formation: updated });
  };

  const handlePlayerSlotChange = async (posNumber, slotIndex, value) => {
    const rawVal = formData.players[posNumber] || '';
    const slots = rawVal.split(',');
    while (slots.length < 3) slots.push('');
    slots[slotIndex] = value;

    const updatedPlayers = { ...formData.players, [posNumber]: slots.join(',') };
    const updated = { ...formData, players: updatedPlayers };
    setFormData(updated);
    await AsyncStorage.setItem('footballFormation', JSON.stringify(updated));
    updateReflection({ formation: updated });
  };

  const handleReset = () => {
    Alert.alert('Reset Lineup', 'Clear starting lineup player names?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: async () => {
          const empty = {
            ...formData,
            players: { 1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 7: '', 8: '', 9: '', 10: '', 11: '' },
          };
          setFormData(empty);
          await AsyncStorage.setItem('footballFormation', JSON.stringify(empty));
          updateReflection({ formation: empty });
        },
      },
    ]);
  };

  const selectedFormationKey = FORMATIONS_DATA[formData.formation] ? formData.formation : '4-3-3';
  const activeFormation = FORMATIONS_DATA[selectedFormationKey];

  return (
    <View className="space-y-4 pb-6">
      {/* ── 1. Starting Lineup Header ── */}
      <View className="flex-row items-center justify-between py-1">
        <Text className="text-xl font-black uppercase text-white tracking-wider">
          STARTING LINEUP
        </Text>
        <Text className="text-[10px] font-bold text-white/50 tracking-wider">
          TACTICAL SHEET
        </Text>
      </View>

      {/* ── 2. Match & Team Info Inputs ── */}
      <View className="p-3.5 rounded-2xl border border-white/10 bg-[#12151D] space-y-2.5">
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <TextInput
              value={formData.teamName}
              onChangeText={(val) => handleMetadataChange('teamName', val)}
              placeholder="Team Name"
              placeholderTextColor="rgba(255,255,255,0.3)"
              className="bg-black/40 text-white px-3 py-2 text-xs font-semibold rounded-xl border border-white/15"
            />
          </View>
          <View style={{ flex: 1 }}>
            <TextInput
              value={formData.ageGroup}
              onChangeText={(val) => handleMetadataChange('ageGroup', val)}
              placeholder="Age Group"
              placeholderTextColor="rgba(255,255,255,0.3)"
              className="bg-black/40 text-white px-3 py-2 text-xs font-semibold rounded-xl border border-white/15"
            />
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <TextInput
              value={formData.date}
              onChangeText={(val) => handleMetadataChange('date', val)}
              placeholder="Date"
              placeholderTextColor="rgba(255,255,255,0.3)"
              className="bg-black/40 text-white px-3 py-2 text-xs font-semibold rounded-xl border border-white/15"
            />
          </View>
          <View style={{ flex: 1 }}>
            <TextInput
              value={formData.opponent}
              onChangeText={(val) => handleMetadataChange('opponent', val)}
              placeholder="Opponent"
              placeholderTextColor="rgba(255,255,255,0.3)"
              className="bg-black/40 text-white px-3 py-2 text-xs font-semibold rounded-xl border border-white/15"
            />
          </View>
        </View>
      </View>

      {/* ── 3 & 4. Interactive Pitch Card with Top Formation Tabs (MATCHING CLIENT REFERENCE) ── */}
      <View className="p-3 rounded-2xl border border-white/10 bg-[#0E1118] shadow-2xl space-y-3">
        {/* Top Formation Tabs */}
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {Object.keys(FORMATIONS_DATA).map((fmtKey) => {
            const isSelected = selectedFormationKey === fmtKey;
            return (
              <TouchableOpacity
                key={fmtKey}
                onPress={() => handleMetadataChange('formation', fmtKey)}
                style={{ flex: 1 }}
                className={`py-2 rounded-xl items-center justify-center ${
                  isSelected ? 'bg-[#FF4422]' : 'bg-[#181C26]'
                }`}
              >
                <Text
                  className={`text-[11px] font-black ${
                    isSelected ? 'text-white' : 'text-white/60'
                  }`}
                >
                  {fmtKey}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Green Football Pitch Graphic */}
        <View
          style={{
            width: '100%',
            aspectRatio: 1.18,
            borderRadius: 16,
            overflow: 'hidden',
            backgroundColor: '#1A7740',
            borderWidth: 1.5,
            borderColor: 'rgba(16, 185, 129, 0.4)',
          }}
        >
          {/* Pitch Lines SVG */}
          <Svg width="100%" height="100%" viewBox="0 0 300 250" fill="none">
            {/* Outer boundary */}
            <Rect
              x="14"
              y="12"
              width="272"
              height="226"
              rx="8"
              stroke="rgba(255,255,255,0.45)"
              strokeWidth="1.5"
            />

            {/* Halfway line */}
            <Line
              x1="14"
              y1="125"
              x2="286"
              y2="125"
              stroke="rgba(255,255,255,0.45)"
              strokeWidth="1.5"
            />

            {/* Center circle */}
            <Circle
              cx="150"
              cy="125"
              r="34"
              stroke="rgba(255,255,255,0.45)"
              strokeWidth="1.5"
            />

            {/* Top penalty area */}
            <Rect
              x="72"
              y="12"
              width="156"
              height="50"
              stroke="rgba(255,255,255,0.45)"
              strokeWidth="1.5"
            />

            {/* Bottom penalty area */}
            <Rect
              x="72"
              y="188"
              width="156"
              height="50"
              stroke="rgba(255,255,255,0.45)"
              strokeWidth="1.5"
            />
          </Svg>

          {/* 11 Circular Red-Orange Player Markers */}
          {activeFormation.pitchPositions.map((pos) => (
            <View
              key={`${selectedFormationKey}-${pos.number}`}
              style={{
                position: 'absolute',
                top: `${pos.top}%`,
                left: `${pos.left}%`,
                transform: [{ translateX: -14 }, { translateY: -14 }],
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: '#FF4422',
                borderWidth: 1.5,
                borderColor: 'rgba(255,255,255,0.85)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              pointerEvents="none"
            >
              <Text
                style={{
                  fontSize: 9,
                  fontWeight: '900',
                  color: '#FFFFFF',
                  textTransform: 'uppercase',
                  lineHeight: 11,
                }}
              >
                {pos.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── 5. Existing Tactical Sheet Section (SEPARATE BELOW THE PITCH) ── */}
      <View className="p-3.5 rounded-2xl border border-white/10 bg-[#12151D] space-y-4 shadow-xl">
        {/* Tactical Groups: ATTACK, MIDFIELD, DEFENCE, GOALKEEPER */}
        {activeFormation.tacticalGroups.map((group) => {
          const count = group.positions.length;
          const isGkGroup = group.id === 'goalkeeper';

          return (
            <View key={group.id} className="space-y-2">
              <View className="items-center">
                <View className="bg-black/50 px-3 py-0.5 rounded-full border border-white/15">
                  <Text
                    className={`text-[10px] font-black uppercase tracking-wider ${
                      isGkGroup ? 'text-amber-300' : 'text-emerald-300'
                    }`}
                  >
                    {group.title}
                  </Text>
                </View>
              </View>

              {count === 1 ? (
                <View className="items-center">
                  <View style={{ width: 140 }}>
                    {group.positions.map((pos) => (
                      <PositionCard
                        key={`${selectedFormationKey}-${pos.number}`}
                        pos={pos}
                        value={formData.players[pos.number]}
                        onSlotChange={(idx, val) => handlePlayerSlotChange(pos.number, idx, val)}
                        isGk={pos.isGk}
                      />
                    ))}
                  </View>
                </View>
              ) : count === 2 ? (
                <View className="items-center">
                  <View style={{ flexDirection: 'row', gap: 8, width: '70%', maxWidth: 260 }}>
                    {group.positions.map((pos) => (
                      <PositionCard
                        key={`${selectedFormationKey}-${pos.number}`}
                        pos={pos}
                        value={formData.players[pos.number]}
                        onSlotChange={(idx, val) => handlePlayerSlotChange(pos.number, idx, val)}
                      />
                    ))}
                  </View>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', gap: count >= 5 ? 3 : 5 }}>
                  {group.positions.map((pos) => (
                    <PositionCard
                      key={`${selectedFormationKey}-${pos.number}`}
                      pos={pos}
                      value={formData.players[pos.number]}
                      onSlotChange={(idx, val) => handlePlayerSlotChange(pos.number, idx, val)}
                      isCompact={count >= 4}
                    />
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* Action Bar */}
      <SectionActionBar
        onReset={handleReset}
        onSave={() => updateReflection({ formation: formData })}
        sectionKey="lineup"
        data={formData}
      />
    </View>
  );
}

export default FootballFormation;
