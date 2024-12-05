import React, { useEffect, useRef } from "react";
import Header from "../components/Header";
import Banner from "../components/Banner";
import QuestionnaireHeader from "../components/QuestionnaireHeader";
import FollowupQuestions from "../components/FollowupQuestions";
import Progress from "../components/Progress";
import { useFormContext } from "../components/FormContext";

const Page5 = () => {
  const { formData } = useFormContext();
  console.log("Form Data Gathered: ", formData);

  const headerRef = useRef(null);

  useEffect(() => {
    if (headerRef.current) {
      headerRef.current.scrollIntoView({ behavior: "auto", block: "start" });
    }
  }, []);

  return (
    <div className="App">
      <Header />
      <Banner />
      <QuestionnaireHeader ref={headerRef} />
      <FollowupQuestions />
      <Progress progressValue={16.67 * 5} />
    </div>
  );
};

export default Page5;
