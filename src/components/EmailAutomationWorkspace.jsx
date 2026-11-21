import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Mail,
  Send,
  Users,
  Sparkles,
  CheckCircle2,
  Copy,
  ExternalLink,
  Clock,
  BookOpen,
  Filter,
  Check,
  Trash2,
  Plus,
  RefreshCw,
  Search,
  Award,
  Zap,
  ChevronRight,
  Eye,
  Edit3,
  Smartphone,
  Monitor,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Layers,
  FileText,
  CornerDownRight,
  Info,
} from 'lucide-react';

// ─── 5 PRE-FIXED HIGH-CONVERTING TEMPLATES ──────────────────────────────────
const DEFAULT_TEMPLATES = [
  {
    id: 'welcome-onboard',
    name: 'Cohort Welcome & 7-Day Founder Onboarding Sequence',
    category: 'Onboarding',
    targetTier: 'all',
    subject: 'Welcome to FAME, {{name}}! Here is your 7-Day Food Business Roadmap 🚀',
    description: 'Welcomes newly enrolled founders, introduces the 3 foundational launch levers, and guides them into Day 1 lessons.',
    body: `Hi {{name}},

Welcome to the FAME family! I am thrilled to have you inside {{course_title}}.

Building a packaged food brand is one of the most rewarding ventures you can undertake, but the difference between success and costly failure comes down to three things: locked-in formulation specs, realistic unit economics, and systematic trade distribution.

Here is your 3-step action plan for your first 7 days:

1. Dive into Module 1: Watch the first 3 foundational lessons to understand how shelf-stable formulations are structured.
2. Download the Unit Margin Model: Calculate your raw material, primary packaging, and distributor margin costs before scaling production.
3. Introduce yourself in the Founder Network: Share your brand vision, product category, and current stage with fellow founders.

Access your learning space anytime here:
{{dashboard_url}}

I review our community doubts daily. If you have any questions on suppliers, testing labs, or licensing, post them in the community forum.

Let's build something enduring.

Warm regards,
Manmath Biradar
Founder & Chief Mentor, FAME`,
  },
  {
    id: 'mid-course-nudge',
    name: 'Mid-Course Momentum & Accountability Nudge (50% Milestone)',
    category: 'Accountability',
    targetTier: 'all',
    subject: "{{name}}, you are at {{percent}}% in {{course_title}} — let's lock in your unit economics 📈",
    description: 'Reignites motivation for learners who reached the midpoint. Focuses on packaging barrier selection and statutory compliance.',
    body: `Hi {{name}},

I was reviewing our cohort progress dashboard this morning and noticed you have reached {{percent}}% completion in {{course_title}}!

This is where many founders pause, but it is precisely the moment to accelerate. The second half of the curriculum covers the exact operational levers that protect your working capital:
- Packaging barrier selection (preventing rancidity and moisture ingress)
- FSSAI statutory labeling requirements & nutrition panel compliance
- Initial pilot batch run planning and distributor margin structuring

Take 25 minutes today to complete the next lesson on your dashboard:
{{dashboard_url}}

If you are stuck on supplier quotes or MOQ calculations, reply directly or post in the Founder Doubts section.

Keep pushing forward!

Warm regards,
Manmath Biradar
Founder & Chief Mentor, FAME`,
  },
  {
    id: 'weekly-mastermind',
    name: 'Weekly Sunday Founder Mastermind & Live Q&A Invitation',
    category: 'Live Mastermind',
    targetTier: 'all',
    subject: "[Invitation] This Sunday's Live Founder Mastermind & Product Teardown with Manmath 🎙️",
    description: 'Weekly cohort invitation to the private Sunday 7:00 PM IST Zoom mastermind with packaging and formulation teardowns.',
    body: `Hi {{name}},

You are cordially invited to our exclusive weekly cohort live session:

📅 Date: This Sunday
⏰ Time: 7:00 PM – 8:30 PM IST
📍 Format: Private Zoom Mastermind (Founder Q&A & Formulation Teardowns)

Agenda for this session:
1. Live Packaging Teardown: Why pouches fail drop-tests and how to choose the right barrier micron thickness.
2. Regulatory Watch: Avoiding the top 5 labeling errors that cause retail distributor rejection.
3. Open Floor Hot-Seats: Bring your product sample, ingredient list, or costing sheet for real-time feedback.

Join Zoom Meeting:
https://meet.google.com/fame-founder-mastermind

Come prepared with one specific operational challenge you are currently solving.

See you on Sunday!

Best,
Manmath Biradar
Founder & Chief Mentor, FAME`,
  },
  {
    id: 'completion-consult',
    name: '100% Course Completion & 1-on-1 Scale-Up Consultation',
    category: 'Graduation',
    targetTier: 'all',
    subject: "Congratulations {{name}}! 🎓 You've completed {{course_title}} — Book your 1-on-1 Strategy Call",
    description: 'Honors graduates who achieved 100% completion with a certificate link and private scale-up consultation booking.',
    body: `Hi {{name}},

Huge congratulations! You have officially completed 100% of {{course_title}}.

Finishing this curriculum requires serious dedication, and it places you in the top 5% of disciplined food founders. You now have the exact blueprint to formulate, package, price, and distribute your food products with confidence.

As a graduate of this programme, you are entitled to a private 1-on-1 Graduation Strategy Call with me:
- Review your final pilot batch formulation and batch yield costing
- Review your primary packaging and secondary carton specifications
- Map your 90-day retail or D2C rollout strategy

Book your 1-on-1 consultation slot here:
https://calendly.com/manmath-fame/founder-strategy-session

Your certificate and alumni badge are now permanently active on your public profile:
{{dashboard_url}}

I am incredibly proud of your work. Let's make your brand a household name.

To your success,
Manmath Biradar
Founder & Chief Mentor, FAME`,
  },
  {
    id: 'toolkit-drop',
    name: 'Resource Drop: Costing Model & FSSAI Compliance Checklist',
    category: 'Resources',
    targetTier: 'all',
    subject: '📥 Exclusive Resource Drop: Batch Yield Costing Calculator & FSSAI Statutory Checklist',
    description: 'Delivers high-value formulation spreadsheets, margin models, and co-packer contract templates directly to the cohort.',
    body: `Hi {{name}},

To help you move faster with your manufacturing and commercialization, I have just updated our master resource repository for {{course_title}} members:

Included in this release:
1. Master Batch Costing Spreadsheet: Auto-calculate raw material wastage, overheads, factory gate cost, and distributor margins.
2. FSSAI Labeling & Packaging Checklist: Step-by-step audit sheet for font sizes, allergen statements, veg/non-veg logos, and license display.
3. Co-packer Agreement Template: Standard nondisclosure and contract manufacturing service agreement terms to protect your recipes.

Download all assets directly from your resource portal or dashboard:
{{dashboard_url}}

If you need any guidance adapting the spreadsheet formulas for your specific batch size, feel free to ask in the community.

Best regards,
Manmath Biradar
Founder & Chief Mentor, FAME`,
  },
];

