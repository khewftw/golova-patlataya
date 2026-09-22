export const SITE = {
  title: "Молодёжь мира",
  fullTitle: "Молодёжь мира: 1940–1950",
  period: "1940 — 1950",
  snapshotDate: "1950-01-01",
  snapshotLabel: "политическая карта около 1 января 1950 года",
  storiesCount: 30,
  author: "Печенкина Ксения Витальевна",
  credit: "Проект Печенкиной Ксении Витальевны, 2026.",
  year: 2026,
  description:
    "Интерактивный исторический атлас молодёжных движений и организаций примерно 1940–1950 годов.",
} as const;

export const CSHAPES_ATTRIBUTION = {
  name: "CShapes 2.0",
  license: "CC BY-NC-SA",
  licenseUrl: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
  url: "https://icr.ethz.ch/data/cshapes/",
  citation:
    "Schvitz, Guy, Seraina Rüegger, Luc Girardin, Lars-Erik Cederman, Nils Weidmann and Kristian Skrede Gleditsch. 2022. “Mapping the International System, 1886–2019: The CShapes 2.0 Dataset.” Journal of Conflict Resolution 66(1): 144–161.",
} as const;

export const MOVEMENT_TYPE_LABELS: Record<string, string> = {
  resistance: "Сопротивление",
  subculture: "Субкультура",
  student: "Студенческое",
  state: "Государственное",
  political: "Политическое",
  civic: "Гражданское",
  militaryYouth: "Военно-молодёжное",
  scouting: "Скаутское",
};
