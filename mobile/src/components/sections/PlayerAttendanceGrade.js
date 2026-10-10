import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useActiveSession } from '../../hooks/useActiveSession';
import { SectionActionBar } from '../ui/SectionActionBar';

const GRADE_OPTIONS = [
  { id: 'P', label: 'P', full: 'Poor', color: 'bg-rose-500' },
  { id: 'A', label: 'A', full: 'Average', color: 'bg-[#F59E0B]' },
  { id: 'G', label: 'G', full: 'Good', color: 'bg-[#00AEEF]' },
  { id: 'VG', label: 'VG', full: 'Very Good', color: 'bg-emerald-500' },
];

export function PlayerAttendanceGrade() {
  const { reflection, updateReflection } = useActiveSession();

  const [fullData, setFullData] = useState({
    metadata: {
      team: '',
      date: new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    },
    records: Array.from({ length: 16 }, (_, i) => ({
      id: i + 1,
      name: `Player ${i + 1}`,
      grade: 'G',
    })),
  });

  useEffect(() => {
    async function loadData() {
      try {
        const saved = await AsyncStorage.getItem('playerAttendance');
        if (saved) {
          setFullData(JSON.parse(saved));
        } else if (reflection?.attendance) {
          setFullData({
            metadata: {
              team: reflection.attendance.metadata?.team ?? '',
              date: reflection.attendance.metadata?.date ?? '',
            },
            records: (reflection.attendance.records ?? []).map((r, i) => ({
              id: r.id || i + 1,
              name: r.name || `Player ${i + 1}`,
              grade: r.grade || (r.grades?.A ? 'VG' : r.grades?.B ? 'G' : 'A'),
            })),
          });
        }
      } catch (e) {
        console.error('Error loading attendance data:', e);
      }
    }
    loadData();
  }, [reflection]);

  const handleMetadataChange = async (field, value) => {
    const updated = {
      ...fullData,
      metadata: { ...fullData.metadata, [field]: value },
    };
    setFullData(updated);
    await AsyncStorage.setItem('playerAttendance', JSON.stringify(updated));
    updateReflection({ attendance: updated });
  };

  const handlePlayerNameChange = async (id, value) => {
    const updated = {
      ...fullData,
      records: fullData.records.map((r) => (r.id === id ? { ...r, name: value } : r)),
    };
    setFullData(updated);
    await AsyncStorage.setItem('playerAttendance', JSON.stringify(updated));
    updateReflection({ attendance: updated });
  };

  const handleGradeSelect = async (id, gradeId) => {
    const updated = {
      ...fullData,
      records: fullData.records.map((r) => (r.id === id ? { ...r, grade: gradeId } : r)),
    };
    setFullData(updated);
    await AsyncStorage.setItem('playerAttendance', JSON.stringify(updated));
    updateReflection({ attendance: updated });
  };

  const handleReset = () => {
    Alert.alert('Reset Roster', 'Reset roster ratings?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: async () => {
          const resetRecords = fullData.records.map((r) => ({ ...r, grade: 'G' }));
          const updated = { ...fullData, records: resetRecords };
          setFullData(updated);
          await AsyncStorage.setItem('playerAttendance', JSON.stringify(updated));
          updateReflection({ attendance: updated });
        },
      },
    ]);
  };

  return (
    <View className="space-y-4 pb-6">
      {/* ── Title Bar ── */}
      <View className="flex-row items-center justify-between py-1">
        <Text className="text-xl font-black uppercase text-white tracking-wider">
          TEAM ROSTER
        </Text>
        <Text className="text-[10px] font-bold text-white/50 tracking-wider">
          SQUAD GRADING
        </Text>
      </View>

      {/* ── Team & Date Header Inputs ── */}
      <View style={{ flexDirection: 'row', gap: 10 }} className="p-3.5 rounded-2xl border border-white/10 bg-[#12151D]">
        <View style={{ flex: 1 }}>
          <TextInput
            value={fullData.metadata.team}
            onChangeText={(val) => handleMetadataChange('team', val)}
            placeholder="Team Name"
            placeholderTextColor="rgba(255,255,255,0.3)"
            className="bg-black/40 text-white px-3 py-2 text-xs font-semibold rounded-xl border border-white/15"
          />
        </View>
        <View style={{ flex: 1 }}>
          <TextInput
            value={fullData.metadata.date}
            onChangeText={(val) => handleMetadataChange('date', val)}
            placeholder="Date"
            placeholderTextColor="rgba(255,255,255,0.3)"
            className="bg-black/40 text-white px-3 py-2 text-xs font-semibold rounded-xl border border-white/15"
          />
        </View>
      </View>

      {/* ── Grade Legend ── */}
      <View className="p-2.5 rounded-xl border border-white/10 bg-black/30 flex-row items-center justify-around">
        <Text className="text-[9px] font-black uppercase text-white/60">GRADE:</Text>
        <Text className="text-[9px] font-black uppercase text-rose-400">P = Poor</Text>
        <Text className="text-[9px] font-black uppercase text-[#F59E0B]">A = Average</Text>
        <Text className="text-[9px] font-black uppercase text-[#00AEEF]">G = Good</Text>
        <Text className="text-[9px] font-black uppercase text-emerald-400">VG = Very Good</Text>
      </View>

      {/* ── Roster Players List ── */}
      <View className="space-y-2">
        {fullData.records.map((player) => (
          <View
            key={player.id}
            className="p-2.5 rounded-xl border border-white/10 bg-[#12151D] flex-row items-center justify-between gap-2"
          >
            <View className="flex-row items-center gap-2 flex-1 pr-1">
              <View className="w-6 h-6 rounded-full bg-black/50 border border-white/20 items-center justify-center">
                <Text className="text-[9px] font-black text-white/80">{player.id}</Text>
              </View>
              <TextInput
                value={player.name}
                onChangeText={(val) => handlePlayerNameChange(player.id, val)}
                className="flex-1 text-xs font-bold text-white py-1 px-2 rounded-lg bg-black/30 border border-white/5"
              />
            </View>

            {/* Grading Pills */}
            <View className="flex-row gap-1">
              {GRADE_OPTIONS.map((g) => {
                const isSelected = player.grade === g.id;

                return (
                  <TouchableOpacity
                    key={g.id}
                    onPress={() => handleGradeSelect(player.id, g.id)}
                    className={`w-7 h-7 rounded-lg items-center justify-center border ${
                      isSelected
                        ? `${g.color} border-white/40 shadow-sm`
                        : 'bg-black/40 border-white/10'
                    }`}
                  >
                    <Text
                      className={`text-[9px] font-black ${
                        isSelected ? 'text-white' : 'text-white/50'
                      }`}
                    >
                      {g.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
      </View>

      {/* Action Bar */}
      <SectionActionBar
        onReset={handleReset}
        onSave={() => updateReflection({ attendance: fullData })}
        sectionKey="roster"
        data={fullData}
      />
    </View>
  );
}

export default PlayerAttendanceGrade;
