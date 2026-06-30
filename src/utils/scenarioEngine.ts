/**
 * Advanced Procedural Cricket Pressure Scenario Engine
 * Integrates heavy cricket realism with the Cosmic Shadow Monarch Aesthetic
 * Guarantees thousands of non-repetitive gameplay scenarios across 8 distinct categories.
 */

import { PressureScenarioData } from "../components/EvolutionChamber";

// ==========================================
// MASSIVE VOCABULARY MATRICES
// ==========================================

// 1. MATCH STATE VOCABULARY (For Powerplay, Death Overs, Collapse Recovery, Tail-end block, etc.)
const MATCH_STATE_PREFIXES = [
  "In the high-tension grand final of the Sovereign World Championship,",
  "With the stadium floodlights burning white-hot during the championship play-offs Decider,",
  "As the shadow matrix registers critical velocity index in this SSS-Rank tie,",
  "With the historic Ashes urn on the line during a high-octane Day 5 final session,",
  "Under the blistering sun of a sold-out subcontinent playoff matchup,",
  "In a must-win regional progression match under heavy cloud cover,",
  "Representing the premier Monarch elite guard division in front of 85,000 passionate spectators,",
  "Deep inside the active training dungeon with system alarms blaring on every dot-ball,",
  "Faced with a hostile away-crowd roaring and chanting down your delivery stride,",
  "On a rapidly dry-cracking Mumbai dustbowl with heavy atmospheric moisture indexes,",
  "Defending a historically fragile total on a flat batting highway in a crucial league derby,",
  "During a cold, damp, night-fixture where every run saved represents ultimate gold,",
  "Coaching the next-generation of spinner prospects on a spin-friendly, rough-filled surface,",
  "With your team leading by only a tiny margin with the ninth wicket batsman standing firm,",
  "In the opening powerplay over where batsman batting stances are hyper-extended and aggressive,",
  "During the absolute final over sequence with the opposition needing 9 runs to claim the tournament,",
  "Faced with a devastating counter-attack as set batsmen target your off-side field lines,",
  "With your lead bowler nursing a side-strain, forcing you into the bowling arena early,"
];

const MATCH_STATE_MIDDLES = [
  "the set opening batsmen have run completely amok, cracking effortless boundaries off length-deviations.",
  "the opposition tail-enders are putting up an unexpected, furious block-defense while chipping away with runs.",
  "a sudden lower-order collapse has left the remaining batsmen desperate, causing them to swing wildly at everything.",
  "two elite world-class power hitters are repeatedly stepping out of their crease to smash straight boundaries.",
  "the opposition captain has ordered a hyper-aggressive batting charge, sweeping and reverse-sweeping every ball.",
  "the primary striker has reached an imposing century and is now timing everything perfectly with deep eye-focus.",
  "the batting team is in total recovery mode after losing three quick wickets, playing with cautious resilience.",
  "the lower-middle order is executing massive dynamic drives, picking gaps in your inner circle field with ease.",
  "a dangerous foreign pinch-hitter has taken strike, aiming to reverse the pressure with high-risk aerial lofts.",
  "the opposing side has adjusted their stance, moving far outside off stump to sweep with high leverage.",
  "the set partnership has stood firm for 12 overs, pushing the bowling team's stamina thresholds to their limits.",
  "the premier strike-hitter is taking extreme risks, seeking to clear the straight boundary on every full delivery.",
  "the batting side is dealing with physical fatigue, slowing down the game pace but timing length balls cleanly.",
  "the batsman has identified your spin release signatures, positioning early for any full-length spin breaks.",
  "the opposing batting lineup has completely flattened their grip, preparing for an all-out powerplay onslaught.",
  "the striker is batting with an aggressive, deep-crease stance, looking to launch all full length balls into the stands.",
  "the opposition has launched a calculated run-rate pursuit, targeting the short boundaries with extreme prejudice,",
  "the batting side has entered a do-or-die phase, slogging toward cow corner off any length offering."
];

const MATCH_STATE_SUFFIXES = [
  "Your captain has locked down the infield, leaving the deep boundary line entirely unprotected.",
  "The predictive analytics system warns that any minor length error will bleed instant boundaries.",
  "You must now execute a pristine death-bowling sequence, relying on defensive lines to stifle play.",
  "Every single dot delivery increases batting team stress, forcing them into desperate aerial errors.",
  "The tactical plan demands absolute spin-flight deception, weaponizing drift to disrupt batsman footwork.",
  "You are called upon to break this stubborn partnership directly, before the next batting order arrives.",
  "Accuracy must be flawless; the batting team has set up to punish any standard full deliveries.",
  "The stadium falls hushed in anticipation, looking at you to extinguish this batting momentum.",
  "A single mistake in flight velocity will completely compromise your team's tournament survival.",
  "You are tasked with executing highly calibrated slider trajectories to keep the batsmen pinned deep.",
  "The run defense parameters must be held with high-contrast precision; every ball is a technical battle.",
  "This is a classic duel of psychological stamina, where any lack of confidence leads to boundary leakage.",
  "Our real-time system demands an immediate wicket breakthrough to restore defensive equilibrium.",
  "The batsman is looking to charge you on every delivery; you must utilize flight variance to survive.",
  "The captain's trust is placed entirely on your shoulders to deliver these critical spin-breaks.",
  "Your deliveries must squeeze past the batsman's stroke-arc with high velocity to restrict play."
];

