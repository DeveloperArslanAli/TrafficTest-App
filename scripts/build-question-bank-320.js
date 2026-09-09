const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function uuid() {
  return crypto.randomUUID();
}

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY 1: WARNING SIGNS (80 Unique Questions)
// ─────────────────────────────────────────────────────────────────────────────
const warningQuestions = [
  {
    text: "What does a yellow diamond-shaped sign with a sharp 90-degree arrow pointing to the right warn you of?",
    signCode: "CURVE_RIGHT",
    difficulty: "beginner",
    options: [
      "A sharp right turn ahead; slow down significantly before entering.",
      "A mandatory right turn at the next traffic light.",
      "A right-hand exit ramp with an acceleration lane.",
      "A one-way street begins to the right."
    ],
    correctIndex: 0,
    explanation: "A yellow diamond with a sharp right-angled arrow warns of a sharp turn to the right requiring drivers to reduce speed to safely negotiate the corner."
  },
  {
    text: "What precaution must you take when encountering a yellow diamond sign with a curved arrow pointing left?",
    signCode: "CURVE_LEFT",
    difficulty: "beginner",
    options: [
      "Accelerate to clear the curve before other traffic arrives.",
      "Brake before the curve, steer smoothly, and avoid crossing the center line.",
      "Shift into neutral and coast through the left curve.",
      "Honk your horn before entering the curve."
    ],
    correctIndex: 1,
    explanation: "Curve warning signs alert you to slow down prior to entering the bend so lateral forces do not cause loss of traction or lane deviation."
  },
  {
    text: "What does a road sign showing an S-shaped meandering arrow indicate?",
    signCode: "WINDING_ROAD",
    difficulty: "intermediate",
    options: [
      "A single gentle bend ahead.",
      "A winding road ahead with three or more consecutive curves.",
      "A detour around a flood zone.",
      "Road construction with temporary lane shifts."
    ],
    correctIndex: 1,
    explanation: "A winding road sign warns that the roadway ahead contains a series of three or more continuous curves, requiring reduced and attentive driving speed."
  },
  {
    text: "What should you expect when you see a yellow diamond sign with a black plus (+) symbol?",
    signCode: "INTERSECTION_CROSS",
    difficulty: "beginner",
    options: [
      "A hospital or medical first-aid station ahead.",
      "A 4-way crossroad intersection ahead; watch for entering or crossing traffic.",
      "A railroad crossing with dual tracks.",
      "A pedestrian hospital crossing zone."
    ],
    correctIndex: 1,
    explanation: "A plus-shaped symbol on a warning diamond indicates a four-way intersection ahead where cross traffic may enter or cross your path."
  },
  {
    text: "What does a yellow diamond sign with a vertical line and a perpendicular right branch indicate?",
    signCode: "SIDE_ROAD_RIGHT",
    difficulty: "beginner",
    options: [
      "A side road enters the highway from the right ahead.",
      "You must make an immediate right turn.",
      "The right lane is closed for utility maintenance.",
      "A right turn is prohibited at all times."
    ],
    correctIndex: 0,
    explanation: "This side road warning sign alerts motorists that traffic may be entering or crossing from a side street connecting from the right."
  },
  {
    text: "What does a yellow diamond sign featuring a bold 'T' symbol alert drivers to?",
    signCode: "T_INTERSECTION",
    difficulty: "beginner",
    options: [
      "Truck parking area ahead.",
      "T-intersection ahead; the road you are traveling on ends, and you must turn left or right.",
      "A toll booth is located 500 feet ahead.",
      "Temporary passing lane begins."
    ],
    correctIndex: 1,
    explanation: "A T-intersection sign warns that the through road ends ahead and you must yield and turn either left or right onto the intersecting roadway."
  },
  {
    text: "When approaching a yellow sign depicting three circular arrows in a counter-clockwise loop, what should you prepare for?",
    signCode: "ROUNDABOUT_AHEAD",
    difficulty: "intermediate",
    options: [
      "A traffic circle or roundabout ahead; reduce speed and yield to circulating traffic on your left.",
      "A mandatory 360-degree turnaround loop.",
      "A multi-level highway interchange with toll collection.",
      "A sharp spiral bridge ramp."
    ],
    correctIndex: 0,
    explanation: "A roundabout warning sign advises motorists to slow down, choose the appropriate entry lane, and yield to traffic already in the circulating circle."
  },
  {
    text: "What does a yellow diamond sign showing a red octagonal symbol with a black forward arrow above it warn drivers of?",
    signCode: "STOP_AHEAD",
    difficulty: "beginner",
    options: [
      "An unexpected mandatory STOP sign ahead; begin decelerating now.",
      "A red traffic light camera intersection ahead.",
      "Construction flagger stopping traffic.",
      "A dead-end street with a barricade."
    ],
    correctIndex: 0,
    explanation: "A Stop Ahead sign gives advance warning of a downstream STOP sign, allowing drivers time to decelerate safely, especially where visibility is limited."
  },
  {
    text: "What does a yellow warning sign showing a vertical red, yellow, and green traffic signal indicate?",
    signCode: "SIGNAL_AHEAD",
    difficulty: "beginner",
    options: [
      "Traffic light ahead; be prepared for the light to change or for stopped queues.",
      "Defective traffic light currently flashing.",
      "A railway crossing signal with wig-wag lights.",
      "A police checkpoint with hand signals."
    ],
    correctIndex: 0,
    explanation: "A Signal Ahead sign alerts drivers that a traffic control signal is coming up, particularly on high-speed roads or around obscured bends."
  },
  {
    text: "What does a road sign showing a straight road line with an angled path joining from the right indicate?",
    signCode: "MERGE_RIGHT",
    difficulty: "intermediate",
    options: [
      "Traffic from an on-ramp or side lane will merge into your flow; adjust speed to facilitate merging.",
      "You must exit the freeway immediately to the right.",
      "The right shoulder is paved for emergency vehicle passing.",
      "All traffic must come to a full stop before merging."
    ],
    correctIndex: 0,
    explanation: "A merge sign indicates that vehicles entering from an on-ramp are joining the main flow of traffic. Both through and merging drivers should adjust spacing."
  },
  {
    text: "What does a sign showing two opposite-facing arrows separated by a median obstacle at the top indicate?",
    signCode: "DIVIDED_HIGHWAY_BEGIN",
    difficulty: "intermediate",
    options: [
      "The divided highway ends and oncoming traffic shares the pavement.",
      "A divided highway begins ahead; keep to the right of the median barrier.",
      "A detour with oncoming traffic in your lane.",
      "A one-way street with bidirectional bicycle lanes."
    ],
    correctIndex: 1,
    explanation: "Divided Highway Begins warning signs inform drivers that the roadway ahead is partitioned into two separate one-way lanes by a median or barrier."
  },
  {
    text: "What does a yellow diamond sign with two vertical arrows pointing in opposite directions warn of?",
    signCode: "TWO_WAY_TRAFFIC",
    difficulty: "beginner",
    options: [
      "You are leaving a one-way street or divided highway and entering two-way traffic.",
      "A multi-lane highway with passing on both sides.",
      "A reversible express lane is currently open.",
      "Two parallel bridges ahead."
    ],
    correctIndex: 0,
    explanation: "The Two-Way Traffic sign alerts motorists that they are transitioning from a one-way street or divided road onto a single roadway carrying opposing traffic."
  },
  {
    text: "What driving technique is required when you see a warning sign depicting a truck going down an incline with a '9%' percentage?",
    signCode: "HILL_STEEP_GRADE",
    difficulty: "intermediate",
    options: [
      "Steep downgrade ahead; shift to a lower gear to use engine braking and avoid brake overheating.",
      "Shift into neutral and ride the foot brake continuously.",
      "Accelerate to build momentum for the upcoming ascent.",
      "Turn off the engine to prevent over-revving."
    ],
    correctIndex: 0,
    explanation: "Steep grade signs warn of steep mountain descents. Downshifting allows engine compression to hold vehicle speed, preventing dangerous brake fade."
  },
  {
    text: "Why is the road most hazardous immediately after light rain begins when you pass a 'Slippery When Wet' sign?",
    signCode: "SLIPPERY_ROAD",
    difficulty: "intermediate",
    options: [
      "Rain lifts accumulated motor oil and grime to the surface before washing away.",
      "Cold water cools tires instantly, hardening the rubber and losing all traction.",
      "The ABS sensors automatically disengage in drizzle.",
      "Raindrops create miniature air pockets under the wheels."
    ],
    correctIndex: 0,
    explanation: "During the first 10-15 minutes of rainfall, water mixes with accumulated engine oils, rubber particles, and grime on the road, creating an extremely slick film."
  },
  {
    text: "What must a motorist do when passing a yellow warning sign depicting a pedestrian walking across parallel lines?",
    signCode: "PEDESTRIAN_CROSSING",
    difficulty: "beginner",
    options: [
      "Maintain highway speed and sound the horn to alert pedestrians.",
      "Slow down, scan both sides of the roadway, and yield the right of way to any crossing pedestrian.",
      "Stop in the middle of the road whether pedestrians are present or not.",
      "Switch on hazard emergency lights and pass quickly."
    ],
    correctIndex: 1,
    explanation: "Pedestrian crossing signs mark locations where pedestrians frequently cross. Drivers must yield the right of way to pedestrians in marked crosswalks."
  },
  {
    text: "What does a fluorescent yellow-green pentagon-shaped sign depicting an adult and child walking with backpacks indicate?",
    signCode: "SCHOOL_ZONE",
    difficulty: "beginner",
    options: [
      "A school crossing or school zone ahead; observe reduced school zone speed limits when children are present.",
      "A community playground with no speed restrictions.",
      "A day-care facility with mandatory adult supervision required for parking.",
      "A high school athletic field with bus parking only."
    ],
    correctIndex: 0,
    explanation: "A pentagon-shaped sign is exclusively used for school zones and school crossings. Drivers must slow to the posted school speed limit and watch for children."
  },
  {
    text: "When passing a yellow diamond sign with a black silhouette of a leaping deer, what should you do at dawn and dusk?",
    signCode: "DEER_CROSSING",
    difficulty: "beginner",
    options: [
      "Flash high beams continuously to scare animals off the road.",
      "Reduce speed, scan roadside shoulders, and expect that other deer may follow if one crosses.",
      "Speed up to pass through the wildlife corridor quickly.",
      "Honk the horn at regular intervals."
    ],
    correctIndex: 1,
    explanation: "Deer crossing signs mark wildlife migration corridors. Deer travel in groups and are most active during dawn and dusk; always watch for trailing herd members."
  },
  {
    text: "What does a round yellow sign with a black 'X' and the letters 'R R' indicate?",
    signCode: "RAILROAD_CROSSING",
    difficulty: "beginner",
    options: [
      "A rest area with recreational vehicle hookups ahead.",
      "Advance warning of a railroad crossing ahead; listen and look for approaching trains.",
      "A rural road designated for agricultural equipment only.",
      "Runaway truck ramp ahead."
    ],
    correctIndex: 1,
    explanation: "The circular yellow warning sign is the advance warning sign for a highway-railroad grade crossing. Motorists must prepare to stop if a train approaches."
  },
  {
    text: "What does a warning sign showing a road bottleneck narrowing from both sides indicate?",
    signCode: "NARROW_BRIDGE",
    difficulty: "intermediate",
    options: [
      "Narrow bridge ahead; the bridge deck is narrower than the approaching road, so use caution when passing large vehicles.",
      "A drawbridge that may open at any moment.",
      "A suspension bridge subject to weight restrictions.",
      "A tunnel with overhead clearance restrictions."
    ],
    correctIndex: 0,
    explanation: "The narrow bridge sign warns that the bridge clearance width is reduced. Drivers should yield if necessary when meeting oncoming oversized commercial vehicles."
  },
  {
    text: "What does an orange diamond sign with a worker holding a shovel indicate?",
    signCode: "ROAD_WORK",
    difficulty: "beginner",
    options: [
      "Landscape nursery ahead.",
      "Highway road work or construction zone ahead; slow down and obey flaggers and posted work zone speed limits.",
      "Public snow plowing operations in winter.",
      "A public park maintenance area."
    ],
    correctIndex: 1,
    explanation: "Orange warning signs designate highway construction and maintenance zones. Drivers must slow down, increase following distance, and look out for workers."
  },
  {
    text: "When approaching an elevated viaduct posted with a high crosswind warning sign, what is the safest procedure?",
    signCode: "CROSSWIND",
    difficulty: "intermediate",
    options: [
      "Maintain a firm two-handed grip on the steering wheel and anticipate lateral gust buffeting.",
      "Accelerate to aerodynamic top speed to stabilize the chassis.",
      "Drive with one hand while leaning into the wind direction.",
      "Engage cruise control to maintain steady engine power."
    ],
    correctIndex: 0,
    explanation: "High crosswinds can push vehicles unexpectedly across lane markings. Drivers should grip the wheel firmly with both hands and avoid sudden overcorrections."
  },
  {
    text: "What hazard is indicated by a yellow diamond sign with two bumpy contours in the road symbol?",
    signCode: "UNEVEN_ROAD",
    difficulty: "beginner",
    options: [
      "A scenic mountain range overlook ahead.",
      "Uneven pavement, dips, or consecutive bumps ahead; slow down to avoid vehicle suspension damage or loss of steering control.",
      "A cattle guard crossing the roadway.",
      "Rumble strips across a toll plaza."
    ],
    correctIndex: 1,
    explanation: "Bumps and uneven road surfaces can cause loss of vehicle control or tire blowout if hit at high speed. Slow down smoothly."
  },
  {
    text: "What does a yellow diamond sign depicting a cow or bull silhouette indicate?",
    signCode: "CATTLE_CROSSING",
    difficulty: "beginner",
    options: [
      "Open-range grazing area; livestock may wander onto or across the highway.",
      "A commercial slaughterhouse exit ahead.",
      "Dairy farm products for sale.",
      "Horse-drawn buggy lane ahead."
    ],
    correctIndex: 0,
    explanation: "Cattle and livestock signs warn motorists that the road passes through open range land where domestic animals may cross without fencing."
  }
];

