import React, { useEffect, useRef } from "react";
import Header from "../components/Header";
import Banner from "../components/Banner";
import Progress from "../components/Progress";
import QuestionnaireHeader from "../components/QuestionnaireHeader";
import GeneralQuestions from "../components/GeneralQuestions";
import { useFormContext } from "../components/FormContext";

const Page2 = () => {
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
      <GeneralQuestions />
      <Progress progressValue={16.67 * 2} />
    </div>
  );
};

export default Page2;
