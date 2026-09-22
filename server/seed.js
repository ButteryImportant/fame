import { randomUUID } from 'node:crypto';
const courses = [
  {
    id: 'blueprint',
    slug: 'food-business-blueprint',
    title: 'Food Business Blueprint',
    eyebrow: 'SILVER · START',
    description: 'Turn your food business idea into a clear, practical starting plan.',
    summary:
      'For aspiring entrepreneurs, professionals and FPOs who want to choose the right product, understand their business model and find a route to market.',
    price: 749900,
    level: 'L1',
    accent: 'green',
    status: 'published',
    outcomes: [
      'Choose a product for a real customer need',
      'Compare manufacturing and sourcing models',
      'Map your first sales channel',
      'Create a practical next-action plan',
    ],
    modules: [
      [
        'Day 1 · Foundation & Clarity',
        'Day 1 · Video 1: Introduction to Food Business',
        12,
        'A strong food business begins with three connected decisions: the right product, the right business model, and the right sales channel. FAME brings these decisions together so you can plan your next step with purpose.\n\nIn this introductory lesson, Manmath Biradar outlines the landscape of the Indian agribusiness and processed food industry, common traps first-time founders fall into, and how to approach your venture with strategic discipline.\n\nUse this learning space as a working notebook. After every lesson, write down one decision you can make and one assumption you need to check with a real customer.\n\nYour first action\nDescribe the food business you want to build in one sentence: I help [target customer] solve [specific need] with [formulated product]. Keep it specific and focused.',
        'https://www.youtube.com/watch?v=V91WAr_cGwg&list=PLN9bNLEBeLek',
      ],
      [
        'Day 1 · Foundation & Clarity',
        'Day 1 · Video 2: Food Business Clarity',
        14,
        'Gain absolute clarity on who your customer is and why they would pay for your product over existing options on the shelf.\n\nStart by describing a specific buyer and a specific buying situation. A retail shopper, a restaurant owner, and an institutional buyer may all purchase the same ingredient for very different reasons.\n\nSpeak with potential buyers in your target market. Ask what they buy today, what frustrates them, how often they buy, and what would make them switch brands. Capture their exact feedback before finalising formulations.\n\nYour action\nWrite down your primary customer segment, their current alternative, the problem you heard most often, and your distinct value proposition.',
        'https://www.youtube.com/watch?v=-gQoeOBgDWM&list=PLN9bNLEBeLek&index=2&pp=iAQBsAgC',
      ],
      [
        'Day 1 · Foundation & Clarity',
        'Day 1 · Video 3: Food Business Fundamentals',
        15,
        'Understand the fundamental pillars of food processing: raw-material availability, seasonal price fluctuations, basic shelf-life dynamics, and initial statutory compliance (FSSAI basics).\n\nA great recipe created in a domestic kitchen does not automatically translate into a viable commercial product. You must evaluate how the raw materials behave across seasons, storage temperature requirements, and moisture sensitivity.\n\nYour action\nList your key raw materials, note their peak and off-peak price variations, and confirm whether they can be sourced reliably within your regional supply chain.',
        'https://www.youtube.com/watch?v=-h_VVUn7wpg&list=PLN9bNLEBeLek&index=3&pp=iAQBsAgC',
      ],
      [
        'Day 1 · Foundation & Clarity',
        'Day 1 · Video 4: Food Business Focus',
        12,
        'Avoid the temptation to launch 10 different SKUs at once. Early-stage food enterprises thrive by mastering a single "hero product."\n\nNarrowing your focus allows you to concentrate capital, simplify inventory, negotiate better raw material prices, and establish clear brand recall in the minds of your first 1,000 customers.\n\nCompare your product ideas against customer willingness to pay, process simplicity, shelf-life requirements, and margin potential.\n\nYour action\nShortlist your #1 hero SKU. Write down why this single product gives you the fastest path to positive unit economics.',
        'https://www.youtube.com/watch?v=0uYaotUSyU0&list=PLN9bNLEBeLek&index=4&pp=iAQB0gcJCSQMAYcqIYzvsAgC',
      ],
      [
        'Day 1 · Foundation & Clarity',
        'Day 1 · Video 5: Food Business Growth Levers',
        15,
        'Explore the primary drivers of sustainable growth in the food sector: repeat consumption, margin health, and channel efficiency.\n\nSustainable food businesses are built on repeat purchases, not one-time novelty sales. Understand how product consumption frequency directly impacts your customer acquisition cost (CAC) and customer lifetime value (LTV).\n\nReview your Day 1 milestones before proceeding to Day 2 operations.\n\nYour action\nCalculate the expected monthly consumption rate for your hero product per household/buyer, and write down two methods you will use to encourage repeat orders.',
        'https://www.youtube.com/watch?v=q0pCmpmymhA&list=PLN9bNLEBeLek&index=5&pp=iAQBsAgC',
      ],
      [
        'Day 2 · Product & Operations Setup',
        'Day 2 · Video 1: Day 2 Orientation & Strategy',
        12,
        'Welcome to Day 2. Today we shift from foundational clarity into operational reality: manufacturing models, formulation standards, packaging engineering, and unit economics.\n\nTurning a recipe into a commercial product requires moving from approximate culinary measurements to standardized percentages, defined processing steps, and strict quality tolerances.\n\nYour action\nDocument your product manufacturing steps sequentially from raw material intake to final packed unit.',
        'https://www.youtube.com/watch?v=HWxZ1kXnd60&list=PLN9bNLEBeLek&index=6&pp=iAQBsAgC',
      ],
      [
        'Day 2 · Product & Operations Setup',
        'Day 2 · Video 2: Product & Operations Alignment',
        15,
        'Compare manufacturing and sourcing pathways:\n1. Own Manufacturing: Full control over recipe and quality, but high upfront machinery investment and fixed overheads.\n2. Contract Manufacturing (Co-packing / White-labelling): Zero machinery capex, but subject to Minimum Order Quantities (MOQs) and supplier reliability.\n3. Sourcing & Trading: Low operational friction, suitable for testing brand and distribution before investing in manufacturing.\n\nYour action\nEvaluate whether self-manufacturing or contract packing best fits your current capital and timeline. Request quotes from at least two local co-packers.',
        'https://www.youtube.com/watch?v=O9zTlMViaB4&list=PLN9bNLEBeLek&index=7&pp=iAQBsAgC',
      ],
      [
        'Day 2 · Product & Operations Setup',
        'Day 2 · Video 3: Formulation, Packaging & Quality',
        16,
        'Standardize your formulation using baker’s percentages (weight-based, not volume-based) to maintain batch-to-batch consistency.\n\nSelect appropriate packaging materials (e.g., nitrogen flushing, multi-layer laminates, barrier pouches) based on your product’s sensitivity to moisture, oxygen, and light. Proper packaging determines your commercial shelf life and prevents market returns.\n\nYour action\nConvert your formulation recipe into a weight-based master formula (in grams/kilograms) and identify the primary barrier specification needed for your packaging.',
        'https://www.youtube.com/watch?v=dmgAXe-gI6Q&list=PLN9bNLEBeLek&index=8&pp=iAQBsAgC',
      ],
      [
        'Day 2 · Product & Operations Setup',
        'Day 2 · Video 4: Business Model & Unit Economics',
        16,
        'Master the unit economics breakdown from MRP down to gross contribution margin:\n- MRP (Maximum Retail Price)\n- Less GST\n- Less Retailer Margin (typically 15% - 30%)\n- Less Distributor Margin (typically 8% - 12%)\n- Less Super-Stockist / Logistics Margin (if applicable)\n- Less Variable Cost of Goods Sold (Raw materials, primary packaging, secondary cartons, processing costs)\n= Net Contribution per unit.\n\nRevenue is not profit. Ensure your contribution margin covers fixed overheads and customer acquisition.\n\nYour action\nBuild a cost sheet for 1 unit of your hero SKU and verify whether your net margin remains viable across multiple retail tiers.',
        'https://www.youtube.com/watch?v=tp6aRHTGwDQ&list=PLN9bNLEBeLek&index=9&pp=iAQB0gcJCSQMAYcqIYzvsAgC',
      ],
      [
        'Day 2 · Product & Operations Setup',
        'Day 2 · Video 5: Operational Execution Blueprint',
        14,
        'Bring together your operating checklist:\n- Standard Operating Procedures (SOPs) for batch production\n- In-process quality checks (Brix, pH, moisture, seal integrity)\n- Raw material inspection protocols\n- Batch numbering and traceability system\n- Waste minimization guidelines\n\nYour action\nCreate a one-page pilot batch checklist with 5 clear quality checkpoints that must be inspected before dispatching product.',
        'https://www.youtube.com/watch?v=ZPWI3sSbEKQ&list=PLN9bNLEBeLek&index=10&pp=iAQBsAgC',
      ],
      [
        'Day 3 · Market Strategy & Scaling',
        'Day 3 · Video 1: Day 3 Kickoff & Action Plan',
        12,
        'Welcome to Day 3. With product formulation, operational models, and unit economics in place, we focus entirely on go-to-market execution, sales channel selection, customer acquisition, and cash flow management.\n\nA great product without sales execution will fail. In this session, learn how to sequence your commercial launch for traction and financial sustainability.\n\nYour action\nDefine your target launch territory (e.g., 3 neighborhood pin codes or 15 targeted retail counters) to achieve tight distribution density.',
        'https://www.youtube.com/watch?v=LOX-iC07R2c&list=PLN9bNLEBeLek&index=11&pp=iAQBsAgC',
      ],
      [
        'Day 3 · Market Strategy & Scaling',
        'Day 3 · Video 2: Sales Channels & Distribution',
        15,
        'Compare distribution channels and their realistic requirements:\n- General Trade (Kirana stores): High volume potential, but requires credit management and field sales discipline.\n- Modern Trade (Supermarkets): Strong brand visibility, but high listing fees and extended payment credit cycles.\n- Quick-Commerce & Marketplaces: Rapid customer reach, but high commission deductions and platform ad spend requirements.\n- Direct-to-Consumer (D2C): Higher gross realization, but customer acquisition costs must be strictly tracked.\n- B2B & Institutional: Bulk orders and steady volume with negotiated credit terms.\n\nYour action\nSelect your primary launch channel and one secondary test channel. List 10 potential retail outlets or buyers to approach first.',
        'https://www.youtube.com/watch?v=COkeGU9NkSM&list=PLN9bNLEBeLek&index=12&pp=iAQBsAgC',
      ],
      [
        'Day 3 · Market Strategy & Scaling',
        'Day 3 · Video 3: Customer Acquisition & Marketing',
        14,
        'Learn cost-effective ways to get your product into consumers’ hands:\n- Active sampling at high-footfall retail counters\n- Clear, benefit-driven front-of-pack messaging (3-second shelf rule)\n- Local community activations, food exhibitions, and farmers’ markets\n- Leveraging WhatsApp and word-of-mouth for initial repeat ordering\n\nYour action\nDesign a low-cost sampling script and strategy to collect structured feedback from your first 50 tasters.',
        'https://www.youtube.com/watch?v=Y7sJAUQ8AaU&list=PLN9bNLEBeLek&index=13&pp=iAQBsAgC',
      ],
      [
        'Day 3 · Market Strategy & Scaling',
        'Day 3 · Video 4: Commercial Viability & Scaling',
        15,
        'Manage your working capital cycle to prevent cash flow crunches:\n- Working capital requirement = Raw material stock + In-process inventory + Finished goods + Accounts receivable (buyer credit) - Accounts payable (vendor credit).\n- Controlling distributor credit limits and enforcing timely collections.\n- Preventing expired inventory and managing product return policies.\n\nYour action\nCalculate your estimated working capital cycle in days, and set clear payment terms for your initial trade partners.',
        'https://www.youtube.com/watch?v=y6yKu_O8P1Q&list=PLN9bNLEBeLek&index=14&pp=iAQBsAgC',
      ],
      [
        'Day 3 · Market Strategy & Scaling',
        'Day 3 · Video 5: Roadmap & Growth Acceleration',
        18,
        'Bring everything together into your 30-Day Launch Action Plan:\n- Week 1: Finalize hero product formulation and lock packaging barrier specs.\n- Week 2: Produce pilot test batch and secure mandatory statutory documentation.\n- Week 3: Execute retail sampling across your initial 15 targeted distribution points.\n- Week 4: Measure repeat order velocity, review unit margin realization, and iterate based on real trade feedback.\n\nCongratulations on completing the Silver Tier Food Business Blueprint curriculum!\n\nYour final action\nWrite down the 3 core business decisions you have locked in, the top 2 assumptions to validate in the market, and the very first operational step you will take tomorrow morning.',
        'https://www.youtube.com/watch?v=SZxs84uwkM8&list=PLN9bNLEBeLek&index=15&pp=iAQBsAgC',
      ],
    ],
  },
  {
    id: 'accelerator',
    slug: 'food-business-accelerator',
    title: 'Food Business Accelerator',
    eyebrow: 'GOLD · SET UP',
    description: 'Bring your product, operations and launch plan together.',
    summary:
      'A guided path for entrepreneurs preparing to launch. Build on your blueprint with product validation, supplier planning and a practical go-to-market sequence.',
    price: 1999900,
    level: 'L2',
    accent: 'blue',
    status: 'published',
    outcomes: [
      'Plan your product validation',
      'Map suppliers and operating needs',
      'Build your launch sequence',
      'Prepare a channel action plan',
    ],
    modules: [
      [
        'Product & Formulation Setup',
        'Validating recipe consistency and packaging at pilot scale',
        15,
        'Moving from a kitchen prototype to consistent commercial batches requires locked recipe formulations, water activity control, and standardized operating procedures (SOPs).\n\nFocus on shelf stability, primary barrier packaging, and lab verification before launching broad distribution.\n\nYour action\nCreate your pilot batch specification sheet with ingredient percentages by weight (baker percentages) and record initial moisture targets.',
        'https://www.youtube.com/watch?v=7wtfhZwyrcc',
      ],
      [
        'Operations & Sourcing',
        'Contract manufacturing audits and co-packer agreements',
        18,
        'When negotiating with third-party manufacturers, clarify yield loss guarantees, batch minimums, quality acceptance criteria, and allergen cross-contamination safeguards.\n\nYour action\nDraft a 5-point quality checklist to inspect every incoming production run before approving final invoice release.',
        'https://www.youtube.com/watch?v=M7lc1UVf-VE',
      ],
      [
        'Go-to-Market Sequence',
        'Channel launch and retail margin architecture',
        15,
        'Design your pricing structure to protect margins across distributors (25-30%), retailers (15-20%), and logistics (8-12%). Ensure direct-to-consumer prices anchor your brand perception without cannibalizing partner margins.\n\nYour action\nCalculate your backward pricing ladder from retail MRP down to ex-factory cost.',
        'https://www.youtube.com/watch?v=_tV5g6gkMrQ',
      ],
      [
        'Compliance & Standards',
        'FSSAI licensing, NABL testing and mandatory labelling',
        14,
        'Understand statutory requirements for nutritional panels, allergen warnings, FSSAI logo placement, and batch traceability. Pre-compliance testing prevents costly inventory recalls.\n\nYour action\nReview your product label draft against the Food Safety and Standards (Labelling and Display) Regulations checklist.',
        'https://www.youtube.com/watch?v=ScMzIvxBSi4',
      ],
    ],
  },
  {
    id: 'mastery',
    slug: 'food-business-mastery',
    title: 'Food Business Mastery',
    eyebrow: 'DIAMOND · SCALE',
    description: 'Build the systems behind your next stage of growth.',
    summary:
      'For food and agro business owners ready to work on commercialization, business-model decisions and a focused sales and distribution system.',
    price: 6500000,
    level: 'L3',
    accent: 'dark',
    status: 'published',
    outcomes: [
      'Review your current business model',
      'Identify growth constraints',
      'Prioritise sales and distribution channels',
      'Build an execution scorecard',
    ],
    modules: [
      [
        'Growth foundations',
        'Map your current business',
        15,
        'Before choosing a growth strategy, describe how your business works today. Record products, customer segments, sales channels, operating capacity and payment cycles.\n\nSeparate achieved figures from targets. Use the same time period when comparing sales, costs and collections.\n\nYour action\nCreate a one-page business snapshot and identify the constraint that most limits your ability to serve customers profitably.',
        'https://www.youtube.com/watch?v=7wtfhZwyrcc',
      ],
      [
        'Growth foundations',
        'Prioritise your growth experiments',
        15,
        'A growth experiment tests a specific business assumption with a defined budget and review date. Examples include a new pack size for an existing buyer, an institutional sales pilot, or a distributor trial in one territory.\n\nDefine the outcome you will measure before starting. Revenue alone may not reveal margin, collection risk or repeat-purchase potential.\n\nYour action\nChoose one experiment, define the evidence you need and set a date to continue, adjust or stop.',
        'https://www.youtube.com/watch?v=M7lc1UVf-VE',
      ],
    ],
  },
];
export function ensureManmathAdmin(db, targetEmail = 'manmath') {
  const adminHash =
    'scrypt$fcb1090e03b9a52b8b9f0b5b1687db4b$525d9f150e42973d725b58eece321f579c7853e663f43478497fcb2c621685c059edf6d80f87d8db5ee9133db7a5d5317555390824327a9b1f5ab257e10749c6';

  // 1. Ensure single primary admin account with username 'manmath' and password 'manmath'
  const existing = db.prepare("SELECT id FROM users WHERE lower(email) = 'manmath'").get();
  if (existing) {
    db.prepare(
      "UPDATE users SET name='Manmath Biradar', password_hash=?, role='admin', verified=1 WHERE id=?"
    ).run(adminHash, existing.id);
  } else {
    db.prepare(
      "INSERT OR IGNORE INTO users(id,name,email,password_hash,role,verified,created_at) VALUES('admin-manmath','Manmath Biradar','manmath',?,'admin',1,?)"
    ).run(adminHash, Date.now());
  }

  const primaryAdmin = db.prepare("SELECT id FROM users WHERE lower(email) = 'manmath'").get();

  // 2. Remove duplicate manmath accounts and merge references
  if (primaryAdmin) {
    const duplicates = db.prepare("SELECT id FROM users WHERE lower(email) = 'manmathbiradar@gmail.com' AND id != ?").all(primaryAdmin.id);
    for (const dup of duplicates) {
      try {
        db.prepare("UPDATE OR IGNORE community_posts SET user_id = ? WHERE user_id = ?").run(primaryAdmin.id, dup.id);
        db.prepare("UPDATE OR IGNORE community_replies SET user_id = ? WHERE user_id = ?").run(primaryAdmin.id, dup.id);
        db.prepare("UPDATE OR IGNORE community_upvotes SET user_id = ? WHERE user_id = ?").run(primaryAdmin.id, dup.id);
        db.prepare("UPDATE OR IGNORE orders SET user_id = ? WHERE user_id = ?").run(primaryAdmin.id, dup.id);
        db.prepare("UPDATE OR IGNORE progress SET user_id = ? WHERE user_id = ?").run(primaryAdmin.id, dup.id);
        db.prepare("UPDATE OR IGNORE sessions SET user_id = ? WHERE user_id = ?").run(primaryAdmin.id, dup.id);

        const dupProfile = db.prepare("SELECT * FROM profiles WHERE user_id = ?").get(dup.id);
        if (dupProfile) {
          db.prepare("DELETE FROM profiles WHERE user_id = ?").run(primaryAdmin.id);
          db.prepare("UPDATE profiles SET user_id = ? WHERE user_id = ?").run(primaryAdmin.id, dup.id);
        }
        db.prepare("DELETE FROM users WHERE id = ?").run(dup.id);
      } catch (e) {
        console.error(`Notice merging duplicate admin ${dup.id}:`, e.message);
      }
    }
  }

  return db.prepare("SELECT * FROM users WHERE lower(email) = 'manmath'").get();
}