// Expand warning questions to exactly 80 unique questions
const warningExtra = [
  "What does a warning sign with a black arrow curving sharply over 135 degrees indicate?|CURVE_RIGHT|A hairpin curve ahead; speed must be drastically reduced to navigate the turn safely.",
  "When a road sign shows a side road entering at an acute 45-degree angle, what does it alert you to?|SIDE_ROAD_RIGHT|A side road merges at an acute angle; check mirrors carefully for vehicles entering from blind angles.",
  "What is indicated by a warning sign depicting a road splitting into a Y-junction?|T_INTERSECTION|A Y-intersection ahead; traffic divides into two diverging paths.",
  "What should a driver anticipate when seeing a yellow sign with a traffic light symbol?|SIGNAL_AHEAD|A signalized intersection is coming up; be prepared to stop if the light turns yellow.",
  "When driving on a mountain pass with a steep grade warning sign, why should you avoid riding your brakes?|HILL_STEEP_GRADE|Constant light braking causes brake overheating, fluid boiling, and catastrophic brake fade.",
  "What does a yellow sign showing a car with skid marks warn drivers about during freezing rain?|SLIPPERY_ROAD|The road surface is prone to black ice; bridge decks and overpasses freeze before ordinary road surfaces.",
  "When approaching a pedestrian crossing sign in a residential area, when must you yield?|PEDESTRIAN_CROSSING|Whenever a pedestrian is within the crosswalk or stepping off the curb into your travel path.",
  "What is the legal speed rule in an active school zone during arrival and dismissal hours?|SCHOOL_ZONE|You must slow to the posted school zone speed limit (typically 15 to 25 mph) when lights are flashing or children are present.",
  "If a deer jumps into the road in front of your vehicle at night, what is the recommended defensive reaction?|DEER_CROSSING|Brake firmly in a straight line; do not swerve radically into oncoming traffic or roadside trees.",
  "What does an advance railroad warning sign tell you to do before reaching the tracks?|RAILROAD_CROSSING|Slow down, listen for train whistles, look both ways along the tracks, and prepare to stop.",
  "Why is passing strictly prohibited on a narrow bridge?|NARROW_BRIDGE|There is insufficient roadway width for two vehicles to pass safely alongside bridge railings.",
  "In an orange highway construction zone, how are traffic violation fines typically handled?|ROAD_WORK|Traffic violation fines are doubled in designated work zones when workers are present.",
  "What type of vehicle is most vulnerable when passing an elevated crosswind hazard sign?|CROSSWIND|High-sided vehicles, RVs, commercial box trucks, and vehicles towing travel trailers.",
  "What should you do when approaching a dip or bump sign on an unfamiliar rural highway?|UNEVEN_ROAD|Release the accelerator and slow down before the dip to prevent bottoming out the undercarriage.",
  "What does an animal crossing sign in open range country imply regarding legal liability?|CATTLE_CROSSING|In open range zones, livestock owners are generally not liable if unconfined animals enter the highway.",
  "What does an advisory speed plaque mounted below a curve warning sign indicate?|CURVE_RIGHT|The maximum recommended speed in dry, ideal conditions for that curve.",
  "When approaching a roundabout warning sign, which vehicle has the primary right of way?|ROUNDABOUT_AHEAD|Vehicles already navigating inside the circulating roadway of the roundabout.",
  "When seeing a Stop Ahead sign on a foggy morning, what should you do immediately?|STOP_AHEAD|Ease off the accelerator and start gentle braking so you are not surprised by the stop line.",
  "When two highway lanes merge into one, which lane's drivers must adjust to find a gap?|MERGE_RIGHT|Both the merging driver and through drivers should cooperate smoothly to zipper-merge.",
  "What should you watch for when a Divided Highway Ends warning sign appears?|TWO_WAY_TRAFFIC|Oncoming head-on traffic will no longer be separated by a physical median barrier.",
  "Why do bridge decks freeze before roadway approaches in sub-zero weather?|SLIPPERY_ROAD|Cold air circulates both above and below the elevated bridge deck, removing heat much faster than ground soil.",
  "What is indicated by a school crossing sign placed directly at a mid-block crosswalk?|SCHOOL_ZONE|School children cross at this designated crosswalk; drivers must stop completely while children cross.",
  "What must you never do when your vehicle begins to skid on a slippery road?|SLIPPERY_ROAD|Never slam hard on the brake pedal or make violent steering corrections.",
  "What does a warning sign with a truck tilted sideways on a curved ramp warn of?|HILL_STEEP_GRADE|High risk of truck rollover due to excessive entry speed on the interchange ramp.",
  "When seeing a flagger symbol sign in a work zone, what does the flagger have authority to do?|ROAD_WORK|A construction flagger has legal authority to direct traffic and override standard signals.",
  "What does a yellow diamond sign showing an arrow curving right then left warn of?|CURVE_RIGHT|A reverse curve ahead; an initial curve to the right followed promptly by a left curve.",
  "What should you do if an uneven road sign is posted before a railroad crossing?|UNEVEN_ROAD|Cross the tracks at low speed to avoid suspension damage and prevent vehicle bottoming out.",
  "When approaching a crosswind area with a high-profile vehicle, what spacing should you give nearby cars?|CROSSWIND|Increase lateral distance and following distance because gusts can push adjacent vehicles across lane lines.",
  "What does an advance merge sign indicate regarding highway lane continuity?|MERGE_RIGHT|The right lane is terminating and drivers must safely merge into adjacent through traffic.",
  "What does a Stop Ahead sign mean if your view of the intersection is blocked by a hill crest?|STOP_AHEAD|A hidden stop sign is situated just over the hill crest; begin decelerating before the crest.",
  "What does a warning sign displaying a pedestrian with a walking stick indicate?|PEDESTRIAN_CROSSING|A crossing frequented by elderly or visually impaired pedestrians; provide extra crossing time.",
  "When seeing a Road Work Ahead sign 1 mile in advance, what is the best lane management strategy?|ROAD_WORK|Check mirrors, observe merge signs, and merge into the designated open lane early and smoothly.",
  "Why is it hazardous to overtake a vehicle within 100 feet of a railroad crossing?|RAILROAD_CROSSING|The overtaking vehicle's view of crossing signals, oncoming trains, or crossing arms is dangerously obstructed.",
  "What does a narrow bridge sign imply when two large commercial tractor-trailers meet?|NARROW_BRIDGE|One truck must yield and wait for the other to clear the narrow bridge structure.",
  "What should you do when you see a deer crossing sign and notice one deer cross the road?|DEER_CROSSING|Brake and watch the woods closely, because deer are herd animals and more are likely to follow.",
  "What does a roundabout warning sign remind motorists regarding lane changing inside the circle?|ROUNDABOUT_AHEAD|Never change lanes inside a multi-lane roundabout; select your desired lane before entering.",
  "When a Signal Ahead sign is flashing yellow beacon lights, what does that signify?|SIGNAL_AHEAD|The upcoming traffic signal is red or about to turn red; slow down immediately.",
  "What does an orange diamond sign with the word 'DETOUR' and a directional arrow mean?|ROAD_WORK|The normal road is closed ahead; all traffic must follow the temporary marked detour route.",
  "When seeing a slippery road warning sign, what is the safest adjustment to your following distance?|SLIPPERY_ROAD|Increase your following distance from 3-4 seconds to at least 6-8 seconds.",
  "What is the primary danger when approaching a blind hilltop marked with a narrow road warning?|TWO_WAY_TRAFFIC|Oncoming vehicles may be hugging the center of the road due to limited edge clearance.",
  "What should you do when approaching a pedestrian crossing near a public transit station?|PEDESTRIAN_CROSSING|Scan for commuters who may rush across the street without checking for oncoming traffic.",
  "What does a two-way traffic sign posted on a multi-lane roadway mean?|TWO_WAY_TRAFFIC|One side of the divided road is closed, and oncoming traffic has been routed into your side of the road.",
  "Why should you never coast downhill in neutral past a steep grade warning sign?|HILL_STEEP_GRADE|Coasting in neutral removes engine braking, causing vehicles to rapidly accelerate out of control.",
  "What does a yellow diamond sign with a cross symbol warn about when approaching on a rural highway?|INTERSECTION_CROSS|A major four-way crossroads ahead where farm vehicles or cross-traffic may pull out.",
  "What does an advance warning sign for a traffic signal prevent on high-speed rural routes?|SIGNAL_AHEAD|High-speed rear-end collisions by giving fast-moving vehicles ample advance braking distance.",
  "What should you do when encountering a road work zone with loose gravel surface?|ROAD_WORK|Slow down to prevent loose gravel stones from chipping windshields or reducing tire grip.",
  "What does a Stop Ahead sign prevent when placed before a newly constructed intersection?|STOP_AHEAD|Failure to yield violations caused by local drivers unfamiliar with the newly installed stop control.",
  "When an orange work zone sign says 'END ROAD WORK', what are you legally permitted to do?|ROAD_WORK|You may resume normal posted highway speed once your entire vehicle is clear of the work zone.",
  "What does a deer warning sign tell you about nighttime headlight usage on open highways?|DEER_CROSSING|Use high beams when there is no oncoming traffic to illuminate animal eyes reflecting alongside the road.",
  "When seeing a winding road warning sign, how should you distribute your steering inputs?|WINDING_ROAD|Make smooth, progressive steering movements and brake gently before each bend, not during the apex.",
  "What does a pedestrian warning sign near a park remind you about children?|PEDESTRIAN_CROSSING|Children may dart into the street unexpectedly after balls or toys without looking for oncoming cars.",
  "What does a cattle crossing sign signify when traveling through federal BLM open range?|CATTLE_CROSSING|Livestock have legal grazing rights and may bed down directly on asphalt pavement at night.",
  "Why does a narrow bridge sign require extra vigilance when roads are wet or icy?|NARROW_BRIDGE|Guardrails and concrete bridge parapets provide zero runoff margin if a vehicle skids sideways.",
  "What should you do if your brakes feel soft after descending a steep grade?|HILL_STEEP_GRADE|Pull over safely off the road into a turnout and allow the brake rotors and pads to cool down completely.",
  "What does a road work sign with 'SHOULDER DROP-OFF' warn motorists of?|ROAD_WORK|The paved travel lane is higher than the unpaved shoulder; drifting off the edge can cause loss of control.",
  "What does a yellow warning diamond with a curving arrow pointing left warn of on a rural route?|CURVE_LEFT|A sharp leftward bend ahead; slow down before entering to counteract centrifugal force.",
  "What does a warning sign showing a tractor silhouette indicate?|CATTLE_CROSSING|Slow-moving farm machinery and tractors may enter or cross the road from farm fields."
];

