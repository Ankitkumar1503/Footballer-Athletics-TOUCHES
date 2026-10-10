import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useActiveSession } from '../../hooks/useActiveSession';
import { SectionActionBar } from '../ui/SectionActionBar';

const EVALUATION_CATEGORIES = {
  TECHNIQUE: [
    'Ability to play with both feet',
    'Passing',
    'Controlling and releasing the ball',
    'Feinting and dribbling',
    'Shooting / finishing',
    'Heading',
    'Tackling',
    'Playing without the ball',
  ],
  'PHYSICAL ATTRIBUTES': [
    'Strength (explosiveness)',
    'Speed',
    'Endurance',
    'Suppleness (mobility)',
    'Core muscles',
  ],
  'TACTICAL AWARENESS': [
    'Reading the game',
    'Attacking one-on-one',
    'Defending one-on-one',
    'Technique under pressure',
  ],
  'CO-ORDINATION': [
    'Orientation',
    'Rhythm',
    'Differentiation',
    'Reaction',
    'Balance',
  ],
  'MENTAL STRENGTHS': [
    'Concentration',
    'Willpower / will to win',
    'Perseverance',
    'Confidence',
    'Willingness to take risks',
    'Creativity',
    'Aggression',
  ],
  'SOCIAL SKILLS': [
    'Communication',
    'Behaviour / positive attitude',
    'Charisma / personality',
    'Team player',
  ],
  'PHYSICAL STATE': ['General state of health'],
};

const RATING_OPTIONS = [
  { value: 1, label: '1', full: 'Very Good', color: 'bg-emerald-500' },
  { value: 2, label: '2', full: 'Good', color: 'bg-[#00AEEF]' },
  { value: 3, label: '3', full: 'Average', color: 'bg-[#F59E0B]' },
  { value: 4, label: '4', full: 'Poor', color: 'bg-[#EF4444]' },
];

