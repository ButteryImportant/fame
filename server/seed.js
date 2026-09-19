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
        'Start with clarity',
        'Welcome to your food business journey',
        8,
        'A strong food business begins with three connected decisions: the right product, the right business model, and the right sales channel. FAME brings these decisions together so you can plan your next step with purpose.\n\nUse this learning space as a working notebook. After every lesson, write down one decision you can make and one assumption you need to check with a real customer.\n\nYour first action\nDescribe the food business you want to build in one sentence: I help [customer] solve [need] with [product]. Keep it specific. “Healthy food for everyone” is too broad to test. “A convenient millet breakfast for busy office workers” gives you a clearer starting point.',
        'https://www.youtube.com/watch?v=7wtfhZwyrcc',
      ],
      [
        'Start with clarity',
        'Define your customer before your product',
        12,
        'Start by describing a specific buyer and a specific buying situation. A retail shopper, a restaurant owner and an ingredient distributor may all buy the same ingredient for different reasons.\n\nSpeak with five potential customers. Ask what they buy today, what frustrates them, how often they buy, and what makes them change suppliers. Capture their exact words before presenting your idea.\n\nYour action\nWrite down your first customer segment, their current alternative, the problem you heard most often, and how you will reach them again. These are learning conversations, not proof that they will buy.',
        'https://www.youtube.com/watch?v=M7lc1UVf-VE',
      ],
      [
        'Select your product',
        'Build your product shortlist',
        15,
        'Compare three product options against the customer need, raw-material availability, process complexity, shelf-life requirements and access to a sales channel. Score each dimension from one to five, and write the evidence behind the score.\n\nA high score is a starting hypothesis. Before investing, check the assumptions that could change the decision: a buyer requirement, a process trial, a supplier quotation or a shelf-life result.\n\nYour action\nSelect one product to validate first. Record why it fits your customer and the biggest unanswered question.',
        'https://www.youtube.com/watch?v=_tV5g6gkMrQ',
      ],
      [
        'Select your product',
        'Plan a small validation batch',
        12,
        'Define what you want to learn from your first batch: taste preference, packaging usability, repeat purchase or a production constraint. Set a small scope and a budget you can afford to use for learning.\n\nKeep batch notes and ask for specific feedback. “Would you buy this again at this price?” is more useful than a general compliment. Food safety and applicable compliance requirements must be addressed before any public sale.\n\nYour action\nWrite a validation plan with a target customer, batch size, feedback questions and a decision you will make from the results.',
        'https://www.youtube.com/watch?v=ScMzIvxBSi4',
      ],
      [
        'Choose your model',
        'Manufacture, outsource or source?',
        15,
        'Your product does not automatically determine your business model. Own manufacturing provides control but needs operating capability and capital. Contract manufacturing can reduce plant investment while introducing supplier, quality and minimum-order constraints. Sourcing and trading can help you learn a market with a different margin structure.\n\nCompare the options using actual quotations and working-capital needs. Include lead time, quality responsibility, minimum volumes, packaging and customer credit terms.\n\nYour action\nCreate a one-page comparison and choose a model to investigate further.',
        'https://www.youtube.com/watch?v=J---aiyznGQ',
      ],
      [
        'Choose your model',
        'Understand your unit economics',
        15,
        'Contribution per unit is selling price less variable costs per unit. Include ingredients, packaging, processing, channel deductions, fulfilment, payment charges and expected wastage as applicable. Revenue is not profit.\n\nSeparate one-time setup costs from recurring fixed costs and working capital. Do not assume every unit produced will sell immediately.\n\nYour action\nBuild a conservative estimate using three scenarios: lower sales, expected sales and higher sales. Identify which assumption has the biggest effect on your cash requirement.',
        'https://www.youtube.com/watch?v=LXb3EKWsInQ',
      ],
      [
        'Reach your market',
        'Choose your first sales channel',
        12,
        'Retail, institutional sales, distributors, marketplaces and direct-to-consumer selling each have different buying processes and costs. A first channel should fit the product, the customer and your ability to deliver consistently.\n\nAsk prospective buyers about pack size, minimum quantities, payment terms, delivery frequency and documentation. Estimate the net amount you receive after channel costs.\n\nYour action\nShortlist one primary channel, identify ten potential buyers, and plan a small outreach experiment.',
        'https://www.youtube.com/watch?v=ysz5S6PUM-U',
      ],
      [
        'Reach your market',
        'Build your next 30-day action plan',
        10,
        'Convert your learning into four weekly milestones. Each milestone should produce evidence: customer conversations, a supplier comparison, a tested sample or a buyer meeting.\n\nGive every action an owner, a due date and a decision it supports. Review what happened rather than only counting activities.\n\nYour action\nWrite the three decisions you have made, the three assumptions you still need to check, and the first action you will take tomorrow.',
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
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
    price: 0,
    level: 'L2',
    accent: 'blue',
    status: 'upcoming',
    outcomes: [
      'Plan your product validation',
      'Map suppliers and operating needs',
      'Build your launch sequence',
      'Prepare a channel action plan',
    ],
    modules: [],
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
export function ensureManmathAdmin(db, targetEmail = 'manmathbiradar@gmail.com') {
  const adminHash =
    'scrypt$fcb1090e03b9a52b8b9f0b5b1687db4b$525d9f150e42973d725b58eece321f579c7853e663f43478497fcb2c621685c059edf6d80f87d8db5ee9133db7a5d5317555390824327a9b1f5ab257e10749c6';

  const emailsToEnsure = ['manmathbiradar@gmail.com', 'manmath'];
  for (const email of emailsToEnsure) {
    try {
      const existing = db.prepare('SELECT id FROM users WHERE lower(email) = ?').get(email.toLowerCase());
      if (existing) {
        db.prepare(
          "UPDATE users SET name='Manmath Biradar', password_hash=?, role='admin', verified=1 WHERE id=?"
        ).run(adminHash, existing.id);
      } else {
        const id = email === 'manmath' ? 'admin-manmath' : 'admin-manmathbiradar';
        db.prepare(
          "INSERT OR IGNORE INTO users(id,name,email,password_hash,role,verified,created_at) VALUES(?,'Manmath Biradar',?,?,'admin',1,?)"
        ).run(id, email, adminHash, Date.now());
      }
    } catch (e) {
      console.error(`Notice ensuring admin ${email}:`, e.message);
    }
  }

  return (
    db.prepare('SELECT * FROM users WHERE lower(email) = ?').get(targetEmail.toLowerCase()) ||
    db.prepare("SELECT * FROM users WHERE lower(email) = 'manmathbiradar@gmail.com'").get() ||
    db.prepare("SELECT * FROM users WHERE lower(email) = 'manmath'").get() ||
    db.prepare("SELECT * FROM users WHERE role = 'admin'").get()
  );
}

export function ensureProfilesAndCommunity(db) {
  try {
    const adminUser =
      db.prepare("SELECT id FROM users WHERE lower(email) = 'manmathbiradar@gmail.com'").get() ||
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

  if (db.prepare('SELECT count(*) AS n FROM courses').get().n) return;
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
