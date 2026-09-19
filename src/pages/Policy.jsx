import { Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PublicLayout } from '../components/PublicLayout';
import { Notice, Loader } from '../components/shared';
import { useLoad } from '../hooks/useLoad';

const TITLES = {
  terms: 'Terms of use',
  privacy: 'Privacy policy',
  refunds: 'Refund policy',
  contact: 'Contact & support',
};

const DEFAULT_POLICIES = {
  terms: `Welcome to FAME (Future Ready Agro Food Entrepreneurship Community). By accessing our programmes, masterclasses, and resources, you agree to these Terms of Use.

All learning materials, templates, video lessons, and frameworks are provided for educational and business development purposes. Enrolled participants receive a personal, non-transferable license to access the content.

FAME provides strategic business frameworks and mentorship. Individual business success depends on founder execution, market conditions, product quality, and regulatory compliance.`,
  privacy: `At FAME, we respect and safeguard the privacy of our students, partners, and community members.

We collect your name, email address, and transaction identifiers solely to administer your account, deliver course materials, and send critical programme notifications.

We do not sell, rent, or trade personal data to third parties. All sensitive account data is secured using modern encryption standards.`,
  refunds: `FAME programmes provide immediate access to proprietary masterclasses, financial models, vendor frameworks, and actionable templates.

Due to the digital nature of the content and immediate delivery upon enrolment, course fees are generally non-refundable once access is granted.

If you encounter technical access issues or were billed in error, please contact our support team within 48 hours for swift resolution.`,
};

export function Policy({ kind }) {
  const { data: s, loading } = useLoad('/site');
  const title = TITLES[kind];
  const content = s?.[kind]?.trim() || DEFAULT_POLICIES[kind] || '';

  return (
    <PublicLayout>
      <main id="main" className="wrap section policy-page">
        <span className="eyebrow">FAME · OFFICIAL POLICIES</span>
        <h1>{title}</h1>
        {loading ? (
          <Loader />
        ) : kind === 'contact' ? (
          <>
            <p>For programme questions, enrolment support or account help, contact FAME.</p>
            {s?.support_email ? (
              <a className="button" href={`mailto:${s.support_email}`}>
                <Mail size={18} />
                {s.support_email}
              </a>
            ) : (
              <p>
                Email us directly at <strong>support@famecommunity.in</strong> or through your student dashboard.
              </p>
            )}
            {s?.business_address && (
              <p>
                {s.business_name}
                <br />
                {s.business_address}
              </p>
            )}
          </>
        ) : (
          <div className="lesson-copy">
            {content.split('\n\n').map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        )}
      </main>
    </PublicLayout>
  );
}
