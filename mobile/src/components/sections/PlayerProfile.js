import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  Check,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowRight,
  X,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useActiveSession } from '../../hooks/useActiveSession';
import { useAuth } from '../../contexts/AuthContext';
import { registerPlayer } from '../../services/api';

const POSITIONS = [
  'Goalkeeper (GK)',
  'Center Back (CB)',
  'Left Back (LB)',
  'Right Back (RB)',
  'Defensive Midfielder (CDM)',
  'Central Midfielder (CM)',
  'Attacking Midfielder (CAM)',
  'Left Winger (LW)',
  'Right Winger (RW)',
  'Striker / Forward (ST)',
];

const COUNTRIES = [
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Spain',
  'Germany',
  'France',
  'Brazil',
  'Argentina',
  'Italy',
  'Portugal',
  'Netherlands',
  'Mexico',
  'Japan',
  'South Korea',
  'Nigeria',
  'Ghana',
  'Colombia',
  'Chile',
  'Other',
];

const GAME_TYPES = ['GRASSROOTS', '4V4', '7V7', '9V9', '11V11'];

export function PlayerProfile() {
  const navigation = useNavigation();
  const { session, updateSession } = useActiveSession();
  const { isRegistered, completeRegistration } = useAuth();

  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [positionModalOpen, setPositionModalOpen] = useState(false);
  const [countryModalOpen, setCountryModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    playerName: '',
    age: '',
    club: '',
    team: '',
    position: '',
    country: '',
    activeFooter: '',
    email: '',
    cellPhone: '',
    instagram: '',
    tiktok: '',
    parentName: '',
    parentEmail: '',
    parentConsentChecked: false,
    favoriteTeam: '',
    favoritePlayer: '',
    gameTypes: [],
  });

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const saved = await AsyncStorage.getItem('playerProfile');
        if (saved) {
          const parsed = JSON.parse(saved);
          setFormData((prev) => ({
            ...prev,
            ...parsed,
            fullName: parsed.fullName || parsed.playerName || '',
          }));
        } else if (session?.id) {
          setFormData((prev) => ({
            ...prev,
            fullName: session.fullName || session.playerName || '',
            age: session.age ? String(session.age) : '',
            club: session.club || '',
            team: session.team || '',
            position: session.position || '',
            activeFooter: session.activeFooter || '',
          }));
        }
      } catch (e) {
        console.error('Error loading profile:', e);
      } finally {
        setIsLoaded(true);
      }
    }
    loadProfile();
  }, [session]);

  const handleChange = async (field, value) => {
    const updated = { ...formData, [field]: value };
    if (field === 'fullName') {
      updated.playerName = value;
    }
    setFormData(updated);
    try {
      await AsyncStorage.setItem('playerProfile', JSON.stringify(updated));
      if (session?.id) {
        updateSession(updated);
      }
    } catch (e) {
      console.error('Error updating field:', e);
    }
  };

  const handleFootSelect = async (foot) => {
    const footUpper = foot.toUpperCase();
    const updated = {
      ...formData,
      activeFooter: footUpper,
      leftFooter: footUpper === 'LEFT' ? 'LEFT' : '',
      rightFooter: footUpper === 'RIGHT' ? 'RIGHT' : '',
    };
    setFormData(updated);
    try {
      await AsyncStorage.setItem('playerProfile', JSON.stringify(updated));
      if (session?.id) {
        updateSession(updated);
      }
    } catch (e) {
      console.error('Error selecting foot:', e);
    }
  };

  const handleGameTypeToggle = async (type) => {
    const current = formData.gameTypes || [];
    const newTypes = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];

    const updated = { ...formData, gameTypes: newTypes };
    setFormData(updated);
    try {
      await AsyncStorage.setItem('playerProfile', JSON.stringify(updated));
      if (session?.id) {
        updateSession(updated);
      }
    } catch (e) {
      console.error('Error toggling game type:', e);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (!formData.activeFooter) {
      Alert.alert(
        'Dominant Foot Required',
        'Please select whether you are a LEFT or RIGHT footer before continuing.'
      );
      return;
    }

    const name = (formData.fullName || formData.playerName || '').trim();
    if (!name) {
      Alert.alert(
        'Player Name Required',
        'Please enter your name before continuing.'
      );
      return;
    }

    if (formData.email && formData.email.trim() && !formData.email.includes('@')) {
      Alert.alert(
        'Invalid Email',
        'Please enter a valid email address or leave it blank.'
      );
      return;
    }

    const isUnder13 = formData.age !== '' && parseInt(formData.age, 10) < 13;
    if (isUnder13) {
      if (!formData.parentName?.trim() || !formData.parentEmail?.trim() || !formData.parentConsentChecked) {
        Alert.alert(
          'Parent / Guardian Consent Required',
          'Players under 13 require parental or legal guardian consent before registering. Please have a parent or legal guardian complete the consent section.'
        );
        return;
      }
    }

    const cleanedData = {
      ...formData,
      ...(isUnder13 ? { cellPhone: '', instagram: '', tiktok: '' } : {}),
      parentConsent: isUnder13 ? {
        parentName: formData.parentName.trim(),
        parentEmail: formData.parentEmail.trim(),
        consentedAt: new Date().toISOString(),
        verified: true,
      } : null,
    };

    setIsSubmitting(true);
    try {
      // 1. Submit to the live backend API
      const result = await registerPlayer(cleanedData);

      const token = result?.token;
      const backendData = result?.data || result?.player;

      // 2. Persist local registration state
      await completeRegistration(cleanedData, token, backendData);

      if (session?.id) {
        await updateSession(cleanedData);
      }

      // If editing existing profile while already registered, navigate back or return to Dashboard
      if (isRegistered) {
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          navigation.navigate('Dashboard');
        }
      }
      // If newly registered (isRegistered was false), completeRegistration updates AuthContext,
      // setting isRegistered to true. AppNavigation reacts to this central state change,
      // unmounting the Register screen and mounting the Dashboard stack automatically!
    } catch (error) {
      console.error('Registration submission error:', error);
      const serverMessage =
        error?.data?.error ||
        error?.data?.message ||
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        'Registration failed. Please check your connection and try again.';
      Alert.alert('Registration Error', serverMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLeftSelected = formData.activeFooter === 'LEFT';
  const isRightSelected = formData.activeFooter === 'RIGHT';

  return (
    <View className="space-y-3 pb-8">
      {/* ── TOP BRANDING & LOGOS ── */}
      <View className="items-center justify-center space-y-1 pt-2">
        <View className="w-14 h-14 items-center justify-center">
          <Image
            source={require('../../../assets/right_foot.png')}
            className="w-14 h-14"
            style={{ tintColor: '#FFFFFF' }}
            resizeMode="contain"
          />
        </View>

        <Text
          style={{ letterSpacing: 2 }}
          className="text-[10px] font-black uppercase text-white mt-1"
        >
          FOOTBALLER ATHLETICS
        </Text>

        <View className="py-1">
          <Image
            source={require('../../../assets/touches_logo.png')}
            className="w-44 h-10"
            style={{ tintColor: '#FFFFFF' }}
            resizeMode="contain"
          />
        </View>

        <Text
          style={{ letterSpacing: 2 }}
          className="text-[10px] font-black uppercase text-white"
        >
          TRACK • REFLECT • IMPROVE
        </Text>
      </View>

      {/* ── MAIN CARD & DOMINANT FOOT SECTION ── */}
      <View className="bg-[#0F121A] rounded-2xl p-4 border border-white/15 space-y-3.5 shadow-xl">
        {/* Question Heading */}
        <View className="items-center space-y-1">
          <Text className="text-xl font-black uppercase text-white text-center leading-tight">
            ARE YOU A <Text className="text-[#FF4422]">LEFT</Text> OR{' '}
            <Text className="text-[#00AEEF]">RIGHT</Text> FOOTER?
          </Text>
          <Text className="text-[11px] text-white/70 text-center font-medium px-2">
            Every elite player knows their dominant foot. This is where your journey begins.
          </Text>
        </View>

        {/* ── Left vs Right Foot Cards Grid ── */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {/* LEFT FOOTER CARD */}
          <TouchableOpacity
            onPress={() => handleFootSelect('LEFT')}
            activeOpacity={0.8}
            style={{ flex: 1 }}
            className={`p-3 rounded-xl border-2 items-center text-center space-y-2 ${
              isLeftSelected
                ? 'border-[#FF4422] bg-[#FF4422]/15 shadow-md shadow-[#FF4422]/20'
                : 'border-[#FF4422]/40 bg-[#161920]'
            }`}
          >
            {isLeftSelected && (
              <View className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#FF4422] items-center justify-center shadow">
                <Check size={10} color="white" strokeWidth={3} />
              </View>
            )}

            {/* Left Foot Icon (White) */}
            <View className="w-14 h-14 items-center justify-center">
              <Image
                source={require('../../../assets/left_foot.png')}
                className="w-14 h-14"
                style={{ tintColor: '#FFFFFF' }}
                resizeMode="contain"
              />
            </View>

            <View className="items-center">
              <Text className="text-xs font-black uppercase tracking-wider text-[#FF4422]">
                LEFT FOOTER
              </Text>
              <Text className="text-[9px] text-white/80 text-center leading-tight mt-0.5 font-medium">
                The creative side. Legends born here.
              </Text>
            </View>
          </TouchableOpacity>

          {/* RIGHT FOOTER CARD */}
          <TouchableOpacity
            onPress={() => handleFootSelect('RIGHT')}
            activeOpacity={0.8}
            style={{ flex: 1 }}
            className={`p-3 rounded-xl border-2 items-center text-center space-y-2 ${
              isRightSelected
                ? 'border-[#00AEEF] bg-[#00AEEF]/15 shadow-md shadow-[#00AEEF]/20'
                : 'border-[#00AEEF]/40 bg-[#161920]'
            }`}
          >
            {isRightSelected && (
              <View className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#00AEEF] items-center justify-center shadow">
                <Check size={10} color="white" strokeWidth={3} />
              </View>
            )}

            {/* Right Foot Icon (White) */}
            <View className="w-14 h-14 items-center justify-center">
              <Image
                source={require('../../../assets/right_foot.png')}
                className="w-14 h-14"
                style={{ tintColor: '#FFFFFF' }}
                resizeMode="contain"
              />
            </View>

            <View className="items-center">
              <Text className="text-xs font-black uppercase tracking-wider text-[#00AEEF]">
                RIGHT FOOTER
              </Text>
              <Text className="text-[9px] text-white/80 text-center leading-tight mt-0.5 font-medium">
                Power & precision. Own the pitch.
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ── SECTION DIVIDER ── */}
        <View className="flex-row items-center gap-2 my-1">
          <View className="h-[1px] bg-white/15 flex-1" />
          <Text
            style={{ letterSpacing: 1.5 }}
            className="text-[9px] font-black uppercase text-white/60"
          >
            PLAYER REGISTRATION
          </Text>
          <View className="h-[1px] bg-white/15 flex-1" />
        </View>

        {/* ── FORM FIELDS ── */}
        <View className="space-y-3">
          {/* Row 1: First Name & Age */}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Text className="text-[9px] font-black uppercase tracking-wider text-white/80 mb-1">
                FIRST NAME
              </Text>
              <TextInput
                placeholder="Your first name"
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={formData.fullName}
                onChangeText={(text) => handleChange('fullName', text)}
                className="bg-[#161920] text-white px-3 py-2 text-xs font-semibold rounded-xl border border-white/15"
              />
            </View>

            <View style={{ width: 85 }}>
              <Text className="text-[9px] font-black uppercase tracking-wider text-white/80 mb-1">
                AGE
              </Text>
              <TextInput
                placeholder="Age"
                placeholderTextColor="rgba(255,255,255,0.3)"
                keyboardType="numeric"
                value={formData.age}
                onChangeText={(text) => handleChange('age', text)}
                className="bg-[#161920] text-white px-3 py-2 text-xs font-semibold rounded-xl border border-white/15 text-center"
              />
            </View>
          </View>

          {/* Row 2: Club / Team & Position */}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Text className="text-[9px] font-black uppercase tracking-wider text-white/80 mb-1">
                CLUB / TEAM
              </Text>
              <TextInput
                placeholder="Club name"
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={formData.club}
                onChangeText={(text) => handleChange('club', text)}
                className="bg-[#161920] text-white px-3 py-2 text-xs font-semibold rounded-xl border border-white/15"
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text className="text-[9px] font-black uppercase tracking-wider text-white/80 mb-1">
                POSITION
              </Text>
              <TouchableOpacity
                onPress={() => setPositionModalOpen(true)}
                className="bg-[#161920] px-3 py-2 rounded-xl border border-white/15 flex-row items-center justify-between"
              >
                <Text
                  numberOfLines={1}
                  className={`text-xs font-semibold flex-1 pr-1 ${
                    formData.position ? 'text-white' : 'text-white/30'
                  }`}
                >
                  {formData.position || 'Select Position'}
                </Text>
                <ChevronDown size={14} color="rgba(255,255,255,0.5)" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Row 3: Country */}
          <View>
            <Text className="text-[9px] font-black uppercase tracking-wider text-white/80 mb-1">
              COUNTRY
            </Text>
            <TouchableOpacity
              onPress={() => setCountryModalOpen(true)}
              className="bg-[#161920] px-3 py-2.5 rounded-xl border border-white/15 flex-row items-center justify-between"
            >
              <Text
                className={`text-xs font-semibold ${
                  formData.country ? 'text-white' : 'text-white/30'
                }`}
              >
                {formData.country || 'Select Country'}
              </Text>
              <ChevronDown size={14} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
          </View>

          {/* Parent/Guardian Consent Step for Under 13 */}
          {formData.age !== '' && parseInt(formData.age, 10) < 13 && (
            <View className="p-3.5 rounded-xl bg-[#1C1824] border border-amber-500/40 space-y-2.5 mt-2">
              <View className="space-y-0.5">
                <Text className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                  Parent / Legal Guardian Consent Required
                </Text>
                <Text className="text-[9px] text-white/70 leading-relaxed">
                  Players under 13 require parental consent before creating a profile. Please have a parent or legal guardian complete this section.
                </Text>
              </View>

              <View className="space-y-2">
                <View>
                  <Text className="text-[8.5px] font-black uppercase text-white/80 mb-1">
                    PARENT / GUARDIAN FULL NAME *
                  </Text>
                  <TextInput
                    placeholder="Full name"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={formData.parentName}
                    onChangeText={(text) => handleChange('parentName', text)}
                    className="bg-[#161920] text-white px-3 py-2 text-xs font-semibold rounded-xl border border-white/15"
                  />
                </View>

                <View>
                  <Text className="text-[8.5px] font-black uppercase text-white/80 mb-1">
                    PARENT / GUARDIAN EMAIL *
                  </Text>
                  <TextInput
                    placeholder="parent.guardian@email.com"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={formData.parentEmail}
                    onChangeText={(text) => handleChange('parentEmail', text)}
                    className="bg-[#161920] text-white px-3 py-2 text-xs font-semibold rounded-xl border border-white/15"
                  />
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleChange('parentConsentChecked', !formData.parentConsentChecked)}
                  className="flex-row items-start gap-2 pt-1"
                >
                  <View className={`w-4 h-4 rounded border items-center justify-center mt-0.5 ${formData.parentConsentChecked ? 'bg-amber-500 border-amber-500' : 'border-white/30 bg-black/40'}`}>
                    {formData.parentConsentChecked && <Check size={12} color="#000" />}
                  </View>
                  <Text className="text-[8.5px] text-white/80 flex-1 leading-tight">
                    I am the parent or legal guardian of this player. I authorize my child to create a TOUCHES player profile and track football training statistics.
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Submit / Continue Button */}
          <View className="pt-2">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSubmit}
              disabled={isSubmitting || !formData.activeFooter}
              className={`w-full py-3.5 px-5 rounded-xl flex-row items-center justify-center gap-2 ${
                !formData.activeFooter || isSubmitting
                  ? 'bg-[#3D1A15] border border-[#FF4422]/40'
                  : formData.activeFooter === 'LEFT'
                  ? 'bg-[#FF4422]'
                  : 'bg-[#00AEEF]'
              }`}
            >
              {isSubmitting ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text
                    style={{ letterSpacing: 1.5 }}
                    className="text-xs font-black uppercase text-white"
                  >
                    REGISTERING PLAYER...
                  </Text>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text
                    style={{ letterSpacing: 1.5 }}
                    className={`text-xs font-black uppercase ${
                      !formData.activeFooter ? 'text-[#FF6B35]' : 'text-white'
                    }`}
                  >
                    {!formData.activeFooter
                      ? 'CHOOSE YOUR FOOT FIRST'
                      : isRegistered
                      ? 'SAVE & CONTINUE'
                      : 'REGISTER & START TRAINING'}
                  </Text>
                  {!formData.activeFooter ? (
                    <ArrowUp size={15} color="#FF6B35" />
                  ) : (
                    <ArrowRight size={15} color="#FFFFFF" />
                  )}
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* ── OPTIONAL ADDITIONAL DETAILS ── */}
        <View className="border-t border-white/10 pt-3">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowOptionalFields(!showOptionalFields)}
            className="w-full flex-row items-center justify-between py-2 px-3 rounded-lg bg-white/5"
          >
            <Text
              style={{ letterSpacing: 1 }}
              className="text-[9px] font-black uppercase text-white/70"
            >
              Additional Profile Information (Optional)
            </Text>
            {showOptionalFields ? (
              <ChevronUp size={14} color="rgba(255,255,255,0.7)" />
            ) : (
              <ChevronDown size={14} color="rgba(255,255,255,0.7)" />
            )}
          </TouchableOpacity>

          {showOptionalFields && (
            <View className="mt-3 space-y-3 pt-1">
              {/* Contact (Minimizing for Under 13) */}
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text className="text-[9px] font-black uppercase tracking-wider text-white/80 mb-1">
                    {formData.age !== '' && parseInt(formData.age, 10) < 13 ? 'PARENT CONTACT EMAIL' : 'EMAIL'}
                  </Text>
                  <TextInput
                    placeholder="Email address"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={formData.email}
                    onChangeText={(text) => handleChange('email', text)}
                    className="bg-[#161920] text-white px-3 py-2 text-xs font-semibold rounded-xl border border-white/15"
                  />
                </View>
                {!(formData.age !== '' && parseInt(formData.age, 10) < 13) && (
                  <View style={{ flex: 1 }}>
                    <Text className="text-[9px] font-black uppercase tracking-wider text-white/80 mb-1">
                      PHONE
                    </Text>
                    <TextInput
                      placeholder="Phone number"
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      keyboardType="phone-pad"
                      value={formData.cellPhone}
                      onChangeText={(text) => handleChange('cellPhone', text)}
                      className="bg-[#161920] text-white px-3 py-2 text-xs font-semibold rounded-xl border border-white/15"
                    />
                  </View>
                )}
              </View>

              {/* Socials (Hidden for Under 13) */}
              {!(formData.age !== '' && parseInt(formData.age, 10) < 13) && (
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text className="text-[9px] font-black uppercase tracking-wider text-white/80 mb-1">
                      INSTAGRAM
                    </Text>
                    <TextInput
                      placeholder="@handle"
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      autoCapitalize="none"
                      value={formData.instagram}
                      onChangeText={(text) => handleChange('instagram', text)}
                      className="bg-[#161920] text-white px-3 py-2 text-xs font-semibold rounded-xl border border-white/15"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text className="text-[9px] font-black uppercase tracking-wider text-white/80 mb-1">
                      TIKTOK
                    </Text>
                    <TextInput
                      placeholder="@handle"
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      autoCapitalize="none"
                      value={formData.tiktok}
                      onChangeText={(text) => handleChange('tiktok', text)}
                      className="bg-[#161920] text-white px-3 py-2 text-xs font-semibold rounded-xl border border-white/15"
                    />
                  </View>
                </View>
              )}

              {/* Favorites */}
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text className="text-[9px] font-black uppercase tracking-wider text-white/80 mb-1">
                    FAVORITE TEAM
                  </Text>
                  <TextInput
                    placeholder="e.g. Real Madrid"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={formData.favoriteTeam}
                    onChangeText={(text) => handleChange('favoriteTeam', text)}
                    className="bg-[#161920] text-white px-3 py-2 text-xs font-semibold rounded-xl border border-white/15"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text className="text-[9px] font-black uppercase tracking-wider text-white/80 mb-1">
                    FAVORITE PLAYER
                  </Text>
                  <TextInput
                    placeholder="e.g. Messi / CR7"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={formData.favoritePlayer}
                    onChangeText={(text) => handleChange('favoritePlayer', text)}
                    className="bg-[#161920] text-white px-3 py-2 text-xs font-semibold rounded-xl border border-white/15"
                  />
                </View>
              </View>

              {/* Game Format */}
              <View>
                <Text className="text-[9px] font-black uppercase tracking-wider text-white/80 mb-1.5">
                  PREFERRED GAME FORMAT
                </Text>
                <View className="flex-row flex-wrap gap-1.5">
                  {GAME_TYPES.map((type) => {
                    const isSelected = (formData.gameTypes || []).includes(type);
                    return (
                      <TouchableOpacity
                        key={type}
                        activeOpacity={0.7}
                        onPress={() => handleGameTypeToggle(type)}
                        className={`px-2.5 py-1 rounded-md border ${
                          isSelected
                            ? 'bg-[#FF4422] border-[#FF4422]'
                            : 'bg-[#161920] border-white/15'
                        }`}
                      >
                        <Text
                          style={{ letterSpacing: 0.5 }}
                          className={`text-[9px] font-black uppercase ${
                            isSelected ? 'text-white' : 'text-white/70'
                          }`}
                        >
                          {type}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* ── POSITION MODAL ── */}
      <Modal
        visible={positionModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setPositionModalOpen(false)}
      >
        <View className="flex-1 bg-black/80 justify-center items-center px-4">
          <View className="bg-[#161920] w-full max-w-sm rounded-2xl border border-white/15 overflow-hidden max-h-[80%]">
            <View className="flex-row items-center justify-between p-4 border-b border-white/10">
              <Text className="text-sm font-black text-white uppercase tracking-wider">
                Select Position
              </Text>
              <TouchableOpacity onPress={() => setPositionModalOpen(false)}>
                <X size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <ScrollView className="p-2">
              {POSITIONS.map((pos) => {
                const isSelected = formData.position === pos;
                return (
                  <TouchableOpacity
                    key={pos}
                    onPress={() => {
                      handleChange('position', pos);
                      setPositionModalOpen(false);
                    }}
                    className={`py-3 px-4 rounded-xl flex-row items-center justify-between my-0.5 ${
                      isSelected ? 'bg-[#FF4422]/20 border border-[#FF4422]' : 'bg-white/5'
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        isSelected ? 'text-[#FF4422]' : 'text-white'
                      }`}
                    >
                      {pos}
                    </Text>
                    {isSelected && <Check size={16} color="#FF4422" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── COUNTRY MODAL ── */}
      <Modal
        visible={countryModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setCountryModalOpen(false)}
      >
        <View className="flex-1 bg-black/80 justify-center items-center px-4">
          <View className="bg-[#161920] w-full max-w-sm rounded-2xl border border-white/15 overflow-hidden max-h-[80%]">
            <View className="flex-row items-center justify-between p-4 border-b border-white/10">
              <Text className="text-sm font-black text-white uppercase tracking-wider">
                Select Country
              </Text>
              <TouchableOpacity onPress={() => setCountryModalOpen(false)}>
                <X size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <ScrollView className="p-2">
              {COUNTRIES.map((cty) => {
                const isSelected = formData.country === cty;
                return (
                  <TouchableOpacity
                    key={cty}
                    onPress={() => {
                      handleChange('country', cty);
                      setCountryModalOpen(false);
                    }}
                    className={`py-3 px-4 rounded-xl flex-row items-center justify-between my-0.5 ${
                      isSelected ? 'bg-[#FF4422]/20 border border-[#FF4422]' : 'bg-white/5'
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        isSelected ? 'text-[#FF4422]' : 'text-white'
                      }`}
                    >
                      {cty}
                    </Text>
                    {isSelected && <Check size={16} color="#FF4422" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
export default PlayerProfile;