warningExtra.forEach((item) => {
  const [qText, code, exp] = item.split('|');
  warningQuestions.push({
    text: qText,
    signCode: code,
    difficulty: warningQuestions.length % 2 === 0 ? "intermediate" : "beginner",
    options: [
      exp,
      "Maintain maximum highway cruising speed regardless of conditions.",
      "Engage hazard flashers and stop abruptly in the travel lane.",
      "Switch to the opposing traffic lane to avoid the situation."
    ],
    correctIndex: 0,
    explanation: exp
  });
});

console.log('Total Warning questions:', warningQuestions.length);

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY 2: REGULATORY SIGNS & RULES (80 Unique Questions)
// ─────────────────────────────────────────────────────────────────────────────
const regulatoryQuestions = [
  {
    text: "What is the absolute legal requirement when approaching a red octagonal STOP sign?",
    signCode: "STOP_SIGN",
    difficulty: "beginner",
    options: [
      "Come to a complete stop at the stop line, crosswalk, or edge of intersection before proceeding when safe.",
      "Slow down to 5 mph and roll through if no cross traffic is visible.",
      "Stop only if oncoming vehicles have already entered the intersection.",
      "Honk your horn and proceed if you have the larger vehicle."
    ],
    correctIndex: 0,
    explanation: "Drivers must come to a complete, full stop before the marked stop line or crosswalk, yielding the right of way to all cross traffic and pedestrians."
  },
  {
    text: "What action is required when approaching an inverted triangular red and white YIELD sign?",
    signCode: "YIELD_SIGN",
    difficulty: "beginner",
    options: [
      "Slow down and yield right of way to approaching vehicles and pedestrians, stopping if necessary.",
      "You must always make a complete 3-second stop even if the road is clear.",
      "Speed up to merge ahead of circulating traffic.",
      "Sound your horn and proceed without checking for cross traffic."
    ],
    correctIndex: 0,
    explanation: "A YIELD sign requires you to slow down and give right of way to any vehicle or pedestrian in the intersection. You only need to stop if necessary for safety."
  },
  {
    text: "What does a circular red sign with a white horizontal bar across the center indicate?",
    signCode: "DO_NOT_ENTER",
    difficulty: "beginner",
    options: [
      "Do Not Enter; vehicular traffic is prohibited from entering this roadway or ramp.",
      "Construction zone parking permit required.",
      "Toll road entrance ahead.",
      "Temporary road closure from 10 PM to 6 AM only."
    ],
    correctIndex: 0,
    explanation: "The Do Not Enter sign marks one-way streets, freeway exit ramps, or restricted access roadways where traveling in your direction is strictly prohibited."
  },
  {
    text: "If you see a red rectangular sign stating 'WRONG WAY', what must you do immediately?",
    signCode: "WRONG_WAY",
    difficulty: "intermediate",
    options: [
      "Pull safely onto the nearest shoulder, turn around when traffic is clear, and drive in the proper direction.",
      "Continue driving forward to find the next exit ramp.",
      "Accelerate and flash high beams to warn other motorists.",
      "Back up down the freeway travel lane."
    ],
    correctIndex: 0,
    explanation: "A Wrong Way sign indicates you are driving against opposing traffic. Safely pull over immediately, turn around when clear, and proceed the correct way."
  },
  {
    text: "What does a rectangular black sign with a horizontal white arrow containing the words 'ONE WAY' require?",
    signCode: "ONE_WAY_RIGHT",
    difficulty: "beginner",
    options: [
      "Traffic moves only in the direction of the arrow; never turn against the arrow.",
      "A scenic bypass is available to the right.",
      "Only one vehicle is permitted in each lane.",
      "Passing is restricted to single-file queues."
    ],
    correctIndex: 0,
    explanation: "One Way signs specify that traffic flows solely in the indicated direction. Turning against the arrow is a major traffic violation."
  },
  {
    text: "What does a regulatory sign showing a U-turn arrow covered by a red slash circle indicate?",
    signCode: "NO_U_TURN",
    difficulty: "beginner",
    options: [
      "U-turns are prohibited at this intersection or highway crossover.",
      "U-turns are permitted for commercial delivery vehicles only.",
      "Left turns are prohibited, but full turnarounds are allowed.",
      "U-turns are allowed during non-peak commute hours only."
    ],
    correctIndex: 0,
    explanation: "A No U-Turn sign prohibits motorists from executing a 180-degree turnaround at the intersection or roadway opening."
  },
  {
    text: "What does a sign showing a left-pointing arrow with a red circle and slash prohibit?",
    signCode: "NO_LEFT_TURN",
    difficulty: "beginner",
    options: [
      "Left turns are prohibited at this intersection.",
      "Right turns are prohibited, but left turns are mandatory.",
      "U-turns are prohibited, but left turns are allowed.",
      "Left-lane passing is prohibited."
    ],
    correctIndex: 0,
    explanation: "The No Left Turn sign explicitly forbids motorists from turning left onto the cross street."
  },
  {
    text: "What does a white vertical rectangular sign with 'SPEED LIMIT 50' legally establish?",
    signCode: "SPEED_LIMIT_50",
    difficulty: "beginner",
    options: [
      "The maximum lawful speed in miles/kilometers per hour under ideal driving conditions.",
      "The minimum speed required on this roadway in heavy traffic.",
      "A suggested advisory speed for nighttime driving only.",
      "The speed limit applicable exclusively to commercial trucks."
    ],
    correctIndex: 0,
    explanation: "Regulatory speed limit signs establish the maximum lawful speed permitted on that road segment when weather and road conditions are ideal."
  },
  {
    text: "What does a regulatory sign showing the letter 'P' crossed out by a red circle and diagonal slash indicate?",
    signCode: "NO_PARKING",
    difficulty: "beginner",
    options: [
      "No parking is permitted at any time along this curb or roadway section.",
      "Parking permitted for police patrol cruisers only.",
      "Parallel parking is mandatory.",
      "Paid metered parking zone."
    ],
    correctIndex: 0,
    explanation: "A No Parking sign prohibits leaving an unattended vehicle parked along the marked zone."
  },
  {
    text: "Who is legally authorized to park in a parking space designated with the International Symbol of Access?",
    signCode: "HANDICAPPED_PARKING",
    difficulty: "beginner",
    options: [
      "Only vehicles transporting individuals with disabilities that display a valid disabled parking placard or license plate.",
      "Any vehicle stopping for less than 5 minutes with emergency hazard flashers on.",
      "Pregnant mothers and senior citizens without medical placards.",
      "Rideshare drivers waiting to pick up passengers."
    ],
    correctIndex: 0,
    explanation: "Accessible parking stalls are reserved exclusively for motorists or passengers with qualifying physical disabilities displaying official placards or plates."
  },
  {
    text: "What does a white rectangular sign displaying a traffic island graphic with an arrow curving right require?",
    signCode: "KEEP_RIGHT",
    difficulty: "intermediate",
    options: [
      "Drivers must pass to the right of the traffic island, median, or highway obstruction ahead.",
      "Drivers must make a mandatory right turn at the divider.",
      "Slower traffic must use the unpaved right shoulder.",
      "A one-way street begins to the right."
    ],
    correctIndex: 0,
    explanation: "The Keep Right regulatory sign directs traffic to stay to the right of an upcoming traffic island, divider, or roadway barrier."
  },
  {
    text: "What does a white rectangular sign displaying 'SPEED LIMIT 25' signify in most jurisdictions?",
    signCode: "SPEED_LIMIT_25",
    difficulty: "beginner",
    options: [
      "Maximum legal speed of 25 mph, commonly posted in residential neighborhoods and school districts.",
      "Minimum highway speed during fog.",
      "Advisory speed for vehicles towing trailers.",
      "Speed limit strictly for bicycles."
    ],
    correctIndex: 0,
    explanation: "A 25 mph speed limit sign is the standard statutory speed limit for residential areas, urban neighborhoods, and active school zones."
  },
  {
    text: "What does a white rectangular regulatory sign reading 'SPEED LIMIT 65' indicate on a highway?",
    signCode: "SPEED_LIMIT_65",
    difficulty: "beginner",
    options: [
      "The maximum legal speed under ideal conditions on this highway is 65 mph.",
      "You must drive at exactly 65 mph at all times.",
      "The minimum speed in the right lane is 65 mph.",
      "Speed limit for express buses only."
    ],
    correctIndex: 0,
    explanation: "Speed Limit 65 sets the maximum statutory speed under favorable driving conditions on that highway stretch."
  },
  {
    text: "When two vehicles arrive simultaneously at an uncontrolled 4-way intersection, who has the legal right of way?",
    signCode: null,
    difficulty: "intermediate",
    options: [
      "The driver of the vehicle on the left must yield to the vehicle on their right.",
      "The faster vehicle always has the right of way.",
      "The larger commercial vehicle has automatic priority.",
      "The vehicle turning left has priority over through traffic."
    ],
    correctIndex: 0,
    explanation: "Under the standard right-of-way rule, when two vehicles reach an uncontrolled or all-way stop intersection simultaneously, the driver on the left yields to the driver on the right."
  },
  {
    text: "What must you do when a school bus is stopped with red overhead lights flashing and its stop arm extended on an undivided two-lane road?",
    signCode: null,
    difficulty: "beginner",
    options: [
      "Traffic traveling in both directions must come to a complete stop until the flashing red lights are turned off.",
      "Only traffic traveling directly behind the school bus must stop.",
      "Slow down to 15 mph and pass with caution if no children are visible.",
      "Honk your horn and pass quickly on the left."
    ],
    correctIndex: 0,
    explanation: "On undivided roadways, motorists traveling in both directions must stop completely when a school bus flashes red lights and extends its stop arm."
  },
  {
    text: "Under the 'Move Over' law, what are drivers required to do when approaching a stationary emergency vehicle displaying flashing lights on a multi-lane highway?",
    signCode: null,
    difficulty: "intermediate",
    options: [
      "Vacate the lane closest to the emergency vehicle if safe to do so; otherwise, reduce speed significantly.",
      "Maintain normal cruise speed and honk to let the officer know you are passing.",
      "Stop completely in the travel lane adjacent to the emergency cruiser.",
      "Move to the shoulder and wait for the emergency vehicle to leave."
    ],
    correctIndex: 0,
    explanation: "Move Over laws mandate vacating the adjacent lane when approaching stopped emergency vehicles or tow trucks. If unable to change lanes safely, drivers must slow down substantially."
  },
  {
    text: "What is the legal minimum distance you must park away from a fire hydrant?",
    signCode: null,
    difficulty: "intermediate",
    options: [
      "15 feet (approx. 4.5 meters).",
      "5 feet.",
      "25 feet.",
      "50 feet."
    ],
    correctIndex: 0,
    explanation: "In standard traffic statutes, parking within 15 feet of a fire hydrant is prohibited to ensure emergency fire crews have unobstructed access to water connections."
  },
  {
    text: "When parking downhill on a two-way street with a raised curb, which way should your front wheels be turned?",
    signCode: null,
    difficulty: "intermediate",
    options: [
      "Turned inward toward the curb.",
      "Turned outward away from the curb.",
      "Straight ahead parallel to the street.",
      "Angle wheels depends strictly on tire pressure."
    ],
    correctIndex: 0,
    explanation: "When parked downhill with a curb, turning front wheels toward the curb ensures that if brakes fail, the vehicle rolls into the curb rather than into roadway traffic."
  },
  {
    text: "When parking uphill on a street with a raised curb, which way should you turn your steering wheel?",
    signCode: null,
    difficulty: "intermediate",
    options: [
      "Turned outward away from the curb so the back of the front tire can rest against the curb.",
      "Turned inward toward the curb.",
      "Straight ahead in line with the vehicle body.",
      "Turned at full lock to the right."
    ],
    correctIndex: 0,
    explanation: "When parking uphill with a curb, turn wheels away from the curb and let the vehicle roll back slightly until the rear edge of the front tire touches the curb."
  },
  {
    text: "What is the standard legal blood alcohol concentration (BAC) limit for non-commercial adult drivers aged 21 and older across the United States?",
    signCode: null,
    difficulty: "beginner",
    options: [
      "0.08% BAC.",
      "0.02% BAC.",
      "0.15% BAC.",
      "0.05% BAC."
    ],
    correctIndex: 0,
    explanation: "For drivers 21 and older, driving with a Blood Alcohol Concentration of 0.08% or higher is illegal per se across all US jurisdictions (and 0.05% in Utah)."
  },
  {
    text: "What does the 'Zero Tolerance' law for drivers under 21 years of age state?",
    signCode: null,
    difficulty: "beginner",
    options: [
      "It is illegal for drivers under 21 to operate a vehicle with any measurable trace of alcohol (typically 0.00% to 0.02% BAC).",
      "Drivers under 21 are allowed up to 0.08% BAC if accompanied by a parent.",
      "Underage drivers may only drink on weekends.",
      "Underage drivers face only verbal warnings for first-time DUI offenses."
    ],
    correctIndex: 0,
    explanation: "Zero Tolerance statutes make it unlawful for motorists under 21 to drive with any detectable amount of alcohol in their system, leading to immediate license revocation."
  },
  {
    text: "What is the legal requirement regarding vehicle headlights when driving in inclement weather requiring windshield wipers?",
    signCode: null,
    difficulty: "intermediate",
    options: [
      "You must turn on your low-beam headlights whenever weather conditions require continuous windshield wiper operation.",
      "You should turn on high-beam headlights to penetrate the storm.",
      "Parking lights alone satisfy all legal visibility requirements.",
      "Headlights are only legally mandatory between midnight and 5 AM."
    ],
    correctIndex: 0,
    explanation: "Most jurisdictions enforce 'Wipers On, Lights On' laws, requiring low-beam headlights during rain, snow, or mist so other motorists can see your vehicle."
  }
];

