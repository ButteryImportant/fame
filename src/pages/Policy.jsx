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

export function Policy({ kind }) {
  const { data: s, loading } = useLoad('/site');
  const title = TITLES[kind];

  return (
    <PublicLayout>
      <main id="main" className="wrap section policy-page">
        <span className="eyebrow">FAME · HERE TO HELP</span>
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
              <Notice type="info">
                The public support address will be available when enrolment opens.
              </Notice>
            )}
            {s?.business_address && (
              <p>
                {s.business_name}
                <br />
                {s.business_address}
              </p>
            )}
          </>
        ) : s?.[kind] ? (
          <div className="lesson-copy">
            {s[kind]
              .split('\n\n')
              .map((p, i) => (
                <p key={i}>{p}</p>
              ))}
          </div>
        ) : (
          <>
            <Notice type="info">
              This preview is not accepting live purchases. The final {title.toLowerCase()} will be
              published before enrolment opens.
            </Notice>
            <p>
              Demo checkout does not charge money. During local testing, account information and
              learning progress are stored by this installation.
            </p>
          </>
        )}
      </main>
    </PublicLayout>
  );
}
