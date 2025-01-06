import React, { useEffect, useRef } from "react";
import Header from "../components/Header";
import Banner from "../components/Banner";
import QuestionnaireHeader from "../components/QuestionnaireHeader";
import BackendQuestions from "../components/BackendQuestions";
import Progress from "../components/Progress";
import { useFormContext } from "../components/FormContext";

const Page4 = () => {
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
      <BackendQuestions />
      <Progress progressValue={16.67 * 4} />
    </div>
  );
};

export default Page4;
