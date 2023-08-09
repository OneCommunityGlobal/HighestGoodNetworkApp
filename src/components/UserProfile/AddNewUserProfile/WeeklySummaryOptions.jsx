import React from 'react';
import { Input, FormGroup } from 'reactstrap';

function WeeklySummaryOptions({ handleUserProfile }) {
  const summaryOptions = [
    { value: 'Required', text: 'Required' },
    { value: 'Not Required', text: 'Not Required (Slate Gray)' },
    { value: 'Team Fabulous', text: 'Team Fabulous (Fuschia)' },
    { value: 'Team Marigold', text: 'Team Marigold (Orange)' },
    { value: 'Team Luminous', text: 'Team Luminous (Yellow)' },
    { value: 'Team Lush', text: 'Team Lush (Green)' },
    { value: 'Team Sky', text: 'Team Sky (Blue)' },
    { value: 'Team Azure', text: 'Team Azure (Indigo)' },
    { value: 'Team Amethyst', text: 'Team Amethyst (Purple)' },
  ];

  return (
    <FormGroup>
      <Input
        type="select"
        name="weeklySummaryOption"
        id="weeklySummaryOption"
        defaultValue="Required"
        onChange={handleUserProfile}
      >
        {summaryOptions.map(({ value, text }) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
      </Input>
    </FormGroup>
  );
}

export default WeeklySummaryOptions;
