const BADGE_URL = 'https://visitor-badge.laobi.icu/badge?page_id=alif416.interview-mastery-questions&left_text=Visitors';

export default function Footer() {
  return (
    <footer className="site-footer">
      <span>Interview Mastery</span>
      <img src={BADGE_URL} alt="Visitor count" className="visitor-badge" />
    </footer>
  );
}
