import { describe, it, expect } from 'vitest';
import { decideChallengeWinner, CHALLENGE_EXPIRY_DAYS } from '@/lib/challenge-utils';

describe('Unit Tests: Challenge winner logic (dost ko challenge)', () => {
  it('dono me se koi attempt na de to faisla pending rehta hai', () => {
    expect(decideChallengeWinner(null, null)).toEqual({
      outcome: 'AWAITING_ATTEMPTS',
      winnerSide: null,
    });
  });

  it('sirf ek ne attempt diya to bhi pending rehta hai (fake 0 se jeet nahi)', () => {
    expect(decideChallengeWinner(80, null).outcome).toBe('AWAITING_ATTEMPTS');
    expect(decideChallengeWinner(null, 70).outcome).toBe('AWAITING_ATTEMPTS');
  });

  it('zyada score wala challenger jeetta hai', () => {
    expect(decideChallengeWinner(85, 70)).toEqual({
      outcome: 'CHALLENGER_WIN',
      winnerSide: 'challenger',
    });
  });

  it('zyada score wala opponent jeetta hai', () => {
    expect(decideChallengeWinner(60, 92.5)).toEqual({
      outcome: 'OPPONENT_WIN',
      winnerSide: 'opponent',
    });
  });

  it('barabar score par TIE hota hai (koi jabardasti winner nahi)', () => {
    expect(decideChallengeWinner(75, 75)).toEqual({
      outcome: 'TIE',
      winnerSide: null,
    });
  });

  it('challenge expiry 7 din hai', () => {
    expect(CHALLENGE_EXPIRY_DAYS).toBe(7);
  });
});
