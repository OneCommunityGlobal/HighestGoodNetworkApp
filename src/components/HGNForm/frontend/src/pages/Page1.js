import React, { useEffect } from "react";
import Header from "../components/Header";
import Banner from "../components/Banner";
import QuestionnaireInfo from "../components/QuestionnaireInfo";
import InfoForm from "../components/InfoForm";
import Progress from "../components/Progress";
import { useFormContext } from "../components/FormContext";

const Page1 = () => {
  const { formData } = useFormContext();
  console.log("Form Data Gathered: ", formData);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="App">
      <Header />
      <Banner />
      <QuestionnaireInfo />
      <InfoForm />
      <Progress progressValue={16.67 * 1} />
    </div>
  );
};

export default Page1;
