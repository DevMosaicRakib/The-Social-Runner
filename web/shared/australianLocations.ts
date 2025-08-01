// Australian suburbs and localities with coordinates
export interface LocationData {
  value: string;
  label: string;
  state: string;
  postcode: string;
  lat: number;
  lng: number;
}

export const australianLocations: LocationData[] = [
  // New South Wales - Comprehensive Suburbs List
  { value: "sydney-2000", label: "Sydney", state: "NSW", postcode: "2000", lat: -33.8688, lng: 151.2093 },
  { value: "bondi-beach-2026", label: "Bondi Beach", state: "NSW", postcode: "2026", lat: -33.8915, lng: 151.2767 },
  { value: "bondi-junction-2022", label: "Bondi Junction", state: "NSW", postcode: "2022", lat: -33.8947, lng: 151.2477 },
  { value: "manly-2095", label: "Manly", state: "NSW", postcode: "2095", lat: -33.7969, lng: 151.2840 },
  { value: "parramatta-2150", label: "Parramatta", state: "NSW", postcode: "2150", lat: -33.8150, lng: 151.0000 },
  { value: "cronulla-2230", label: "Cronulla", state: "NSW", postcode: "2230", lat: -34.0551, lng: 151.1531 },
  { value: "chatswood-2067", label: "Chatswood", state: "NSW", postcode: "2067", lat: -33.7969, lng: 151.1819 },
  { value: "hornsby-2077", label: "Hornsby", state: "NSW", postcode: "2077", lat: -33.7047, lng: 151.0986 },
  { value: "baulkham-hills-2153", label: "Baulkham Hills", state: "NSW", postcode: "2153", lat: -33.7611, lng: 150.9881 },
  { value: "castle-hill-2154", label: "Castle Hill", state: "NSW", postcode: "2154", lat: -33.7297, lng: 151.0022 },
  { value: "ryde-2112", label: "Ryde", state: "NSW", postcode: "2112", lat: -33.8147, lng: 151.1089 },
  { value: "epping-2121", label: "Epping", state: "NSW", postcode: "2121", lat: -33.7719, lng: 151.0811 },
  { value: "bankstown-2200", label: "Bankstown", state: "NSW", postcode: "2200", lat: -33.9175, lng: 151.0331 },
  { value: "liverpool-2170", label: "Liverpool", state: "NSW", postcode: "2170", lat: -33.9242, lng: 150.9539 },
  { value: "penrith-2750", label: "Penrith", state: "NSW", postcode: "2750", lat: -33.7506, lng: 150.6941 },
  { value: "blacktown-2148", label: "Blacktown", state: "NSW", postcode: "2148", lat: -33.7715, lng: 150.9073 },
  { value: "campbelltown-2560", label: "Campbelltown", state: "NSW", postcode: "2560", lat: -34.0639, lng: 150.8139 },
  { value: "hurstville-2220", label: "Hurstville", state: "NSW", postcode: "2220", lat: -33.9675, lng: 151.1031 },
  { value: "kogarah-2217", label: "Kogarah", state: "NSW", postcode: "2217", lat: -33.9639, lng: 151.1331 },
  { value: "burwood-2134", label: "Burwood", state: "NSW", postcode: "2134", lat: -33.8789, lng: 151.1042 },
  { value: "strathfield-2135", label: "Strathfield", state: "NSW", postcode: "2135", lat: -33.8728, lng: 151.0931 },
  { value: "newtown-2042", label: "Newtown", state: "NSW", postcode: "2042", lat: -33.8956, lng: 151.1794 },
  { value: "paddington-2021", label: "Paddington", state: "NSW", postcode: "2021", lat: -33.8847, lng: 151.2306 },
  { value: "surry-hills-2010", label: "Surry Hills", state: "NSW", postcode: "2010", lat: -33.8842, lng: 151.2108 },
  { value: "darlinghurst-2010", label: "Darlinghurst", state: "NSW", postcode: "2010", lat: -33.8769, lng: 151.2181 },
  { value: "glebe-2037", label: "Glebe", state: "NSW", postcode: "2037", lat: -33.8819, lng: 151.1908 },
  { value: "balmain-2041", label: "Balmain", state: "NSW", postcode: "2041", lat: -33.8581, lng: 151.1808 },
  { value: "leichhardt-2040", label: "Leichhardt", state: "NSW", postcode: "2040", lat: -33.8831, lng: 151.1564 },
  { value: "rozelle-2039", label: "Rozelle", state: "NSW", postcode: "2039", lat: -33.8658, lng: 151.1719 },
  { value: "mosman-2088", label: "Mosman", state: "NSW", postcode: "2088", lat: -33.8281, lng: 151.2431 },
  { value: "neutral-bay-2089", label: "Neutral Bay", state: "NSW", postcode: "2089", lat: -33.8319, lng: 151.2219 },
  { value: "north-sydney-2060", label: "North Sydney", state: "NSW", postcode: "2060", lat: -33.8408, lng: 151.2069 },
  { value: "crows-nest-2065", label: "Crows Nest", state: "NSW", postcode: "2065", lat: -33.8258, lng: 151.2019 },
  { value: "lane-cove-2066", label: "Lane Cove", state: "NSW", postcode: "2066", lat: -33.8108, lng: 151.1664 },
  { value: "artarmon-2064", label: "Artarmon", state: "NSW", postcode: "2064", lat: -33.8119, lng: 151.1881 },
  { value: "willoughby-2068", label: "Willoughby", state: "NSW", postcode: "2068", lat: -33.8008, lng: 151.1981 },
  { value: "st-leonards-2065", label: "St Leonards", state: "NSW", postcode: "2065", lat: -33.8228, lng: 151.1969 },
  { value: "st-peters-2044", label: "St Peters", state: "NSW", postcode: "2044", lat: -33.9077, lng: 151.1822 },
  { value: "gordon-2072", label: "Gordon", state: "NSW", postcode: "2072", lat: -33.7528, lng: 151.1531 },
  { value: "turramurra-2074", label: "Turramurra", state: "NSW", postcode: "2074", lat: -33.7319, lng: 151.1281 },
  { value: "wahroonga-2076", label: "Wahroonga", state: "NSW", postcode: "2076", lat: -33.7178, lng: 151.1189 },
  { value: "dee-why-2099", label: "Dee Why", state: "NSW", postcode: "2099", lat: -33.7558, lng: 151.2889 },
  { value: "brookvale-2100", label: "Brookvale", state: "NSW", postcode: "2100", lat: -33.7608, lng: 151.2719 },
  { value: "mona-vale-2103", label: "Mona Vale", state: "NSW", postcode: "2103", lat: -33.6789, lng: 151.3069 },
  { value: "avalon-beach-2107", label: "Avalon Beach", state: "NSW", postcode: "2107", lat: -33.6358, lng: 151.3269 },
  { value: "newcastle-2300", label: "Newcastle", state: "NSW", postcode: "2300", lat: -32.9267, lng: 151.7789 },
  { value: "wollongong-2500", label: "Wollongong", state: "NSW", postcode: "2500", lat: -34.4278, lng: 150.8931 },
  { value: "orange-2800", label: "Orange", state: "NSW", postcode: "2800", lat: -33.2839, lng: 149.0988 },
  { value: "dubbo-2830", label: "Dubbo", state: "NSW", postcode: "2830", lat: -32.2426, lng: 148.6017 },
  { value: "tamworth-2340", label: "Tamworth", state: "NSW", postcode: "2340", lat: -31.0927, lng: 150.9279 },
  { value: "albury-2640", label: "Albury", state: "NSW", postcode: "2640", lat: -36.0737, lng: 146.9135 },
  { value: "wagga-wagga-2650", label: "Wagga Wagga", state: "NSW", postcode: "2650", lat: -35.1084, lng: 147.3598 },
  { value: "port-macquarie-2444", label: "Port Macquarie", state: "NSW", postcode: "2444", lat: -31.4312, lng: 152.9089 },
  { value: "coffs-harbour-2450", label: "Coffs Harbour", state: "NSW", postcode: "2450", lat: -30.2963, lng: 153.1176 },
  { value: "lismore-2480", label: "Lismore", state: "NSW", postcode: "2480", lat: -28.8142, lng: 153.2780 },
  { value: "bathurst-2795", label: "Bathurst", state: "NSW", postcode: "2795", lat: -33.4194, lng: 149.5806 },
  { value: "nowra-2541", label: "Nowra", state: "NSW", postcode: "2541", lat: -34.8769, lng: 150.6009 },
  { value: "cessnock-2325", label: "Cessnock", state: "NSW", postcode: "2325", lat: -32.8347, lng: 151.3564 },

  // Victoria - Comprehensive Suburbs List
  { value: "melbourne-3000", label: "Melbourne", state: "VIC", postcode: "3000", lat: -37.8136, lng: 144.9631 },
  { value: "richmond-3121", label: "Richmond", state: "VIC", postcode: "3121", lat: -37.8197, lng: 144.9969 },
  { value: "st-kilda-3182", label: "St Kilda", state: "VIC", postcode: "3182", lat: -37.8677, lng: 144.9811 },
  { value: "fitzroy-3065", label: "Fitzroy", state: "VIC", postcode: "3065", lat: -37.7991, lng: 144.9789 },
  { value: "south-yarra-3141", label: "South Yarra", state: "VIC", postcode: "3141", lat: -37.8397, lng: 144.9922 },
  { value: "brighton-3186", label: "Brighton", state: "VIC", postcode: "3186", lat: -37.9062, lng: 144.9997 },
  { value: "prahran-3181", label: "Prahran", state: "VIC", postcode: "3181", lat: -37.8514, lng: 144.9950 },
  { value: "carlton-3053", label: "Carlton", state: "VIC", postcode: "3053", lat: -37.7986, lng: 144.9658 },
  { value: "northcote-3070", label: "Northcote", state: "VIC", postcode: "3070", lat: -37.7708, lng: 144.9961 },
  { value: "collingwood-3066", label: "Collingwood", state: "VIC", postcode: "3066", lat: -37.7953, lng: 144.9897 },
  { value: "brunswick-3056", label: "Brunswick", state: "VIC", postcode: "3056", lat: -37.7683, lng: 144.9581 },
  { value: "hawthorn-3122", label: "Hawthorn", state: "VIC", postcode: "3122", lat: -37.8181, lng: 145.0294 },
  { value: "camberwell-3124", label: "Camberwell", state: "VIC", postcode: "3124", lat: -37.8239, lng: 145.0581 },
  { value: "box-hill-3128", label: "Box Hill", state: "VIC", postcode: "3128", lat: -37.8147, lng: 145.1208 },
  { value: "dandenong-3175", label: "Dandenong", state: "VIC", postcode: "3175", lat: -37.9886, lng: 145.2147 },
  { value: "frankston-3199", label: "Frankston", state: "VIC", postcode: "3199", lat: -38.1442, lng: 145.1289 },
  { value: "geelong-3220", label: "Geelong", state: "VIC", postcode: "3220", lat: -38.1499, lng: 144.3617 },
  { value: "ballarat-3350", label: "Ballarat", state: "VIC", postcode: "3350", lat: -37.5622, lng: 143.8503 },
  { value: "bendigo-3550", label: "Bendigo", state: "VIC", postcode: "3550", lat: -36.7570, lng: 144.2794 },
  { value: "shepparton-3630", label: "Shepparton", state: "VIC", postcode: "3630", lat: -36.3820, lng: 145.3989 },
  { value: "mildura-3500", label: "Mildura", state: "VIC", postcode: "3500", lat: -34.1875, lng: 142.1544 },
  { value: "warrnambool-3280", label: "Warrnambool", state: "VIC", postcode: "3280", lat: -38.3830, lng: 142.4856 },
  { value: "wodonga-3690", label: "Wodonga", state: "VIC", postcode: "3690", lat: -36.1217, lng: 146.8881 },
  { value: "pakenham-3810", label: "Pakenham", state: "VIC", postcode: "3810", lat: -38.0706, lng: 145.4839 },
  { value: "sunbury-3429", label: "Sunbury", state: "VIC", postcode: "3429", lat: -37.5781, lng: 144.7281 },
  { value: "ocean-grove-3226", label: "Ocean Grove", state: "VIC", postcode: "3226", lat: -38.2667, lng: 144.5167 },
  { value: "toorak-3142", label: "Toorak", state: "VIC", postcode: "3142", lat: -37.8414, lng: 145.0169 },
  { value: "malvern-3144", label: "Malvern", state: "VIC", postcode: "3144", lat: -37.8572, lng: 145.0281 },
  { value: "glen-waverley-3150", label: "Glen Waverley", state: "VIC", postcode: "3150", lat: -37.8797, lng: 145.1608 },
  { value: "clayton-3168", label: "Clayton", state: "VIC", postcode: "3168", lat: -37.9164, lng: 145.1219 },
  { value: "caulfield-3162", label: "Caulfield", state: "VIC", postcode: "3162", lat: -37.8819, lng: 145.0286 },
  { value: "essendon-3040", label: "Essendon", state: "VIC", postcode: "3040", lat: -37.7394, lng: 144.9058 },
  { value: "moonee-ponds-3039", label: "Moonee Ponds", state: "VIC", postcode: "3039", lat: -37.7614, lng: 144.9281 },
  { value: "coburg-3058", label: "Coburg", state: "VIC", postcode: "3058", lat: -37.7494, lng: 144.9642 },
  { value: "preston-3072", label: "Preston", state: "VIC", postcode: "3072", lat: -37.7400, lng: 144.9981 },
  { value: "heidelberg-3084", label: "Heidelberg", state: "VIC", postcode: "3084", lat: -37.7542, lng: 145.0586 },

  // Queensland - Comprehensive Suburbs List
  { value: "brisbane-4000", label: "Brisbane", state: "QLD", postcode: "4000", lat: -27.4698, lng: 153.0251 },
  { value: "southbank-4101", label: "Southbank", state: "QLD", postcode: "4101", lat: -27.4814, lng: 153.0186 },
  { value: "fortitude-valley-4006", label: "Fortitude Valley", state: "QLD", postcode: "4006", lat: -27.4553, lng: 153.0353 },
  { value: "new-farm-4005", label: "New Farm", state: "QLD", postcode: "4005", lat: -27.4675, lng: 153.0422 },
  { value: "west-end-4101", label: "West End", state: "QLD", postcode: "4101", lat: -27.4819, lng: 153.0089 },
  { value: "paddington-4064", label: "Paddington", state: "QLD", postcode: "4064", lat: -27.4606, lng: 152.9989 },
  { value: "toowong-4066", label: "Toowong", state: "QLD", postcode: "4066", lat: -27.4856, lng: 152.9781 },
  { value: "indooroopilly-4068", label: "Indooroopilly", state: "QLD", postcode: "4068", lat: -27.4997, lng: 152.9739 },
  { value: "chermside-4032", label: "Chermside", state: "QLD", postcode: "4032", lat: -27.3856, lng: 153.0342 },
  { value: "carindale-4152", label: "Carindale", state: "QLD", postcode: "4152", lat: -27.5189, lng: 153.1081 },
  { value: "garden-city-4122", label: "Garden City", state: "QLD", postcode: "4122", lat: -27.5789, lng: 153.0831 },
  { value: "surfers-paradise-4217", label: "Surfers Paradise", state: "QLD", postcode: "4217", lat: -28.0023, lng: 153.4145 },
  { value: "broadbeach-4218", label: "Broadbeach", state: "QLD", postcode: "4218", lat: -28.0356, lng: 153.4297 },
  { value: "gold-coast-4217", label: "Gold Coast", state: "QLD", postcode: "4217", lat: -28.0167, lng: 153.4000 },
  { value: "sunshine-coast-4558", label: "Sunshine Coast", state: "QLD", postcode: "4558", lat: -26.6833, lng: 153.0833 },
  { value: "noosa-heads-4567", label: "Noosa Heads", state: "QLD", postcode: "4567", lat: -26.3997, lng: 153.1075 },
  { value: "maroochydore-4558", label: "Maroochydore", state: "QLD", postcode: "4558", lat: -26.6569, lng: 153.0981 },
  { value: "caloundra-4551", label: "Caloundra", state: "QLD", postcode: "4551", lat: -26.7997, lng: 153.1331 },
  { value: "townsville-4810", label: "Townsville", state: "QLD", postcode: "4810", lat: -19.2564, lng: 146.8183 },
  { value: "cairns-4870", label: "Cairns", state: "QLD", postcode: "4870", lat: -16.9186, lng: 145.7781 },
  { value: "toowoomba-4350", label: "Toowoomba", state: "QLD", postcode: "4350", lat: -27.5598, lng: 151.9507 },
  { value: "rockhampton-4700", label: "Rockhampton", state: "QLD", postcode: "4700", lat: -23.3781, lng: 150.5069 },
  { value: "mackay-4740", label: "Mackay", state: "QLD", postcode: "4740", lat: -21.1550, lng: 149.1870 },
  { value: "bundaberg-4670", label: "Bundaberg", state: "QLD", postcode: "4670", lat: -24.8661, lng: 152.3489 },
  { value: "hervey-bay-4655", label: "Hervey Bay", state: "QLD", postcode: "4655", lat: -25.2986, lng: 152.8539 },
  { value: "gladstone-4680", label: "Gladstone", state: "QLD", postcode: "4680", lat: -23.8500, lng: 151.2667 },
  { value: "mount-isa-4825", label: "Mount Isa", state: "QLD", postcode: "4825", lat: -20.7256, lng: 139.4927 },
  { value: "maryborough-4650", label: "Maryborough", state: "QLD", postcode: "4650", lat: -25.5408, lng: 152.7028 },

  // Western Australia - Comprehensive Suburbs List
  { value: "perth-6000", label: "Perth", state: "WA", postcode: "6000", lat: -31.9505, lng: 115.8605 },
  { value: "fremantle-6160", label: "Fremantle", state: "WA", postcode: "6160", lat: -32.0569, lng: 115.7439 },
  { value: "joondalup-6027", label: "Joondalup", state: "WA", postcode: "6027", lat: -31.7448, lng: 115.7661 },
  { value: "subiaco-6008", label: "Subiaco", state: "WA", postcode: "6008", lat: -31.9483, lng: 115.8269 },
  { value: "cottesloe-6011", label: "Cottesloe", state: "WA", postcode: "6011", lat: -31.9975, lng: 115.7575 },
  { value: "scarborough-6019", label: "Scarborough", state: "WA", postcode: "6019", lat: -31.8975, lng: 115.7669 },
  { value: "nedlands-6009", label: "Nedlands", state: "WA", postcode: "6009", lat: -31.9775, lng: 115.8069 },
  { value: "claremont-6010", label: "Claremont", state: "WA", postcode: "6010", lat: -31.9822, lng: 115.7839 },
  { value: "applecross-6153", label: "Applecross", state: "WA", postcode: "6153", lat: -32.0269, lng: 115.8339 },
  { value: "canning-vale-6155", label: "Canning Vale", state: "WA", postcode: "6155", lat: -32.0669, lng: 115.9169 },
  { value: "mandurah-6210", label: "Mandurah", state: "WA", postcode: "6210", lat: -32.5269, lng: 115.7217 },
  { value: "bunbury-6230", label: "Bunbury", state: "WA", postcode: "6230", lat: -33.3267, lng: 115.6369 },
  { value: "kalgoorlie-6430", label: "Kalgoorlie", state: "WA", postcode: "6430", lat: -30.7461, lng: 121.4653 },
  { value: "geraldton-6530", label: "Geraldton", state: "WA", postcode: "6530", lat: -28.7774, lng: 114.6153 },
  { value: "albany-6330", label: "Albany", state: "WA", postcode: "6330", lat: -35.0275, lng: 117.8839 },
  { value: "broome-6725", label: "Broome", state: "WA", postcode: "6725", lat: -17.9614, lng: 122.2359 },
  { value: "port-hedland-6721", label: "Port Hedland", state: "WA", postcode: "6721", lat: -20.3106, lng: 118.6067 },
  { value: "karratha-6714", label: "Karratha", state: "WA", postcode: "6714", lat: -20.7364, lng: 116.8456 },
  { value: "rockingham-6168", label: "Rockingham", state: "WA", postcode: "6168", lat: -32.2769, lng: 115.7308 },
  { value: "armadale-6112", label: "Armadale", state: "WA", postcode: "6112", lat: -32.1569, lng: 116.0158 },

  // South Australia - Comprehensive Suburbs List
  { value: "adelaide-5000", label: "Adelaide", state: "SA", postcode: "5000", lat: -34.9285, lng: 138.6007 },
  { value: "glenelg-5045", label: "Glenelg", state: "SA", postcode: "5045", lat: -34.9806, lng: 138.5119 },
  { value: "port-adelaide-5015", label: "Port Adelaide", state: "SA", postcode: "5015", lat: -34.8425, lng: 138.5069 },
  { value: "north-adelaide-5006", label: "North Adelaide", state: "SA", postcode: "5006", lat: -34.9086, lng: 138.5936 },
  { value: "norwood-5067", label: "Norwood", state: "SA", postcode: "5067", lat: -34.9186, lng: 138.6286 },
  { value: "unley-5061", label: "Unley", state: "SA", postcode: "5061", lat: -34.9536, lng: 138.6086 },
  { value: "prospect-5082", label: "Prospect", state: "SA", postcode: "5082", lat: -34.8836, lng: 138.5936 },
  { value: "burnside-5066", label: "Burnside", state: "SA", postcode: "5066", lat: -34.9386, lng: 138.6486 },
  { value: "modbury-5092", label: "Modbury", state: "SA", postcode: "5092", lat: -34.8336, lng: 138.6886 },
  { value: "elizabeth-5112", label: "Elizabeth", state: "SA", postcode: "5112", lat: -34.7186, lng: 138.6736 },
  { value: "mount-gambier-5290", label: "Mount Gambier", state: "SA", postcode: "5290", lat: -37.8281, lng: 140.7831 },
  { value: "whyalla-5600", label: "Whyalla", state: "SA", postcode: "5600", lat: -33.0333, lng: 137.5667 },
  { value: "port-lincoln-5606", label: "Port Lincoln", state: "SA", postcode: "5606", lat: -34.7289, lng: 135.8581 },
  { value: "port-augusta-5700", label: "Port Augusta", state: "SA", postcode: "5700", lat: -32.4911, lng: 137.7669 },
  { value: "victor-harbor-5211", label: "Victor Harbor", state: "SA", postcode: "5211", lat: -35.5500, lng: 138.6167 },
  { value: "murray-bridge-5253", label: "Murray Bridge", state: "SA", postcode: "5253", lat: -35.1197, lng: 139.2731 },

  // Tasmania - Comprehensive Suburbs List
  { value: "hobart-7000", label: "Hobart", state: "TAS", postcode: "7000", lat: -42.8821, lng: 147.3272 },
  { value: "battery-point-7004", label: "Battery Point", state: "TAS", postcode: "7004", lat: -42.8897, lng: 147.3247 },
  { value: "sandy-bay-7005", label: "Sandy Bay", state: "TAS", postcode: "7005", lat: -42.9047, lng: 147.3397 },
  { value: "new-town-7008", label: "New Town", state: "TAS", postcode: "7008", lat: -42.8597, lng: 147.3047 },
  { value: "glenorchy-7010", label: "Glenorchy", state: "TAS", postcode: "7010", lat: -42.8297, lng: 147.2747 },
  { value: "launceston-7250", label: "Launceston", state: "TAS", postcode: "7250", lat: -41.4332, lng: 147.1441 },
  { value: "devonport-7310", label: "Devonport", state: "TAS", postcode: "7310", lat: -41.1789, lng: 146.3494 },
  { value: "burnie-7320", label: "Burnie", state: "TAS", postcode: "7320", lat: -41.0581, lng: 145.9069 },
  { value: "ulverstone-7315", label: "Ulverstone", state: "TAS", postcode: "7315", lat: -41.1581, lng: 146.1669 },

  // Australian Capital Territory
  { value: "canberra-2600", label: "Canberra", state: "ACT", postcode: "2600", lat: -35.2809, lng: 149.1300 },
  { value: "civic-2601", label: "Civic", state: "ACT", postcode: "2601", lat: -35.2802, lng: 149.1310 },
  { value: "belconnen-2617", label: "Belconnen", state: "ACT", postcode: "2617", lat: -35.2389, lng: 149.0669 },
  { value: "tuggeranong-2900", label: "Tuggeranong", state: "ACT", postcode: "2900", lat: -35.4239, lng: 149.0869 },
  { value: "woden-2606", label: "Woden", state: "ACT", postcode: "2606", lat: -35.3439, lng: 149.0869 },
  { value: "gungahlin-2912", label: "Gungahlin", state: "ACT", postcode: "2912", lat: -35.1839, lng: 149.1319 },

  // Northern Territory
  { value: "darwin-0800", label: "Darwin", state: "NT", postcode: "0800", lat: -12.4634, lng: 130.8456 },
  { value: "palmerston-0830", label: "Palmerston", state: "NT", postcode: "0830", lat: -12.4764, lng: 130.9756 },
  { value: "alice-springs-0870", label: "Alice Springs", state: "NT", postcode: "0870", lat: -23.6980, lng: 133.8807 },
  { value: "katherine-0850", label: "Katherine", state: "NT", postcode: "0850", lat: -14.4669, lng: 132.2647 },
  { value: "tennant-creek-0860", label: "Tennant Creek", state: "NT", postcode: "0860", lat: -19.6439, lng: 134.1889 },

  // Victoria - Major Cities and Suburbs
  { value: "melbourne-vic", label: "Melbourne, VIC", state: "VIC", postcode: "3000", lat: -37.8136, lng: 144.9631 },
  { value: "richmond-vic", label: "Richmond, VIC", state: "VIC", postcode: "3121", lat: -37.8197, lng: 144.9969 },
  { value: "st-kilda-vic", label: "St Kilda, VIC", state: "VIC", postcode: "3182", lat: -37.8677, lng: 144.9811 },
  { value: "fitzroy-vic", label: "Fitzroy, VIC", state: "VIC", postcode: "3065", lat: -37.7991, lng: 144.9789 },
  { value: "brighton-vic", label: "Brighton, VIC", state: "VIC", postcode: "3186", lat: -37.9062, lng: 144.9997 },
  { value: "geelong-vic", label: "Geelong, VIC", state: "VIC", postcode: "3220", lat: -38.1499, lng: 144.3617 },
  { value: "ballarat-vic", label: "Ballarat, VIC", state: "VIC", postcode: "3350", lat: -37.5622, lng: 143.8503 },
  { value: "bendigo-vic", label: "Bendigo, VIC", state: "VIC", postcode: "3550", lat: -36.7570, lng: 144.2794 },
  { value: "latrobe-vic", label: "Latrobe Valley, VIC", state: "VIC", postcode: "3844", lat: -38.1833, lng: 146.4167 },
  { value: "shepparton-vic", label: "Shepparton, VIC", state: "VIC", postcode: "3630", lat: -36.3820, lng: 145.3989 },
  { value: "mildura-vic", label: "Mildura, VIC", state: "VIC", postcode: "3500", lat: -34.1875, lng: 142.1544 },
  { value: "warrnambool-vic", label: "Warrnambool, VIC", state: "VIC", postcode: "3280", lat: -38.3830, lng: 142.4856 },
  { value: "wodonga-vic", label: "Wodonga, VIC", state: "VIC", postcode: "3690", lat: -36.1217, lng: 146.8881 },
  { value: "pakenham-vic", label: "Pakenham, VIC", state: "VIC", postcode: "3810", lat: -38.0706, lng: 145.4839 },
  { value: "sunbury-vic", label: "Sunbury, VIC", state: "VIC", postcode: "3429", lat: -37.5781, lng: 144.7281 },
  { value: "ocean-grove-vic", label: "Ocean Grove, VIC", state: "VIC", postcode: "3226", lat: -38.2667, lng: 144.5167 },
  { value: "frankston-vic", label: "Frankston, VIC", state: "VIC", postcode: "3199", lat: -38.1442, lng: 145.1289 },

  // Queensland - Major Cities and Suburbs
  { value: "brisbane-qld", label: "Brisbane, QLD", state: "QLD", postcode: "4000", lat: -27.4698, lng: 153.0251 },
  { value: "southbank-qld", label: "Southbank, QLD", state: "QLD", postcode: "4101", lat: -27.4814, lng: 153.0186 },
  { value: "fortitude-valley-qld", label: "Fortitude Valley, QLD", state: "QLD", postcode: "4006", lat: -27.4553, lng: 153.0353 },
  { value: "surfers-paradise-qld", label: "Surfers Paradise, QLD", state: "QLD", postcode: "4217", lat: -28.0023, lng: 153.4145 },
  { value: "gold-coast-qld", label: "Gold Coast, QLD", state: "QLD", postcode: "4217", lat: -28.0167, lng: 153.4000 },
  { value: "sunshine-coast-qld", label: "Sunshine Coast, QLD", state: "QLD", postcode: "4558", lat: -26.6833, lng: 153.0833 },
  { value: "noosa-qld", label: "Noosa, QLD", state: "QLD", postcode: "4567", lat: -26.3997, lng: 153.1075 },
  { value: "townsville-qld", label: "Townsville, QLD", state: "QLD", postcode: "4810", lat: -19.2564, lng: 146.8183 },
  { value: "cairns-qld", label: "Cairns, QLD", state: "QLD", postcode: "4870", lat: -16.9186, lng: 145.7781 },
  { value: "toowoomba-qld", label: "Toowoomba, QLD", state: "QLD", postcode: "4350", lat: -27.5598, lng: 151.9507 },
  { value: "rockhampton-qld", label: "Rockhampton, QLD", state: "QLD", postcode: "4700", lat: -23.3781, lng: 150.5069 },
  { value: "mackay-qld", label: "Mackay, QLD", state: "QLD", postcode: "4740", lat: -21.1550, lng: 149.1870 },
  { value: "bundaberg-qld", label: "Bundaberg, QLD", state: "QLD", postcode: "4670", lat: -24.8661, lng: 152.3489 },
  { value: "hervey-bay-qld", label: "Hervey Bay, QLD", state: "QLD", postcode: "4655", lat: -25.2986, lng: 152.8539 },
  { value: "gladstone-qld", label: "Gladstone, QLD", state: "QLD", postcode: "4680", lat: -23.8500, lng: 151.2667 },
  { value: "mount-isa-qld", label: "Mount Isa, QLD", state: "QLD", postcode: "4825", lat: -20.7256, lng: 139.4927 },
  { value: "maryborough-qld", label: "Maryborough, QLD", state: "QLD", postcode: "4650", lat: -25.5408, lng: 152.7028 },

  // Western Australia - Major Cities and Suburbs
  { value: "perth-wa", label: "Perth, WA", state: "WA", postcode: "6000", lat: -31.9505, lng: 115.8605 },
  { value: "fremantle-wa", label: "Fremantle, WA", state: "WA", postcode: "6160", lat: -32.0569, lng: 115.7439 },
  { value: "joondalup-wa", label: "Joondalup, WA", state: "WA", postcode: "6027", lat: -31.7448, lng: 115.7661 },
  { value: "mandurah-wa", label: "Mandurah, WA", state: "WA", postcode: "6210", lat: -32.5269, lng: 115.7217 },
  { value: "bunbury-wa", label: "Bunbury, WA", state: "WA", postcode: "6230", lat: -33.3267, lng: 115.6369 },
  { value: "kalgoorlie-wa", label: "Kalgoorlie, WA", state: "WA", postcode: "6430", lat: -30.7461, lng: 121.4653 },
  { value: "geraldton-wa", label: "Geraldton, WA", state: "WA", postcode: "6530", lat: -28.7774, lng: 114.6153 },
  { value: "albany-wa", label: "Albany, WA", state: "WA", postcode: "6330", lat: -35.0275, lng: 117.8839 },
  { value: "broome-wa", label: "Broome, WA", state: "WA", postcode: "6725", lat: -17.9614, lng: 122.2359 },
  { value: "port-hedland-wa", label: "Port Hedland, WA", state: "WA", postcode: "6721", lat: -20.3106, lng: 118.6067 },
  { value: "karratha-wa", label: "Karratha, WA", state: "WA", postcode: "6714", lat: -20.7364, lng: 116.8456 },

  // South Australia - Major Cities and Suburbs
  { value: "adelaide-sa", label: "Adelaide, SA", state: "SA", postcode: "5000", lat: -34.9285, lng: 138.6007 },
  { value: "glenelg-sa", label: "Glenelg, SA", state: "SA", postcode: "5045", lat: -34.9806, lng: 138.5119 },
  { value: "port-adelaide-sa", label: "Port Adelaide, SA", state: "SA", postcode: "5015", lat: -34.8425, lng: 138.5069 },
  { value: "mount-gambier-sa", label: "Mount Gambier, SA", state: "SA", postcode: "5290", lat: -37.8281, lng: 140.7831 },
  { value: "whyalla-sa", label: "Whyalla, SA", state: "SA", postcode: "5600", lat: -33.0333, lng: 137.5667 },
  { value: "port-lincoln-sa", label: "Port Lincoln, SA", state: "SA", postcode: "5606", lat: -34.7289, lng: 135.8581 },
  { value: "port-augusta-sa", label: "Port Augusta, SA", state: "SA", postcode: "5700", lat: -32.4911, lng: 137.7669 },
  { value: "victor-harbor-sa", label: "Victor Harbor, SA", state: "SA", postcode: "5211", lat: -35.5500, lng: 138.6167 },
  { value: "murray-bridge-sa", label: "Murray Bridge, SA", state: "SA", postcode: "5253", lat: -35.1197, lng: 139.2731 },

  // Tasmania - Major Cities and Suburbs
  { value: "hobart-tas", label: "Hobart, TAS", state: "TAS", postcode: "7000", lat: -42.8821, lng: 147.3272 },
  { value: "battery-point-tas", label: "Battery Point, TAS", state: "TAS", postcode: "7004", lat: -42.8897, lng: 147.3247 },
  { value: "launceston-tas", label: "Launceston, TAS", state: "TAS", postcode: "7250", lat: -41.4332, lng: 147.1441 },
  { value: "devonport-tas", label: "Devonport, TAS", state: "TAS", postcode: "7310", lat: -41.1789, lng: 146.3494 },
  { value: "burnie-tas", label: "Burnie, TAS", state: "TAS", postcode: "7320", lat: -41.0581, lng: 145.9069 },

  // Australian Capital Territory
  { value: "canberra-act", label: "Canberra, ACT", state: "ACT", postcode: "2600", lat: -35.2809, lng: 149.1300 },
  { value: "civic-act", label: "Civic, ACT", state: "ACT", postcode: "2601", lat: -35.2802, lng: 149.1310 },

  // Northern Territory
  { value: "darwin-nt", label: "Darwin, NT", state: "NT", postcode: "0800", lat: -12.4634, lng: 130.8456 },
  { value: "alice-springs-nt", label: "Alice Springs, NT", state: "NT", postcode: "0870", lat: -23.6980, lng: 133.8807 },
  { value: "katherine-nt", label: "Katherine, NT", state: "NT", postcode: "0850", lat: -14.4669, lng: 132.2647 },
];

