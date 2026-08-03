/* 
  Titration Simulator - Wizard Logic
  Step 0: Intro (Gallery)
  Step 1: Prep (Pipette Milk, Add Phenol)
  Step 2: Titration (Fill Burette, Titrate to Pink)
  Step 3: Observation
*/

// --- DOM ELEMENTS ---
const body = document.body;
const instructionText = document.getElementById("instruction-text");
const btnStart = document.getElementById("btn-start");
const btnNextWrapper = document.getElementById("next-container");
const btnNext = document.getElementById("btn-next");
const hoverTooltip = document.getElementById('hover-tooltip');

// Groups
const groupBurette = document.getElementById('burette-group');
const groupFlask = document.getElementById('flask');
const groupPipette = document.getElementById('pipette-group');
const groupPhenol = document.getElementById('phenol-group');
const groupMilk = document.getElementById('milk-group');
const groupTitrationTools = document.getElementById('titration-tools-group');

// Interactive Elements
const pipette = document.getElementById("empty-pippete");
const pipetteMilk = document.getElementById("pipette-milk");
const milkBeaker = document.getElementById("milk-beaker");
const flaskDiv = document.getElementById("flask"); // The wrapper
const filledFlask = document.getElementById("filled-flask");
const emptyFlask = document.getElementById("empty-flask");
const titratedFlask = document.getElementById("titrated-flask");
const phenolCap = document.getElementById("phenolphthelein-cap");
const phenolDrop = document.getElementById("phenol-drop");
const naoh = document.getElementById("naoh");
const naohLiquid = document.getElementById("naoh-liquid");
const cylinder = document.getElementById("cylinder");
const cylinderContainer = document.getElementById('cylinder-container');
const funnel = document.getElementById('funnel');
const buretteSol = document.getElementById('burette-sol');
const buretteNob = document.getElementById('burette-nob');
const buretteDrop = document.getElementById('burette-drop');

// Live Data
const liveTitrationEl = document.getElementById('live-titration-val');
const observationScreen = document.getElementById('observation-screen');
const inputAnswer = document.getElementById('input-answer');
const btnCheckAnswer = document.getElementById('btn-check-answer');
const feedbackMsg = document.getElementById('feedback-msg');

// --- STATE ---
let currentStep = 0; // 0=Intro, 1=Prep, 2=Titration, 3=Observation
let prepState = {
  milkAdded: false,
  phenolAdded: false,
  isAnimating: false
};
let titrationState = {
  naohInCylinder: false,
  naohInBurette: false,
  flaskUnder: false,
  titrationStarted: false,
  titrationRunning: false,
  volume: 0.0,
  maxVolume: 16.0,
  isPink: false,
  intervalId: null
};

// --- INITIALIZATION ---
function init() {
  updateView();
  initTooltips();

  // Event Listeners
  btnStart.addEventListener('click', () => nextStep());
  btnNext.addEventListener('click', () => nextStep());

  // Step 1 Interactions
  pipette.addEventListener('click', handlePipetteClick);
  phenolCap.addEventListener('click', handlePhenolClick);

  // Step 2 Interactions
  naoh.addEventListener('click', handleNaohClick);
  cylinderContainer.addEventListener('click', handleCylinderClick);
  // Re-bind flask click for titrator move
  flaskDiv.addEventListener('click', handleFlaskMoveClick);
  buretteNob.addEventListener('click', handleNobClick);

  // Step 3
  btnCheckAnswer.addEventListener('click', handleCheckAnswer);
}

// --- NAVIGATION ---
function nextStep() {
  currentStep++;
  updateView();
}

function updateView() {
  // Update Body Class
  body.className = `overflow-hidden bg-slate-950 step-${currentStep}`;

  // Individual Button Visibility
  const btnStart = document.getElementById('btn-start');
  const btnNext = document.getElementById('btn-next');

  if (currentStep === 0) {
    btnStart.classList.remove('hidden');
    btnNext.classList.add('hidden');
  } else {
    btnStart.classList.add('hidden');
    btnNext.classList.add('hidden'); // Ensure NEXT is hidden at start of step
  }

  // Text Instructions
  switch (currentStep) {
    case 0:
      instructionText.textContent = "Make yourself familiar with the instruments & glassware";
      break;
    case 1:
      instructionText.textContent = "Click on the Pipette to draw 10 mL milk sample and pour it into the flask.";
      // Reset positions if needed
      pipette.style.transform = '';
      pipetteMilk.style.transform = '';
      break;
    case 2:
      instructionText.textContent = "Click on the NaOH bottle to fill NaOH into the measuring cylinder";
      // Ensure visual transition state
      if (filledFlask) filledFlask.style.opacity = '1';
      break;
    case 3:
      instructionText.textContent = "Observation Table";
      observationScreen.classList.remove('hidden');
      break;
  }
}

