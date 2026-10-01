/**
 * India: every state and union territory with its major cities / district headquarters,
 * used for the dependent State -> City dropdowns on the student profile.
 *
 * Covers the principal cities and towns of each state (not every village). The UI always adds an
 * "Other" option so a student from an unlisted town can type it in.
 */
const INDIA_LOCATIONS = {
  "Andhra Pradesh": [
    "Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Rajahmundry", "Kakinada", "Tirupati",
    "Kadapa", "Anantapur", "Eluru", "Ongole", "Vizianagaram", "Srikakulam", "Machilipatnam", "Tenali",
    "Proddatur", "Chittoor", "Hindupur", "Bhimavaram", "Madanapalle", "Guntakal", "Dharmavaram", "Gudivada",
    "Narasaraopet", "Tadipatri", "Adoni", "Amaravati", "Nandyal", "Chilakaluripet",
  ],
  "Arunachal Pradesh": [
    "Itanagar", "Naharlagun", "Pasighat", "Tawang", "Ziro", "Bomdila", "Along", "Tezu", "Roing", "Changlang",
    "Khonsa", "Namsai", "Seppa", "Yingkiong",
  ],
  "Assam": [
    "Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia", "Tezpur", "Bongaigaon", "Dhubri",
    "Diphu", "North Lakhimpur", "Karimganj", "Sivasagar", "Goalpara", "Barpeta", "Golaghat", "Kokrajhar",
    "Haflong", "Mangaldoi", "Nalbari", "Dhemaji", "Hailakandi",
  ],
  "Bihar": [
    "Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga", "Bihar Sharif", "Arrah", "Begusarai",
    "Katihar", "Munger", "Chhapra", "Samastipur", "Hajipur", "Sasaram", "Dehri", "Siwan", "Motihari",
    "Nawada", "Bagaha", "Buxar", "Kishanganj", "Sitamarhi", "Jamalpur", "Jehanabad", "Aurangabad", "Saharsa",
    "Madhubani", "Araria", "Bettiah", "Supaul", "Lakhisarai", "Gopalganj", "Sheikhpura", "Banka", "Jamui",
  ],
  "Chhattisgarh": [
    "Raipur", "Bhilai", "Bilaspur", "Korba", "Durg", "Rajnandgaon", "Raigarh", "Jagdalpur", "Ambikapur",
    "Dhamtari", "Chirmiri", "Mahasamund", "Kawardha", "Kanker", "Janjgir", "Champa", "Naila", "Dalli Rajhara",
    "Bhatapara", "Baikunthpur", "Jashpur", "Kondagaon", "Dantewada",
  ],
  "Goa": [
    "Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda", "Bicholim", "Curchorem", "Sanquelim", "Cuncolim",
    "Valpoi", "Canacona", "Pernem", "Quepem", "Sanguem",
  ],
  "Gujarat": [
    "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Junagadh", "Gandhinagar", "Anand",
    "Nadiad", "Morbi", "Mehsana", "Bharuch", "Navsari", "Vapi", "Bhuj", "Porbandar", "Gandhidham", "Palanpur",
    "Surendranagar", "Amreli", "Godhra", "Patan", "Veraval", "Valsad", "Botad", "Dahod", "Himmatnagar",
    "Ankleshwar", "Kalol", "Deesa", "Modasa", "Khambhat", "Halol",
  ],
  "Haryana": [
    "Faridabad", "Gurugram", "Panipat", "Ambala", "Yamunanagar", "Rohtak", "Hisar", "Karnal", "Sonipat",
    "Panchkula", "Bhiwani", "Sirsa", "Bahadurgarh", "Jind", "Thanesar", "Kaithal", "Rewari", "Narnaul",
    "Pundri", "Kosli", "Palwal", "Hansi", "Fatehabad", "Mahendragarh", "Charkhi Dadri", "Nuh", "Jhajjar",
  ],
  "Himachal Pradesh": [
    "Shimla", "Dharamshala", "Solan", "Mandi", "Kullu", "Manali", "Hamirpur", "Una", "Bilaspur", "Chamba",
    "Nahan", "Palampur", "Kangra", "Baddi", "Sundernagar", "Paonta Sahib", "Nurpur", "Kasauli", "Keylong",
    "Reckong Peo",
  ],
  "Jharkhand": [
    "Ranchi", "Jamshedpur", "Dhanbad", "Bokaro Steel City", "Deoghar", "Phusro", "Hazaribagh", "Giridih",
    "Ramgarh", "Medininagar", "Chirkunda", "Jhumri Telaiya", "Sahibganj", "Dumka", "Chaibasa", "Godda",
    "Lohardaga", "Gumla", "Pakur", "Simdega", "Chatra", "Koderma", "Jamtara", "Latehar",
  ],
  "Karnataka": [
    "Bengaluru", "Mysuru", "Hubballi", "Dharwad", "Mangaluru", "Belagavi", "Kalaburagi", "Davanagere",
    "Ballari", "Vijayapura", "Shivamogga", "Tumakuru", "Raichur", "Bidar", "Hospet", "Hassan", "Gadag",
    "Udupi", "Robertsonpet", "Bhadravati", "Chitradurga", "Kolar", "Mandya", "Chikkamagaluru", "Gangavathi",
    "Bagalkot", "Ranebennuru", "Yadgir", "Karwar", "Madikeri", "Chikkaballapur", "Ramanagara", "Puttur",
    "Sirsi", "Haveri", "Koppal",
  ],
  "Kerala": [
    "Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Alappuzha", "Palakkad", "Kannur",
    "Kottayam", "Kasaragod", "Malappuram", "Pathanamthitta", "Idukki", "Wayanad", "Thalassery", "Kayamkulam",
    "Ponnani", "Manjeri", "Tirur", "Perinthalmanna", "Changanassery", "Kanhangad", "Payyannur", "Muvattupuzha",
    "Attingal", "Neyyattinkara", "Thodupuzha", "Chalakudy", "Guruvayur", "Irinjalakuda", "Kattappana",
  ],
  "Madhya Pradesh": [
    "Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Dewas", "Satna", "Ratlam", "Rewa",
    "Katni", "Singrauli", "Burhanpur", "Khandwa", "Bhind", "Chhindwara", "Guna", "Shivpuri", "Vidisha",
    "Chhatarpur", "Damoh", "Mandsaur", "Khargone", "Neemuch", "Pithampur", "Hoshangabad", "Itarsi", "Sehore",
    "Morena", "Betul", "Seoni", "Datia", "Nagda", "Dhar", "Balaghat", "Sidhi", "Panna", "Tikamgarh",
    "Shajapur", "Mandla", "Shahdol", "Dindori", "Barwani", "Raisen", "Narsinghpur", "Harda", "Alirajpur",
  ],
  "Maharashtra": [
    "Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Chhatrapati Sambhajinagar", "Solapur",
    "Kolhapur", "Amravati", "Navi Mumbai", "Sangli", "Jalgaon", "Akola", "Latur", "Dhule", "Ahmednagar",
    "Chandrapur", "Parbhani", "Ichalkaranji", "Jalna", "Ambarnath", "Bhiwandi", "Nanded", "Panvel",
    "Malegaon", "Kalyan", "Dombivli", "Vasai-Virar", "Mira-Bhayandar", "Ulhasnagar", "Pimpri-Chinchwad",
    "Satara", "Beed", "Yavatmal", "Gondia", "Wardha", "Osmanabad", "Dharashiv", "Nandurbar", "Hingoli",
    "Buldhana", "Washim", "Bhandara", "Gadchiroli", "Ratnagiri", "Sindhudurg", "Alibag", "Baramati",
    "Lonavala", "Karad", "Shirdi",
  ],
  "Manipur": [
    "Imphal", "Thoubal", "Bishnupur", "Churachandpur", "Kakching", "Ukhrul", "Senapati", "Tamenglong",
    "Jiribam", "Moreh", "Noney", "Chandel",
  ],
  "Meghalaya": [
    "Shillong", "Tura", "Jowai", "Nongstoin", "Baghmara", "Williamnagar", "Resubelpara", "Mawkyrwat",
    "Nongpoh", "Cherrapunji", "Khliehriat",
  ],
  "Mizoram": [
    "Aizawl", "Lunglei", "Champhai", "Serchhip", "Kolasib", "Saiha", "Lawngtlai", "Mamit", "Saitual",
    "Khawzawl",
  ],
  "Nagaland": [
    "Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha", "Zunheboto", "Phek", "Mon", "Longleng",
    "Kiphire", "Peren",
  ],
  "Odisha": [
    "Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri", "Balasore", "Bhadrak",
    "Baripada", "Jharsuguda", "Jeypore", "Bargarh", "Rayagada", "Angul", "Dhenkanal", "Kendujhar", "Koraput",
    "Paradip", "Talcher", "Sundargarh", "Bhawanipatna", "Jajpur", "Balangir", "Kendrapara", "Phulbani",
    "Nabarangpur", "Malkangiri", "Gunupur", "Titlagarh", "Nayagarh", "Jagatsinghpur", "Deogarh",
  ],
  "Punjab": [
    "Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Pathankot", "Hoshiarpur",
    "Batala", "Moga", "Abohar", "Malerkotla", "Khanna", "Phagwara", "Muktsar", "Barnala", "Firozpur",
    "Kapurthala", "Rajpura", "Fazilka", "Gurdaspur", "Sangrur", "Zirakpur", "Faridkot", "Nawanshahr",
    "Mansa", "Rupnagar", "Fatehgarh Sahib", "Tarn Taran", "Anandpur Sahib",
  ],
  "Rajasthan": [
    "Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer", "Udaipur", "Bhilwara", "Alwar", "Bharatpur", "Sikar",
    "Pali", "Sri Ganganagar", "Kishangarh", "Beawar", "Hanumangarh", "Dholpur", "Gangapur City", "Sawai Madhopur",
    "Churu", "Jhunjhunu", "Tonk", "Baran", "Barmer", "Chittorgarh", "Jaisalmer", "Nagaur", "Bundi",
    "Jhalawar", "Banswara", "Dungarpur", "Karauli", "Rajsamand", "Sirohi", "Mount Abu", "Pushkar",
    "Bhiwadi", "Neemrana", "Dausa", "Pratapgarh",
  ],
  "Sikkim": [
    "Gangtok", "Namchi", "Gyalshing", "Mangan", "Jorethang", "Rangpo", "Singtam", "Ravangla", "Pakyong",
    "Soreng",
  ],
  "Tamil Nadu": [
    "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Tiruppur", "Erode",
    "Vellore", "Thoothukudi", "Dindigul", "Thanjavur", "Ranipet", "Sivakasi", "Karur", "Udhagamandalam",
    "Hosur", "Nagercoil", "Kanchipuram", "Kumbakonam", "Rajapalayam", "Pudukkottai", "Ambur", "Namakkal",
    "Tiruvannamalai", "Cuddalore", "Kanyakumari", "Krishnagiri", "Dharmapuri", "Virudhunagar", "Nagapattinam",
    "Ariyalur", "Perambalur", "Theni", "Ramanathapuram", "Sivaganga", "Tenkasi", "Tiruvarur", "Pollachi",
    "Mayiladuthurai", "Avadi", "Tambaram", "Kallakurichi", "Villupuram", "Tirupathur", "Chengalpattu",
  ],
  "Telangana": [
    "Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Ramagundam", "Mahabubnagar", "Nalgonda",
    "Adilabad", "Suryapet", "Siddipet", "Miryalaguda", "Jagtial", "Mancherial", "Kothagudem", "Bodhan",
    "Sangareddy", "Medak", "Vikarabad", "Secunderabad", "Kamareddy", "Wanaparthy", "Nagarkurnool",
    "Jangaon", "Bhongir", "Peddapalli", "Sircilla", "Gadwal", "Zaheerabad", "Tandur",
  ],
  "Tripura": [
    "Agartala", "Udaipur", "Dharmanagar", "Kailasahar", "Belonia", "Ambassa", "Khowai", "Teliamura",
    "Sabroom", "Sonamura", "Bishalgarh", "Kumarghat",
  ],
  "Uttar Pradesh": [
    "Lucknow", "Kanpur", "Ghaziabad", "Agra", "Varanasi", "Meerut", "Prayagraj", "Bareilly", "Aligarh",
    "Moradabad", "Saharanpur", "Gorakhpur", "Noida", "Greater Noida", "Firozabad", "Jhansi", "Muzaffarnagar",
    "Mathura", "Vrindavan", "Budaun", "Rampur", "Shahjahanpur", "Farrukhabad", "Ayodhya", "Maunath Bhanjan",
    "Hapur", "Etawah", "Mirzapur", "Bulandshahr", "Sambhal", "Amroha", "Hardoi", "Fatehpur", "Raebareli",
    "Orai", "Sitapur", "Bahraich", "Modinagar", "Unnao", "Jaunpur", "Lakhimpur", "Hathras", "Banda",
    "Pilibhit", "Barabanki", "Mainpuri", "Lalitpur", "Sultanpur", "Azamgarh", "Bijnor", "Ballia", "Deoria",
    "Basti", "Gonda", "Ghazipur", "Chandauli", "Kushinagar", "Mau", "Etah", "Kasganj", "Shamli",
    "Baghpat", "Kannauj", "Auraiya", "Chitrakoot", "Mahoba", "Hamirpur", "Jalaun",
    "Sonbhadra", "Bhadohi", "Siddharthnagar", "Maharajganj", "Sant Kabir Nagar", "Ambedkar Nagar",
    "Amethi", "Balrampur", "Shravasti", "Kaushambi", "Pratapgarh",
  ],
  "Uttarakhand": [
    "Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rudrapur", "Kashipur", "Rishikesh", "Nainital",
    "Mussoorie", "Pithoragarh", "Almora", "Kotdwar", "Srinagar", "Pauri", "Tehri", "Bageshwar", "Champawat",
    "Rudraprayag", "Chamoli", "Uttarkashi", "Jaspur", "Sitarganj", "Kichha", "Ramnagar", "Bhimtal",
  ],
  "West Bengal": [
    "Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri", "Bardhaman", "Malda", "Baharampur", "Habra",
    "Kharagpur", "Shantipur", "Dankuni", "Dhulian", "Ranaghat", "Haldia", "Raiganj", "Krishnanagar",
    "Nabadwip", "Medinipur", "Jalpaiguri", "Balurghat", "Basirhat", "Bankura", "Chandannagar", "Darjeeling",
    "Kalimpong", "Cooch Behar", "Alipurduar", "Purulia", "Bolpur", "Santiniketan", "Barasat", "Barrackpore",
    "Bidhannagar", "Kalyani", "Serampore", "Hooghly", "Tamluk", "Jhargram", "Contai", "Diamond Harbour",
    "Berhampore", "Suri", "Rampurhat", "Kanchrapara", "Uluberia",
  ],

  // ---- Union Territories ----
  "Andaman and Nicobar Islands": [
    "Port Blair", "Diglipur", "Mayabunder", "Rangat", "Car Nicobar", "Campbell Bay", "Hut Bay", "Havelock",
  ],
  "Chandigarh": ["Chandigarh"],
  "Dadra and Nagar Haveli and Daman and Diu": ["Silvassa", "Daman", "Diu", "Amli", "Naroli"],
  "Delhi": [
    "New Delhi", "Central Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi", "North East Delhi",
    "North West Delhi", "South West Delhi", "South East Delhi", "Shahdara", "Dwarka", "Rohini", "Saket",
    "Karol Bagh", "Connaught Place", "Janakpuri", "Lajpat Nagar", "Laxmi Nagar", "Mayur Vihar", "Pitampura",
    "Narela", "Najafgarh", "Mehrauli",
  ],
  "Jammu and Kashmir": [
    "Srinagar", "Jammu", "Anantnag", "Baramulla", "Sopore", "Kathua", "Udhampur", "Budgam", "Pulwama",
    "Kupwara", "Rajouri", "Poonch", "Kulgam", "Bandipora", "Ganderbal", "Doda", "Ramban", "Reasi", "Samba",
    "Shopian", "Kishtwar",
  ],
  "Ladakh": ["Leh", "Kargil", "Nubra", "Diskit", "Zanskar", "Drass", "Khaltsi"],
  "Lakshadweep": ["Kavaratti", "Agatti", "Minicoy", "Amini", "Andrott", "Kalpeni", "Kadmat", "Kiltan"],
  "Puducherry": ["Puducherry", "Karaikal", "Yanam", "Mahe", "Ozhukarai", "Villianur", "Ariyankuppam"],
};

const uniqueSorted = (list) => [...new Set(list)].sort((a, b) => a.localeCompare(b, "en"));

/** All states and union territories, alphabetical. */
export const INDIA_STATES = Object.keys(INDIA_LOCATIONS).sort((a, b) => a.localeCompare(b, "en"));

/** Cities for a state (alphabetical, de-duplicated). Unknown state -> []. */
export function getCitiesForState(state) {
  return uniqueSorted(INDIA_LOCATIONS[state] || []);
}

export default INDIA_LOCATIONS;