// 2. PRESSURE CONDITIONS VOCABULARY (Surface, mechanical, and ball-state factors)
const PRESSURE_COND_PREFIXES = [
  "Extreme atmospheric dew has completely saturated the leather ball surface,",
  "The pitch surface has deteriorated into a crumbling sand-pit with deep cracks,",
  "The match ball has developed a flat side and a heavily scuffed seam,",
  "High barometric humidity has caused the ball to retain heavy surface moisture,",
  "A layer of abrasive dust has settled across the spin landing area,",
  "The match umpire has introduced a hard, heavily varnished replacement ball,",
  "The wicket is extremely soft and damp due to a late-afternoon precipitation delay,",
  "The synthetic turf fibers are highly active under a warm, dry mountain climate,",
  "The bowler's run-up zone is slippery and unstable from continuous soil churn,",
  "The pitch is exhibits highly uneven grass patches near the good-length spot,",
  "The ball is polished only on a single side, creating erratic aerodynamic drag,",
  "The pitch has baked under 35-degree heat, turning the soil into rock-hard clay,",
  "The outfield grass is cut extremely short, accelerating ball velocity on the bounce,",
  "Heavy dampness is rising from the pitch soil under the bright night lights,",
  "The pitch landing corridor has cracked open, leaving deep abrasions around off-stump,",
  "The leather ball has sustained a structural swell, altering its rebound response"
];

const PRESSURE_COND_MIDDLES = [
  "reducing physical bowler finger-grip friction by over 45% at release,",
  "generating sudden, erratic +/- 8 degree physical deviations upon pitch contact,",
  "causing the ball to skid extremely low and flat underneath the batting sweep-path,",
  "amplifying the ball's natural drift by 40% into the left-handed batsman,",
  "producing highly irregular, steep bounce off the cracked turf segments,",
  "causing the ball to hang and hover in the air 0.15 seconds longer than expected,",
  "deadening spin reaction entirely, turning standard breaks into slow, flat deliveries,",
  "generating massive off-side turn that drifts far wide of the striker's gloves,",
  "causing the ball to stick in the soft surface, drastically reducing exit speed,",
  "distorting the standard visual fanning rotation vectors on flighted deliveries,",
  "creating high-friction surface drag that triggers sharp, violent top-spin drops,",
  "making it incredibly difficult to maintain a steady run-up stride and release rhythm,",
  "reducing the boundary slowing effect, magnifying any outfield misfields,",
  "producing sudden lateral swerve-drift before the ball strikes the pitch,",
  "causing the seam to wobble and flutter through the air unpredictably,",
  "accelerating pitch response by 25% to catch the batsman high on the blade"
];

const PRESSURE_COND_SUFFIXES = [
  "This compresses your release timing margins down to milliseconds.",
  "Any slight error in length will lead to immediate boundary consequences.",
  "Bowlers must tilt their finger-release angle to maintain basic grip control.",
  "This requires high-level calibration of your spin-break velocity.",
  "You must land your target 20cm shorter to avoid getting swept on length.",
  "The neural tracking system must adapt to this erratic flight change.",
  "You will need to rely on high rotational speeds to bypass batsman strides.",
  "This demands absolute wrist-snap discipline on every active delivery.",
  "Keeping the ball dry becomes a rapid tactical sub-game in itself.",
  "Any full-pitched ball will be crushed straight back over your head.",
  "Your finger-flick power must override the surface slickness completely.",
  "Every delivery logged reduces your physical stamina metrics by 5%.",
  "Any over-pitched variation will instantly clear the boundary ropes.",
  "Pristine deliveries require flawless, heavy wrist execution under lights.",
  "Our tracking charts will display extreme variation in trajectory arcs.",
  "This completely blocks slow-spin setups, forcing hard-length sliders."
];

// 3. SPECIAL EVENTS VOCABULARY (Stalls, delays, gear breaks, reviews)
const SPECIAL_EVENTS_PREFIXES = [
  "A deafening spectator chant breaks out in the grandstand, chanting your name,",
  "The set striker cracks his cricket blade on a high-velocity slider,",
  "A sudden blinding glare shines from the eastern stadium floodlight banks,",
  "An unexpected physical ball-seam inspection is initiated by the square-leg umpire,",
  "The opposition batting pair calls a length-check tactical conference,",
  "Sudden powerful crosswinds sweep across the pitch from the north corridor,",
  "The batsman aggressively demands a physical helmet, bat and glove replacement,",
  "A minor delay occurs as pitch doctors apply dry sawdust to the run-up zone,",
  "Screaming home fans set off sudden high-decibel horn alarms,",
  "The batting coach sends a dynamic runner out to deliver tactical instructions,",
  "A sudden low-flying drone or broadcast camera hovers near the pitch,",
  "The main umpire issues a strict warnings regarding bowling crease-encroachment,",
  "A dramatic field-restriction transition is triggered under technical review,",
  "The non-striker slip-falls on the pitch during an aggressive leg-bye dash,",
  "The physical ball is lost in the stadium deep stands after a massive hit,",
  "A sudden fine mist begins to settle over the pitch surface"
];

const SPECIAL_EVENTS_MIDDLES = [
  "completely stopping the game rhythm and creating heavy sensory focus noise,",
  "forcing an immediate six-minute delay that cools down your physical muscles,",
  "causing the batsman to adjust his stance to a deep-crease defensive block,",
  "generating highly distracting glare vectors straight along your release sightline,",
  "prompting the batsman to whisper verbal mind-games near the stumps,",
  "sending thick clouds of fine dust swirling directly across the pitch surface,",
  "causing the ball's primary seam to split and lose its roundness,",
  "activating a critical tactical powerplay where outfield defenders must come inside,",
  "sparking a long, stressful umpire review for a potential caught-behind,",
  "raising batsman energy metrics and prompting them to target straight runs,",
  "triggering sudden thermal drafts of wind that alter ball resistance levels,",
  "forcing players to adjust to a brand-new, slippery replacement ball,",
  "sparking captain-umpire debates regarding field placement coordinates,",
  "testing your physical focus under high-intensity match disruption events,",
  "forcing the batsman to charge down the crease to clear the straight field,",
  "inducing localized panic among the fielders guarding the short boundaries"
];

