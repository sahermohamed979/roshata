// مدة صلاحية الجلسة والتوكين: 30 يوماً (شهر كامل) لتجنب تسجيل الخروج المفاجئ في العيادة
export const sessionMaxAge =
  Number(process.env.NEXTAUTH_SESSION_MAX_AGE) || (30 * 24 * 60 * 60); // 2,592,000 ثانية = 30 يوم
 