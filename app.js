// 1. Interactive 3-Pillar Data & Renderer
const pillars = [
  {
    tag: 'COMPONENT 01 // SMART OUTLETS & LIGHT SWITCHES',
    title: 'Retrofit Devices That Manage Each Circuit',
    description:
      'Rookery is developing smart outlets and light switches that replace standard ones in existing boxes. Each device monitors and controls the load on its circuit so idle and low priority loads can be switched off automatically.',
    metrics: [
      { label: 'Outlet', value: 'Working Prototype' },
      { label: 'Light Switch', value: 'In Development' },
      { label: 'Install', value: 'Retrofit, No New Wiring' },
    ],
    highlights: [
      'Designed to fit existing outlet boxes and panels.',
      'Designed to cut standby drain from idle devices.',
      'Planned: optional homeowner app to check and control each outlet and switch.',
    ],
  },
  {
    tag: 'SOFTWARE 02 // LOCAL FIRST LOAD CONTROL',
    title: 'An Algorithm That Runs Inside the Home',
    description:
      'The load control algorithm decides when to run heavy appliances, when to pre cool rooms with midday solar, and when to hold power back, so the battery lasts longer and the generator starts less often. It is in development.',
    metrics: [
      { label: 'Internet Needed', value: 'Designed for None' },
      { label: 'Runs On', value: 'Local Hardware' },
      { label: 'Target', value: '80% Less Generator Runtime' },
    ],
    highlights: [
      'Designed to pre cool rooms with midday sun so air conditioners run less at night.',
      'Designed to stagger heavy appliances so the battery is not overloaded.',
      'The 80% figure is our field validation target, not a measured result.',
    ],
  },
  {
    tag: 'COMPATIBILITY // WORKS WITH YOUR POWER SYSTEM',
    title: 'Built to Sit on Top of Solar, Battery, and Generator',
    description:
      'Rookery does not replace a home\'s solar, battery, or generator. Our devices and algorithm are designed to coordinate the equipment a home already has, or equipment chosen for a new build.',
    metrics: [
      { label: 'Primary Market', value: 'Nigeria (50Hz)' },
      { label: 'Later Market', value: 'U.S. (60Hz)' },
      { label: 'Pairs With', value: 'Solar, Battery, Generator' },
    ],
    highlights: [
      'Designed to work with existing local construction.',
      'For new builds, we suggest CNC built structures, which we hope to pilot.',
      'Compatibility with specific inverters and batteries is still being tested.',
    ],
  },
];

function selectPillar(index) {
  for (let i = 0; i < 3; i++) {
    const btn = document.getElementById(`pillar-btn-${i}`);
    if (i === index) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  }

  const p = pillars[index];
  const container = document.getElementById('pillar-content');
  container.innerHTML = `
    <div>
      <span class="mono" style="font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #F59E0B;">${p.tag}</span>
      <h3 style="font-size: 1.65rem; font-weight: 800; color: #FFFFFF; margin-top: 0.5rem; line-height: 1.2;">${p.title}</h3>
      <p style="font-size: 0.95rem; color: #CBD5E1; margin-top: 0.9rem; line-height: 1.65;">${p.description}</p>

      <div class="pillar-metrics-grid">
        ${p.metrics
          .map(
            (m) => `
          <div class="pillar-metric-box">
            <span class="mono" style="font-size: 0.68rem; color: #94A3B8; display: block;">${m.label}</span>
            <strong class="mono" style="font-size: 0.92rem; color: #10B981; display: block; margin-top: 0.25rem;">${m.value}</strong>
          </div>
        `
          )
          .join('')}
      </div>
    </div>

    <ul class="check-list">
      ${p.highlights
        .map(
          (item) => `
        <li class="check-item">
          <span class="check-icon">&#10003;</span>
          <span>${item}</span>
        </li>
      `
        )
        .join('')}
    </ul>
  `;
}

// 2. Interactive Live Energy Flow & Savings Simulator
let algoActive = true;
let currentScenario = 'afternoon';