// Fill up regulatory questions to 80
const regulatoryExtra = [
  "What does a 'SPEED LIMIT 35' sign establish on an urban collector street?|SPEED_LIMIT_35|The legal maximum speed limit is 35 mph under normal, dry roadway conditions.",
  "What does a 'SPEED LIMIT 45' sign indicate on a suburban arterial?|SPEED_LIMIT_45|The maximum lawful speed is 45 mph unless weather or road hazards require lower speeds.",
  "What does a 'SPEED LIMIT 55' sign dictate on two-lane rural undivided highways?|SPEED_LIMIT_55|Maximum speed of 55 mph, providing balanced travel speed and safety on rural roads.",
  "What does a 'SPEED LIMIT 70' sign designate on rural interstate freeways?|SPEED_LIMIT_70|The maximum authorized cruising speed for passenger cars on that freeway section.",
  "What does a 'SPEED LIMIT 15' sign mandate in school crossings or alleyways?|SPEED_LIMIT_15|A very low 15 mph speed cap designed to protect pedestrians in tight or high-risk zones.",
  "When may you execute a right turn on a steady red light at an intersection?|STOP_SIGN|After coming to a complete stop, yielding to pedestrians and cross traffic, unless prohibited by a 'NO TURN ON RED' sign.",
  "What does a sign showing a right turn arrow with a red circle and slash prohibit?|NO_RIGHT_TURN|Right turns are strictly prohibited at this intersection.",
  "What does a 'ROAD CLOSED' sign require from motorists?|ROAD_CLOSED|The roadway ahead is impassable or legally closed; unauthorized entry is illegal.",
  "When parking parallel to a sidewalk curb, what is the maximum legal distance from the curb?|STOP_SIGN|The wheels must be parked within 12 to 18 inches of the curb.",
  "How far away from an active railroad crossing must you stop when warning lights are flashing?|RAILROAD_CROSSING|Between 15 and 50 feet from the nearest rail track.",
  "How close can you legally park to a marked crosswalk at an intersection?|STOP_SIGN|You must not park within 20 feet of a crosswalk at an intersection.",
  "How close to an intersection traffic signal or stop sign can you legally park?|STOP_SIGN|You cannot park within 30 feet of any stop sign, yield sign, or flashing traffic signal.",
  "What is the basic speed law applicable even when a speed limit is posted?|SPEED_LIMIT_50|You must never drive faster than is safe and prudent for current weather, road, and traffic conditions.",
  "When must you dim your high-beam headlights for oncoming traffic?|SPEED_LIMIT_50|Within 500 feet of an oncoming vehicle.",
  "When following another vehicle from behind at night, when must you dim your high beams?|SPEED_LIMIT_50|Within 200 to 300 feet of the vehicle ahead.",
  "When entering a freeway via an on-ramp, who has the right of way?|YIELD_SIGN|Through traffic already traveling on the freeway has the right of way; merging vehicles must yield.",
  "Can you legally cross a solid single white line separating highway lanes?|SPEED_LIMIT_55|Crossing is discouraged and allowed only when necessary to avoid a hazard or make a turn.",
  "What does a double solid white line between highway lanes mean?|DO_NOT_ENTER|Lane changes across double solid white lines are strictly prohibited (e.g. HOV or express lane borders).",
  "What is the legal rule regarding passing a vehicle on the right shoulder?|STOP_SIGN|Passing on the shoulder is strictly illegal at all times.",
  "When is passing on the right permitted on a two-lane road?|SPEED_LIMIT_45|Only when the vehicle ahead is making or signaling a left turn and there is sufficient paved roadway without leaving the lane.",
  "What does a 'SLOWER TRAFFIC KEEP RIGHT' regulatory sign require?|KEEP_RIGHT|Vehicles moving slower than surrounding traffic flow must stay in the rightmost lane.",
  "What is the penalty for refusing a lawful chemical test for alcohol or drugs under Implied Consent?|STOP_SIGN|Immediate administrative suspension of your driver's license, typically for 6 to 12 months.",
  "What is required when approaching an authorized emergency vehicle with red or blue flashing lights?|STOP_SIGN|Immediately drive to the right edge of the roadway, clear of intersections, and come to a complete stop.",
  "When can you pass a stopped school bus on a divided highway with an unpaved median or concrete wall?|STOP_SIGN|Traffic traveling in the opposite direction across the median barrier does not need to stop.",
  "What does a red curb marking legally signify?|NO_PARKING|No stopping, standing, or parking at any time (fire zone / emergency clearway).",
  "What does a yellow curb marking indicate?|NO_PARKING|Loading or unloading zone for passengers or freight only during designated hours.",
  "What does a white curb marking signify?|NO_PARKING|Short-term passenger pick-up or drop-off zone only.",
  "What does a blue curb marking represent?|HANDICAPPED_PARKING|Parking exclusively reserved for persons with disabilities displaying valid placards.",
  "What does a green curb marking mean?|SPEED_LIMIT_15|Short-term limited-time parking (typically 10 to 30 minutes).",
  "What must you do if your driver's license expires while you are traveling?|STOP_SIGN|You cannot legally drive with an expired license; you must renew before operating a motor vehicle.",
  "Are you legally required to carry proof of auto insurance in your vehicle?|STOP_SIGN|Yes, valid proof of financial responsibility/insurance must be presented upon request by law enforcement.",
  "What is the minimum tire tread depth required by law for passenger vehicle tires?|STOP_SIGN|2/32 of an inch across the primary contact grooves.",
  "When are child safety seats required in passenger vehicles?|STOP_SIGN|Children under age 8 or under 4 feet 9 inches tall must be secured in an approved child safety restraint.",
  "Can you legally wear headphones covering both ears while driving?|STOP_SIGN|No, covering both ears with headphones or earbuds impairs hearing emergency sirens and is illegal.",
  "What is required before pulling out from a parked position along a street curb?|STOP_SIGN|Check mirrors, turn your head to check blind spots, signal your intent, and yield to through traffic.",
  "Under what condition can a driver drive in an HOV lane during peak hours?|HANDICAPPED_PARKING|When carrying the minimum required vehicle occupants (typically 2 or 3 persons) or in an approved green vehicle.",
  "What does a 'DO NOT PASS' regulatory sign enforce?|NO_PASSING_ZONE|You are entering a no-passing zone; do not overtake any vehicle until a 'PASS WITH CARE' sign appears.",
  "What should you do if an authorized traffic officer's hand signals contradict a traffic light?|STOP_SIGN|Always follow the traffic officer's hand signals, which take precedence over mechanical signals.",
  "What is the legal speed limit in an alleyway if not otherwise posted?|SPEED_LIMIT_15|Typically 15 mph due to narrow clearance and pedestrian cross-traffic.",
  "What does a regulatory sign displaying 'NO MOTOR VEHICLES' prohibit?|DO_NOT_ENTER|All motorized vehicles are forbidden; only non-motorized pedestrian or bicycle traffic permitted.",
  "What is the legal consequence of leaving the scene of a crash involving injury or death (Hit and Run)?|STOP_SIGN|Felony criminal charges, severe fines, and mandatory revocation of driving privileges.",
  "What must you do when involved in an accident resulting in property damage over the state threshold?|STOP_SIGN|Exchange insurance and contact details, and file a formal accident report with law enforcement.",
  "When must you yield to a pedestrian using a white cane or guide dog?|STOP_SIGN|At all times, everywhere on the roadway; visually impaired pedestrians have absolute right of way.",
  "Can you legally back up on an interstate highway shoulder if you miss your exit?|DO_NOT_ENTER|No, backing up on a freeway travel lane or shoulder is strictly illegal; proceed to the next exit.",
  "What does a 'NO TURN ON RED' sign mean at a signalized intersection?|STOP_SIGN|You cannot turn in any direction while the light is red; wait for the green signal.",
  "What must you do before making a left turn across oncoming traffic on an unprotected green ball light?|YIELD_SIGN|Yield right of way to all oncoming vehicles and crossing pedestrians before completing the turn.",
  "What does a regulatory sign with an arrow turning 180 degrees with a red slash prohibit?|NO_U_TURN|U-turns are prohibited at this location.",
  "What must you do when approaching an uncontrolled railway crossing with sight lines obstructed?|STOP_SIGN|Slow down to 15 mph within 100 feet of the crossing to look and listen in both directions.",
  "What does an emergency vehicle with flashing red lights and siren require you to do on a two-way street?|STOP_SIGN|Both directions should pull to the right curb and stop until the emergency vehicle passes.",
  "Can you pass a funeral procession escorted by police vehicles?|STOP_SIGN|No, funeral processions have the right of way and passing or cutting through them is illegal.",
  "What is the maximum allowed tint darkness for front side windows in most safety regulations?|STOP_SIGN|Front side windows must allow at least 70% light transmission in most states.",
  "What does a sign reading 'COMMERCIAL VEHICLES EXCLUDED' enforce?|DO_NOT_ENTER|Heavy commercial trucks are forbidden from using this residential or scenic parkway.",
  "When is it legal to exceed the posted speed limit to pass a slower car?|SPEED_LIMIT_65|Never; the speed limit applies at all times even while executing a passing maneuver.",
  "What does a 'TRUCKS USE RIGHT LANE' sign require?|KEEP_RIGHT|Commercial trucks and heavy rigs must remain in the right lane except when making left turns.",
  "What must you do when an oncoming school bus stops with yellow flashing lights?|STOP_SIGN|Prepare to stop; the bus is about to extend its red stop arm to let children off.",
  "What does a 'NO STOPPING OR STANDING' regulatory sign mean?|NO_PARKING|You may not stop even momentarily, except to avoid conflict with other traffic or obey a police officer.",
  "What does a regulatory sign stating 'FASTEN SEAT BELTS' remind motorists of?|STOP_SIGN|Wearing safety belts is mandatory by law for all front-seat occupants and children.",
  "When parking on a hill without a curb, which way should you turn your wheels?|STOP_SIGN|Turn wheels sharply to the right toward the edge of the road so the car rolls away from traffic."
];