// --- UTILS ---
function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

function setInstruction(text) {
  instructionText.textContent = text;
}

// --- STEP 1 LOGIC (PREP) ---
async function handlePipetteClick() {
  if (currentStep !== 1 || prepState.isAnimating || prepState.milkAdded) return;
  prepState.isAnimating = true;

  // Animation Logic (Reused/Simplified)
  const pipetteRect = pipette.getBoundingClientRect();
  const milkRect = milkBeaker.getBoundingClientRect();
  const flaskRect = flaskDiv.getBoundingClientRect();

  // 1. To Milk
  const toMilkX = (milkRect.left + milkRect.width / 2) - (pipetteRect.left + pipetteRect.width / 2) - 50;
  const toMilkY = milkRect.top - pipetteRect.top - 80;

  pipette.style.transition = pipetteMilk.style.transition = "transform 1s ease-in-out";

  // Up
  pipette.style.transform = pipetteMilk.style.transform = `translate(0px, -350px)`;
  await wait(1000);
  // Over
  pipette.style.transform = pipetteMilk.style.transform = `translate(${toMilkX}px, -350px)`;
  await wait(1000);
  // Down
  pipette.style.transform = pipetteMilk.style.transform = `translate(${toMilkX}px, ${toMilkY}px)`;
  await wait(1000);

  // Draw Milk
  pipetteMilk.classList.add("show");
  await wait(1000);

  // Up
  pipette.style.transform = pipetteMilk.style.transform = `translate(${toMilkX}px, -350px)`;
  await wait(1000);

  // 2. To Flask
  const toFlaskX = (flaskRect.left + flaskRect.width / 2) - (pipetteRect.left + pipetteRect.width / 2);
  const toFlaskY = flaskRect.top - pipetteRect.top - 80;

  // Over
  pipette.style.transform = pipetteMilk.style.transform = `translate(${toFlaskX}px, -350px)`;
  await wait(1000);
  // Down
  pipette.style.transform = pipetteMilk.style.transform = `translate(${toFlaskX}px, ${toFlaskY}px)`;
  await wait(1000);

  // Pour
  pipetteMilk.classList.remove("show");
  pipetteMilk.classList.add("pour");
  await wait(1000);
  filledFlask.classList.add("show"); // Show milk in flask
  // emptyFlask.style.opacity = '0'; // REMOVED: Keep empty flask visible as filledFlask is overlay only

  // Reset
  pipette.style.transform = pipetteMilk.style.transform = `translate(${toFlaskX}px, -350px)`;
  await wait(1000);
  pipette.style.transform = pipetteMilk.style.transform = `translate(0, 0)`;
  await wait(1000);

  prepState.milkAdded = true;
  prepState.isAnimating = false;

  setInstruction("Click on the Phenolphthalein cap to pour few drops into the flask");
  checkStep1Completion();
}

async function handlePhenolClick() {
  if (currentStep !== 1 || prepState.isAnimating || !prepState.milkAdded || prepState.phenolAdded) return;
  prepState.isAnimating = true;

  const capRect = phenolCap.getBoundingClientRect();
  const flaskRect = flaskDiv.getBoundingClientRect();

  const targetX = flaskRect.left - capRect.left + 30;

  phenolCap.style.transition = "transform 1s ease-in-out";
  phenolCap.style.transform = `translate(0px, -300px)`;
  await wait(1000);

  phenolCap.style.transform = `translate(${targetX}px, -300px)`;
  await wait(1000);

  // Drop
  if (phenolDrop) {
    phenolDrop.classList.add("show");
    await wait(1000);
    phenolDrop.classList.remove("show");

    // Flask shakes or color tint briefly?
    filledFlask.style.filter = "brightness(0.95)"; // slight change
    setTimeout(() => filledFlask.style.filter = "none", 500);
  }

  phenolCap.style.transform = `translate(0px, -200px)`;
  await wait(1000);
  phenolCap.style.transform = `translate(0px, 0px)`;
  await wait(1000);

  prepState.phenolAdded = true;
  prepState.isAnimating = false;

  checkStep1Completion();
}

