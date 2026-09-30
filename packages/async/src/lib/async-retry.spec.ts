import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import {
  retry,
  createRetry,
  withRetry,
  retryAll,
  retryRace,
  retryAllSettled,
  TimeoutError,
} from './async-retry.js';

describe('async-retry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('retry', () => {
    it('should return result on first successful attempt', async () => {
      const fn = vi.fn().mockResolvedValue('success');
      const result = await retry(fn);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith(0, expect.any(AbortSignal));
    });

    it('should retry on failure and eventually succeed', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('fail 1'))
        .mockRejectedValueOnce(new Error('fail 2'))
        .mockResolvedValue('success');

      const promise = retry(fn, { retries: 3, delay: 100 });

      await vi.advanceTimersByTimeAsync(0);
      expect(fn).toHaveBeenCalledTimes(1);

      await vi.advanceTimersByTimeAsync(100);
      expect(fn).toHaveBeenCalledTimes(2);

      await vi.advanceTimersByTimeAsync(200);
      expect(fn).toHaveBeenCalledTimes(3);

      const result = await promise;
      expect(result).toBe('success');
    });

    it('hands onRetry and shouldRetry an Error for a thrown string, and rethrows the string itself', async () => {
      const onRetry = vi.fn();
      const shouldRetry = vi.fn().mockReturnValue(true);
      const promise = retry(() => Promise.reject('offline'), { retries: 1, delay: 10, onRetry, shouldRetry });
      const settled = expect(promise).rejects.toBe('offline');

      await vi.runAllTimersAsync();
      await settled;

      expect(shouldRetry.mock.calls[0][0]).toBeInstanceOf(Error);
      expect(onRetry.mock.calls[0][0]).toMatchObject({ message: 'offline' });
    });

    it('should provide attempt number to function', async () => {
      const fn = vi.fn((attempt: number) => {
        if (attempt < 2) throw new Error('fail');
        return Promise.resolve(`success on attempt ${attempt}`);
      });

      const promise = retry(fn, { retries: 3, delay: 100 });

      await vi.advanceTimersByTimeAsync(0);
      await vi.advanceTimersByTimeAsync(100);
      await vi.advanceTimersByTimeAsync(200);

      const result = await promise;
      expect(result).toBe('success on attempt 2');
      expect(fn).toHaveBeenCalledWith(0, expect.any(AbortSignal));
      expect(fn).toHaveBeenCalledWith(1, expect.any(AbortSignal));
      expect(fn).toHaveBeenCalledWith(2, expect.any(AbortSignal));
    });
  });

  describe('createRetry', () => {
    it('should create a reusable retry function with default options', async () => {
      const retryWithDefaults = createRetry({ retries: 2, delay: 50 });

      const fn1 = vi
        .fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('success1');

      const fn2 = vi
        .fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('success2');

      const promise1 = retryWithDefaults(fn1);
      const promise2 = retryWithDefaults(fn2);

      await vi.advanceTimersByTimeAsync(50);

      const [result1, result2] = await Promise.all([promise1, promise2]);
      expect(result1).toBe('success1');
      expect(result2).toBe('success2');
    });

    it('should allow overriding default options', async () => {
      const retryWithDefaults = createRetry({ retries: 2, delay: 100 });

      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('success');

      const promise = retryWithDefaults(fn, { delay: 50 });

      await vi.advanceTimersByTimeAsync(50);

      const result = await promise;
      expect(result).toBe('success');
    });
  });

  describe('withRetry', () => {
    it('should wrap a function to automatically retry', async () => {
      const originalFn = vi
        .fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('success');

      const wrappedFn = withRetry(originalFn, { retries: 2, delay: 50 });

      const promise = wrappedFn();
      await vi.advanceTimersByTimeAsync(50);

      const result = await promise;
      expect(result).toBe('success');
      expect(originalFn).toHaveBeenCalledTimes(2);
    });

    it('should preserve function parameters', async () => {
      const originalFn = vi.fn(async (a: number, b: string) => `${a}-${b}`);
      const wrappedFn = withRetry(originalFn);

      const result = await wrappedFn(42, 'test');
      expect(result).toBe('42-test');
      expect(originalFn).toHaveBeenCalledWith(42, 'test');
    });
  });

  describe('retryAll', () => {
    it('should retry all functions and return all results', async () => {
      const fn1 = vi
        .fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('result1');

      const fn2 = vi
        .fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('result2');

      const fn3 = vi.fn().mockResolvedValue('result3');

      const promise = retryAll([fn1, fn2, fn3], { retries: 2, delay: 50 });

      await vi.advanceTimersByTimeAsync(50);

      const results = await promise;
      expect(results).toEqual(['result1', 'result2', 'result3']);
    });
  });

  describe('retryRace', () => {
    it('should return the first successful result', async () => {
      const fn1 = vi.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, 200));
        return 'slow';
      });

      const fn2 = vi.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return 'fast';
      });

      const promise = retryRace([fn1, fn2]);

      await vi.advanceTimersByTimeAsync(100);

      const result = await promise;
      expect(result).toBe('fast');
    });

    it('should retry failed functions in race', async () => {
      const fn1 = vi
        .fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockImplementation(async () => {
          await new Promise((resolve) => setTimeout(resolve, 100));
          return 'retry-success';
        });

      const fn2 = vi.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, 200));
        return 'slow';
      });

      const promise = retryRace([fn1, fn2], { retries: 2, delay: 50 });

      await vi.advanceTimersByTimeAsync(50); // retry delay
      await vi.advanceTimersByTimeAsync(100); // fn1 completes

      const result = await promise;
      expect(result).toBe('retry-success');
    });

    it('waits past a task that fails for good and resolves with the first success', async () => {
      const fastFail = vi.fn().mockRejectedValue(new Error('fast fail'));
      const slowOk = vi.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return 'ok';
      });

      const promise = retryRace([fastFail, slowOk], { retries: 0 });
      await vi.advanceTimersByTimeAsync(50);

      await expect(promise).resolves.toBe('ok');
    });

    it('rejects with every error once all tasks fail', async () => {
      const promise = retryRace([() => Promise.reject(new Error('a')), () => Promise.reject(new Error('b'))], {
        retries: 0,
      });

      await expect(promise).rejects.toBeInstanceOf(AggregateError);
      await expect(promise).rejects.toMatchObject({ errors: [new Error('a'), new Error('b')] });
    });
  });

  describe('timeout', () => {
    it('fails an attempt that runs too long with a TimeoutError, aborts its signal, and retries', async () => {
      const signals: AbortSignal[] = [];
      const task = vi.fn((attempt: number, signal: AbortSignal) => {
        signals.push(signal);
        return attempt === 0 ? new Promise<string>(() => undefined) : Promise.resolve('second try');
      });

      const promise = retry(task, { timeout: 100, delay: 10 });
      await vi.advanceTimersByTimeAsync(110);

      await expect(promise).resolves.toBe('second try');
      expect(signals[0]?.aborted).toBe(true);
      expect(signals[0]?.reason).toBeInstanceOf(TimeoutError);
      expect(signals[1]?.aborted).toBe(false);
      expect(vi.getTimerCount()).toBe(0);
    });

    it('rejects with the TimeoutError after the last attempt', async () => {
      const promise = retry(() => new Promise<never>(() => undefined), { timeout: 100, retries: 1, delay: 10 });
      const settled = expect(promise).rejects.toThrow(new TimeoutError('The attempt took longer than 100 ms'));

      await vi.advanceTimersByTimeAsync(210);
      await settled;
    });
  });

  describe('signal', () => {
    it('hands the task a signal that aborts with the one given', async () => {
      const controller = new AbortController();
      let seen: AbortSignal | undefined;
      const promise = retry(
        (_attempt, signal) => {
          seen = signal;
          return new Promise<never>(() => undefined);
        },
        { signal: controller.signal }
      );
      const settled = expect(promise).rejects.toBe('left the page');

      controller.abort('left the page');

      await settled;
      expect(seen?.aborted).toBe(true);
    });

    it('stops waiting between attempts once aborted, and makes no more attempts', async () => {
      const controller = new AbortController();
      const task = vi.fn().mockRejectedValue(new Error('offline'));
      const promise = retry(task, { signal: controller.signal, delay: 1000 });
      const settled = expect(promise).rejects.toBe('a newer login');

      await vi.advanceTimersByTimeAsync(10);
      controller.abort('a newer login');
      await settled;
      await vi.advanceTimersByTimeAsync(10_000);

      expect(task).toHaveBeenCalledTimes(1);
      expect(vi.getTimerCount()).toBe(0);
    });

    it('makes no attempt with a signal already aborted', async () => {
      const task = vi.fn().mockResolvedValue('never');

      await expect(retry(task, { signal: AbortSignal.abort('too late') })).rejects.toBe('too late');
      expect(task).not.toHaveBeenCalled();
    });
  });

  describe('retryAllSettled', () => {
    it('should retry before settling', async () => {
      const fn1 = vi
        .fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('retry-success');

      const fn2 = vi.fn().mockRejectedValue(new Error('persistent-fail'));

      const promise = retryAllSettled([fn1, fn2], { retries: 1, delay: 50 });

      await vi.advanceTimersByTimeAsync(50);

      const results = await promise;
      expect(results[0]).toEqual({
        status: 'fulfilled',
        value: 'retry-success',
      });
      expect(results[1]).toEqual({
        status: 'rejected',
        reason: expect.objectContaining({ message: 'persistent-fail' }),
      });
    });
  });

  describe('TimeoutError', () => {
    it('should have correct properties', () => {
      const error = new TimeoutError('Custom message');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(TimeoutError);
      expect(error.message).toBe('Custom message');
      expect(error.name).toBe('TimeoutError');
      expect(error.code).toBe('TIMEOUT');
    });

    it('should have default message', () => {
      const error = new TimeoutError();
      expect(error.message).toBe('The attempt took too long');
    });
  });
});
