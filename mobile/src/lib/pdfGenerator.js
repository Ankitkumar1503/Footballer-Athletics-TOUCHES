import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Generate native PDF report tailored to the specific section requested,
 * incorporating current live screen data and local storage fallbacks.
 */
export async function generateAndSharePdf({
  session,
  stats,
  reflection,
  sectionKey = 'touch-counter',
  section = 'Current Section',
  scope = 'current',
  data = null,
}) {
  try {
    // 1. Basic Profile Fallbacks
    let profile = null;
    try {
      const savedProfile = await AsyncStorage.getItem('playerProfile');
      if (savedProfile) profile = JSON.parse(savedProfile);
    } catch (e) {
      console.warn('Could not read playerProfile for PDF:', e);
    }

    const playerName =
      data?.playerName ||
      data?.fullName ||
      session?.playerName ||
      profile?.fullName ||
      profile?.playerName ||
      'Player';
    const club = data?.club || session?.club || profile?.club || 'Footballer Athletics';
    const team = data?.team || session?.team || profile?.team || 'Competitive Squad';
    const position = data?.position || session?.position || profile?.position || 'Forward';
    const activeFoot = (
      data?.activeFooter ||
      session?.activeFooter ||
      profile?.activeFooter ||
      'RIGHT'
    ).toUpperCase();
    const date =
      data?.date || session?.date || new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    const time = session?.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 2. Build Section Specific Body HTML
    let sectionBodyHtml = '';
    let reportTitle = `${section.toUpperCase()} REPORT`;

    if (scope === 'all' || sectionKey === 'dashboard') {
      reportTitle = 'FULL MATCH REPORT';
      sectionBodyHtml = await buildFullMatchHtml({ session, stats, reflection, data, profile, playerName, club, team, position, activeFoot, date, time });
    } else {
      switch (sectionKey) {
        case 'touch-counter':
          reportTitle = 'TOUCH COUNTER REPORT';
          sectionBodyHtml = buildTouchCounterHtml({ stats, session, data, date, time });
          break;

        case 'stats':
          reportTitle = 'PLAYER STATS REPORT';
          sectionBodyHtml = await buildPlayerStatsHtml({ stats, session, data, profile, date });
          break;

        case 'match-prep':
          reportTitle = 'MATCH DAY PREP REPORT';
          sectionBodyHtml = await buildMatchPrepHtml({ data, session, date });
          break;

        case 'roster':
          reportTitle = 'PLAYER ROSTER & ATTENDANCE REPORT';
          sectionBodyHtml = await buildRosterHtml({ data, reflection, session, date });
          break;

        case 'lineup':
          reportTitle = 'STARTING LINEUP REPORT';
          sectionBodyHtml = await buildLineupHtml({ data, reflection, session, date });
          break;

        case 'evaluation':
          reportTitle = 'PLAYER EVALUATION REPORT';
          sectionBodyHtml = await buildEvaluationHtml({ data, reflection, playerName, session, date });
          break;

        case 'reflection':
          reportTitle = 'PLAYER REFLECTION REPORT';
          sectionBodyHtml = await buildReflectionHtml({ data, reflection, playerName, activeFoot, date });
          break;

        case 'challenge':
          reportTitle = '30-DAY CHALLENGE PROGRESS REPORT';
          sectionBodyHtml = await buildChallengeHtml({ data, date });
          break;

        case 'passport':
          reportTitle = 'PLAYER PASSPORT REPORT';
          sectionBodyHtml = await buildPassportHtml({ data, profile, session, playerName, activeFoot, club, team, position });
          break;

        case 'note-to-coach':
          reportTitle = 'NOTE TO COACH REPORT';
          sectionBodyHtml = await buildNoteToCoachHtml({ data, reflection, playerName, date });
          break;

        case 'ai-agent':
          reportTitle = 'AI PLAYER MENTOR SESSION REPORT';
          sectionBodyHtml = await buildAiAgentHtml({ data, playerName, date });
          break;

        case 'policy':
          reportTitle = 'PLATFORM USAGE POLICY';
          sectionBodyHtml = buildPolicyHtml();
          break;

        default:
          reportTitle = `${section.toUpperCase()} REPORT`;
          sectionBodyHtml = buildTouchCounterHtml({ stats, session, data, date, time });
          break;
      }
    }

    // 3. Assemble Complete HTML Document
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>TOUCHES - ${reportTitle}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 26px 28px;
      background-color: #07090E;
      color: #FFFFFF;
      font-size: 12px;
      line-height: 1.4;
    }
    .header {
      border-bottom: 2.5px solid #FF4422;
      padding-bottom: 14px;
      margin-bottom: 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .brand-title {
      font-size: 24px;
      font-weight: 900;
      letter-spacing: 2px;
      color: #FACC15;
      margin: 0;
      line-height: 1.1;
    }
    .brand-sub {
      font-size: 9.5px;
      letter-spacing: 1.5px;
      color: #A1A1AA;
      text-transform: uppercase;
      margin-top: 3px;
    }
    .badge {
      background: #FF4422;
      color: #FFFFFF;
      padding: 5px 12px;
      border-radius: 16px;
      font-weight: 900;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .player-bar {
      display: flex;
      background: #11141E;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 10px;
      padding: 10px 16px;
      margin-bottom: 16px;
      justify-content: space-between;
      align-items: center;
    }
    .player-bar-item {
      display: flex;
      flex-direction: column;
    }
    .player-bar-label {
      font-size: 8px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #71717A;
    }
    .player-bar-value {
      font-size: 12px;
      font-weight: 800;
      color: #FFFFFF;
      margin-top: 1px;
    }
    .hero-stat {
      text-align: center;
      padding: 16px 20px;
      background: linear-gradient(180deg, #132A1F 0%, #0A1711 100%);
      border: 1px solid #10B981;
      border-radius: 12px;
      margin-bottom: 16px;
      page-break-inside: avoid;
    }
    .hero-number {
      font-size: 46px;
      font-weight: 900;
      color: #FACC15;
      line-height: 1;
    }
    .hero-label {
      font-size: 10px;
      font-weight: 900;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #FFFFFF;
      margin-top: 6px;
    }
    .grid {
      display: flex;
      gap: 12px;
      margin-bottom: 14px;
      page-break-inside: avoid;
    }
    .col {
      flex: 1;
      background: #12151E;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 10px;
      padding: 14px 16px;
      page-break-inside: avoid;
    }
    .card-title {
      font-size: 9.5px;
      font-weight: 900;
      text-transform: uppercase;
      color: #FACC15;
      letter-spacing: 1px;
      margin-bottom: 10px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      padding-bottom: 5px;
    }
    .stat-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 5px 0;
      border-bottom: 1px solid rgba(255,255,255,0.04);
      font-size: 11px;
    }
    .stat-label {
      color: #9CA3AF;
      font-weight: 600;
    }
    .stat-value {
      font-weight: 800;
      color: #FFFFFF;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10.5px;
    }
    th {
      border-bottom: 1px solid rgba(255,255,255,0.12);
      color: #9CA3AF;
      text-align: left;
      padding: 6px 8px;
      font-weight: 800;
      text-transform: uppercase;
      font-size: 8.5px;
      letter-spacing: 0.8px;
    }
    td {
      padding: 6px 8px;
      border-bottom: 1px solid rgba(255,255,255,0.04);
      color: #FFFFFF;
    }
    .tag {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      margin: 2px 3px 2px 0;
    }
    .tag-green { background: rgba(16,185,129,0.2); color: #34D399; border: 1px solid rgba(16,185,129,0.4); }
    .tag-blue { background: rgba(0,174,239,0.2); color: #38BDF8; border: 1px solid rgba(0,174,239,0.4); }
    .tag-orange { background: rgba(255,68,34,0.2); color: #FF6B4A; border: 1px solid rgba(255,68,34,0.4); }
    .footer {
      margin-top: 30px;
      border-top: 1px solid rgba(255,255,255,0.1);
      padding-top: 14px;
      font-size: 8.5px;
      text-align: center;
      color: #71717A;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      page-break-inside: avoid;
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    <div>
      <h1 class="brand-title">TOUCHES™</h1>
      <div class="brand-sub">Footballer Athletics · Official Player Performance Dossier</div>
    </div>
    <div class="badge">${reportTitle}</div>
  </div>

  <!-- Player Bar -->
  <div class="player-bar">
    <div class="player-bar-item">
      <span class="player-bar-label">Player Name</span>
      <span class="player-bar-value" style="color: #FACC15;">${playerName}</span>
    </div>
    <div class="player-bar-item">
      <span class="player-bar-label">Position</span>
      <span class="player-bar-value">${position}</span>
    </div>
    <div class="player-bar-item">
      <span class="player-bar-label">Dominant Foot</span>
      <span class="player-bar-value">${activeFoot}</span>
    </div>
    <div class="player-bar-item">
      <span class="player-bar-label">Club / Team</span>
      <span class="player-bar-value">${club} · ${team}</span>
    </div>
    <div class="player-bar-item">
      <span class="player-bar-label">Session Date</span>
      <span class="player-bar-value">${date}</span>
    </div>
  </div>

  <!-- Dynamic Section Content -->
  ${sectionBodyHtml}

  <!-- Footer -->
  <div class="footer">
    TOUCHES™ © 2026 Footballer Athletics™ · Founded by Coach Clem Murdock · All Rights Reserved
  </div>
</body>
</html>
    `;

    const { uri } = await Print.printToFileAsync({ html });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        UTI: '.pdf',
        mimeType: 'application/pdf',
        dialogTitle: `Share ${playerName}'s ${reportTitle}`,
      });
    } else {
      Alert.alert('PDF Created', `Report generated successfully:\n${uri}`);
    }
  } catch (error) {
    console.error('Error generating PDF report:', error);
    Alert.alert('Error', 'Failed to generate PDF report. Please try again.');
  }
}

// ─────────────────────────────────────────────────────────────
// Section Specific Content Builders
// ─────────────────────────────────────────────────────────────

function buildTouchCounterHtml({ stats, session, data, date, time }) {
  const total = data?.stats?.total ?? stats?.total ?? 0;
  const good = data?.stats?.good ?? stats?.good ?? 0;
  const bad = data?.stats?.bad ?? stats?.bad ?? 0;
  const goodPct = total > 0 ? Math.round((good / total) * 100) : 0;
  const badPct = total > 0 ? Math.round((bad / total) * 100) : 0;

  const currentStats = data?.stats || stats || {};
  const playerName = data?.playerName || session?.playerName || 'Player';
  const playerAge = data?.age || session?.age || '-';
  const playerPos = data?.position || session?.position || 'Forward';
  const playerNum = data?.number || data?.playerNumber || session?.number || '-';
  const trainingLoc = data?.trainingLocation || 'Pitch Training Field';
  const gameLoc = data?.gameLocation || 'Main Match Arena';
  const trainingTime = data?.timeInTraining || 60;
  const minutesPlayed = data?.minutesPlayed || 120;

  return `
    <div class="hero-stat">
      <div class="hero-number">${total}</div>
      <div class="hero-label">Total Live Touches Logged</div>
      <div style="font-size: 11.5px; color: #34D399; margin-top: 6px; font-weight: 700;">
        Positive: ${good} (${goodPct}%) &nbsp;|&nbsp; Negative: ${bad} (${badPct}%)
      </div>
    </div>

    <div class="grid">
      <div class="col">
        <div class="card-title">Player & Session Context</div>
        <div class="stat-row"><span class="stat-label">Player Name</span><span class="stat-value" style="color: #FACC15;">${playerName}</span></div>
        <div class="stat-row"><span class="stat-label">Age</span><span class="stat-value">${playerAge}</span></div>
        <div class="stat-row"><span class="stat-label">Player Position</span><span class="stat-value">${playerPos}</span></div>
        <div class="stat-row"><span class="stat-label">Jersey Number</span><span class="stat-value">${playerNum}</span></div>
        <div class="stat-row"><span class="stat-label">Session Timestamp</span><span class="stat-value">${date} · ${time}</span></div>
        <div class="stat-row"><span class="stat-label">Training Location</span><span class="stat-value">${trainingLoc}</span></div>
        <div class="stat-row"><span class="stat-label">Game Location</span><span class="stat-value">${gameLoc}</span></div>
        <div class="stat-row"><span class="stat-label">Time In Training</span><span class="stat-value">${trainingTime} mins</span></div>
        <div class="stat-row"><span class="stat-label">Match Minutes Played</span><span class="stat-value">${minutesPlayed} mins</span></div>
      </div>

      <div class="col">
        <div class="card-title">Live Ball Actions</div>
        <div class="stat-row"><span class="stat-label">Passes</span><span class="stat-value">${currentStats.Pass ?? 0}</span></div>
        <div class="stat-row"><span class="stat-label">Dribbles</span><span class="stat-value">${currentStats.Dribble ?? 0}</span></div>
        <div class="stat-row"><span class="stat-label">Shots</span><span class="stat-value">${currentStats.Shot ?? 0}</span></div>
        <div class="stat-row"><span class="stat-label">Goals Scored</span><span class="stat-value" style="color: #FACC15;">${currentStats.Goal ?? 0}</span></div>
        <div class="stat-row"><span class="stat-label">Tackles Won</span><span class="stat-value">${currentStats.Tackle ?? 0}</span></div>
        <div class="stat-row"><span class="stat-label">Headers</span><span class="stat-value">${currentStats.Header ?? 0}</span></div>
        <div class="stat-row"><span class="stat-label">Corner Kicks</span><span class="stat-value">${currentStats['Corner Kick'] ?? 0}</span></div>
        <div class="stat-row"><span class="stat-label">Free Kicks</span><span class="stat-value">${currentStats['Free Kick'] ?? 0}</span></div>
        <div class="stat-row"><span class="stat-label">Throw-Ins</span><span class="stat-value">${currentStats['Throw-In'] ?? 0}</span></div>
      </div>
    </div>

    <div class="card" style="margin-top: 14px;">
      <div class="card-title">Independent Match Events & Counters</div>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
        <div class="stat-row" style="padding: 4px 8px; background: rgba(255,255,255,0.03); border-radius: 6px;"><span class="stat-label">Yellow Card</span><span class="stat-value" style="color: #FACC15;">${currentStats['Yellow Card'] ?? 0}</span></div>
        <div class="stat-row" style="padding: 4px 8px; background: rgba(255,255,255,0.03); border-radius: 6px;"><span class="stat-label">Red Card</span><span class="stat-value" style="color: #EF4444;">${currentStats['Red Card'] ?? 0}</span></div>
        <div class="stat-row" style="padding: 4px 8px; background: rgba(255,255,255,0.03); border-radius: 6px;"><span class="stat-label">Missed Game</span><span class="stat-value">${currentStats['Missed Game'] ?? 0}</span></div>
        <div class="stat-row" style="padding: 4px 8px; background: rgba(255,255,255,0.03); border-radius: 6px;"><span class="stat-label">Sub In</span><span class="stat-value">${currentStats['Sub In'] ?? 0}</span></div>
        <div class="stat-row" style="padding: 4px 8px; background: rgba(255,255,255,0.03); border-radius: 6px;"><span class="stat-label">Sub Out</span><span class="stat-value">${currentStats['Sub Out'] ?? 0}</span></div>
        <div class="stat-row" style="padding: 4px 8px; background: rgba(255,255,255,0.03); border-radius: 6px;"><span class="stat-label">Injury</span><span class="stat-value">${currentStats.Injury ?? 0}</span></div>
        <div class="stat-row" style="padding: 4px 8px; background: rgba(255,255,255,0.03); border-radius: 6px;"><span class="stat-label">Penalty</span><span class="stat-value">${currentStats.Penalty ?? currentStats['Penalty Kick'] ?? 0}</span></div>
        <div class="stat-row" style="padding: 4px 8px; background: rgba(255,255,255,0.03); border-radius: 6px;"><span class="stat-label">Keep-Up-Feet</span><span class="stat-value">${currentStats['Keep-Up-Feet'] ?? 0}</span></div>
        <div class="stat-row" style="padding: 4px 8px; background: rgba(255,255,255,0.03); border-radius: 6px;"><span class="stat-label">Keep-Up-Head</span><span class="stat-value">${currentStats['Keep-Up-Head'] ?? 0}</span></div>
      </div>
    </div>
  `;
}

async function buildPlayerStatsHtml({ stats, session, data, profile, date }) {
  let career = data || {};
  if (!data || Object.keys(data).length <= 2) {
    try {
      const savedCareer = await AsyncStorage.getItem('playerCareerStats');
      if (savedCareer) career = { ...career, ...JSON.parse(savedCareer) };
    } catch (e) {}
  }

  const num = (v, fallback = 0) => (v !== undefined && v !== null && v !== '' ? v : fallback);

  const careerTouches = num(career.totalTouches, stats?.total ?? 0);
  const yearsPlaying = num(career.totalYearsPlaying, profile?.totalYearsPlaying ?? session?.totalYearsPlaying ?? 0);
  const hoursTrained = num(career.totalHoursTrained, profile?.totalHoursTrained ?? session?.totalHoursTrained ?? 0);
  const gamesPlayed = num(career.totalGames ?? career.totalGamesPlayed, 0);

  return `
    <div class="hero-stat">
      <div class="hero-number">${careerTouches}</div>
      <div class="hero-label">Career Total Touches Recorded</div>
      <div style="font-size: 11px; color: #FACC15; margin-top: 6px; font-weight: 700;">
        ${hoursTrained} Hours Trained &nbsp;·&nbsp; ${gamesPlayed} Games Played &nbsp;·&nbsp; ${yearsPlaying} Years Active
      </div>
    </div>

    <div class="grid">
      <div class="col">
        <div class="card-title">Career Technical Actions</div>
        <div class="stat-row"><span class="stat-label">Total Passes</span><span class="stat-value">${num(career.totalPasses, 0)}</span></div>
        <div class="stat-row"><span class="stat-label">Total Dribbles</span><span class="stat-value">${num(career.totalDribbles, 0)}</span></div>
        <div class="stat-row"><span class="stat-label">Total Shots</span><span class="stat-value">${num(career.totalShots, 0)}</span></div>
        <div class="stat-row"><span class="stat-label">Shots on Target</span><span class="stat-value">${num(career.shotsOnTarget, 0)}</span></div>
        <div class="stat-row"><span class="stat-label">Total Goals</span><span class="stat-value" style="color: #FACC15;">${num(career.totalGoals, 0)}</span></div>
        <div class="stat-row"><span class="stat-label">Tackles Made</span><span class="stat-value">${num(career.tacklesMade, 0)}</span></div>
        <div class="stat-row"><span class="stat-label">Headers Won</span><span class="stat-value">${num(career.headers, 0)}</span></div>
      </div>

      <div class="col">
        <div class="card-title">Set Pieces & Match Events</div>
        <div class="stat-row"><span class="stat-label">Corner Kicks</span><span class="stat-value">${num(career.totalCornerKicks, 0)}</span></div>
        <div class="stat-row"><span class="stat-label">Free Kicks</span><span class="stat-value">${num(career.freeKicks, 0)}</span></div>
        <div class="stat-row"><span class="stat-label">Throw-Ins</span><span class="stat-value">${num(career.totalThrowIns, 0)}</span></div>
        <div class="stat-row"><span class="stat-label">Penalties</span><span class="stat-value">${num(career.totalPenalties, 0)}</span></div>
        <div class="stat-row"><span class="stat-label">Yellow Cards</span><span class="stat-value">${num(career.yellowCards, 0)}</span></div>
        <div class="stat-row"><span class="stat-label">Red Cards</span><span class="stat-value">${num(career.redCards, 0)}</span></div>
        <div class="stat-row"><span class="stat-label">Sub In / Out</span><span class="stat-value">${num(career.subIn, 0)} / ${num(career.subOut, 0)}</span></div>
      </div>
    </div>

    <div class="grid">
      <div class="col">
        <div class="card-title">Player Development</div>
        <div class="stat-row"><span class="stat-label">Years Playing</span><span class="stat-value">${yearsPlaying}</span></div>
        <div class="stat-row"><span class="stat-label">Hours Trained</span><span class="stat-value">${hoursTrained}</span></div>
        <div class="stat-row"><span class="stat-label">Total Sessions</span><span class="stat-value">${num(career.totalSessions, stats?.totalSessions ?? 0)}</span></div>
        <div class="stat-row"><span class="stat-label">Recovery Days</span><span class="stat-value">${num(career.recoveryDays, 0)}</span></div>
        <div class="stat-row"><span class="stat-label">Keep-Up-Feet</span><span class="stat-value" style="color: #FACC15;">${num(career.keepUpFeet, 0)}</span></div>
        <div class="stat-row"><span class="stat-label">Keep-Up-Head</span><span class="stat-value" style="color: #FACC15;">${num(career.keepUpHead, 0)}</span></div>
      </div>
    </div>
  `;
}

async function buildMatchPrepHtml({ data, session, date }) {
  let prep = data || {};
  try {
    const opp = await AsyncStorage.getItem('prep_opponent');
    const time = await AsyncStorage.getItem('prep_kickoffTime');
    const ven = await AsyncStorage.getItem('prep_venue');
    const checked = await AsyncStorage.getItem('prep_checkedItems');
    const notes = await AsyncStorage.getItem('prep_tacticalNotes');

    if (!prep.opponent && opp) prep.opponent = opp;
    if (!prep.kickoffTime && time) prep.kickoffTime = time;
    if (!prep.venue && ven) prep.venue = ven;
    if (!prep.checkedItems && checked) prep.checkedItems = JSON.parse(checked);
    if (!prep.tacticalNotes && notes) prep.tacticalNotes = notes;
  } catch (e) {}

  const defaultChecklist = [
    { id: 'cleats', label: 'Clean Boots & Extra Studs Packed', category: 'GEAR' },
    { id: 'shinguards', label: 'Shin Guards & Grip Socks In Bag', category: 'GEAR' },
    { id: 'water', label: '2L Water & Electrolytes Bottle Ready', category: 'HYDRATION' },
    { id: 'nutrition', label: 'Pre-Match Meal 3 Hours Before Kickoff', category: 'NUTRITION' },
    { id: 'tactics', label: 'Review Team Tactics & Individual Goals', category: 'MINDSET' },
    { id: 'visualization', label: '10-Min Match Visualization & Focus', category: 'MINDSET' },
    { id: 'warmup', label: 'Dynamic Stretching & Ball Touch Activation', category: 'PHYSICAL' },
  ];

  const checked = prep.checkedItems || [];
  const completedCount = defaultChecklist.filter((c) => checked.includes(c.id)).length;

  const checklistRows = defaultChecklist
    .map((item) => {
      const isDone = checked.includes(item.id);
      return `
      <tr>
        <td style="width: 70px;">
          <span class="${isDone ? 'tag tag-green' : 'tag'}" style="${!isDone ? 'background: rgba(255,255,255,0.06); color: #71717A;' : ''}">
            ${isDone ? 'READY' : 'PENDING'}
          </span>
        </td>
        <td style="color: #FACC15; font-weight: 700; width: 100px;">${item.category}</td>
        <td>${item.label}</td>
      </tr>
    `;
    })
    .join('');

  return `
    <div class="grid">
      <div class="col">
        <div class="card-title">Match Information</div>
        <div class="stat-row"><span class="stat-label">Opponent</span><span class="stat-value" style="color: #FF4422; font-size: 13px;">${prep.opponent || 'Upcoming Rival'}</span></div>
        <div class="stat-row"><span class="stat-label">Kickoff Time</span><span class="stat-value">${prep.kickoffTime || '10:30 AM'}</span></div>
        <div class="stat-row"><span class="stat-label">Venue / Stadium</span><span class="stat-value">${prep.venue || 'Home Stadium'}</span></div>
        <div class="stat-row"><span class="stat-label">Preparation Readiness</span><span class="stat-value" style="color: #34D399;">${completedCount} of ${defaultChecklist.length} Items Complete</span></div>
      </div>

      <div class="col">
        <div class="card-title">Tactical Match Notes</div>
        <div style="font-size: 11px; line-height: 1.5; color: #E4E4E7; white-space: pre-wrap; min-height: 70px;">
          ${prep.tacticalNotes || 'Play aggressive in transitions. Explode down flanks and support quick combinations.'}
        </div>
      </div>
    </div>

    <div class="col" style="margin-top: 10px;">
      <div class="card-title">Match Day Preparation Protocol</div>
      <table>
        <thead>
          <tr>
            <th>Status</th>
            <th>Category</th>
            <th>Checklist Item</th>
          </tr>
        </thead>
        <tbody>
          ${checklistRows}
        </tbody>
      </table>
    </div>
  `;
}

async function buildRosterHtml({ data, reflection, session, date }) {
  let roster = data || {};
  if (!roster.records) {
    try {
      const saved = await AsyncStorage.getItem('playerAttendance');
      if (saved) roster = JSON.parse(saved);
      else if (reflection?.attendance) roster = reflection.attendance;
    } catch (e) {}
  }

  const records = roster.records || Array.from({ length: 14 }, (_, i) => ({
    id: i + 1,
    name: `Player ${i + 1}`,
    grade: i % 3 === 0 ? 'VG' : i % 2 === 0 ? 'G' : 'A',
  }));

  const rows = records
    .map((r, index) => {
      const gradeColor =
        r.grade === 'VG'
          ? '#10B981'
          : r.grade === 'G'
          ? '#00AEEF'
          : r.grade === 'A'
          ? '#F59E0B'
          : '#EF4444';
      const gradeLabel =
        r.grade === 'VG' ? 'Very Good' : r.grade === 'G' ? 'Good' : r.grade === 'A' ? 'Average' : 'Needs Work';

      return `
      <tr>
        <td style="width: 35px; color: #71717A; font-weight: 700;">#${r.id || index + 1}</td>
        <td style="font-weight: 700;">${r.name || `Player ${index + 1}`}</td>
        <td style="text-align: center; width: 60px;">
          <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-weight: 900; background: ${gradeColor}25; color: ${gradeColor}; border: 1px solid ${gradeColor}50;">
            ${r.grade || 'G'}
          </span>
        </td>
        <td style="color: ${gradeColor}; font-weight: 600; text-align: right;">${gradeLabel}</td>
      </tr>
    `;
    })
    .join('');

  return `
    <div class="grid">
      <div class="col">
        <div class="card-title">Squad Details</div>
        <div class="stat-row"><span class="stat-label">Team</span><span class="stat-value">${roster.metadata?.team || session?.team || 'Competitive Squad'}</span></div>
        <div class="stat-row"><span class="stat-label">Date Recorded</span><span class="stat-value">${roster.metadata?.date || date}</span></div>
        <div class="stat-row"><span class="stat-label">Squad Members</span><span class="stat-value">${records.length} Players</span></div>
      </div>
      <div class="col">
        <div class="card-title">Performance Grade Guide</div>
        <div class="stat-row"><span class="stat-label"><strong style="color: #10B981;">VG</strong> · Very Good</span><span class="stat-value">Elite Match Performance</span></div>
        <div class="stat-row"><span class="stat-label"><strong style="color: #00AEEF;">G</strong> · Good</span><span class="stat-value">Consistent High Standards</span></div>
        <div class="stat-row"><span class="stat-label"><strong style="color: #F59E0B;">A</strong> · Average</span><span class="stat-value">Satisfactory Execution</span></div>
      </div>
    </div>

    <div class="col" style="margin-top: 10px;">
      <div class="card-title">Squad Attendance & Grade Roster</div>
      <table>
        <thead>
          <tr>
            <th>No.</th>
            <th>Player Name</th>
            <th style="text-align: center;">Grade</th>
            <th style="text-align: right;">Evaluation Status</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}

async function buildLineupHtml({ data, reflection, session, date }) {
  let formation = data || {};
  if (!formation.players) {
    try {
      const saved = await AsyncStorage.getItem('footballFormation');
      if (saved) formation = JSON.parse(saved);
      else if (reflection?.formation) formation = reflection.formation;
    } catch (e) {}
  }

  const POSITIONS = [
    { number: 1, label: 'GOALKEEPER (GK)' },
    { number: 2, label: 'RIGHT BACK (RB)' },
    { number: 3, label: 'LEFT BACK (LB)' },
    { number: 4, label: 'CENTER BACK (CB)' },
    { number: 5, label: 'CENTER BACK (CB)' },
    { number: 6, label: 'DEFENSIVE MID (CDM)' },
    { number: 7, label: 'RIGHT WINGER (RW)' },
    { number: 8, label: 'CENTRAL MID (CM)' },
    { number: 9, label: 'STRIKER (ST)' },
    { number: 10, label: 'ATTACKING MID (CAM)' },
    { number: 11, label: 'LEFT WINGER (LW)' },
  ];

  const players = formation.players || {};

  const rows = POSITIONS.map((pos) => {
    const raw = players[pos.number] || ',,';
    const parts = raw.split(',');
    const starter = parts[0]?.trim() || `Starter #${pos.number}`;
    const sub1 = parts[1]?.trim() || '—';
    const sub2 = parts[2]?.trim() || '—';

    return `
      <tr>
        <td style="font-weight: 900; color: #FACC15; width: 40px; text-align: center;">${pos.number}</td>
        <td style="font-weight: 700; width: 170px;">${pos.label}</td>
        <td style="color: #34D399; font-weight: 800;">${starter}</td>
        <td style="color: #A1A1AA;">${sub1}</td>
        <td style="color: #71717A;">${sub2}</td>
      </tr>
    `;
  }).join('');

  return `
    <div class="grid">
      <div class="col">
        <div class="card-title">Tactical Match Information</div>
        <div class="stat-row"><span class="stat-label">Team Name</span><span class="stat-value">${formation.teamName || session?.team || 'Touches XI'}</span></div>
        <div class="stat-row"><span class="stat-label">Age Group</span><span class="stat-value">${formation.ageGroup || 'U16'}</span></div>
        <div class="stat-row"><span class="stat-label">Opponent</span><span class="stat-value">${formation.opponent || 'Upcoming Opponent'}</span></div>
        <div class="stat-row"><span class="stat-label">Match Date</span><span class="stat-value">${formation.date || date}</span></div>
        <div class="stat-row"><span class="stat-label">Formation</span><span class="stat-value" style="color: #FF4422; font-weight: 800;">${formation.formation || '4-3-3'}</span></div>
      </div>
    </div>

    <div class="col" style="margin-top: 10px;">
      <div class="card-title">11-Player Pitch Lineup & Tactical Substitutions</div>
      <table>
        <thead>
          <tr>
            <th style="text-align: center;">No.</th>
            <th>Position</th>
            <th style="color: #34D399;">Starting XI</th>
            <th style="color: #A1A1AA;">Sub 1</th>
            <th style="color: #71717A;">Sub 2</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}

async function buildEvaluationHtml({ data, reflection, playerName, session, date }) {
  let ev = data || {};
  if (!ev.ratings) {
    try {
      const saved = await AsyncStorage.getItem('playerEvaluation');
      if (saved) ev.ratings = JSON.parse(saved);
      else if (reflection?.detailedEvaluation) ev.ratings = reflection.detailedEvaluation;

      const by = await AsyncStorage.getItem('playerEvaluationBy');
      if (by) ev.evaluatedBy = by;
    } catch (e) {}
  }

  const ratings = ev.ratings || {};
  const evaluatedBy = ev.evaluatedBy || 'Coach Clem Murdock';

  const CATEGORIES = {
    'ATHLETIC SKILLS': ['Agility / quickness', 'Jumping', 'Speed', 'Endurance', 'Suppleness (mobility)', 'Core muscles'],
    'TACTICAL AWARENESS': ['Reading the game', 'Attacking one-on-one', 'Defending one-on-one', 'Technique under pressure'],
    'CO-ORDINATION': ['Orientation', 'Rhythm', 'Differentiation', 'Reaction', 'Balance'],
    'MENTAL STRENGTHS': ['Concentration', 'Willpower / will to win', 'Perseverance', 'Confidence', 'Willingness to take risks', 'Creativity'],
    'SOCIAL SKILLS': ['Communication', 'Positive attitude', 'Team player'],
  };

  const RATING_LABELS = {
    1: { text: 'Very Good', color: '#10B981' },
    2: { text: 'Good', color: '#00AEEF' },
    3: { text: 'Average', color: '#F59E0B' },
    4: { text: 'Poor', color: '#EF4444' },
  };

  let totalScore = 0;
  let count = 0;

  const categoriesHtml = Object.entries(CATEGORIES)
    .map(([catTitle, skills]) => {
      const skillRows = skills
        .map((skill) => {
          const val = ratings[skill] || (count % 2 === 0 ? 1 : 2);
          totalScore += Number(val);
          count++;
          const meta = RATING_LABELS[val] || RATING_LABELS[2];

          return `
          <div class="stat-row">
            <span class="stat-label">${skill}</span>
            <span class="stat-value" style="color: ${meta.color};">${val} · ${meta.text}</span>
          </div>
        `;
        })
        .join('');

      return `
      <div class="col" style="margin-bottom: 12px;">
        <div class="card-title">${catTitle}</div>
        ${skillRows}
      </div>
    `;
    })
    .join('');

  const avg = count > 0 ? (totalScore / count).toFixed(1) : '1.8';

  return `
    <div class="hero-stat" style="background: linear-gradient(180deg, #1A1F30 0%, #0F121C 100%); border-color: #00AEEF;">
      <div class="hero-number" style="color: #00AEEF;">${avg} <span style="font-size: 20px; color: #71717A;">/ 4.0</span></div>
      <div class="hero-label">Overall Evaluation Rating</div>
      <div style="font-size: 11px; color: #FACC15; margin-top: 6px; font-weight: 700;">
        Evaluated By: ${evaluatedBy} · Focus Area: Technical & Tactical Mastery
      </div>
    </div>

    ${categoriesHtml}
  `;
}

async function buildReflectionHtml({ data, reflection, playerName, activeFoot, date }) {
  let ref = data || {};
  if (!ref.wellDoneTags && !ref.achievedGoal) {
    try {
      const saved = await AsyncStorage.getItem('playerReflection');
      if (saved) ref = JSON.parse(saved);
      else if (reflection) ref = reflection;
    } catch (e) {}
  }

  const tags = ref.wellDoneTags && ref.wellDoneTags.length > 0
    ? ref.wellDoneTags
    : ['PASSING', 'ATTACKING', 'FIRST TOUCH', 'BALL CONTROL', 'DECISIONS'];

  const tagsHtml = tags
    .map((t) => `<span class="tag tag-green">${t}</span>`)
    .join('');

  const METRICS = [
    'ENDURANCE', 'ENERGY', 'DECISION MAKING', 'CONFIDENCE',
    'MOTIVATION', 'FOCUS', 'FIRST TOUCH', 'PASSING', 'TEAM PLAYER',
  ];

  const metricsHtml = METRICS.map((metric) => {
    const score = ref.detailedPerformance?.[metric] || 8;
    return `
      <div class="stat-row">
        <span class="stat-label">${metric}</span>
        <span class="stat-value" style="color: ${score >= 8 ? '#34D399' : '#FACC15'};">${score} / 10</span>
      </div>
    `;
  }).join('');

  return `
    <div class="col" style="margin-bottom: 14px;">
      <div class="card-title">Areas of Success & Strengths Today ("What Went Well")</div>
      <div style="margin-top: 4px;">${tagsHtml}</div>
    </div>

    <div class="grid">
      <div class="col">
        <div class="card-title">Player Reflection & Key Insights</div>
        <div style="margin-bottom: 12px;">
          <span style="font-size: 9px; font-weight: 800; color: #FACC15; text-transform: uppercase;">Goal Achievement</span>
          <p style="margin: 4px 0 0; color: #E4E4E7; font-size: 11px; line-height: 1.5;">
            ${ref.achievedGoal || 'Achieved primary goal of keeping possession and scanning before receiving.'}
          </p>
        </div>
        <div style="margin-bottom: 12px;">
          <span style="font-size: 9px; font-weight: 800; color: #34D399; text-transform: uppercase;">What Was Learned</span>
          <p style="margin: 4px 0 0; color: #E4E4E7; font-size: 11px; line-height: 1.5;">
            ${ref.whatLearned || 'Ankle lock on weak foot strikes makes first touches vastly more consistent.'}
          </p>
        </div>
        <div>
          <span style="font-size: 9px; font-weight: 800; color: #F87171; text-transform: uppercase;">Areas to Improve Next Session</span>
          <p style="margin: 4px 0 0; color: #E4E4E7; font-size: 11px; line-height: 1.5;">
            ${ref.whatWouldChange || 'Accelerate immediately after releasing passes to create passing triangles.'}
          </p>
        </div>
      </div>

      <div class="col">
        <div class="card-title">Mindset & Physical State Scores (1-10)</div>
        ${metricsHtml}
      </div>
    </div>
  `;
}

async function buildChallengeHtml({ data, date }) {
  let challenge = data || {};
  if (!challenge.completedDays) {
    try {
      const cDays = await AsyncStorage.getItem('completedDays');
      const refs = await AsyncStorage.getItem('reflections');
      if (cDays) challenge.completedDays = JSON.parse(cDays);
      if (refs) challenge.reflections = JSON.parse(refs);
    } catch (e) {}
  }

  const completed = challenge.completedDays || [1, 2, 3, 4, 5];
  const activeDay = challenge.activeDay || 6;
  const pct = Math.round((completed.length / 30) * 100);

  const notes = challenge.reflections?.[activeDay] || 'Felt crisp on balance and explosive acceleration out of the turn.';

  const badges = Array.from({ length: 30 }, (_, i) => {
    const day = i + 1;
    const isDone = completed.includes(day);
    const isActive = day === activeDay;
    return `
      <span style="display: inline-block; width: 28px; height: 28px; line-height: 28px; text-align: center; border-radius: 6px; font-weight: 900; font-size: 10px; margin: 3px; ${
        isDone
          ? 'background: #10B981; color: #FFFFFF;'
          : isActive
          ? 'background: #FF4422; color: #FFFFFF; border: 1px solid #FFFFFF;'
          : 'background: rgba(255,255,255,0.06); color: #71717A;'
      }">
        ${day}
      </span>
    `;
  }).join('');

  return `
    <div class="hero-stat" style="background: linear-gradient(180deg, #3A1B14 0%, #1A0D0A 100%); border-color: #FF4422;">
      <div class="hero-number" style="color: #FF4422;">${completed.length} <span style="font-size: 20px; color: #A1A1AA;">/ 30</span></div>
      <div class="hero-label">Challenge Days Completed (${pct}%)</div>
      <div style="font-size: 11px; color: #FACC15; margin-top: 6px; font-weight: 700;">
        Current Active Challenge: Day ${activeDay} · Focus & Ball Mastery
      </div>
    </div>

    <div class="grid">
      <div class="col">
        <div class="card-title">Active Drill Focus (Day ${activeDay})</div>
        <div class="stat-row"><span class="stat-label">Daily Challenge</span><span class="stat-value" style="color: #FACC15;">Day ${activeDay}</span></div>
        <div class="stat-row"><span class="stat-label">Completion Status</span><span class="stat-value" style="color: ${completed.includes(activeDay) ? '#34D399' : '#FF6B4A'};">${completed.includes(activeDay) ? 'COMPLETED' : 'IN PROGRESS'}</span></div>
        <div style="margin-top: 10px; font-size: 11px; color: #E4E4E7; line-height: 1.5;">
          Focus on precision repetition, locked ankle, and explosive change of pace.
        </div>
      </div>

      <div class="col">
        <div class="card-title">Player Drill Reflection Notes</div>
        <div style="font-size: 11px; color: #E4E4E7; line-height: 1.5; white-space: pre-wrap;">
          ${notes}
        </div>
      </div>
    </div>

    <div class="col" style="margin-top: 10px;">
      <div class="card-title">30-Day Mastery Progress Grid</div>
      <div style="display: flex; flex-wrap: wrap; justify-content: center; padding: 6px 0;">
        ${badges}
      </div>
    </div>
  `;
}

async function buildPassportHtml({ data, profile, session, playerName, activeFoot, club, team, position }) {
  const p = { ...profile, ...session, ...data };

  return `
    <div class="grid">
      <div class="col">
        <div class="card-title">Player Identity Credentials</div>
        <div class="stat-row"><span class="stat-label">Full Name</span><span class="stat-value" style="color: #FACC15; font-size: 13px;">${p.fullName || playerName}</span></div>
        <div class="stat-row"><span class="stat-label">Jersey Number</span><span class="stat-value">#${p.number || '10'}</span></div>
        <div class="stat-row"><span class="stat-label">Dominant Foot</span><span class="stat-value">${p.activeFooter || activeFoot}</span></div>
        <div class="stat-row"><span class="stat-label">Primary Position</span><span class="stat-value">${p.position || position}</span></div>
        <div class="stat-row"><span class="stat-label">Player Age</span><span class="stat-value">${p.age || '16'}</span></div>
      </div>

      <div class="col">
        <div class="card-title">Squad & League Registration</div>
        <div class="stat-row"><span class="stat-label">Club</span><span class="stat-value">${p.club || club}</span></div>
        <div class="stat-row"><span class="stat-label">Team</span><span class="stat-value">${p.team || team}</span></div>
        <div class="stat-row"><span class="stat-label">Level</span><span class="stat-value">${p.level || 'Competitive Academy'}</span></div>
        <div class="stat-row"><span class="stat-label">Division</span><span class="stat-value">${p.division || 'Premier Division'}</span></div>
        <div class="stat-row"><span class="stat-label">Country</span><span class="stat-value">${p.country || 'United States'}</span></div>
      </div>
    </div>

    <div class="grid" style="margin-top: 10px;">
      <div class="col" style="text-align: center; padding: 16px;">
        <div style="font-size: 32px; font-weight: 900; color: #10B981;">${p.totalHoursTrained || 140}</div>
        <div class="card-title" style="margin-top: 6px; border: none;">HOURS TRAINED</div>
      </div>
      <div class="col" style="text-align: center; padding: 16px;">
        <div style="font-size: 32px; font-weight: 900; color: #00AEEF;">${p.totalGames || 42}</div>
        <div class="card-title" style="margin-top: 6px; border: none;">GAMES PLAYED</div>
      </div>
      <div class="col" style="text-align: center; padding: 16px;">
        <div style="font-size: 32px; font-weight: 900; color: #FACC15;">${p.totalYearsPlaying || 6}</div>
        <div class="card-title" style="margin-top: 6px; border: none;">YEARS PLAYING</div>
      </div>
    </div>
  `;
}

async function buildNoteToCoachHtml({ data, reflection, playerName, date }) {
  let note = data || {};
  if (!note.whatILiked) {
    try {
      const saved = await AsyncStorage.getItem('noteToCoach');
      if (saved) note = JSON.parse(saved);
      else if (reflection?.noteToCoach) note = reflection.noteToCoach;
    } catch (e) {}
  }

  const tags = note.teachMeTags && note.teachMeTags.length > 0
    ? note.teachMeTags
    : ['FREE KICKS', 'FINISHING', '1V1 DEFENDING'];
  const tagsHtml = tags.map((t) => `<span class="tag tag-blue">${t}</span>`).join('');

  return `
    <div class="grid">
      <div class="col">
        <div class="card-title">Player Communications</div>
        <div style="margin-bottom: 12px;">
          <span style="font-size: 9px; font-weight: 800; color: #34D399; text-transform: uppercase;">What I Liked About The Session</span>
          <p style="margin: 4px 0 0; color: #E4E4E7; font-size: 11px; line-height: 1.5;">
            ${note.whatILiked || 'Fast paced tactical transitions and high repetition on goal.'}
          </p>
        </div>
        <div style="margin-bottom: 12px;">
          <span style="font-size: 9px; font-weight: 800; color: #F87171; text-transform: uppercase;">What I Would Change</span>
          <p style="margin: 4px 0 0; color: #E4E4E7; font-size: 11px; line-height: 1.5;">
            ${note.whatIWouldChange || 'More 1v1 attacking drills in the final third.'}
          </p>
        </div>
        <div>
          <span style="font-size: 9px; font-weight: 800; color: #00AEEF; text-transform: uppercase;">What I Would Like To Do More</span>
          <p style="margin: 4px 0 0; color: #E4E4E7; font-size: 11px; line-height: 1.5;">
            ${note.wouldLikeToDoMore || 'Practice set-pieces and penalty shootouts.'}
          </p>
        </div>
      </div>

      <div class="col">
        <div class="card-title">Staff Evaluation Grades (1-10)</div>
        <div class="stat-row"><span class="stat-label">Head Coach Rating</span><span class="stat-value" style="color: #FACC15;">${note.grades?.coach ?? 10} / 10</span></div>
        <div class="stat-row"><span class="stat-label">Assistant Coach Rating</span><span class="stat-value" style="color: #FACC15;">${note.grades?.assistantCoach ?? 10} / 10</span></div>
        <div class="stat-row"><span class="stat-label">Fitness Coach / Trainer</span><span class="stat-value" style="color: #FACC15;">${note.grades?.trainer ?? 10} / 10</span></div>

        <div class="card-title" style="margin-top: 14px;">Requested Skills To Learn</div>
        <div style="margin-top: 4px;">${tagsHtml}</div>
      </div>
    </div>
  `;
}

async function buildAiAgentHtml({ data, playerName, date }) {
  let msgs = data?.messages || [];
  if (!msgs || msgs.length === 0) {
    try {
      const saved = await AsyncStorage.getItem('aiAgentChat');
      if (saved) msgs = JSON.parse(saved);
    } catch (e) {}
  }

  if (!msgs || msgs.length === 0) {
    msgs = [
      { sender: 'agent', text: 'Ask me anything about the beautiful game — how to improve your technique, tactics, fitness, or mindset.' },
      { sender: 'user', text: 'How do I improve my first touch?' },
      { sender: 'agent', text: 'Lock your ankle and cushion the ball on impact. Keep your body relaxed and plan your next move before the ball arrives.' },
    ];
  }

  const chatRows = msgs
    .map((m) => {
      const isAgent = m.sender === 'agent' || m.sender === 'bot';
      return `
      <div style="margin-bottom: 12px; padding: 10px 12px; border-radius: 8px; background: ${isAgent ? '#181C28' : '#271915'}; border-left: 3px solid ${isAgent ? '#00AEEF' : '#FF4422'};">
        <div style="font-size: 8.5px; font-weight: 800; color: ${isAgent ? '#00AEEF' : '#FF6B4A'}; text-transform: uppercase; margin-bottom: 4px;">
          ${isAgent ? 'Touches AI Coach Mentor' : playerName}
        </div>
        <div style="font-size: 11px; color: #F4F4F5; line-height: 1.5; white-space: pre-wrap;">${m.text}</div>
      </div>
    `;
    })
    .join('');

  return `
    <div class="col">
      <div class="card-title">AI Player Mentor Coaching Transcript</div>
      ${chatRows}
    </div>
  `;
}

function buildPolicyHtml() {
  return `
    <div class="col">
      <div class="card-title">Footballer Athletics Platform Usage Policy</div>
      <p style="font-size: 11.5px; line-height: 1.6; color: #D1D5DB; margin-bottom: 10px;">
        Touches™ provides advanced soccer skill tracking, cognitive analytics, touch counters, and match preparation protocols for athletes and clubs worldwide.
      </p>
      <div class="stat-row"><span class="stat-label">Data Privacy</span><span class="stat-value" style="color: #10B981;">Athlete Protected</span></div>
      <div class="stat-row"><span class="stat-label">Performance Integrity</span><span class="stat-value">Certified Official</span></div>
      <div class="stat-row"><span class="stat-label">Platform Version</span><span class="stat-value">Footballer Athletics v1.0 Mobile</span></div>
    </div>
  `;
}

async function buildFullMatchHtml({ session, stats, reflection, data, profile, playerName, club, team, position, activeFoot, date, time }) {
  const touchHtml = buildTouchCounterHtml({ stats, session, data, date, time });
  const prepHtml = await buildMatchPrepHtml({ data, session, date });
  const reflectionHtml = await buildReflectionHtml({ data, reflection, playerName, activeFoot, date });

  return `
    ${touchHtml}
    <div style="page-break-before: always; margin-top: 20px;"></div>
    ${prepHtml}
    <div style="page-break-before: always; margin-top: 20px;"></div>
    ${reflectionHtml}
  `;
}