function checkStep1Completion() {
  if (prepState.milkAdded && prepState.phenolAdded) {
    setInstruction("Preparation complete. Click 'NEXT' to proceed.");
    btnNext.classList.remove('hidden');
  }
}

// --- STEP 2 LOGIC (TITRATION) ---
// Instructions: NaOH -> Cyl -> Burette -> FlaskMove -> Nob
async function handleNaohClick() {
  if (currentStep !== 2 || titrationState.naohInCylinder || prepState.isAnimating) return;
  prepState.isAnimating = true; // reuse lock

  const naohRect = naoh.getBoundingClientRect();
  const cylRect = cylinder.getBoundingClientRect();

  // Helper to get current transform X/Y (even if from CSS class)
  const style = window.getComputedStyle(naoh);
  const matrix = new DOMMatrixReadOnly(style.transform);
  const startX = matrix.m41;
  const startY = matrix.m42;

  // Calculate target deltas relative to current visual position
  const deltaX = cylRect.left - naohRect.left + 90;
  const deltaY = cylRect.top - naohRect.top - 150;

  // New target transforms (relative to layout origin = start + delta)
  const liftY = startY - 240;
  const targetX = startX + deltaX;
  const targetY = startY + deltaY;

  naoh.style.transition = 'transform 1s ease-in-out';

  // 1. Lift
  naoh.style.transform = `translate(${startX}px, ${liftY}px)`;
  await wait(1000);

  // 2. Move Horizontal
  naoh.style.transform = `translate(${targetX}px, ${liftY}px)`;
  await wait(1000);

  // 3. Move Down to Pour
  naoh.style.transform = `translate(${targetX}px, ${targetY}px)`;
  await wait(1000);

  // 4. Tilt (using CSS variable for final position)
  naoh.style.setProperty('--x', `${targetX}px`);
  naoh.style.setProperty('--y', `${targetY}px`);
  naoh.classList.add('tilt');

  // Fill Cyl
  naohLiquid.style.display = 'block';
  // Start empty (liquid clipped to bottom)
  naohLiquid.style.clipPath = 'inset(100% 0 0 0)';
  requestAnimationFrame(() => {
    // Fill to 50ml mark (approx 18% gap from top)
    naohLiquid.style.clipPath = 'inset(9% 0 0 0)';
  });
  await wait(2000);

  // Update NaOH Flask to 150ml
  const naohSolution = document.getElementById('naoh-solution');
  if (naohSolution) {
    naohSolution.src = 'assets/volumetric flask-sol-blue-150ml.png';
  }

  // 5. Untilt
  naoh.classList.remove('tilt');
  // Re-apply explicit transform to maintain position after class removal
  naoh.style.transform = `translate(${targetX}px, ${targetY}px)`;
  await wait(50); // slight delay to ensure style applies

  // 6. Lift Back
  naoh.style.transition = 'transform 1s ease-in-out';
  naoh.style.transform = `translate(${targetX}px, ${liftY}px)`;
  await wait(1000);

  // 7. Return to Start
  naoh.style.transform = `translate(${startX}px, ${startY}px)`;
  await wait(1000);

  // 8. Reset to CSS class (removes inline style)
  naoh.style.transform = '';
  // Ensure we clean up custom properties if needed, though harmless
  naoh.style.removeProperty('--x');
  naoh.style.removeProperty('--y');

  titrationState.naohInCylinder = true;
  prepState.isAnimating = false;
  setInstruction("Click on the measuring cylinder to fill 0.1N NaOH into the Burette");
}

async function handleCylinderClick() {
  if (currentStep !== 2 || !titrationState.naohInCylinder || titrationState.naohInBurette || prepState.isAnimating) return;
  prepState.isAnimating = true;

  const cylRect = cylinderContainer.getBoundingClientRect();
  const funRect = funnel.getBoundingClientRect();

  const moveX = (funRect.left + funRect.width / 2) - (cylRect.left + cylRect.width / 2) - 390;
  const moveY = funRect.top - cylRect.top + 20;

  cylinderContainer.style.transition = 'transform 1s ease-in-out';
  cylinderContainer.style.transform = `translate(0px, -300px)`;
  await wait(1000);
  cylinderContainer.style.transform = `translate(${moveX}px, -300px)`;
  await wait(1000);
  cylinderContainer.style.transform = `translate(${moveX}px, ${moveY}px)`;
  await wait(1000);

  cylinderContainer.style.setProperty('--x', `${moveX}px`);
  cylinderContainer.style.setProperty('--y', `${moveY}px`);
  cylinderContainer.classList.add('tilt');
  await wait(500);

  // Fill Burette
  naohLiquid.classList.add('empty'); // Start draining (3s)

  // Slight delay for liquid to reach burette
  setTimeout(() => {
    buretteSol.classList.add('fill'); // Start filling (3s)
  }, 500);

  await wait(3000); // Wait for drain

  await wait(500);

  cylinderContainer.classList.remove('tilt');
  await wait(1000);
  cylinderContainer.style.transform = `translate(0,0)`; // shortcut return
  await wait(1000);

  titrationState.naohInBurette = true;
  prepState.isAnimating = false;
  setInstruction("Click on the Flask to place it under the Burette");
}