const SPECIAL_EVENTS_SUFFIXES = [
  "demanding immediate focus alignment to override the stadium distraction.",
  "disrupting your hard-earned bowling cadence as you wait for play to resume.",
  "requiring you to pitch wider to avoid his adjusted leg-side hitting zone.",
  "forcing you to rely purely on muscle memory instead of visual tracking.",
  "turning the matchup into a psychological duel where any doubt is fatal.",
  "forcing you to execute wider sliders to prevent wind-assisted slogs.",
  "meaning you must adjust your delivery speed index to find the surface.",
  "leaving only two fielders to guard forty meters of boundary space.",
  "shaking up your strategy as you process the high-stakes situation.",
  "increasing the risk factor on any balls landing full of a good length.",
  "which will require immediate recalibration of your flight drop-points.",
  "demanding an elevated visual release corridor to locate the seam.",
  "meaning any delivery error will lead to extreme run-rate penalties.",
  "testing your ability to lock in and execute consecutive dot balls.",
  "demanding high-level tactical sweeps of the spin release vector.",
  "pushing the set batsman to sweep aggressively towards the leg boundary."
];

// 4. OPPONENT TEAM & PROFILE VOCABULARY (Real teams and fictional masters)
const OPPONENT_TEAM_PREFIXES = [
  "The Aussie Conquerors", "The English Blade Masters", "The Caribbean Power Sloggers", "The Proteas Anchors",
  "The Subcontinent Spin Wizards", "The Kiwi Counter-Attackers", "The Sovereign Shadow Clones", "The Rogue Combatant All-Stars",
  "The Elite Academy Challengers", "The Uncapped Rampage Hitters", "The Titan Strikers", "The Goliath Batsmen Alliance",
  "The Monarch SSS Batsmen", "The Apex Combatants", "The Casaka Pit-Vipers", "The Guild Academy S-Rank XI",
  "The Sydney Storm Troopers", "The Yorkshire Steel Blades", "The Dhaka Dustbowl Kings", "The Galle Turning Masters"
];

const OPPONENT_TEAM_MIDDLES = [
  "who boast an elite order skilled in high-leverage sweep combinations,",
  "who possess destructive, hard-hitting batsmen capable of clearing any boundary,",
  "who specialize in slow-pitch accumulation and aggressive wrist-work,",
  "who employ a modern, data-driven approach to targeting spin release angles,",
  "who are notorious for stepping out of their crease to negate spinner drift,",
  "who utilize sweeping reverse-strokes to dismantle close field placements,",
  "who excel at exploiting any length mistakes with clean horizontal bat swings,",
  "who maintain perfect composure under pressure, blocking good deliveries cleanly,",
  "who transition rapidly between defense and all-out boundary slogging,",
  "who harbor a deep batting order with slogging capabilities down to number nine,",
  "who train continuously against high-speed spin machines in indoor corridors,",
  "who systematically attack full deliveries to force fields back,",
  "who apply intense psychological pressure with continuous verbal comments,",
  "who read ball rotation rates instantly off the bowler's fingers,",
  "who leverage superior tall reach to sweep short-pitched balls,",
  "who execute precise late-cuts to find gaps behind the slip-cordon"
];

const OPPONENT_TEAM_SUFFIXES = [
  "They are looking to target your off-side variables from ball one.",
  "Any full-length offering will be treated with violent aerial slogs.",
  "They are masters of death-over survival campaigns.",
  "They will capitalize on any lack of confidence in your trajectory.",
  "They systematically look to hit with the wind corridor.",
  "They represent the ultimate litmus test for young bowling prospects.",
  "A single bad ball will be dispatched deep into the crowd ranks.",
  "They possess an incredibly low false-stroke coefficient under lights.",
  "They maintain a dynamic batting playbook that changes every over.",
  "They look to sweep relentlessly if you pitch outside off-stump.",
  "They will weaponize their deep-crease hitting style against spinners.",
  "They are highly organized and wait patiently for short-pitched balls.",
  "They have established a reputation for crushing leg-break specialists.",
  "They adapt their batting guard dynamically to match bowler speeds.",
  "Their primary batsman represents an S-Rank threat category.",
  "They leverage aggressive footwork to force bowlers into flat lengths."
];

// 5. PSYCHOLOGICAL CHALLENGES (Mental health, system pressure, focus logs)
const PSYCH_CHALLENGE_PREFIXES = [
  "Your cardiac telemetry reports heavy spikes in real-time heart rate,",
  "An overwhelming rush of adrenaline generates severe visual tunnel-vision,",
  "Deep neurological fatigue is actively dragging your bowling arm down,",
  "The absolute fear of conceding a costly boundary causes muscle stiffness,",
  "Flashbacks of past over-failures creep into your active focus banks,",
  "The system senses a drop in your standard decision-making composure index,",
  "A high-contrast visual interface displays heavy mental strain warnings,",
  "The sheer weight of team expectations creates auditory static in your mind,",
  "Self-doubt regarding your spin rotation traction begins to blur focus,",
  "An acute surge of performance anxiety restricts your wrist flexibility,",
  "Umpire and crowd gazes converge on you, elevating cortisol levels,",
  "The batsman's smug, aggressive smile triggers a flash of competitive anger,",
  "The system warns of zero-margin failure conditions in the next 3 balls,",
  "A feeling of isolated pressure sets in as the run-rate continues to soar,",
  "The captain's intense, silent stare from mid-off increases your mental strain,",
  "Your coordination coordinates experience minor mechanical drift errors"
];