regulatoryExtra.forEach((item) => {
  const [qText, code, exp] = item.split('|');
  regulatoryQuestions.push({
    text: qText,
    signCode: code === 'null' ? null : code,
    difficulty: regulatoryQuestions.length % 2 === 0 ? "intermediate" : "beginner",
    options: [
      exp,
      "Maintain normal cruising speed and ignore the regulation.",
      "The rule applies only to commercial trucks over 26,000 lbs.",
      "This action is optional based on personal discretion."
    ],
    correctIndex: 0,
    explanation: exp
  });
});

console.log('Total Regulatory questions:', regulatoryQuestions.length);

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY 3: TRAFFIC SIGNALS & ROAD MARKINGS (80 Unique Questions)
// ─────────────────────────────────────────────────────────────────────────────
const signalQuestions = [
  {
    text: "What does a steady circular red traffic light mean?",
    signCode: "TRAFFIC_LIGHT_RED",
    difficulty: "beginner",
    options: [
      "Come to a complete stop before the stop line, crosswalk, or intersection and remain stopped until green.",
      "Slow down and proceed if no cross traffic is visible.",
      "Stop only if emergency vehicles are in transit.",
      "Proceed after waiting 30 seconds."
    ],
    correctIndex: 0,
    explanation: "A steady red signal requires a complete stop before entering the intersection. Drivers must wait for the green light, unless making an allowed turn on red after stopping."
  },
  {
    text: "What does a steady circular yellow traffic light indicate?",
    signCode: "TRAFFIC_LIGHT_YELLOW",
    difficulty: "beginner",
    options: [
      "The green signal is terminating and red is about to appear; stop safely before the intersection if you can do so safely.",
      "Speed up rapidly to beat the red light.",
      "You have the protected right of way to make a left turn.",
      "The traffic light is out of order."
    ],
    correctIndex: 0,
    explanation: "A yellow signal warns that the green light is ending. If you can stop safely before the intersection, you must; if already in the intersection, clear it safely."
  },
  {
    text: "What does a steady circular green traffic light allow you to do?",
    signCode: "TRAFFIC_LIGHT_GREEN",
    difficulty: "beginner",
    options: [
      "Proceed through the intersection or turn, yielding to pedestrians and vehicles already lawfully in the intersection.",
      "Accelerate immediately without checking for pedestrians.",
      "You have an absolute right of way over turning emergency vehicles.",
      "All oncoming traffic is legally required to stop for you to turn left."
    ],
    correctIndex: 0,
    explanation: "A green light means go, but drivers must first yield the right of way to crossing pedestrians and vehicles clearing the intersection."
  },
  {
    text: "What does a green arrow displayed with a red circular light mean?",
    signCode: "TRAFFIC_LIGHT_GREEN_ARROW",
    difficulty: "intermediate",
    options: [
      "You have a protected turn in the direction of the arrow; oncoming traffic faces a red signal.",
      "You must stop before turning in the arrow direction.",
      "The signal is malfunctioning and all directions must stop.",
      "Yield to oncoming vehicles before turning."
    ],
    correctIndex: 0,
    explanation: "A green arrow provides a protected turn. Oncoming traffic is stopped by a red light, allowing you to turn without yielding to opposing through traffic."
  },
  {
    text: "What must you do when approaching a flashing red traffic light?",
    signCode: "TRAFFIC_LIGHT_FLASHING_RED",
    difficulty: "beginner",
    options: [
      "Treat it exactly like a STOP sign: come to a complete stop, yield right of way, and proceed when safe.",
      "Slow down and proceed without stopping if no cars are visible.",
      "Wait until the light stops flashing.",
      "Turn on hazard warning lights and accelerate."
    ],
    correctIndex: 0,
    explanation: "A flashing red signal has the exact legal status of a STOP sign. Come to a complete stop, scan for pedestrians and traffic, and proceed only when clear."
  },
  {
    text: "What does a flashing yellow traffic signal indicate at an intersection?",
    signCode: "TRAFFIC_LIGHT_FLASHING_YELLOW",
    difficulty: "beginner",
    options: [
      "Slow down and proceed through the intersection with caution.",
      "Come to a complete stop before proceeding.",
      "The intersection is closed to civilian traffic.",
      "Yield to all vehicles behind you."
    ],
    correctIndex: 0,
    explanation: "A flashing yellow light warns drivers of an intersection or hazard. You do not need to stop, but you must reduce speed and proceed with heightened caution."
  },
  {
    text: "What does a red 'X' displayed over a highway lane control signal indicate?",
    signCode: "LANE_CONTROL_RED_X",
    difficulty: "intermediate",
    options: [
      "The lane is closed to traffic in your direction; you must not drive in this lane.",
      "The lane is reserved for high-occupancy vehicles.",
      "Speed limit is 50 mph in this lane.",
      "Lane available for emergency breakdown stopping only."
    ],
    correctIndex: 0,
    explanation: "An overhead red 'X' signal signifies that the lane is closed to traffic in your travel direction. Motorists must safely merge into an open lane."
  },
  {
    text: "What does a downward-pointing green arrow over a highway lane signify?",
    signCode: "LANE_CONTROL_GREEN_ARROW",
    difficulty: "beginner",
    options: [
      "The lane is open and you are permitted to drive in it.",
      "You must exit the highway at the next ramp.",
      "The lane is closing in 500 feet.",
      "A toll booth lane with exact change required."
    ],
    correctIndex: 0,
    explanation: "A downward green arrow indicates that the lane is open for travel in your direction."
  },
  {
    text: "What does a solid double yellow center line on a two-way roadway signify?",
    signCode: "SOLID_DOUBLE_YELLOW",
    difficulty: "beginner",
    options: [
      "Passing and overtaking are prohibited in both directions.",
      "Passing is permitted in both directions if clear.",
      "Passing permitted for the lane closest to the center line.",
      "Designated emergency vehicle parking zone."
    ],
    correctIndex: 0,
    explanation: "Double solid yellow lines mark the center of a two-way road where passing is prohibited from either direction."
  },
  {
    text: "What does a broken (dashed) yellow center line indicate on a two-lane road?",
    signCode: "BROKEN_YELLOW_LINE",
    difficulty: "beginner",
    options: [
      "Passing is permitted from either direction when safe and the oncoming lane is clear.",
      "Passing is strictly prohibited at all times.",
      "The road is one-way only.",
      "Lane reserved for left turns only."
    ],
    correctIndex: 0,
    explanation: "A dashed yellow line separates opposing traffic where passing is permitted if the opposing lane is clear with ample distance to overtake safely."
  },
  {
    text: "What does a wide, solid white line painted across an intersection approach indicate?",
    signCode: "WHITE_STOP_LINE",
    difficulty: "beginner",
    options: [
      "A stop line where vehicles must stop before entering the crosswalk or intersection.",
      "A pedestrian crossing zone where cars can stop beyond the line.",
      "A speed measurement marker for aircraft.",
      "A bicycle lane separator."
    ],
    correctIndex: 0,
    explanation: "A wide white stop line indicates where vehicles must stop behind at a stop sign or red light to keep the intersection and crosswalk clear."
  },
  {
    text: "What does a flashing yellow arrow traffic signal indicate for turning drivers?",
    signCode: "TRAFFIC_LIGHT_FLASHING_YELLOW",
    difficulty: "intermediate",
    options: [
      "Turns are permitted, but drivers must yield to oncoming traffic and pedestrians before turning.",
      "You have a protected turn; oncoming traffic must stop.",
      "You must stop and wait for a solid green arrow.",
      "Left turns are prohibited."
    ],
    correctIndex: 0,
    explanation: "A flashing yellow arrow allows turns, but the turn is unprotected: you must yield to oncoming vehicles and crossing pedestrians before completing the turn."
  }
];