async function handleFlaskMoveClick() {
  if (currentStep !== 2 || !titrationState.naohInBurette || titrationState.flaskUnder || prepState.isAnimating) return;
  prepState.isAnimating = true;

  const flaskEl = document.getElementById('flask'); // Wrapper
  const buretteRect = document.getElementById('empty-Burette').getBoundingClientRect();
  const flaskRect = flaskEl.getBoundingClientRect();

  const targetX = (buretteRect.left + buretteRect.width * 0.5) - (flaskRect.left + flaskRect.width * 0.5);
  const targetY = (buretteRect.bottom - 0) - flaskRect.bottom; // Adjust to fit under tip

  flaskEl.style.transition = 'transform 1s ease-in-out';
  flaskEl.style.transform = `translate(${targetX}px, ${targetY}px)`;
  await wait(1000);

  titrationState.flaskUnder = true;
  prepState.isAnimating = false;
  setInstruction("Click on the Burette knob to open it and start titration");
}

// --- TITRATION ANIMATION VARIABLES ---
let burettePourRAF = null;
let burettePourStart = null;
let pourProgressMs = 0;
let isBuretteOpen = false;
let nobClickable = true;
let pinkAlertShown = false;
const pourDurationMs = 16000; // 16s for full 16ml? 
const pinkThresholdMs = 16000; // Turns pink at end

const emptyBurette = document.getElementById("empty-Burette"); // Ensure this is selected

function handleNobClick() {
  if (currentStep !== 2 || !titrationState.flaskUnder || !nobClickable) return;

  if (!isBuretteOpen) {
    openBurette();
  } else {
    closeBurette();
  }
}

function openBurette() {
  isBuretteOpen = true;
  pinkAlertShown = false;

  // ensure visual state
  if (emptyFlask) {
    emptyFlask.src = 'assets/empty-flask.png';
    emptyFlask.style.opacity = '1';
  }

  buretteNob.classList.add('open');
  emptyBurette.src = 'assets/Burette-filling.png'; // Swap to filling image
  buretteDrop.classList.add('show');

  startPourAnimation();
  setInstruction("Titration in progress... Click knob to stop when solution turns pink.");
}

function closeBurette() {
  if (!isBuretteOpen) return;
  isBuretteOpen = false;

  stopPourAnimation();

  buretteDrop.classList.remove('show');
  buretteNob.classList.remove('open');
  emptyBurette.src = 'assets/empty-Burette-50ml.png'; // Revert image

  if (pinkAlertShown) {
    setInstruction("Titration complete. Click 'NEXT' to see observation.");
    btnNext.classList.remove('hidden');
  } else {
    setInstruction("Knob closed. Click to resume.");
  }
}

function startPourAnimation() {
  buretteSol.style.transition = 'none';
  burettePourStart = performance.now();
  let lastSwirlTime = 0;

  const tick = (now) => {
    if (!isBuretteOpen) return;

    // progress
    const elapsed = now - burettePourStart + pourProgressMs;
    const ratio = Math.min(elapsed / pourDurationMs, 1);

    // Update visual liquid
    buretteSol.style.clipPath = `inset(${ratio * 40}% 0 0 0)`;

    // Update Volume display (Smoother)
    titrationState.volume = ratio * 16.0;
    liveTitrationEl.textContent = titrationState.volume.toFixed(2);

    // Near Endpoint Swirl Logic (Starts after 14mL / ~87% progress)
    if (titrationState.volume > 14.0) {
      // Burette drop cycle is 0.8s. Trigger swirl when drop "hits"
      // We check elapsed modulo 800ms
      const cyclePos = elapsed % 800;
      if (cyclePos > 600 && (now - lastSwirlTime > 400)) {
        triggerSwirl();
        lastSwirlTime = now;
      }
    }

    if (!pinkAlertShown && elapsed >= pinkThresholdMs) {
      handlePinkTurn();
    }

    if (ratio < 1) {
      burettePourRAF = requestAnimationFrame(tick);
    } else {
      if (!pinkAlertShown) closeBurette();
    }
  };
  burettePourRAF = requestAnimationFrame(tick);
}

