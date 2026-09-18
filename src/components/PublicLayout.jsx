import { Header } from './Header';
import { Footer } from './Footer';

export function PublicLayout({ children }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
