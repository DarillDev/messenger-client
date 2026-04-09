import { TestBed } from '@angular/core/testing';

import { ErrorTextPipe } from './error-text.pipe';
import { provideUiKitErrorMessages } from '../../tokens/error-messages.token';

describe('ErrorTextPipe', () => {
  let pipe: ErrorTextPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ErrorTextPipe],
    });

    pipe = TestBed.inject(ErrorTextPipe);
  });

  it('should return empty string for null errors', () => {
    expect(pipe.transform(null)).toBe('');
  });

  it('should resolve from default map', () => {
    expect(pipe.transform({ required: true })).toBe('Required field');
  });

  it('should fall back to error key when not in map', () => {
    expect(pipe.transform({ unknownError: true })).toBe('unknownError');
  });

  it('should prefer override map over default', () => {
    const override = { required: 'Custom required text' };

    expect(pipe.transform({ required: true }, override)).toBe('Custom required text');
  });

  it('should fall back to default map when key not in override', () => {
    const override = { other: 'Other text' };

    expect(pipe.transform({ required: true }, override)).toBe('Required field');
  });

  describe('with patched provider', () => {
    beforeEach(() => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [provideUiKitErrorMessages({ customKey: 'Custom error text' }), ErrorTextPipe],
      });

      pipe = TestBed.inject(ErrorTextPipe);
    });

    it('should resolve custom key from patched map', () => {
      expect(pipe.transform({ customKey: true })).toBe('Custom error text');
    });

    it('should still resolve default keys', () => {
      expect(pipe.transform({ required: true })).toBe('Required field');
    });
  });
});