// Fill up Signal questions to 80
const signalExtra = [
  "What does a solid red arrow signal mean?|TRAFFIC_LIGHT_RED|You cannot turn in the direction of the red arrow until a green signal or green arrow appears.",
  "What does a flashing red arrow mean at an intersection?|TRAFFIC_LIGHT_FLASHING_RED|Come to a complete stop, yield to pedestrians and oncoming traffic, then proceed in the arrow direction if clear.",
  "What should you do if all traffic lights at a busy intersection are completely dark due to a power outage?|STOP_SIGN|Treat the intersection as an all-way 4-way stop: come to a complete stop and follow right-of-way rules.",
  "What does a pedestrian countdown signal showing 5 seconds with a flashing hand mean?|TRAFFIC_LIGHT_RED|Do not start crossing if you have not entered; finish crossing promptly if you are already in the street.",
  "What does an illuminated white walking person pedestrian signal mean?|TRAFFIC_LIGHT_GREEN|Pedestrians may begin crossing the street in the direction of the signal; turning cars must yield.",
  "What does an illuminated steady orange hand signal indicate to pedestrians?|TRAFFIC_LIGHT_RED|Pedestrians must not enter the roadway.",
  "What does a yellow X over a lane control signal advise drivers?|LANE_CONTROL_RED_X|The lane is about to close; prepare to safely vacate the lane.",
  "What does a center lane bounded on both sides by a solid outer yellow line and dashed inner yellow line represent?|SOLID_DOUBLE_YELLOW|A two-way left-turn center lane (suicide lane); used exclusively for turning left from either direction.",
  "What is the maximum distance you are legally permitted to travel in a center two-way left-turn lane?|SOLID_DOUBLE_YELLOW|Typically no more than 200 to 300 feet before completing your left turn.",
  "What does a white diamond symbol painted in a highway lane represent?|LANE_CONTROL_GREEN_ARROW|A restricted lane reserved for High Occupancy Vehicles (carpools, vanpools, transit buses).",
  "What does a solid white line between lanes traveling in the same direction indicate?|WHITE_STOP_LINE|Lane changes are discouraged; drivers should remain in their lane unless necessary.",
  "What do broken white lines separating highway lanes signify?|BROKEN_YELLOW_LINE|Lanes travel in the same direction, and lane changes are permitted when safe.",
  "What do chevron markings painted on a triangular gore point at an exit ramp indicate?|SOLID_DOUBLE_YELLOW|The paved area between the highway and exit ramp is an exclusion zone; driving across it is illegal.",
  "What do painted white shark-teeth triangles on the roadway pavement signify?|WHITE_STOP_LINE|A yield line; vehicles must yield to traffic and stop before the triangles if yielding.",
  "What does a bicycle painted with two arrows (sharrow) on a travel lane signify?|LANE_CONTROL_GREEN_ARROW|A shared lane where bicycles may occupy the full width of the travel lane.",
  "What is the purpose of rumble strips grooved into highway center lines?|SOLID_DOUBLE_YELLOW|To produce vibration and sound alerting drowsy or distracted drivers drifting over the centerline.",
  "What does a thick solid white line along the right side of a road represent?|WHITE_STOP_LINE|The fog line (right edge line), helping drivers identify the edge of the travel pavement in poor visibility.",
  "What does a solid yellow line on the left edge of a one-way street or divided highway designate?|SOLID_DOUBLE_YELLOW|The left road edge line separating the travel lane from the median or shoulder.",
  "What does a yellow dashed line next to a solid yellow line indicate?|BROKEN_YELLOW_LINE|Passing is permitted only for traffic on the side with the broken line, when safe.",
  "What do double dashed white lines indicate on a managed express lane?|BROKEN_YELLOW_LINE|A designated entry or exit point for the managed express lane.",
  "What does an advance stop line placed 10 feet before a crosswalk for bicycles (bike box) do?|WHITE_STOP_LINE|Provides a safe zone for stopped cyclists ahead of motor vehicles at red lights.",
  "What does a green-painted bicycle lane pavement mean?|LANE_CONTROL_GREEN_ARROW|A high-conflict bicycle lane crossing where motor vehicles must yield when crossing to make right turns.",
  "What do diagonal white stripes painted in an intersection turn bay indicate?|WHITE_STOP_LINE|An exclusion buffer zone; driving across the striped pavement is prohibited.",
  "When a ramp meter signal displays red and green alternating lights on an on-ramp, what is its purpose?|TRAFFIC_LIGHT_RED|To meter traffic flow onto the freeway, permitting one vehicle per green light per lane.",
  "What must you do when an in-road pedestrian crosswalk light system is flashing amber LEDs?|PEDESTRIAN_CROSSING|A pedestrian is crossing; stop and remain stopped until the pedestrian reaches the opposite sidewalk.",
  "What does a flashing red signal at a railroad crossing indicate?|TRAFFIC_LIGHT_FLASHING_RED|A train is approaching; you must stop at least 15 feet from the nearest rail.",
  "What does a steady yellow arrow signal mean following a green arrow?|TRAFFIC_LIGHT_YELLOW|The protected turn phase is ending; prepare to stop if you have not entered the intersection.",
  "What does an illuminated red light with an illuminated green right-turn arrow allow?|TRAFFIC_LIGHT_GREEN_ARROW|You may make a protected right turn without stopping, but through traffic must remain stopped.",
  "What do continental crosswalk markings (wide longitudinal bars) provide?|CROSSWALK_MARKINGS|High visibility markings alerting motorists to designated pedestrian crosswalk locations.",
  "What does a large white 'RXR' painted on the roadway surface warn of?|RAILROAD_CROSSING|A railroad grade crossing is situated immediately ahead.",
  "What does a white painted arrow showing a curved and straight stem in a lane indicate?|LANE_CONTROL_GREEN_ARROW|The lane permits either a turn in the arrow direction or proceeding straight through.",
  "What does an only-turn arrow painted with the word 'ONLY' require?|LANE_CONTROL_GREEN_ARROW|Vehicles in this lane must make the indicated turn; proceeding straight is prohibited.",
  "What does a white line painted with 8-inch dashes indicate?|BROKEN_YELLOW_LINE|A lane that will terminate at an upcoming exit or merge (drop lane).",
  "What do raised reflective pavement markers (cat's eyes) showing red indicate to a driver?|TRAFFIC_LIGHT_RED|You are driving in the wrong direction against traffic flow; reverse course immediately.",
  "What does an emergency vehicle preemption signal (flashing white strobe on a traffic light) mean?|TRAFFIC_LIGHT_FLASHING_YELLOW|An approaching fire truck or ambulance has taken control of the signal; yield right of way.",
  "What does a yellow signal with an arrow indicate when making a U-turn from a turn lane?|TRAFFIC_LIGHT_YELLOW|The U-turn phase is ending; clear the intersection or stop before the line.",
  "What does a bus-only diamond lane marking require during posted service hours?|LANE_CONTROL_GREEN_ARROW|The lane is strictly reserved for public transit buses and approved emergency vehicles.",
  "What do dashed white lines continuing through an intersection indicate?|BROKEN_YELLOW_LINE|Lane guidance markings assisting dual-turn lanes in staying in their designated turn corridor.",
  "What does a solid yellow line on a two-way road mean if it is on your side of the center?|SOLID_DOUBLE_YELLOW|You may not pass or overtake other vehicles from your direction.",
  "What does a green arrow light pointing left mean when oncoming traffic has no green light?|TRAFFIC_LIGHT_GREEN_ARROW|You have a protected left turn and oncoming traffic is facing a solid red light.",
  "What does a white stop bar painted before a roundabout yield line indicate?|WHITE_STOP_LINE|Where vehicles must yield to circulating traffic before entering the roundabout.",
  "What does a speed hump pavement marking (series of white triangles or chevrons) indicate?|UNEVEN_ROAD|A traffic calming speed hump is located on the pavement; slow down.",
  "What does a pedestrian refuge island in the center of a wide multi-lane road provide?|PEDESTRIAN_CROSSING|A protected mid-street refuge allowing pedestrians to cross one direction of traffic at a time.",
  "What does a dynamic lane control sign showing a yellow diagonal arrow mean?|LANE_CONTROL_GREEN_ARROW|Vacate the current lane and merge into the lane indicated by the arrow direction.",
  "What does a solid single yellow line indicate when used on the left edge of a divided freeway?|SOLID_DOUBLE_YELLOW|Marks the left edge of the pavement; driving to the left of this line is on the median.",
  "What does a flashing yellow signal at a pedestrian beacon (HAWK beacon) mean?|TRAFFIC_LIGHT_FLASHING_YELLOW|Slow down; a pedestrian has pressed the button and the light is about to turn solid red.",
  "What does a solid red light at a HAWK beacon require?|TRAFFIC_LIGHT_RED|Drivers must stop completely while pedestrians cross in the crosswalk.",
  "What does an alternating flashing red signal at a HAWK beacon permit?|TRAFFIC_LIGHT_FLASHING_RED|Drivers may proceed after coming to a full stop if the pedestrian has cleared their travel path.",
  "What does a white painted bicycle symbol with the words 'BIKE LANE' establish?|LANE_CONTROL_GREEN_ARROW|A designated on-street bicycle facility; motor vehicles may only enter to make right turns near corners.",
  "What do rumble strips cut into the travel lane on approach to a stop sign indicate?|UNEVEN_ROAD|Audible and tactile warning to drivers that an unexpected stop condition is approaching ahead.",
  "What does a dashed white line along an expressway entrance ramp signify?|MERGE_RIGHT|The acceleration lane boundary where vehicles should match highway speed and merge smoothly.",
  "What does an overhead electronic variable message sign (VMS) display?|ROAD_WORK|Real-time traffic conditions, incidents, adverse weather alerts, and amber alerts.",
  "What does a flashing circular yellow beacon on an emergency fire station exit sign mean?|TRAFFIC_LIGHT_FLASHING_YELLOW|Emergency fire apparatus are entering or crossing the roadway; yield immediately.",
  "What does a white pavement text marking reading 'STOP' reinforce?|WHITE_STOP_LINE|Reinforces the mandatory stop condition established by the vertical STOP sign and stop line.",
  "What does a solid double yellow line allow you to cross in most jurisdictions?|SOLID_DOUBLE_YELLOW|Only to make a lawful left turn into an alley, private driveway, or business entrance.",
  "What do reflector markers showing blue in the center of a street signify to emergency services?|HANDICAPPED_PARKING|Indicates the precise roadside location of a municipal fire hydrant at night.",
  "What does a broken yellow line on a three-lane road with a shared center passing lane indicate?|BROKEN_YELLOW_LINE|Both directions may use the center lane for passing when clear, with extreme caution.",
  "What does a steady circular green light mean if you are waiting in the middle of an intersection to turn left?|TRAFFIC_LIGHT_GREEN|Wait for a safe gap in oncoming traffic; if the light turns yellow, complete your turn safely.",
  "What does an electronic toll collection sign (e.g. E-ZPass / SunPass) over a lane mean?|LANE_CONTROL_GREEN_ARROW|Vehicles with active transponders may pass at highway speed without stopping.",
  "What does a circular green signal mean when an emergency vehicle approaches behind you with lights and sirens?|TRAFFIC_LIGHT_GREEN|Do not block the intersection; proceed through safely if needed, then immediately pull to the right and stop.",
  "What does an illuminated white bicycle symbol in a traffic signal head mean?|LANE_CONTROL_GREEN_ARROW|Cyclists have a dedicated signal phase and may proceed through the intersection.",
  "What does a yellow traffic signal mean when you are already crossing the crosswalk?|TRAFFIC_LIGHT_YELLOW|Continue walking briskly to clear the roadway; do not turn back.",
  "What do dashed yellow guide lines in a dual left-turn intersection provide?|BROKEN_YELLOW_LINE|Visual corridor lines preventing side-swipes between parallel turning lanes.",
  "What does a pedestrian hybrid beacon (HAWK) look like compared to a standard light?|TRAFFIC_LIGHT_RED|Two red lenses above a single yellow lens arranged in an inverted triangle.",
  "What does a solid white pavement stripe on an off-ramp deceleration lane signify?|WHITE_STOP_LINE|Separates the deceleration lane from through lanes; crossing over it late is dangerous.",
  "What does a flashing yellow arrow on a freeway overhead variable sign signify?|LANE_CONTROL_GREEN_ARROW|Merge into the lane indicated by the arrow due to downstream obstruction.",
  "What do white zigzag pavement lines painted near crosswalks in the UK and international standards mean?|WHITE_STOP_LINE|No parking and no overtaking permitted on approach to the pedestrian crossing.",
  "What does a lane control signal with a steady downward diagonal yellow arrow advise?|LANE_CONTROL_GREEN_ARROW|The lane is closing soon; safely merge to the lane indicated by the arrow."
];

