import { useEffect } from 'react';
import Banner from '../questionpages/Banner';
import ThankYou from '../questionpages/ThankYou';
import Progress from '../questionpages/Progress';

function Page6() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="hgnform">
      <Banner />
      <ThankYou />
      <Progress progressValue={100} />
    </div>
  );
}

export default Page6;
