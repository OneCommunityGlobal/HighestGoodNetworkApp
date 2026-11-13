import { getEntryLaborHours, summarizeLaborHours } from './laborHours';

describe('paid task hours and rates', () => {
  it('uses an hours-weighted average for mixed hourly rates', () => {
    expect(
      summarizeLaborHours([
        { cost: 20, hoursWorked: 2, hourlyRate: 10 },
        { cost: 60, hoursWorked: 3, hourlyRate: 20 },
      ]),
    ).toMatchObject({
      hoursWorked: 5,
      hourlyRate: 16,
      rateLabel: 'Average hourly rate',
      hoursStatus: 'complete',
    });
  });
  it('derives hours or rate only when two recorded values are available', () => {
    expect(getEntryLaborHours({ cost: 100, hourlyRate: 25 })).toEqual({
      hours: 4,
      rate: 25,
      calculated: true,
    });
    expect(getEntryLaborHours({ cost: 100, hoursWorked: 5 })).toEqual({
      hours: 5,
      rate: 20,
      calculated: true,
    });
    expect(getEntryLaborHours({ cost: 100 })).toEqual({
      hours: null,
      rate: null,
      calculated: false,
    });
  });
  it('does not display partial hours as a complete total or calculate a misleading rate', () => {
    expect(summarizeLaborHours([{ cost: 100, hoursWorked: 4 }, { cost: 50 }])).toMatchObject({
      hoursWorked: null,
      hourlyRate: null,
      hoursStatus: 'incomplete',
    });
  });
  it('does not divide by zero', () => {
    expect(
      summarizeLaborHours([{ cost: 0, hoursWorked: 0, hourlyRate: 25 }]).hourlyRate,
    ).toBeNull();
  });
});