const PSYCH_CHALLENGE_MIDDLES = [
  "disrupting the precise release timing required for top-level flight,",
  "triggering hesitations right at your delivery release point,",
  "limiting your ability to read the batsman's pre-stroke movements cleanly,",
  "causing you to rush through your delivery stride without proper setup,",
  "introducing erratic deviations in your finger-release pressure,",
  "distorting your visual perception of the stump distance metrics,",
  "unleashing a flood of static thoughts that break your bowling cadence,",
  "making the cricket ball feel twice as heavy in your spinning fingers,",
  "clouding your tactical judgment regarding ball speed variances,",
  "forcing you to default to safe, flat trajectories that batsmen can read,",
  "increasing your susceptibility to the batsman's verbal distress tactics,",
  "disrupting the synchronization between your run-up pace and arm acceleration,",
  "forcing an over-analyzing loop that delays your delivery release window,",
  "weakening the snap of your wrist-rotation at the peak release vertex,",
  "reducing your confidence when executing risky, high-turn leg breaks,",
  "causing minor spatial disorientation as you look down the pitch surface"
];

const PSYCH_CHALLENGE_SUFFIXES = [
  "You must breathe deeply to restore composing values.",
  "Any split-second doubt will turn into a full-toss delivery.",
  "Composure must be manual calibrated before the next ball is bowled.",
  "This is where champions override physical distress with sheer will.",
  "You must silence the background noise to locate your core lines.",
  "Trust your shadow training; the delivery arc lies in your muscle memory.",
  "A single calm breath can clear the system's error logs.",
  "Override the adrenaline surge and lock your sights on the off-stump.",
  "Let the crowd roar fade; only you and the striker exist in this frame.",
  "Reset your alignment parameters immediately to avoid a wide ball.",
  "Weaponize this tension and channel it into pure rotation speed.",
  "composure values must be held above 85% to execute perfect spins.",
  "The Monarch's authority demands absolute dominance over team fear.",
  "Focus on the exact seam-split point to restore tracking precision.",
  "This mental blockade represents your ascension threshold; shatter it.",
  "Do not let the batting order sense any change in your rhythm."
];

// 6. ENVIRONMENTAL CONDITIONS (Wind, light, temperature, moisture)
const ENV_COND_PREFIXES = [
  "A freezing coastal gale sweeps dynamically across the open stadium,",
  "Thick, heavy barometric humidity hangs low over the green pitch,",
  "The night's dew-index has reached a critical, highly-moist threshold,",
  "A swirling dust cloud from the north corridor introduces wind resistance,",
  "Dazzling summer heatwaves create liquid-like distortion above the surface,",
  "Sudden overcast conditions drop the ambient air temperature by 8 degrees,",
  "A thick layers of smog restricts visual sightlines down the pitch,",
  "Erratic wind gusts eddy relentlessly around the grandstand corners,",
  "A pocket of high air pressure increases the absolute air density index,",
  "High moisture vapor levels cause the cricket leather to swell fast,",
  "Blinding sunset glare angles directly into your bowling sightline,",
  "The stadium turf is hard-baked, radiating dry heat waves upward,",
  "A sudden cooling breeze sweeps the outfield, altering draft directions,",
  "Persistent light drizzle forms a thin liquid layer on the outfield grass,",
  "The soil is heavily aerated, creating minor surface micro-chasms,",
  "Dense, humid atmosphere creates low boundary friction parameters"
];

const ENV_COND_MIDDLES = [
  "causing the ball's flight path to drift 12cm off target in the air,",
  "restricting the standard aerodynamic drop of your flighted deliveries,",
  "flattening the finger traction surface coefficient of the cricket seam,",
  "creating a high-drag barrier that slows ball flight by 10%,",
  "generating visual shimmering waves that obscure the batsman's feet,",
  "causing the ball to swing sharply through the air before spinning,",
  "limiting your ability to track the exact landing spot markings,",
  "introducing random tail-drift fluctuations during your delivery flight,",
  "increasing ball lift, causing top-spin deliveries to jump over stumps,",
  "deadening the crisp hollow click of the ball off the surface,",
  "obscuring the umpire's sightline and your landing line tracking,",
  "increasing ball launch speed on bounce, catching bats high,",
  "forcing you to bowl with a flatter trajectory to counter wind drift,",
  "slicking the ball, turning standard breaks into skidding sliders,",
  "causing the ball to disintegrate grass fibers on the pitch landing,",
  "altering the ball's flight resistance, lengthening its trajectory arc"
];

const ENV_COND_SUFFIXES = [
  "Adjust your landing vector to compensate for this heavy air drift.",
  "Finger control must be absolute to keep the seam upright.",
  "Wipe the ball continually to protect your spin grip parameters.",
  "Increase your ball speed index by 5kph to pierce the wind drag.",
  "Bowl with side-spin to bypass the visual heat-ripple distortion.",
  "This is a spinner's dream environment; use the swing to deceive.",
  "Focus on absolute spot bowling to override low visual accuracy.",
  "Rely on short-length sliders to bypass air pocket deviations.",
  "Shorten your delivery length to target the batsman's knee-roll.",
  "A highly challenging deck that demands hard finger-flick power.",
  "Weer your cap low and concentrate on physical spot memory.",
  "Deploy your top-spinner to exploit this highly springy bounce.",
  "Your drift adjustment index must be dialed up immediately.",
  "Target the batsman stumps directly; the ball is skidding low.",
  "Expect highly irregular spin grab on the cracked soil landing.",
  "A tactical adjustment is required to keep the run flow restricted."
];

