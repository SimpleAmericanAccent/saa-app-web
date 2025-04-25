export const setCookie = (name, value, days = 7) => {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
};

export const getCookie = (name) => {
  const cookies = document.cookie.split(";");
  const cookie = cookies.find((c) => c.trim().startsWith(`${name}=`));
  return cookie ? cookie.split("=")[1] : null;
};
