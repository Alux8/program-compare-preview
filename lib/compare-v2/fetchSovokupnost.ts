/**
 * Fetch слой для Program Compare V2
 *
 * Источник данных:
 * https://www.ranepa.ru/sync/getSovokupnost3.php
 *
 * Алгоритм:
 *  - грузим page=1
 *  - читаем countPages
 *  - догружаем все страницы
 *  - объединяем bakalavriat + specialitet
 *  - дедупликация по Program.Code
 *
 * НИКАКОЙ нормализации под UI здесь нет.
 * Это только получение сырья.
 */

export type SovokupnostResponse = {
  countPages: number | string;
  PROGRAMS: RawProgram[];
};

export type RawProgram = {
  Program?: {
    Code?: string;
    Title?: string;
    Name?: string;
    Link?: string;
  };
  [key: string]: any;
};

type Level = "bakalavriat" | "specialitet";

/**
 * Загружает одну страницу одного уровня
 */
async function fetchPage(
  level: Level,
  page: number
): Promise<SovokupnostResponse> {
  const url = `https://www.ranepa.ru/sync/getSovokupnost3.php?level=${level}&page=${page}`;

  const res = await fetch(url, {
    // server-side fetch (Next.js)
    next: { revalidate: 3600 }, // 1 час, можно менять
  });

  if (!res.ok) {
    throw new Error(
      `Failed to fetch getSovokupnost3: level=${level}, page=${page}`
    );
  }

  return res.json();
}

/**
 * Загружает ВСЕ страницы для одного уровня
 */
async function fetchLevelAllPages(level: Level): Promise<RawProgram[]> {
  const firstPage = await fetchPage(level, 1);

  const countPages = Number(firstPage.countPages) || 1;

  const programs: RawProgram[] = [
    ...(firstPage.PROGRAMS ?? []),
  ];

  for (let page = 2; page <= countPages; page++) {
    const nextPage = await fetchPage(level, page);
    programs.push(...(nextPage.PROGRAMS ?? []));
  }

  return programs;
}

/**
 * Главная функция V2:
 *  - загружает бакалавриат + специалитет
 *  - объединяет
 *  - дедуплицирует по Program.Code
 */
export async function fetchAllPrograms(): Promise<RawProgram[]> {
  const bakalavriat = await fetchLevelAllPages("bakalavriat");
  const specialitet = await fetchLevelAllPages("specialitet");

  const all = [...bakalavriat, ...specialitet];

  const map = new Map<string, RawProgram>();

  for (const item of all) {
    const code = item?.Program?.Code;

    if (!code) continue;

    // первое вхождение побеждает
    if (!map.has(code)) {
      map.set(code, item);
    }
  }

  return Array.from(map.values());
}