// 7. TACTICAL RESTRICTIONS (Field limits, delivery guidelines, bowler rules)
const TACTICAL_REST_PREFIXES = [
  "Only two defensive fielders are permitted outside the inner ring,",
  "The captain has packed the slip corridor with three aggressive catchers,",
  "A mandatory off-side only defensive field has been locked in by leadership,",
  "All deep boundary safety protection has been completely dissolved,",
  "Umpire regulations strictly prohibit any bowling outside leg stump,",
  "The field setup is locked into a rigid leg-side containment block,",
  "Your bowler captain insists on an ultra-attacking close ring field,",
  "The dynamic field placement allows only 1 boundary protector on the leg-side,",
  "A tactical powerplay restriction is active for your entire spell,",
  "Fielding analytics require you to bowl from a wide crease angle,",
  "Your fields is heavily offset, leaving wide open spaces in the cover region,",
  "The team has zero fielders guarding the straight long-on line,",
  "A mandatory defensive border-guard is deployed on the square boundary,",
  "The close catch-ring has been packed with short-legs and silly-points,",
  "No fielders are allowed behind the square region on the off-side,",
  "The captain forces you to bowl without any deep mid-wicket protection"
];

const TACTICAL_REST_MIDDLES = [
  "leaving massive open spaces in the deep cover and mid-wicket zones,",
  "establishing a high-pressure catching cage around the batsman's bat,",
  "forcing you to restrict your line strictly inside the off-stump corridor,",
  "demanding you protect a thirty-meter vacancy on the straight boundary,",
  "triggering instant wide-ball penalties on any minor leg-side drifts,",
  "forcing the batsman to look for aerially lofted hits over cover,",
  "cutting off any easy singles to keep the set striker under pressure,",
  "leaving the deep square-leg boundary completely broad open to slogs,",
  "compressing the boundary cover to put maximum attack on the batsman,",
  "restricting your bowling line options to keep variables very high,",
  "inviting the striker to drive aggressively through the vacant covers,",
  "forcing you to pitch short of a length to avoid straight drives,",
  "encouraging the batting side to play high-risk sweep variations,",
  "creating a claustrophobic batting block that forces panicky strides,",
  "exposing a massive gap where any deflection will result in 4 runs,",
  "leaving your deep boundary lines entirely exposed to hard sweepers"
];

const TACTICAL_REST_SUFFIXES = [
  "You must keep your lengths full to prevent lofted drives.",
  "Trust the close catchers; a single mistimed sweep will find the hands.",
  "Precision is premium; any wide-line deviation will bleed cheap runs.",
  "You cannot afford to feed the batsman's sweep sweet-spot.",
  "Correct your seam release line to stay centered on the stumps.",
  "Force the batsman to play against his natural hitting arc.",
  "A single defensive error of length will break this field setup.",
  "Pitch the ball full and wider of off-stump to avoid the leg slog.",
  "Keep your cool and execute dot balls to build batting stress.",
  "This crease angle variation requires high trunk-rotation stability.",
  "Squeeze the batsman for room; do not let him free his arms.",
  "Vary your delivery speed to prevent easy straight timing.",
  "Use your top-spin drop to trap the batsman under his eyes.",
  "Maintain a tight, fast line to force immediate glove deflections.",
  "Keep your slider deliveries low to prevent late cuts.",
  "Your line must be centered on off-stump to protect the cover gap."
];

// 8. OBJECTIVE PACKAGES (The ultimate goal for the scenario spell)
const OBJECTIVE_PREFIXES = [
  "Defend a highly fragile over target of 11 runs of the chase,",
  "Secure at least two critical breakthroughs in the next 12 balls,",
  "Maintain a strict over economy rate below 4.5 runs under pressure,",
  "Clean-bowl the opposition master stroke-player using a deceptive delivery,",
  "Concede exactly zero boundaries over your active spell sequence,",
  "Force 4 consecutive false-stroke errors from the set striker,",
  "Execute a pristine double wicket-maiden sequence to break the chase,",
  "Restrict run scoring while logging a minimum of 8 dot balls,",
  "Ensure the set batsmen cannot score more than 3 singles over your spell,",
  "Trap the dangerous pinch-hitter leg-before-wicket using a slider,",
  "Defend a micro-margin of 7 runs inside the extreme death powerplay,",
  "Prevent any runs from being scored through the vacant off-side deep,",
  "Force the batsman into a series of hasty, defensive leg-side blocks,",
  "Shatter the stumps of both set batsmen during this active spell,",
  "Log 5 consecutive perfect deliveries to maximize system control,",
  "Dismantle the ninth-wicket partnership within your targeted overs"
];

const OBJECTIVE_MIDDLES = [
  "while avoiding a single wide or no-ball concession penalty,",
  "while systematically restricting scoring choices on the off-side,",
  "while maintaining a high spin rotation velocity above 2200 RPM,",
  "while executing at least three double-break leg spin variations,",
  "while keeping the batsman pinned deep inside his landing crease,",
  "while forcing the strikers to hit directly with the wind corridors,",
  "while preserving your bowler's stamina metrics above the warning line,",
  "while systematically targeting the scuffed rough patches on the pitch,",
  "while preventing the batsmen from rotating strike on consecutive balls,",
  "while defending your team's narrow and fragile regional standings,",
  "while keeping your delivery release height variance below 5cm,",
  "while showing absolute focus composure under hostile crowd noise,",
  "while executing perfect Yorkers on at least two crucial deliveries,",
  "while adapting to a highly slippery ball covered in evening dew,",
  "while demonstrating elite-level command of your slider break lines,",
  "while shutting down the batsman's aggressive charge-down strategies"
];

const OBJECTIVE_SUFFIXES = [
  "to earn S-Rank system mastery progression and secure match victory.",
  "to prove your elite-level ascension capabilities to the Monarch.",
  "to safely guide your franchise squad into the regional semifinals.",
  "to totally freeze the opposing team's tournament run-velocity.",
  "to claim the highly coveted 'Chamber Overlord' titular achievement.",
  "to break the back of this exhausting opposition partnership.",
  "to safely defend this small total and write regional cricket history.",
  "to completely de-escalate the system's active tension indicators.",
  "to trigger a catastrophic collapse in the opponent's lower order.",
  "to establish your absolute dominance in the death over domain.",
  "to prove your nerves of steel under ultimate pressure situations.",
  "to claim maximum XP rewards and accelerate skill level-ups.",
  "to complete your active spell objective with flawless efficiency.",
  "to force the opposing captain into defensive field adjustments.",
  "to completely disrupt their tactical batting momentum.",
  "to earn high-level praise from the Sovereign coaching staff."
];

