export type MediaQuery = {
  slug: string;
  files?: string[];
  categories?: string[];
  searches: string[];
};

export const MEDIA_QUERIES: MediaQuery[] = [
  {
    slug: "young-guard",
    files: [
      "1943. Вручение орденов членам организации „Молодая гвардия“.png",
      "1943. Юные герои Краснодона.png",
      "1944 CPA 887.jpg",
    ],
    categories: ["Young_Guard_(Soviet_resistance)"],
    searches: ["Молодая гвардия Краснодон 1943", "Young Guard Krasnodon"],
  },
  {
    slug: "zazous",
    files: ["Zazou h ill.png", "Zazou in color.svg"],
    categories: ["Zazou"],
    searches: ["Zazou illustration", "Occupied Paris 1941 street Bundesarchiv"],
  },
  {
    slug: "swing-youth",
    searches: [
      "Swingjugend Hamburg",
      "Entartete Musik 1938",
      "jazz dancers 1940s Germany",
    ],
  },
  {
    slug: "grey-ranks",
    files: [
      "03 Harcerska Poczta Polowa Zawiszacy.jpg",
      "AK-soldiers Parasol Regiment Warsaw Uprising 1944.jpg",
      "Scouts fighting in the Warsaw Uprising.jpg",
    ],
    categories: ["Szare_Szeregi"],
    searches: ["Szare Szeregi Warsaw 1944", "Batalion Zośka"],
  },
  {
    slug: "churchill-club",
    files: ["ChurchillClub.jpg", "The Churchill Club.png"],
    categories: ["Churchill-klubben"],
    searches: ["Churchill-klubben Aalborg", "Churchill Club Denmark 1942"],
  },
  {
    slug: "fronte-gioventu",
    files: [
      "An Italian partisan in Florence, 14 August 1944. TR2282.jpg",
      "Partigiane a Brera.jpg",
    ],
    searches: [
      "Italian partisans 1944 Florence",
      "Resistenza italiana partigiani 1945",
    ],
  },
  {
    slug: "epon",
    files: [
      "EPON Uni Student Poster Ilioupoli.jpg",
      "Days EPON Poster Ilioupoli.jpg",
      "EPON House plaque.jpg",
    ],
    searches: ["ΕΠΟΝ αφίσα", "EPON Greece resistance poster"],
  },
  {
    slug: "skoj",
    files: [
      "Ivo Lola Ribar.jpg",
      "Centralni komitet SKOJ-a.jpg",
      "Sekretar SKOJ-a Ivo Lola Ribar govori na Prvom kongresu omladine Jugoslavije.jpg",
    ],
    categories: ["Young_Communist_League_of_Yugoslavia", "Ivo_Lola_Ribar"],
    searches: ["Ivo Lola Ribar SKOJ", "SKOJ partisans 1943"],
  },
  {
    slug: "predvoj",
    files: [
      "Prague uprising, May 1945 03.jpg",
      "Prague uprising, May 1945 01.jpg",
      "Prague uprising, Old Town Square 02.jpg",
    ],
    searches: ["Pražské povstání 1945", "Prague uprising barricades 1945"],
  },
  {
    slug: "little-lottas",
    files: [
      "Distribution of food 1939 (1933C; JOKAHBL3B J64-1).tif",
      "Easter at Market Square in Helsinki 1939 (JOKAVIU2A001-1).tif",
    ],
    categories: ["Lotta_Svärd"],
    searches: ["Lotta Svärd 1941", "Pikkulotat", "Lotta Svärd girls"],
  },
  {
    slug: "rms-bulgaria",
    files: [
      "Bulgarian partisan Khaldei.jpg",
      "Bulgarian partisans Khaldei.jpg",
      "Plovdiv September 1944.jpg",
    ],
    categories: ["Partisans_of_Bulgaria"],
    searches: [
      "Bulgarian partisans September 1944",
      "Fatherland Front Sofia 1944",
    ],
  },
  {
    slug: "straja-tarii",
    files: ["Logo and badge of Straja Țării.svg"],
    categories: ["Symbols_of_Carol_II's_dictatorship_in_Romania"],
    searches: ["Carol II Romania 1938 parade", "Straja Tarii 1939"],
  },
  {
    slug: "frente-juventudes",
    files: [
      "Sancho Dávila flechas y pelayos 1938.jpg",
      "Campamento Mola flechas y pelayos 1938.jpg",
      "Inauguración campamento flechas y pelayos Baquio 1938.jpg",
    ],
    searches: ["Frente de Juventudes 1941", "Flechas Falange campamento"],
  },
  {
    slug: "mocidade-portuguesa",
    files: [
      "PT-ABM-PHF-1296 - Desfile de Lusitos, da Mocidade Portuguesa, Funchal.jpg",
      "16985 - Aspirantes da Mocidade Portuguesa numa sessão de ginástica (1938).jpg",
      "16980 - Um grupo de aspirantes da Mocidade Portuguesa.jpg",
    ],
    categories: ["Mocidade_Portuguesa"],
    searches: ["Mocidade Portuguesa 1938", "Mocidade Portuguesa desfile"],
  },
  {
    slug: "air-training-corps",
    files: [
      "Atc Boys Lend a Hand on the Land- Agriculture in Wartime, England, UK, 1944 D21252.jpg",
      "Atc at Gliding School- Cadets of the Air Training Corps, Denham Gliding School, Buckinghamshire, England, UK, 1945 D24547.jpg",
      "15-year-old cadet Tommy McMordie from Luton Air Training Corps (ATC) in a Wellington bomber's rear turret at No 12 Operational Training Unit (OTU) at Chipping Warden, Northamptonshire, 17 September 1944. CH13880.jpg",
    ],
    categories: ["Air_Training_Corps_in_World_War_II"],
    searches: ["Air Training Corps 1944", "RAF cadets 1942"],
  },
  {
    slug: "canadian-youth-congress",
    searches: [
      "Canadian Youth Congress 1936",
      "Ottawa youth conference 1930s",
      "YMCA Canada 1940 photograph",
    ],
  },
  {
    slug: "pachuco-united-states",
    files: [
      "Zoot Suiters On Parade.jpg",
      "Zoot Suit, Mexican \"drape style\".png",
    ],
    categories: ["Zoot_Suit_Riots"],
    searches: ["Zoot Suit Riots 1943 Los Angeles", "pachuco 1943"],
  },
  {
    slug: "pachuco-mexico",
    searches: [
      "Tin Tan 1940s",
      "Germán Valdés pachuco 1945",
      "El hijo desobediente Tin Tan",
    ],
  },
  {
    slug: "juventude-brasileira",
    files: ["Getúlio Vargas - 1930.jpg"],
    searches: [
      "Estado Novo Brazil parade 1940",
      "Getúlio Vargas 1940 youth",
      "Juventude Brasileira 1941",
    ],
  },
  {
    slug: "anc-youth-league",
    files: ["Young Mandela.jpg", "Nelson Mandela 1937.jpg"],
    searches: [
      "Walter Sisulu 1940s",
      "Oliver Tambo young",
      "African National Congress 1940s",
    ],
  },
  {
    slug: "aisf",
    files: [
      "Picketing in front of Medical School at Bangalore during examination during Quit India movement, organised by Indian National Congress.jpg",
      "Procession at Bangalore during Quit India movement, by Indian National Congress.jpg",
    ],
    categories: ["Quit_India_Movement"],
    searches: ["Quit India students 1942 Bangalore", "Indian students procession 1942"],
  },
  {
    slug: "new-democratic-youth-league",
    files: ["Flag of the Communist Youth League of China.svg"],
    searches: [
      "New Democratic Youth League 1949",
      "中国新民主主义青年团 1949 大会",
      "Communist Youth League of China 1950 congress",
    ],
  },
  {
    slug: "yokusan-sonendan",
    files: [
      "Susume Ichi-oku Hinotama Da, Imperial Rule Assistance Association, 1942.jpg",
      "Yokusan Sonendan.svg",
      "Imperial Rule Assistance Association badge.svg",
    ],
    searches: ["大政翼賛会 1942", "Yokusan Sonendan 1943"],
  },
  {
    slug: "pesindo",
    files: [
      "COLLECTIE TROPENMUSEUM Militairen bij een affiche met het portret van Stalin door hen aangetroffen op het kantoor van de Pemuda Sosialis Indonesia (Pesindo) TMnr 60054585.jpg",
    ],
    searches: [
      "Pesindo 1945",
      "Pemuda Sosialis Indonesia",
      "Indonesian National Revolution youth 1945",
    ],
  },
  {
    slug: "vanguard-youth",
    files: [
      "Ba Dinh Square September 2nd, 1945.jpg",
      "Viet Minh during August Revolution.jpg",
    ],
    searches: ["Saigon 1945 August", "Cochinchina 1945 demonstration"],
  },
  {
    slug: "korean-national-youth",
    files: [
      "Lee Beom-seok 194809.jpg",
      "Lee Beom-seok and Chang Jun-ha 1945-August-16.jpg",
    ],
    categories: ["Lee_Beom-seok"],
    searches: ["Lee Beom-seok 1948", "Republic of Korea 15 August 1948"],
  },
  {
    slug: "seri-thai",
    files: [
      "Free Thai Movement 1945.jpg",
      "Free Thai insignia.svg",
    ],
    searches: ["Free Thai Movement 1945 Bangkok", "Seri Thai Pridi"],
  },
  {
    slug: "eureka-youth-league",
    searches: [
      "Eureka Stockade flag",
      "Communist Party of Australia 1940s youth",
      "Eureka Youth League banner",
    ],
  },
  {
    slug: "gadna",
    files: [
      "A GROUP OF YOUNG \"HAGANA\" MEMBERS MARCHING IN THE JEZREEL VALLEY NEAR AFULA. חברי הגנה צעירים צועדים בעמק יזרעאל, ליד עפולה.D40-041.jpg",
    ],
    searches: ["Gadna 1948", "גדנ״ע 1948", "Haganah youth 1948"],
  },
  {
    slug: "young-egypt",
    files: [
      "Ahmed Hussein - Young Egypt party 1933.jpg",
      "Al-Ishtrakeyia Journal (Young Egypt party).jpg",
    ],
    searches: ["Young Egypt Party Green Shirts", "Misr al-Fatat 1930s"],
  },
];
