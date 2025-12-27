import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import {
  COLORS,
  RED, YELLOW, CYAN, GREEN, ORANGE, RESET, BOLD,
  VALID_MODES,
  STATE_FILE,
  UPDATE_CHECK_FILE,
  UPDATE_CHECK_INTERVAL,
  VALID_COMMANDS,
  DANGEROUS_CHARS_PATTERN,
  TIMEOUTS,
  MAX_TRAVERSAL_DEPTH,
  ErrorSeverity,
  logError,
  handleFatalError
} from '../lib/constants.js';
import os from 'os';
import path from 'path';

describe('constants', () => {
  describe('COLORS', () => {
    it('should export all color codes', () => {
      expect(COLORS.RED).toBe('\x1b[31m');
      expect(COLORS.YELLOW).toBe('\x1b[33m');
      expect(COLORS.CYAN).toBe('\x1b[36m');
      expect(COLORS.GREEN).toBe('\x1b[32m');
      expect(COLORS.ORANGE).toBe('\x1b[38;5;208m');
      expect(COLORS.RESET).toBe('\x1b[0m');
      expect(COLORS.BOLD).toBe('\x1b[1m');
    });

    it('should export destructured color constants', () => {
      expect(RED).toBe(COLORS.RED);
      expect(YELLOW).toBe(COLORS.YELLOW);
      expect(CYAN).toBe(COLORS.CYAN);
      expect(GREEN).toBe(COLORS.GREEN);
      expect(ORANGE).toBe(COLORS.ORANGE);
      expect(RESET).toBe(COLORS.RESET);
      expect(BOLD).toBe(COLORS.BOLD);
    });
  });

  describe('VALID_MODES', () => {
    it('should contain yolo and safe modes', () => {
      expect(VALID_MODES).toContain('yolo');
      expect(VALID_MODES).toContain('safe');
      expect(VALID_MODES).toHaveLength(2);
    });
  });

  describe('STATE_FILE', () => {
    it('should be in home directory', () => {
      expect(STATE_FILE).toBe(path.join(os.homedir(), '.claude_yolo_state'));
    });
  });

  describe('UPDATE_CHECK_FILE', () => {
    it('should be in home directory', () => {
      expect(UPDATE_CHECK_FILE).toBe(path.join(os.homedir(), '.claude_yolo_last_update_check'));
    });
  });

  describe('UPDATE_CHECK_INTERVAL', () => {
    it('should be 24 hours in milliseconds', () => {
      expect(UPDATE_CHECK_INTERVAL).toBe(24 * 60 * 60 * 1000);
    });
  });

  describe('VALID_COMMANDS', () => {
    it('should contain all valid cl commands', () => {
      expect(VALID_COMMANDS).toContain('/YON');
      expect(VALID_COMMANDS).toContain('/YOFF');
      expect(VALID_COMMANDS).toContain('/STATUS');
      expect(VALID_COMMANDS).toContain('/HELP');
      expect(VALID_COMMANDS).toContain('/H');
      expect(VALID_COMMANDS).toContain('/?');
    });
  });

  describe('DANGEROUS_CHARS_PATTERN', () => {
    it('should match dangerous shell characters', () => {
      expect(DANGEROUS_CHARS_PATTERN.test(';')).toBe(true);
      expect(DANGEROUS_CHARS_PATTERN.test('&')).toBe(true);
      expect(DANGEROUS_CHARS_PATTERN.test('|')).toBe(true);
      expect(DANGEROUS_CHARS_PATTERN.test('`')).toBe(true);
      expect(DANGEROUS_CHARS_PATTERN.test('$')).toBe(true);
      expect(DANGEROUS_CHARS_PATTERN.test('>')).toBe(true);
      expect(DANGEROUS_CHARS_PATTERN.test('<')).toBe(true);
    });

    it('should not match safe characters', () => {
      expect(DANGEROUS_CHARS_PATTERN.test('hello')).toBe(false);
      expect(DANGEROUS_CHARS_PATTERN.test('file.txt')).toBe(false);
      expect(DANGEROUS_CHARS_PATTERN.test('path/to/file')).toBe(false);
    });
  });

  describe('TIMEOUTS', () => {
    it('should have reasonable timeout values', () => {
      expect(TIMEOUTS.NPM_VIEW).toBe(30000);
      expect(TIMEOUTS.NPM_INSTALL).toBe(300000);
      expect(TIMEOUTS.NPM_ROOT).toBe(10000);
      expect(TIMEOUTS.DEFAULT).toBe(120000);
    });
  });

  describe('MAX_TRAVERSAL_DEPTH', () => {
    it('should be a reasonable depth limit', () => {
      expect(MAX_TRAVERSAL_DEPTH).toBe(10);
    });
  });

  describe('ErrorSeverity', () => {
    it('should have all severity levels', () => {
      expect(ErrorSeverity.FATAL).toBe('fatal');
      expect(ErrorSeverity.ERROR).toBe('error');
      expect(ErrorSeverity.WARNING).toBe('warning');
      expect(ErrorSeverity.DEBUG).toBe('debug');
    });
  });

  describe('logError', () => {
    let consoleSpy;
    let consoleErrorSpy;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
      consoleSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('should log errors to stderr', () => {
      logError('test error');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should log warnings to stderr', () => {
      logError('test warning', ErrorSeverity.WARNING);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });
});