function triggerSwirl() {
  if (!filledFlask) return;
  filledFlask.classList.remove('swirl');
  // Trigger reflow
  void filledFlask.offsetWidth;
  filledFlask.classList.add('swirl');
}

function stopPourAnimation() {
  if (burettePourRAF) cancelAnimationFrame(burettePourRAF);
  burettePourRAF = null;
  if (burettePourStart) {
    pourProgressMs += Math.max(0, performance.now() - burettePourStart);
  }
  burettePourStart = null;
}

function handlePinkTurn() {
  pinkAlertShown = true;

  // Smooth Cross-fade
  if (filledFlask) {
    filledFlask.style.opacity = '0';
  }

  if (emptyFlask) {
    emptyFlask.style.transition = 'opacity 1s ease-in-out';
    emptyFlask.style.opacity = '0';
  }

  if (titratedFlask) {
    titratedFlask.style.opacity = '1';
    titratedFlask.classList.add('show');
    titratedFlask.style.pointerEvents = 'auto'; // Enable interaction for tooltips if needed
  }

  setInstruction("Solution is Pink, close the knob");
}


// --- STEP 3 LOGIC (OBSERVATION) ---
function handleCheckAnswer() {
  const val = parseFloat(inputAnswer.value);
  // (9 * 16 * 0.1) / 10 = 1.44 or 0.144?
  // Formula: (9 * V * N) / W
  // V=16, N=0.1, W=10
  // 9 * 16 * 0.1 = 14.4
  // 14.4 / 10 = 1.44
  // The previous code had 0.9 factor? 
  // User Instructions say: "Titratable acidity (%,lactic acid)=(9×V×N)/W"
  // AND "Titratable acidity (%,lactic acid) = (9xVxN)/W"
  // Wait, the HTML I wrote has "0.9 x V x N".
  // Let me check user request carefully.
  // User Request: "Titratable acidity (%,lactic acid)=(9×V×N)/W"
  // Wait, typically Lactic acid factor is 0.009 for grams, so % is *100?
  // 1ml 0.1N NaOH = 0.009g Lactic Acid.
  // % = (V * N * 0.009 * 100) / W = (0.9 * V * N) / W.
  // User prompt specifically says: "(9×V×N)/W".
  // 9 * 16 * 0.1 / 10 = 1.44.
  // If user meant 0.9, it would be 0.144.
  // I will stick to the USER INSTRUCTION formula verbatim: "9".
  // Maybe the milk weight is different or they normalized it?
  // Let's support the user's explicit formula text "9".

  const expected = (9 * 16 * 0.1) / 10; // 1.44

  // Allow slight margin
  if (Math.abs(val - expected) < 0.1) {
    feedbackMsg.textContent = "Right answer!";
    feedbackMsg.className = "mt-4 font-bold text-lg h-8 text-green-600";
  } else {
    feedbackMsg.textContent = "Wrong answer! Try 1.44";
    feedbackMsg.className = "mt-4 font-bold text-lg h-8 text-red-600";
  }
}


// Tooltips (Reusing existing logic)
function initTooltips() {
  const hoverTargets = document.querySelectorAll('.hover-item');
  hoverTargets.forEach((el) => {
    const label = el.dataset.label;
    if (!label) return;
    el.addEventListener('mouseenter', () => {
      if (isHidden(el)) return; // Don't show tooltip if parent is hidden
      hoverTooltip.textContent = label;
      hoverTooltip.classList.remove('hidden');
    });
    el.addEventListener('mousemove', (e) => {
      hoverTooltip.style.left = `${e.clientX + 15}px`;
      hoverTooltip.style.top = `${e.clientY + 15}px`;
    });
    el.addEventListener('mouseleave', () => {
      hoverTooltip.classList.add('hidden');
    });
  });
}

function isHidden(el) {
  return (el.offsetParent === null) || (window.getComputedStyle(el).opacity === '0');
}

// Start
init();