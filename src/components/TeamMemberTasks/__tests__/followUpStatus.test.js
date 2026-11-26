import {
  getFollowUpStage,
  getFollowUpUpdate,
  getTaskProgress,
  needsFollowUp,
} from '../followUpStatus';

const checkedAt = percentage => ({
  followUpCheck: true,
  followUpPercentageDeadline: percentage,
});

describe('getTaskProgress', () => {
  it('returns the logged hours as a percentage of the estimate', () => {
    expect(getTaskProgress(41.2, 60)).toBe(68.67);
  });

  it('treats a missing estimate as 100% once any time is logged', () => {
    expect(getTaskProgress(3, 0)).toBe(100);
    expect(getTaskProgress(0, 0)).toBe(0);
    expect(getTaskProgress(undefined, undefined)).toBe(0);
  });
});

describe('getFollowUpStage', () => {
  it.each([
    [0, 0],
    [50, 0],
    [50.01, 1],
    [75, 1],
    [80, 2],
    [90, 2],
    [91, 3],
    [250, 3],
  ])('progress %s is stage %s', (progress, stage) => {
    expect(getFollowUpStage(progress)).toBe(stage);
  });
});

describe('needsFollowUp', () => {
  it('never needs a follow-up at or under 50%', () => {
    expect(needsFollowUp(50, undefined)).toBe(false);
    expect(needsFollowUp(30, { followUpCheck: false, followUpPercentageDeadline: 20 })).toBe(false);
  });

  it('needs a follow-up over 50% when nobody has checked the box', () => {
    expect(needsFollowUp(68.67, undefined)).toBe(true);
  });

  it('needs a follow-up when the box was unchecked over 50%', () => {
    // Task 1620 case: a record exists but is unchecked, so the box must be red, not green.
    expect(needsFollowUp(68.67, { followUpCheck: false, followUpPercentageDeadline: 60 })).toBe(
      true,
    );
    expect(needsFollowUp(95, { followUpCheck: false, followUpPercentageDeadline: 92 })).toBe(true);
  });

  it('stays checked until the next threshold is passed', () => {
    expect(needsFollowUp(74, checkedAt(55))).toBe(false);
    expect(needsFollowUp(76, checkedAt(55))).toBe(true);
    expect(needsFollowUp(89, checkedAt(80))).toBe(false);
    expect(needsFollowUp(91, checkedAt(80))).toBe(true);
  });

  it('counts a follow-up made exactly at a threshold for that threshold', () => {
    expect(needsFollowUp(63, checkedAt(50))).toBe(false);
    expect(needsFollowUp(80, checkedAt(75))).toBe(false);
    expect(needsFollowUp(90, checkedAt(90))).toBe(false);
    expect(needsFollowUp(90.5, checkedAt(90))).toBe(true);
  });

  it('needs a follow-up when a box checked under 50% passes 50%', () => {
    expect(needsFollowUp(51, checkedAt(30))).toBe(true);
  });

  it('needs a follow-up when more time is logged after a check over 90%', () => {
    // Tasks 1545 and 1581: checked after 90%, then more hours were logged.
    expect(needsFollowUp(95, checkedAt(95))).toBe(false);
    expect(needsFollowUp(108.43, checkedAt(95))).toBe(true);
    expect(needsFollowUp(250, checkedAt(100))).toBe(true);
  });

  it('handles a stored percentage that is missing or not a number', () => {
    expect(needsFollowUp(60, { followUpCheck: true })).toBe(true);
    expect(needsFollowUp(60, { followUpCheck: true, followUpPercentageDeadline: 'x' })).toBe(true);
  });
});

describe('getFollowUpUpdate', () => {
  it('checks the box and saves the accepted percentage', () => {
    expect(getFollowUpUpdate(60, false, true)).toEqual({
      followUpCheck: true,
      followUpPercentageDeadline: 60,
      acceptedPercentage: 60,
    });
  });

  it('keeps the accepted percentage when a red box that was checked before is checked again', () => {
    expect(getFollowUpUpdate(80, true, true)).toEqual({
      followUpCheck: true,
      followUpPercentageDeadline: 80,
      acceptedPercentage: 80,
    });
  });

  it('unchecks a green checked box and clears the accepted percentage', () => {
    expect(getFollowUpUpdate(60, true, false)).toEqual({
      followUpCheck: false,
      followUpPercentageDeadline: 60,
      acceptedPercentage: 0,
    });
  });

  it('checks an unchecked box under 50%', () => {
    expect(getFollowUpUpdate(20, false, false).followUpCheck).toBe(true);
  });
});