const scenarios = {
  morning: {
    title: '08:30 Morning Sun (28°C)',
    descOn: 'Morning sunshine powers breakfast appliances and starts recharging overnight battery use.',
    descOff: 'Water heaters and kitchen appliances run all at once, draining the battery before midday sun arrives.',
    solarKw: '4.8 kW',
    on: {
      soc: '78% FULL',
      battFlow: '+1.9 kW CHARGING',
      loadKw: '2.9 kW',
      genStatus: 'OFF / STANDBY',
      genKw: '0.0 L/hr Fuel Burn',
      genActive: false,
      hvac: { label: '1.1 kW (Eco Mode)', pct: '25%' },
      kitchen: { label: '1.2 kW (Staggered)', pct: '30%' },
      light: { label: '0.5 kW', pct: '15%' },
      phantom: { label: '0.1 kW (Switched Off)', pct: '5%' },
      runtime: '31.0 hrs',
      diff: '+15.2 hrs extra',
      note: 'Staggering water heaters and kitchen appliances prevents sudden power spikes and saves battery charge.',
    },
    off: {
      soc: '64% FULL',
      battFlow: '-0.8 kW DRAINING',
      loadKw: '5.6 kW',
      genStatus: 'OFF / STANDBY',
      genKw: '0.0 L/hr Fuel Burn',
      genActive: false,
      hvac: { label: '2.6 kW (Uncontrolled)', pct: '60%' },
      kitchen: { label: '2.1 kW (All At Once)', pct: '55%' },
      light: { label: '0.4 kW', pct: '15%' },
      phantom: { label: '0.5 kW (Idle Drain)', pct: '25%' },
      runtime: '15.8 hrs',
      diff: 'Standard Unmanaged Home',
      note: 'Running heavy morning appliances simultaneously drains battery reserves even after sunrise.',
    },
  },
  afternoon: {
    title: '14:00 Peak Afternoon Heat (34°C)',
    descOn: 'Strong sunshine powers the house, fills the battery, and pre cools rooms so air conditioners rest tonight.',
    descOff: 'Extra solar power goes unused once the battery fills, while uncooled rooms heat up for tonight.',
    solarKw: '9.4 kW',
    on: {
      soc: '94% FULL',
      battFlow: '+3.8 kW CHARGING',
      loadKw: '5.6 kW',
      genStatus: 'OFF / STANDBY',
      genKw: '0.0 L/hr Fuel Burn',
      genActive: false,
      hvac: { label: '2.8 kW (Pre Cooling)', pct: '52%' },
      kitchen: { label: '1.4 kW', pct: '35%' },
      light: { label: '0.6 kW', pct: '20%' },
      phantom: { label: '0.05 kW (Switched Off)', pct: '5%' },
      runtime: '29.4 hrs',
      diff: '+14.9 hrs extra',
      note: 'In this model, pre cooling with midday sun lowers evening air conditioner use.',
    },
    off: {
      soc: '88% FULL',
      battFlow: '+1.2 kW CHARGING',
      loadKw: '8.2 kW',
      genStatus: 'OFF / STANDBY',
      genKw: '0.0 L/hr Fuel Burn',
      genActive: false,
      hvac: { label: '5.4 kW (Max Strain)', pct: '92%' },
      kitchen: { label: '1.6 kW', pct: '40%' },
      light: { label: '0.6 kW', pct: '20%' },
      phantom: { label: '0.6 kW (Idle Drain)', pct: '30%' },
      runtime: '14.5 hrs',
      diff: 'Standard Unmanaged Home',
      note: 'Without midday pre cooling, air conditioners will run hard after sunset and drain the battery fast.',
    },
  },
  evening: {
    title: '20:30 Evening Family Time (29°C)',
    descOn: 'After sunset, pre cooled rooms and smart circuit control keep evening power usage remarkably low.',
    descOff: 'Air conditioners, TVs, and kitchen appliances pull heavy power from the battery all at once.',
    solarKw: '0.0 kW',
    on: {
      soc: '84% FULL',
      battFlow: '-2.4 kW LIGHT USE',
      loadKw: '2.4 kW',
      genStatus: 'OFF / STANDBY',
      genKw: '0.0 L/hr Fuel Burn',
      genActive: false,
      hvac: { label: '0.9 kW (Coasting)', pct: '22%' },
      kitchen: { label: '0.9 kW', pct: '25%' },
      light: { label: '0.5 kW', pct: '18%' },
      phantom: { label: '0.1 kW (Switched Off)', pct: '5%' },
      runtime: '27.8 hrs',
      diff: '+15.6 hrs extra',
      note: 'Because Rookery pre cooled the home at 14:00, keeping the family cool in the evening takes under 1 kW.',
    },
    off: {
      soc: '51% FULL',
      battFlow: '-6.9 kW HEAVY DRAIN',
      loadKw: '6.9 kW',
      genStatus: 'OFF / STANDBY',
      genKw: '0.0 L/hr Fuel Burn',
      genActive: false,
      hvac: { label: '4.3 kW (Full Power)', pct: '85%' },
      kitchen: { label: '1.5 kW', pct: '38%' },
      light: { label: '0.5 kW', pct: '18%' },
      phantom: { label: '0.6 kW (Idle Drain)', pct: '30%' },
      runtime: '12.2 hrs',
      diff: 'Rapid Battery Drain',
      note: 'Heavy evening electricity draw drains the battery quickly and forces the generator on before morning.',
    },
  },
  night: {
    title: '02:00 Overnight Sleep Mode (25°C)',
    descOn: 'Sleep mode turns off empty rooms, kitchen outlets, and idle electronics while keeping bedrooms cool.',
    descOff: 'Empty rooms and standby appliances quietly drain battery charge all night long.',
    solarKw: '0.0 kW',
    on: {
      soc: '74% FULL',
      battFlow: '-1.1 kW TRICKLE',
      loadKw: '1.1 kW',
      genStatus: 'OFF / STANDBY',
      genKw: '0.0 L/hr Fuel Burn',
      genActive: false,
      hvac: { label: '0.6 kW (Bedrooms Only)', pct: '16%' },
      kitchen: { label: '0.2 kW (Fridge Only)', pct: '10%' },
      light: { label: '0.25 kW (Security)', pct: '10%' },
      phantom: { label: '0.05 kW (Switched Off)', pct: '4%' },
      runtime: '33.5 hrs',
      diff: '+19.1 hrs extra',
      note: 'Bedrooms stay cool at 23°C while unused circuits are shut off automatically until morning.',
    },
    off: {
      soc: '26% FULL',
      battFlow: '-3.4 kW DRAINING',
      loadKw: '3.4 kW',
      genStatus: 'STARTING SOON',
      genKw: 'Auto Start at 20%',
      genActive: false,
      hvac: { label: '2.1 kW (Whole House)', pct: '50%' },
      kitchen: { label: '0.4 kW', pct: '15%' },
      light: { label: '0.3 kW', pct: '12%' },
      phantom: { label: '0.6 kW (Idle Drain)', pct: '30%' },
      runtime: '14.4 hrs',
      diff: 'Low Battery Warning',
      note: 'Battery drops near empty before sunrise, triggering a noisy middle of the night generator start.',
    },
  },
  rainy: {
    title: 'Rainy / Overcast Day (Low Sun)',
    descOn: 'Weather tracking switches the home to conservation mode, stretching battery life across cloudy days.',
    descOff: 'Low solar charging drains the battery quickly, forcing the backup generator to burn fuel.',
    solarKw: '1.6 kW',
    on: {
      soc: '62% FULL',
      battFlow: '-0.5 kW CONSERVED',
      loadKw: '2.1 kW',
      genStatus: 'OFF / STANDBY',
      genKw: '0.0 L/hr Fuel Burn',
      genActive: false,
      hvac: { label: '0.8 kW (Dry Air Mode)', pct: '20%' },
      kitchen: { label: '0.8 kW', pct: '22%' },
      light: { label: '0.4 kW', pct: '15%' },
      phantom: { label: '0.1 kW (Switched Off)', pct: '5%' },
      runtime: '26.2 hrs',
      diff: 'Generator Avoided',
      note: 'Rookery anticipates cloudy skies and trims non essential power so your generator stays off.',
    },
    off: {
      soc: '18% FULL',
      battFlow: '+4.2 kW GEN CHARGING',
      loadKw: '5.1 kW',
      genStatus: 'RUNNING',
      genKw: '2.8 L/hr Fuel Burn',
      genActive: true,
      hvac: { label: '2.8 kW (Uncontrolled)', pct: '65%' },
      kitchen: { label: '1.2 kW', pct: '32%' },
      light: { label: '0.5 kW', pct: '18%' },
      phantom: { label: '0.6 kW (Idle Drain)', pct: '30%' },
      runtime: 'Gen Running',
      diff: 'Burning Generator Fuel',
      note: 'Backup generator turns on to power the house and recharge the empty battery bank.',
    },
  },
};