export function ensureProfilesAndCommunity(db) {
  try {
    const adminUser =
      db.prepare("SELECT id FROM users WHERE lower(email) = 'manmath'").get() ||
      db.prepare("SELECT id FROM users WHERE role='admin' LIMIT 1").get();

    if (adminUser) {
      db.prepare(`
        INSERT OR IGNORE INTO profiles(
          user_id, handle, avatar, headline, bio, location,
          business_stage, focus_area, website, linkedin, instagram, twitter, updated_at
        ) VALUES(?, 'manmath', '/images/manmath-biradar.jpg',
          'Founder & Chief Mentor · FAME',
          'Empowering entrepreneurs and food innovators to build scalable, profitable agro-food brands through rigorous product validation and unit economics.',
          'Maharashtra, India',
          'Founder & Mentor',
          'Agro-Processing, Millets, Ready-to-Cook & Scalable FMCG',
          'https://fame.manmathbiradar.com',
          'https://linkedin.com/in/manmathbiradar',
          'https://instagram.com/manmathbiradar',
          'https://twitter.com/manmathbiradar',
          ?
        )
      `).run(adminUser.id, Date.now());
    }

    // Seed 2 initial foundational discussions if empty
    if (!db.prepare('SELECT count(*) AS n FROM community_posts').get().n && adminUser) {
      const hasCourse = db.prepare("SELECT 1 FROM courses WHERE id='blueprint'").get();
      const courseRef = hasCourse ? 'blueprint' : null;
      const p1 = 'post-millet-shelf-life';
      const p2 = 'post-contract-vs-own-plant';
      const now = Date.now();
      db.prepare(`
        INSERT INTO community_posts(id, user_id, course_id, title, body, category, is_resolved, created_at, updated_at)
        VALUES(?, ?, ?, 'How should a first-time food founder estimate shelf-life testing costs and FSSAI timelines?',
        'When building our initial sample batches for ready-to-eat roasted snacks, how long does accelerated shelf-life testing usually take at NABL labs, and what budget should we keep aside before our first retail pilot?',
        'Packaging & Compliance', 1, ?, ?)
      `).run(p1, adminUser.id, courseRef, now - 86400000 * 2, now - 86400000);

      db.prepare(`
        INSERT INTO community_replies(id, post_id, user_id, body, is_solution, created_at)
        VALUES('rep-millet-shelf-life-1', ?, ?,
        'For accelerated testing (at 38°C / 90% RH), NABL accredited laboratories typically require 45 to 60 days to simulate a 6-month shelf life. Budget approximately ₹12,000 to ₹18,000 for standard microbial and moisture parameters. Make sure you run tests in the final barrier packaging film you plan to use for retail!',
        1, ?)
      `).run(p1, adminUser.id, now - 86400000);

      db.prepare(`
        INSERT INTO community_posts(id, user_id, course_id, title, body, category, is_resolved, created_at, updated_at)
        VALUES(?, ?, ?, 'Contract manufacturing (Co-packing) vs owning your own mini-unit for the first 1,000 units?',
        'We are deciding between investing ₹6 lakhs in basic machinery or outsourcing to a contract manufacturer who requires a 2,000 unit minimum order. What do you recommend at the validation stage?',
        'Unit Economics & Sourcing', 0, ?, ?)
      `).run(p2, adminUser.id, courseRef, now - 43200000, now - 43200000);

      db.prepare(`
        INSERT INTO community_replies(id, post_id, user_id, body, is_solution, created_at)
        VALUES('rep-plant-1', ?, ?,
        'Always prioritize preserving capital for market validation. If a co-packer allows you to reach customers with zero capex, negotiate a smaller trial batch or pilot with manual sealers. Own manufacturing brings fixed overheads before you have proven repeat orders.',
        0, ?)
      `).run(p2, adminUser.id, now - 21600000);

      db.prepare('INSERT OR IGNORE INTO community_upvotes(user_id, post_id, created_at) VALUES(?,?,?)')
        .run(adminUser.id, p1, now);
    }
  } catch (e) {
    console.error('Notice ensuring profiles & community:', e.message);
  }
}