// Utility function to search locations with improved matching
export function searchLocations(query: string, limit: number = 10): LocationData[] {
  if (!query.trim()) return [];
  
  const searchTerm = query.toLowerCase().trim();
  
  // Priority scoring: exact matches first, then partial matches
  const results = australianLocations
    .map(location => {
      const label = location.label.toLowerCase();
      const state = location.state.toLowerCase();
      const postcode = location.postcode;
      
      let score = 0;
      
      // Exact label match gets highest priority
      if (label === searchTerm) score = 100;
      // Label starts with search term gets high priority
      else if (label.startsWith(searchTerm)) score = 90;
      // Label contains search term gets medium priority
      else if (label.includes(searchTerm)) score = 70;
      // State match gets lower priority
      else if (state.includes(searchTerm)) score = 50;
      // Postcode match gets lowest priority (with null check)
      else if (postcode && postcode.includes(searchTerm)) score = 30;
      
      return { location, score };
    })
    .filter(result => result.score > 0)
    .sort((a, b) => {
      // Sort by score first, then alphabetically
      if (b.score !== a.score) return b.score - a.score;
      return a.location.label.localeCompare(b.location.label);
    })
    .slice(0, limit)
    .map(result => result.location);
  
  return results;
}

export const australianStates = [
  { value: "NSW", label: "New South Wales" },
  { value: "VIC", label: "Victoria" },
  { value: "QLD", label: "Queensland" },
  { value: "WA", label: "Western Australia" },
  { value: "SA", label: "South Australia" },
  { value: "TAS", label: "Tasmania" },
  { value: "ACT", label: "Australian Capital Territory" },
  { value: "NT", label: "Northern Territory" },
];