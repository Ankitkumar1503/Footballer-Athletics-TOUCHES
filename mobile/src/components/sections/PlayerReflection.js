import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useActiveSession } from '../../hooks/useActiveSession';
import { SectionActionBar } from '../ui/SectionActionBar';

const WELL_DONE_TAGS = [
  'ATTACKING', 'FINISHING', 'DEFENDING', 'TACKLING', 'LONG BALLS',
  'TRAPPING', 'TRANSITION', 'FREE KICKS', 'MARKING', 'SPEED',
  'PENALTIES', 'ENDURANCE', 'CORNERS', 'PASSING', 'LEADERSHIP',
  'DECISIONS', 'SUPPORT', 'CREATE SPACE', 'BALL CONTROL',
  'THROW-IN', 'HEADING',
];

const PERFORMANCE_METRICS = [
  'ENDURANCE', 'ENERGY', 'DECISION MAKING', 'CONFIDENCE',
  'MOTIVATION', 'ENJOYMENT', 'FOCUS', 'PERFORMANCE',
  'FIRST TOUCH', 'PASSING', 'RECEIVING',
  'FITNESS', 'WILL TO WIN', 'TEAM PLAYER',
];

export function PlayerReflection() {
  const { reflection, updateReflection } = useActiveSession();

  const [formData, setFormData] = useState({
    wellDoneTags: [],
    playerName: '',
    playerAge: '',
    achievedGoal: '',
    whatLearned: '',
    whatWouldChange: '',
    detailedPerformance: {},
  });

  useEffect(() => {
    async function loadSaved() {
      try {
        const saved = await AsyncStorage.getItem('playerReflection');
        if (saved) {
          setFormData(JSON.parse(saved));
        } else if (reflection && Object.keys(reflection).length > 0) {
          setFormData((prev) => ({ ...prev, ...reflection }));
        }
      } catch (e) {
        console.error('Error loading reflection:', e);
      }
    }
    loadSaved();
  }, [reflection]);

  const handleTagToggle = async (tag) => {
    const currentTags = formData.wellDoneTags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag];

    const newData = { ...formData, wellDoneTags: newTags };
    setFormData(newData);
    await AsyncStorage.setItem('playerReflection', JSON.stringify(newData));
    updateReflection({ wellDoneTags: newTags });
  };

  const handleTextChange = async (key, value) => {
    const newData = { ...formData, [key]: value };
    setFormData(newData);
    await AsyncStorage.setItem('playerReflection', JSON.stringify(newData));
    updateReflection({ [key]: value });
  };

  const handleMetricChange = async (metric, value) => {
    const numValue = parseInt(value, 10) || 0;
    if (numValue < 0 || numValue > 10) return;

    const newMetrics = {
      ...formData.detailedPerformance,
      [metric]: numValue,
    };
    const newData = { ...formData, detailedPerformance: newMetrics };
    setFormData(newData);
    await AsyncStorage.setItem('playerReflection', JSON.stringify(newData));
    updateReflection({ detailedPerformance: newMetrics });
  };

  const handleReset = () => {
    Alert.alert('Reset Reflection', 'Clear reflection answers?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: async () => {
          const empty = {
            wellDoneTags: [],
            playerName: '',
            playerAge: '',
            achievedGoal: '',
            whatLearned: '',
            whatWouldChange: '',
            detailedPerformance: {},
          };
          setFormData(empty);
          await AsyncStorage.setItem('playerReflection', JSON.stringify(empty));
          updateReflection(empty);
        },
      },
    ]);
  };

  return (
    <View className="space-y-4 pb-6">
      {/* ── Title Header ── */}
      <View className="flex-row items-center justify-between py-1">
        <Text className="text-xl font-black uppercase text-white tracking-wider">
          PLAYER REFLECTION
        </Text>
        <Text className="text-[10px] font-bold text-white/50 tracking-wider">
          POST-MATCH REVIEW
        </Text>
      </View>

      {/* ── Name & Age Card ── */}
      <View style={{ flexDirection: 'row', gap: 10 }} className="p-3.5 rounded-2xl border border-white/10 bg-[#12151D]">
        <View style={{ flex: 1 }}>
          <TextInput
            value={formData.playerName}
            onChangeText={(text) => handleTextChange('playerName', text)}
            placeholder="Player Name"
            placeholderTextColor="rgba(255,255,255,0.3)"
            className="bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs font-bold text-white"
          />
        </View>
        <View style={{ width: 85 }}>
          <TextInput
            value={formData.playerAge}
            onChangeText={(text) => handleTextChange('playerAge', text)}
            placeholder="Age"
            placeholderTextColor="rgba(255,255,255,0.3)"
            keyboardType="numeric"
            className="bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs font-bold text-white text-center"
          />
        </View>
      </View>

      {/* ── WHAT DID YOU DO WELL TAGS ── */}
      <View className="space-y-2">
        <Text
          style={{ letterSpacing: 2 }}
          className="text-xs font-black uppercase text-white/70 px-0.5"
        >
          WHAT DID YOU DO WELL:
        </Text>
        <View className="flex-row flex-wrap gap-2 p-3.5 rounded-2xl border border-white/10 bg-[#12151D]">
          {WELL_DONE_TAGS.map((tag) => {
            const isSelected = formData.wellDoneTags?.includes(tag);
            return (
              <TouchableOpacity
                key={tag}
                activeOpacity={0.7}
                onPress={() => handleTagToggle(tag)}
                className={`px-3 py-1.5 rounded-xl border ${
                  isSelected
                    ? 'bg-[#FF4422] border-[#FF4422]'
                    : 'bg-black/30 border-white/10'
                }`}
              >
                <Text
                  className={`text-[9.5px] font-black uppercase tracking-wider ${
                    isSelected ? 'text-white' : 'text-white/60'
                  }`}
                >
                  {tag}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ── REFLECTION TEXT INPUTS ── */}
      <View className="space-y-3">
        <View>
          <Text className="text-[9px] font-black uppercase tracking-wider text-white/70 mb-1 px-1">
            DID YOU ACHIEVE YOUR GOAL?
          </Text>
          <TextInput
            multiline
            numberOfLines={2}
            value={formData.achievedGoal}
            onChangeText={(text) => handleTextChange('achievedGoal', text)}
            placeholder="Describe your match goal and outcome..."
            placeholderTextColor="rgba(255,255,255,0.3)"
            className="w-full bg-[#12151D] text-white p-3 text-xs font-medium rounded-xl border border-white/15"
          />
        </View>

        <View>
          <Text className="text-[9px] font-black uppercase tracking-wider text-white/70 mb-1 px-1">
            WHAT DID YOU LEARN?
          </Text>
          <TextInput
            multiline
            numberOfLines={2}
            value={formData.whatLearned}
            onChangeText={(text) => handleTextChange('whatLearned', text)}
            placeholder="Key takeaways..."
            placeholderTextColor="rgba(255,255,255,0.3)"
            className="w-full bg-[#12151D] text-white p-3 text-xs font-medium rounded-xl border border-white/15"
          />
        </View>

        <View>
          <Text className="text-[9px] font-black uppercase tracking-wider text-white/70 mb-1 px-1">
            WHAT WOULD YOU CHANGE?
          </Text>
          <TextInput
            multiline
            numberOfLines={2}
            value={formData.whatWouldChange}
            onChangeText={(text) => handleTextChange('whatWouldChange', text)}
            placeholder="Tactics, decisions..."
            placeholderTextColor="rgba(255,255,255,0.3)"
            className="w-full bg-[#12151D] text-white p-3 text-xs font-medium rounded-xl border border-white/15"
          />
        </View>
      </View>

      {/* ── PERFORMANCE RATINGS (1-10) ── */}
      <View className="space-y-2 pt-1">
        <Text
          style={{ letterSpacing: 2 }}
          className="text-xs font-black uppercase text-white/70 px-0.5"
        >
          GAME PERFORMANCE RATINGS: (1–10)
        </Text>
        <View className="space-y-2 p-3 rounded-2xl border border-white/10 bg-[#12151D]">
          {Array.from({ length: Math.ceil(PERFORMANCE_METRICS.length / 2) }, (_, i) =>
            PERFORMANCE_METRICS.slice(i * 2, i * 2 + 2)
          ).map((pair, rowIndex) => (
            <View key={rowIndex} style={{ flexDirection: 'row', gap: 8 }}>
              {pair.map((metric) => (
                <View
                  key={metric}
                  style={{ flex: 1 }}
                  className="flex-row items-center justify-between bg-black/30 p-2 rounded-xl border border-white/5"
                >
                  <Text
                    numberOfLines={1}
                    className="text-[8.5px] font-black uppercase text-white/70 flex-1 pr-1"
                  >
                    {metric}
                  </Text>
                  <TextInput
                    keyboardType="numeric"
                    maxLength={2}
                    placeholder="10"
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    value={String(formData.detailedPerformance?.[metric] || '')}
                    onChangeText={(text) => handleMetricChange(metric, text)}
                    className="w-9 bg-white/10 text-[#FF4422] font-black text-xs text-center py-0.5 rounded-lg border border-white/10"
                  />
                </View>
              ))}
            </View>
          ))}
        </View>
      </View>

      {/* Action Bar */}
      <SectionActionBar
        onReset={handleReset}
        onSave={() => updateReflection(formData)}
        sectionKey="reflection"
        data={formData}
      />
    </View>
  );
}

export default PlayerReflection;
