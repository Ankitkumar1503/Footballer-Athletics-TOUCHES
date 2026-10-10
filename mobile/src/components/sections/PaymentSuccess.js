import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CheckCircle2, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';

export function PaymentSuccess() {
  const navigation = useNavigation();
  const { user } = useAuth();

  const playerName = user?.name || user?.fullName || 'Player';

  return (
    <View className="space-y-4 pb-12 items-center justify-center flex-1 py-8">
      {/* Success Badge */}
      <View className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 items-center justify-center mb-2 shadow-lg shadow-emerald-500/30">
        <CheckCircle2 size={44} color="#10B981" />
      </View>

      <View className="items-center space-y-1 text-center">
        <Text className="text-2xl font-black uppercase text-white tracking-wider">
          MEMBERSHIP ACTIVE
        </Text>
        <Text className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
          TOUCHES™ ATHLETE PASS
        </Text>
      </View>

      {/* Card Details */}
      <View className="w-full rounded-2xl border border-white/10 bg-[#12151D] p-5 space-y-3 shadow-xl">
        <View className="flex-row items-center justify-between border-b border-white/10 pb-3">
          <View className="flex-row items-center gap-2">
            <Sparkles size={16} color="#FACC15" />
            <Text className="text-xs font-black uppercase tracking-wider text-white">
              Athlete Details
            </Text>
          </View>
          <View className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40">
            <Text className="text-[9px] font-black uppercase text-emerald-400">
              ACTIVE
            </Text>
          </View>
        </View>

        <View className="space-y-1.5">
          <View className="flex-row justify-between">
            <Text className="text-[10px] font-bold text-white/60 uppercase">Name</Text>
            <Text className="text-xs font-black text-white">{playerName}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-[10px] font-bold text-white/60 uppercase">Plan</Text>
            <Text className="text-xs font-black text-white">Full Access Membership</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-[10px] font-bold text-white/60 uppercase">Club Access</Text>
            <Text className="text-xs font-black text-white">Footballer Athletics™</Text>
          </View>
        </View>

        <View className="pt-2 border-t border-white/5 space-y-1">
          <Text className="text-[9px] font-bold text-white/50 uppercase">Included Features:</Text>
          <Text className="text-[10px] text-white/80 font-medium">✓ Real-time Touch Counter & Pitch Gauge</Text>
          <Text className="text-[10px] text-white/80 font-medium">✓ Full 30-Day Skills & Drills Curriculum</Text>
          <Text className="text-[10px] text-white/80 font-medium">✓ AI Player Agent Football Mentor</Text>
          <Text className="text-[10px] text-white/80 font-medium">✓ Match Day Prep & Tactical Lineup Sheet</Text>
          <Text className="text-[10px] text-white/80 font-medium">✓ PDF Match Reports & Sharing</Text>
        </View>
      </View>

      {/* Continue Button */}
      <TouchableOpacity
        onPress={() => navigation.navigate('Dashboard')}
        className="w-full py-3.5 px-6 rounded-xl bg-[#FF4422] flex-row items-center justify-center gap-2 shadow-lg shadow-[#FF4422]/30 active:scale-98"
      >
        <Text className="text-white font-black text-xs uppercase tracking-wider">
          Go To Dashboard
        </Text>
        <ArrowRight size={16} color="white" />
      </TouchableOpacity>
    </View>
  );
}

export default PaymentSuccess;