signalExtra.forEach((item) => {
  const [qText, code, exp] = item.split('|');
  signalQuestions.push({
    text: qText,
    signCode: code === 'null' ? null : code,
    difficulty: signalQuestions.length % 2 === 0 ? "intermediate" : "beginner",
    options: [
      exp,
      "Accelerate to pass through the signal phase before it changes.",
      "The signal applies only to commercial trucks.",
      "Disregard the marking if there is no police cruiser nearby."
    ],
    correctIndex: 0,
    explanation: exp
  });
});

console.log('Total Signal questions:', signalQuestions.length);

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY 4: GENERAL KNOWLEDGE & SAFE DRIVING (80 Unique Questions)
// ─────────────────────────────────────────────────────────────────────────────
const generalQuestions = [
  {
    text: "What is the recommended following distance under normal dry driving conditions at highway speeds?",
    signCode: "FOLLOWING_DISTANCE",
    difficulty: "beginner",
    options: [
      "At least 3 to 4 seconds of following distance behind the lead vehicle.",
      "1 car length for every 50 mph.",
      "Exactly 1 second.",
      "5 car lengths regardless of speed."
    ],
    correctIndex: 0,
    explanation: "The 3-to-4 second following distance rule provides adequate reaction time and braking distance under normal dry pavement conditions."
  },
  {
    text: "When driving in heavy rain, dense fog, or on icy roads, how should you adjust your following distance?",
    signCode: "FOLLOWING_DISTANCE",
    difficulty: "beginner",
    options: [
      "Increase following distance to 6 to 8 seconds or more.",
      "Reduce following distance to 1 second so you can see the lead car's tail lights.",
      "Maintain the exact same 3-second distance.",
      "Tailgate large trucks to use their windbreak."
    ],
    correctIndex: 0,
    explanation: "Adverse weather greatly lengthens stopping distance and degrades visibility. Increasing following distance to 6-8 seconds gives buffer to avoid collisions."
  },
  {
    text: "What is hydroplaning and what should you do if your vehicle begins to hydroplane?",
    signCode: "HYDROPLANE_RECOVERY",
    difficulty: "intermediate",
    options: [
      "Tires ride on a film of water losing road contact; ease off the accelerator and steer straight until grip returns.",
      "Slam hard on the brakes and jerk the steering wheel.",
      "Shift into reverse to create drag.",
      "Accelerate to push through the standing water."
    ],
    correctIndex: 0,
    explanation: "Hydroplaning occurs when water builds up under tires faster than tread grooves can evacuate it. Do not brake or jerk the wheel; ease off the gas and steer straight."
  },
  {
    text: "Why should you never use high-beam headlights when driving in dense fog, heavy snow, or torrential rain?",
    signCode: null,
    difficulty: "beginner",
    options: [
      "The high-beam light reflects off airborne water droplets and snowflakes, creating blinding glare back into your eyes.",
      "High beams drain the vehicle alternator prematurely in cold weather.",
      "High beams overheat the headlight housing in rain.",
      "High beams disable your windshield wipers automatically."
    ],
    correctIndex: 0,
    explanation: "High beams project light straight into fog, snow, or rain droplets, reflecting light straight back at the driver's eyes. Low beams illuminate the road surface safely."
  },
  {
    text: "What is the 'No-Zone' around large commercial semi-trucks and tractor-trailers?",
    signCode: null,
    difficulty: "intermediate",
    options: [
      "The expansive blind spots on the front, rear, and both sides where passenger cars disappear from the truck driver's view.",
      "The truck's designated loading dock zone.",
      "A no-parking zone at highway weigh stations.",
      "The area behind a truck where cargo cannot fall."
    ],
    correctIndex: 0,
    explanation: "The No-Zone refers to the four major blind spots around large trucks (front, back, left, and especially right side). If you cannot see the driver in their side mirrors, they cannot see you."
  },
  {
    text: "How should you react if your vehicle suffers a sudden tire blowout while traveling at 65 mph on the highway?",
    signCode: null,
    difficulty: "intermediate",
    options: [
      "Grip the steering wheel firmly with both hands, keep the car moving straight, ease off the accelerator, and brake gently once slowed.",
      "Slam on the brakes immediately to stop as fast as possible.",
      "Jerk the wheel sharply to pull off the road at full speed.",
      "Shift the transmission into park."
    ],
    correctIndex: 0,
    explanation: "A tire blowout causes severe pull. Slamming the brakes can cause a rollover. Grip the steering wheel firmly, ease off the gas, and brake gently only when the car has slowed."
  },
  {
    text: "If your accelerator pedal gets stuck down while driving, what is the correct emergency procedure?",
    signCode: null,
    difficulty: "advanced",
    options: [
      "Shift the transmission into neutral, apply steady firm braking, steer safely to the shoulder, and turn off the engine once stopped.",
      "Turn the ignition key to the lock position while driving at highway speed.",
      "Pump the gas pedal harder to unstick the mechanism.",
      "Jump out of the vehicle onto the shoulder."
    ],
    correctIndex: 0,
    explanation: "Shifting to neutral disengages engine power from the drive wheels without locking the steering wheel (which happens if you turn off the ignition while moving)."
  },
  {
    text: "What should you do if your foot brake pedal sinks completely to the floorboard and fails to slow the vehicle?",
    signCode: null,
    difficulty: "advanced",
    options: [
      "Rapidly pump the brake pedal to build hydraulic pressure, downshift to lower gears, and gently apply the emergency/parking brake.",
      "Turn off the engine immediately and remove the key.",
      "Shift into reverse gear.",
      "Open your door and drag your foot on the asphalt."
    ],
    correctIndex: 0,
    explanation: "Pumping brakes may restore hydraulic pressure. Downshifting uses engine compression to slow the car, and careful gradual use of the parking brake provides mechanical stopping power."
  },
  {
    text: "When your rear tires lose traction and the vehicle begins to fishtail or skid to the right, how should you steer?",
    signCode: null,
    difficulty: "intermediate",
    options: [
      "Steer smoothly into the direction of the skid (steer to the right) without slamming the brakes.",
      "Steer hard to the left in the opposite direction.",
      "Slam hard on the foot brake pedal.",
      "Accelerate aggressively to pull out of the slide."
    ],
    correctIndex: 0,
    explanation: "To recover from an oversteer skid, steer into the direction of the skid (the direction the rear end is sliding) while easing off both accelerator and brake."
  },
  {
    text: "How should you operate the brake pedal in a vehicle equipped with Anti-Lock Braking System (ABS) during an emergency stop?",
    signCode: null,
    difficulty: "beginner",
    options: [
      "Stomp on the brake pedal firmly and maintain continuous, hard downward pressure while steering around hazards.",
      "Pump the brake pedal vigorously on and off.",
      "Apply light pressure to prevent the ABS from activating.",
      "Pull the parking brake handle while braking."
    ],
    correctIndex: 0,
    explanation: "With ABS, stomp and hold: apply firm, continuous pressure. The ABS computer pulses the brakes automatically many times per second while preserving your ability to steer."
  }
];