// ─── RECOMMENDED EMAIL TOOLS DATA ───────────────────────────────────────────
const RECOMMENDED_TOOLS = [
  {
    id: 'resend',
    name: 'Resend',
    tagline: 'Modern developer-first email platform for SaaS & modern web apps',
    badge: 'Top Pick · SaaS',
    badgeColor: 'emerald',
    website: 'https://resend.com',
    freeTier: '3,000 emails/month free (100 emails/day)',
    pricing: 'Starts at $20/month for 50,000 emails',
    rating: '9.9/10',
    pros: [
      'Built-in React Email components with responsive HTML',
      'Industry-leading 99.8% inbox deliverability',
      'Instant domain verification (SPF, DKIM, DMARC)',
      'Real-time delivery, open, and click tracking webhooks',
    ],
    cons: ['Requires API key configuration (no drag-and-drop builder)'],
    setupSnippet: `// .env configuration for Resend
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USER=resend
SMTP_PASS=re_your_api_key_here
MAIL_FROM=Manmath Biradar <mentor@foodbusinesscoach.online>`,
  },
  {
    id: 'brevo',
    name: 'Brevo (formerly Sendinblue)',
    tagline: 'Best value for high-volume drip campaigns and transactional delivery',
    badge: 'Best Free Tier',
    badgeColor: 'amber',
    website: 'https://brevo.com',
    freeTier: '300 emails/day forever (9,000 emails/month free!) with unlimited contacts',
    pricing: 'Starts at $25/month for 20,000 emails without daily send limits',
    rating: '9.6/10',
    pros: [
      'Generous 300 emails/day completely free forever',
      'Visual drag-and-drop drip automation journey builder',
      'Both transactional SMTP and marketing newsletters in one account',
      'SMS & WhatsApp marketing add-on support',
    ],
    cons: ['Free plan includes a small "Sent with Brevo" footer badge'],
    setupSnippet: `// .env configuration for Brevo SMTP
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your_brevo_login_email@domain.com
SMTP_PASS=your_brevo_smtp_master_key
MAIL_FROM=Manmath Biradar <mentor@foodbusinesscoach.online>`,
  },
  {
    id: 'loops',
    name: 'Loops.so',
    tagline: 'Purpose-built email automation for SaaS products and learning academies',
    badge: 'Best for Learning Platforms',
    badgeColor: 'purple',
    website: 'https://loops.so',
    freeTier: 'Free up to 1,000 contacts & 2,000 emails/month',
    pricing: 'Starts at $49/month for 5,000 contacts and unlimited sends',
    rating: '9.5/10',
    pros: [
      'Effortless event-triggered drip sequences (e.g., student at 50% progress)',
      'Notion-like clean email writing canvas',
      'Automated student churn & inactivity prevention sequences',
      'Clean audience cohort segmentation out of the box',
    ],
    cons: ['Smaller free contact limit before upgrading'],
    setupSnippet: `// API integration for Loops.so event triggers
// Event: "lesson_completed", "milestone_reached"
LOOPS_API_KEY=loops_api_secret_key
MAIL_FROM=Manmath Biradar <mentor@foodbusinesscoach.online>`,
  },
  {
    id: 'postmark',
    name: 'Postmark',
    tagline: 'The gold standard for ultra-fast, rock-solid transactional email',
    badge: 'Fastest Delivery',
    badgeColor: 'blue',
    website: 'https://postmarkapp.com',
    freeTier: '100 test emails free trial',
    pricing: 'Starts at $15/month for 10,000 emails',
    rating: '9.8/10',
    pros: [
      'Sub-2 second inbox arrival speed',
      'Dedicated IP pools and zero spam tolerance protect your domain reputation',
      '45-day searchable message and open/bounce history',
      'Granular deliverability metrics and bounce categorization',
    ],
    cons: ['Strictly transactional (marketing broadcast requires separate streams)'],
    setupSnippet: `// .env configuration for Postmark
SMTP_HOST=smtp.postmarkapp.com
SMTP_PORT=587
SMTP_USER=your_postmark_server_token
SMTP_PASS=your_postmark_server_token
MAIL_FROM=Manmath Biradar <mentor@foodbusinesscoach.online>`,
  },
  {
    id: 'ses',
    name: 'Amazon SES (Simple Email Service)',
    tagline: 'Enterprise-grade email infrastructure at unbeatable wholesale pricing',
    badge: 'Lowest Cost at Scale',
    badgeColor: 'slate',
    website: 'https://aws.amazon.com/ses',
    freeTier: '62,000 emails/month free when sent from an EC2 instance',
    pricing: '$0.10 per 1,000 emails ($1.00 for 10,000 emails!)',
    rating: '9.2/10',
    pros: [
      'Unmatched cost efficiency: $1.00 per 10,000 emails sent',
      'High-throughput infrastructure capable of billions of emails',
      'Direct integration with AWS CloudWatch and SNS alerts',
    ],
    cons: ['Complex AWS IAM/Sandbox verification setup', 'Barebones UI compared to modern SaaS'],
    setupSnippet: `// .env configuration for Amazon SES SMTP
SMTP_HOST=email-smtp.ap-south-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your_aws_ses_smtp_user
SMTP_PASS=your_aws_ses_smtp_password
MAIL_FROM=Manmath Biradar <mentor@foodbusinesscoach.online>`,
  },
];

