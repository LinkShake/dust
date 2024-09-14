const cookieOpts = {
  httpOnly: true,
  secure: false,
  sameSite: "lax",
  path: "/",
  domain: "",
  maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 year
} as const;
