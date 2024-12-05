import React, { useEffect } from "react";
import Header from "../components/Header";
import Banner from "../components/Banner";
import ThankYou from "../components/ThankYou";
import Progress from "../components/Progress";

const Page6 = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="App">
      <Header />
      <Banner />
      <ThankYou />
      <Progress progressValue={100} />
    </div>
  );
};

export default Page6;