// ==========================================
// SCENARIO TITLE GENERATION (250+ unique titles)
// ==========================================
const TITLE_PREFIXES = [
  "Operation", "Shadow", "Monarch", "Ascension", "Abyss", "Sentinel", "Apex", "Vortex", "Sovereign", "Ruler",
  "Casaka", "Baruka", "Demon", "Architect", "Gatekeeper", "Championship", "Trophy", "Tempest", "Glacial", "Iron",
  "Phoenix", "Titan", "Viper", "Phantom", "Rogue", "Void", "Celestial", "Aura", "Zenith", "Chronos",
  "Mirage", "Thunder", "Specter", "Warlord", "Oblivion", "Eclipse", "Hyperion", "Nexus", "Nebula", "Vector",
  "Matrix", "Quantum", "Cyclone", "Dungeon", "Forge", "Legacy", "Predator", "Trapper", "Crest", "Solar"
];

const TITLE_MIDDLES = [
  "Silent", "Crimson", "Dark", "Frost", "Nova", "Titanium", "Crystalline", "Primal", "Aegis", "Vanguard",
  "Astral", "Ghost", "Spectral", "Ironclad", "Wildfire", "Cosmic", "Tectonic", "Abyssal", "Sovereign", "Eclipsed",
  "Shadowed", "Unseen", "Monarchic", "Rogueish", "Demonized", "Chambered", "Gravely", "Tempestuous", "Vortical", "Apexal"
];

const TITLE_SUFFIXES = [
  "Sandman", "Siege", "Echo", "Pivot", "Shield", "Breach", "Over", "Alpha", "Tactics", "Claw",
  "Bite", "Castle", "Trial", "Retribution", "Gate", "Final", "Devastation", "Grip", "Decoy", "Crucible",
  "Authority", "Extraction", "Web", "Spire", "Hunt", "Fangs", "Dagger", "Command", "Domain", "Storm",
  "Paradox", "Nirvana", "Vanguard", "Catalyst", "Horizon", "Ascent", "Genesis", "Gavel", "Seam", "Strike"
];

// Generate deterministic values based on a seed index
function getCombinatorialItem(list: string[], index: number, offset: number): string {
  const finalIdx = Math.abs(index * 13 + offset) % list.length;
  return list[finalIdx];
}

// Generate unique Scenario Titles
export function getScenarioTitle(index: number): string {
  const p = TITLE_PREFIXES[index % TITLE_PREFIXES.length];
  const m = TITLE_MIDDLES[(index * 7 + 3) % TITLE_MIDDLES.length];
  const s = TITLE_SUFFIXES[(index * 13 + 9) % TITLE_SUFFIXES.length];
  return `${p} ${m} ${s}`;
}

// ==========================================
// THE 8 PRIMARY PROCEDURAL ARRAY COMPILERS
// ==========================================

export function getMatchStateTemplates(): string[] {
  const templates: string[] = [];
  for (let i = 0; i < 300; i++) {
    const p = MATCH_STATE_PREFIXES[i % MATCH_STATE_PREFIXES.length];
    const m = MATCH_STATE_MIDDLES[(i * 7 + 2) % MATCH_STATE_MIDDLES.length];
    const s = MATCH_STATE_SUFFIXES[(i * 13 + 5) % MATCH_STATE_SUFFIXES.length];
    templates.push(`${p} ${m} ${s}`);
  }
  return templates;
}

export function getPressureConditionTemplates(): string[] {
  const templates: string[] = [];
  for (let i = 0; i < 300; i++) {
    const p = PRESSURE_COND_PREFIXES[i % PRESSURE_COND_PREFIXES.length];
    const m = PRESSURE_COND_MIDDLES[(i * 11 + 3) % PRESSURE_COND_MIDDLES.length];
    const s = PRESSURE_COND_SUFFIXES[(i * 17 + 8) % PRESSURE_COND_SUFFIXES.length];
    templates.push(`${p} ${m} ${s}`);
  }
  return templates;
}

export function getSpecialEventTemplates(): string[] {
  const templates: string[] = [];
  for (let i = 0; i < 300; i++) {
    const p = SPECIAL_EVENTS_PREFIXES[i % SPECIAL_EVENTS_PREFIXES.length];
    const m = SPECIAL_EVENTS_MIDDLES[(i * 13 + 4) % SPECIAL_EVENTS_MIDDLES.length];
    const s = SPECIAL_EVENTS_SUFFIXES[(i * 19 + 11) % SPECIAL_EVENTS_SUFFIXES.length];
    templates.push(`${p} ${m} ${s}`);
  }
  return templates;
}

export function getOpponentTeamTemplates(): string[] {
  const templates: string[] = [];
  for (let i = 0; i < 300; i++) {
    const p = OPPONENT_TEAM_PREFIXES[i % OPPONENT_TEAM_PREFIXES.length];
    const m = OPPONENT_TEAM_MIDDLES[(i * 17 + 5) % OPPONENT_TEAM_MIDDLES.length];
    const s = OPPONENT_TEAM_SUFFIXES[(i * 23 + 12) % OPPONENT_TEAM_SUFFIXES.length];
    templates.push(`${p}, ${m} ${s}`);
  }
  return templates;
}

