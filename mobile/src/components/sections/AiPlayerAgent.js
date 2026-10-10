import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { Bot, RefreshCw, Send, User } from 'lucide-react-native';
import { useActiveSession } from '../../hooks/useActiveSession';
import { SectionActionBar } from '../ui/SectionActionBar';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUGGESTIONS = [
  'My weak foot is terrible. Help.',
  'How do I get faster?',
  'What should I eat before a match?',
  'How to improve my first touch?',
  'How to stay confident under pressure?',
];

const INITIAL_WELCOME = {
  sender: 'agent',
  text: "Ask me anything about the beautiful game - how to improve your technique, tactics, fitness, or mindset. I'm here to help you improve your knowledge, your skill, and your game.\n\nPlay like you always have the ball.",
};

export function AiPlayerAgent() {
  const { session } = useActiveSession();
  const [messages, setMessages] = useState([INITIAL_WELCOME]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    async function loadChat() {
      try {
        const saved = await AsyncStorage.getItem('aiAgentChat');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
          }
        }
      } catch (e) {
        console.error('Error loading chat:', e);
      }
    }
    loadChat();
  }, []);

  const playerName = session?.playerName || 'Player';
  const isRightFoot = (session?.activeFooter || 'RIGHT').toUpperCase() === 'RIGHT';

  const generateCoachResponse = (query) => {
    const q = query.toLowerCase();

    // 1. Injury safety check
    if (
      q.includes('hurt') ||
      q.includes('injur') ||
      q.includes('pain') ||
      q.includes('strain') ||
      q.includes('tear') ||
      q.includes('sprain') ||
      q.includes('concussion') ||
      q.includes('doctor')
    ) {
      return 'Important: If you feel pain or believe you might be injured, stop training or playing immediately. Rest and ice the area, and always inform your parents, coach, or consult a medical doctor or athletic trainer before returning to the pitch.';
    }

    // 2. Inappropriate topics exclusion
    if (
      q.includes('drug') ||
      q.includes('alcohol') ||
      q.includes('smoke') ||
      q.includes('vape') ||
      q.includes('weapon') ||
      q.includes('sex') ||
      q.includes('dating') ||
      q.includes('gambl')
    ) {
      return 'As your football mentor, I focus strictly on football techniques, pitch skills, and athletic training. Please speak with a parent, guardian, or trusted adult regarding this topic.';
    }

    // 3. Politics and religion exclusion
    if (
      q.includes('politic') ||
      q.includes('president') ||
      q.includes('election') ||
      q.includes('democrat') ||
      q.includes('republican') ||
      q.includes('religion') ||
      q.includes('god') ||
      q.includes('church') ||
      q.includes('faith')
    ) {
      return "I'm dedicated exclusively to football coaching, athletic training, and match preparation. I don't engage in political or religious discussions. Let's focus on improving your touch and ball mastery!";
    }

    // 4. Healthy food & nutrition for athletes
    if (
      q.includes('eat') ||
      q.includes('nutrition') ||
      q.includes('food') ||
      q.includes('diet') ||
      q.includes('snack') ||
      q.includes('breakfast') ||
      q.includes('meal') ||
      q.includes('water') ||
      q.includes('hydrat')
    ) {
      return 'Clean nutrition powers elite performance! 3 to 4 hours before kickoff: Eat complex carbs and clean protein (like oatmeal with fruit & peanut butter, or brown rice with grilled chicken). 1 hour before match: Grab an easily digestible fruit like a banana. Stay thoroughly hydrated with water throughout the day, and avoid sugary sodas or heavy fried foods.';
    }

    // 5. Football fitness & speed
    if (
      q.includes('faster') ||
      q.includes('speed') ||
      q.includes('fitness') ||
      q.includes('stamina') ||
      q.includes('endurance') ||
      q.includes('conditioning')
    ) {
      return 'Speed and fitness in football rely on explosive agility and high-intensity recovery! Practice 10-meter accelerations, boundary shuttle runs, and plyometric jump drills 2 to 3 times per week. Prioritize a thorough dynamic warm-up and get 8 to 10 hours of sleep for peak recovery.';
    }

    if (q.includes('weak foot')) {
      return `Hey ${playerName}! To fix your weak foot, start doing 100 1-touch passes against a wall every single day with ONLY your non-dominant foot. Focus on ankle locking, keeping your hips square, and hitting the center of the ball. Within 2 weeks of daily wall work, your confidence will explode!`;
    }

    if (q.includes('first touch') || q.includes('control')) {
      return 'Great first touch requires cushioning the ball like a feather! As the ball approaches, pull your foot back slightly at the exact moment of impact. Practice receiving wall passes on both feet while turning into open space.';
    }

    if (q.includes('confidence') || q.includes('mindset') || q.includes('pressure')) {
      return "Mindset separates good players from elite players! Visualize your successful passes and movements before the game. When you make a mistake, drop it instantly and focus on winning the next ball. You've put in the training!";
    }

    return `Coach Clem Murdock here! Focus on mastering the basics: crisp 1-touch passing, relentless off-the-ball movement, and sharp decision making under pressure. What specific part of your game would you like to work on today?`;
  };

  const handleSend = async (textToSend) => {
    const query = textToSend || inputQuery;
    if (!query || !query.trim()) return;

    const userMsg = { sender: 'user', text: query.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    if (!textToSend) setInputQuery('');
    setIsTyping(true);

    setTimeout(async () => {
      const replyText = generateCoachResponse(query);
      const withReply = [...updated, { sender: 'agent', text: replyText }];
      setMessages(withReply);
      setIsTyping(false);
      await AsyncStorage.setItem('aiAgentChat', JSON.stringify(withReply));
    }, 800);
  };

  const handleResetChat = () => {
    Alert.alert(
      'Reset Chat',
      'Are you sure you want to reset the AI Player Agent conversation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            setMessages([INITIAL_WELCOME]);
            await AsyncStorage.removeItem('aiAgentChat');
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, paddingBottom: 2 }}>
      {/* ── 1. TOP HEADER BAR (Fixed Top) ── */}
      <View
        style={{
          flexShrink: 0,
          padding: 12,
          borderRadius: 16,
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          backgroundColor: '#121015',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: '#FF4422',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 10,
            }}
          >
            <Bot size={18} color="white" />
          </View>
          <View>
            <Text style={{ fontSize: 13, fontWeight: '900', color: '#FFFFFF' }}>
              AiPlayerAgent - Mentor
            </Text>
            <Text
              style={{
                fontSize: 9,
                fontWeight: '700',
                color: 'rgba(255, 255, 255, 0.8)',
                marginTop: 2,
              }}
            >
              Powered by Footballer Athletics
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleResetChat}
          activeOpacity={0.7}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 12,
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
          }}
        >
          <RefreshCw
            size={11}
            color="rgba(255, 255, 255, 0.7)"
            style={{ marginRight: 4 }}
          />
          <Text
            style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: 9,
              fontWeight: '700',
              textTransform: 'uppercase',
            }}
          >
            New Chat
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── REQUIRED CLIENT SAFETY DISCLAIMER ── */}
      <View
        style={{
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 12,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          marginBottom: 8,
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            fontSize: 9.5,
            fontWeight: '600',
            color: 'rgba(255, 255, 255, 0.75)',
            textAlign: 'center',
            lineHeight: 13,
          }}
        >
          AI mentor for general football/soccer tips. Always follow your coaches, trainers, parents and medical professionals.
        </Text>
      </View>

      {/* ── 2. QUICK SUGGESTIONS SCROLL ROW (Strictly constrained height) ── */}
      <View style={{ height: 36, marginBottom: 8, justifyContent: 'center' }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            alignItems: 'center',
            paddingHorizontal: 2,
          }}
        >
          {SUGGESTIONS.map((text, idx) => (
            <TouchableOpacity
              key={idx}
              activeOpacity={0.7}
              onPress={() => handleSend(text)}
              style={{
                height: 30,
                borderRadius: 15,
                paddingHorizontal: 12,
                marginRight: 8,
                backgroundColor: '#181418',
                borderColor: 'rgba(255, 68, 34, 0.6)',
                borderWidth: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                alignSelf: 'center',
              }}
            >
              <Text
                numberOfLines={1}
                style={{
                  color: '#FFFFFF',
                  fontSize: 11,
                  fontWeight: '700',
                }}
              >
                {text}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── 3. CHAT MESSAGES CONTAINER (Only this area scrolls) ── */}
      <ScrollView
        ref={scrollViewRef}
        onContentSizeChange={() =>
          scrollViewRef.current?.scrollToEnd({ animated: true })
        }
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 8 }}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg, idx) => {
          const isAgent = msg.sender === 'agent';

          if (isAgent && idx === 0) {
            return (
              <View
                key={idx}
                style={{
                  backgroundColor: '#141217',
                  borderLeftColor: '#FF4422',
                  borderLeftWidth: 4,
                  borderRadius: 16,
                  padding: 14,
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '700',
                    color: '#FFFFFF',
                    lineHeight: 18,
                  }}
                >
                  {msg.text}
                </Text>
              </View>
            );
          }

          return (
            <View
              key={idx}
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                justifyContent: isAgent ? 'flex-start' : 'flex-end',
                marginBottom: 8,
              }}
            >
              {isAgent && (
                <View
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 13,
                    backgroundColor: '#FF4422',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 2,
                    marginRight: 8,
                  }}
                >
                  <Bot size={13} color="white" />
                </View>
              )}

              <View
                style={{
                  maxWidth: '82%',
                  padding: 12,
                  borderRadius: 16,
                  backgroundColor: isAgent ? '#16141C' : '#FF4422',
                  borderColor: isAgent
                    ? 'rgba(255, 255, 255, 0.15)'
                    : 'transparent',
                  borderWidth: isAgent ? 1 : 0,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '600',
                    lineHeight: 17,
                    color: '#FFFFFF',
                  }}
                >
                  {msg.text}
                </Text>
              </View>

              {!isAgent && (
                <View
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 13,
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 2,
                    marginLeft: 8,
                  }}
                >
                  <User size={13} color="white" />
                </View>
              )}
            </View>
          );
        })}

        {isTyping && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 8,
              paddingVertical: 4,
            }}
          >
            <Bot size={14} color="#FFFFFF" />
            <Text
              style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: 12,
                fontStyle: 'italic',
                fontWeight: '700',
                marginLeft: 6,
              }}
            >
              AI Mentor is thinking...
            </Text>
          </View>
        )}
      </ScrollView>

      {/* ── 4. BOTTOM CHAT INPUT ROW (Fixed Bottom) ── */}
      <View
        style={{
          flexShrink: 0,
          flexDirection: 'row',
          alignItems: 'center',
          paddingTop: 6,
          paddingBottom: 2,
        }}
      >
        <TextInput
          placeholder="How can I help you with your game?"
          placeholderTextColor="rgba(255, 255, 255, 0.7)"
          value={inputQuery}
          onChangeText={setInputQuery}
          onSubmitEditing={() => handleSend()}
          style={{
            flex: 1,
            backgroundColor: '#16141D',
            borderColor: 'rgba(255, 255, 255, 0.15)',
            borderWidth: 1,
            borderRadius: 22,
            paddingVertical: 8,
            paddingHorizontal: 16,
            fontSize: 12,
            fontWeight: '600',
            color: '#FFFFFF',
            marginRight: 8,
          }}
        />
        <TouchableOpacity
          onPress={() => handleSend()}
          activeOpacity={0.8}
          disabled={!inputQuery.trim()}
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: '#FF4422',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: !inputQuery.trim() ? 0.45 : 1,
          }}
        >
          <Send size={15} color="white" />
        </TouchableOpacity>
      </View>

      {/* ── 5. ACTION BAR (Fixed Bottom) ── */}
      <View style={{ flexShrink: 0 }}>
        <SectionActionBar
          sectionKey="ai-agent"
          onReset={handleResetChat}
          data={{ messages }}
        />
      </View>
    </View>
  );
}

export default AiPlayerAgent;