function renderSimulator() {
  const s = scenarios[currentScenario];
  const data = algoActive ? s.on : s.off;

  const toggleBtn = document.getElementById('algo-toggle-btn');
  const statusLabel = document.getElementById('algo-status-label');

  if (algoActive) {
    toggleBtn.classList.remove('off');
    statusLabel.textContent = 'Smart Control: ON';
    statusLabel.style.color = '#10B981';
  } else {
    toggleBtn.classList.add('off');
    statusLabel.textContent = 'Smart Control: OFF';
    statusLabel.style.color = '#F59E0B';
  }

  document.getElementById('sim-scenario-title').textContent = s.title;
  document.getElementById('sim-scenario-desc').textContent = algoActive ? s.descOn : s.descOff;

  document.getElementById('svg-solar-kw').textContent = s.solarKw;
  document.getElementById('svg-batt-soc').textContent = data.soc;
  document.getElementById('svg-batt-flow').textContent = data.battFlow;
  document.getElementById('svg-load-kw').textContent = data.loadKw;
  document.getElementById('svg-hub-mode').textContent = algoActive ? 'Smart Control On' : 'Standard Wiring';
  document.getElementById('svg-hub-sub').textContent = algoActive ? 'Zero Wasted Power' : 'Unmanaged Usage';

  const genBox = document.getElementById('svg-gen-box');
  const genStatus = document.getElementById('svg-gen-status');
  const genKw = document.getElementById('svg-gen-kw');
  const genLine = document.getElementById('line-gen-hub');
  const gridBadge = document.getElementById('sim-grid-badge');

  genStatus.textContent = data.genStatus;
  genKw.textContent = data.genKw;

  if (data.genActive) {
    genBox.setAttribute('stroke', '#F59E0B');
    genStatus.setAttribute('fill', '#F59E0B');
    genKw.setAttribute('fill', '#F8FAFC');
    genLine.setAttribute('stroke', '#F59E0B');
    genLine.setAttribute('stroke-width', '3');
    genLine.classList.add('energy-line-active');
    gridBadge.textContent = 'GENERATOR RUNNING';
    gridBadge.style.background = 'rgba(217, 119, 6, 0.2)';
    gridBadge.style.borderColor = 'rgba(245, 158, 11, 0.45)';
    gridBadge.style.color = '#F59E0B';
  } else {
    genBox.setAttribute('stroke', '#475569');
    genStatus.setAttribute('fill', '#94A3B8');
    genKw.setAttribute('fill', '#64748B');
    genLine.setAttribute('stroke', '#475569');
    genLine.setAttribute('stroke-width', '2');
    genLine.classList.remove('energy-line-active');
    gridBadge.textContent = 'SOLAR + BATTERY';
    gridBadge.style.background = 'rgba(16, 185, 129, 0.14)';
    gridBadge.style.borderColor = 'rgba(16, 185, 129, 0.35)';
    gridBadge.style.color = '#10B981';
  }

  const hvacEl = document.getElementById('zone-hvac-kw');
  const hvacBar = document.getElementById('bar-hvac');
  hvacEl.textContent = data.hvac.label;
  hvacEl.style.color = algoActive ? '#10B981' : '#F59E0B';
  hvacBar.style.width = data.hvac.pct;
  hvacBar.style.backgroundColor = algoActive ? '#10B981' : '#F59E0B';

  document.getElementById('zone-kitchen-kw').textContent = data.kitchen.label;
  document.getElementById('bar-kitchen').style.width = data.kitchen.pct;

  document.getElementById('zone-light-kw').textContent = data.light.label;
  document.getElementById('bar-light').style.width = data.light.pct;

  const phantomEl = document.getElementById('zone-phantom-kw');
  const phantomBar = document.getElementById('bar-phantom');
  phantomEl.textContent = data.phantom.label;
  phantomEl.style.color = algoActive ? '#10B981' : '#F43F5E';
  phantomBar.style.width = data.phantom.pct;
  phantomBar.style.backgroundColor = algoActive ? '#10B981' : '#F43F5E';

  const runtimeEl = document.getElementById('metric-runtime');
  runtimeEl.textContent = data.runtime;
  runtimeEl.style.color = algoActive ? '#10B981' : '#F59E0B';
  document.getElementById('metric-runtime-diff').textContent = data.diff;
  document.getElementById('metric-runtime-note').textContent = data.note;
}