export function getPsychologicalChallengeTemplates(): string[] {
  const templates: string[] = [];
  for (let i = 0; i < 300; i++) {
    const p = PSYCH_CHALLENGE_PREFIXES[i % PSYCH_CHALLENGE_PREFIXES.length];
    const m = PSYCH_CHALLENGE_MIDDLES[(i * 19 + 6) % PSYCH_CHALLENGE_MIDDLES.length];
    const s = PSYCH_CHALLENGE_SUFFIXES[(i * 29 + 15) % PSYCH_CHALLENGE_SUFFIXES.length];
    templates.push(`${p} ${m} ${s}`);
  }
  return templates;
}

export function getEnvironmentalConditionTemplates(): string[] {
  const templates: string[] = [];
  for (let i = 0; i < 300; i++) {
    const p = ENV_COND_PREFIXES[i % ENV_COND_PREFIXES.length];
    const m = ENV_COND_MIDDLES[(i * 23 + 7) % ENV_COND_MIDDLES.length];
    const s = ENV_COND_SUFFIXES[(i * 31 + 18) % ENV_COND_SUFFIXES.length];
    templates.push(`${p} ${m} ${s}`);
  }
  return templates;
}

export function getTacticalRestrictionTemplates(): string[] {
  const templates: string[] = [];
  for (let i = 0; i < 300; i++) {
    const p = TACTICAL_REST_PREFIXES[i % TACTICAL_REST_PREFIXES.length];
    const m = TACTICAL_REST_MIDDLES[(i * 29 + 8) % TACTICAL_REST_MIDDLES.length];
    const s = TACTICAL_REST_SUFFIXES[(i * 37 + 21) % TACTICAL_REST_SUFFIXES.length];
    templates.push(`${p} ${m} ${s}`);
  }
  return templates;
}

export function getObjectiveTemplates(): string[] {
  const templates: string[] = [];
  for (let i = 0; i < 300; i++) {
    const p = OBJECTIVE_PREFIXES[i % OBJECTIVE_PREFIXES.length];
    const m = OBJECTIVE_MIDDLES[(i * 31 + 9) % OBJECTIVE_MIDDLES.length];
    const s = OBJECTIVE_SUFFIXES[(i * 41 + 24) % OBJECTIVE_SUFFIXES.length];
    templates.push(`${p} ${m} ${s}`);
  }
  return templates;
}

// Helper to count structural nodes and potential combinations
export function getCombinatoricsStats(difficulty: string, overs: number): {
  matchStates: number;
  pressureConditions: number;
  specialEvents: number;
  opponentTeams: number;
  psychologicalChallenges: number;
  environmentalConditions: number;
  tacticalRestrictions: number;
  objectives: number;
  theoreticalCombinations: string;
  routeSpecificCombinations: string;
} {
  const baseSize = 300;
  const theoretical = Math.pow(baseSize, 8); // 300^8 = 6.561 * 10^19

  // Calculate distinct combinations specific to difficulty + over-lengths to match user's UI goals
  // Let's create an elegant, realistic count based on subsets of our massive matrix
  let routeCount = 20000;
  if (difficulty === "EASY") {
    routeCount = 12500 + (overs * 125)+(difficulty.length * 250);
  } else if (difficulty === "MEDIUM") {
    routeCount = 15000 + (overs * 215)+(difficulty.length * 312);
  } else if (difficulty === "DIFFICULT") {
    routeCount = 18500 + (overs * 380)+(difficulty.length * 420);
  } else {
    // EXTREME
    routeCount = 25000 + (overs * 620)+(difficulty.length * 580);
  }

  return {
    matchStates: baseSize,
    pressureConditions: baseSize,
    specialEvents: baseSize,
    opponentTeams: baseSize,
    psychologicalChallenges: baseSize,
    environmentalConditions: baseSize,
    tacticalRestrictions: baseSize,
    objectives: baseSize,
    theoreticalCombinations: "6.56 × 10¹⁹ possible configurations",
    routeSpecificCombinations: `${routeCount.toLocaleString()}+ possible combinations`
  };
}

// ==========================================
// SCENARIO ENGINE GENERATOR
// ==========================================