export function seed(db) {
  // Always ensure default admin account exists and is synchronized
  ensureManmathAdmin(db);
  try {
    db.prepare(
      "UPDATE users SET password_hash='scrypt$fcb1090e03b9a52b8b9f0b5b1687db4b$525d9f150e42973d725b58eece321f579c7853e663f43478497fcb2c621685c059edf6d80f87d8db5ee9133db7a5d5317555390824327a9b1f5ab257e10749c6', role='admin', verified=1 WHERE lower(email)='manmath@fame.com'"
    ).run();
  } catch {}

  // Ensure rich profile and community discussions are set up
  ensureProfilesAndCommunity(db);

  // Also ensure published status and default video URLs are up-to-date even on existing databases
  db.prepare("UPDATE courses SET status='published' WHERE id IN ('blueprint', 'mastery') AND status='draft'").run();
  const updateVideo = db.prepare("UPDATE lessons SET video_url=? WHERE id=? AND (video_url IS NULL OR video_url='')");
  courses.forEach((c) => {
    c.modules.forEach((l, j) => {
      if (l[4]) updateVideo.run(l[4], `${c.id}-${j + 1}`);
    });
  });

  if (db.prepare('SELECT count(*) AS n FROM courses').get().n) {
    syncBlueprintLessons(db);
    return;
  }
  const insertCourse = db.prepare(
    'INSERT INTO courses(id,slug,title,eyebrow,description,summary,price,level,accent,status,position,outcomes) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)'
  );
  const insertLesson = db.prepare(
    'INSERT INTO lessons(id,course_id,module_title,title,minutes,body,video_url,position,is_preview) VALUES(?,?,?,?,?,?,?,?,?)'
  );
  db.exec('BEGIN');
  try {
    courses.forEach((c, i) => {
      insertCourse.run(
        c.id,
        c.slug,
        c.title,
        c.eyebrow,
        c.description,
        c.summary,
        c.price,
        c.level,
        c.accent,
        c.status,
        i,
        JSON.stringify(c.outcomes)
      );
      c.modules.forEach((l, j) =>
        insertLesson.run(`${c.id}-${j + 1}`, c.id, l[0], l[1], l[2], l[3], l[4] || '', j, j === 0 ? 1 : 0)
      );
    });
    for (const [key, value] of Object.entries({
      support_email: '',
      business_name: 'FAME — Manmath Biradar',
      business_address: '',
      terms: '',
      privacy: '',
      refunds: '',
      legal_ready: 'false',
    }))
      db.prepare('INSERT INTO settings VALUES(?,?)').run(key, value);
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
}

export function syncBlueprintLessons(db) {
  try {
    const courseExists = db.prepare("SELECT 1 FROM courses WHERE id='blueprint'").get();
    if (!courseExists) return;
    const bpCourse = courses.find((c) => c.id === 'blueprint');
    if (!bpCourse?.modules) return;
    const upsertLesson = db.prepare(`
      INSERT INTO lessons(id, course_id, module_title, title, minutes, body, video_url, position, is_preview)
      VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        course_id=excluded.course_id,
        module_title=excluded.module_title,
        title=excluded.title,
        minutes=excluded.minutes,
        body=excluded.body,
        video_url=excluded.video_url,
        position=excluded.position,
        is_preview=excluded.is_preview
    `);
    bpCourse.modules.forEach((l, j) => {
      upsertLesson.run(
        `${bpCourse.id}-${j + 1}`,
        bpCourse.id,
        l[0],
        l[1],
        l[2],
        l[3],
        l[4] || '',
        j,
        j === 0 ? 1 : 0
      );
    });
  } catch (e) {
    console.error('Notice syncing blueprint lessons:', e.message);
  }
}

export function publishLivePlatform(db) {
  try {
    // 1. Mark all courses published, not sample, and ensure valid active pricing
    db.prepare("UPDATE courses SET status='published', is_sample=0").run();
    db.prepare("UPDATE courses SET price=1999900 WHERE id='accelerator' AND (price=0 OR price IS NULL)").run();

    // 2. Sync all 15 lessons for Silver Tier Blueprint
    syncBlueprintLessons(db);

    // 3. Ensure accelerator has lessons if it was previously 0
    const accCount = db.prepare("SELECT count(*) AS n FROM lessons WHERE course_id='accelerator'").get()?.n || 0;
    if (accCount === 0) {
      const insertLesson = db.prepare(
        'INSERT INTO lessons(id,course_id,module_title,title,minutes,body,video_url,position,is_preview) VALUES(?,?,?,?,?,?,?,?,?)'
      );
      const accCourse = courses.find((c) => c.id === 'accelerator');
      accCourse?.modules?.forEach((l, j) => {
        insertLesson.run(`accelerator-${j + 1}`, 'accelerator', l[0], l[1], l[2], l[3], l[4] || '', j, j === 0 ? 1 : 0);
      });
    }

    // 4. Ensure official live legal policies and support details are established
    const defaultSettings = {
      support_email: 'support@foodbusinesscoach.online',
      business_name: 'FAME — Manmath Biradar',
      business_address: 'Food Agribusiness Mentorship & Enterprise, Maharashtra, India',
      terms: `1. Acceptance of Terms: By purchasing or accessing FAME courses, mentoring programs, or digital learning materials, you agree to be bound by these Terms of Service.
2. Learning Access: Enrolment grants a personal, non-transferable, non-exclusive license to access course materials, video lessons, and resources for your individual business journey.
3. Intellectual Property: All proprietary frameworks, lesson content, spreadsheets, calculators, and materials are the intellectual property of FAME and Manmath Biradar. Sharing, recording, or unauthorized distribution is strictly prohibited.
4. Business Advisory Disclaimer: FAME provides educational and mentoring guidance based on practical industry experience. Implementation and commercial outcomes depend on individual founder execution, market variables, and compliance with statutory authorities.
5. Inquiries & Support: For customer support, reach out to support@foodbusinesscoach.online.`,
      privacy: `1. Data Collection: We collect essential contact information (name, email address) solely for account administration, learning progress tracking, and transaction verification.
2. Payment Security: Payment details are processed directly and securely through PCI-DSS certified gateway partners (Razorpay). FAME does not store your credit card or UPI banking credentials.
3. Information Usage: Your information is strictly used for course communications, mentorship access, platform updates, and transactional receipts. We never sell, rent, or trade student data.
4. Data Requests: You may contact support@foodbusinesscoach.online at any time to request data access or account assistance.`,
      refunds: `1. Course Access & Digital Content: FAME delivers immediate digital access to proprietary curriculum, frameworks, and intellectual property upon payment confirmation.
2. Refund Eligibility: We stand behind the value of our practical methodology. If you encounter any technical difficulty accessing your course, contact support@foodbusinesscoach.online within 48 hours for immediate assistance or resolution.
3. Cancellations: Live mentorship cohorts or 1-on-1 strategy sessions may be rescheduled with at least 24 hours prior notice.`,
      legal_ready: 'true',
    };

    for (const [key, value] of Object.entries(defaultSettings)) {
      const existing = db.prepare('SELECT value FROM settings WHERE key=?').get(key);
      if (!existing || !existing.value || existing.value === 'false' || existing.value === '') {
        db.prepare('INSERT OR REPLACE INTO settings(key, value) VALUES(?, ?)').run(key, value);
      }
    }
  } catch (e) {
    console.error('Notice publishing live platform:', e.message);
  }
}