export function PlayerEvaluation() {
  const { reflection, updateReflection } = useActiveSession();

  const [evaluatedBy, setEvaluatedBy] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [playerAge, setPlayerAge] = useState('');
  const [ratings, setRatings] = useState({});

  useEffect(() => {
    async function loadData() {
      try {
        const savedBy = await AsyncStorage.getItem('playerEvaluationBy');
        const savedName = await AsyncStorage.getItem('playerEvaluationName');
        const savedAge = await AsyncStorage.getItem('playerEvaluationAge');
        const savedRatings = await AsyncStorage.getItem('playerEvaluation');

        if (savedBy) setEvaluatedBy(savedBy);
        if (savedName) setPlayerName(savedName);
        if (savedAge) setPlayerAge(savedAge);
        if (savedRatings) setRatings(JSON.parse(savedRatings));
      } catch (e) {
        console.error('Error loading evaluation:', e);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (reflection?.detailedEvaluation) {
      setRatings((prev) => ({ ...prev, ...reflection.detailedEvaluation }));
    }
    if (reflection?.evaluatedBy) setEvaluatedBy(reflection.evaluatedBy);
  }, [reflection]);

  const handleRatingChange = async (category, skill, ratingVal) => {
    const updated = {
      ...ratings,
      [category]: { ...(ratings[category] || {}), [skill]: ratingVal },
    };
    setRatings(updated);
    await AsyncStorage.setItem('playerEvaluation', JSON.stringify(updated));
    updateReflection({ detailedEvaluation: updated });
  };

  const handleEvaluatorChange = async (text) => {
    setEvaluatedBy(text);
    await AsyncStorage.setItem('playerEvaluationBy', text);
    updateReflection({ evaluatedBy: text });
  };

  const handleNameChange = async (text) => {
    setPlayerName(text);
    await AsyncStorage.setItem('playerEvaluationName', text);
  };

  const handleAgeChange = async (text) => {
    setPlayerAge(text);
    await AsyncStorage.setItem('playerEvaluationAge', text);
  };

  const handleReset = () => {
    Alert.alert('Reset Evaluation', 'Clear all grades and ratings?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: async () => {
          setRatings({});
          await AsyncStorage.removeItem('playerEvaluation');
          updateReflection({ detailedEvaluation: {} });
        },
      },
    ]);
  };

  return (
    <View className="space-y-4 pb-6">
      {/* ── Title Header ── */}
      <View className="flex-row items-center justify-between py-1">
        <Text className="text-xl font-black uppercase text-white tracking-wider">
          PLAYER EVALUATION
        </Text>
        <Text className="text-[10px] font-bold text-white/50 tracking-wider">
          COACH & PARENT GRADE
        </Text>
      </View>

      {/* ── Metadata Inputs ── */}
      <View className="p-3.5 rounded-2xl border border-white/10 bg-[#12151D] space-y-2.5">
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <TextInput
              value={playerName}
              onChangeText={handleNameChange}
              placeholder="Player Name"
              placeholderTextColor="rgba(255,255,255,0.3)"
              className="bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs font-bold text-white"
            />
          </View>
          <View style={{ width: 85 }}>
            <TextInput
              value={playerAge}
              onChangeText={handleAgeChange}
              placeholder="Age"
              placeholderTextColor="rgba(255,255,255,0.3)"
              keyboardType="numeric"
              className="bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs font-bold text-white text-center"
            />
          </View>
        </View>

        <View>
          <TextInput
            value={evaluatedBy}
            onChangeText={handleEvaluatorChange}
            placeholder="Coach / Parent Name"
            placeholderTextColor="rgba(255,255,255,0.3)"
            className="bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs font-bold text-white"
          />
        </View>
      </View>

      {/* ── Rating Scale Legend ── */}
      <View className="p-2.5 rounded-xl border border-white/10 bg-black/30 flex-row items-center justify-around">
        <View className="flex-row items-center gap-1">
          <View className="w-2 h-2 rounded-full bg-emerald-400" />
          <Text className="text-[9px] font-black uppercase text-emerald-400">1 = Very Good</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <View className="w-2 h-2 rounded-full bg-[#00AEEF]" />
          <Text className="text-[9px] font-black uppercase text-[#00AEEF]">2 = Good</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <View className="w-2 h-2 rounded-full bg-[#F59E0B]" />
          <Text className="text-[9px] font-black uppercase text-[#F59E0B]">3 = Average</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <View className="w-2 h-2 rounded-full bg-[#EF4444]" />
          <Text className="text-[9px] font-black uppercase text-[#EF4444]">4 = Poor</Text>
        </View>
      </View>

      {/* ── EVALUATION CATEGORIES LIST ── */}
      <View className="space-y-3">
        {Object.entries(EVALUATION_CATEGORIES).map(([category, skills]) => (
          <View
            key={category}
            className="rounded-2xl border border-white/10 bg-[#12151D] p-3.5 space-y-2.5 shadow-md"
          >
            <Text className="text-xs font-black uppercase tracking-wider text-yellow-400 border-b border-white/10 pb-1.5">
              {category}
            </Text>

            <View className="space-y-2">
              {skills.map((skill) => {
                const currentVal = ratings[category]?.[skill];

                return (
                  <View
                    key={skill}
                    className="p-2 rounded-xl bg-black/30 border border-white/5 space-y-1.5"
                  >
                    <Text className="text-xs font-semibold text-white/90">
                      {skill}
                    </Text>

                    <View className="flex-row gap-1.5">
                      {RATING_OPTIONS.map((opt) => {
                        const isSelected = currentVal === opt.value;

                        return (
                          <TouchableOpacity
                            key={opt.value}
                            onPress={() => handleRatingChange(category, skill, opt.value)}
                            className={`flex-1 py-1.5 rounded-lg items-center justify-center border ${
                              isSelected
                                ? `${opt.color} border-white/40 shadow-sm`
                                : 'bg-black/40 border-white/10'
                            }`}
                          >
                            <Text
                              className={`text-[10px] font-black uppercase ${
                                isSelected ? 'text-white' : 'text-white/60'
                              }`}
                            >
                              {opt.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        ))}
      </View>

      {/* Action Bar */}
      <SectionActionBar
        onReset={handleReset}
        onSave={() => updateReflection({ detailedEvaluation: ratings, evaluatedBy })}
        sectionKey="evaluation"
        data={{ evaluatedBy, playerName, playerAge, ratings }}
      />
    </View>
  );
}

export default PlayerEvaluation;