// Fill up General questions to 80
const generalExtra = [
  "What is the single most effective safety device to prevent fatal injury in an automobile crash?|Wearing a properly adjusted three-point seat belt.",
  "Why is carbon monoxide poisoning a severe danger if your vehicle is stranded in a snowdrift?|Snow can block the exhaust tailpipe, forcing toxic odorless carbon monoxide gas into the passenger cabin.",
  "What is the 'SMOG' acronym used by driver training schools before making a lane change?|Signal, check Mirrors, check Over shoulder (blind spot), and Go when safe.",
  "How can you avoid highway hypnosis on long highway journeys?|Take regular rest breaks every 2 hours, keep fresh air circulating, and avoid staring fixatedly at the centerline.",
  "What should you do if your vehicle's hood suddenly flies open while driving?|Look through the gap under the hood or out the driver's window, slow down, and pull safely to the shoulder.",
  "If your vehicle plunges into deep water, what is the best escape procedure?|Unbuckle seat belts immediately, open or break a side window before water pressure seals the doors, and swim out.",
  "What is the safest way to pass a cyclist traveling on the right side of the road?|Slow down and maintain at least 3 to 4 feet of lateral clearance when passing.",
  "What is defensive driving?|Anticipating potential hazards, driving proactively, and leaving space cushions to prevent accidents caused by other drivers.",
  "Why are blind spot head checks (shoulder checks) mandatory even if your vehicle has blind spot monitoring sensors?|Electronic sensors have detection limits and may miss rapidly approaching motorcycles or small obstacles.",
  "What is the correct procedure when merging onto a busy freeway from an on-ramp?|Use the acceleration lane to match the speed of freeway traffic and find an open gap before merging.",
  "What should you do if you miss your intended highway exit?|Never stop or back up on the freeway; continue to the next exit and safely turn around.",
  "When driving behind a motorcycle, why should you increase your following distance?|Motorcycles can brake and stop much faster than cars, and road hazards like gravel can destabilize them quickly.",
  "What should you do if an oncoming vehicle crosses the centerline into your lane?|Sound your horn, brake firmly, and steer to the right shoulder; never steer into the oncoming lane.",
  "Why is distracted driving (texting or talking on cellphones) as dangerous as drunk driving?|It diverts visual, manual, and cognitive attention simultaneously, increasing crash risk by up to 23 times.",
  "What should you do if you start feeling drowsy while driving on a highway late at night?|Pull over in a safe parking area or rest stop and take a 20-minute nap or change drivers.",
  "How does alcohol consumption affect a driver's abilities?|It impairs judgment, reduces peripheral vision, slows reaction time, and diminishes risk perception.",
  "How long does it take the human body to metabolize and eliminate the alcohol in one standard drink?|Approximately 1 to 1.5 hours per standard drink.",
  "Can over-the-counter cold and allergy medications impair your ability to drive safely?|Yes, antihistamines and decongestants frequently cause drowsiness and slow reflexes.",
  "What is a driver's legal duty immediately following a motor vehicle collision?|Stop immediately, check for injuries, render reasonable aid, call emergency services, and exchange information.",
  "When driving a vehicle towing a heavy trailer, how does the extra weight affect stopping distance?|It significantly increases stopping distance; following distance must be doubled.",
  "Why should you never drive through moving water across a flooded roadway ('Turn Around, Don't Drown')?|Just 6 inches of rapid water can sweep a car off the road, and the roadway underneath may be washed away.",
  "How should you adjust your speed when driving on unpaved gravel roads?|Reduce speed; gravel offers substantially less tire grip and increases stopping distances.",
  "What should you do if a tire loses traction on black ice?|Take your foot off the gas pedal, avoid braking, keep the wheel straight, and let the car coast across the ice patch.",
  "What should you do if your engine overheats and steam pours from under the hood?|Pull over safely, shut off the engine, and never open the radiator pressure cap while the engine is hot.",
  "What is the recommended hand position on modern steering wheels equipped with airbag hubs?|9 and 3 o'clock (or 8 and 4 o'clock) to prevent arm injuries when the steering wheel airbag deploys.",
  "When approaching a blind curve or hill crest on a narrow two-lane road, where should your vehicle be positioned?|Keep to the right half of your lane to avoid potential head-on collisions with vehicles crossing the center.",
  "Why should you turn your headlights on at dusk and dawn even when you can still see the road?|To make your vehicle easily visible to other motorists whose vision is adjusting to changing ambient light.",
  "What should you do if an aggressive driver tailgates you and flashes high beams?|Remain calm, do not brake check, signal, and change lanes to allow them to pass safely.",
  "What should you do if you encounter road rage from another driver?|Do not make eye contact, lock doors, do not stop, and drive to the nearest police station or crowded public location.",
  "What causes brake fade during a prolonged mountain descent?|Repeated friction creates excessive heat that glazes brake pads and boils brake fluid, eliminating braking power.",
  "Why must you always look over your right shoulder when reversing in straight reverse?|Looking directly out the rear window provides a true wide field of view that mirrors cannot fully replicate.",
  "What should you do when driving in strong dust storms or blowing sand?|Pull completely off the travel pavement, turn off all exterior lights, set emergency brake, and keep foot off brake.",
  "Why is passing on the right side of a turning tractor-trailer dangerous?|Large trucks must swing wide to the left to make sharp right turns, creating a trap known as 'off-tracking'.",
  "When is vehicle tire pressure lowest?|When tires are cold in the morning or after the vehicle has been parked for several hours in cold weather.",
  "What should you do if your vehicle catches fire while driving?|Pull over immediately to an open area away from trees or buildings, turn off ignition, evacuate all passengers, and call 911.",
  "How does vehicle speed affect kinetic energy and collision impact severity?|Kinetic energy quadruples when speed doubles; a 60 mph crash has four times the destructive energy of a 30 mph crash.",
  "What should you do when driving through a highway construction zone with narrowed lanes?|Reduce speed, maintain lane discipline, watch for workers, and avoid all distractions.",
  "Why should you avoid driving alongside other vehicles in adjacent highway lanes for long periods?|You may sit in their blind spot, and you eliminate your own emergency escape cushion.",
  "What is the purpose of the 2-second rule for city driving?|It provides minimum stopping buffer in dense urban traffic at speeds below 35 mph.",
  "What should you do when entering a street from an alley, private driveway, or parking garage?|Stop completely before the sidewalk, yield to all pedestrians on the sidewalk, and yield to street traffic.",
  "What should you do if your headlights fail completely while driving on a dark highway at night?|Turn on hazard flashers, try the high-beam switch, ease off the gas, and brake safely onto the right shoulder.",
  "Why is it hazardous to leave young children or pets in a parked car on warm days?|Interior car temperatures can soar past 120°F (49°C) in under 10 minutes, causing fatal heat stroke.",
  "What is the legal blood alcohol concentration limit for commercial vehicle drivers operating a commercial motor vehicle?|0.04% BAC, which is half the limit for non-commercial passenger drivers.",
  "How should you test your brakes after driving through deep standing water?|Drive slowly and apply light pedal pressure for a few seconds to generate friction and dry out the brake linings.",
  "Why are winter snow tires more effective than all-season tires below 45°F (7°C)?|Snow tires use specialized rubber compounds that stay pliable and flexible in sub-freezing temperatures.",
  "What should you do if your vehicle's power steering fails while in motion?|Grip the wheel with both hands and steer with extra physical effort; steering still works mechanically.",
  "What is the first thing you should do if you witness an accident?|Park safely away from the scene, turn on your hazard lights, and ensure emergency responders are alerted.",
  "What should you do if a bee or insect flies into your car while driving?|Stay calm, do not swat while driving, keep your eyes on the road, roll down windows, and pull over safely to let it out.",
  "Why should you clear all snow and ice from your vehicle's roof, hood, and windows before driving?|Flying ice sheets can blind drivers behind you or slide down onto your windshield during braking.",
  "What is the purpose of safety chains when towing a utility trailer?|To maintain connection between vehicle and trailer if the hitch ball or coupler detaches while driving.",
  "What should you do if you encounter severe sun glare while driving directly toward the sunrise or sunset?|Lower the sun visor, wear polarized sunglasses, clean windshield grime inside and out, and increase following distance.",
  "When driving near farm equipment on rural roads, what should you keep in mind?|Farm machinery travels slowly (under 25 mph), swings wide, and may obscure oncoming traffic visibility.",
  "Why is passing near intersections or railroad crossings dangerous?|Cross traffic, turning vehicles, and hidden obstructions make passing hazardous within 100 feet of an intersection.",
  "What should you do if your gas pedal sticks and you have an electronic push-button start?|Press and hold the start/stop button for 3 seconds (or press 3 times) to shut off the engine while moving.",
  "What is the best way to handle tailgaters on a single-lane road?|Slow down slightly and increase following distance ahead of you so you can brake smoothly without abrupt stops.",
  "When driving at night, how far ahead should your low-beam headlights illuminate the road?|Approximately 150 to 200 feet ahead of your vehicle.",
  "How far ahead should your high-beam headlights illuminate the road under clear nighttime conditions?|Approximately 350 to 500 feet ahead.",
  "Why should you never drive in the blind spot of another vehicle?|If they change lanes abruptly to avoid a pothole or debris, they will collide with your vehicle.",
  "What is the recommended action if you begin hydroplaning on a highway curve?|Keep your hands steady on the steering wheel, avoid sudden turns or braking, and let the vehicle ride out the water.",
  "What does maintaining a 'space cushion' around your vehicle provide?|Time and space to react to sudden emergencies on any side of your vehicle without crashing.",
  "What should you do if your engine stalls while you are crossing a railroad track?|Shift to neutral, evacuate all passengers immediately, and run at a 45-degree angle toward the oncoming train.",
  "Why should you avoid using cruise control on wet, icy, or snow-covered highways?|Cruise control can accelerate during a momentary loss of traction, precipitating a dangerous skid.",
  "What is the legal blood alcohol limit (BAC) for operating a motorboat or recreational watercraft in most jurisdictions?|0.08% BAC, identical to the standard legal motor vehicle limit.",
  "When are you permitted to drive in the left-most lane of a multi-lane interstate highway?|When passing slower traffic, yielding to entering traffic, or preparing to exit on the left.",
  "What is the safest steering technique for normal highway cruising?|The push-pull (shuffle) or hand-to-hand steering method to avoid crossing arms over the airbag.",
  "What should you do if an aggressive dog chases your car or bicycle?|Do not swerve sharply into oncoming traffic; maintain control and decelerate calmly.",
  "Why should you turn your wheels toward the right shoulder when parked on a flat street?|It ensures that if your vehicle is struck from behind, it rolls onto the shoulder rather than into traffic.",
  "What is the primary risk of carrying unsecured heavy cargo in a hatchback or SUV?|In a sudden collision or rollover, unsecured items become lethal projectiles inside the cabin.",
  "How often should you check your rearview and side mirrors while driving on an open highway?|Every 5 to 8 seconds and before every braking, turning, or lane-changing maneuver.",
  "What is the main danger of driving immediately behind a gravel dump truck?|Loose stones and flying gravel can chip or shatter your windshield and damage headlights."
];

generalExtra.forEach((item) => {
  const [qText, exp] = item.split('|');
  generalQuestions.push({
    text: qText,
    signCode: null,
    difficulty: generalQuestions.length % 2 === 0 ? "intermediate" : "beginner",
    options: [
      exp,
      "Accelerate to pass through the danger area as quickly as possible.",
      "Engage emergency flashers and continue driving at maximum speed.",
      "Ignore the situation as long as the vehicle dashboard warning lights are off."
    ],
    correctIndex: 0,
    explanation: exp
  });
});

console.log('Total General questions:', generalQuestions.length);

// ─────────────────────────────────────────────────────────────────────────────
// ASSEMBLE COMPLETE 320-QUESTION BANK
// ─────────────────────────────────────────────────────────────────────────────
const all320 = [
  ...warningQuestions.map((q) => ({
    id: uuid(),
    category: "WARNING",
    difficulty: q.difficulty,
    text: q.text,
    signCode: q.signCode || null,
    imageUrl: null,
    options: q.options,
    correctIndex: q.correctIndex,
    explanation: q.explanation,
    isPublished: true
  })),
  ...regulatoryQuestions.map((q) => ({
    id: uuid(),
    category: "REGULATORY",
    difficulty: q.difficulty,
    text: q.text,
    signCode: q.signCode || null,
    imageUrl: null,
    options: q.options,
    correctIndex: q.correctIndex,
    explanation: q.explanation,
    isPublished: true
  })),
  ...signalQuestions.map((q) => ({
    id: uuid(),
    category: "SIGNAL",
    difficulty: q.difficulty,
    text: q.text,
    signCode: q.signCode || null,
    imageUrl: null,
    options: q.options,
    correctIndex: q.correctIndex,
    explanation: q.explanation,
    isPublished: true
  })),
  ...generalQuestions.map((q) => ({
    id: uuid(),
    category: "GENERAL",
    difficulty: q.difficulty,
    text: q.text,
    signCode: q.signCode || null,
    imageUrl: null,
    options: q.options,
    correctIndex: q.correctIndex,
    explanation: q.explanation,
    isPublished: true
  }))
];

console.log('\n======================================');
console.log('TOTAL ASSEMBLED QUESTIONS:', all320.length);
const catCheck = {};
for (const q of all320) catCheck[q.category] = (catCheck[q.category] || 0) + 1;
console.log('Category Counts:', catCheck);

const uniqueTexts = new Set(all320.map(q => q.text));
console.log('Unique Texts:', uniqueTexts.size, 'out of', all320.length);

if (uniqueTexts.size !== 320) {
  console.error('ERROR: Duplicate text detected!');
  process.exit(1);
}

// Write to shared/question-bank-320.json and mobile/src/utils/fullBank.json
const sharedPath = path.resolve(__dirname, '../shared/question-bank-320.json');
const mobilePath = path.resolve(__dirname, '../mobile/src/utils/fullBank.json');

fs.writeFileSync(sharedPath, JSON.stringify(all320, null, 2), 'utf-8');
console.log('✅ Written to', sharedPath);

fs.writeFileSync(mobilePath, JSON.stringify(all320, null, 2), 'utf-8');
console.log('✅ Written to', mobilePath);

console.log('🎉 320-Question generation complete!');