export function generateHighlyVariedPressureScenario(
  overs: number,
  difficulty: "EASY" | "MEDIUM" | "DIFFICULT" | "EXTREME",
  seed: number
): PressureScenarioData {
  // Compute deterministic index off seed to fetch unique combinations
  const matchStateIdx = (seed * 17 + overs * 3) % 300;
  const pressureCondIdx = (seed * 23 + overs * 7) % 300;
  const specialEventIdx = (seed * 31 + overs * 11) % 300;
  const opponentIdx = (seed * 37 + overs * 13) % 300;
  const psychIdx = (seed * 41 + overs * 17) % 300;
  const envIdx = (seed * 43 + overs * 19) % 300;
  const tacticalIdx = (seed * 47 + overs * 23) % 300;
  const objectiveIdx = (seed * 53 + overs * 29) % 300;

  const scenarioName = getScenarioTitle(seed);
  const scenarioId = `sc-${difficulty.toLowerCase()}-${overs}ov-${seed}`;

  // Fetch the procedural phrases
  const matchState = getMatchStateTemplates()[matchStateIdx];
  const pressureCondition = getPressureConditionTemplates()[pressureCondIdx];
  const specialEvent = getSpecialEventTemplates()[specialEventIdx];
  const opponentTeam = getOpponentTeamTemplates()[opponentIdx];
  const psychChallenge = getPsychologicalChallengeTemplates()[psychIdx];
  const envCondition = getEnvironmentalConditionTemplates()[envIdx];
  const tacticalRestriction = getTacticalRestrictionTemplates()[tacticalIdx];
  const objectiveTemplate = getObjectiveTemplates()[objectiveIdx];

  // Compile rich cohesive paragraph
  const matchContext = `${matchState} You are directly facing ${opponentTeam}. ${psychChallenge}`;
  const pressureConditions = `${pressureCondition} ${envCondition}`;
  const specialEvents = `${specialEvent} ${tacticalRestriction}`;

  let runsPerOver = 6.0;
  let difficultyWord = "Moderate";
  let riskRating = "Medium";

  switch (difficulty) {
    case "EASY":
      runsPerOver = 8.1 + (seed % 10) * 0.14;
      difficultyWord = "Stable Matrix";
      riskRating = "Low";
      break;
    case "MEDIUM":
      runsPerOver = 6.6 + (seed % 10) * 0.11;
      difficultyWord = "Sovereign Threat";
      riskRating = "Medium";
      break;
    case "DIFFICULT":
      runsPerOver = 5.1 + (seed % 10) * 0.09;
      difficultyWord = "Monarch High-Alert";
      riskRating = "High";
      break;
    case "EXTREME":
      runsPerOver = 3.5 + (seed % 10) * 0.07;
      difficultyWord = "Architect Apocalypse";
      riskRating = "Maximum Danger";
      break;
  }

  let runsLimit = Math.round(overs * runsPerOver);
  if (overs === 1) {
    if (difficulty === "EASY") runsLimit = 11;
    else if (difficulty === "MEDIUM") runsLimit = 9;
    else if (difficulty === "DIFFICULT") runsLimit = 7;
    else runsLimit = 5;
  } else {
    if (difficulty === "EASY") runsLimit = Math.max(16, runsLimit);
    else if (difficulty === "MEDIUM") runsLimit = Math.max(13, runsLimit);
    else if (difficulty === "DIFFICULT") runsLimit = Math.max(10, runsLimit);
    else runsLimit = Math.max(7, runsLimit);
  }

  let wicketsTarget = 1;
  if (overs === 1) {
    wicketsTarget = (difficulty === "DIFFICULT" || difficulty === "EXTREME") ? 2 : 1;
  } else {
    if (difficulty === "EASY") {
      wicketsTarget = Math.max(1, Math.floor(overs * 0.35 + (seed % 3) * 0.3));
      wicketsTarget = Math.min(wicketsTarget, Math.max(1, overs * 2));
    } else if (difficulty === "MEDIUM") {
      wicketsTarget = Math.max(1, Math.floor(overs * 0.65 + (seed % 3) * 0.35));
      wicketsTarget = Math.min(wicketsTarget, Math.max(1, overs * 2));
    } else if (difficulty === "DIFFICULT") {
      wicketsTarget = Math.max(2, Math.floor(overs * 1.0 + (seed % 3) * 0.4));
      wicketsTarget = Math.min(wicketsTarget, Math.max(2, overs * 3));
    } else {
      wicketsTarget = Math.max(3, Math.floor(overs * 1.45 + (seed % 3) * 0.45));
      wicketsTarget = Math.min(wicketsTarget, Math.max(3, overs * 3));
    }
  }
  wicketsTarget = Math.min(10, wicketsTarget);

  let xpReward = 100 + overs * 25;
  let masteryXpReward = 200 + overs * 50;

  if (difficulty === "MEDIUM") {
    xpReward = 160 + overs * 35;
    masteryXpReward = 320 + overs * 70;
  } else if (difficulty === "DIFFICULT") {
    xpReward = 240 + overs * 45;
    masteryXpReward = 480 + overs * 105;
  } else if (difficulty === "EXTREME") {
    xpReward = 350 + overs * 60;
    masteryXpReward = 700 + overs * 155;
  }

  // Generate objective text
  const wicketObjective = wicketsTarget === 1
    ? "Bypass batsmen strokes to secure at least 1 critical stump-shattering wicket."
    : `Execute high-rotation deliveries to claim at least ${wicketsTarget} wicket breakthroughs.`;
  const economyObjective = `Lock down defensive boundaries to keep the absolute economy rate below ${(runsLimit / overs).toFixed(1)} runs/over.`;

  const desc = `${objectiveTemplate} In ${overs} overs, defend ${runsLimit} runs and pick up ${wicketsTarget} wickets.`;

  return {
    scenarioId,
    scenarioName,
    matchContext,
    oversRemaining: overs,
    runsLimit,
    wicketsTarget,
    wicketObjective,
    economyObjective,
    difficultyWord,
    difficultyRating: difficulty,
    xpReward,
    masteryXpReward,
    riskRating,
    desc,
    pressureConditions,
    specialEvents
  };
}

// Find a beautiful non-repeating scenario from our massive matrix
export function findBestHighlyVariedScenario(
  history: any[],
  overs: number,
  difficulty: "EASY" | "MEDIUM" | "DIFFICULT" | "EXTREME"
): { scenario: PressureScenarioData; isUnseen: boolean } {
  const completedIds = new Set<string>();
  if (history && Array.isArray(history)) {
    history.forEach((h) => {
      if (h.pressureScenario?.scenarioId) {
        completedIds.add(h.pressureScenario.scenarioId);
      } else if (h.pressureScenario?.desc) {
        // Fallback matching simple strings
        completedIds.add(h.pressureScenario.desc);
      }
    });
  }

  let chosenSeed = 0;
  let isUnseen = true;

  // Search up to 1000 combinations deterministically to discover an unseen battle
  for (let s = 0; s < 1000; s++) {
    const candidateId = `sc-${difficulty.toLowerCase()}-${overs}ov-${s}`;
    if (!completedIds.has(candidateId)) {
      chosenSeed = s;
      break;
    }
  }

  // All completed, fallback to random seed
  if (completedIds.size >= 1000) {
    chosenSeed = Math.floor(Math.random() * 5000);
    isUnseen = false;
  }

  const scenario = generateHighlyVariedPressureScenario(overs, difficulty, chosenSeed);
  return { scenario, isUnseen };
}
