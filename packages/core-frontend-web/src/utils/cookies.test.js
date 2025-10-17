import { setCookie, getCookie } from "./cookies.js";

// Mock document.cookie
let mockCookieValue = "";

Object.defineProperty(document, "cookie", {
  get: () => mockCookieValue,
  set: (value) => {
    mockCookieValue = value;
  },
  configurable: true,
});

describe("Cookie utilities", () => {
  beforeEach(() => {
    // Reset document.cookie before each test
    mockCookieValue = "";
  });

  describe("setCookie", () => {
    it("should set a cookie with default 7 days expiration", () => {
      setCookie("testCookie", "testValue");

      expect(document.cookie).toContain("testCookie=testValue");
      expect(document.cookie).toContain("expires=");
      expect(document.cookie).toContain("path=/");
    });

    it("should set a cookie with custom expiration days", () => {
      setCookie("testCookie", "testValue", 30);

      expect(document.cookie).toContain("testCookie=testValue");
      expect(document.cookie).toContain("expires=");
      expect(document.cookie).toContain("path=/");
    });

    it("should handle special characters in cookie value", () => {
      setCookie("special", "value with spaces & symbols!");

      expect(document.cookie).toContain("special=value with spaces & symbols!");
    });
  });

  describe("getCookie", () => {
    it("should return cookie value when cookie exists", () => {
      mockCookieValue = "testCookie=testValue; otherCookie=otherValue";

      const result = getCookie("testCookie");

      expect(result).toBe("testValue");
    });

    it("should return null when cookie does not exist", () => {
      mockCookieValue = "otherCookie=otherValue";

      const result = getCookie("nonexistent");

      expect(result).toBeNull();
    });

    it("should return null when no cookies exist", () => {
      mockCookieValue = "";

      const result = getCookie("anyCookie");

      expect(result).toBeNull();
    });

    it("should handle cookies with spaces around them", () => {
      mockCookieValue = " testCookie=testValue ; otherCookie=otherValue";

      const result = getCookie("testCookie");

      expect(result).toBe("testValue ");
    });

    it("should return the first match when multiple cookies have similar names", () => {
      mockCookieValue = "testCookie=firstValue; testCookieExtra=secondValue";

      const result = getCookie("testCookie");

      expect(result).toBe("firstValue");
    });
  });
});
