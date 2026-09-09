import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Path,
  Rect,
  Circle,
  Polygon,
  G,
  Line,
  Text as SvgText,
} from 'react-native-svg';

export type RoadSignCode = string;

interface RoadSignGraphicProps {
  signCode?: string | null;
  category?: string | null;
  questionText?: string | null;
  size?: number;
}

/**
 * High-definition modular vector road sign renderer for driving tests.
 * Renders crisp, international standard road signs offline without network latency.
 * Supports all 162 Canonical Platform Signs (72 Regulatory, 60 Warning, 30 Traffic Signals)
 * and rich General Knowledge scenario graphics with guaranteed zero-failure fallback.
 */
export const RoadSignGraphic: React.FC<RoadSignGraphicProps> = ({
  signCode,
  category,
  questionText,
  size = 140,
}) => {
  const rawCode = (signCode || '').toUpperCase().trim();
  const cat = (category || '').toUpperCase().trim();

  // If both signCode and category are missing, do not render
  if (!rawCode && !cat) return null;

  // ---------------------------------------------------------------------------
  // Geometry Helper Functions
  // ---------------------------------------------------------------------------

  // 1. Warning Diamond (Yellow standard)
  const renderWarningDiamond = (content: React.ReactNode, bg = '#FFC800') => (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Polygon points="50,4 96,50 50,96 4,50" fill={bg} stroke="#000000" strokeWidth="3" />
      <Polygon points="50,9 91,50 50,91 9,50" fill="none" stroke="#000000" strokeWidth="1.5" />
      {content}
    </Svg>
  );

  // 2. Regulatory Circle (Vienna Convention: White disk with thick red border)
  const renderRegulatoryCircle = (content: React.ReactNode, bg = '#FFFFFF') => (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="46" fill="#DC2626" />
      <Circle cx="50" cy="50" r="36" fill={bg} />
      {content}
    </Svg>
  );

  // 3. Prohibition Circle (Red border + diagonal slash)
  const renderProhibitionCircle = (content: React.ReactNode, bg = '#FFFFFF') => (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="46" fill="#DC2626" />
      <Circle cx="50" cy="50" r="36" fill={bg} />
      {content}
      <Line x1="26" y1="26" x2="74" y2="74" stroke="#DC2626" strokeWidth="6" strokeLinecap="round" />
    </Svg>
  );

  // 4. Mandatory Circle (Vienna Convention: Solid blue disk with white symbol)
  const renderMandatoryCircle = (content: React.ReactNode, bg = '#1D4ED8') => (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="46" fill={bg} stroke="#FFFFFF" strokeWidth="2.5" />
      {content}
    </Svg>
  );

  // 5. Octagonal Stop Sign
  const renderStopSign = (text = 'STOP') => (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Polygon
        points="30,4 70,4 96,30 96,70 70,96 30,96 4,70 4,30"
        fill="#DC2626"
        stroke="#FFFFFF"
        strokeWidth="3.5"
      />
      <Polygon
        points="31,8 69,8 92,31 92,69 69,92 31,92 8,69 8,31"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="1.5"
      />
      <SvgText
        x="50"
        y={text.length > 4 ? '56' : '58'}
        fontSize={text.length > 5 ? 18 : text.length > 4 ? 22 : 26}
        fontWeight="900"
        fontFamily="System"
        fill="#FFFFFF"
        textAnchor="middle"
      >
        {text}
      </SvgText>
    </Svg>
  );

  // 6. Inverted Triangle Yield / Give Way Sign
  const renderYieldSign = (text = 'YIELD') => (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Polygon points="50,94 6,10 94,10" fill="#DC2626" stroke="#DC2626" strokeWidth="2" />
      <Polygon points="50,78 18,18 82,18" fill="#FFFFFF" />
      {text ? (
        <SvgText
          x="50"
          y="42"
          fontSize="13"
          fontWeight="900"
          fontFamily="System"
          fill="#DC2626"
          textAnchor="middle"
        >
          {text}
        </SvgText>
      ) : null}
    </Svg>
  );

  // 7. Circular Speed Limit Sign
  const renderCircularSpeedLimit = (speed: string) => (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="46" fill="#DC2626" />
      <Circle cx="50" cy="50" r="36" fill="#FFFFFF" />
      <SvgText
        x="50"
        y="60"
        fontSize={speed.length > 2 ? 28 : 34}
        fontWeight="900"
        fontFamily="System"
        fill="#000000"
        textAnchor="middle"
      >
        {speed}
      </SvgText>
    </Svg>
  );

  // 8. End of Speed Limit / Derestriction Sign
  const renderEndSpeedLimit = () => (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="46" fill="#94A3B8" />
      <Circle cx="50" cy="50" r="42" fill="#FFFFFF" />
      <Line x1="72" y1="20" x2="28" y2="80" stroke="#000000" strokeWidth="3" />
      <Line x1="77" y1="23" x2="33" y2="83" stroke="#000000" strokeWidth="3" />
      <Line x1="67" y1="17" x2="23" y2="77" stroke="#000000" strokeWidth="3" />
      <Line x1="82" y1="26" x2="38" y2="86" stroke="#000000" strokeWidth="3" />
    </Svg>
  );

  // 9. Information / Permissive Blue Square
  const renderInformationBlueSquare = (content: React.ReactNode, bg = '#1D4ED8') => (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Rect x="6" y="6" width="88" height="88" rx="10" fill={bg} stroke="#FFFFFF" strokeWidth="3" />
      {content}
    </Svg>
  );

  // 10. Traffic Light Module
  const renderTrafficLight = (
    active:
      | 'red'
      | 'yellow'
      | 'green'
      | 'red_arrow'
      | 'yellow_arrow'
      | 'green_arrow'
      | 'flashing_red'
      | 'flashing_yellow'
      | 'flashing_green'
      | 'blackout'
  ) => (
    <Svg width={size * 0.65} height={size} viewBox="0 0 60 110">
      <Rect x="4" y="4" width="52" height="102" rx="10" fill="#1E293B" stroke="#0F172A" strokeWidth="3" />
      {/* Sun Visors */}
      <Path d="M 12 16 Q 30 6 48 16" stroke="#0F172A" strokeWidth="4" fill="none" />
      <Path d="M 12 47 Q 30 37 48 47" stroke="#0F172A" strokeWidth="4" fill="none" />
      <Path d="M 12 78 Q 30 68 48 78" stroke="#0F172A" strokeWidth="4" fill="none" />

      {/* Red */}
      <Circle
        cx="30"
        cy="24"
        r={active === 'red' || active === 'red_arrow' || active === 'flashing_red' ? 12 : 10}
        fill={
          active === 'red' || active === 'red_arrow' || active === 'flashing_red'
            ? '#EF4444'
            : '#450A0A'
        }
        stroke={active === 'red' || active === 'red_arrow' ? '#FECACA' : 'none'}
        strokeWidth="2"
      />
      {(active === 'red' || active === 'flashing_red') && (
        <Circle cx="30" cy="24" r="6" fill="#FEE2E2" opacity="0.8" />
      )}
      {active === 'red_arrow' && (
        <Path d="M 36 24 L 24 24 M 28 20 L 24 24 L 28 28" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      )}

      {/* Yellow / Amber */}
      <Circle
        cx="30"
        cy="55"
        r={active === 'yellow' || active === 'yellow_arrow' || active === 'flashing_yellow' ? 12 : 10}
        fill={
          active === 'yellow' || active === 'yellow_arrow' || active === 'flashing_yellow'
            ? '#F59E0B'
            : '#451A03'
        }
        stroke={active === 'yellow' || active === 'yellow_arrow' ? '#FDE68A' : 'none'}
        strokeWidth="2"
      />
      {(active === 'yellow' || active === 'flashing_yellow') && (
        <Circle cx="30" cy="55" r="6" fill="#FEF9C3" opacity="0.8" />
      )}
      {active === 'yellow_arrow' && (
        <Path d="M 36 55 L 24 55 M 28 51 L 24 55 L 28 59" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      )}

      {/* Green */}
      <Circle
        cx="30"
        cy="86"
        r={active === 'green' || active === 'green_arrow' || active === 'flashing_green' ? 12 : 10}
        fill={
          active === 'green' || active === 'green_arrow' || active === 'flashing_green'
            ? '#10B981'
            : '#064E3B'
        }
        stroke={active === 'green' || active === 'green_arrow' ? '#A7F3D0' : 'none'}
        strokeWidth="2"
      />
      {(active === 'green' || active === 'flashing_green') && (
        <Circle cx="30" cy="86" r="6" fill="#D1FAE5" opacity="0.8" />
      )}
      {active === 'green_arrow' && (
        <Path d="M 36 86 L 24 86 M 28 82 L 24 86 L 28 90" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </Svg>
  );

  // 11. Pedestrian Signal (Walk / Don't Walk / Countdown)
  const renderPedestrianSignal = (type: 'walk' | 'dont_walk' | 'countdown') => (
    <Svg width={size * 0.75} height={size} viewBox="0 0 70 95">
      <Rect x="5" y="5" width="60" height="85" rx="8" fill="#1E293B" stroke="#0F172A" strokeWidth="2.5" />
      {type === 'dont_walk' ? (
        <G>
          <Circle cx="35" cy="42" r="24" fill="#DC2626" opacity="0.2" />
          <Circle cx="35" cy="26" r="6" fill="#EF4444" />
          <Line x1="35" y1="32" x2="35" y2="56" stroke="#EF4444" strokeWidth="5" strokeLinecap="round" />
          <Line x1="35" y1="40" x2="22" y2="36" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" />
          <Line x1="35" y1="40" x2="48" y2="36" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" />
          <Line x1="35" y1="56" x2="26" y2="74" stroke="#EF4444" strokeWidth="4.5" strokeLinecap="round" />
          <Line x1="35" y1="56" x2="44" y2="74" stroke="#EF4444" strokeWidth="4.5" strokeLinecap="round" />
          <SvgText x="35" y="86" fontSize="8" fontWeight="900" fill="#EF4444" textAnchor="middle">WAIT</SvgText>
        </G>
      ) : type === 'countdown' ? (
        <G>
          <Circle cx="24" cy="36" r="16" fill="#DC2626" opacity="0.2" />
          <Circle cx="24" cy="24" r="5" fill="#EF4444" />
          <Line x1="24" y1="29" x2="24" y2="48" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" />
          <SvgText x="48" y="44" fontSize="24" fontWeight="900" fill="#F59E0B" textAnchor="middle">12</SvgText>
          <SvgText x="35" y="78" fontSize="8" fontWeight="900" fill="#F59E0B" textAnchor="middle">SECONDS</SvgText>
        </G>
      ) : (
        <G>
          <Circle cx="35" cy="42" r="24" fill="#10B981" opacity="0.2" />
          <Circle cx="32" cy="26" r="6" fill="#10B981" />
          <Path d="M 32 32 L 35 48 L 46 60 M 35 48 L 24 66" stroke="#10B981" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M 32 38 L 44 44 M 32 38 L 22 46" stroke="#10B981" strokeWidth="4" strokeLinecap="round" />
          <SvgText x="35" y="86" fontSize="8" fontWeight="900" fill="#10B981" textAnchor="middle">WALK</SvgText>
        </G>
      )}
    </Svg>
  );

  // 12. General Knowledge Driving Scenario Card
  const renderScenarioCard = (icon: string, label: string, accentColor = '#3B82F6') => (
    <Svg width={size * 1.3} height={size * 0.75} viewBox="0 0 140 80">
      <Rect x="4" y="4" width="132" height="72" rx="10" fill="#0F172A" stroke={accentColor} strokeWidth="2.5" />
      <Rect x="4" y="4" width="132" height="18" rx="8" fill={accentColor} opacity="0.2" />
      <SvgText x="70" y="38" fontSize="26" textAnchor="middle">{icon}</SvgText>
      <SvgText x="70" y="62" fontSize="8.5" fontWeight="800" fontFamily="System" fill="#FFFFFF" textAnchor="middle">
        {label.toUpperCase()}
      </SvgText>
    </Svg>
  );

  // ---------------------------------------------------------------------------
  // Canonical Normalization & Render Engine
  // ---------------------------------------------------------------------------

  const renderSignContent = () => {
    // 1. Check for Speed Limit Pattern: REG-SPEED-LIMIT-(\d+)
    const speedMatch = rawCode.match(/SPEED[-_]LIMIT[-_](\d+)/i);
    if (speedMatch) {
      return renderCircularSpeedLimit(speedMatch[1]);
    }

    switch (rawCode) {
      // =======================================================================
      // 🛑 REGULATORY SIGNS (72 Canonical REG-*)
      // =======================================================================
      case 'REG-STOP':
      case 'STOP':
      case 'STOP_SIGN':
        return renderStopSign('STOP');

      case 'REG-GIVE-WAY':
      case 'REG-YIELD':
      case 'YIELD':
      case 'YIELD_SIGN':
      case 'GIVE_WAY':
        return renderYieldSign('YIELD');

      case 'REG-NO-ENTRY':
      case 'DO_NOT_ENTER':
      case 'NO_ENTRY':
        return renderRegulatoryCircle(
          <Rect x="20" y="44" width="60" height="12" rx="2" fill="#FFFFFF" />
        );

      case 'REG-NO-U-TURN':
      case 'NO_U_TURN':
        return renderProhibitionCircle(
          <G>
            <Path d="M 62 66 L 62 46 C 62 34 38 34 38 46 L 38 64" stroke="#000000" strokeWidth="5.5" fill="none" strokeLinecap="round" />
            <Polygon points="30,56 38,68 46,56" fill="#000000" />
          </G>
        );

      case 'REG-NO-OVERTAKING':
      case 'REG-OVERTAKING-PROHIBITED':
      case 'NO_PASSING':
      case 'DO_NOT_PASS':
        return renderRegulatoryCircle(
          <G>
            <Rect x="26" y="36" width="18" height="28" rx="4" fill="#DC2626" />
            <Rect x="29" y="40" width="12" height="8" rx="2" fill="#FFFFFF" />
            <Rect x="52" y="36" width="18" height="28" rx="4" fill="#000000" />
            <Rect x="55" y="40" width="12" height="8" rx="2" fill="#FFFFFF" />
          </G>
        );

      case 'REG-OVERTAKING-BY-TRUCKS-PROHIBITED':
        return renderRegulatoryCircle(
          <G>
            <Rect x="22" y="32" width="22" height="34" rx="4" fill="#DC2626" />
            <Rect x="25" y="36" width="16" height="10" rx="2" fill="#FFFFFF" />
            <Rect x="52" y="38" width="18" height="26" rx="4" fill="#000000" />
            <Rect x="55" y="42" width="12" height="8" rx="2" fill="#FFFFFF" />
          </G>
        );

      case 'REG-END-OVERTAKING':
        return renderEndRestrictionCircle();

      case 'REG-NO-PARKING':
      case 'NO_PARKING':
        return renderProhibitionCircle(
          <SvgText x="50" y="62" fontSize="36" fontWeight="900" fill="#000000" textAnchor="middle">P</SvgText>
        );

      case 'REG-NO-STOPPING':
      case 'NO_STOPPING':
        return (
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Circle cx="50" cy="50" r="46" fill="#DC2626" />
            <Circle cx="50" cy="50" r="36" fill="#1D4ED8" />
            <Line x1="25" y1="25" x2="75" y2="75" stroke="#DC2626" strokeWidth="7" strokeLinecap="round" />
            <Line x1="75" y1="25" x2="25" y2="75" stroke="#DC2626" strokeWidth="7" strokeLinecap="round" />
          </Svg>
        );

      case 'REG-ROUNDABOUT-MANDATORY':
      case 'ROUNDABOUT_MANDATORY':
        return renderMandatoryCircle(
          <G>
            <Path d="M 50 28 A 20 20 0 0 1 70 48" stroke="#FFFFFF" strokeWidth="4.5" fill="none" strokeLinecap="round" />
            <Polygon points="68,42 76,48 68,54" fill="#FFFFFF" />
            <Path d="M 70 48 A 20 20 0 0 1 42 68" stroke="#FFFFFF" strokeWidth="4.5" fill="none" strokeLinecap="round" />
            <Polygon points="46,64 40,72 48,76" fill="#FFFFFF" />
            <Path d="M 42 68 A 20 20 0 0 1 42 30" stroke="#FFFFFF" strokeWidth="4.5" fill="none" strokeLinecap="round" />
            <Polygon points="40,34 46,26 36,24" fill="#FFFFFF" />
          </G>
        );

      case 'REG-ONE-WAY':
      case 'ONE_WAY':
        return renderInformationBlueSquare(
          <G>
            <Line x1="24" y1="50" x2="70" y2="50" stroke="#FFFFFF" strokeWidth="9" strokeLinecap="round" />
            <Polygon points="64,36 82,50 64,64" fill="#FFFFFF" />
          </G>
        );

      case 'REG-KEEP-LEFT':
        return renderMandatoryCircle(
          <G>
            <Line x1="64" y1="36" x2="38" y2="62" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" />
            <Polygon points="32,50 32,68 50,68" fill="#FFFFFF" />
          </G>
        );

      case 'REG-KEEP-RIGHT':
        return renderMandatoryCircle(
          <G>
            <Line x1="36" y1="36" x2="62" y2="62" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" />
            <Polygon points="50,68 68,68 68,50" fill="#FFFFFF" />
          </G>
        );

      case 'REG-PASS-EITHER-SIDE':
        return renderMandatoryCircle(
          <G>
            <Line x1="50" y1="32" x2="34" y2="60" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
            <Polygon points="28,52 30,68 46,64" fill="#FFFFFF" />
            <Line x1="50" y1="32" x2="66" y2="60" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
            <Polygon points="54,64 70,68 72,52" fill="#FFFFFF" />
          </G>
        );

      case 'REG-STRAIGHT-ONLY':
        return renderMandatoryCircle(
          <G>
            <Line x1="50" y1="72" x2="50" y2="34" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" />
            <Polygon points="38,40 50,24 62,40" fill="#FFFFFF" />
          </G>
        );

      case 'REG-TURN-LEFT-ONLY':
        return renderMandatoryCircle(
          <G>
            <Path d="M 64 68 L 64 50 Q 64 42 54 42 L 34 42" stroke="#FFFFFF" strokeWidth="6" fill="none" strokeLinecap="round" />
            <Polygon points="40,32 26,42 40,52" fill="#FFFFFF" />
          </G>
        );

      case 'REG-TURN-RIGHT-ONLY':
        return renderMandatoryCircle(
          <G>
            <Path d="M 36 68 L 36 50 Q 36 42 46 42 L 66 42" stroke="#FFFFFF" strokeWidth="6" fill="none" strokeLinecap="round" />
            <Polygon points="60,32 74,42 60,52" fill="#FFFFFF" />
          </G>
        );

      case 'REG-STRAIGHT-OR-LEFT':
        return renderMandatoryCircle(
          <G>
            <Line x1="50" y1="72" x2="50" y2="34" stroke="#FFFFFF" strokeWidth="5.5" strokeLinecap="round" />
            <Polygon points="42,38 50,26 58,38" fill="#FFFFFF" />
            <Path d="M 50 56 Q 34 56 34 42" stroke="#FFFFFF" strokeWidth="5" fill="none" strokeLinecap="round" />
            <Polygon points="26,48 34,36 42,48" fill="#FFFFFF" />
          </G>
        );

      case 'REG-STRAIGHT-OR-RIGHT':
        return renderMandatoryCircle(
          <G>
            <Line x1="50" y1="72" x2="50" y2="34" stroke="#FFFFFF" strokeWidth="5.5" strokeLinecap="round" />
            <Polygon points="42,38 50,26 58,38" fill="#FFFFFF" />
            <Path d="M 50 56 Q 66 56 66 42" stroke="#FFFFFF" strokeWidth="5" fill="none" strokeLinecap="round" />
            <Polygon points="58,48 66,36 74,48" fill="#FFFFFF" />
          </G>
        );

      case 'REG-NO-LEFT-TURN':
        return renderProhibitionCircle(
          <G>
            <Path d="M 64 68 L 64 50 Q 64 42 54 42 L 34 42" stroke="#000000" strokeWidth="5.5" fill="none" strokeLinecap="round" />
            <Polygon points="40,32 26,42 40,52" fill="#000000" />
          </G>
        );

      case 'REG-NO-RIGHT-TURN':
        return renderProhibitionCircle(
          <G>
            <Path d="M 36 68 L 36 50 Q 36 42 46 42 L 66 42" stroke="#000000" strokeWidth="5.5" fill="none" strokeLinecap="round" />
            <Polygon points="60,32 74,42 60,52" fill="#000000" />
          </G>
        );

      case 'REG-NO-HORN':
        return renderProhibitionCircle(
          <G>
            <Path d="M 32 44 L 44 44 L 58 32 L 58 68 L 44 56 L 32 56 Z" fill="#000000" />
            <Path d="M 64 42 Q 72 50 64 58" stroke="#000000" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          </G>
        );

      case 'REG-COMPULSORY-HORN':
        return renderMandatoryCircle(
          <G>
            <Path d="M 32 44 L 44 44 L 58 32 L 58 68 L 44 56 L 32 56 Z" fill="#FFFFFF" />
            <Path d="M 64 42 Q 72 50 64 58" stroke="#FFFFFF" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          </G>
        );

      case 'REG-ROAD-CLOSED':
        return renderRegulatoryCircle(
          <G>
            <Rect x="24" y="44" width="52" height="12" rx="2" fill="#DC2626" />
            <SvgText x="50" y="53" fontSize="8" fontWeight="900" fill="#FFFFFF" textAnchor="middle">CLOSED</SvgText>
          </G>
        );

      case 'REG-NO-MOTOR-VEHICLES':
        return renderRegulatoryCircle(
          <G>
            <Rect x="36" y="32" width="28" height="18" rx="3" fill="#000000" />
            <Circle cx="42" cy="52" r="4" fill="#000000" />
            <Circle cx="58" cy="52" r="4" fill="#000000" />
            <Circle cx="40" cy="68" r="5" fill="#000000" />
            <Circle cx="60" cy="68" r="5" fill="#000000" />
            <Line x1="40" y1="68" x2="60" y2="68" stroke="#000000" strokeWidth="2.5" />
          </G>
        );

      case 'REG-NO-TRUCKS':
        return renderProhibitionCircle(
          <G>
            <Rect x="26" y="38" width="30" height="22" rx="2" fill="#000000" />
            <Rect x="56" y="44" width="16" height="16" rx="2" fill="#000000" />
            <Circle cx="34" cy="62" r="5" fill="#000000" />
            <Circle cx="48" cy="62" r="5" fill="#000000" />
            <Circle cx="64" cy="62" r="5" fill="#000000" />
          </G>
        );

      case 'REG-NO-BUSES':
        return renderProhibitionCircle(
          <G>
            <Rect x="26" y="36" width="48" height="24" rx="4" fill="#000000" />
            <Rect x="30" y="40" width="10" height="8" rx="1" fill="#FFFFFF" />
            <Rect x="44" y="40" width="10" height="8" rx="1" fill="#FFFFFF" />
            <Rect x="58" y="40" width="12" height="8" rx="1" fill="#FFFFFF" />
            <Circle cx="36" cy="62" r="5" fill="#000000" />
            <Circle cx="64" cy="62" r="5" fill="#000000" />
          </G>
        );

      case 'REG-NO-MOTORCYCLES':
        return renderProhibitionCircle(
          <G>
            <Circle cx="34" cy="56" r="8" fill="none" stroke="#000000" strokeWidth="3" />
            <Circle cx="66" cy="56" r="8" fill="none" stroke="#000000" strokeWidth="3" />
            <Path d="M 34 56 L 48 44 L 62 44 L 66 56" stroke="#000000" strokeWidth="3" fill="none" />
          </G>
        );

      case 'REG-NO-BICYCLES':
        return renderProhibitionCircle(
          <G>
            <Circle cx="32" cy="56" r="8" fill="none" stroke="#000000" strokeWidth="3" />
            <Circle cx="68" cy="56" r="8" fill="none" stroke="#000000" strokeWidth="3" />
            <Path d="M 32 56 L 46 56 L 56 42 M 46 56 L 40 44" stroke="#000000" strokeWidth="3" fill="none" />
          </G>
        );

      case 'REG-NO-PEDESTRIANS':
        return renderProhibitionCircle(
          <G>
            <Circle cx="50" cy="32" r="5.5" fill="#000000" />
            <Line x1="50" y1="38" x2="50" y2="58" stroke="#000000" strokeWidth="4.5" strokeLinecap="round" />
            <Line x1="50" y1="44" x2="38" y2="54" stroke="#000000" strokeWidth="4" strokeLinecap="round" />
            <Line x1="50" y1="44" x2="62" y2="50" stroke="#000000" strokeWidth="4" strokeLinecap="round" />
            <Line x1="50" y1="58" x2="40" y2="72" stroke="#000000" strokeWidth="4.5" strokeLinecap="round" />
            <Line x1="50" y1="58" x2="60" y2="72" stroke="#000000" strokeWidth="4.5" strokeLinecap="round" />
          </G>
        );

      case 'REG-END-SPEED-LIMIT':
      case 'REG-END-RESTRICTIONS':
        return renderEndSpeedLimit();

      case 'REG-MINIMUM-SPEED':
        return renderMandatoryCircle(
          <SvgText x="50" y="60" fontSize="32" fontWeight="900" fill="#FFFFFF" textAnchor="middle">30</SvgText>
        );

      case 'REG-WEIGHT-LIMIT':
        return renderRegulatoryCircle(
          <SvgText x="50" y="58" fontSize="22" fontWeight="900" fill="#000000" textAnchor="middle">5.5 t</SvgText>
        );

      case 'REG-AXLE-LIMIT':
        return renderRegulatoryCircle(
          <G>
            <Circle cx="30" cy="50" r="5" fill="#000000" />
            <Circle cx="70" cy="50" r="5" fill="#000000" />
            <Line x1="30" y1="50" x2="70" y2="50" stroke="#000000" strokeWidth="4" />
            <SvgText x="50" y="68" fontSize="14" fontWeight="900" fill="#000000" textAnchor="middle">2 t</SvgText>
          </G>
        );

      case 'REG-HEIGHT-LIMIT':
        return renderRegulatoryCircle(
          <G>
            <Polygon points="50,22 44,30 56,30" fill="#000000" />
            <SvgText x="50" y="56" fontSize="18" fontWeight="900" fill="#000000" textAnchor="middle">3.5 m</SvgText>
            <Polygon points="50,78 44,70 56,70" fill="#000000" />
          </G>
        );

      case 'REG-WIDTH-LIMIT':
        return renderRegulatoryCircle(
          <G>
            <Polygon points="22,50 30,44 30,56" fill="#000000" />
            <SvgText x="50" y="56" fontSize="18" fontWeight="900" fill="#000000" textAnchor="middle">2.4 m</SvgText>
            <Polygon points="78,50 70,44 70,56" fill="#000000" />
          </G>
        );

      case 'REG-LENGTH-LIMIT':
        return renderRegulatoryCircle(
          <G>
            <Rect x="30" y="44" width="40" height="12" rx="2" fill="#000000" />
            <SvgText x="50" y="68" fontSize="12" fontWeight="900" fill="#000000" textAnchor="middle">10 m</SvgText>
          </G>
        );

      case 'REG-LANE-CONTROL':
        return renderInformationBlueSquare(
          <G>
            <Line x1="36" y1="74" x2="36" y2="34" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
            <Polygon points="30,38 36,26 42,38" fill="#FFFFFF" />
            <Line x1="64" y1="74" x2="64" y2="34" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
            <Polygon points="58,38 64,26 70,38" fill="#FFFFFF" />
          </G>
        );

      case 'REG-BUS-LANE-ONLY':
        return renderMandatoryCircle(
          <G>
            <Rect x="26" y="38" width="48" height="24" rx="4" fill="#FFFFFF" />
            <Rect x="30" y="42" width="10" height="8" rx="1" fill="#1D4ED8" />
            <Rect x="44" y="42" width="10" height="8" rx="1" fill="#1D4ED8" />
            <Rect x="58" y="42" width="12" height="8" rx="1" fill="#1D4ED8" />
            <Circle cx="36" cy="64" r="5" fill="#FFFFFF" />
            <Circle cx="64" cy="64" r="5" fill="#FFFFFF" />
          </G>
        );

      case 'REG-CYCLE-TRACK-ONLY':
        return renderMandatoryCircle(
          <G>
            <Circle cx="32" cy="56" r="8" fill="none" stroke="#FFFFFF" strokeWidth="3" />
            <Circle cx="68" cy="56" r="8" fill="none" stroke="#FFFFFF" strokeWidth="3" />
            <Path d="M 32 56 L 46 56 L 56 42 M 46 56 L 40 44" stroke="#FFFFFF" strokeWidth="3" fill="none" />
          </G>
        );

      case 'REG-PEDESTRIAN-ZONE-ONLY':
        return renderMandatoryCircle(
          <G>
            <Circle cx="44" cy="30" r="5" fill="#FFFFFF" />
            <Line x1="44" y1="36" x2="44" y2="54" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
            <Line x1="44" y1="54" x2="36" y2="68" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
            <Line x1="44" y1="54" x2="52" y2="68" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
            <Circle cx="58" cy="40" r="4" fill="#FFFFFF" />
            <Line x1="58" y1="44" x2="58" y2="58" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
          </G>
        );

      case 'REG-SNOW-CHAINS-MANDATORY':
        return renderMandatoryCircle(
          <G>
            <Circle cx="50" cy="50" r="24" fill="#000000" stroke="#FFFFFF" strokeWidth="3" />
            <Circle cx="50" cy="50" r="14" fill="#1D4ED8" />
            <Line x1="32" y1="38" x2="68" y2="62" stroke="#FFFFFF" strokeWidth="3" />
            <Line x1="68" y1="38" x2="32" y2="62" stroke="#FFFFFF" strokeWidth="3" />
          </G>
        );

      case 'REG-HAZMAT-PROHIBITED':
        return renderProhibitionCircle(
          <G>
            <Polygon points="50,30 68,48 50,66 32,48" fill="#F97316" stroke="#000000" strokeWidth="2" />
            <SvgText x="50" y="54" fontSize="14" textAnchor="middle">🔥</SvgText>
          </G>
        );

      case 'REG-WATER-POLLUTANTS-PROHIBITED':
        return renderProhibitionCircle(
          <G>
            <Path d="M 28 60 Q 40 52 50 60 T 72 60" stroke="#0284C7" strokeWidth="4" fill="none" />
            <Rect x="34" y="40" width="32" height="14" rx="2" fill="#000000" />
          </G>
        );

      case 'REG-ANIMAL-DRAWN-PROHIBITED':
      case 'REG-TRACTOR-PROHIBITED':
      case 'REG-HANDCART-PROHIBITED':
        return renderProhibitionCircle(
          <SvgText x="50" y="56" fontSize="28" textAnchor="middle">🚜</SvgText>
        );

      case 'REG-MIN-FOLLOWING-DISTANCE':
        return renderRegulatoryCircle(
          <G>
            <Rect x="26" y="44" width="16" height="12" rx="2" fill="#000000" />
            <Rect x="58" y="44" width="16" height="12" rx="2" fill="#000000" />
            <SvgText x="50" y="54" fontSize="10" fontWeight="900" fill="#DC2626" textAnchor="middle">50m</SvgText>
          </G>
        );

      case 'REG-POLICE-STOP':
        return renderRegulatoryCircle(
          <G>
            <Rect x="18" y="42" width="64" height="16" rx="2" fill="#DC2626" />
            <SvgText x="50" y="54" fontSize="10" fontWeight="900" fill="#FFFFFF" textAnchor="middle">POLICE</SvgText>
          </G>
        );

      case 'REG-CUSTOMS-STOP':
        return renderRegulatoryCircle(
          <G>
            <Rect x="18" y="42" width="64" height="16" rx="2" fill="#DC2626" />
            <SvgText x="50" y="54" fontSize="8" fontWeight="900" fill="#FFFFFF" textAnchor="middle">CUSTOMS</SvgText>
          </G>
        );

      case 'REG-TOLL-STOP':
        return renderRegulatoryCircle(
          <G>
            <Rect x="18" y="42" width="64" height="16" rx="2" fill="#DC2626" />
            <SvgText x="50" y="54" fontSize="10" fontWeight="900" fill="#FFFFFF" textAnchor="middle">TOLL</SvgText>
          </G>
        );

      case 'REG-PARKING-PERMITTED':
        return renderInformationBlueSquare(
          <SvgText x="50" y="68" fontSize="52" fontWeight="900" fill="#FFFFFF" textAnchor="middle">P</SvgText>
        );

      case 'REG-RESTRICTED-HOURS-PARKING':
        return renderInformationBlueSquare(
          <G>
            <SvgText x="50" y="52" fontSize="36" fontWeight="900" fill="#FFFFFF" textAnchor="middle">P</SvgText>
            <SvgText x="50" y="74" fontSize="10" fontWeight="700" fill="#FFFFFF" textAnchor="middle">8am-6pm</SvgText>
          </G>
        );

      case 'REG-LOADING-ZONE':
        return renderInformationBlueSquare(
          <G>
            <Rect x="30" y="38" width="40" height="20" rx="2" fill="#FFFFFF" />
            <Circle cx="38" cy="60" r="4" fill="#FFFFFF" />
            <Circle cx="62" cy="60" r="4" fill="#FFFFFF" />
            <SvgText x="50" y="76" fontSize="9" fontWeight="800" fill="#FFFFFF" textAnchor="middle">LOADING</SvgText>
          </G>
        );

      case 'REG-DISABLED-PARKING-ONLY':
        return renderInformationBlueSquare(
          <G>
            <Circle cx="50" cy="30" r="5" fill="#FFFFFF" />
            <Path d="M 50 36 L 50 54 L 62 54 M 50 44 L 38 52" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" fill="none" />
            <Circle cx="48" cy="54" r="10" fill="none" stroke="#FFFFFF" strokeWidth="3" />
          </G>
        );

      case 'REG-RESIDENTIAL-ZONE':
        return renderInformationBlueSquare(
          <G>
            <Polygon points="30,38 42,26 54,38" fill="#FFFFFF" />
            <Rect x="34" y="38" width="16" height="16" fill="#FFFFFF" />
            <Circle cx="66" cy="46" r="5" fill="#FFFFFF" />
            <Line x1="66" y1="52" x2="66" y2="68" stroke="#FFFFFF" strokeWidth="3" />
          </G>
        );

      case 'REG-END-RESIDENTIAL-ZONE':
        return (
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Rect x="6" y="6" width="88" height="88" rx="10" fill="#1D4ED8" stroke="#FFFFFF" strokeWidth="3" />
            <Polygon points="30,38 42,26 54,38" fill="#FFFFFF" opacity="0.6" />
            <Rect x="34" y="38" width="16" height="16" fill="#FFFFFF" opacity="0.6" />
            <Line x1="18" y1="82" x2="82" y2="18" stroke="#DC2626" strokeWidth="7" strokeLinecap="round" />
          </Svg>
        );

      case 'REG-MOTORWAY-ENTRY':
        return renderInformationBlueSquare(
          <G>
            <Line x1="32" y1="76" x2="32" y2="24" stroke="#FFFFFF" strokeWidth="6" />
            <Line x1="68" y1="76" x2="68" y2="24" stroke="#FFFFFF" strokeWidth="6" />
            <Rect x="26" y="44" width="48" height="10" fill="#FFFFFF" />
          </G>,
          '#059669'
        );

      case 'REG-MOTORWAY-EXIT':
        return renderInformationBlueSquare(
          <G>
            <Line x1="65" y1="28" x2="35" y2="72" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
            <Line x1="75" y1="38" x2="45" y2="82" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
            <SvgText x="50" y="24" fontSize="11" fontWeight="800" fill="#FFFFFF" textAnchor="middle">EXIT 300m</SvgText>
          </G>,
          '#059669'
        );

      case 'REG-EMERGENCY-STOPPING-ONLY':
        return renderInformationBlueSquare(
          <G>
            <SvgText x="50" y="52" fontSize="28" textAnchor="middle">🆘</SvgText>
            <SvgText x="50" y="74" fontSize="9" fontWeight="800" fill="#FFFFFF" textAnchor="middle">ONLY</SvgText>
          </G>
        );

      case 'REG-COMPULSORY-LIGHTS-ON':
        return renderMandatoryCircle(
          <G>
            <Circle cx="44" cy="50" r="14" fill="#FFFFFF" />
            <Line x1="62" y1="42" x2="74" y2="38" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
            <Line x1="64" y1="50" x2="76" y2="50" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
            <Line x1="62" y1="58" x2="74" y2="62" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
          </G>
        );

      case 'REG-REVERSIBLE-LANE-OVERHEAD':
        return renderInformationBlueSquare(
          <G>
            <Polygon points="36,44 42,34 48,44" fill="#10B981" />
            <Line x1="42" y1="34" x2="42" y2="64" stroke="#10B981" strokeWidth="5" />
            <Line x1="60" y1="40" x2="76" y2="56" stroke="#EF4444" strokeWidth="5" strokeLinecap="round" />
            <Line x1="76" y1="40" x2="60" y2="56" stroke="#EF4444" strokeWidth="5" strokeLinecap="round" />
          </G>,
          '#0F172A'
        );

      case 'REG-PRIORITY-OVER-ONCOMING':
        return renderInformationBlueSquare(
          <G>
            <Line x1="38" y1="72" x2="38" y2="28" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" />
            <Polygon points="30,38 38,24 46,38" fill="#FFFFFF" />
            <Line x1="62" y1="34" x2="62" y2="66" stroke="#DC2626" strokeWidth="4.5" strokeLinecap="round" />
            <Polygon points="56,58 62,68 68,58" fill="#DC2626" />
          </G>
        );

      case 'REG-GIVE-WAY-TO-ONCOMING':
        return renderRegulatoryCircle(
          <G>
            <Line x1="38" y1="34" x2="38" y2="66" stroke="#DC2626" strokeWidth="5" strokeLinecap="round" />
            <Polygon points="32,58 38,68 44,58" fill="#DC2626" />
            <Line x1="62" y1="70" x2="62" y2="30" stroke="#000000" strokeWidth="6" strokeLinecap="round" />
            <Polygon points="54,40 62,26 70,40" fill="#000000" />
          </G>
        );

      case 'REG-TAXI-STAND':
        return renderInformationBlueSquare(
          <SvgText x="50" y="60" fontSize="22" fontWeight="900" fill="#FFFFFF" textAnchor="middle">TAXI</SvgText>
        );

      case 'REG-STAND-CLEAR-CROSS-HATCH':
        return (
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Rect x="10" y="10" width="80" height="80" fill="#1E293B" stroke="#F59E0B" strokeWidth="4" />
            <Line x1="10" y1="10" x2="90" y2="90" stroke="#F59E0B" strokeWidth="4" />
            <Line x1="90" y1="10" x2="10" y2="90" stroke="#F59E0B" strokeWidth="4" />
            <Line x1="10" y1="50" x2="50" y2="90" stroke="#F59E0B" strokeWidth="3" />
            <Line x1="50" y1="10" x2="90" y2="50" stroke="#F59E0B" strokeWidth="3" />
          </Svg>
        );

      // =======================================================================
      // ⚠️ WARNING SIGNS (60 Canonical WARN-*)
      // =======================================================================
      case 'WARN-LEFT-BEND':
      case 'CURVE_LEFT':
        return renderWarningDiamond(
          <G>
            <Path d="M 58 72 L 58 54 Q 58 40 40 40 L 32 40" stroke="#000000" strokeWidth="6.5" fill="none" strokeLinecap="round" />
            <Polygon points="38,30 22,40 38,50" fill="#000000" />
          </G>
        );

      case 'WARN-RIGHT-BEND':
      case 'CURVE_RIGHT':
        return renderWarningDiamond(
          <G>
            <Path d="M 42 72 L 42 54 Q 42 40 60 40 L 68 40" stroke="#000000" strokeWidth="6.5" fill="none" strokeLinecap="round" />
            <Polygon points="62,30 78,40 62,50" fill="#000000" />
          </G>
        );

      case 'WARN-DOUBLE-BEND':
        return renderWarningDiamond(
          <G>
            <Path d="M 50 72 L 50 60 Q 50 50 36 50 Q 36 36 54 36 L 54 28" stroke="#000000" strokeWidth="6" fill="none" strokeLinecap="round" />
            <Polygon points="46,32 54,20 62,32" fill="#000000" />
          </G>
        );

      case 'WARN-HAIRPIN-BEND':
        return renderWarningDiamond(
          <G>
            <Path d="M 38 72 L 38 46 A 14 14 0 0 1 66 46 L 66 68" stroke="#000000" strokeWidth="6" fill="none" strokeLinecap="round" />
            <Polygon points="58,62 66,74 74,62" fill="#000000" />
          </G>
        );

      case 'WARN-DANGEROUS-CURVE':
      case 'WINDING_ROAD':
        return renderWarningDiamond(
          <G>
            <Path d="M 50 74 Q 32 60 50 48 Q 68 36 50 24" stroke="#000000" strokeWidth="6" fill="none" strokeLinecap="round" />
            <Polygon points="42,28 50,18 58,28" fill="#000000" />
          </G>
        );

      case 'WARN-CROSSROAD':
      case 'INTERSECTION_CROSS':
        return renderWarningDiamond(
          <G>
            <Line x1="50" y1="24" x2="50" y2="76" stroke="#000000" strokeWidth="7" strokeLinecap="round" />
            <Line x1="24" y1="50" x2="76" y2="50" stroke="#000000" strokeWidth="7" strokeLinecap="round" />
          </G>
        );

      case 'WARN-T-JUNCTION':
      case 'T_INTERSECTION':
        return renderWarningDiamond(
          <G>
            <Line x1="50" y1="36" x2="50" y2="76" stroke="#000000" strokeWidth="7.5" strokeLinecap="round" />
            <Line x1="26" y1="36" x2="74" y2="36" stroke="#000000" strokeWidth="7.5" strokeLinecap="round" />
          </G>
        );

      case 'WARN-Y-JUNCTION':
        return renderWarningDiamond(
          <G>
            <Line x1="50" y1="76" x2="50" y2="52" stroke="#000000" strokeWidth="7" strokeLinecap="round" />
            <Line x1="50" y1="52" x2="30" y2="30" stroke="#000000" strokeWidth="7" strokeLinecap="round" />
            <Line x1="50" y1="52" x2="70" y2="30" stroke="#000000" strokeWidth="7" strokeLinecap="round" />
          </G>
        );

      case 'WARN-SIDE-ROAD':
      case 'SIDE_ROAD_RIGHT':
        return renderWarningDiamond(
          <G>
            <Line x1="44" y1="24" x2="44" y2="76" stroke="#000000" strokeWidth="7" strokeLinecap="round" />
            <Line x1="44" y1="50" x2="72" y2="50" stroke="#000000" strokeWidth="6" strokeLinecap="round" />
          </G>
        );

      case 'WARN-STAGGERED-JUNCTION':
        return renderWarningDiamond(
          <G>
            <Line x1="50" y1="24" x2="50" y2="76" stroke="#000000" strokeWidth="7" strokeLinecap="round" />
            <Line x1="26" y1="42" x2="50" y2="42" stroke="#000000" strokeWidth="5.5" strokeLinecap="round" />
            <Line x1="50" y1="58" x2="74" y2="58" stroke="#000000" strokeWidth="5.5" strokeLinecap="round" />
          </G>
        );

      case 'WARN-ROUNDABOUT-AHEAD':
      case 'ROUNDABOUT_AHEAD':
        return renderWarningDiamond(
          <G>
            <Path d="M 50 30 A 18 18 0 0 1 68 48" stroke="#000000" strokeWidth="4" fill="none" strokeLinecap="round" />
            <Polygon points="66,42 74,48 66,54" fill="#000000" />
            <Path d="M 68 48 A 18 18 0 0 1 42 66" stroke="#000000" strokeWidth="4" fill="none" strokeLinecap="round" />
            <Polygon points="46,62 40,70 48,74" fill="#000000" />
            <Path d="M 42 66 A 18 18 0 0 1 42 32" stroke="#000000" strokeWidth="4" fill="none" strokeLinecap="round" />
            <Polygon points="40,36 46,28 36,26" fill="#000000" />
          </G>
        );

      case 'WARN-STOP-AHEAD':
      case 'STOP_AHEAD':
        return renderWarningDiamond(
          <G>
            <Polygon points="40,30 60,30 72,42 72,62 60,74 40,74 28,62 28,42" fill="#DC2626" />
            <SvgText x="50" y="56" fontSize="11" fontWeight="900" fill="#FFFFFF" textAnchor="middle">STOP</SvgText>
            <Polygon points="50,14 42,24 58,24" fill="#000000" />
          </G>
        );

      case 'WARN-TRAFFIC-SIGNALS-AHEAD':
      case 'SIGNAL_AHEAD':
        return renderWarningDiamond(
          <G>
            <Rect x="38" y="24" width="24" height="52" rx="4" fill="#1E293B" stroke="#000000" strokeWidth="2" />
            <Circle cx="50" cy="34" r="6" fill="#EF4444" />
            <Circle cx="50" cy="50" r="6" fill="#F59E0B" />
            <Circle cx="50" cy="66" r="6" fill="#10B981" />
          </G>
        );

      case 'WARN-MERGING-TRAFFIC':
      case 'MERGE_RIGHT':
        return renderWarningDiamond(
          <G>
            <Line x1="44" y1="24" x2="44" y2="76" stroke="#000000" strokeWidth="6" strokeLinecap="round" />
            <Line x1="68" y1="72" x2="44" y2="48" stroke="#000000" strokeWidth="5.5" strokeLinecap="round" />
          </G>
        );

      case 'WARN-ROAD-NARROWS':
      case 'NARROW_BRIDGE':
        return renderWarningDiamond(
          <G>
            <Path d="M 28 76 L 28 54 L 40 38 L 40 24" stroke="#000000" strokeWidth="5.5" fill="none" strokeLinecap="round" />
            <Path d="M 72 76 L 72 54 L 60 38 L 60 24" stroke="#000000" strokeWidth="5.5" fill="none" strokeLinecap="round" />
          </G>
        );

      case 'WARN-NARROW-BRIDGE':
        return renderWarningDiamond(
          <G>
            <Path d="M 28 76 L 36 56 L 36 44 L 28 24" stroke="#000000" strokeWidth="6" fill="none" strokeLinecap="round" />
            <Path d="M 72 76 L 64 56 L 64 44 L 72 24" stroke="#000000" strokeWidth="6" fill="none" strokeLinecap="round" />
          </G>
        );

      case 'WARN-UNEVEN-ROAD':
      case 'UNEVEN_ROAD':
        return renderWarningDiamond(
          <Path d="M 22 56 Q 34 40 42 56 Q 50 40 58 56 Q 66 40 78 56" stroke="#000000" strokeWidth="5.5" fill="none" strokeLinecap="round" />
        );

      case 'WARN-ROAD-HUMP':
        return renderWarningDiamond(
          <Path d="M 22 58 L 34 58 Q 50 36 66 58 L 78 58" stroke="#000000" strokeWidth="6" fill="none" strokeLinecap="round" />
        );

      case 'WARN-ROAD-DIP':
        return renderWarningDiamond(
          <Path d="M 22 46 L 34 46 Q 50 68 66 46 L 78 46" stroke="#000000" strokeWidth="6" fill="none" strokeLinecap="round" />
        );

      case 'WARN-SLIPPERY-ROAD':
      case 'SLIPPERY_ROAD':
        return renderWarningDiamond(
          <G>
            <Rect x="40" y="30" width="20" height="14" rx="3" fill="#000000" />
            <Path d="M 36 44 Q 30 52 38 60 Q 46 68 38 76" stroke="#000000" strokeWidth="3" fill="none" />
            <Path d="M 64 44 Q 58 52 66 60 Q 74 68 66 76" stroke="#000000" strokeWidth="3" fill="none" />
          </G>
        );

      case 'WARN-LOOSE-GRAVEL':
        return renderWarningDiamond(
          <G>
            <Rect x="42" y="38" width="22" height="14" rx="2" fill="#000000" />
            <Circle cx="32" cy="56" r="3" fill="#000000" />
            <Circle cx="26" cy="62" r="2.5" fill="#000000" />
            <Circle cx="36" cy="66" r="3" fill="#000000" />
            <Circle cx="72" cy="56" r="2.5" fill="#000000" />
          </G>
        );

      case 'WARN-FALLING-ROCKS':
        return renderWarningDiamond(
          <G>
            <Polygon points="22,76 36,24 50,76" fill="#000000" />
            <Circle cx="64" cy="42" r="5" fill="#000000" />
            <Circle cx="72" cy="58" r="4" fill="#000000" />
          </G>
        );

      case 'WARN-STEEP-ASCENT':
        return renderWarningDiamond(
          <G>
            <Polygon points="24,70 76,34 76,70" fill="#000000" />
            <SvgText x="50" y="64" fontSize="11" fontWeight="900" fill="#FFC800" textAnchor="middle">10%</SvgText>
          </G>
        );

      case 'WARN-STEEP-DESCENT':
        return renderWarningDiamond(
          <G>
            <Polygon points="24,34 76,70 24,70" fill="#000000" />
            <SvgText x="50" y="64" fontSize="11" fontWeight="900" fill="#FFC800" textAnchor="middle">12%</SvgText>
          </G>
        );

      case 'WARN-PEDESTRIAN-CROSSING':
      case 'PEDESTRIAN_CROSSING':
        return renderWarningDiamond(
          <G>
            <Circle cx="48" cy="30" r="5" fill="#000000" />
            <Line x1="48" y1="35" x2="48" y2="54" stroke="#000000" strokeWidth="4.5" strokeLinecap="round" />
            <Line x1="48" y1="54" x2="38" y2="70" stroke="#000000" strokeWidth="4.5" strokeLinecap="round" />
            <Line x1="48" y1="54" x2="58" y2="70" stroke="#000000" strokeWidth="4.5" strokeLinecap="round" />
            <Line x1="26" y1="74" x2="74" y2="74" stroke="#000000" strokeWidth="4" strokeDasharray="6,4" />
          </G>
        );

      case 'WARN-CHILDREN-SCHOOL':
      case 'SCHOOL_ZONE':
        return renderWarningDiamond(
          <G>
            <Circle cx="40" cy="30" r="5" fill="#000000" />
            <Line x1="40" y1="35" x2="40" y2="54" stroke="#000000" strokeWidth="4" />
            <Line x1="40" y1="54" x2="32" y2="70" stroke="#000000" strokeWidth="4" />
            <Line x1="40" y1="54" x2="48" y2="70" stroke="#000000" strokeWidth="4" />
            <Circle cx="58" cy="40" r="4" fill="#000000" />
            <Line x1="58" y1="44" x2="58" y2="58" stroke="#000000" strokeWidth="3" />
            <Line x1="58" y1="58" x2="52" y2="70" stroke="#000000" strokeWidth="3" />
            <Line x1="58" y1="58" x2="64" y2="70" stroke="#000000" strokeWidth="3" />
          </G>
        );

      case 'WARN-CYCLISTS':
        return renderWarningDiamond(
          <G>
            <Circle cx="34" cy="56" r="8" fill="none" stroke="#000000" strokeWidth="3" />
            <Circle cx="66" cy="56" r="8" fill="none" stroke="#000000" strokeWidth="3" />
            <Path d="M 34 56 L 48 56 L 56 42 M 48 56 L 42 44" stroke="#000000" strokeWidth="3" fill="none" />
            <Circle cx="52" cy="34" r="3.5" fill="#000000" />
          </G>
        );

      case 'WARN-CATTLE':
      case 'CATTLE_CROSSING':
        return renderWarningDiamond(
          <G>
            <Path d="M 32 58 L 32 46 C 32 42 38 40 46 40 L 60 40 L 68 32 L 72 34 L 66 44 L 66 58 M 40 58 L 40 48 M 58 58 L 58 48" stroke="#000000" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </G>
        );

      case 'WARN-WILD-ANIMALS':
      case 'DEER_CROSSING':
        return renderWarningDiamond(
          <G>
            <Path d="M 32 64 L 40 44 L 56 44 L 66 32 M 56 44 L 64 64 M 40 44 L 30 40" stroke="#000000" strokeWidth="4" fill="none" strokeLinecap="round" />
          </G>
        );

      case 'WARN-RAILWAY-GATE':
        return renderWarningDiamond(
          <G>
            <Line x1="28" y1="46" x2="72" y2="46" stroke="#000000" strokeWidth="4" />
            <Line x1="28" y1="56" x2="72" y2="56" stroke="#000000" strokeWidth="4" />
            <Line x1="36" y1="40" x2="36" y2="62" stroke="#000000" strokeWidth="3.5" />
            <Line x1="50" y1="40" x2="50" y2="62" stroke="#000000" strokeWidth="3.5" />
            <Line x1="64" y1="40" x2="64" y2="62" stroke="#000000" strokeWidth="3.5" />
          </G>
        );

      case 'WARN-RAILWAY-NO-GATE':
        return renderWarningDiamond(
          <G>
            <Rect x="30" y="44" width="34" height="18" rx="2" fill="#000000" />
            <Rect x="52" y="34" width="16" height="28" rx="2" fill="#000000" />
            <Circle cx="38" cy="64" r="5" fill="#000000" />
            <Circle cx="50" cy="64" r="5" fill="#000000" />
            <Circle cx="62" cy="64" r="5" fill="#000000" />
          </G>
        );

      case 'WARN-ROAD-WORKS':
      case 'ROAD_WORK':
        return renderWarningDiamond(
          <G>
            <Circle cx="50" cy="28" r="4.5" fill="#000000" />
            <Path d="M 50 33 L 46 54 L 38 68 M 46 54 L 54 68" stroke="#000000" strokeWidth="4" strokeLinecap="round" />
            <Line x1="44" y1="42" x2="66" y2="60" stroke="#000000" strokeWidth="3.5" strokeLinecap="round" />
            <Polygon points="64,56 74,66 60,66" fill="#000000" />
          </G>,
          '#F97316'
        );

      case 'WARN-LANE-CLOSURE':
        return renderWarningDiamond(
          <G>
            <Line x1="34" y1="74" x2="34" y2="28" stroke="#000000" strokeWidth="5" strokeLinecap="round" />
            <Line x1="66" y1="74" x2="66" y2="52" stroke="#000000" strokeWidth="5" strokeLinecap="round" />
            <Line x1="66" y1="52" x2="40" y2="36" stroke="#000000" strokeWidth="5" strokeLinecap="round" />
            <Polygon points="36,44 32,32 44,34" fill="#000000" />
          </G>
        );

      case 'WARN-TWO-WAY-TRAFFIC':
      case 'TWO_WAY_TRAFFIC':
        return renderWarningDiamond(
          <G>
            <Line x1="40" y1="72" x2="40" y2="28" stroke="#000000" strokeWidth="5.5" strokeLinecap="round" />
            <Polygon points="34,36 40,24 46,36" fill="#000000" />
            <Line x1="60" y1="28" x2="60" y2="72" stroke="#000000" strokeWidth="5.5" strokeLinecap="round" />
            <Polygon points="54,64 60,76 66,64" fill="#000000" />
          </G>
        );

      case 'WARN-STRONG-CROSSWINDS':
      case 'WARN-SIDE-WINDS-BRIDGE':
        return renderWarningDiamond(
          <G>
            <Line x1="32" y1="74" x2="32" y2="28" stroke="#000000" strokeWidth="5" strokeLinecap="round" />
            <Polygon points="32,34 72,40 68,52 32,46" fill="#DC2626" />
            <Line x1="44" y1="36" x2="44" y2="48" stroke="#FFFFFF" strokeWidth="3" />
            <Line x1="56" y1="38" x2="56" y2="50" stroke="#FFFFFF" strokeWidth="3" />
          </G>
        );

      case 'WARN-OPENING-BRIDGE':
        return renderWarningDiamond(
          <G>
            <Line x1="24" y1="54" x2="44" y2="38" stroke="#000000" strokeWidth="6" strokeLinecap="round" />
            <Line x1="56" y1="54" x2="76" y2="54" stroke="#000000" strokeWidth="6" strokeLinecap="round" />
            <Path d="M 20 68 Q 50 60 80 68" stroke="#0284C7" strokeWidth="4" fill="none" />
          </G>
        );

      case 'WARN-LOW-AIRCRAFT':
      case 'WARN-AIRFIELD':
        return renderWarningDiamond(
          <G>
            <Path d="M 30 50 L 50 42 L 72 36 L 50 30 L 30 22 L 36 34 L 20 34 L 16 30 L 14 34 L 18 36 L 14 38 L 16 42 L 20 38 L 36 38 Z" fill="#000000" />
          </G>
        );

      case 'WARN-TUNNEL-AHEAD':
        return renderWarningDiamond(
          <G>
            <Path d="M 32 72 L 32 46 A 18 18 0 0 1 68 46 L 68 72 Z" fill="#000000" />
            <Path d="M 40 72 L 40 52 A 10 10 0 0 1 60 52 L 60 72 Z" fill="#FFC800" />
          </G>
        );

      case 'WARN-LOW-CLEARANCE':
        return renderWarningDiamond(
          <G>
            <Polygon points="50,26 42,36 58,36" fill="#000000" />
            <SvgText x="50" y="56" fontSize="16" fontWeight="900" fill="#000000" textAnchor="middle">3.8m</SvgText>
            <Polygon points="50,74 42,64 58,64" fill="#000000" />
          </G>
        );

      case 'WARN-QUEUE-AHEAD':
        return renderWarningDiamond(
          <G>
            <Rect x="42" y="26" width="16" height="12" rx="2" fill="#000000" />
            <Rect x="42" y="44" width="16" height="12" rx="2" fill="#000000" />
            <Rect x="42" y="62" width="16" height="12" rx="2" fill="#000000" />
          </G>
        );

      case 'WARN-OTHER-DANGER':
        return renderWarningDiamond(
          <G>
            <Line x1="50" y1="28" x2="50" y2="58" stroke="#000000" strokeWidth="8" strokeLinecap="round" />
            <Circle cx="50" cy="72" r="4.5" fill="#000000" />
          </G>
        );

      case 'WARN-TRAMS-AHEAD':
        return renderWarningDiamond(
          <G>
            <Rect x="34" y="36" width="32" height="24" rx="3" fill="#000000" />
            <Line x1="50" y1="26" x2="50" y2="36" stroke="#000000" strokeWidth="3" />
            <Line x1="42" y1="26" x2="58" y2="26" stroke="#000000" strokeWidth="3" />
            <Circle cx="42" cy="54" r="3" fill="#FFC800" />
            <Circle cx="58" cy="54" r="3" fill="#FFC800" />
          </G>
        );

      case 'WARN-SOFT-VERGE':
        return renderWarningDiamond(
          <G>
            <Line x1="28" y1="44" x2="56" y2="44" stroke="#000000" strokeWidth="5" />
            <Line x1="56" y1="44" x2="72" y2="60" stroke="#000000" strokeWidth="5" strokeDasharray="4,3" />
            <Rect x="36" y="32" width="20" height="12" rx="2" fill="#000000" />
          </G>
        );

      case 'WARN-WATER-EDGE':
        return renderWarningDiamond(
          <G>
            <Line x1="24" y1="54" x2="52" y2="54" stroke="#000000" strokeWidth="6" />
            <Rect x="46" y="40" width="20" height="12" rx="2" transform="rotate(25 56 46)" fill="#000000" />
            <Path d="M 54 68 Q 66 60 76 68" stroke="#0284C7" strokeWidth="4" fill="none" />
          </G>
        );

      case 'WARN-FOG-HAZARD':
        return renderWarningDiamond(
          <G>
            <Line x1="28" y1="36" x2="72" y2="36" stroke="#000000" strokeWidth="4" strokeLinecap="round" strokeDasharray="6,4" />
            <Line x1="24" y1="48" x2="76" y2="48" stroke="#000000" strokeWidth="4" strokeLinecap="round" strokeDasharray="8,4" />
            <Line x1="28" y1="60" x2="72" y2="60" stroke="#000000" strokeWidth="4" strokeLinecap="round" strokeDasharray="6,4" />
          </G>
        );

      case 'WARN-ICE-SNOW':
        return renderWarningDiamond(
          <G>
            <Line x1="50" y1="26" x2="50" y2="74" stroke="#000000" strokeWidth="4" />
            <Line x1="26" y1="50" x2="74" y2="50" stroke="#000000" strokeWidth="4" />
            <Line x1="33" y1="33" x2="67" y2="67" stroke="#000000" strokeWidth="4" />
            <Line x1="67" y1="33" x2="33" y2="67" stroke="#000000" strokeWidth="4" />
          </G>
        );

      case 'WARN-FALLING-DEBRIS':
        return renderWarningDiamond(
          <G>
            <Polygon points="30,70 42,32 54,70" fill="#000000" />
            <Circle cx="64" cy="50" r="4" fill="#000000" />
            <Circle cx="68" cy="62" r="3" fill="#000000" />
          </G>
        );

      case 'WARN-BLIND-INTERSECTION':
      case 'WARN-BLIND-CREST':
        return renderWarningDiamond(
          <G>
            <Path d="M 28 66 Q 50 36 72 66" stroke="#000000" strokeWidth="6" fill="none" strokeLinecap="round" />
            <SvgText x="50" y="34" fontSize="18" textAnchor="middle">👁️</SvgText>
          </G>
        );

      case 'WARN-HORSE-RIDERS':
        return renderWarningDiamond(
          <SvgText x="50" y="58" fontSize="28" textAnchor="middle">🐎</SvgText>
        );

      case 'WARN-RUMBLE-STRIPS':
        return renderWarningDiamond(
          <G>
            <Line x1="32" y1="36" x2="68" y2="36" stroke="#000000" strokeWidth="4" />
            <Line x1="32" y1="46" x2="68" y2="46" stroke="#000000" strokeWidth="4" />
            <Line x1="32" y1="56" x2="68" y2="56" stroke="#000000" strokeWidth="4" />
            <Line x1="32" y1="66" x2="68" y2="66" stroke="#000000" strokeWidth="4" />
          </G>
        );

      case 'WARN-CHECKPOINT-AHEAD':
        return renderWarningDiamond(
          <G>
            <Line x1="28" y1="52" x2="72" y2="52" stroke="#000000" strokeWidth="5" />
            <Circle cx="34" cy="52" r="4" fill="#DC2626" />
            <Circle cx="50" cy="52" r="4" fill="#DC2626" />
            <Circle cx="66" cy="52" r="4" fill="#DC2626" />
          </G>
        );

      case 'WARN-SPEED-RADAR-AHEAD':
        return renderWarningDiamond(
          <G>
            <Rect x="36" y="36" width="28" height="20" rx="3" fill="#000000" />
            <Circle cx="50" cy="46" r="5" fill="#FFC800" />
            <Line x1="50" y1="56" x2="50" y2="72" stroke="#000000" strokeWidth="3.5" />
            <Line x1="42" y1="72" x2="58" y2="72" stroke="#000000" strokeWidth="3.5" />
          </G>
        );

      case 'WARN-DUAL-CARRIAGEWAY-ENDS':
        return renderWarningDiamond(
          <G>
            <Line x1="38" y1="72" x2="38" y2="48" stroke="#000000" strokeWidth="5" />
            <Line x1="62" y1="72" x2="62" y2="48" stroke="#000000" strokeWidth="5" />
            <Polygon points="50,46 44,60 56,60" fill="#000000" />
            <Line x1="50" y1="46" x2="50" y2="28" stroke="#000000" strokeWidth="5" />
          </G>
        );

      case 'WARN-DIVIDED-ROAD-BEGINS':
        return renderWarningDiamond(
          <G>
            <Line x1="50" y1="72" x2="50" y2="54" stroke="#000000" strokeWidth="5" />
            <Polygon points="50,54 44,40 56,40" fill="#000000" />
            <Line x1="38" y1="40" x2="38" y2="26" stroke="#000000" strokeWidth="5" />
            <Line x1="62" y1="40" x2="62" y2="26" stroke="#000000" strokeWidth="5" />
          </G>
        );

      case 'WARN-SLOW-VEHICLES-AHEAD':
        return renderWarningDiamond(
          <G>
            <Polygon points="50,30 68,66 32,66" fill="#EA580C" stroke="#000000" strokeWidth="2.5" />
            <Polygon points="50,42 60,60 40,60" fill="#FFC800" />
          </G>
        );

      case 'WARN-FLOODED-ROADWAY':
        return renderWarningDiamond(
          <G>
            <Rect x="38" y="34" width="24" height="14" rx="2" fill="#000000" />
            <Path d="M 24 56 Q 38 48 50 56 T 76 56" stroke="#0284C7" strokeWidth="4" fill="none" />
            <Path d="M 24 66 Q 38 58 50 66 T 76 66" stroke="#0284C7" strokeWidth="4" fill="none" />
          </G>
        );

      case 'WARN-MIGRATORY-CROSSING':
        return renderWarningDiamond(
          <SvgText x="50" y="58" fontSize="28" textAnchor="middle">🦆</SvgText>
        );

      case 'WARN-TRUCK-ROLLOVER-RISK':
        return renderWarningDiamond(
          <G>
            <Rect x="38" y="34" width="24" height="30" rx="3" transform="rotate(22 50 49)" fill="#000000" />
            <Circle cx="38" cy="66" r="4" fill="#000000" />
            <Circle cx="58" cy="62" r="4" fill="#000000" />
          </G>
        );

      // =======================================================================
      // 🚦 TRAFFIC SIGNALS (30 Canonical SIG-*)
      // =======================================================================
      case 'SIG-SOLID-RED':
      case 'SIG-RED-LIGHT':
      case 'RED_LIGHT':
        return renderTrafficLight('red');

      case 'SIG-SOLID-YELLOW':
      case 'SIG-AMBER-LIGHT':
      case 'YELLOW_LIGHT':
        return renderTrafficLight('yellow');

      case 'SIG-SOLID-GREEN':
      case 'SIG-GREEN-LIGHT':
      case 'GREEN_LIGHT':
        return renderTrafficLight('green');

      case 'SIG-RED-ARROW':
        return renderTrafficLight('red_arrow');

      case 'SIG-YELLOW-ARROW':
        return renderTrafficLight('yellow_arrow');

      case 'SIG-GREEN-ARROW':
      case 'GREEN_ARROW':
        return renderTrafficLight('green_arrow');

      case 'SIG-FLASHING-RED':
      case 'FLASHING_RED':
        return renderTrafficLight('flashing_red');

      case 'SIG-FLASHING-YELLOW':
      case 'FLASHING_YELLOW':
        return renderTrafficLight('flashing_yellow');

      case 'SIG-FLASHING-GREEN':
        return renderTrafficLight('flashing_green');

      case 'SIG-PEDESTRIAN-WALK':
        return renderPedestrianSignal('walk');

      case 'SIG-PEDESTRIAN-DONT-WALK':
        return renderPedestrianSignal('dont_walk');

      case 'SIG-PEDESTRIAN-COUNTDOWN':
        return renderPedestrianSignal('countdown');

      case 'SIG-LANE-GREEN-ARROW':
        return (
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Rect x="8" y="8" width="84" height="84" rx="10" fill="#0F172A" stroke="#10B981" strokeWidth="3" />
            <Line x1="50" y1="28" x2="50" y2="68" stroke="#10B981" strokeWidth="8" strokeLinecap="round" />
            <Polygon points="36,54 50,74 64,54" fill="#10B981" />
          </Svg>
        );

      case 'SIG-LANE-RED-X':
        return (
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Rect x="8" y="8" width="84" height="84" rx="10" fill="#0F172A" stroke="#DC2626" strokeWidth="3" />
            <Line x1="28" y1="28" x2="72" y2="72" stroke="#DC2626" strokeWidth="9" strokeLinecap="round" />
            <Line x1="72" y1="28" x2="28" y2="72" stroke="#DC2626" strokeWidth="9" strokeLinecap="round" />
          </Svg>
        );

      case 'SIG-LANE-YELLOW-X':
        return (
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Rect x="8" y="8" width="84" height="84" rx="10" fill="#0F172A" stroke="#F59E0B" strokeWidth="3" />
            <Line x1="68" y1="32" x2="36" y2="68" stroke="#F59E0B" strokeWidth="8" strokeLinecap="round" />
            <Polygon points="34,54 30,74 50,70" fill="#F59E0B" />
          </Svg>
        );

      case 'SIG-REVERSIBLE-LANE':
        return (
          <Svg width={size * 1.2} height={size * 0.75} viewBox="0 0 130 80">
            <Rect x="4" y="4" width="122" height="72" rx="8" fill="#0F172A" stroke="#334155" strokeWidth="2.5" />
            <Line x1="35" y1="20" x2="35" y2="56" stroke="#10B981" strokeWidth="6" />
            <Polygon points="25,44 35,60 45,44" fill="#10B981" />
            <Line x1="85" y1="24" x2="105" y2="56" stroke="#DC2626" strokeWidth="6" />
            <Line x1="105" y1="24" x2="85" y2="56" stroke="#DC2626" strokeWidth="6" />
          </Svg>
        );

      case 'SIG-RAILWAY-FLASHING-RED':
        return (
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Line x1="24" y1="24" x2="76" y2="76" stroke="#FFFFFF" strokeWidth="7" />
            <Line x1="76" y1="24" x2="24" y2="76" stroke="#FFFFFF" strokeWidth="7" />
            <Circle cx="30" cy="50" r="12" fill="#DC2626" stroke="#FFFFFF" strokeWidth="2" />
            <Circle cx="70" cy="50" r="12" fill="#DC2626" stroke="#FFFFFF" strokeWidth="2" />
            <Circle cx="30" cy="50" r="6" fill="#FEE2E2" />
            <Circle cx="70" cy="50" r="6" fill="#FEE2E2" />
          </Svg>
        );

      case 'SIG-SCHOOL-CROSSING-BEACON':
        return (
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Polygon points="50,14 84,40 70,82 30,82 16,40" fill="#FACC15" stroke="#000000" strokeWidth="2.5" />
            <Circle cx="50" cy="34" r="5" fill="#000000" />
            <Line x1="50" y1="39" x2="50" y2="58" stroke="#000000" strokeWidth="4" />
            <Circle cx="50" cy="74" r="7" fill="#F59E0B" stroke="#000000" strokeWidth="2" />
            <Circle cx="50" cy="74" r="3.5" fill="#FEF08A" />
          </Svg>
        );

      case 'SIG-FIRE-STATION-SIGNAL':
        return (
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Rect x="20" y="20" width="60" height="60" rx="6" fill="#F59E0B" stroke="#000000" strokeWidth="3" />
            <Circle cx="50" cy="50" r="18" fill="#DC2626" stroke="#FFFFFF" strokeWidth="2.5" />
            <SvgText x="50" y="55" fontSize="12" fontWeight="900" fill="#FFFFFF" textAnchor="middle">FIRE</SvgText>
          </Svg>
        );

      case 'SIG-POLICE-MANUAL-STOP':
        return (
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Rect x="8" y="8" width="84" height="84" rx="10" fill="#0F172A" stroke="#3B82F6" strokeWidth="2.5" />
            <Circle cx="50" cy="28" r="6" fill="#38BDF8" />
            <Line x1="50" y1="34" x2="50" y2="64" stroke="#38BDF8" strokeWidth="5" />
            <Line x1="50" y1="44" x2="68" y2="30" stroke="#38BDF8" strokeWidth="4.5" strokeLinecap="round" />
            <Circle cx="70" cy="28" r="5" fill="#EF4444" />
            <SvgText x="50" y="80" fontSize="9" fontWeight="800" fill="#FFFFFF" textAnchor="middle">OFFICER STOP</SvgText>
          </Svg>
        );

      case 'SIG-POLICE-MANUAL-PROCEED':
        return (
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Rect x="8" y="8" width="84" height="84" rx="10" fill="#0F172A" stroke="#10B981" strokeWidth="2.5" />
            <Circle cx="50" cy="28" r="6" fill="#34D399" />
            <Line x1="50" y1="34" x2="50" y2="64" stroke="#34D399" strokeWidth="5" />
            <Path d="M 50 44 Q 68 44 68 58" stroke="#34D399" strokeWidth="4.5" fill="none" strokeLinecap="round" />
            <SvgText x="50" y="80" fontSize="9" fontWeight="800" fill="#FFFFFF" textAnchor="middle">OFFICER PROCEED</SvgText>
          </Svg>
        );

      case 'SIG-TRAFFIC-CONTROLLER-STOP-PADDLE':
        return (
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Polygon points="34,16 66,16 84,34 84,66 66,84 34,84 16,66 16,34" fill="#DC2626" stroke="#FFFFFF" strokeWidth="2" />
            <SvgText x="50" y="56" fontSize="18" fontWeight="900" fill="#FFFFFF" textAnchor="middle">STOP</SvgText>
            <Line x1="50" y1="84" x2="50" y2="98" stroke="#78350F" strokeWidth="4" strokeLinecap="round" />
          </Svg>
        );

      case 'SIG-TRAFFIC-CONTROLLER-SLOW-PADDLE':
        return (
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Polygon points="50,14 86,50 50,86 14,50" fill="#F97316" stroke="#000000" strokeWidth="2.5" />
            <SvgText x="50" y="55" fontSize="15" fontWeight="900" fill="#000000" textAnchor="middle">SLOW</SvgText>
            <Line x1="50" y1="86" x2="50" y2="98" stroke="#78350F" strokeWidth="4" strokeLinecap="round" />
          </Svg>
        );

      case 'SIG-RAMP-METER-RED-GREEN':
        return (
          <Svg width={size * 0.75} height={size} viewBox="0 0 70 100">
            <Rect x="15" y="8" width="40" height="60" rx="6" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
            <Circle cx="35" cy="24" r="9" fill="#450A0A" />
            <Circle cx="35" cy="50" r="9" fill="#10B981" />
            <Circle cx="35" cy="50" r="4.5" fill="#D1FAE5" />
            <SvgText x="35" y="84" fontSize="7" fontWeight="800" fill="#000000" textAnchor="middle">1 VEHICLE</SvgText>
            <SvgText x="35" y="93" fontSize="7" fontWeight="800" fill="#000000" textAnchor="middle">PER GREEN</SvgText>
          </Svg>
        );

      case 'SIG-BLACKOUT-FAILURE':
        return (
          <Svg width={size * 0.75} height={size} viewBox="0 0 70 100">
            <Rect x="15" y="8" width="40" height="74" rx="6" fill="#0F172A" stroke="#EF4444" strokeWidth="2.5" />
            <Circle cx="35" cy="24" r="8" fill="#334155" />
            <Circle cx="35" cy="45" r="8" fill="#334155" />
            <Circle cx="35" cy="66" r="8" fill="#334155" />
            <SvgText x="35" y="94" fontSize="7.5" fontWeight="900" fill="#DC2626" textAnchor="middle">TREAT AS 4-WAY STOP</SvgText>
          </Svg>
        );

      case 'SIG-BUS-PRIORITY-WHITE-BAR':
        return (
          <Svg width={size * 0.75} height={size} viewBox="0 0 70 95">
            <Rect x="15" y="8" width="40" height="78" rx="6" fill="#0F172A" stroke="#000000" strokeWidth="2" />
            <Circle cx="35" cy="26" r="10" fill="#1E293B" />
            <Line x1="28" y1="26" x2="42" y2="26" stroke="#FFFFFF" strokeWidth="3.5" />
            <Circle cx="35" cy="60" r="10" fill="#1E293B" />
            <Line x1="35" y1="52" x2="35" y2="68" stroke="#FFFFFF" strokeWidth="3.5" />
          </Svg>
        );

      case 'SIG-BICYCLE-SIGNAL-GREEN':
        return (
          <Svg width={size * 0.75} height={size} viewBox="0 0 70 95">
            <Rect x="15" y="8" width="40" height="78" rx="6" fill="#0F172A" stroke="#000000" strokeWidth="2" />
            <Circle cx="35" cy="26" r="10" fill="#450A0A" />
            <Circle cx="35" cy="60" r="11" fill="#10B981" />
            <Circle cx="30" cy="62" r="3" fill="#FFFFFF" />
            <Circle cx="40" cy="62" r="3" fill="#FFFFFF" />
          </Svg>
        );

      case 'SIG-VARIABLE-SPEED-OVERHEAD':
        return (
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Rect x="6" y="16" width="88" height="68" rx="8" fill="#0F172A" stroke="#334155" strokeWidth="2.5" />
            <Circle cx="50" cy="50" r="26" fill="none" stroke="#EF4444" strokeWidth="6" />
            <SvgText x="50" y="58" fontSize="22" fontWeight="900" fill="#FFFFFF" textAnchor="middle">50</SvgText>
          </Svg>
        );

      case 'SIG-DRAWBRIDGE-SIGNAL':
      case 'SIG-HAZMAT-ESCORT-SIGNAL':
        return (
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Rect x="15" y="15" width="70" height="70" rx="8" fill="#0F172A" stroke="#F59E0B" strokeWidth="3" />
            <Circle cx="36" cy="50" r="12" fill="#DC2626" />
            <Circle cx="64" cy="50" r="12" fill="#DC2626" />
            <Circle cx="36" cy="50" r="5" fill="#FEE2E2" />
            <Circle cx="64" cy="50" r="5" fill="#FEE2E2" />
          </Svg>
        );

      // =======================================================================
      // 📋 GENERAL KNOWLEDGE DRIVING SCENARIOS
      // =======================================================================
      case 'FOLLOWING_DISTANCE':
      case 'Q-GEN-FOLLOWING-DISTANCE-DRY-01':
        return renderScenarioCard('⏱️', '3-Sec Following Distance', '#3B82F6');

      case 'Q-GEN-FOLLOWING-DISTANCE-WET-01':
        return renderScenarioCard('🌧️', '4-Sec Wet Following Distance', '#0EA5E9');

      case 'HYDROPLANE_RECOVERY':
      case 'Q-GEN-HYDROPLANING-ACTION-01':
        return renderScenarioCard('💧', 'Hydroplane Recovery', '#06B6D4');

      case 'Q-GEN-RIGHT-OF-WAY-UNCONTROLLED-01':
        return renderScenarioCard('🛑', 'Yield to Vehicle on Right', '#EF4444');

      case 'Q-GEN-EMERGENCY-VEHICLES-ACTION-01':
        return renderScenarioCard('🚨', 'Emergency Siren / Pull Over', '#F59E0B');

      case 'Q-GEN-SEAT-BELT-REQUIREMENT-01':
        return renderScenarioCard('💺', 'Seat Belt Safety Rule', '#10B981');

      case 'Q-GEN-CHILD-CAR-SEAT-01':
        return renderScenarioCard('👶', 'Child Safety Restraints', '#8B5CF6');

      case 'Q-GEN-DISTRACTED-MOBILE-PHONE-01':
        return renderScenarioCard('📵', 'No Phone While Driving', '#DC2626');

      case 'Q-GEN-BLIND-SPOTS-CHECK-01':
        return renderScenarioCard('👀', 'Check Vehicle Blind Spots', '#06B6D4');

      case 'Q-GEN-ROUNDABOUT-LANE-CHOICE-01':
        return renderScenarioCard('🔄', 'Roundabout Lane Priority', '#3B82F6');

      case 'Q-GEN-HEADLIGHTS-RAIN-FOG-01':
        return renderScenarioCard('💡', 'Low Beams in Rain & Fog', '#EAB308');

      case 'Q-GEN-PARKING-HYDRANT-DISTANCE-01':
        return renderScenarioCard('🚒', '15ft Fire Hydrant Clearance', '#EF4444');

      case 'Q-GEN-DUI-ALCOHOL-LIMIT-01':
        return renderScenarioCard('🚫', 'Zero BAC Alcohol Limit', '#DC2626');

      case 'Q-GEN-TIRE-BLOWOUT-ACTION-01':
        return renderScenarioCard('🚗', 'Tire Blowout Recovery', '#F97316');

      case 'Q-GEN-SCHOOL-BUS-STOP-01':
        return renderScenarioCard('🚌', 'Stop for School Bus Arm', '#FACC15');

      case 'Q-GEN-PARALLEL-PARKING-01':
        return renderScenarioCard('🅿️', 'Parallel Parking Check', '#3B82F6');

      default:
        // Dynamic fallbacks based on prefix and category
        if (rawCode.startsWith('REG-') || cat === 'TRAFFIC_REGULATORY') {
          const label = rawCode.replace('REG-', '').replace(/-/g, ' ');
          return renderRegulatoryCircle(
            <SvgText
              x="50"
              y="54"
              fontSize={label.length > 12 ? 8 : 10}
              fontWeight="900"
              fill="#000000"
              textAnchor="middle"
            >
              {label.slice(0, 16)}
            </SvgText>
          );
        }

        if (rawCode.startsWith('WARN-') || cat === 'WARNING_SIGNS') {
          const label = rawCode.replace('WARN-', '').replace(/-/g, ' ');
          return renderWarningDiamond(
            <G>
              <SvgText x="50" y="44" fontSize="20" textAnchor="middle">⚠️</SvgText>
              <SvgText
                x="50"
                y="62"
                fontSize={label.length > 12 ? 7 : 8.5}
                fontWeight="900"
                fill="#000000"
                textAnchor="middle"
              >
                {label.slice(0, 16)}
              </SvgText>
            </G>
          );
        }

        if (rawCode.startsWith('SIG-') || cat === 'TRAFFIC_SIGNALS') {
          return renderTrafficLight('red');
        }

        if (cat === 'GENERAL_KNOWLEDGE' || rawCode.startsWith('Q-GEN')) {
          const snippet = questionText ? questionText.slice(0, 22) : 'Safe Driving Practice';
          return renderScenarioCard('🚗', snippet, '#2563EB');
        }

        // Guaranteed universal fallback
        return renderWarningDiamond(
          <G>
            <SvgText x="50" y="44" fontSize="22" textAnchor="middle">🛡️</SvgText>
            <SvgText x="50" y="64" fontSize="8" fontWeight="900" fill="#000000" textAnchor="middle">
              TRAFFIC RULE
            </SvgText>
          </G>
        );
    }
  };

  // Helper for end of restriction circle
  function renderEndRestrictionCircle() {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="46" fill="#94A3B8" />
        <Circle cx="50" cy="50" r="40" fill="#FFFFFF" />
        <Line x1="72" y1="20" x2="28" y2="80" stroke="#000000" strokeWidth="4" />
        <Line x1="78" y1="24" x2="34" y2="84" stroke="#000000" strokeWidth="4" />
      </Svg>
    );
  }

  const content = renderSignContent();
  if (!content) return null;

  return <View style={styles.container}>{content}</View>;
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
});

export default RoadSignGraphic;