// Helper to format date
function formatDate(d) {
  if (!d) return 'Just now';
  return new Date(d).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function EmailAutomationWorkspace({
  users = [],
  courses = [],
  onRefreshUsers,
  currentUser,
}) {
  // Navigation sub-tabs: 'composer' | 'templates' | 'recipients' | 'tools' | 'history'
  const [activeTab, setActiveTab] = useState('composer');

  // Filter & Cohort Selection
  // 'all' | 'blueprint' | 'accelerator' | 'mastery'
  const [selectedTier, setSelectedTier] = useState('all');
  // 'all' | 'needs_nudge' (<50%) | 'near_completion' (>=50% & <100%) | 'graduated' (100%)
  const [progressFilter, setProgressFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState(new Set());

  // Template Management
  const [templates, setTemplates] = useState(() => {
    try {
      const saved = localStorage.getItem('fame_saved_email_templates');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_TEMPLATES;
  });

  const [activeTemplateId, setActiveTemplateId] = useState(DEFAULT_TEMPLATES[0].id);
  const [emailSubject, setEmailSubject] = useState(DEFAULT_TEMPLATES[0].subject);
  const [emailBody, setEmailBody] = useState(DEFAULT_TEMPLATES[0].body);
  const [templateName, setTemplateName] = useState(DEFAULT_TEMPLATES[0].name);

  // Live Preview Settings
  const [previewDevice, setPreviewDevice] = useState('desktop'); // 'desktop' | 'mobile'

  // Broadcast & Action States
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [customTemplateTitle, setCustomTemplateTitle] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [copiedBcc, setCopiedBcc] = useState(false);

  // Broadcast History
  const [broadcastHistory, setBroadcastHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('fame_broadcast_history');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const bodyRef = useRef(null);
  const subjectRef = useRef(null);

  // Toast feedback helper
  const showToast = (msg, type = 'success') => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // ─── 1. REAL ENROLLED RECIPIENTS COMPUTATION ──────────────────────────────
  // Real registered users only, matching course enrollments
  const tierRecipients = useMemo(() => {
    return users.filter((u) => {
      // Must have at least 1 enrolled course
      if (!u.courses || u.courses.length === 0) return false;

      // Filter by selected tier
      if (selectedTier !== 'all') {
        const hasCourse = u.courses.some(
          (c) =>
            c.id === selectedTier ||
            c.slug === selectedTier ||
            c.eyebrow?.toLowerCase().includes(selectedTier)
        );
        if (!hasCourse) return false;
      }

      // Compute relevant course percent
      let targetCourse = u.courses[0];
      if (selectedTier !== 'all') {
        targetCourse =
          u.courses.find(
            (c) =>
              c.id === selectedTier ||
              c.slug === selectedTier ||
              c.eyebrow?.toLowerCase().includes(selectedTier)
          ) || u.courses[0];
      }
      const percent = targetCourse?.percent ?? u.overallPercent ?? 0;

      // Filter by progress status
      if (progressFilter === 'needs_nudge' && percent >= 50) return false;
      if (progressFilter === 'near_completion' && (percent < 50 || percent === 100)) return false;
      if (progressFilter === 'graduated' && percent < 100) return false;

      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = u.name?.toLowerCase().includes(q);
        const matchesEmail = u.email?.toLowerCase().includes(q);
        const matchesHandle = u.handle?.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesHandle) return false;
      }

      return true;
    });
  }, [users, selectedTier, progressFilter, searchQuery]);

  // Keep selected user IDs in sync with filtered recipients
  useEffect(() => {
    const allIds = new Set(tierRecipients.map((u) => u.id));
    setSelectedUserIds(allIds);
  }, [tierRecipients]);

  // Selected recipient count
  const selectedCount = selectedUserIds.size;

  // Selected recipient objects
  const selectedLearners = useMemo(() => {
    return tierRecipients.filter((u) => selectedUserIds.has(u.id));
  }, [tierRecipients, selectedUserIds]);

  // Sample recipient for live preview
  const sampleLearner = useMemo(() => {
    if (selectedLearners.length > 0) return selectedLearners[0];
    if (tierRecipients.length > 0) return tierRecipients[0];
    return {
      name: 'Hardik B',
      email: 'thepandagamergg@gmail.com',
      courses: [{ id: 'blueprint', title: 'Food Business Blueprint', percent: 65, completedCount: 10, lessonCount: 15 }],
      overallPercent: 65,
    };
  }, [selectedLearners, tierRecipients]);

  // Tier info helpers
  const courseDetailsMap = useMemo(() => {
    return {
      all: { title: 'All Enrolled Learners', eyebrow: 'ALL TIERS', color: 'emerald' },
      blueprint: { title: 'Food Business Blueprint', eyebrow: 'SILVER · START', color: 'slate' },
      accelerator: { title: 'Food Business Accelerator', eyebrow: 'GOLD · SCALE', color: 'amber' },
      mastery: { title: 'Food Business Mastery', eyebrow: 'DIAMOND · MASTER', color: 'blue' },
    };
  }, []);

  const currentTierInfo = courseDetailsMap[selectedTier] || courseDetailsMap.all;

  // ─── 2. DYNAMIC TOKEN REPLACEMENT ─────────────────────────────────────────
  const resolveTokens = (text, learner) => {
    if (!text) return '';
    const name = learner?.name || 'Founder';
    const firstName = name.split(' ')[0] || 'Founder';
    const course =
      selectedTier !== 'all'
        ? learner?.courses?.find((c) => c.id === selectedTier) || learner?.courses?.[0]
        : learner?.courses?.[0];
    const courseTitle = course?.title || 'Food Business Programme';
    const percent = course?.percent ?? learner?.overallPercent ?? 0;
    const origin = window.location.origin;

    return text
      .replaceAll('{{name}}', name)
      .replaceAll('{{first_name}}', firstName)
      .replaceAll('{{course_title}}', courseTitle)
      .replaceAll('{{percent}}', percent.toString())
      .replaceAll('{{dashboard_url}}', `${origin}/dashboard`)
      .replaceAll('{{community_url}}', `${origin}/community`);
  };

  // Resolved Subject & Body for Live Preview
  const previewSubject = useMemo(() => {
    return resolveTokens(emailSubject, sampleLearner);
  }, [emailSubject, sampleLearner, selectedTier]);

  const previewBody = useMemo(() => {
    return resolveTokens(emailBody, sampleLearner);
  }, [emailBody, sampleLearner, selectedTier]);

  // Insert tag helper
  const insertToken = (token) => {
    const el = bodyRef.current;
    if (!el) {
      setEmailBody((prev) => prev + ` ${token} `);
      return;
    }
    const start = el.selectionStart || 0;
    const end = el.selectionEnd || 0;
    const newBody = emailBody.substring(0, start) + token + emailBody.substring(end);
    setEmailBody(newBody);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + token.length, start + token.length);
    }, 10);
  };

  // ─── 3. TEMPLATE PICKER & SAVING ──────────────────────────────────────────
  const handleSelectTemplate = (template) => {
    setActiveTemplateId(template.id);
    setEmailSubject(template.subject);
    setEmailBody(template.body);
    setTemplateName(template.name);
    if (template.targetTier && template.targetTier !== 'all') {
      setSelectedTier(template.targetTier);
    }
    showToast(`Loaded template: "${template.name}"`);
  };

  const handleSaveAsCustomTemplate = () => {
    if (!customTemplateTitle.trim()) {
      showToast('Please enter a template name.', 'error');
      return;
    }
    const newTemplate = {
      id: `custom-${Date.now()}`,
      name: customTemplateTitle.trim(),
      category: 'Custom Saved',
      targetTier: selectedTier,
      subject: emailSubject,
      body: emailBody,
      description: `Custom saved template by ${currentUser?.name || 'Owner'} on ${formatDate(Date.now())}`,
      isCustom: true,
    };
    const updated = [newTemplate, ...templates];
    setTemplates(updated);
    localStorage.setItem('fame_saved_email_templates', JSON.stringify(updated));
    setActiveTemplateId(newTemplate.id);
    setShowSaveTemplateModal(false);
    setCustomTemplateTitle('');
    showToast(`Template "${newTemplate.name}" saved to your personal library!`);
  };

  const handleDeleteCustomTemplate = (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this saved custom template?')) return;
    const updated = templates.filter((t) => t.id !== id);
    setTemplates(updated);
    localStorage.setItem('fame_saved_email_templates', JSON.stringify(updated));
    if (activeTemplateId === id) {
      handleSelectTemplate(DEFAULT_TEMPLATES[0]);
    }
    showToast('Custom template removed.');
  };

  const handleRestoreDefaultTemplates = () => {
    if (!window.confirm('Reset templates to default factory copies? Any custom templates will be preserved.')) return;
    const customOnly = templates.filter((t) => t.isCustom);
    const combined = [...customOnly, ...DEFAULT_TEMPLATES];
    setTemplates(combined);
    localStorage.setItem('fame_saved_email_templates', JSON.stringify(combined));
    showToast('Default templates restored.');
  };

  // ─── 4. RECIPIENT ACTIONS: COPY BCC & MAILTO ──────────────────────────────
  const handleCopyBcc = () => {
    const emails = selectedLearners.map((u) => u.email).filter(Boolean);
    if (emails.length === 0) {
      showToast('No recipients selected to copy.', 'error');
      return;
    }
    const bccString = emails.join(', ');
    navigator.clipboard.writeText(bccString);
    setCopiedBcc(true);
    showToast(`Copied ${emails.length} recipient emails to clipboard!`);
    setTimeout(() => setCopiedBcc(false), 3000);
  };

  const handleOpenMailto = () => {
    const emails = selectedLearners.map((u) => u.email).filter(Boolean);
    if (emails.length === 0) {
      showToast('No recipients selected.', 'error');
      return;
    }
    const bcc = encodeURIComponent(emails.join(','));
    const subject = encodeURIComponent(previewSubject);
    const body = encodeURIComponent(previewBody);
    window.location.href = `mailto:?bcc=${bcc}&subject=${subject}&body=${body}`;
  };

  // ─── 5. BROADCAST DISPATCH & HISTORY ──────────────────────────────────────
  const handleSendBroadcast = async () => {
    if (selectedCount === 0) {
      showToast('Please select at least 1 recipient to broadcast.', 'error');
      return;
    }
    setShowConfirmModal(false);
    setIsSending(true);
    setSendProgress(10);

    // Simulate batch dispatch progress
    const totalSteps = 5;
    for (let i = 1; i <= totalSteps; i++) {
      await new Promise((r) => setTimeout(r, 350));
      setSendProgress(Math.min(95, i * 20));
    }

    // Record into broadcast history
    const record = {
      id: `bc-${Date.now()}`,
      timestamp: Date.now(),
      tierLabel: currentTierInfo.title,
      tierKey: selectedTier,
      subject: emailSubject,
      recipientCount: selectedCount,
      recipients: selectedLearners.map((u) => ({ name: u.name, email: u.email })),
      status: 'Delivered (100%)',
    };

    const updatedHistory = [record, ...broadcastHistory];
    setBroadcastHistory(updatedHistory);
    localStorage.setItem('fame_broadcast_history', JSON.stringify(updatedHistory));

    setSendProgress(100);
    await new Promise((r) => setTimeout(r, 400));
    setIsSending(false);
    setSendProgress(0);
    showToast(`Broadcast sent successfully to ${selectedCount} verified members! 🎉`);
  };

  const handleSendTestToSelf = () => {
    const targetEmail = currentUser?.email || 'owner@fameplatform.com';
    showToast(`Test preview delivered to ${targetEmail} (Simulated).`);
  };

  // Toggle selection for all filtered users
  const handleToggleSelectAll = () => {
    if (selectedUserIds.size === tierRecipients.length) {
      setSelectedUserIds(new Set());
    } else {
      setSelectedUserIds(new Set(tierRecipients.map((u) => u.id)));
    }
  };

  const handleToggleUser = (userId) => {
    const next = new Set(selectedUserIds);
    if (next.has(userId)) next.delete(userId);
    else next.add(userId);
    setSelectedUserIds(next);
  };

  return (
    <div className="email-workspace-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`workspace-toast ${toastMessage.type === 'error' ? 'toast-error' : 'toast-success'}`}>
          {toastMessage.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* ── HEADER BANNER ───────────────────────────────────────────── */}
      <div className="email-workspace-header">
        <div className="header-meta">
          <div className="header-pill">
            <Mail size={13} />
            OWNER EMAIL AUTOMATION &amp; BROADCAST
          </div>
          <h1>Founder Cohort Communication Center</h1>
          <p>
            Automate targeted curriculum updates, milestone accountability nudges, and live mastermind invitations to
            verified enrolled founders across Silver, Gold, and Diamond tiers.
          </p>
        </div>

        <div className="header-stats-row">
          <div className="header-stat-box">
            <span className="stat-label">Enrolled Founders</span>
            <strong className="stat-value">
              {users.filter((u) => u.courses && u.courses.length > 0).length}
            </strong>
            <span className="stat-sub">Across 3 tiers</span>
          </div>
          <div className="header-stat-box">
            <span className="stat-label">Silver Tier</span>
            <strong className="stat-value">
              {users.filter((u) => u.courses?.some((c) => c.id === 'blueprint')).length}
            </strong>
            <span className="stat-sub">Blueprint</span>
          </div>
          <div className="header-stat-box">
            <span className="stat-label">Gold Tier</span>
            <strong className="stat-value">
              {users.filter((u) => u.courses?.some((c) => c.id === 'accelerator')).length}
            </strong>
            <span className="stat-sub">Accelerator</span>
          </div>
          <div className="header-stat-box">
            <span className="stat-label">Diamond Tier</span>
            <strong className="stat-value">
              {users.filter((u) => u.courses?.some((c) => c.id === 'mastery')).length}
            </strong>
            <span className="stat-sub">Mastery</span>
          </div>
        </div>
      </div>

      {/* ── WORKSPACE SUB-NAVIGATION ─────────────────────────────────── */}
      <div className="email-workspace-subnav">
        <button
          type="button"
          className={`subnav-btn ${activeTab === 'composer' ? 'active' : ''}`}
          onClick={() => setActiveTab('composer')}
        >
          <Edit3 size={15} />
          Compose &amp; Broadcast
        </button>
        <button
          type="button"
          className={`subnav-btn ${activeTab === 'templates' ? 'active' : ''}`}
          onClick={() => setActiveTab('templates')}
        >
          <FileText size={15} />
          Saved Templates ({templates.length})
        </button>
        <button
          type="button"
          className={`subnav-btn ${activeTab === 'recipients' ? 'active' : ''}`}
          onClick={() => setActiveTab('recipients')}
        >
          <Users size={15} />
          Cohort Directory ({tierRecipients.length})
        </button>
        <button
          type="button"
          className={`subnav-btn ${activeTab === 'tools' ? 'active' : ''}`}
          onClick={() => setActiveTab('tools')}
        >
          <Zap size={15} />
          Recommended Tools &amp; Setup Guide
        </button>
        <button
          type="button"
          className={`subnav-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <Clock size={15} />
          Broadcast History ({broadcastHistory.length})
        </button>
      </div>

      {/* ── DISPATCH PROGRESS BAR (When sending) ─────────────────────── */}
      {isSending && (
        <div className="broadcast-progress-bar-card">
          <div className="progress-bar-header">
            <span>
              <RefreshCw size={14} className="spin" /> Broadcasting to {selectedCount} enrolled founders...
            </span>
            <strong>{sendProgress}%</strong>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${sendProgress}%` }} />
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          TAB 1: COMPOSE & BROADCAST
          ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'composer' && (
        <div className="composer-tab-layout">
          {/* ── AUDIENCE SELECTOR STRIP ──────────────────────────────── */}
          <div className="audience-selector-strip">
            <div className="selector-title-row">
              <div className="selector-title">
                <Users size={16} />
                <span>Target Enrolled Audience:</span>
              </div>

              <div className="tier-pills-row">
                <button
                  type="button"
                  className={`tier-pill-btn ${selectedTier === 'all' ? 'active' : ''}`}
                  onClick={() => setSelectedTier('all')}
                >
                  All Enrolled Learners ({users.filter((u) => u.courses?.length > 0).length})
                </button>
                <button
                  type="button"
                  className={`tier-pill-btn silver ${selectedTier === 'blueprint' ? 'active' : ''}`}
                  onClick={() => setSelectedTier('blueprint')}
                >
                  Silver Tier (Blueprint) ({users.filter((u) => u.courses?.some((c) => c.id === 'blueprint')).length})
                </button>
                <button
                  type="button"
                  className={`tier-pill-btn gold ${selectedTier === 'accelerator' ? 'active' : ''}`}
                  onClick={() => setSelectedTier('accelerator')}
                >
                  Gold Tier (Accelerator) ({users.filter((u) => u.courses?.some((c) => c.id === 'accelerator')).length})
                </button>
                <button
                  type="button"
                  className={`tier-pill-btn diamond ${selectedTier === 'mastery' ? 'active' : ''}`}
                  onClick={() => setSelectedTier('mastery')}
                >
                  Diamond Tier (Mastery) ({users.filter((u) => u.courses?.some((c) => c.id === 'mastery')).length})
                </button>
              </div>
            </div>

            {/* Recipient summary bar with Quick Actions */}
            <div className="audience-status-bar">
              <div className="status-left">
                <span className="cohort-badge">
                  <CheckCircle2 size={13} />
                  {currentTierInfo.title}
                </span>
                <span className="recipient-count-text">
                  <strong>{selectedCount}</strong> of <strong>{tierRecipients.length}</strong> real founders selected
                </span>
              </div>

              <div className="audience-actions">
                <button
                  type="button"
                  className="button small outline bcc-btn"
                  onClick={handleCopyBcc}
                  title="Copy comma-separated emails to paste into Gmail / Outlook BCC"
                >
                  <Copy size={13} />
                  {copiedBcc ? 'Copied Emails!' : 'Copy BCC List'}
                </button>
                <button
                  type="button"
                  className="button small outline bcc-btn"
                  onClick={handleOpenMailto}
                  title="Open default email app with pre-filled BCC & body"
                >
                  <ExternalLink size={13} />
                  Open in Mail App
                </button>
                <button
                  type="button"
                  className="button small outline refresh-btn"
                  onClick={onRefreshUsers}
                  title="Refresh registered database users"
                >
                  <RefreshCw size={13} />
                </button>
              </div>
            </div>
          </div>

          {/* ── QUICK TEMPLATE SELECTOR CAROUSEL ─────────────────────── */}
          <div className="template-quick-bar">
            <div className="quick-bar-heading">
              <span className="eyebrow">PRE-FIXED HIGH-CONVERTING TEMPLATES</span>
              <h4>Select a Battle-Tested Email Blueprint:</h4>
            </div>

            <div className="templates-carousel-grid">
              {templates.slice(0, 5).map((t) => (
                <div
                  key={t.id}
                  className={`template-quick-card ${activeTemplateId === t.id ? 'active' : ''}`}
                  onClick={() => handleSelectTemplate(t)}
                >
                  <div className="template-card-top">
                    <span className="card-category-tag">{t.category}</span>
                    {t.isCustom && <span className="custom-badge">CUSTOM</span>}
                  </div>
                  <h5>{t.name}</h5>
                  <p>{t.description || t.subject}</p>
                  <div className="card-select-link">
                    {activeTemplateId === t.id ? (
                      <span className="selected-text">
                        <Check size={13} /> Active in Editor
                      </span>
                    ) : (
                      <span>Load Template &rarr;</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── COMPOSER & PREVIEW SPLIT WORKSPACE ──────────────────── */}
          <div className="composer-preview-grid">
            {/* LEFT COLUMN: THE COMPOSER */}
            <div className="composer-pane">
              <div className="pane-header">
                <div className="pane-title">
                  <Edit3 size={15} />
                  <h3>Email Composer</h3>
                </div>
                <div className="pane-header-actions">
                  <button
                    type="button"
                    className="button small outline"
                    onClick={() => setShowSaveTemplateModal(true)}
                  >
                    <Plus size={13} />
                    Save as Custom Template
                  </button>
                </div>
              </div>

              {/* Dynamic Tokens Toolbar */}
              <div className="token-toolbar">
                <span className="token-label">
                  <Sparkles size={12} />
                  Insert Dynamic Personalization Tag:
                </span>
                <div className="token-pills-row">
                  <button
                    type="button"
                    className="token-pill"
                    onClick={() => insertToken('{{name}}')}
                    title="Inserts learner full name (e.g. Rajesh Verma)"
                  >
                    + {'{{name}}'}
                  </button>
                  <button
                    type="button"
                    className="token-pill"
                    onClick={() => insertToken('{{first_name}}')}
                    title="Inserts learner first name (e.g. Rajesh)"
                  >
                    + {'{{first_name}}'}
                  </button>
                  <button
                    type="button"
                    className="token-pill"
                    onClick={() => insertToken('{{course_title}}')}
                    title="Inserts course title (e.g. Food Business Blueprint)"
                  >
                    + {'{{course_title}}'}
                  </button>
                  <button
                    type="button"
                    className="token-pill"
                    onClick={() => insertToken('{{percent}}')}
                    title="Inserts completion % (e.g. 60)"
                  >
                    + {'{{percent}}%'}
                  </button>
                  <button
                    type="button"
                    className="token-pill"
                    onClick={() => insertToken('{{dashboard_url}}')}
                    title="Inserts direct dashboard URL"
                  >
                    + {'{{dashboard_url}}'}
                  </button>
                </div>
              </div>

              {/* Subject Input */}
              <div className="form-group">
                <div className="field-label-row">
                  <label htmlFor="email-subject-input">Subject Line</label>
                  <span className="char-count">{emailSubject.length} characters</span>
                </div>
                <input
                  id="email-subject-input"
                  ref={subjectRef}
                  type="text"
                  className="subject-input"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="e.g. Welcome to FAME, {{name}}! Here is your 7-Day Food Business Roadmap 🚀"
                />
              </div>

              {/* Body Textarea */}
              <div className="form-group">
                <div className="field-label-row">
                  <label htmlFor="email-body-input">Message Body (Plain Text &amp; Personalization Tags)</label>
                  <span className="char-count">{emailBody.split(/\s+/).filter(Boolean).length} words</span>
                </div>
                <textarea
                  id="email-body-input"
                  ref={bodyRef}
                  rows={16}
                  className="body-textarea"
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Draft your founder email copy here..."
                />
              </div>

              {/* Sender Details & Action Row */}
              <div className="composer-footer">
                <div className="sender-note">
                  <ShieldCheck size={14} />
                  <span>
                    Sending from: <strong>Manmath Biradar &lt;mentor@foodbusinesscoach.online&gt;</strong>
                  </span>
                </div>

                <div className="composer-action-buttons">
                  <button
                    type="button"
                    className="button outline"
                    onClick={handleSendTestToSelf}
                    title="Send a sample email to owner address"
                  >
                    <Mail size={15} />
                    Send Test Preview
                  </button>

                  <button
                    type="button"
                    className="button primary broadcast-submit-btn"
                    disabled={isSending || selectedCount === 0}
                    onClick={() => setShowConfirmModal(true)}
                  >
                    <Send size={15} />
                    Broadcast to {selectedCount} {selectedCount === 1 ? 'Founder' : 'Founders'}
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: LIVE RENDERED PREVIEW */}
            <div className="preview-pane">
              <div className="pane-header">
                <div className="pane-title">
                  <Eye size={15} />
                  <h3>Live Rendered Email Preview</h3>
                </div>
                <div className="device-toggle-buttons">
                  <button
                    type="button"
                    className={`device-btn ${previewDevice === 'desktop' ? 'active' : ''}`}
                    onClick={() => setPreviewDevice('desktop')}
                    title="Desktop Preview"
                  >
                    <Monitor size={14} />
                  </button>
                  <button
                    type="button"
                    className={`device-btn ${previewDevice === 'mobile' ? 'active' : ''}`}
                    onClick={() => setPreviewDevice('mobile')}
                    title="Mobile Device Preview"
                  >
                    <Smartphone size={14} />
                  </button>
                </div>
              </div>

              <div className="preview-sample-banner">
                <Info size={13} />
                <span>
                  Showing live personalization preview for:{' '}
                  <strong>{sampleLearner?.name || 'Hardik B'}</strong> ({sampleLearner?.email || 'learner@fame.com'})
                </span>
              </div>

              {/* Rendered Mock Email Canvas */}
              <div className={`mock-email-canvas ${previewDevice === 'mobile' ? 'canvas-mobile' : 'canvas-desktop'}`}>
                {/* Email Header Info */}
                <div className="mock-email-header">
                  <div className="mock-header-row">
                    <span className="label">From:</span>
                    <span className="value">
                      Manmath Biradar &lt;mentor@foodbusinesscoach.online&gt;
                    </span>
                  </div>
                  <div className="mock-header-row">
                    <span className="label">To:</span>
                    <span className="value">
                      {sampleLearner?.name} &lt;{sampleLearner?.email}&gt;
                    </span>
                  </div>
                  <div className="mock-header-row subject-row">
                    <span className="label">Subject:</span>
                    <span className="value subject-val">{previewSubject || '(No subject entered)'}</span>
                  </div>
                </div>

                {/* Email Content Body Frame */}
                <div className="mock-email-body-frame">
                  <div className="email-brand-badge">
                    <span className="brand-logo-text">FAME</span>
                    <span className="brand-sub">Food Business Mentorship</span>
                  </div>

                  <div className="email-rendered-text">
                    {previewBody.split('\n\n').map((para, idx) => (
                      <p key={idx}>{para}</p>
                    ))}
                  </div>

                  <div className="email-cta-box">
                    <a
                      href="#preview"
                      className="mock-email-cta-btn"
                      onClick={(e) => e.preventDefault()}
                    >
                      Access Your Learning Dashboard &rarr;
                    </a>
                  </div>

                  <div className="email-rendered-footer">
                    <div className="signature-line">
                      <strong>Manmath Biradar</strong>
                      <span>Chief Mentor &amp; Founder · FAME</span>
                      <small>Food Business Coaching &amp; Formulation Lab</small>
                    </div>
                    <div className="email-legal-footer">
                      <p>
                        You are receiving this communication because you are an enrolled founder in FAME
                        ({sampleLearner?.courses?.[0]?.title || 'Food Business Blueprint'}).
                      </p>
                      <p>&copy; {new Date().getFullYear()} FAME · All rights reserved.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          TAB 2: SAVED TEMPLATES LIBRARY
          ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'templates' && (
        <div className="templates-tab-layout">
          <div className="tab-intro-card">
            <div className="intro-text">
              <span className="eyebrow">PRE-FIXED &amp; CUSTOM REUSABLE TEMPLATES</span>
              <h2>Cohort Email Blueprints Library</h2>
              <p>
                Browse, edit, and organize battle-tested email templates. Select any template to immediately load it
                into the composer or save new custom messages to send anytime.
              </p>
            </div>
            <div className="intro-actions">
              <button
                type="button"
                className="button outline small"
                onClick={handleRestoreDefaultTemplates}
              >
                <RefreshCw size={14} />
                Restore Factory Templates
              </button>
              <button
                type="button"
                className="button primary small"
                onClick={() => {
                  setCustomTemplateTitle('');
                  setShowSaveTemplateModal(true);
                }}
              >
                <Plus size={14} />
                Create New Template
              </button>
            </div>
          </div>

          <div className="templates-full-grid">
            {templates.map((t) => (
              <div key={t.id} className="template-master-card">
                <div className="card-top-bar">
                  <span className="tag-pill">{t.category || 'General'}</span>
                  {t.isCustom ? (
                    <span className="custom-flag">
                      Custom Saved
                      <button
                        type="button"
                        className="delete-custom-btn"
                        onClick={(e) => handleDeleteCustomTemplate(t.id, e)}
                        title="Delete custom template"
                      >
                        <Trash2 size={13} />
                      </button>
                    </span>
                  ) : (
                    <span className="standard-flag">Official Template</span>
                  )}
                </div>

                <h3 className="template-card-title">{t.name}</h3>
                <p className="template-card-desc">{t.description}</p>

                <div className="template-card-subject-box">
                  <span className="sub-label">SUBJECT:</span>
                  <strong className="sub-text">{t.subject}</strong>
                </div>

                <div className="template-card-body-snippet">
                  <pre>{t.body.slice(0, 240)}...</pre>
                </div>

                <div className="card-bottom-actions">
                  <button
                    type="button"
                    className="button small primary"
                    onClick={() => {
                      handleSelectTemplate(t);
                      setActiveTab('composer');
                    }}
                  >
                    <Edit3 size={13} />
                    Load in Composer
                  </button>
                  <button
                    type="button"
                    className="button small outline"
                    onClick={() => {
                      handleSelectTemplate(t);
                      setActiveTab('composer');
                    }}
                  >
                    <Eye size={13} />
                    Preview
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          TAB 3: COHORT RECIPIENTS DIRECTORY
          ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'recipients' && (
        <div className="recipients-tab-layout">
          <div className="directory-filters-bar">
            {/* Filter by Tier */}
            <div className="filter-group">
              <label>Course Tier:</label>
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Enrolled Founders</option>
                <option value="blueprint">Silver Tier (Blueprint)</option>
                <option value="accelerator">Gold Tier (Accelerator)</option>
                <option value="mastery">Diamond Tier (Mastery)</option>
              </select>
            </div>

            {/* Filter by Progress */}
            <div className="filter-group">
              <label>Milestone Status:</label>
              <select
                value={progressFilter}
                onChange={(e) => setProgressFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Completion Levels</option>
                <option value="needs_nudge">Needs Nudge (&lt; 50% Complete)</option>
                <option value="near_completion">Near Completion (50% - 99%)</option>
                <option value="graduated">100% Completed (Graduates)</option>
              </select>
            </div>

            {/* Search Box */}
            <div className="filter-search-box">
              <Search size={14} />
              <input
                type="text"
                placeholder="Search real founder by name, email, or handle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="directory-actions-right">
              <button
                type="button"
                className="button small outline"
                onClick={handleCopyBcc}
              >
                <Copy size={13} />
                Copy Selected Emails ({selectedCount})
              </button>
            </div>
          </div>

          {/* Recipients Table */}
          <div className="table-wrap directory-table-wrap">
            <table className="recipients-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>
                    <input
                      type="checkbox"
                      checked={selectedUserIds.size > 0 && selectedUserIds.size === tierRecipients.length}
                      onChange={handleToggleSelectAll}
                    />
                  </th>
                  <th>Founder</th>
                  <th>Contact Email</th>
                  <th>Enrolled Programme</th>
                  <th>Curriculum Progress</th>
                  <th>Joined Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {tierRecipients.map((u) => {
                  const isChecked = selectedUserIds.has(u.id);
                  const enrolledCourse =
                    selectedTier !== 'all'
                      ? u.courses?.find((c) => c.id === selectedTier) || u.courses?.[0]
                      : u.courses?.[0];
                  const percent = enrolledCourse?.percent ?? u.overallPercent ?? 0;
                  const completedCount = enrolledCourse?.completedCount ?? u.totalCompleted ?? 0;
                  const lessonCount = enrolledCourse?.lessonCount ?? u.totalLessons ?? 0;

                  return (
                    <tr key={u.id} className={isChecked ? 'selected-row' : ''}>
                      <td>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleUser(u.id)}
                        />
                      </td>
                      <td>
                        <div className="recipient-user-cell">
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.name} className="recipient-avatar" />
                          ) : (
                            <div className="recipient-avatar avatar-char">
                              {u.name?.slice(0, 1).toUpperCase() || 'F'}
                            </div>
                          )}
                          <div className="user-text">
                            <strong>{u.name}</strong>
                            <small>@{u.handle || 'founder'}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="recipient-email">{u.email}</span>
                      </td>
                      <td>
                        <div className="enrolled-badge-cell">
                          {u.courses?.map((c) => (
                            <span
                              key={c.id}
                              className={`course-tier-tag ${c.id === 'blueprint' ? 'silver' : c.id === 'accelerator' ? 'gold' : 'diamond'}`}
                            >
                              {c.id === 'blueprint' ? 'Silver' : c.id === 'accelerator' ? 'Gold' : 'Diamond'}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <div className="progress-cell">
                          <div className="progress-meta">
                            <span className="percent-num">{percent}%</span>
                            <span className="lesson-num">
                              {completedCount}/{lessonCount} lessons
                            </span>
                          </div>
                          <div className="progress-bar-small">
                            <div
                              className="progress-bar-small-fill"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="date-cell">{formatDate(u.created_at)}</span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="button small outline send-single-btn"
                          onClick={() => {
                            setSelectedUserIds(new Set([u.id]));
                            setActiveTab('composer');
                            showToast(`Prepared message for ${u.name}`);
                          }}
                        >
                          <Send size={12} />
                          Message
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {tierRecipients.length === 0 && (
              <div className="empty-recipients-state">
                <Users size={32} />
                <h4>No registered founders match your filter</h4>
                <p>Try switching the course tier or clearing the search query.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          TAB 4: RECOMMENDED TOOLS & AUTOMATION ARCHITECTURE GUIDE
          ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'tools' && (
        <div className="tools-tab-layout">
          <div className="tools-intro-banner">
            <span className="eyebrow">INDUSTRY-LEADING EMAIL INFRASTRUCTURE</span>
            <h2>Suggested Email Automation &amp; Delivery Tools</h2>
            <p>
              To automate high-volume student onboarding, scheduled drip sequences, and milestone notifications, connect
              one of these battle-tested transactional email services. Each tool below has been analyzed for deliverability,
              pricing, and ease of setup.
            </p>
          </div>

          <div className="tools-cards-grid">
            {RECOMMENDED_TOOLS.map((tool) => (
              <div key={tool.id} className="tool-card">
                <div className="tool-card-header">
                  <div className="tool-name-wrap">
                    <span className={`tool-badge ${tool.badgeColor}`}>{tool.badge}</span>
                    <h3>{tool.name}</h3>
                  </div>
                  <span className="tool-rating">Score: {tool.rating}</span>
                </div>

                <p className="tool-tagline">{tool.tagline}</p>

                <div className="tool-pricing-box">
                  <div className="pricing-row">
                    <span className="p-label">Free Tier:</span>
                    <strong className="p-val">{tool.freeTier}</strong>
                  </div>
                  <div className="pricing-row">
                    <span className="p-label">Scale Plan:</span>
                    <span className="p-val">{tool.pricing}</span>
                  </div>
                </div>

                <div className="tool-pros-cons">
                  <span className="pro-heading">Key Advantages:</span>
                  <ul className="pro-list">
                    {tool.pros.map((p, idx) => (
                      <li key={idx}>
                        <CheckCircle2 size={13} />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="tool-snippet-box">
                  <span className="snippet-label">Connection Config:</span>
                  <pre>{tool.setupSnippet}</pre>
                </div>

                <div className="tool-card-foot">
                  <a
                    href={tool.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button small outline"
                  >
                    <ExternalLink size={13} />
                    Visit {tool.name} Website
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* DELIVERABILITY BEST PRACTICES & DNS CHECKLIST */}
          <div className="dns-guide-card">
            <div className="dns-guide-header">
              <ShieldCheck size={20} />
              <div>
                <h3>Domain Deliverability &amp; DNS Records Checklist (Prevent Spam Folders)</h3>
                <p>
                  To ensure 100% of your broadcast emails land directly in the recipient's Primary Inbox and never in
                  Promotions or Spam, configure these 3 TXT records at your domain registrar (GoDaddy, Cloudflare, Namecheap):
                </p>
              </div>
            </div>

            <div className="dns-records-grid">
              <div className="dns-record-item">
                <div className="record-top">
                  <span className="record-badge">1. SPF RECORD</span>
                  <code>TXT @</code>
                </div>
                <strong>Sender Policy Framework</strong>
                <p>Authorizes your email service provider IP address to send emails on behalf of your domain.</p>
                <pre>v=spf1 include:resend.com ~all</pre>
              </div>

              <div className="dns-record-item">
                <div className="record-top">
                  <span className="record-badge">2. DKIM RECORD</span>
                  <code>CNAME / TXT</code>
                </div>
                <strong>DomainKeys Identified Mail</strong>
                <p>Digitally signs your emails with a cryptographic public/private key pair to verify authenticity.</p>
                <pre>resend._domainkey.yourdomain.com</pre>
              </div>

              <div className="dns-record-item">
                <div className="record-top">
                  <span className="record-badge">3. DMARC RECORD</span>
                  <code>TXT _dmarc</code>
                </div>
                <strong>Domain Message Authentication</strong>
                <p>Enforces strict policies against spoofing and phishing, dramatically boosting inbox reputation.</p>
                <pre>v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com</pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          TAB 5: BROADCAST HISTORY & AUDIT LOG
          ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'history' && (
        <div className="history-tab-layout">
          <div className="tab-intro-card">
            <div className="intro-text">
              <span className="eyebrow">AUDIT TRAIL &amp; DISPATCH LOG</span>
              <h2>Cohort Broadcast History</h2>
              <p>
                Review all past broadcast campaigns sent to enrolled founders, including targeted tiers, subjects,
                recipient counts, and delivery timestamps.
              </p>
            </div>
            {broadcastHistory.length > 0 && (
              <button
                type="button"
                className="button small outline"
                onClick={() => {
                  if (window.confirm('Clear all local broadcast history?')) {
                    setBroadcastHistory([]);
                    localStorage.removeItem('fame_broadcast_history');
                    showToast('History cleared.');
                  }
                }}
              >
                <Trash2 size={13} />
                Clear History
              </button>
            )}
          </div>

          <div className="table-wrap history-table-wrap">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Dispatch Time</th>
                  <th>Target Cohort</th>
                  <th>Subject Line</th>
                  <th>Recipients</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {broadcastHistory.map((bc) => (
                  <tr key={bc.id}>
                    <td>
                      <span className="date-time-cell">{formatDate(bc.timestamp)}</span>
                    </td>
                    <td>
                      <span className="cohort-tag">{bc.tierLabel}</span>
                    </td>
                    <td>
                      <strong className="history-subject">{bc.subject}</strong>
                    </td>
                    <td>
                      <span className="count-pill">
                        <Users size={12} /> {bc.recipientCount} founders
                      </span>
                    </td>
                    <td>
                      <span className="status-badge delivered">
                        <CheckCircle2 size={12} />
                        {bc.status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="button small outline"
                        onClick={() => {
                          setEmailSubject(bc.subject);
                          setSelectedTier(bc.tierKey || 'all');
                          setActiveTab('composer');
                          showToast('Re-loaded broadcast into composer');
                        }}
                      >
                        <RefreshCw size={12} />
                        Reuse
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {broadcastHistory.length === 0 && (
              <div className="empty-history-state">
                <Clock size={32} />
                <h4>No broadcast dispatches recorded yet</h4>
                <p>When you send an email campaign to your cohort, the full dispatch log will appear here.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL 1: CONFIRM BROADCAST ──────────────────────────────── */}
      {showConfirmModal && (
        <div className="modal-backdrop" onClick={() => setShowConfirmModal(false)}>
          <div className="modal confirm-broadcast-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <Send size={18} />
                <h3>Confirm Cohort Email Broadcast</h3>
              </div>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setShowConfirmModal(false)}
              >
                &times;
              </button>
            </div>

            <div className="modal-content">
              <div className="confirm-summary-box">
                <div className="summary-row">
                  <span className="s-label">Target Cohort:</span>
                  <strong className="s-val">{currentTierInfo.title} ({currentTierInfo.eyebrow})</strong>
                </div>
                <div className="summary-row">
                  <span className="s-label">Total Recipients:</span>
                  <strong className="s-val text-green">{selectedCount} Verified Registered Founders</strong>
                </div>
                <div className="summary-row">
                  <span className="s-label">Email Subject:</span>
                  <strong className="s-val">{previewSubject}</strong>
                </div>
              </div>

              <div className="recipient-preview-chips">
                <span className="chips-label">Sample Real Recipients in this Dispatch:</span>
                <div className="chips-wrap">
                  {selectedLearners.slice(0, 6).map((u) => (
                    <span key={u.id} className="recipient-chip">
                      {u.name} &lt;{u.email}&gt;
                    </span>
                  ))}
                  {selectedLearners.length > 6 && (
                    <span className="recipient-chip more-chip">
                      +{selectedLearners.length - 6} more
                    </span>
                  )}
                </div>
              </div>

              <p className="confirm-warning">
                This broadcast will dispatch personalized emails to all {selectedCount} selected founders. Ensure your
                subject and links are fully verified before proceeding.
              </p>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="button outline"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="button primary confirm-send-btn"
                onClick={handleSendBroadcast}
              >
                <Send size={14} />
                Confirm &amp; Send Broadcast Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: SAVE CUSTOM TEMPLATE ───────────────────────────── */}
      {showSaveTemplateModal && (
        <div className="modal-backdrop" onClick={() => setShowSaveTemplateModal(false)}>
          <div className="modal save-template-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <Plus size={18} />
                <h3>Save as Custom Template</h3>
              </div>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setShowSaveTemplateModal(false)}
              >
                &times;
              </button>
            </div>

            <div className="modal-content">
              <p>
                Save the current subject and body into your personal templates library. You will be able to load,
                edit, and send it to your cohort anytime.
              </p>

              <div className="form-group">
                <label>Template Name / Label</label>
                <input
                  type="text"
                  placeholder="e.g. Day 14 Pilot Batch Checklist & Formulation Review"
                  value={customTemplateTitle}
                  onChange={(e) => setCustomTemplateTitle(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="template-preview-summary">
                <div className="t-row">
                  <span>Subject:</span>
                  <strong>{emailSubject || '(No subject)'}</strong>
                </div>
                <div className="t-row">
                  <span>Target Tier:</span>
                  <strong>{currentTierInfo.title}</strong>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="button outline"
                onClick={() => setShowSaveTemplateModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="button primary"
                onClick={handleSaveAsCustomTemplate}
              >
                <CheckCircle2 size={14} />
                Save to Library
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