function toggleAlgorithm() {
  algoActive = !algoActive;
  renderSimulator();
}

function setScenario(key) {
  currentScenario = key;
  document.querySelectorAll('.scen-btn').forEach((btn) => btn.classList.remove('active'));
  document.getElementById(`scen-${key}`).classList.add('active');
  renderSimulator();
}

// 3. Modal Controls & Formspree-Ready Submission
function toggleMobileMenu() {
  document.getElementById('mobile-menu').classList.toggle('hidden');
}

function openConsultationModal(tier) {
  document.getElementById('form-tier').value = tier || 'Homeowner (early access)';
  document.getElementById('modal-form-container').classList.remove('hidden');
  document.getElementById('modal-success-container').classList.add('hidden');
  const errorMsg = document.getElementById('form-error-msg');
  if (errorMsg) {
    errorMsg.classList.add('hidden');
    errorMsg.textContent = '';
  }
  document.getElementById('consultation-modal').classList.remove('hidden');
}

function openInvestorModal() {
  openConsultationModal('Investor or funder');
}

function closeConsultationModal() {
  document.getElementById('consultation-modal').classList.add('hidden');
}

async function submitConsultation(event) {
  event.preventDefault();
  const form = document.getElementById('consultation-form');
  const submitBtn = document.getElementById('form-submit-btn');
  const errorMsg = document.getElementById('form-error-msg');
  const endpoint = form.getAttribute('data-formspree-endpoint') || 'https://formspree.io/f/xgakzqnb';

  const name = document.getElementById('form-name').value;
  const origin = document.getElementById('form-origin').value;
  const dest = document.getElementById('form-destination').value;
  const tier = document.getElementById('form-tier').value;

  errorMsg.classList.add('hidden');
  errorMsg.textContent = '';
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending Request...';

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: new FormData(form),
    });

    if (!response.ok) {
      throw new Error('Submission failed');
    }

    document.getElementById('confirmation-summary').textContent =
      `Thank you, ${name}. Your request from ${origin} (${tier}, ${dest}) has been received by the Rookery team. We will follow up by email.`;

    form.reset();
    document.getElementById('modal-form-container').classList.add('hidden');
    document.getElementById('modal-success-container').classList.remove('hidden');
  } catch (err) {
    errorMsg.textContent = 'We could not send your request right now. Please check your connection and try again.';
    errorMsg.classList.remove('hidden');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Request';
  }
}

window.addEventListener('DOMContentLoaded', () => {
  selectPillar(0);
  renderSimulator();
});
